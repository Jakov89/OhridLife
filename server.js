const express = require('express');
const path = require('path');
const fs = require('fs');
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Security and Performance Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://connect.facebook.net"],
            scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers like onclick
            imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
            connectSrc: ["'self'", "https://api.open-meteo.com", "https://connect.facebook.net"],
            frameSrc: ["'self'", "https://www.google.com", "https://maps.google.com"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"]
        }
    }
}));

// Enable compression
app.use(compression());

// Static file serving with better caching and MIME types
app.use(express.static('.', {
    maxAge: '1y', // Cache static assets for 1 year
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        
        // Set proper MIME types
        if (ext === '.js') {
            res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
        } else if (ext === '.css') {
            res.setHeader('Content-Type', 'text/css; charset=UTF-8');
        } else if (ext === '.json') {
            res.setHeader('Content-Type', 'application/json; charset=UTF-8');
        } else if (ext === '.html') {
            res.setHeader('Content-Type', 'text/html; charset=UTF-8');
        }
        
        // Set different cache times for different file types
        if (ext === '.html') {
            res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour for HTML
        } else if (['.js', '.css'].includes(ext)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year for JS/CSS
        } else if (['.jpg', '.jpeg', '.png', '.webp', '.svg', '.ico'].includes(ext)) {
            res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days for images
        }
    }
}));

// API endpoint to get venues
app.get('/api/venues', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache API responses for 1 hour
    
    // Try venues_reorganized.json first, fallback to venues.json
    const venuesReorganizedPath = path.join(__dirname, 'data', 'venues_reorganized.json');
    const venuesPath = path.join(__dirname, 'data', 'venues.json');
    
    fs.readFile(venuesReorganizedPath, 'utf8', (err, data) => {
        if (err) {
            console.warn("venues_reorganized.json not found, trying venues.json:", err.message);
            // Fallback to original venues.json
            fs.readFile(venuesPath, 'utf8', (fallbackErr, fallbackData) => {
                if (fallbackErr) {
                    console.error("Error reading both venue files:", fallbackErr);
                    return res.status(500).json({ error: 'Failed to load venue data.' });
                }
                try {
                    const venues = JSON.parse(fallbackData);
                    res.json(venues);
                } catch (parseErr) {
                    console.error("Error parsing venues.json:", parseErr);
                    return res.status(500).json({ error: 'Failed to parse venue data.' });
                }
            });
        } else {
            try {
                const venues = JSON.parse(data);
                res.json(venues);
            } catch (parseErr) {
                console.error("Error parsing venues_reorganized.json:", parseErr);
                return res.status(500).json({ error: 'Failed to parse venue data.' });
            }
        }
    });
});

// API endpoint to get events
app.get('/api/events', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache API responses for 1 hour
    const eventsPath = path.join(__dirname, 'data', 'events.json');
    fs.readFile(eventsPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading events.json:", err);
            return res.status(500).json({ error: 'Failed to load event data.' });
        }
        try {
            const events = JSON.parse(data);
            res.json(events);
        } catch (parseErr) {
            console.error("Error parsing events.json:", parseErr);
            return res.status(500).json({ error: 'Failed to parse event data.' });
        }
    });
});

// API endpoint to get featured events
app.get('/api/featured-events', (req, res) => {
    const featuredEventsPath = path.join(__dirname, 'data', 'featured_events.json');
    fs.readFile(featuredEventsPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading featured_events.json:", err);
            return res.status(500).json({ error: 'Failed to load featured events data.' });
        }
        res.json(JSON.parse(data));
    });
});

// API endpoint to get organizations
app.get('/api/organizations', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=3600');
    const orgsPath = path.join(__dirname, 'data', 'organizations.json');
    fs.readFile(orgsPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading organizations.json:", err);
            return res.status(500).json({ error: 'Failed to load organization data.' });
        }
        res.json(JSON.parse(data));
    });
});

// API endpoint to get learn ohrid texts
app.get('/api/learn-ohrid-texts', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=7200'); // Cache for 2 hours (text changes less frequently)
    const learnOhridPath = path.join(__dirname, 'data', 'learn_ohrid_text.json');
    fs.readFile(learnOhridPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading learn_ohrid_text.json:", err);
            return res.status(500).json({ error: 'Failed to load learn ohrid text data.' });
        }
        res.json(JSON.parse(data));
    });
});

// Sitemap generation
app.get('/sitemap.xml', async (req, res) => {
    try {
        const links = [
            { url: '/',  changefreq: 'daily', priority: 1.0 },
            { url: '/day-planner',  changefreq: 'weekly', priority: 0.8 },
            { url: '/learn', changefreq: 'monthly', priority: 0.7 },
        ];

        const stream = new SitemapStream({ hostname: 'https://www.ohridhub.com' });

        // Add static pages
        links.forEach(link => stream.write(link));

        // Add dynamic venue pages
        const venuesPath = path.join(__dirname, 'data', 'venues_reorganized.json');
        const venuesData = fs.readFileSync(venuesPath, 'utf8');
        const venues = JSON.parse(venuesData);
        venues.forEach(venue => {
            stream.write({ url: `/venues/${venue.id}`, changefreq: 'weekly', priority: 0.9 });
        });

        // Add dynamic organization pages
        const orgsPath = path.join(__dirname, 'data', 'organizations.json');
        const orgsData = fs.readFileSync(orgsPath, 'utf8');
        const orgs = JSON.parse(orgsData);
        orgs.forEach(org => {
            stream.write({ url: `/organizations/${org.id}`, changefreq: 'daily', priority: 0.9 });
        });

        stream.end();

        const sitemap = await streamToPromise(stream).then((data) => data.toString());
        
        res.header('Content-Type', 'application/xml');
        res.send(sitemap);

    } catch (error) {
        console.error(error);
        res.status(500).end();
    }
});

// Serve learn.html for the /learn-ohrid URL
app.get('/learn-ohrid', (req, res) => {
    res.sendFile(path.join(__dirname, 'learn.html'));
});

// Serve event-detail.html for /events/:id
app.get('/events/:id', (req, res) => {
    const eventId = parseInt(req.params.id, 10);
    
    // Validate event ID
    if (isNaN(eventId) || eventId <= 0) {
        return res.status(400).send('Invalid event ID.');
    }
    
    const eventsPath = path.join(__dirname, 'data', 'events.json');
    const venuesPath = path.join(__dirname, 'data', 'venues.json');
    
    // Read event and venue data
    Promise.all([
        new Promise((resolve, reject) => {
            fs.readFile(eventsPath, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        resolve(JSON.parse(data));
                    } catch (parseErr) {
                        reject(parseErr);
                    }
                }
            });
        }),
        new Promise((resolve, reject) => {
            fs.readFile(venuesPath, 'utf8', (err, data) => {
                if (err) {
                    console.warn('venues.json not found, using empty venues array');
                    resolve([]); // Don't fail completely if venues.json doesn't exist
                } else {
                    try {
                        resolve(JSON.parse(data));
                    } catch (parseErr) {
                        console.warn('Error parsing venues.json, using empty venues array');
                        resolve([]);
                    }
                }
            });
        })
    ]).then(([events, venues]) => {
        const event = events.find(e => e.id === eventId);
        
        if (!event) {
            return res.status(404).send('Event not found.');
        }
        
        const venue = venues.find(v => v.id === event.venueId);
        const templatePath = path.join(__dirname, 'event-detail.html');
        
        fs.readFile(templatePath, 'utf8', (err, htmlData) => {
            if (err) {
                return res.status(500).send('Error loading page template.');
            }
            
            // Prepare event data for SEO
            const title = `${event.eventName} - OhridHub`;
            const description = event.description ? event.description.substring(0, 160) : `Join us for ${event.eventName} in Ohrid.`;
            
            // Use summer logo for events from Summer Comedy Marathon organization (ID 1)
            let imageUrl;
            if (event.organizationId === 1) {
                imageUrl = `https://www.ohridhub.com/logo/summer_logo.jpg`;
            } else {
                imageUrl = `https://www.ohridhub.com/${event.imageUrl || 'images_ohrid/photo1.jpg'}`;
            }
            
            const pageUrl = `https://www.ohridhub.com/events/${event.id}`;
            const venueName = venue ? (venue.name || event.locationName) : event.locationName;
            
            // Create event schema markup
            const eventDate = new Date(event.isoDate);
            const startDateTime = `${event.isoDate}T${event.startTime || '20:00'}:00`;
            
            const schema = {
                "@context": "https://schema.org",
                "@type": "Event",
                "name": event.eventName,
                "description": event.description || `Join us for ${event.eventName} in Ohrid.`,
                "image": imageUrl,
                "startDate": startDateTime,
                "eventStatus": "https://schema.org/EventScheduled",
                "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                "location": {
                    "@type": "Place",
                    "name": venueName,
                    "address": venue?.location?.address || "Ohrid, North Macedonia"
                },
                "organizer": {
                    "@type": "Organization",
                    "name": "OhridHub",
                    "url": "https://www.ohridhub.com"
                },
                "offers": {
                    "@type": "Offer",
                    "price": event.ticketPrice === "Free entry" || event.ticketPrice === "Free Entry" ? "0" : "TBA",
                    "priceCurrency": "MKD",
                    "availability": "https://schema.org/InStock"
                }
            };
            
            // Replace meta tags and inject schema
            let finalHtml = htmlData
                .replace(/<title>.*<\/title>/, `<title>${title}</title>`)
                .replace(/<meta name="description" content=".*">/, `<meta name="description" content="${description}">`)
                .replace(/<meta property="og:url" content=".*">/, `<meta property="og:url" content="${pageUrl}">`)
                .replace(/<meta property="og:title" content=".*">/, `<meta property="og:title" content="${title}">`)
                .replace(/<meta property="og:description" content=".*">/, `<meta property="og:description" content="${description}">`)
                .replace(/<meta property="og:image" content=".*">/, `<meta property="og:image" content="${imageUrl}">`)
                .replace(/<meta name="twitter:url" content=".*">/, `<meta name="twitter:url" content="${pageUrl}">`)
                .replace(/<meta name="twitter:title" content=".*">/, `<meta name="twitter:title" content="${title}">`)
                .replace(/<meta name="twitter:description" content=".*">/, `<meta name="twitter:description" content="${description}">`)
                .replace(/<meta name="twitter:image" content=".*">/, `<meta name="twitter:image" content="${imageUrl}">`);
            
            // Inject schema markup
            const schemaScript = `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
            finalHtml = finalHtml.replace('</head>', `${schemaScript}</head>`);
            
            res.send(finalHtml);
        });
    }).catch(err => {
        console.error('Error loading event data:', err);
        res.status(500).send('Error loading event data.');
    });
});

// API endpoint to get a single event by ID
app.get('/api/events/:id', (req, res) => {
    const eventId = parseInt(req.params.id, 10);
    
    // Validate event ID
    if (isNaN(eventId) || eventId <= 0) {
        return res.status(400).json({ error: 'Invalid event ID.' });
    }
    
    const eventsPath = path.join(__dirname, 'data', 'events.json');

    fs.readFile(eventsPath, 'utf8', (err, eventsData) => {
        if (err) {
            console.error('Error reading events.json for individual event:', err);
            return res.status(500).json({ error: 'Failed to load event data.' });
        }
        
        try {
            const allEvents = JSON.parse(eventsData);
            const event = allEvents.find(e => e.id === eventId);

            if (event) {
                // Set cache headers for individual events
                res.setHeader('Cache-Control', 'public, max-age=1800'); // 30 minutes
                return res.json(event);
            } else {
                return res.status(404).json({ error: 'Event not found.' });
            }
        } catch (parseErr) {
            console.error('Error parsing events.json for individual event:', parseErr);
            return res.status(500).json({ error: 'Failed to parse event data.' });
        }
    });
});

// API endpoint to get events for a specific organization
app.get('/api/organizations/:id/events', (req, res) => {
    const organizationId = parseInt(req.params.id, 10);
    const eventsPath = path.join(__dirname, 'data', 'events.json');

    fs.readFile(eventsPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading events.json:", err);
            return res.status(500).json({ error: 'Failed to load event data.' });
        }
        const allEvents = JSON.parse(data);
        const orgEvents = allEvents.filter(e => e.organizationId === organizationId);
        res.json(orgEvents);
    });
});

// API endpoint to get a single organization by ID
app.get('/api/organizations/:id', (req, res) => {
    const orgId = parseInt(req.params.id, 10);
    const orgsPath = path.join(__dirname, 'data', 'organizations.json');

    fs.readFile(orgsPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading organizations.json:", err);
            return res.status(500).json({ error: 'Failed to load organization data.' });
        }
        
        const organizations = JSON.parse(data);
        const organization = organizations.find(o => o.id === orgId);

        if (organization) {
            res.json(organization);
        } else {
            res.status(404).json({ error: 'Organization not found.' });
        }
    });
});

// Serve day-planner.html for the /day-planner URL
app.get('/day-planner', (req, res) => {
    res.sendFile(path.join(__dirname, 'day-planner.html'));
});

// Serve organization.html for /organizations/:id
app.get('/organizations/:id', (req, res) => {
    const orgId = parseInt(req.params.id, 10);
    const orgsPath = path.join(__dirname, 'data', 'organizations.json');
    const templatePath = path.join(__dirname, 'organization.html');

    fs.readFile(orgsPath, 'utf8', (err, orgsData) => {
        if (err) {
            return res.status(500).send('Error loading organization data.');
        }
        
        const organizations = JSON.parse(orgsData);
        const org = organizations.find(o => o.id === orgId);

        if (!org) {
            return res.status(404).send('Organization not found.');
        }

        fs.readFile(templatePath, 'utf8', (err, htmlData) => {
            if (err) {
                return res.status(500).send('Error loading page template.');
            }

            const name = org.name?.en || org.title || 'Organization Details';
            const description = (org.description?.en || org.description || 'Discover this organization in Ohrid.').substring(0, 160);
            const pageUrl = `https://www.ohridhub.com/organizations/${org.id}`;
            
            // Use summer logo for Summer Comedy Marathon organization (ID 1)
            let imageUrl;
            if (org.id === 1) {
                imageUrl = `https://www.ohridhub.com/logo/summer_logo.jpg`;
            } else {
                imageUrl = `https://www.ohridhub.com/${org.imageUrl || 'images_ohrid/photo4.jpg'}`;
            }

            const schema = {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": name,
                "description": description,
                "image": imageUrl,
                "url": pageUrl
            };

            let finalHtml = htmlData
                .replace(/<title>.*<\/title>/, `<title>${name} - OhridHub</title>`)
                .replace(/<meta name="description" content=".*">/, `<meta name="description" content="${description}">`)
                .replace(/<meta property="og:url" content=".*">/, `<meta property="og:url" content="${pageUrl}">`)
                .replace(/<meta property="og:title" content=".*">/, `<meta property="og:title" content="${name}">`)
                .replace(/<meta property="og:description" content=".*">/, `<meta property="og:description" content="${description}">`)
                .replace(/<meta property="og:image" content=".*">/, `<meta property="og:image" content="${imageUrl}">`)
                .replace(/<meta name="twitter:url" content=".*">/, `<meta name="twitter:url" content="${pageUrl}">`)
                .replace(/<meta name="twitter:title" content=".*">/, `<meta name="twitter:title" content="${name}">`)
                .replace(/<meta name="twitter:description" content=".*">/, `<meta name="twitter:description" content="${description}">`)
                .replace(/<meta name="twitter:image" content=".*">/, `<meta name="twitter:image" content="${imageUrl}">`);
            
            const script = `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
            finalHtml = finalHtml.replace('</head>', `${script}</head>`);

            res.send(finalHtml);
        });
    });
});

// API endpoint to update venue rating
app.post('/api/venues/:id/rate', express.json(), (req, res) => {
    const venueId = parseInt(req.params.id, 10);
    const newRating = req.body.rating;

    if (!newRating || newRating < 1 || newRating > 5) {
        return res.status(400).json({ error: 'Invalid rating. Must be between 1 and 5.' });
    }

    const venuesPath = path.join(__dirname, 'data', 'venues.json');
    fs.readFile(venuesPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading venues.json:", err);
            return res.status(500).json({ error: 'Failed to load venue data.' });
        }

        let venues = JSON.parse(data);
        const venueIndex = venues.findIndex(v => v.id === venueId);

        if (venueIndex === -1) {
            return res.status(404).json({ error: 'Venue not found.' });
        }

        const venue = venues[venueIndex];
        const currentTotalRating = (venue.rating || 0) * (venue.ratingCount || 0);
        const newRatingCount = (venue.ratingCount || 0) + 1;
        const newAverageRating = (currentTotalRating + newRating) / newRatingCount;

        venues[venueIndex].rating = parseFloat(newAverageRating.toFixed(2));
        venues[venueIndex].ratingCount = newRatingCount;

        fs.writeFile(venuesPath, JSON.stringify(venues, null, 2), (err) => {
            if (err) {
                console.error("Error writing to venues.json:", err);
                return res.status(500).json({ error: 'Failed to save new rating.' });
            }
            res.json(venues[venueIndex]);
        });
    });
});

// Serve index.html for the root URL to verify
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all to serve index.html for any other request
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to get a single venue by ID
app.get('/api/venues/:id', (req, res) => {
    const venueId = parseInt(req.params.id, 10);
    const venuesPath = path.join(__dirname, 'data', 'venues.json');
    fs.readFile(venuesPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to load venue data.' });
        }
        const venues = JSON.parse(data);
        const venue = venues.find(v => v.id === venueId);
        if (venue) {
            res.json(venue);
        } else {
            res.status(404).json({ error: 'Venue not found.' });
        }
    });
});

// Serve venue-detail.html for /venues/:id
app.get('/venues/:id', (req, res) => {
    const venueId = parseInt(req.params.id, 10);
    const venuesPath = path.join(__dirname, 'data', 'venues.json');
    
    // First, read the venue data to get the details
    fs.readFile(venuesPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error loading venue data.');
        }
        
        const venues = JSON.parse(data);
        const venue = venues.find(v => v.id === venueId);

        if (!venue) {
            return res.status(404).sendFile(path.join(__dirname, '404.html')); // Or a custom 404 page
        }

        // Now, read the HTML template
        const templatePath = path.join(__dirname, 'venue-detail.html');
        fs.readFile(templatePath, 'utf8', (err, htmlData) => {
            if (err) {
                return res.status(500).send('Error loading page template.');
            }

            // Replace placeholders with actual venue data for SEO
            const title = `${venue.name.en || 'Venue'} - OhridHub`;
            const description = venue.description.en ? venue.description.en.substring(0, 160) : `Discover ${venue.name.en} in Ohrid.`;
            const imageUrl = `https://www.ohridhub.com/${venue.imageUrl || 'images_ohrid/photo1.jpg'}`;
            const pageUrl = `https://www.ohridhub.com/venues/${venue.id}`;

            const schema = {
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                "name": venue.name.en,
                "description": (venue.description.en || '').substring(0, 5000),
                "image": imageUrl,
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": venue.location.address,
                    "addressLocality": "Ohrid",
                    "addressCountry": "MK"
                },
                "telephone": venue.phone,
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": venue.rating || "5",
                    "reviewCount": venue.ratingCount || "1"
                }
            };

            let finalHtml = htmlData
                .replace(
                    '<title>Venue Details - OhridHub</title>',
                    `<title>${title}</title>`
                )
                .replace(
                    '<meta name="description" content="Discover details about venues in Ohrid.">',
                    `<meta name="description" content="${description}">`
                )
                .replace(
                    '<link rel="canonical" href="https://www.ohridhub.com" />',
                    `<link rel="canonical" href="${pageUrl}" />`
                )
                .replace(
                    '<meta property="og:title" content="Venue Details - OhridHub">',
                    `<meta property="og:title" content="${title}">`
                )
                .replace(
                    '<meta property="og:description" content="Discover details about venues in Ohrid.">',
                    `<meta property="og:description" content="${description}">`
                )
                .replace(
                    '<meta property="og:image" content="https://www.ohridhub.com/images_ohrid/photo1.jpg">',
                    `<meta property="og:image" content="${imageUrl}">`
                )
                .replace(
                    '<meta property="og:url" content="https://www.ohridhub.com/">',
                    `<meta property="og:url" content="${pageUrl}">`
                )
                .replace(
                    '<meta name="twitter:title" content="Venue Details - OhridHub">',
                    `<meta name="twitter:title" content="${title}">`
                )
                .replace(
                    '<meta name="twitter:description" content="Discover details about venues in Ohrid.">',
                    `<meta name="twitter:description" content="${description}">`
                )
                .replace(
                    '<meta name="twitter:image" content="https://www.ohridhub.com/images_ohrid/photo1.jpg">',
                    `<meta name="twitter:image" content="${imageUrl}">`
                )
                .replace(
                    '<meta name="twitter:url" content="https://www.ohridhub.com/">',
                    `<meta name="twitter:url" content="${pageUrl}">`
                );

            // Inject Schema.org
            const script = `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
            finalHtml = finalHtml.replace('</head>', `${script}</head>`);

            res.send(finalHtml);
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 
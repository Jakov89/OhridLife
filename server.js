const express = require('express');
const path = require('path');
const fs = require('fs');
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// API endpoint to get venues
app.get('/api/venues', (req, res) => {
    const venuesPath = path.join(__dirname, 'data', 'venues.json');
    fs.readFile(venuesPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading venues.json:", err);
            return res.status(500).json({ error: 'Failed to load venue data.' });
        }
        res.json(JSON.parse(data));
    });
});

// API endpoint to get events
app.get('/api/events', (req, res) => {
    const eventsPath = path.join(__dirname, 'data', 'events.json');
    fs.readFile(eventsPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading events.json:", err);
            return res.status(500).json({ error: 'Failed to load event data.' });
        }
        res.json(JSON.parse(data));
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
        const venuesPath = path.join(__dirname, 'data', 'venues.json');
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

// API endpoint to get a single event by ID
app.get('/api/events/:id', (req, res) => {
    const eventId = parseInt(req.params.id, 10);
    const eventsPath = path.join(__dirname, 'data', 'events.json');

    fs.readFile(eventsPath, 'utf8', (err, eventsData) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to load event data.' });
        }
        
        const allEvents = JSON.parse(eventsData);
        let event = allEvents.find(e => e.id === eventId);

        if (event) {
            return res.json(event);
        } else {
            return res.status(404).json({ error: 'Event not found.' });
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
            const imageUrl = `https://www.ohridhub.com/${org.imageUrl || 'images_ohrid/photo4.jpg'}`;

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
                .replace(/<meta property="twitter:url" content=".*">/, `<meta property="twitter:url" content="${pageUrl}">`)
                .replace(/<meta property="twitter:title" content=".*">/, `<meta property="twitter:title" content="${name}">`)
                .replace(/<meta property="twitter:description" content=".*">/, `<meta property="twitter:description" content="${description}">`)
                .replace(/<meta property="twitter:image" content=".*">/, `<meta property="twitter:image" content="${imageUrl}">`);
            
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

// Serve index.html for the root URL
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
                    '<meta property="twitter:title" content="Venue Details - OhridHub">',
                    `<meta property="twitter:title" content="${title}">`
                )
                .replace(
                    '<meta property="twitter:description" content="Discover details about venues in Ohrid.">',
                    `<meta property="twitter:description" content="${description}">`
                )
                .replace(
                    '<meta property="twitter:image" content="https://www.ohridhub.com/images_ohrid/photo1.jpg">',
                    `<meta property="twitter:image" content="${imageUrl}">`
                )
                .replace(
                    '<meta property="twitter:url" content="https://www.ohridhub.com/">',
                    `<meta property="twitter:url" content="${pageUrl}">`
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
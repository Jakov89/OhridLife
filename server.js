const express = require('express');
const path = require('path');
const fs = require('fs');
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const sharp = require('sharp');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Cache for optimized images
const imageCache = new Map();

// Function to optimize image
async function optimizeImage(imagePath, width) {
    const cacheKey = `${imagePath}-${width}`;
    
    if (imageCache.has(cacheKey)) {
        return imageCache.get(cacheKey);
    }

    try {
        const imageBuffer = await sharp(imagePath)
            .resize(width, null, {
                withoutEnlargement: true,
                fit: 'inside'
            })
            .jpeg({ quality: 85, progressive: true })
            .toBuffer();

        imageCache.set(cacheKey, imageBuffer);
        return imageBuffer;
    } catch (error) {
        console.error('Image optimization error:', error);
        throw error;
    }
}

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration for API endpoints
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // List of allowed origins
        const allowedOrigins = [
            'http://localhost:3000',     // Local development
            'http://localhost:19000',    // React Native development
            'http://localhost:19001',    // React Native development
            'http://localhost:19002',    // React Native development
            'exp://',                    // Expo development
            'exp://localhost:19000',     // Expo local
            'exp://localhost:19001',     // Expo local
            'exp://localhost:19002',     // Expo local
            'exp://192.168.*',           // Expo on local network
            'https://exp.host',          // Expo production
            'https://*.exp.host',        // Expo production subdomains
            'https://*.expo.io',         // Expo production
            'https://*.expo.dev',        // Expo production
            'https://www.ohridhub.mk'    // Production website
        ];
        
        // Check if the origin is allowed
        if (allowedOrigins.some(allowedOrigin => origin.startsWith(allowedOrigin))) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
};

// Security and Performance Middleware with relaxed settings for API routes
app.use('/api', cors(corsOptions));
app.use('/api', (req, res, next) => {
    // Disable CSP for API routes
    helmet({
        contentSecurityPolicy: false,
    })(req, res, next);
});

// Regular security settings for non-API routes
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://connect.facebook.net", "https://www.googletagmanager.com"],
            scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers like onclick
            imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
            connectSrc: [
                "'self'", 
                "https://api.open-meteo.com", 
                "https://connect.facebook.net",
                "https://www.googletagmanager.com",
                "https://www.google-analytics.com",
                "https://fonts.googleapis.com",
                "https://fonts.gstatic.com",
                "https://cdn.jsdelivr.net",
                "https://formspree.io",
                "https://*.formspree.io",
                // Allow React Native app origins
                "http://localhost:19000",
                "http://localhost:19001",
                "http://localhost:19002",
                "exp://"
            ],
            frameSrc: ["'self'", "https://www.google.com", "https://maps.google.com"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'", "https://formspree.io", "https://*.formspree.io"]
        }
    }
}));

// Enable compression
app.use(compression());

// Parse JSON requests for API endpoints
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Optimized image route
app.get('/optimized-image/*', async (req, res) => {
    try {
        const imagePath = req.params[0];
        const width = parseInt(req.query.width) || 1200; // Default width if not specified
        
        if (!imagePath) {
            return res.status(400).send('Image path is required');
        }

        const fullPath = path.join(__dirname, imagePath);
        
        // Check if file exists
        if (!fs.existsSync(fullPath)) {
            return res.status(404).send('Image not found');
        }

        // Get file extension
        const ext = path.extname(fullPath).toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
        
        if (!allowedExtensions.includes(ext)) {
            return res.status(400).send('Invalid image format');
        }

        const optimizedImage = await optimizeImage(fullPath, width);
        
        // Set cache headers
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(optimizedImage);

    } catch (error) {
        console.error('Error optimizing image:', error);
        res.status(500).send('Error processing image');
    }
});

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

// Venue shuffling cache
let shuffledVenuesCache = null;
let lastShuffleTime = 0;
const SHUFFLE_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

// Venue category mapping for shuffling
const venueCategoryMap = {
    'Popular': ['restaurant', 'club', 'beach', 'coffee', 'pub'],
    'Food & Drink': ['restaurant', 'coffee', 'pub', 'fast-food', 'to-go', 'shisha'],
    'Rural Tourism': ['rural tourism'],
    'Nightlife': ['club', 'pub'],
    'Beach': ['beach'],
    'Adventure & Sport': ['kayaking', 'sup', 'diving', 'cruises', 'hiking', 'atv', 'sports', 'camping', 'gym', 'fitness', 'paragliding', 'golf', 'go-kart'],
    'Culture': ['art'],
    'Entertainment & Gaming': ['gaming-house', 'vr-gaming', 'board-games','darts','billiards'],
    'Health & Wellness': ['hospital', 'pharmacy', 'dentist', 'spa'],
    'Rentals & Services': ['rent-a-car', 'rent-a-bike', 'rent-a-scooter', 'towing-services', 'detailing'],
    'Shopping': ['souvenir', 'boutique'],
    'Jewelry': ['jewelry'],
    'Market': ['market'],
    'Pet Care': ['vet', 'pet-shop', 'grooming'],
    'Kids & Family': ['kindergarten', 'playhouse', 'playground', 'education']
};

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Get venue category based on type
function getVenueCategory(venue) {
    const venueType = venue.type?.en || venue.type;
    const venueTypes = Array.isArray(venueType) ? venueType : [venueType].filter(Boolean);
    
    // Check if venue has 'popular' tag
    if (venue.tags?.includes('popular')) {
        return 'Popular';
    }
    
    // Find matching category
    for (const [category, types] of Object.entries(venueCategoryMap)) {
        if (venueTypes.some(type => types.includes(type?.toLowerCase()))) {
            return category;
        }
    }
    
    return 'Food & Drink'; // Default category
}

// Shuffle venues within their categories
function shuffleVenuesByCategory(venues) {
    const categorizedVenues = {};
    
    // Group venues by category
    venues.forEach(venue => {
        const category = getVenueCategory(venue);
        if (!categorizedVenues[category]) {
            categorizedVenues[category] = [];
        }
        categorizedVenues[category].push(venue);
    });
    
    // Shuffle within each category
    Object.keys(categorizedVenues).forEach(category => {
        categorizedVenues[category] = shuffleArray(categorizedVenues[category]);
    });
    
    // Reconstruct the venues array maintaining category grouping
    const shuffledVenues = [];
    const categoryOrder = ['Popular', 'Food & Drink', 'Nightlife', 'Beach', 'Adventure & Sport', 'Culture', 'Entertainment & Gaming', 'Health & Wellness', 'Rentals & Services', 'Shopping', 'Pet Care', 'Rural Tourism'];
    
    categoryOrder.forEach(category => {
        if (categorizedVenues[category]) {
            shuffledVenues.push(...categorizedVenues[category]);
        }
    });
    
    // Add any remaining venues that didn't fit into predefined categories
    Object.keys(categorizedVenues).forEach(category => {
        if (!categoryOrder.includes(category)) {
            shuffledVenues.push(...categorizedVenues[category]);
        }
    });
    
    return shuffledVenues;
}

// Check if venues need reshuffling
function shouldReshuffle() {
    const now = Date.now();
    return !shuffledVenuesCache || (now - lastShuffleTime) >= SHUFFLE_INTERVAL;
}

// API endpoint to get venues
app.get('/api/venues', (req, res) => {
    // Set cache headers with shorter duration for dynamic content
    res.setHeader('Cache-Control', 'public, max-age=1800'); // 30 minutes cache
    
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
                    handleVenueResponse(venues, res);
                } catch (parseErr) {
                    console.error("Error parsing venues.json:", parseErr);
                    return res.status(500).json({ error: 'Failed to parse venue data.' });
                }
            });
        } else {
            try {
                const venues = JSON.parse(data);
                handleVenueResponse(venues, res);
            } catch (parseErr) {
                console.error("Error parsing venues_reorganized.json:", parseErr);
                return res.status(500).json({ error: 'Failed to parse venue data.' });
            }
        }
    });
});

// Handle venue response with shuffling logic
function handleVenueResponse(venues, res) {
    if (shouldReshuffle()) {
        console.log('Reshuffling venues within categories...');
        shuffledVenuesCache = shuffleVenuesByCategory(venues);
        lastShuffleTime = Date.now();
        
        // Log shuffle statistics
        const categoryStats = {};
        shuffledVenuesCache.forEach(venue => {
            const category = getVenueCategory(venue);
            categoryStats[category] = (categoryStats[category] || 0) + 1;
        });
        console.log('Venues shuffled by category:', categoryStats);
    }
    
    res.json(shuffledVenuesCache || venues);
}

// API endpoint to manually trigger venue reshuffling (for testing)
app.post('/api/venues/reshuffle', (req, res) => {
    console.log('Manual venue reshuffle triggered');
    shuffledVenuesCache = null; // Clear cache to force reshuffle
    lastShuffleTime = 0;
    res.json({ message: 'Venue reshuffle triggered successfully' });
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

// API endpoint to get artists
app.get('/api/artists', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache API responses for 1 hour
    const artistsPath = path.join(__dirname, 'data', 'artists.json');
    fs.readFile(artistsPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading artists.json:", err);
            return res.status(500).json({ error: 'Failed to load artists data.' });
        }
        try {
            const artists = JSON.parse(data);
            res.json(artists);
        } catch (parseErr) {
            console.error("Error parsing artists.json:", parseErr);
            return res.status(500).json({ error: 'Failed to parse artists data.' });
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

// API endpoint to get churches
app.get('/api/churches', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=7200'); // Cache for 2 hours (churches data changes rarely)
    const churchesPath = path.join(__dirname, 'data', 'churches.json');
    fs.readFile(churchesPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading churches.json:", err);
            return res.status(500).json({ error: 'Failed to load churches data.' });
        }
        try {
            const churchesData = JSON.parse(data);
            res.json(churchesData.churches || churchesData);
        } catch (parseErr) {
            console.error("Error parsing churches.json:", parseErr);
            return res.status(500).json({ error: 'Failed to parse churches data.' });
        }
    });
});

// API endpoint for historical day facts
app.get('/api/historical-day', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Content-Type', 'application/json');
    
    const historicalFactsPath = path.join(__dirname, 'data', 'historical_facts.json');
    
    fs.readFile(historicalFactsPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading historical_facts.json:", err);
            return res.status(500).json({ error: 'Failed to load historical facts data.' });
        }
        
        try {
            const historicalData = JSON.parse(data);
            const { date, limit } = req.query;
            
            // Transform facts to the required API format
            const transformedFacts = historicalData.facts.map((fact, index) => {
                // Generate a consistent date for each fact based on its ID
                const baseDate = new Date('2025-01-01');
                const dayOffset = (fact.id - 1) % 365; // Cycle through the year
                const factDate = new Date(baseDate);
                factDate.setDate(baseDate.getDate() + dayOffset);
                
                return {
                    id: fact.id,
                    date: factDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
                    title: `${fact.period}: ${fact.category.charAt(0).toUpperCase() + fact.category.slice(1)} Heritage`,
                    description: fact.fact,
                    image: `https://ohridhub.mk/uploads/historical/fact_${fact.id}.jpg`
                };
            });
            
            // Sort facts by date (most recent first)
            transformedFacts.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            let result = transformedFacts;
            
            // Handle date query parameter
            if (date) {
                const requestedDate = new Date(date);
                if (isNaN(requestedDate.getTime())) {
                    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
                }
                
                const dateStr = requestedDate.toISOString().split('T')[0];
                result = transformedFacts.filter(fact => fact.date === dateStr);
                
                if (result.length === 0) {
                    return res.status(404).json({ error: 'No historical fact found for the specified date.' });
                }
            }
            // Handle limit query parameter
            else if (limit) {
                const limitNum = parseInt(limit, 10);
                if (isNaN(limitNum) || limitNum <= 0) {
                    return res.status(400).json({ error: 'Invalid limit. Must be a positive number.' });
                }
                result = transformedFacts.slice(0, limitNum);
            }
            // Default: return today's fact
            else {
                const today = new Date();
                const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
                const todayFactIndex = (dayOfYear - 1) % transformedFacts.length;
                result = [transformedFacts[todayFactIndex]];
            }
            
            res.json(result);
            
        } catch (parseErr) {
            console.error("Error parsing historical_facts.json:", parseErr);
            return res.status(500).json({ error: 'Failed to parse historical facts data.' });
        }
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

        const stream = new SitemapStream({ hostname: 'https://www.ohridhub.mk' });

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
            
            // Use event-specific image or default
            let imageUrl = `https://www.ohridhub.mk/${event.imageUrl || 'images_ohrid/photo7.jpg'}`;
            
            const pageUrl = `https://www.ohridhub.mk/events/${event.id}`;
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
                    "url": "https://www.ohridhub.mk"
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

// API endpoint to get a single church by ID
app.get('/api/churches/:id', (req, res) => {
    const churchId = parseInt(req.params.id, 10);
    
    // Validate church ID
    if (isNaN(churchId) || churchId <= 0) {
        return res.status(400).json({ error: 'Invalid church ID.' });
    }
    
    const churchesPath = path.join(__dirname, 'data', 'churches.json');

    fs.readFile(churchesPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading churches.json:", err);
            return res.status(500).json({ error: 'Failed to load churches data.' });
        }
        
        try {
            const churchesData = JSON.parse(data);
            const churches = churchesData.churches || churchesData;
            const church = churches.find(c => c.id === churchId);

            if (church) {
                // Set cache headers for individual churches
                res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
                res.json(church);
            } else {
                res.status(404).json({ error: 'Church not found.' });
            }
        } catch (parseErr) {
            console.error("Error parsing churches.json:", parseErr);
            return res.status(500).json({ error: 'Failed to parse churches data.' });
        }
    });
});

// Serve day-planner.html for the /day-planner URL
app.get('/day-planner', (req, res) => {
    res.sendFile(path.join(__dirname, 'day-planner.html'));
});

// Serve artists.html for the /artists URL
app.get('/artists', (req, res) => {
    res.sendFile(path.join(__dirname, 'artists.html'));
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
            const pageUrl = `https://www.ohridhub.mk/organizations/${org.id}`;
            
            // Use summer logo for Summer Comedy Marathon organization (ID 1)
            let imageUrl;
            if (org.id === 1) {
                imageUrl = `https://www.ohridhub.mk/logo/summer_logo.jpg`;
            } else {
                imageUrl = `https://www.ohridhub.mk/${org.imageUrl || 'images_ohrid/photo8.jpg'}`;
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

// API endpoint to get a single venue by ID
app.get('/api/venues/:id', (req, res) => {
    // Set content type to JSON
    res.setHeader('Content-Type', 'application/json');
    
    const venueId = parseInt(req.params.id, 10);
    
    // Try venues_reorganized.json first, fallback to venues.json
    const venuesReorganizedPath = path.join(__dirname, 'data', 'venues_reorganized.json');
    const venuesPath = path.join(__dirname, 'data', 'venues.json');
    
    fs.readFile(venuesReorganizedPath, 'utf8', (err, data) => {
        if (err) {
            console.warn("venues_reorganized.json not found for individual venue, trying venues.json:", err.message);
            // Fallback to original venues.json
            fs.readFile(venuesPath, 'utf8', (fallbackErr, fallbackData) => {
                if (fallbackErr) {
                    return res.status(500).json({ error: 'Failed to load venue data.' });
                }
                const venues = JSON.parse(fallbackData);
                const venue = venues.find(v => v.id === venueId);
                if (venue) {
                    res.json(venue);
                } else {
                    res.status(404).json({ error: 'Venue not found.' });
                }
            });
        } else {
            const venues = JSON.parse(data);
            const venue = venues.find(v => v.id === venueId);
            if (venue) {
                res.json(venue);
            } else {
                res.status(404).json({ error: 'Venue not found.' });
            }
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
            const imageUrl = `https://www.ohridhub.mk/${venue.imageUrl || 'images_ohrid/photo1.jpg'}`;
            const pageUrl = `https://www.ohridhub.mk/venues/${venue.id}`;

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
                    '<link rel="canonical" href="https://www.ohridhub.mk" />',
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
                    '<meta property="og:image" content="https://www.ohridhub.mk/images_ohrid/photo1.jpg">',
                    `<meta property="og:image" content="${imageUrl}">`
                )
                .replace(
                    '<meta property="og:url" content="https://www.ohridhub.mk/">',
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
                    '<meta name="twitter:image" content="https://www.ohridhub.mk/images_ohrid/photo1.jpg">',
                    `<meta name="twitter:image" content="${imageUrl}">`
                )
                .replace(
                    '<meta name="twitter:url" content="https://www.ohridhub.mk/">',
                    `<meta name="twitter:url" content="${pageUrl}">`
                );

            // Inject Schema.org
            const script = `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
            finalHtml = finalHtml.replace('</head>', `${script}</head>`);

            res.send(finalHtml);
        });
    });
});

// Contact Form API Endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message, to, timestamp } = req.body;
        
        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({ 
                success: false, 
                error: 'Name, email, and message are required' 
            });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid email address' 
            });
        }
        
        // Create email content
        const emailContent = {
            from: email,
            to: to || 'contact@ohridhub.mk',
            subject: `OhridHub Contact: ${subject || 'New Message'}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                        New Contact Form Submission
                    </h2>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
                        <p><strong>Date:</strong> ${new Date(timestamp).toLocaleString()}</p>
                    </div>
                    
                    <div style="background: white; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
                        <h3 style="color: #333; margin-top: 0;">Message:</h3>
                        <p style="line-height: 1.6; color: #555;">${message}</p>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background: #e9ecef; border-radius: 8px; font-size: 12px; color: #666;">
                        <p>This message was sent via the OhridHub contact form.</p>
                        <p>Reply directly to this email to respond to ${name}.</p>
                    </div>
                </div>
            `,
            text: `
                New Contact Form Submission from OhridHub
                
                Name: ${name}
                Email: ${email}
                Subject: ${subject || 'General Inquiry'}
                Date: ${new Date(timestamp).toLocaleString()}
                
                Message:
                ${message}
                
                Reply to: ${email}
            `
        };
        
        // Log the email content for debugging
        console.log('📧 Contact Form Submission:');
        console.log('From:', email);
        console.log('Name:', name);
        console.log('Subject:', subject);
        console.log('Message:', message);
        console.log('Timestamp:', timestamp);
        
        // Send email if configured
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                const transporter = nodemailer.createTransporter({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });
                
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: process.env.EMAIL_TO || 'contact@ohridhub.mk',
                    subject: emailContent.subject,
                    html: emailContent.html,
                    replyTo: email
                });
                
                console.log('✅ Email sent successfully');
            } catch (emailError) {
                console.error('❌ Email sending failed:', emailError.message);
                // Don't fail the request if email fails - still log the submission
            }
        } else {
            console.log('⚠️  Email not configured - submission logged only');
        }
        
        // Store submission (optional - you could save to database)
        const submission = {
            id: Date.now(),
            name,
            email,
            subject,
            message,
            timestamp: timestamp || new Date().toISOString(),
            ip: req.ip,
            userAgent: req.get('User-Agent')
        };
        
        // For now, just return success
        res.json({ 
            success: true, 
            message: 'Contact form submitted successfully',
            submissionId: submission.id
        });
        
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Handle service worker requests - return empty service worker that unregisters itself
app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(`
// Service worker cleanup - unregisters itself
self.addEventListener('install', function() {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        self.registration.unregister()
            .then(function() {
                console.log('Service worker unregistered successfully');
                return caches.keys().then(function(cacheNames) {
                    return Promise.all(
                        cacheNames.map(function(cacheName) {
                            return caches.delete(cacheName);
                        })
                    );
                });
            })
    );
});
`);
});

// Catch-all route for non-API requests (MUST be last!)
app.get('*', (req, res, next) => {
    // Don't handle API routes here
    if (req.path.startsWith('/api/')) {
        return next();
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Image optimization endpoint with flexible path handling
app.get('/api/image-optimize/*', async (req, res) => {
    try {
        const imagePath = req.params[0]; // Get the full path after /api/image-optimize/
        const width = parseInt(req.query.w) || 400;
        const quality = parseInt(req.query.q) || 75;
        
        const fullImagePath = path.join(__dirname, imagePath);
        
        // Check if file exists
        if (!fs.existsSync(fullImagePath)) {
            // If optimization fails, serve original image
            return res.sendFile(fullImagePath, (err) => {
                if (err) {
                    res.status(404).send('Image not found');
                }
            });
        }
        
        // Check if it's a supported image format
        const ext = path.extname(fullImagePath).toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
            // Serve original file if not a supported image format
            return res.sendFile(fullImagePath);
        }
        
        // Set cache headers for optimized images
        res.set({
            'Cache-Control': 'public, max-age=31536000', // 1 year
            'Content-Type': 'image/jpeg'
        });
        
        const optimizedBuffer = await optimizeImage(fullImagePath, width);
        res.send(optimizedBuffer);
        
    } catch (error) {
        console.error('Image optimization error:', error);
        // Fallback to original image if optimization fails
        const imagePath = req.params[0];
        const fullImagePath = path.join(__dirname, imagePath);
        res.sendFile(fullImagePath, (err) => {
            if (err) {
                res.status(500).send('Image optimization failed and original not found');
            }
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`🚀 Performance optimizations enabled:`);
    console.log(`   - Gzip compression: ✅`);
    console.log(`   - Image optimization: ✅`);
    console.log(`   - Static file caching: ✅`);
    console.log(`   - Lazy loading: ✅`);
}); 
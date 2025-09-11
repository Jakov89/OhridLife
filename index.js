// --- GLOBAL VARIABLES ---
let venuesData = [];
let eventsListData = [];
let featuredEventsData = [];
let learnOhridTexts = {};
let venueRatings = {}; // Holds all user-submitted ratings
let historicalFacts = [];
let churchesData = [];
let currentFactIndex = 0;

// Image optimization helper function
function getOptimizedImageUrl(imageUrl, width = 400, quality = 75) {
    // If it's already an external URL or data URL, return as is
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) {
        return imageUrl;
    }
    
    // Use the full path for the optimization endpoint
    return `/api/image-optimize/${imageUrl}?w=${width}&q=${quality}`;
}

// --- LAZY LOADING OBSERVER ---
let lazyImageObserver;

// --- SLIDER INSTANCES ---
const sliders = {};

const mainCategoryConfig = {
    'Popular': {
        icon: '🧡', // Using emoji as a simple icon
        subcategories: ['restaurant', 'club', 'beach', 'coffee', 'pub'],
        isPopular: true,
    },
    'Food & Drink': {
        icon: '🍔',
        subcategories: ['restaurant', 'coffee', 'pub', 'fast-food', 'to-go'],
    },
    'Rural Tourism': {
        icon: '🌾',
        subcategories: ['rural tourism'],
    },
    'Nightlife': {
        icon: '🌙',
        subcategories: ['club', 'pub'],
    },
    'Beach': {
        icon: '🏖️',
        subcategories: ['beach'],
    },
    'Adventure & Sport': {
        icon: '🏞️',
        subcategories: ['kayaking', 'sup', 'diving', 'cruises', 'hiking', 'atv', 'sports', 'camping', 'gym', 'fitness', 'paragliding', 'golf', 'go-kart'],
    },
    'Culture': {
        icon: '🎨',
        subcategories: ['art'],
    },
    'Entertainment & Gaming': {
        icon: '🎮',
        subcategories: ['gaming-house', 'vr-gaming', 'board-games','darts','billiards'],
    },
    'Health & Wellness': {
        icon: '⚕️',
        subcategories: ['hospital', 'pharmacy', 'dentist', 'spa'],
    },
    'Rentals & Services': {
        icon: '🚗',
        subcategories: ['rent-a-car', 'rent-a-bike', 'rent-a-scooter', 'transport', 'detailing'],
    },
    'Shopping': {
        icon: '🛍️',
        subcategories: ['market', 'souvenir', 'boutique'],
    },
    'Pet Care': {
        icon: '🐾',
        subcategories: ['vet', 'pet-shop', 'grooming'],
    }   
};


// --- DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAllData();
    // Initialize layout controls if they exist
    initializeLayoutControls();
    // Initialize image fitting for existing images
    setTimeout(() => initializeImageFitting(), 500);
});

// --- SKELETON LOADING FUNCTIONS ---
function showSkeletonScreens() {
    const heroSkeleton = document.getElementById('hero-skeleton');
    const recommendationsSkeleton = document.getElementById('recommendations-skeleton');
    
    if (heroSkeleton) {
        heroSkeleton.classList.remove('hidden');
    }
    
    if (recommendationsSkeleton) {
        recommendationsSkeleton.classList.remove('hidden');
    }
    
    // Hide actual content
    const heroSlider = document.getElementById('hero-slider-container');
    const recommendationsSlider = document.getElementById('recommendations-slider-container');
    
    if (heroSlider) {
        heroSlider.style.display = 'none';
    }
    
    if (recommendationsSlider) {
        recommendationsSlider.style.display = 'none';
    }
}

function hideSkeletonScreens() {
    const heroSkeleton = document.getElementById('hero-skeleton');
    const recommendationsSkeleton = document.getElementById('recommendations-skeleton');
    
    if (heroSkeleton) {
        heroSkeleton.classList.add('hidden');
    }
    
    if (recommendationsSkeleton) {
        recommendationsSkeleton.classList.add('hidden');
    }
    
    // Show actual content
    const heroSlider = document.getElementById('hero-slider-container');
    const recommendationsSlider = document.getElementById('recommendations-slider-container');
    
    if (heroSlider) {
        heroSlider.style.display = '';
    }
    
    if (recommendationsSlider) {
        recommendationsSlider.style.display = '';
    }
}

// --- DATA FETCHING ---
async function fetchAllData() {
    // Show skeleton screens instead of basic loading
    showSkeletonScreens();
    
    const mainContent = document.getElementById('main-page-content');
    if (mainContent) {
        mainContent.classList.add('loading');
    }

    try {
        const [venuesResponse, eventsResponse, organizationsResponse, learnOhridResponse, historicalFactsResponse, churchesResponse] = await Promise.all([
            fetch('/api/venues'),
            fetch('/api/events'),
            fetch('/api/organizations'),
            fetch('/api/learn-ohrid-texts'),
            fetch('/data/historical_facts.json'),
            fetch('/data/churches.json')
        ]);

        // Check response status
        if (!venuesResponse.ok) throw new Error(`Venues API error: ${venuesResponse.status}`);
        if (!eventsResponse.ok) throw new Error(`Events API error: ${eventsResponse.status}`);
        if (!organizationsResponse.ok) throw new Error(`Organizations API error: ${organizationsResponse.status}`);
        if (!learnOhridResponse.ok) throw new Error(`Learn API error: ${learnOhridResponse.status}`);
        if (!historicalFactsResponse.ok) throw new Error(`Historical facts API error: ${historicalFactsResponse.status}`);
        if (!churchesResponse.ok) throw new Error(`Churches API error: ${churchesResponse.status}`);

        const [venues, events, organizations, learnOhrid, historicalFactsData, churches] = await Promise.all([
            venuesResponse.json(),
            eventsResponse.json(),
            organizationsResponse.json(),
            learnOhridResponse.json(),
            historicalFactsResponse.json(),
            churchesResponse.json()
        ]);

        venuesData = venues.map(normalizeVenueDataItem);
        eventsListData = events.filter(event => !event.isHidden);
        featuredEventsData = organizations;
        learnOhridTexts = learnOhrid;
        historicalFacts = historicalFactsData.facts;
        churchesData = churches.churches;

        // Hide skeleton screens and show content
        hideSkeletonScreens();
        
        // Remove loading state
        if (mainContent) {
            mainContent.classList.remove('loading');
        }

        await initializeApp();
        
        // Handle URL parameters after data is loaded
        handleUrlParameters();
        
        // Initialize calendar after data is loaded
        initializeCalendar();

    } catch (error) {
        console.error('Error loading app data:', error);
        
        // Hide skeleton screens even on error
        hideSkeletonScreens();
        
        // Show error message
        const mainContent = document.getElementById('main-page-content');
        if (mainContent) {
            mainContent.classList.remove('loading');
            mainContent.innerHTML = `
                <div class="error-container" style="text-align: center; padding: 2rem; color: var(--destructive);">
                    <h2>Unable to load content</h2>
                    <p>Please refresh the page to try again.</p>
                    <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">
                        Refresh Page
                    </button>
                </div>
            `;
        }
    }
}

// --- ERROR HANDLING ---
function showErrorMessage(message) {
    const existingError = document.querySelector('.error-message-banner');
    if (existingError) {
        existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message-banner';
    errorDiv.innerHTML = `
        <div class="error-content">
            <span class="error-icon" aria-hidden="true">⚠️</span>
            <span class="error-text">${message}</span>
            <button class="error-close" onclick="this.parentElement.parentElement.remove()" aria-label="Close error message" type="button">×</button>
        </div>
    `;
    document.body.insertBefore(errorDiv, document.body.firstChild);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 10000);
}

// --- DATA NORMALIZATION ---
function normalizeVenueDataItem(venue) {
    const newVenue = { ...venue };
    if (typeof venue.name === 'string') {
        newVenue.name = { en: venue.name };
    }
    if (typeof venue.description === 'string') {
        newVenue.description = { en: venue.description };
    }
    if (typeof venue.type === 'string' || Array.isArray(venue.type)) {
        newVenue.type = { en: venue.type };
    }
    return newVenue;
}

// --- URL PARAMETER HANDLING ---
function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const venueId = urlParams.get('venue');
    
    if (venueId) {
        const venue = venuesData.find(v => v.id == venueId);
        if (venue) {
            openVenueModal(venueId);
        } else {
            console.warn('Venue not found for ID:', venueId);
            // Clean up invalid venue parameter
            const url = new URL(window.location);
            url.searchParams.delete('venue');
            window.history.replaceState({}, document.title, url);
        }
    }
}

// Handle browser back/forward buttons
window.addEventListener('popstate', (event) => {
    const urlParams = new URLSearchParams(window.location.search);
    const venueId = urlParams.get('venue');
    
    if (venueId) {
        const venue = venuesData.find(v => v.id == venueId);
        if (venue) {
            openVenueModal(venueId);
        }
    } else {
        // Close modal if no venue parameter
        const modal = document.getElementById('venue-modal');
        if (modal && !modal.classList.contains('hidden')) {
            closeVenueModal();
        }
    }
});

// --- INITIALIZATION ---
async function initializeApp() {
    // Check WebP support first
    isWebPSupported = await checkWebPSupport();
    
    // Preload critical images
    preloadCriticalImages();
    
    // Initialize performance monitoring
    measurePerformance();
    
    // Initialize accessibility improvements
    improveAccessibility();
    
    setupEventListeners();
    initializeLazyObserver();
    venueRatings = JSON.parse(localStorage.getItem('ohridHubVenueRatings')) || {}; // Load ratings
    // updateStats(); // Removed - statistics section deleted
    initializeHeroSlider();
    populateRecommendations();
    populateVenueFilters();
    filterAndDisplayVenues();
    fetchWeather();
    initializeHistoricalFacts();
    // animateStatsOnScroll(); // Removed - statistics section deleted
    document.getElementById('main-page-content')?.classList.remove('hidden');
    setupImageModalClosers();
    
    // Update breadcrumbs for homepage
    updateBreadcrumbs('Home');
}

// --- UI & STATS UPDATES ---
function updateStats() {
    // 1. Update Events Count
    const eventsCount = eventsListData.length;
    document.getElementById('stats-events-count').textContent = eventsCount;

    // 2. Update Venues Count
    const venuesCount = venuesData.length;
    document.getElementById('stats-venues-count').textContent = venuesCount;

    // 3. Update Average Rating
    const ratedVenues = venuesData.filter(v => v.rating);
    if (ratedVenues.length > 0) {
        const totalRating = ratedVenues.reduce((sum, v) => sum + v.rating, 0);
        const avgRating = (totalRating / ratedVenues.length).toFixed(1);
        document.getElementById('stats-average-rating').textContent = avgRating;
    } else {
        document.getElementById('stats-average-rating').textContent = 'N/A';
    }

    // 4. Happy Visitors (using a static value as it's not in the data)
    // The animation script will handle the 'k' and '+' symbols if they are present in the HTML
    // We will set a plain number here so it can be animated.
    const visitorsEl = document.getElementById('stats-visitors-count');
    if (visitorsEl) {
        // We'll just use the number from the HTML, but remove k/+ for animation
        const originalText = visitorsEl.textContent || "10000";
        let targetValue = originalText.toLowerCase().replace('k', '000').replace('+', '');
        visitorsEl.textContent = parseFloat(targetValue);
    }
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    document.querySelector('.hero-buttons .btn-primary')?.addEventListener('click', () => {
        document.getElementById('plan-your-visit')?.scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('learn-ohrid-btn')?.addEventListener('click', () => {
        window.location.href = '/learn-ohrid';
    });

    const venueModal = document.getElementById('venue-modal');
    venueModal?.querySelector('.modal-close-button')?.addEventListener('click', closeVenueModal);
    
    // Venue Instagram Story button
    document.getElementById('venue-instagram-story-btn')?.addEventListener('click', openVenueInstagramStoryModal);
    venueModal?.addEventListener('click', (e) => {
        if (e.target === venueModal) closeVenueModal();
    });

    const eventModal = document.getElementById('event-detail-modal');
    eventModal?.querySelector('#event-detail-modal-close-button')?.addEventListener('click', closeEventModal);
    eventModal?.addEventListener('click', (e) => {
        if (e.target === eventModal) closeEventModal();
    });
    
    // Share event button
    document.getElementById('modal-event-share-btn')?.addEventListener('click', shareCurrentEvent);
    
    // Instagram Story button
    document.getElementById('modal-instagram-story-btn')?.addEventListener('click', openInstagramStoryModal);

    const imageModal = document.getElementById('image-modal');
    const imageModalClose = document.getElementById('image-modal-close');

    imageModalClose?.addEventListener('click', () => {
        imageModal.classList.add('hidden');
    });

    imageModal?.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.classList.add('hidden');
        }
    });

    // Planner-specific listeners will be set up in its init function
}

// --- ENHANCED SCHEMA.ORG DYNAMIC INJECTION ---
function generateVenueSchema(venue) {
    if (!venue) return;

    // Remove any existing venue schema
    const existingSchema = document.getElementById('venue-schema');
    if (existingSchema) {
        existingSchema.remove();
    }

    const schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness", // Default type
        "name": venue.name.en,
        "description": venue.description.en,
        "image": getOptimizedImagePath(`${window.location.origin}/${venue.imageUrl}`),
        "telephone": venue.phone,
        "url": window.location.href,
        "priceRange": venue.priceLevel ? "$".repeat(venue.priceLevel) : "$$",
        "openingHours": venue.workingHours ? `Mo-Su ${venue.workingHours}` : undefined
    };

    // Enhanced address and location data
    if (venue.location?.address) {
        schema.address = {
            "@type": "PostalAddress",
            "streetAddress": venue.location.address,
            "addressLocality": "Ohrid",
            "addressRegion": "Ohrid Municipality",
            "addressCountry": "MK",
            "postalCode": "6000"
        };
        
        // Add geographic coordinates if available
        if (venue.location.lat && venue.location.lng) {
            schema.geo = {
                "@type": "GeoCoordinates",
                "latitude": venue.location.lat,
                "longitude": venue.location.lng
            };
        }
    }

    // Add rating and review data
    if (venue.rating) {
        schema.aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": venue.rating,
            "bestRating": "5",
            "worstRating": "1",
            "reviewCount": venue.reviewCount || 1
        };
    }

    // Add amenities and features
    if (venue.amenities && venue.amenities.length > 0) {
        schema.amenityFeature = venue.amenities.map(amenity => ({
            "@type": "LocationFeatureSpecification",
            "name": amenity,
            "value": true
        }));
    }

    // Add gallery images
    if (venue.gallery && venue.gallery.length > 0) {
        schema.photo = venue.gallery.map(img => ({
            "@type": "ImageObject",
            "url": getOptimizedImagePath(`${window.location.origin}/${img.url}`),
            "description": img.alt || venue.name.en
        }));
    }

    // Use more specific types based on venue category
    const venueType = Array.isArray(venue.type.en) ? venue.type.en[0] : venue.type.en;
    switch (venueType?.toLowerCase()) {
        case 'restaurant':
            schema['@type'] = 'Restaurant';
            schema.servesCuisine = venue.cuisine || 'International';
            schema.acceptsReservations = true;
            break;
        case 'club':
            schema['@type'] = 'NightClub';
            break;
        case 'pub':
            schema['@type'] = 'BarOrPub';
            break;
        case 'beach':
            schema['@type'] = 'Beach';
            break;
        case 'hotel':
            schema['@type'] = 'Hotel';
            break;
        case 'coffee':
            schema['@type'] = 'CafeOrCoffeeShop';
            break;
        case 'hospital':
            schema['@type'] = 'Hospital';
            break;
        case 'pharmacy':
            schema['@type'] = 'Pharmacy';
            break;
        case 'gym':
            schema['@type'] = 'ExerciseGym';
            break;
        case 'spa':
            schema['@type'] = 'DaySpa';
            break;
        default:
            schema['@type'] = 'LocalBusiness';
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'venue-schema';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
}

function generateEventSchema(event) {
    if (!event) return;

    // Remove any existing event schema
    const existingSchema = document.getElementById('event-schema');
    if (existingSchema) {
        existingSchema.remove();
    }

    const schema = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": event.eventName,
        "description": event.longDescription || event.description,
        "startDate": `${event.isoDate}T${event.startTime || '00:00'}`,
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "eventStatus": "https://schema.org/EventScheduled",
        "url": window.location.href,
        "inLanguage": "en-US",
        "audience": {
            "@type": "Audience",
            "audienceType": "General Public"
        },
        "location": {
            "@type": "Place",
            "name": event.locationName || "Ohrid",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Ohrid",
                "addressRegion": "Ohrid Municipality",
                "addressCountry": "MK",
                "postalCode": "6000"
            }
        },
        "organizer": {
            "@type": "Organization",
            "name": "OhridHub",
            "url": "https://www.ohridhub.mk",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.ohridhub.mk/logo/ohridhub_logo_transparent_belo.png"
            }
        }
    };

    // Enhanced image handling
    if (event.imageUrl) {
        schema.image = {
            "@type": "ImageObject",
            "url": getOptimizedImagePath(`${window.location.origin}/${event.imageUrl}`),
            "description": `${event.eventName} event image`
        };
    }

    // Enhanced offers and pricing
    if (event.ticketPrice) {
        const isFree = event.ticketPrice.toLowerCase().includes('free');
        schema.offers = {
            "@type": "Offer",
            "name": "Event Ticket",
            "price": isFree ? "0" : event.ticketPrice.replace(/[^0-9]/g, '') || "0",
            "priceCurrency": "MKD",
            "availability": "https://schema.org/InStock",
            "validFrom": new Date().toISOString(),
            "url": event.eventBookingUrl && event.eventBookingUrl !== '#' ? event.eventBookingUrl : window.location.href
        };
    }

    // Add event category as genre
    if (event.category) {
        schema.genre = event.category;
    }

    // Add performer if available
    if (event.performer) {
        schema.performer = {
            "@type": "Person",
            "name": event.performer
        };
    }

    // Add end date estimate (assume 3 hours if not specified)
    if (event.endTime) {
        schema.endDate = `${event.isoDate}T${event.endTime}`;
    } else {
        const startDateTime = new Date(`${event.isoDate}T${event.startTime || '20:00'}`);
        const endDateTime = new Date(startDateTime.getTime() + 3 * 60 * 60 * 1000); // Add 3 hours
        schema.endDate = endDateTime.toISOString();
    }

    // Add social media and contact info
    if (event.eventContact) {
        schema.offers = {
            ...schema.offers,
            "seller": {
                "@type": "Organization",
                "name": event.locationName || "Venue",
                "telephone": event.eventContact
            }
        };
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'event-schema';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
}

// --- STATS ANIMATION ---
function animateStatsOnScroll() {
    const statsSection = document.querySelector('.stats-section');
    if (!statsSection) return;

    const animateValue = (element, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = progress * (end - start) + start;

            // Check if the target is a float or integer for correct formatting
            if (end % 1 !== 0) {
                element.textContent = currentValue.toFixed(1);
            } else {
                element.textContent = Math.floor(currentValue).toLocaleString();
            }

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                // Once finished, set the final text to the original, e.g., "50+" or "10k+"
                element.textContent = element.dataset.originalValue;
            }
        };
        window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statItems = entry.target.querySelectorAll('.stat-item h3');
                statItems.forEach(item => {
                    const originalValue = item.textContent;
                    item.dataset.originalValue = originalValue; // Store original text

                    let targetValue;
                    if (originalValue.toLowerCase().includes('k')) {
                        targetValue = parseFloat(originalValue) * 1000;
                    } else {
                        targetValue = parseFloat(originalValue.replace('+', ''));
                    }

                    if (!isNaN(targetValue)) {
                        animateValue(item, 0, targetValue, 2000);
                    }
                });
                observer.unobserve(entry.target); // Ensure it only animates once
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the element is visible
    });

    observer.observe(statsSection);
}

// --- LAZY IMAGE LOADING ---
// --- PERFORMANCE & IMAGE OPTIMIZATION ---
let isWebPSupported = false;

// Check WebP support
function checkWebPSupport() {
    return new Promise((resolve) => {
        const webP = new Image();
        webP.onload = webP.onerror = function () {
            resolve(webP.height === 2);
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUExANAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==';
    });
}

// Convert image path to WebP if supported
function getOptimizedImagePath(imagePath) {
    if (!imagePath || !isWebPSupported) return imagePath;
    
    // Don't convert if already WebP or if it's a data URL
    if (imagePath.includes('.webp') || imagePath.startsWith('data:')) {
        return imagePath;
    }
    
    // Convert to WebP format
    const pathWithoutExt = imagePath.replace(/\.(jpg|jpeg|png)$/i, '');
    return `${pathWithoutExt}.webp`;
}

// Enhanced lazy loading with WebP support and error handling
function initializeLazyObserver() {
    lazyImageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const originalSrc = img.dataset.src;
                const optimizedSrc = getOptimizedImagePath(originalSrc);
                
                // Create a new image to test if WebP version exists
                const testImage = new Image();
                
                testImage.onload = function() {
                    // WebP version loaded successfully
                    img.src = optimizedSrc;
                    img.classList.add('lazy-loaded');
                    observer.unobserve(img);
                };
                
                testImage.onerror = function() {
                    // WebP version failed, use original
                    img.src = originalSrc;
                    img.classList.add('lazy-loaded');
                    observer.unobserve(img);
                };
                
                testImage.src = optimizedSrc;
            }
        });
    }, {
        rootMargin: "0px 0px 300px 0px", // Increased from 200px for better performance
        threshold: 0.1 // Load when 10% of image is visible
    });
}

function observeLazyImages(container) {
    if (!container || !lazyImageObserver) return;
    const images = container.querySelectorAll('img.lazy');
    images.forEach(img => lazyImageObserver.observe(img));
}

// Preload critical images
function preloadCriticalImages() {
    const criticalImages = [
        'images_ohrid/photo1.jpg',
        'images_ohrid/photo6.jpg',
        'logo/ohridhub_logo_transparent_belo.png'
    ];
    
    criticalImages.forEach(imagePath => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = getOptimizedImagePath(imagePath);
        document.head.appendChild(link);
    });
}

// --- SLIDER UTILITY ---
function createSlider(elementOrSelector, options, name) {
    const sliderElement = typeof elementOrSelector === 'string'
        ? document.querySelector(elementOrSelector)
        : elementOrSelector;

    if (!sliderElement) {
        console.error("Slider element not found for:", name);
        return null;
    }

    if (sliders[name]) {
        sliders[name].destroy();
        delete sliders[name];
    }

    const slider = new KeenSlider(sliderElement, options);
    sliders[name] = slider;
    return slider;
}

// --- CATEGORY ICON MAPPING ---
const VENUE_CATEGORY_ICONS = {
    'restaurant': '🍽️',
    'bar': '🍻', 
    'cafe': '☕',
    'hotel': '🏨',
    'museum': '🏛️',
    'church': '⛪',
    'beach': '🏖️',
    'adventure': '🏔️',
    'entertainment': '🎭',
    'health': '🏥',
    'shopping': '🛍️',
    'nightclub': '🌙',
    'fast-food': '🍔',
    'culture': '🎨',
    'sport': '⚽',
    'transport': '🚗',
    'beauty': '💄',
    'education': '📚',
    'general': '📍'
};

function getVenueCategoryIcon(venueType) {
    if (!venueType) return VENUE_CATEGORY_ICONS.general;
    
    let type = '';
    if (typeof venueType === 'string') {
        type = venueType.toLowerCase();
    } else if (typeof venueType === 'object' && venueType.en) {
        type = Array.isArray(venueType.en) ? venueType.en[0] : venueType.en;
        type = type.toLowerCase();
    }
    
    // Smart mapping for common venue types
    if (type.includes('restaurant') || type.includes('dining')) return VENUE_CATEGORY_ICONS.restaurant;
    if (type.includes('bar') || type.includes('pub')) return VENUE_CATEGORY_ICONS.bar;
    if (type.includes('cafe') || type.includes('coffee')) return VENUE_CATEGORY_ICONS.cafe;
    if (type.includes('hotel') || type.includes('accommodation')) return VENUE_CATEGORY_ICONS.hotel;
    if (type.includes('museum')) return VENUE_CATEGORY_ICONS.museum;
    if (type.includes('church') || type.includes('monastery')) return VENUE_CATEGORY_ICONS.church;
    if (type.includes('beach')) return VENUE_CATEGORY_ICONS.beach;
    if (type.includes('adventure') || type.includes('outdoor')) return VENUE_CATEGORY_ICONS.adventure;
    if (type.includes('entertainment') || type.includes('theater')) return VENUE_CATEGORY_ICONS.entertainment;
    if (type.includes('health') || type.includes('medical')) return VENUE_CATEGORY_ICONS.health;
    if (type.includes('shop') || type.includes('store')) return VENUE_CATEGORY_ICONS.shopping;
    if (type.includes('night') || type.includes('club')) return VENUE_CATEGORY_ICONS.nightclub;
    if (type.includes('fast') || type.includes('burger')) return VENUE_CATEGORY_ICONS['fast-food'];
    if (type.includes('culture') || type.includes('art')) return VENUE_CATEGORY_ICONS.culture;
    if (type.includes('sport') || type.includes('fitness')) return VENUE_CATEGORY_ICONS.sport;
    if (type.includes('transport') || type.includes('rent')) return VENUE_CATEGORY_ICONS.transport;
    if (type.includes('beauty') || type.includes('spa')) return VENUE_CATEGORY_ICONS.beauty;
    if (type.includes('education') || type.includes('school')) return VENUE_CATEGORY_ICONS.education;
    
    return VENUE_CATEGORY_ICONS[type] || VENUE_CATEGORY_ICONS.general;
}

// --- RENDERING FUNCTIONS ---
function renderVenueCard(venue) {
    const name = venue.name?.en || venue.name || 'Unnamed Venue';
    const description = venue.description?.en || venue.description || 'No description available.';
    const location = venue.location?.address || null;
    
    let categoryString = 'General';
    let venueType = venue.type;
    if (venue.type?.en) {
        const type = Array.isArray(venue.type.en) ? venue.type.en[0] : venue.type.en;
        if (type && typeof type === 'string') {
            categoryString = type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    } else if (typeof venue.type === 'string') {
        categoryString = venue.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    const categoryIcon = getVenueCategoryIcon(venueType);
    const imageUrl = venue.imageUrl || 'https://via.placeholder.com/400x220/f8fafc/94a3b8?text=No+Image';
    const isRecommended = venue.tags?.includes('Recommended');

    // --- Dynamic Rating Logic ---
    const ratings = venueRatings[venue.id] || [];
    const ratingCount = ratings.length;
    const rating = ratingCount > 0 ? ratings.reduce((a, b) => a + b, 0) / ratingCount : null;
    // --- End Dynamic Rating Logic ---

    let recommendationBadge = '';
    if (isRecommended) {
        recommendationBadge = '<span class="venue-card-badge recommended-badge">Recommended</span>';
    }

    let ratingBadge = '';
    if (rating && ratingCount > 0) {
        const reviewText = ratingCount === 1 ? 'review' : 'reviews';
        ratingBadge = `<span class="venue-card-badge rating-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="star-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            ${rating.toFixed(1)} (${ratingCount} ${reviewText})
        </span>`;
    } else if (!isRecommended) { // Don't show "Not yet rated" if it's "Recommended"
        ratingBadge = `<span class="venue-card-badge no-rating-badge">Not yet rated</span>`;
    }

    // Build location HTML conditionally
    const locationHtml = location ? `
        <div class="venue-card-location">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
            </svg>
            <span>${location}</span>
        </div>
    ` : '';

    // Build tags HTML from venue tags
    const tags = venue.tags || [];
    const displayTags = tags.filter(tag => tag !== 'Recommended').slice(0, 3);
    const tagsHtml = displayTags.length > 0 ? `
        <div class="venue-card-tags">
            ${displayTags.map(tag => `<span class="venue-card-tag">${tag}</span>`).join('')}
        </div>
    ` : '';

    // Build hover details for desktop
    const hoverDetailsHtml = `
        <div class="venue-card-hover-details">
            <div class="venue-card-hover-content">
                <h4 class="venue-card-hover-title">${name}</h4>
                <div class="venue-card-hover-info">
                    ${venue.workingHours ? `
                        <div class="venue-card-hover-item">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>${venue.workingHours}</span>
                        </div>
                    ` : ''}
                    ${venue.phone ? `
                        <div class="venue-card-hover-item">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            <span>${venue.phone}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="venue-card-hover-actions">
                    <button class="venue-card-hover-btn primary" onclick="event.stopPropagation(); openVenueModal(${venue.id})">
                        View Details
                    </button>
                    ${venue.location?.googleMapsUrl ? `
                        <a href="${venue.location.googleMapsUrl}" target="_blank" class="venue-card-hover-btn secondary" onclick="event.stopPropagation()">
                            Directions
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    // Truncate description for card display
    const shortDescription = description.length > 120 ? description.substring(0, 120) + '...' : description;
    
    // Build contact icons section
    const contactIcons = [];
    if (venue.phone) {
        contactIcons.push(`
            <button class="contact-icon" onclick="event.stopPropagation(); window.location.href='tel:${venue.phone}'" title="Call ${venue.phone}">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
            </button>
        `);
    }
    if (venue.location?.googleMapsUrl) {
        contactIcons.push(`
            <button class="contact-icon" onclick="event.stopPropagation(); window.open('${venue.location.googleMapsUrl}', '_blank')" title="Get Directions">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
            </button>
        `);
    }

    return `
        <div class="keen-slider__slide" data-venue-id="${venue.id}">
            <div class="redesigned-venue-card" onclick="event.stopPropagation(); handleVenueCardClick(this, ${venue.id})">
                <!-- Image Section with 4:3 Aspect Ratio -->
                <div class="venue-card__media">
                    <img data-src="${getOptimizedImageUrl(imageUrl, 400)}" 
                         src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xNSAxNSA2IDYgNi02TTIxIDIxaDEuNWEzLjUgMy41IDAgMSAwIDAtNyIgc3Ryb2tlPSIjOWNhM2FmIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo="
                         alt="${name}" 
                         class="venue-card__img" 
                         loading="lazy" 
                         decoding="async"
                         sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                         onload="console.log('Image loaded:', this.src); adjustImageFit(this);"
                         onerror="handleImageError(this)">
                    <div class="venue-image-overlay">
                        <span class="venue-type-badge">${categoryString}</span>
                        ${isRecommended ? '<span class="recommended-badge">★ Recommended</span>' : ''}
                    </div>
                </div>
                
                <!-- Essential Information Section -->
                <div class="venue-essential-info">
                    <!-- Name and Rating Row -->
                    <div class="venue-header-row">
                        <div class="venue-name-section">
                            <h3 class="venue-name">${name}</h3>
                            <span class="venue-category">${categoryString}</span>
                        </div>
                        ${rating && ratingCount > 0 ? `
                            <div class="venue-rating-display">
                                <div class="rating-stars">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                    </svg>
                                    <span class="rating-value">${rating.toFixed(1)}</span>
                                </div>
                                <span class="rating-count">${ratingCount} reviews</span>
                            </div>
                        ` : '<div class="venue-rating-display"><span class="no-rating">No reviews</span></div>'}
                    </div>
                    
                    <!-- Location and Hours Row -->
                    <div class="venue-details-row">
                        ${location ? `
                            <div class="venue-info-item">
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                <span class="info-text">${location}</span>
                            </div>
                        ` : ''}
                        
                        ${venue.workingHours ? `
                            <div class="venue-info-item">
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <span class="info-text">${venue.workingHours}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Short Description -->
                    <div class="venue-description-preview">
                        <p class="description-text">${shortDescription}</p>
                        ${description.length > 120 ? `
                            <button class="read-more-toggle" onclick="event.stopPropagation(); toggleCardDescription(this)" data-venue-id="${venue.id}">
                                Read More
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Contact and Action Section -->
                <div class="venue-action-section">
                    <div class="contact-actions">
                        ${contactIcons.length > 0 ? contactIcons.join('') : ''}
                        <button class="view-details-btn" onclick="event.stopPropagation(); handleVenueCardClick(this, ${venue.id})">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            Details
                        </button>
                    </div>
                    
                    ${displayTags.length > 0 ? `
                        <div class="venue-tags-compact">
                            ${displayTags.slice(0, 2).map(tag => `<span class="venue-tag">${tag}</span>`).join('')}
                            ${displayTags.length > 2 ? `<span class="more-tags">+${displayTags.length - 2}</span>` : ''}
                        </div>
                    ` : ''}
                </div>
                
                <!-- Expandable Section (Hidden by default) -->
                <div class="venue-expandable-section" id="expandable-${venue.id}" style="display: none;">
                    <div class="expanded-content">
                        <div class="full-description">
                            <h4>About</h4>
                            <p>${description}</p>
                        </div>
                        
                        ${displayTags.length > 0 ? `
                            <div class="all-tags">
                                <h4>Tags</h4>
                                <div class="tags-list">
                                    ${displayTags.map(tag => `<span class="venue-tag">${tag}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${venue.phone || venue.location?.googleMapsUrl ? `
                            <div class="contact-info">
                                <h4>Contact</h4>
                                <div class="contact-details">
                                    ${venue.phone ? `
                                        <a href="tel:${venue.phone}" class="contact-link" onclick="event.stopPropagation()">
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                            </svg>
                                            ${venue.phone}
                                        </a>
                                    ` : ''}
                                    
                                    ${venue.location?.googleMapsUrl ? `
                                        <a href="${venue.location.googleMapsUrl}" target="_blank" class="contact-link" onclick="event.stopPropagation()">
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            </svg>
                                            Get Directions
                                        </a>
                                    ` : ''}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- IMAGE HANDLING FUNCTIONS ---
function adjustImageFit(img) {
    console.log('adjustImageFit called for:', img.src);
    
    if (!img.complete || !img.naturalWidth || !img.naturalHeight) {
        console.log('Image not ready, retrying...');
        // Image not fully loaded yet, try again after a short delay
        setTimeout(() => adjustImageFit(img), 100);
        return;
    }
    
    const ratio = img.naturalWidth / img.naturalHeight;
    const expectedRatio = 4/3; // Our container ratio
    
    console.log(`Image ${img.src.split('/').pop()}: ${img.naturalWidth}x${img.naturalHeight}, ratio: ${ratio.toFixed(2)}`);
    
    // Calculate how much the image differs from our expected ratio
    const ratioDifference = Math.abs(ratio - expectedRatio) / expectedRatio;
    
    // Reset any previous styles
    img.classList.remove('venue-card__img--contain');
    img.style.objectFit = '';
    img.style.backgroundColor = '';
    
    // If the image ratio is very different from 4:3, or if it's extreme
    if (ratioDifference > 0.4 || ratio >= 2.0 || ratio <= 0.6) {
        // Use contain for extreme ratios to avoid bad cropping
        console.log('Applying contain mode for extreme ratio');
        img.classList.add('venue-card__img--contain');
        img.style.objectFit = 'contain';
        img.style.objectPosition = 'center center';
        img.style.backgroundColor = '#fff';
    } else if (ratio < expectedRatio) {
        // Portrait-ish images: position toward top to avoid cutting off important content
        console.log('Applying top positioning for portrait image');
        img.style.objectFit = 'cover';
        img.style.objectPosition = 'center top';
    } else {
        // Landscape-ish images: use center positioning
        console.log('Applying center positioning for landscape image');
        img.style.objectFit = 'cover';
        img.style.objectPosition = 'center center';
    }
    
    // Find the venue card media container for dynamic height adjustment
    const mediaContainer = img.closest('.venue-card__media');
    if (mediaContainer) {
        const isPortrait = ratio < 1; // Height > Width
        const isLandscape = ratio > 1.3; // Width significantly > Height
        
        console.log(`📱 Portrait: ${isPortrait}, 🖥️ Landscape: ${isLandscape}`);
        
        // Adjust container aspect ratio based on image orientation
        if (isPortrait) {
            console.log('📱 Setting venue portrait aspect ratio (3:4)');
            mediaContainer.style.aspectRatio = '3 / 4';
        } else if (isLandscape) {
            console.log('🖥️ Setting venue landscape aspect ratio (16:9)');
            mediaContainer.style.aspectRatio = '16 / 9';
        } else {
            console.log('⬜ Setting venue standard aspect ratio (4:3)');
            mediaContainer.style.aspectRatio = '4 / 3';
        }
    }
    
    // Special handling for images that might have logos or text
    // Check if image seems to have important content that shouldn't be cropped
    const aspectRatioTolerance = 0.2;
    if (Math.abs(ratio - 1) < aspectRatioTolerance) {
        // Square-ish images often have logos - use contain to preserve them
        console.log('Applying contain mode for square/logo image');
        img.classList.add('venue-card__img--contain');
        img.style.objectFit = 'contain';
        img.style.objectPosition = 'center center';
        img.style.backgroundColor = '#fff';
        
        // Set square aspect ratio for square images
        if (mediaContainer) {
            console.log('🔳 Setting square aspect ratio (1:1) for logo image');
            mediaContainer.style.aspectRatio = '1 / 1';
        }
    }
}

// Initialize image fitting for all existing images
function initializeImageFitting() {
    // Handle new venue card images
    document.querySelectorAll('.venue-card__img').forEach(img => {
        if (img.complete && img.naturalWidth > 0) {
            adjustImageFit(img);
        } else {
            img.addEventListener('load', () => adjustImageFit(img));
            img.addEventListener('error', () => handleImageError(img));
        }
    });
    
    // Handle legacy venue images
    document.querySelectorAll('.venue-image').forEach(img => {
        if (img.complete && img.naturalWidth > 0) {
            adjustLegacyImageFit(img);
        } else {
            img.addEventListener('load', () => adjustLegacyImageFit(img));
            img.addEventListener('error', () => handleImageError(img));
        }
    });
}

// Adjust positioning for legacy venue images
function adjustLegacyImageFit(img) {
    console.log('🔍 adjustLegacyImageFit called for:', img.src);
    
    if (!img.complete || !img.naturalWidth || !img.naturalHeight) {
        console.log('⚠️ Legacy venue image not ready, retrying...');
        setTimeout(() => adjustLegacyImageFit(img), 100);
        return;
    }
    
    const ratio = img.naturalWidth / img.naturalHeight;
    const isPortrait = ratio < 1; // Height > Width
    const isLandscape = ratio > 1.3; // Width significantly > Height
    
    console.log(`📐 Legacy venue image: ${img.naturalWidth}x${img.naturalHeight}, ratio: ${ratio.toFixed(2)}`);
    console.log(`📱 Portrait: ${isPortrait}, 🖥️ Landscape: ${isLandscape}`);
    
    // Find the legacy venue image container
    const imageSection = img.closest('.venue-image-section');
    if (imageSection) {
        // Adjust container aspect ratio based on image orientation
        if (isPortrait) {
            console.log('📱 Setting legacy venue portrait aspect ratio (3:4)');
            imageSection.style.aspectRatio = '3 / 4';
        } else if (isLandscape) {
            console.log('🖥️ Setting legacy venue landscape aspect ratio (16:9)');
            imageSection.style.aspectRatio = '16 / 9';
        } else {
            console.log('⬜ Setting legacy venue standard aspect ratio (4:3)');
            imageSection.style.aspectRatio = '4 / 3';
        }
    }
    
    // Set appropriate object positioning
    if (isPortrait) {
        img.style.objectPosition = 'center center';
    } else if (isLandscape) {
        img.style.objectPosition = 'center center';
    } else {
        img.style.objectPosition = 'center center';
    }
    
    // Handle square-ish images (likely logos)
    if (Math.abs(ratio - 1) < 0.2) {
        console.log('🔳 Applying contain mode for legacy square/logo image');
        img.style.objectFit = 'contain';
        img.style.objectPosition = 'center center';
        img.style.backgroundColor = '#fff';
        if (imageSection) {
            imageSection.style.aspectRatio = '1 / 1';
        }
    }
    
    console.log('✅ Legacy venue image fit adjusted');
}

// Handle image loading errors gracefully
function handleImageError(img) {
    img.style.backgroundColor = '#f8fafc';
    img.style.background = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\' viewBox=\'0 0 400 300\'%3E%3Crect width=\'400\' height=\'300\' fill=\'%23f8fafc\'/%3E%3Cg fill=\'%23cbd5e1\'%3E%3Cpath d=\'M180 140h40v20h-40z\'/%3E%3Ccircle cx=\'170\' cy=\'120\' r=\'8\'/%3E%3Cpath d=\'M160 100h80v80h-80z\' fill=\'none\' stroke=\'%23cbd5e1\' stroke-width=\'2\'/%3E%3C/g%3E%3Ctext x=\'200\' y=\'210\' text-anchor=\'middle\' fill=\'%2394a3b8\' font-family=\'Arial\' font-size=\'14\'%3EImage not available%3C/text%3E%3C/svg%3E") center/cover no-repeat';
    img.alt = 'Image not available';
}

// Force refresh image fitting for all images (useful for debugging)
function refreshAllImageFitting() {
    console.log('Refreshing image fitting for all venue images...');
    document.querySelectorAll('.venue-card__img, .venue-image').forEach(img => {
        if (img.complete && img.naturalWidth > 0) {
            if (img.classList.contains('venue-card__img')) {
                adjustImageFit(img);
            } else {
                adjustLegacyImageFit(img);
            }
            console.log(`Adjusted image: ${img.src.split('/').pop()}, ratio: ${(img.naturalWidth / img.naturalHeight).toFixed(2)}`);
        }
    });
}

// Event Image Orientation Detection
function adjustEventCardHeight(img) {
    console.log('🔍 Checking event image orientation:', img.src);
    
    if (!img.naturalWidth || !img.naturalHeight) {
        console.log('⚠️ Image dimensions not ready, retrying...');
        setTimeout(() => adjustEventCardHeight(img), 100);
        return;
    }
    
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    const isPortrait = aspectRatio < 1; // Height > Width
    const isLandscape = aspectRatio > 1.3; // Width significantly > Height
    
    console.log(`📐 Image dimensions: ${img.naturalWidth}x${img.naturalHeight}, ratio: ${aspectRatio.toFixed(2)}`);
    console.log(`📱 Portrait: ${isPortrait}, 🖥️ Landscape: ${isLandscape}`);
    
    const imageSection = img.closest('.event-card-image-section');
    if (!imageSection) {
        console.log('❌ Could not find image section');
        return;
    }
    
    // Apply different heights based on orientation
    if (isPortrait) {
        console.log('📱 Setting portrait height (320px)');
        imageSection.style.height = '320px';
        img.style.objectFit = 'cover';
        img.style.objectPosition = 'center center';
    } else if (isLandscape) {
        console.log('🖥️ Setting landscape height (180px)');
        imageSection.style.height = '180px';
        img.style.objectFit = 'cover';
        img.style.objectPosition = 'center center';
    } else {
        console.log('⬜ Setting standard height (240px)');
        imageSection.style.height = '240px';
        img.style.objectFit = 'cover';
        img.style.objectPosition = 'center center';
    }
    
    console.log('✅ Event card height adjusted');
}

// --- VENUE INTERACTION HANDLERS ---
function handleVenueCardClick(cardElement, venueId) {
    // Open modal for both mobile and desktop
    openVenueModal(venueId);
}

// Toggle expandable description in venue cards
function toggleCardDescription(button) {
    const venueId = button.getAttribute('data-venue-id');
    const expandableSection = document.getElementById(`expandable-${venueId}`);
    const isExpanded = expandableSection.style.display !== 'none';
    
    if (isExpanded) {
        expandableSection.style.display = 'none';
        button.textContent = 'Read More';
        button.classList.remove('expanded');
    } else {
        expandableSection.style.display = 'block';
        button.textContent = 'Read Less';
        button.classList.add('expanded');
    }
}

// Make function globally accessible
window.toggleCardDescription = toggleCardDescription;

// Get category icon for events
function getCategoryIcon(category) {
    const categoryMap = {
        'music': '🎵',
        'music & entertainment': '🎵',
        'festival': '🎪',
        'sport': '⚽',
        'sports': '⚽',
        'art': '🎨',
        'culture': '🏛️',
        'food': '🍽️',
        'workshop': '🛠️',
        'conference': '🎤',
        'party': '🎉',
        'entertainment': '🎭',
        'wellness': '🧘',
        'outdoor': '🌲',
        'theater': '🎭',
        'cinema': '🎬',
        'dance': '💃',
        'comedy': '😄',
        'charity': '❤️',
        'business': '💼',
        'education': '📚'
    };
    
    const normalizedCategory = category.toLowerCase().trim();
    return categoryMap[normalizedCategory] || '📅';
}



function initializeMobileVenueCards() {
    // Handle window resize to reset mobile states
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            // Remove expanded state when switching to desktop
            document.querySelectorAll('.venue-card.expanded').forEach(card => {
                card.classList.remove('expanded');
            });
        }
    });
}

// --- LAYOUT SWITCHING FUNCTIONS ---
function setVenueLayout(layout) {
    const container = document.querySelector('.venues-container');
    const gridBtn = document.querySelector('.layout-toggle-btn[data-layout="grid"]');
    const listBtn = document.querySelector('.layout-toggle-btn[data-layout="list"]');
    
    if (!container) return;
    
    if (layout === 'grid') {
        container.className = 'venues-container venues-grid';
        gridBtn?.classList.add('active');
        listBtn?.classList.remove('active');
    } else if (layout === 'list') {
        container.className = 'venues-container venues-list';
        listBtn?.classList.add('active');
        gridBtn?.classList.remove('active');
    }
    
    // Store preference
    localStorage.setItem('venueLayout', layout);
}

function initializeLayoutControls() {
    const layoutControls = document.querySelectorAll('.layout-toggle-btn');
    layoutControls.forEach(btn => {
        btn.addEventListener('click', () => {
            const layout = btn.getAttribute('data-layout');
            setVenueLayout(layout);
        });
    });
    
    // Load saved preference
    const savedLayout = localStorage.getItem('venueLayout') || 'grid';
    setVenueLayout(savedLayout);
}

function populateRecommendations() {
    const recommendationsContainer = document.querySelector('#recommendations-slider');
    if (!recommendationsContainer) return;

    let recommendations = venuesData
        .filter(v => v.tags?.includes('Recommended'));

    // Fallback: If no venues are explicitly tagged as "Recommended",
    // pick 5 random, non-hospital, highly-rated venues.
    if (recommendations.length === 0) {
        recommendations = venuesData
            .filter(v => {
                const typeEn = v.type?.en;
                if (!typeEn) return true; // Don't filter out if type is missing
                const types = Array.isArray(typeEn) ? typeEn : [typeEn];
                return !types.map(t => t.toLowerCase()).includes('hospital');
            })
            .sort(() => 0.5 - Math.random()) // Shuffle
            .slice(0, 5); // Take the first 5
    }

    recommendationsContainer.innerHTML = recommendations.map(renderVenueCard).join('');
    // Images now load directly, no lazy loading needed

    // Initialize image fitting for smart aspect ratio handling
    setTimeout(() => initializeImageFitting(), 100);

    // Initialize mobile interactions
    initializeMobileVenueCards();

    createSlider('#recommendations-slider', {
        loop: true,
        slides: { perView: 1.1, spacing: 10 },
        breakpoints: {
            '(min-width: 480px)': { slides: { perView: 1.3, spacing: 12 } },
            '(min-width: 640px)': { slides: { perView: 2.1, spacing: 15 } },
            '(min-width: 768px)': { slides: { perView: 2.5, spacing: 20 } },
            '(min-width: 1024px)': { slides: { perView: 3.5, spacing: 25 } },
            '(min-width: 1200px)': { slides: { perView: 4, spacing: 25 } },
        },
    }, 'recommendations');

    document.querySelector('#recommendations-arrow-left')?.addEventListener('click', () => sliders.recommendations?.prev());
    document.querySelector('#recommendations-arrow-right')?.addEventListener('click', () => sliders.recommendations?.next());
}

function populateVenueFilters() {
    const mainCategoriesContainer = document.querySelector('.main-categories');
    const dropdownMenu = document.querySelector('#venue-category-dropdown');
    
    if (!mainCategoriesContainer) {
        console.error('Main categories container not found');
        return;
    }

    const mainCategories = ['All', ...Object.keys(mainCategoryConfig)];
    console.log('Populating venue filters with categories:', mainCategories);

    // Populate desktop categories (existing functionality)
    mainCategoriesContainer.innerHTML = mainCategories.map(cat => {
        if (cat === 'All') {
            return `<button class="category-btn active" data-category="All">All Venues</button>`;
        }
        const config = mainCategoryConfig[cat];
        return `
            <button class="category-btn" data-category="${cat}">
                <span class="category-icon">${config.icon}</span>
                <span>${cat}</span>
            </button>
        `;
    }).join('');

    // Populate mobile dropdown
    if (dropdownMenu) {
        const dropdownHTML = mainCategories.map(cat => {
            if (cat === 'All') {
                return `
                    <button class="dropdown-option active" data-category="All">
                        <span class="option-icon">🧡</span>
                        <span class="option-text">All Venues</span>
                    </button>
                `;
            }
            const config = mainCategoryConfig[cat];
            return `
                <button class="dropdown-option" data-category="${cat}">
                    <span class="option-icon">${config.icon}</span>
                    <span class="option-text">${cat}</span>
                </button>
            `;
        }).join('');
        
        dropdownMenu.innerHTML = dropdownHTML;
        console.log('Main dropdown populated successfully');
    } else {
        console.error('Main dropdown menu element not found');
    }

    // Add event listeners for desktop categories
    mainCategoriesContainer.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const clickedButton = e.target.closest('.category-btn');
            if (!clickedButton) return;

            mainCategoriesContainer.querySelector('.category-btn.active')?.classList.remove('active');
            clickedButton.classList.add('active');
            
            const category = clickedButton.dataset.category;
            populateSubFilters(category);
            filterAndDisplayVenues();
        });
    });

    // Initialize dropdown functionality with error handling
    try {
        initVenueCategoryDropdown();
        console.log('Main dropdown initialized');
    } catch (error) {
        console.error('Error initializing main dropdown:', error);
    }
    
    try {
        initVenueSubcategoryDropdown();
        console.log('Subcategory dropdown initialized');
    } catch (error) {
        console.error('Error initializing subcategory dropdown:', error);
    }
}

function initVenueCategoryDropdown() {
    const dropdownTrigger = document.querySelector('#venue-category-trigger');
    const dropdownMenu = document.querySelector('#venue-category-dropdown');
    const selectedIcon = document.querySelector('.selected-category-icon');
    const selectedText = document.querySelector('.selected-category-text');
    
    console.log('Looking for dropdown elements:', {
        trigger: !!dropdownTrigger,
        menu: !!dropdownMenu,
        icon: !!selectedIcon,
        text: !!selectedText
    });
    
    if (!dropdownTrigger || !dropdownMenu) {
        console.error('Main dropdown elements not found - skipping initialization');
        return;
    }

    console.log('Initializing main dropdown functionality...');

    // Toggle dropdown
    dropdownTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Dropdown trigger clicked');
        
        const isOpen = dropdownTrigger.getAttribute('aria-expanded') === 'true';
        console.log('Current state:', isOpen ? 'open' : 'closed');
        
        // Use setTimeout to prevent immediate closure from document click listener
        setTimeout(() => {
            if (isOpen) {
                closeDropdown();
            } else {
                openDropdown();
            }
        }, 10);
    });

    // Handle dropdown option selection
    dropdownMenu.addEventListener('click', (e) => {
        const option = e.target.closest('.dropdown-option');
        if (!option) return;

        const category = option.dataset.category;
        const icon = option.querySelector('.option-icon').textContent;
        const text = option.querySelector('.option-text').textContent;

        // Update dropdown trigger appearance
        selectedIcon.textContent = icon;
        selectedText.textContent = text;

        // Update active states
        dropdownMenu.querySelector('.dropdown-option.active')?.classList.remove('active');
        option.classList.add('active');

        // Update desktop categories to match
        const desktopCategories = document.querySelector('.main-categories');
        if (desktopCategories) {
            desktopCategories.querySelector('.category-btn.active')?.classList.remove('active');
            const matchingDesktopBtn = desktopCategories.querySelector(`[data-category="${category}"]`);
            if (matchingDesktopBtn) {
                matchingDesktopBtn.classList.add('active');
            }
        }

        // Apply filter and update subcategories
        console.log('Selected main category:', category);
        populateSubFilters(category);
        filterAndDisplayVenues();
        
        closeDropdown();
    });

    let documentClickListener;
    let escapeKeyListener;

    function openDropdown() {
        console.log('Opening dropdown...');
        dropdownTrigger.setAttribute('aria-expanded', 'true');
        dropdownMenu.classList.add('show');
        console.log('Dropdown classes after opening:', dropdownMenu.className);
        console.log('Dropdown computed style:', window.getComputedStyle(dropdownMenu).display);
        console.log('Dropdown visibility:', window.getComputedStyle(dropdownMenu).visibility);
        console.log('Dropdown opacity:', window.getComputedStyle(dropdownMenu).opacity);
        
        // Add document listeners only when dropdown is open
        setTimeout(() => {
            documentClickListener = (e) => {
                if (!dropdownTrigger.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    console.log('Clicking outside, closing dropdown');
                    closeDropdown();
                }
            };
            
            escapeKeyListener = (e) => {
                if (e.key === 'Escape') {
                    closeDropdown();
                }
            };
            
            document.addEventListener('click', documentClickListener);
            document.addEventListener('keydown', escapeKeyListener);
        }, 100);
    }

    function closeDropdown() {
        console.log('Closing dropdown...');
        dropdownTrigger.setAttribute('aria-expanded', 'false');
        dropdownMenu.classList.remove('show');
        
        // Remove document listeners when dropdown is closed
        if (documentClickListener) {
            document.removeEventListener('click', documentClickListener);
            documentClickListener = null;
        }
        if (escapeKeyListener) {
            document.removeEventListener('keydown', escapeKeyListener);
            escapeKeyListener = null;
        }
    }
}

function initVenueSubcategoryDropdown() {
    const dropdownTrigger = document.querySelector('#venue-subcategory-trigger');
    const dropdownMenu = document.querySelector('#venue-subcategory-dropdown');
    const selectedIcon = document.querySelector('#venue-subcategory-trigger .selected-category-icon');
    const selectedText = document.querySelector('#venue-subcategory-trigger .selected-category-text');
    
    console.log('Looking for subcategory dropdown elements:', {
        trigger: !!dropdownTrigger,
        menu: !!dropdownMenu,
        icon: !!selectedIcon,
        text: !!selectedText
    });
    
    if (!dropdownTrigger || !dropdownMenu) {
        console.error('Subcategory dropdown elements not found - skipping initialization');
        return;
    }

    console.log('Initializing subcategory dropdown functionality...');

    let documentClickListener;
    let escapeKeyListener;

    // Toggle dropdown
    dropdownTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isOpen = dropdownTrigger.getAttribute('aria-expanded') === 'true';
        
        setTimeout(() => {
            if (isOpen) {
                closeSubcategoryDropdown();
            } else {
                openSubcategoryDropdown();
            }
        }, 10);
    });

    // Handle dropdown option selection
    dropdownMenu.addEventListener('click', (e) => {
        const option = e.target.closest('.dropdown-option');
        if (!option) return;

        const subcategory = option.dataset.subcategory;
        const text = option.querySelector('.option-text').textContent;

        // Update dropdown trigger appearance
        selectedText.textContent = text;

        // Update active states
        dropdownMenu.querySelector('.dropdown-option.active')?.classList.remove('active');
        option.classList.add('active');

        // Update desktop subcategories to match
        const desktopSubcategories = document.querySelector('.desktop-subcategories');
        if (desktopSubcategories) {
            desktopSubcategories.querySelector('.subcategory-btn.active')?.classList.remove('active');
            const matchingDesktopBtn = desktopSubcategories.querySelector(`[data-subcategory="${subcategory}"]`);
            if (matchingDesktopBtn) {
                matchingDesktopBtn.classList.add('active');
            }
        }

        // Apply filter
        filterAndDisplayVenues();
        closeSubcategoryDropdown();
    });

    function openSubcategoryDropdown() {
        dropdownTrigger.setAttribute('aria-expanded', 'true');
        dropdownMenu.classList.add('show');
        
        setTimeout(() => {
            documentClickListener = (e) => {
                if (!dropdownTrigger.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    closeSubcategoryDropdown();
                }
            };
            
            escapeKeyListener = (e) => {
                if (e.key === 'Escape') {
                    closeSubcategoryDropdown();
                }
            };
            
            document.addEventListener('click', documentClickListener);
            document.addEventListener('keydown', escapeKeyListener);
        }, 100);
    }

    function closeSubcategoryDropdown() {
        dropdownTrigger.setAttribute('aria-expanded', 'false');
        dropdownMenu.classList.remove('show');
        
        if (documentClickListener) {
            document.removeEventListener('click', documentClickListener);
            documentClickListener = null;
        }
        if (escapeKeyListener) {
            document.removeEventListener('keydown', escapeKeyListener);
            escapeKeyListener = null;
        }
    }

    // Store functions globally for access from populateSubFilters
    window.subcategoryDropdownFunctions = {
        updateSubcategoryDropdown: (subcategories, activeSubcategory) => {
            if (!dropdownMenu) {
                console.error('Subcategory dropdown menu not found');
                return;
            }
            
            console.log('Populating subcategory dropdown with:', subcategories);
            
            const dropdownHTML = subcategories.map(subcat => {
                const isActive = subcat === activeSubcategory;
                const displayName = subcat === 'all' ? 'All Categories' : subcat.charAt(0).toUpperCase() + subcat.slice(1).replace(/-/g, ' ');
                return `
                    <button class="dropdown-option ${isActive ? 'active' : ''}" data-subcategory="${subcat}">
                        <span class="option-icon">🔍</span>
                        <span class="option-text">${displayName}</span>
                    </button>
                `;
            }).join('');
            
            dropdownMenu.innerHTML = dropdownHTML;
            console.log('Subcategory dropdown HTML updated');
            
            // Update trigger text
            if (selectedText) {
                selectedText.textContent = 'All Categories';
                console.log('Subcategory trigger text updated');
            }
        }
    };
}

function populateSubFilters(mainCategory) {
    const subCategoriesContainer = document.querySelector('#sub-categories-container');
    const subCategoriesList = document.querySelector('#sub-categories-container .sub-categories');

    if (!subCategoriesContainer || !subCategoriesList) return;

    subCategoriesList.innerHTML = '';
    const mobileSubcategoryElement = document.querySelector('.venue-subcategory-dropdown');
    
    if (mainCategory === 'All' || !mainCategoryConfig[mainCategory]) {
        subCategoriesContainer.classList.add('hidden');
        
        // Hide mobile subcategory dropdown
        if (mobileSubcategoryElement) {
            mobileSubcategoryElement.style.display = 'none';
            mobileSubcategoryElement.classList.remove('visible');
            console.log('Subcategory dropdown hidden (All selected)');
        }
        return;
    }

    subCategoriesContainer.classList.remove('hidden');
    const subCategories = mainCategoryConfig[mainCategory].subcategories;
    
    // Populate desktop subcategories (for desktop view)
    subCategoriesList.innerHTML = subCategories.map(subCat => {
        const formattedName = subCat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `<button class="subcategory-btn" data-subcategory="${subCat}">${formattedName}</button>`;
    }).join('');


    subCategoriesList.querySelectorAll('.subcategory-btn').forEach(button => {
        button.addEventListener('click', () => {
            const currentActive = subCategoriesList.querySelector('.subcategory-btn.active');
            if (currentActive === button) {
                button.classList.remove('active');
            } else {
                currentActive?.classList.remove('active');
                button.classList.add('active');
            }
            filterAndDisplayVenues();
        });
    });

    // Update mobile subcategory dropdown
    const subcategoryContainer = document.querySelector('#sub-categories-container');
    const mobileSubcategoryDropdownElement = document.querySelector('.venue-subcategory-dropdown');
    
    console.log('Updating subcategory dropdown for category:', mainCategory);
    console.log('Subcategories found:', subCategories);
    console.log('Mobile subcategory element found:', !!mobileSubcategoryDropdownElement);
    
    // Update mobile subcategory dropdown
    if (window.subcategoryDropdownFunctions && subCategories.length > 0) {
        const allSubcategories = ['all', ...subCategories];
        window.subcategoryDropdownFunctions.updateSubcategoryDropdown(allSubcategories, 'all');
        
        // Show mobile subcategory dropdown
        if (mobileSubcategoryDropdownElement) {
            mobileSubcategoryDropdownElement.style.display = 'block';
            mobileSubcategoryDropdownElement.classList.add('visible');
            console.log('Subcategory dropdown shown for category:', mainCategory);
            console.log('Available subcategories:', subCategories);
        }
    } else {
        // Hide mobile subcategory dropdown when no subcategories
        if (mobileSubcategoryDropdownElement) {
            mobileSubcategoryDropdownElement.style.display = 'none';
            mobileSubcategoryDropdownElement.classList.remove('visible');
            console.log('Subcategory dropdown hidden - no subcategories available');
        }
    }
}

// --- SMART ROTATION LOGIC ---
function getSmartCategoryOrder() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Define category priorities based on time and day
    const timeBasedPriorities = {
        morning: ['coffee-cafes', 'food-dining', 'health-medical', 'services', 'adventure-sports', 'nightlife-entertainment', 'recreation-tours'],
        lunch: ['food-dining', 'coffee-cafes', 'recreation-tours', 'adventure-sports', 'services', 'health-medical', 'nightlife-entertainment'],
        afternoon: ['adventure-sports', 'recreation-tours', 'coffee-cafes', 'food-dining', 'services', 'health-medical', 'nightlife-entertainment'],
        evening: ['nightlife-entertainment', 'food-dining', 'coffee-cafes', 'recreation-tours', 'adventure-sports', 'services', 'health-medical'],
        lateNight: ['nightlife-entertainment', 'food-dining', 'adventure-sports', 'coffee-cafes', 'recreation-tours', 'services', 'health-medical']
    };
    
    const weekendAdjustments = {
        'recreation-tours': 2, // Boost recreation on weekends
        'adventure-sports': 1, // Boost adventure on weekends
        'nightlife-entertainment': 1, // Boost nightlife on weekends
        'services': -2, // Lower services on weekends
        'health-medical': -1 // Lower medical on weekends
    };
    
    // Determine time period
    let timePeriod;
    if (hour >= 6 && hour < 11) {
        timePeriod = 'morning';
    } else if (hour >= 11 && hour < 14) {
        timePeriod = 'lunch';
    } else if (hour >= 14 && hour < 18) {
        timePeriod = 'afternoon';
    } else if (hour >= 18 && hour < 23) {
        timePeriod = 'evening';
    } else {
        timePeriod = 'lateNight';
    }
    
    let categoryOrder = [...timeBasedPriorities[timePeriod]];
    
    // Apply weekend adjustments (Friday, Saturday, Sunday)
    if (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) {
        const categoryScores = {};
        categoryOrder.forEach((category, index) => {
            categoryScores[category] = categoryOrder.length - index + (weekendAdjustments[category] || 0);
        });
        
        categoryOrder = Object.keys(categoryScores).sort((a, b) => categoryScores[b] - categoryScores[a]);
    }
    
    return categoryOrder;
}

function categorizeVenueForRotation(venue) {
    const types = Array.isArray(venue.type?.en) ? venue.type.en : [venue.type?.en];
    
    // Check for services (including pet services) - HIGHER PRIORITY
    if (types.some(type => ['rent-a-car', 'rent-a-scooter', 'rent-a-bike', 'rent', 'transport', 'pet-shop', 'grooming', 'vet'].includes(type))) {
        return 'services';
    }
    
    // Check for health & medical (human health only)
    if (types.some(type => ['hospital', 'medical', 'dental', 'dentist', 'pharmacy'].includes(type))) {
        return 'health-medical';
    }
    
    // Check for adventure & sports
    if (types.some(type => ['atv', 'diving', 'sup', 'sports', 'gym', 'kayaking', 'hiking', 'camping', 'paragliding', 'golf'].includes(type))) {
        return 'adventure-sports';
    }
    
    // Check for recreation & tours
    if (types.some(type => ['cruises', 'beach'].includes(type))) {
        return 'recreation-tours';
    }
    
    // Check for nightlife & entertainment (including mixed venues with club/pub/bar)
    if (types.some(type => ['pub', 'club', 'bar'].includes(type))) {
        return 'nightlife-entertainment';
    }
    
    // Check for coffee & cafés (pure coffee shops, not mixed with nightlife)
    if (types.includes('coffee') && !types.some(type => ['club', 'pub', 'bar'].includes(type))) {
        return 'coffee-cafes';
    }
    
    // Check for food & dining
    if (types.some(type => ['restaurant', 'pizza', 'fast-food'].includes(type))) {
        return 'food-dining';
    }
    
    // Mixed categories - classify by primary type
    if (types.includes('restaurant') || types.includes('pizza') || types.includes('fast-food')) {
        return 'food-dining';
    }
    if (types.includes('coffee')) {
        return 'coffee-cafes';
    }
    if (types.includes('club') || types.includes('pub') || types.includes('bar')) {
        return 'nightlife-entertainment';
    }
    
    // Default fallback
    return 'food-dining';
}

function applySmartRotationToVenues(venues) {
    const categoryOrder = getSmartCategoryOrder();
    const categorizedVenues = {};
    
    // Categorize all venues
    venues.forEach(venue => {
        const category = categorizeVenueForRotation(venue);
        if (!categorizedVenues[category]) {
            categorizedVenues[category] = [];
        }
        categorizedVenues[category].push(venue);
    });
    
    // Sort venues within each category alphabetically
    Object.keys(categorizedVenues).forEach(category => {
        categorizedVenues[category].sort((a, b) => {
            const nameA = a.name?.en || 'Unnamed Venue';
            const nameB = b.name?.en || 'Unnamed Venue';
            return nameA.localeCompare(nameB);
        });
    });
    
    // Rebuild venues array based on smart category order
    const rotatedVenues = [];
    categoryOrder.forEach(category => {
        if (categorizedVenues[category]) {
            rotatedVenues.push(...categorizedVenues[category]);
        }
    });
    
    // Add any remaining categories not in the order
    Object.keys(categorizedVenues).forEach(category => {
        if (!categoryOrder.includes(category)) {
            rotatedVenues.push(...categorizedVenues[category]);
        }
    });
    
    return rotatedVenues;
}

function filterAndDisplayVenues() {
    const activeMainCategory = document.querySelector('.category-btn.active')?.dataset.category || 'All';
    const activeSubCategory = document.querySelector('.subcategory-btn.active')?.dataset.subcategory;
    
    // Show loading state for venue filtering
    showVenueLoadingState();
    
    // Add small delay for smooth UX
    setTimeout(() => {
        performVenueFiltering(activeMainCategory, activeSubCategory);
    }, 150);
}

function performVenueFiltering(activeMainCategory, activeSubCategory) {
    let filteredVenues;

    if (activeMainCategory === 'Popular') {
        // Special logic for 'Popular' category
        filteredVenues = venuesData.filter(v => v.tags?.includes('popular'));

        // Calculate average rating for each venue
        filteredVenues.forEach(venue => {
            const ratings = venueRatings[venue.id] || [];
            const ratingCount = ratings.length;
            venue.calculatedRating = ratingCount > 0 ? ratings.reduce((a, b) => a + b, 0) / ratingCount : 0;
        });

        // Sort by calculated rating, descending
        filteredVenues.sort((a, b) => b.calculatedRating - a.calculatedRating);
        
    } else {
        // Original logic for all other categories
        if (activeMainCategory === 'All') {
            filteredVenues = venuesData;
        } else {
            let subTypes = [];
            if (mainCategoryConfig[activeMainCategory]) {
                subTypes = mainCategoryConfig[activeMainCategory].subcategories;
            }
    
            filteredVenues = venuesData.filter(venue => {
                const venueType = venue.type?.en;
                if (!venueType) return false;
                
                const types = Array.isArray(venueType) ? venueType : [venueType];
                return types.some(t => subTypes.includes(t.toLowerCase()));
            });
        }
    
        if (activeSubCategory) {
            filteredVenues = filteredVenues.filter(venue => {
                const venueType = venue.type?.en;
                if (!venueType) return false;
    
                const types = Array.isArray(venueType) ? venueType : [venueType];
                return types.includes(activeSubCategory);
            });
        }
    }
    
    // Server-side shuffling is now handled in the API, so we respect the order
    // Only apply client-side sorting for specific category views when needed
    if (activeMainCategory === 'Popular') {
        // Popular venues are already sorted by rating in performVenueFiltering
        populateAllVenuesSlider(filteredVenues);
    } else {
        // For all other categories, use the server-provided order (which is shuffled)
        populateAllVenuesSlider(filteredVenues);
    }
    
    // Hide loading state
    hideVenueLoadingState();
}

// Loading state functions for better UX
function showVenueLoadingState() {
    const sliderContainer = document.getElementById('all-venues-slider');
    if (!sliderContainer) return;
    
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.id = 'venue-loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-dots">
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
        </div>
    `;
    
    sliderContainer.style.position = 'relative';
    sliderContainer.appendChild(loadingOverlay);
}

function hideVenueLoadingState() {
    const loadingOverlay = document.getElementById('venue-loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

// Enhanced modal loading with better UX
function showModalLoadingState(modalContent) {
    if (!modalContent) return;
    
    modalContent.innerHTML = `
        <div class="loading-overlay" style="position: static; background: transparent;">
            <div style="text-align: center; padding: 3rem;">
                <div class="loading-spinner-modern"></div>
                <p style="margin-top: 1rem; color: var(--muted-foreground);">Loading details...</p>
            </div>
        </div>
    `;
}

function populateAllVenuesSlider(venues) {
    const sliderContainer = document.getElementById('all-venues-slider');
    const arrows = {
        left: document.querySelector('#all-venues-arrow-left'),
        right: document.querySelector('#all-venues-arrow-right')
    };

    if (!sliderContainer) return;

    // The createSlider function will now handle destroying previous instances
    if (sliders.allVenues) {
        sliders.allVenues.destroy();
        delete sliders.allVenues;
    }

    // Reset container classes
    sliderContainer.className = '';
    sliderContainer.classList.add('all-venues-slider-wrapper');


    if (venues.length === 0) {
        sliderContainer.innerHTML = '<p class="no-venues-message">No venues match the current filters.</p>';
        if (arrows.left) arrows.left.style.display = 'none';
        if (arrows.right) arrows.right.style.display = 'none';
        return;
    }
    
    // If only one venue, display it as a static, centered card
    if (venues.length === 1) {
        sliderContainer.classList.add('single-item-container');
        sliderContainer.innerHTML = venues.map(renderVenueCard).join('');
        if (arrows.left) arrows.left.style.display = 'none';
        if (arrows.right) arrows.right.style.display = 'none';
        // Images now load directly, no lazy loading needed
        return;
    }
    
    // For multiple venues, initialize the slider
    sliderContainer.classList.add('keen-slider');
    sliderContainer.innerHTML = venues.map(renderVenueCard).join('');

    // Initialize image fitting for smart aspect ratio handling
    setTimeout(() => initializeImageFitting(), 100);

    createSlider(sliderContainer, {
        loop: false,
        slides: { perView: 'auto', spacing: 15 },
        breakpoints: {
             '(min-width: 1200px)': {
                slides: { perView: 'auto', spacing: 20 },
            }
        },
        slideChanged(s) {
            updateAllVenuesArrows(s);
        },
        created(s) {
            updateAllVenuesArrows(s);
        }
    }, 'allVenues');

    document.querySelector('#all-venues-arrow-left')?.addEventListener('click', () => sliders.allVenues?.prev());
    document.querySelector('#all-venues-arrow-right')?.addEventListener('click', () => sliders.allVenues?.next());

    // Images now load directly, no lazy loading needed
}

function updateAllVenuesArrows(sliderInstance) {
    if (!sliderInstance) return;
    
    const leftArrow = document.getElementById('all-venues-arrow-left');
    const rightArrow = document.getElementById('all-venues-arrow-right');
    
    if (!leftArrow || !rightArrow) return;
    
    const { slides } = sliderInstance.track.details;
    const currentSlide = sliderInstance.track.details.rel;
    const slidesLength = slides.length;
    
    // Show arrows if there are more slides than visible
    if (slidesLength > 1) {
        leftArrow.style.display = 'flex';
        rightArrow.style.display = 'flex';
        
        // Disable/enable arrows based on position
        leftArrow.disabled = currentSlide === 0;
        rightArrow.disabled = currentSlide >= slidesLength - 1;
    } else {
        leftArrow.style.display = 'none';
        rightArrow.style.display = 'none';
    }
}

function initializeHeroSlider() {
    const heroSlider = document.querySelector('#hero-slider');
    if (!heroSlider) return;

    // Populate with random churches first
    populateHeroWithChurches();

    let timeout;

    const keenSlider = createSlider('#hero-slider', {
        loop: true,
        duration: 1000,
        dragStart: () => { clearTimeout(timeout); },
        dragEnd: () => { timeout = nextTimeout(keenSlider); },
        slideChanged(s) {
            updateDots(s);
        },
        created(s) {
            updateDots(s);
            s.container.addEventListener("mouseover", () => {
                clearTimeout(timeout);
            });
            s.container.addEventListener("mouseout", () => {
                timeout = nextTimeout(s);
            });
            timeout = nextTimeout(s);
        }
    }, 'hero');

    function nextTimeout(s) {
        return setTimeout(() => {
            s.next();
        }, 4000);
    };

    function updateDots(s) {
        const dotsContainer = document.querySelector(".hero-slider-dots");
        if (!dotsContainer) return;

        dotsContainer.innerHTML = "";
        const slides = s.track.details.slides;
        slides.forEach((_slide, idx) => {
            const dot = document.createElement("button");
            dot.classList.add("dot");
            if (idx === s.track.details.rel) {
                dot.classList.add("active");
            }
            dot.addEventListener("click", () => {
                s.moveToIdx(idx);
            });
            dotsContainer.appendChild(dot);
        });
    }
}

function populateHeroWithChurches() {
    const heroSlider = document.querySelector('#hero-slider');
    if (!heroSlider || !churchesData || churchesData.length === 0) return;

    // Get 3 random churches
    const randomChurches = getRandomChurches(3);
    
    // Clear existing slides
    heroSlider.innerHTML = '';
    
    // Create slides for each church
    randomChurches.forEach(church => {
        const slide = createChurchSlide(church);
        heroSlider.appendChild(slide);
    });
}

function getRandomChurches(count = 3) {
    if (!churchesData || churchesData.length === 0) return [];
    
    // Create a copy of the array and shuffle it
    const shuffled = [...churchesData].sort(() => 0.5 - Math.random());
    
    // Return the requested number of churches
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

function createChurchSlide(church) {
    const slide = document.createElement('div');
    slide.className = 'keen-slider__slide hero-slide church-slide';
    
    // Get the first image from the church gallery with better fallback handling
    let imageUrl = 'images/placeholder.jpg';
    if (church.gallery && church.gallery.length > 0) {
        imageUrl = church.gallery[0];
        // Ensure the image path is correct
        if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
            imageUrl = imageUrl.startsWith('churces/') ? imageUrl : imageUrl;
        }
    }
    
    slide.innerHTML = `
        <a href="churches.html?id=${church.id}" class="church-slide-link">
            <div class="church-slide-image-container">
                <img src="${imageUrl}" 
                     alt="${church.name}" 
                     loading="lazy" 
                     class="church-slide-image"
                     onerror="this.style.display='none'; this.parentNode.style.background='linear-gradient(135deg, #8B4513 0%, #A0522D 100%)'; this.parentNode.innerHTML += '<div style=\\'color: white; display: flex; align-items: center; justify-content: center; height: 100%; font-size: 3rem;\\'>⛪</div>';">
                <div class="church-slide-overlay"></div>
            </div>
            <div class="church-slide-content">
                <div class="church-slide-category">${getCategoryDisplayName(church.category)}</div>
                <h3 class="church-slide-title">${church.name}</h3>
                <p class="church-slide-period">${church.period}</p>
                <p class="church-slide-description">${church.short_description}</p>
                <div class="church-slide-button">
                    <span>Explore Church</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </div>
            </div>
        </a>
    `;
    
    return slide;
}

function getCategoryDisplayName(category) {
    const categoryMap = {
        'iconic': '⛪ Iconic Church',
        'major': '🏛️ Major Historic Site',
        'historic': '📿 Historic Church',
        'monastery': '🕊️ Monastery'
    };
    return categoryMap[category] || '⛪ Church';
}

// --- MODAL ---
function openVenueModal(venueId) {
    const venue = venuesData.find(v => v.id == venueId);
    if (!venue) {
        console.error('Venue not found for ID:', venueId);
        return;
    }
    
    const modal = document.getElementById('venue-modal');
    if (!modal) {
        console.error('Venue modal element not found in DOM.');
        return;
    }

    // Check if modal is already open
    if (!modal.classList.contains('hidden')) {
        console.log('Modal is already open');
        return;
    }
    
    // Show modal immediately and populate content
    modal.classList.remove('hidden');
    
    // Directly populate the modal without loading state delay
    populateVenueModal(venue, modal);
    
    // Initialize share button functionality
    initializeVenueShareButton(venue);
}

function populateVenueModal(venue, modal) {
    generateVenueSchema(venue);

    // --- Safely populate modal elements ---
    const name = venue.name?.en || venue.name || 'Unnamed Venue';
    const type = venue.type?.en || venue.type || 'No type specified';
    const description = venue.description?.en || venue.description || 'No description available.';
    const imageUrl = venue.imageUrl ? 
        (venue.imageUrl.startsWith('http') ? venue.imageUrl : (venue.imageUrl.startsWith('/') ? venue.imageUrl : `/${venue.imageUrl}`)) : 
        'https://via.placeholder.com/400x280/f8fafc/94a3b8?text=No+Image';
    
    console.log('Loading enhanced venue modal for:', name);
    
    // Get category icon
    const categoryIcon = getVenueCategoryIcon(venue.type);
    
    // Populate main image
    const modalImage = document.getElementById('modal-venue-image');
    if (modalImage) {
        modalImage.src = imageUrl;
        modalImage.alt = name;
    }
    
    // Populate category icon
    const modalCategoryIcon = document.getElementById('modal-category-icon');
    if (modalCategoryIcon) {
        modalCategoryIcon.textContent = categoryIcon;
    }
    
    // Populate venue name and type
    const modalVenueName = document.getElementById('modal-venue-name');
    if (modalVenueName) {
        modalVenueName.textContent = name;
    }
    
    const modalVenueType = document.getElementById('modal-venue-type');
    if (modalVenueType) {
        const typeString = Array.isArray(type) ? type.join(', ') : type;
        modalVenueType.textContent = typeof typeString === 'string' ? 
            typeString.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
            typeString;
    }
    
    // Populate description with read more functionality
    const modalDescription = document.getElementById('modal-venue-description');
    const readMoreBtn = document.getElementById('read-more-btn');
    if (modalDescription && readMoreBtn) {
        modalDescription.textContent = description;
        
        // Check if description is long enough to need "Read More"
        const descriptionElement = modalDescription.parentElement;
        if (description.length > 200) {
            readMoreBtn.classList.remove('hidden');
            readMoreBtn.addEventListener('click', () => {
                descriptionElement.classList.toggle('expanded');
                readMoreBtn.textContent = descriptionElement.classList.contains('expanded') ? 'Read Less' : 'Read More';
            });
        } else {
            readMoreBtn.classList.add('hidden');
        }
    }
    
    // Populate rating
    populateVenueRating(venue);
    
    // Populate tags
    populateVenueTags(venue);
    
    // Populate details grid
    populateVenueDetails(venue);
    
    // Populate opening hours
    populateVenueHours(venue);
    
    // Populate gallery
    populateVenueGallery(venue);
    
    // Populate events (if any)
    populateVenueEvents(venue);
    
    // Setup mobile action bar
    setupMobileActionBar(venue);
}

// --- ENHANCED MODAL HELPER FUNCTIONS ---

function populateVenueRating(venue) {
    const ratingContainer = document.getElementById('modal-rating-container');
    if (!ratingContainer) return;
    
    const ratings = venueRatings[venue.id] || [];
    const ratingCount = ratings.length;
    const rating = ratingCount > 0 ? ratings.reduce((a, b) => a + b, 0) / ratingCount : null;
    
    if (rating && ratingCount > 0) {
        ratingContainer.innerHTML = `
            <div class="venue-rating-display">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span>${rating.toFixed(1)} (${ratingCount} reviews)</span>
            </div>
        `;
    } else {
        ratingContainer.innerHTML = `
            <div class="venue-rating-display">
                <span class="no-rating">No ratings yet</span>
            </div>
        `;
    }
}

function populateVenueTags(venue) {
    const tagsSection = document.getElementById('venue-tags-section');
    if (!tagsSection) return;
    
    // Hide the entire Amenities & Features section to make space for opening hours
    tagsSection.style.display = 'none';
}

function populateVenueDetails(venue) {
    const detailsGrid = document.getElementById('modal-info-grid');
    if (!detailsGrid) return;
    
    let detailsHtml = '';
    
    if (venue.location?.address) {
        detailsHtml += `
            <div class="venue-detail-item">
                <svg class="venue-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <div class="venue-detail-content">
                    <h6>Location</h6>
                    <p>${venue.location.address}</p>
                    ${venue.location.googleMapsUrl ? `<a href="${venue.location.googleMapsUrl}" target="_blank" rel="noopener noreferrer">View on Google Maps</a>` : ''}
                </div>
            </div>
        `;
    }
    
    if (venue.phone) {
        detailsHtml += `
            <div class="venue-detail-item">
                <svg class="venue-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <div class="venue-detail-content">
                    <h6>Phone</h6>
                    <p><a href="tel:${venue.phone}">${venue.phone}</a></p>
                </div>
            </div>
        `;
    }
    
    // Website section removed as requested
    /* if (venue.website || venue.bookingUrl) {
        const websiteUrl = venue.website || venue.bookingUrl;
        detailsHtml += `
            <div class="venue-detail-item">
                <svg class="venue-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                </svg>
                <div class="venue-detail-content">
                    <h6>Website</h6>
                    <p><a href="${websiteUrl}" target="_blank" rel="noopener noreferrer">Visit Website</a></p>
                </div>
            </div>
        `;
    } */
    
    detailsGrid.innerHTML = detailsHtml;
}

function populateVenueHours(venue) {
    const hoursSection = document.getElementById('venue-hours-section');
    if (!hoursSection) return;
    
    if (!venue.workingHours) {
        hoursSection.style.display = 'none';
        return;
    }
    
    // Simple hours display 
    hoursSection.innerHTML = `
        <h5 class="section-title">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Opening Hours
        </h5>
        <div class="venue-hours-grid">
            <div class="hours-day">
                <span class="hours-day-time">${venue.workingHours}</span>
            </div>
        </div>
    `;
    hoursSection.style.display = 'block';
}

function populateVenueGallery(venue) {
    const galleryGrid = document.getElementById('modal-gallery-grid');
    const galleryContainer = document.getElementById('modal-gallery-container');
    if (!galleryGrid || !galleryContainer) return;
    
    const gallery = venue.gallery || [];
    
    if (gallery.length > 0) {
        galleryGrid.innerHTML = gallery.slice(0, 6).map((image, index) => `
            <div class="gallery-thumbnail" onclick="openImageModal('${image.url}', '${image.alt || venue.name}')">
                <img src="${image.url}" alt="${image.alt || venue.name}" loading="lazy">
            </div>
        `).join('');
        galleryContainer.style.display = 'block';
    } else {
        galleryContainer.style.display = 'none';
    }
}

function populateVenueEvents(venue) {
    const eventsSection = document.getElementById('venue-events-section');
    if (!eventsSection) return;
    
    // Find events for this venue
    const venueEvents = eventsListData?.filter(event => event.venueId === venue.id) || [];
    const upcomingEvents = venueEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= new Date();
    }).slice(0, 3);
    
    if (upcomingEvents.length > 0) {
        const eventsHtml = upcomingEvents.map(event => `
            <div class="venue-event-item" onclick="openEventModal(${event.id})">
                <div class="event-date">
                    <div>${new Date(event.date).getDate()}</div>
                    <div>${new Date(event.date).toLocaleDateString('en', { month: 'short' })}</div>
                </div>
                <div class="event-info">
                    <h6>${event.eventName || event.name}</h6>
                    <p>${event.startTime || 'All Day'}</p>
                </div>
            </div>
        `).join('');
        
        document.getElementById('venue-events-list').innerHTML = eventsHtml;
        eventsSection.classList.remove('hidden');
    } else {
        eventsSection.classList.add('hidden');
    }
}

function setupMobileActionBar(venue) {
    // Mobile action bar completely disabled to fix scrolling issues
    const actionBar = document.getElementById('mobile-action-bar');
    if (actionBar) {
        actionBar.style.display = 'none';
    }
}

function openImageModal(imageSrc, imageAlt) {
    const imageModal = document.getElementById('image-modal');
    const imageModalImg = document.getElementById('image-modal-img');
    
    if (imageModal && imageModalImg) {
        imageModalImg.src = imageSrc;
        imageModalImg.alt = imageAlt;
        imageModal.classList.remove('hidden');
    }
}

// Enhanced venue modal implementation completed successfully!

// Make openVenueModal globally accessible for inline onclick handlers
window.openVenueModal = openVenueModal;

function closeVenueModal() {
    const modal = document.getElementById('venue-modal');
    if (modal) {
        modal.classList.add('hidden');
        
        // Restore scroll position
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
        
        // Remove the schema script when the modal is closed
        const venueSchema = document.getElementById('venue-schema');
        if (venueSchema) {
            venueSchema.remove();
        }
        
        // Clean up URL parameters
        const url = new URL(window.location);
        url.searchParams.delete('venue');
        window.history.pushState({}, document.title, url);
    }
}

// Make closeVenueModal globally accessible as well
window.closeVenueModal = closeVenueModal;

function openEventModal(eventId) {
    const event = eventsListData.find(e => e.id == eventId);
    if (!event) return;

    generateEventSchema(event); // Generate Schema.org data

    const modal = document.getElementById('event-detail-modal');
    if (!modal) return;

    // Store current event ID for sharing
    modal.dataset.eventId = eventId;

    // Populate event image and date badge
    const eventImageEl = modal.querySelector('#modal-event-image');
    const dayEl = modal.querySelector('#modal-event-day');
    const monthEl = modal.querySelector('#modal-event-month');
    const categoryIconEl = modal.querySelector('#modal-event-category-icon');
    const categoryEl = modal.querySelector('#modal-event-category');

    if (event.imageUrl && eventImageEl) {
        eventImageEl.src = event.imageUrl;
        eventImageEl.alt = event.eventName;
        eventImageEl.style.display = 'block';
        eventImageEl.style.cursor = 'pointer';

        // Add click listener to open image in fullscreen
        eventImageEl.onclick = () => {
            const imageModal = document.getElementById('image-modal');
            const modalImageContent = document.getElementById('image-modal-img');
            if (imageModal && modalImageContent) {
                modalImageContent.src = eventImageEl.src;
                imageModal.classList.remove('hidden');
            }
        };
    }

    // Populate date badge
    if (event.isoDate && dayEl && monthEl) {
        const date = new Date(event.isoDate);
        dayEl.textContent = date.getDate();
        monthEl.textContent = date.toLocaleDateString('en', { month: 'short' });
    }

    // Populate category badge
    if (categoryIconEl && categoryEl) {
        categoryIconEl.textContent = getCategoryIcon(event.category);
        categoryEl.textContent = event.category;
    }

    // Populate title
    const titleEl = modal.querySelector('#modal-event-name');
    if (titleEl) {
        titleEl.textContent = event.eventName;
    }

    // Populate quick info
    const timeEl = modal.querySelector('#modal-event-time-text');
    const venueEl = modal.querySelector('#modal-event-venue-text');
    const ticketEl = modal.querySelector('#modal-event-ticket');
    const ticketPriceEl = modal.querySelector('#modal-event-ticket-price');

    if (timeEl) {
        const date = new Date(event.isoDate);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const dateString = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        timeEl.textContent = `${dayName}, ${dateString} at ${event.startTime || 'All Day'}`;
    }

    if (venueEl) {
        const venue = venuesData.find(v => v.id === event.venueId);
        venueEl.textContent = venue?.name?.en || venue?.name || event.locationName || 'TBA';
    }

    if (event.ticketPrice && ticketEl && ticketPriceEl) {
        ticketPriceEl.textContent = event.ticketPrice;
        ticketEl.style.display = 'flex';
    } else if (ticketEl) {
        ticketEl.style.display = 'none';
    }

    // Populate description
    const descriptionEl = modal.querySelector('#modal-event-description');
    if (descriptionEl) {
        const description = event.longDescription || event.description || 'No description available.';
        descriptionEl.innerHTML = description.replace(/\n/g, '<br>');
    }

    // Populate location details
    const venueNameEl = modal.querySelector('#modal-event-venue-name');
    const venueAddressEl = modal.querySelector('#modal-event-venue-address');
    const mapContainer = modal.querySelector('#modal-event-location-map');

    if (venueNameEl) {
        const venue = venuesData.find(v => v.id === event.venueId);
        venueNameEl.textContent = venue?.name?.en || venue?.name || event.locationName || 'Event Location';
    }

    if (venueAddressEl) {
        const venue = venuesData.find(v => v.id === event.venueId);
        venueAddressEl.textContent = venue?.location?.address || 'Address not specified';
    }

    // Populate map
    if (mapContainer) {
        const venue = venuesData.find(v => v.id === event.venueId);
        let iframe = null;
        
        if (venue && venue.location && venue.location.mapIframe) {
            iframe = venue.location.mapIframe;
        } else if (event.locationIframe) {
            iframe = event.locationIframe;
        } else if (event.mapIframe) {
            iframe = event.mapIframe;
        }

        if (iframe) {
            mapContainer.innerHTML = iframe;
            mapContainer.style.display = 'block';
        } else {
            mapContainer.style.display = 'none';
        }
    }

    // Handle gallery if available
    const gallerySection = modal.querySelector('#event-gallery-section');
    const galleryGrid = modal.querySelector('#event-gallery-grid');
    
    if (event.gallery && event.gallery.length > 0 && gallerySection && galleryGrid) {
        const galleryHTML = event.gallery.map(imageUrl => `
            <div class="event-gallery-item" onclick="openImageModal('${imageUrl}')">
                <img src="${imageUrl}" alt="Event gallery image" loading="lazy">
            </div>
        `).join('');
        
        galleryGrid.innerHTML = galleryHTML;
        gallerySection.style.display = 'block';
    } else if (gallerySection) {
        gallerySection.style.display = 'none';
    }

    // Setup action buttons
    setupEventModalActions(event);

    // Store current scroll position and prevent body scroll
    const scrollY = window.scrollY;
    document.body.style.top = `-${scrollY}px`;
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    
    modal.classList.remove('hidden');
    
    // Ensure modal is centered in viewport
    modal.scrollTop = 0;
}

// Helper function to setup event modal action buttons
function setupEventModalActions(event) {
    const plannerBtn = document.getElementById('event-planner-btn');
    const contactBtn = document.getElementById('event-contact-btn');
    const shareBtn = document.getElementById('event-share-btn');
    const directionsBtn = document.getElementById('event-directions-btn');

    // Add to planner functionality
    if (plannerBtn) {
        plannerBtn.onclick = () => {
            // Implement add to planner functionality
            console.log('Add to planner:', event.eventName);
            plannerBtn.innerHTML = `
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Added to Planner
            `;
            plannerBtn.disabled = true;
            setTimeout(() => {
                plannerBtn.innerHTML = `
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Add to My Planner
                `;
                plannerBtn.disabled = false;
            }, 2000);
        };
    }

    // Contact organizer functionality
    if (contactBtn) {
        if (event.eventContact) {
            contactBtn.onclick = () => window.open(`tel:${event.eventContact}`, '_self');
            contactBtn.style.display = 'flex';
        } else {
            contactBtn.style.display = 'none';
        }
    }

    // Share event functionality
    if (shareBtn) {
        shareBtn.onclick = () => {
            // Implement share functionality
            if (navigator.share) {
                navigator.share({
                    title: event.eventName,
                    text: event.description,
                    url: window.location.href
                });
            } else {
                // Fallback to copy URL
                const url = `${window.location.origin}${window.location.pathname}?event=${event.id}`;
                navigator.clipboard.writeText(url).then(() => {
                    shareBtn.innerHTML = `
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Link Copied!
                    `;
                    setTimeout(() => {
                        shareBtn.innerHTML = `
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                            </svg>
                            Share Event
                        `;
                    }, 2000);
                });
            }
        };
    }

    // Get directions functionality
    if (directionsBtn) {
        directionsBtn.onclick = () => {
            const venue = venuesData.find(v => v.id === event.venueId);
            if (venue && venue.location && venue.location.googleMapsUrl) {
                window.open(venue.location.googleMapsUrl, '_blank');
            } else if (event.locationName) {
                const query = encodeURIComponent(event.locationName + ', Ohrid');
                window.open(`https://www.google.com/maps/search/${query}`, '_blank');
            }
        };
    }
}

// Helper function to open image modal
function openImageModal(imageUrl) {
    const imageModal = document.getElementById('image-modal');
    const modalImageContent = document.getElementById('image-modal-img');
    if (imageModal && modalImageContent) {
        modalImageContent.src = imageUrl;
        imageModal.classList.remove('hidden');
    }
}

// Helper function to open directions
function openDirections(locationName) {
    const query = encodeURIComponent(locationName + ', Ohrid');
    window.open(`https://www.google.com/maps/search/${query}`, '_blank');
}

// Helper function to share event
function shareEvent(eventName, description, eventId) {
    if (navigator.share) {
        navigator.share({
            title: eventName,
            text: description,
            url: window.location.href
        });
    } else {
        // Fallback to copy URL
        const url = `${window.location.origin}${window.location.pathname}?event=${eventId}`;
        navigator.clipboard.writeText(url).then(() => {
            // Show temporary feedback
            const button = event.target.closest('button');
            const originalHTML = button.innerHTML;
            button.innerHTML = `
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Link Copied!
            `;
            setTimeout(() => {
                button.innerHTML = originalHTML;
            }, 2000);
        });
    }
}

// Make these functions globally accessible
window.openDirections = openDirections;
window.shareEvent = shareEvent;

function closeEventModal() {
    const modal = document.getElementById('event-detail-modal');
    if (modal) {
        modal.classList.add('hidden');
        
        // Restore scroll position
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);

        // Remove the event schema script
        const eventSchema = document.getElementById('event-schema');
        if (eventSchema) {
            eventSchema.remove();
        }
    }
}

function shareCurrentEvent() {
    const modal = document.getElementById('event-detail-modal');
    const eventId = modal?.dataset.eventId;
    
    if (!eventId) {
        console.error('No event ID found for sharing');
        return;
    }
    
    const event = eventsListData.find(e => e.id == eventId);
    if (!event) {
        console.error('Event not found for sharing:', eventId);
        return;
    }
    
    const eventUrl = `${window.location.origin}/events/${eventId}`;
    const eventTitle = event.eventName || 'Event';
    const shareBtn = document.getElementById('modal-event-share-btn');
    
    // Always copy to clipboard directly - no native share dialog
    navigator.clipboard.writeText(eventUrl).then(() => {
        showEventNotification('Event link copied to clipboard!');
        
        // Add visual feedback
        if (shareBtn) {
            shareBtn.classList.add('copied');
            setTimeout(() => {
                shareBtn.classList.remove('copied');
            }, 2000);
        }
    }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback to showing the URL
        prompt('Copy this link to share:', eventUrl);
    });
}

function showEventNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ================================================================================================
// --- SHARED PLANNER DATA ACCESS ---
// ================================================================================================

// Simple function to get planner data for calendar display
function getPlannerData() {
    return JSON.parse(localStorage.getItem('ohridHubPlanner')) || {};
}


// ================================================================================================
// --- END OF SHARED PLANNER DATA ACCESS ---
// ================================================================================================


// --- CALENDAR & EVENTS (MAIN PAGE) ---
function initializeCalendar() {
    const calendarContainer = document.getElementById('calendar-container');
    if (!calendarContainer) return;

    // Safety check: ensure eventsListData is loaded
    if (!eventsListData || eventsListData.length === 0) {
        return;
    }

    const eventDates = new Set(eventsListData.map(e => e.isoDate));
    let currentDate = new Date();
    let selectedDate = new Date();

    // Initialize the calendar
    renderCalendar();
    
    // Set up event listeners
    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Update month/year display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        document.getElementById('current-month-year').textContent = `${monthNames[month]} ${year}`;
        
        // Clear previous days
        const calendarDays = document.getElementById('calendar-days');
        calendarDays.innerHTML = '';
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        // Generate 6 weeks of days
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            dayElement.textContent = date.getDate();
            
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            // Add classes based on date status
            if (date.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }
            
            if (isToday(date)) {
                dayElement.classList.add('today');
            }
            
            if (isSameDate(date, selectedDate)) {
                dayElement.classList.add('selected');
            }
            
            if (eventDates.has(dateStr)) {
                dayElement.classList.add('has-events');
            }
            
            const plannerData = getPlannerData();
            if (plannerData[dateStr] && plannerData[dateStr].length > 0) {
                dayElement.classList.add('has-plan');
            }
            
            // Add click handler
            dayElement.addEventListener('click', () => {
                // Remove previous selection
                document.querySelectorAll('.calendar-day.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                
                // Add selection to clicked day
                dayElement.classList.add('selected');
                selectedDate = new Date(date);
                
                // Update events for selected date
                renderEventsForDate(dateStr);
            });
            
            calendarDays.appendChild(dayElement);
        }
    }
    
    function isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }
    
    function isSameDate(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }
    
    // Initialize with today's events
    const todayStr = new Date().toISOString().split('T')[0];
    renderEventsForDate(todayStr);
}

function renderEventsForDate(dateStr) {
    const listElement = document.getElementById('daily-events-list');
    const headerElement = document.getElementById('daily-events-header');
    if (!listElement || !headerElement) return;

    // Format the date for the header
    const date = new Date(dateStr);
    const headerText = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
    headerElement.innerHTML = `<h3 class="card-header">Events for ${headerText}</h3>`;

    const eventsForDate = eventsListData.filter(event => event.isoDate === dateStr);

    // Sort events by their start time to ensure they are listed chronologically
    eventsForDate.sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

    // Clean up: remove any slider classes and destroy sliders
    listElement.classList.remove('keen-slider');
    if (sliders.dailyEvents) {
        sliders.dailyEvents.destroy();
        delete sliders.dailyEvents;
    }

    // Hide slider arrows (we're not using them anymore)
    const upArrow = document.getElementById('daily-events-arrow-up');
    const downArrow = document.getElementById('daily-events-arrow-down');
    upArrow.style.display = 'none';
    downArrow.style.display = 'none';

    if (eventsForDate.length === 0) {
        listElement.innerHTML = '<p class="no-events-message">No events scheduled for this day. Please select another date.</p>';
        return;
    }
    
    // Create container for events and show more button
    const eventsHTML = eventsForDate.map((event, index) => {
        const venue = venuesData.find(v => v.id === event.venueId);
        const venueName = venue?.name?.en || event.locationName || 'To be announced';
        const contactInfo = event.eventContact ? `
            <div class="event-meta-item event-contact">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
                </svg>
                <span>${event.eventContact}</span>
            </div>
        ` : '';

        const ticketInfo = event.ticketPrice ? `
            <div class="event-meta-item event-ticket">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3 0a1 1 0 0 0-1 1v6a.5.5 0 0 0 .5.5 1.5 1.5 0 1 1 0 3A.5.5 0 0 0 2 11v4a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-4a.5.5 0 0 0-.5-.5 1.5 1.5 0 1 1 0-3A.5.5 0 0 0 14 7V1a1 1 0 0 0-1-1H3z"/>
                </svg>
                <span>${event.ticketPrice}</span>
            </div>
        ` : '';

        const isHidden = index >= 3 ? 'style="display: none;"' : '';

        // Get venue and map info
        const eventVenue = venuesData.find(v => v.id === event.venueId);
        const hasMap = eventVenue?.location?.mapIframe || event.mapIframe || event.locationIframe;
        const fullDescription = event.longDescription || event.description || '';
        const date = new Date(event.isoDate);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const dateString = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        return `
            <div class="modern-event-card" data-event-id="${event.id}" ${isHidden} onclick="openEventModal(${event.id})">
                <div class="event-card-image-section">
                    ${event.imageUrl ? `
                        <img src="${event.imageUrl}" alt="${event.eventName}" class="event-card-image" loading="lazy" onload="adjustEventCardHeight(this)">
                    ` : `
                        <div class="event-card-placeholder">
                            <div class="placeholder-icon">${getCategoryIcon(event.category)}</div>
                        </div>
                    `}
                </div>
                
                <div class="event-card-content">
                    <div class="event-card-header">
                        <h3 class="event-title">${event.eventName}</h3>
                        ${event.ticketPrice && event.ticketPrice !== '#' ? `
                            <div class="event-price-tag">
                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M3 0a1 1 0 0 0-1 1v6a.5.5 0 0 0 .5.5 1.5 1.5 0 1 1 0 3A.5.5 0 0 0 2 11v4a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-4a.5.5 0 0 0-.5-.5 1.5 1.5 0 1 1 0-3A.5.5 0 0 0 14 7V1a1 1 0 0 0-1-1H3z"/>
                                </svg>
                                <span>${event.ticketPrice}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="event-card-meta">
                        <div class="event-meta-item">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <span>${date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div class="event-meta-item">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>${event.startTime || 'All Day'}</span>
                        </div>
                        <div class="event-meta-item">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span>${eventVenue?.name?.en || eventVenue?.name || event.locationName || 'TBA'}</span>
                        </div>
                        <div class="event-meta-item">
                            <span class="category-icon">${getCategoryIcon(event.category)}</span>
                            <span>${event.category}</span>
                        </div>
                    </div>
                    

                    
                    <div class="event-card-actions">
                        <button class="event-action-btn primary" onclick="event.stopPropagation(); openEventModal(${event.id})">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            View Details
                        </button>
                        ${event.eventContact ? `
                            <button class="event-action-btn secondary" onclick="event.stopPropagation(); window.open('tel:${event.eventContact}', '_self')">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                </svg>
                                Contact
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Add show more button if there are more than 3 events
    const showMoreButton = eventsForDate.length > 3 ? `
        <div class="show-more-events-container">
            <button class="show-more-events-btn" id="show-more-events-btn">
                <span class="show-more-text">Show ${eventsForDate.length - 3} More Events</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 9l6 6 6-6"/>
                </svg>
            </button>
        </div>
    ` : '';

    listElement.innerHTML = eventsHTML + showMoreButton;

    // Add click listeners to event cards
    listElement.querySelectorAll('.modern-event-card').forEach(card => {
        card.addEventListener('click', () => openEventModal(card.dataset.eventId));
    });

    // Add show more functionality with loading states
    const showMoreBtn = document.getElementById('show-more-events-btn');
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', function() {
            // Add loading state
            this.classList.add('btn-loading');
            this.disabled = true;
            
            const hiddenEvents = listElement.querySelectorAll('.modern-event-card[style*="display: none"]');
            const isExpanded = hiddenEvents.length === 0;
            
            setTimeout(() => {
                if (isExpanded) {
                    // Collapse: hide events beyond first 3
                    const allEvents = listElement.querySelectorAll('.modern-event-card');
                    allEvents.forEach((event, index) => {
                        if (index >= 3) {
                            event.style.opacity = '0';
                            event.style.transform = 'translateY(-10px)';
                            setTimeout(() => {
                                event.style.display = 'none';
                            }, 200);
                        }
                    });
                    this.querySelector('.show-more-text').textContent = `Show ${eventsForDate.length - 3} More Events`;
                    this.querySelector('svg').style.transform = 'rotate(0deg)';
                } else {
                    // Expand: show all events
                    hiddenEvents.forEach((event, index) => {
                        event.style.display = 'block';
                        event.style.opacity = '0';
                        event.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            event.style.opacity = '1';
                            event.style.transform = 'translateY(0)';
                        }, index * 100 + 50);
                    });
                    this.querySelector('.show-more-text').textContent = 'Show Less';
                    this.querySelector('svg').style.transform = 'rotate(180deg)';
                }
                
                // Remove loading state
                setTimeout(() => {
                    this.classList.remove('btn-loading');
                    this.disabled = false;
                }, 400);
            }, 150); // Small delay for better UX feedback
        });
    }
}


// --- RATING & WEATHER (Keep as is) ---
async function submitRating(venueId, rating) {
    if (!venueRatings[venueId]) {
        venueRatings[venueId] = [];
    }
    venueRatings[venueId].push(rating);

    try {
        localStorage.setItem('ohridHubVenueRatings', JSON.stringify(venueRatings));
        
        // --- Live Update Logic ---
        // 1. Update the modal view
        const ratingValueEl = document.querySelector('#modal-rating-value');
        const ratingCountEl = document.querySelector('#modal-rating-count');
        
        const ratings = venueRatings[venueId] || [];
        const ratingCount = ratings.length;
        const averageRating = ratingCount > 0 ? ratings.reduce((a, b) => a + b, 0) / ratingCount : 0;
        
        if (ratingValueEl) ratingValueEl.textContent = averageRating.toFixed(1);
        if (ratingCountEl) ratingCountEl.textContent = `${ratingCount} ${ratingCount === 1 ? 'review' : 'reviews'}`;
        
        // 2. Update the venue card in the background
        const venueCardSlide = document.querySelector(`.keen-slider__slide[data-venue-id="${venueId}"]`);
        const venueData = venuesData.find(v => v.id === venueId);
        if (venueCardSlide && venueData) {
            // Re-render the specific card and replace it in the DOM
            const newCardHTML = renderVenueCard(venueData);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = newCardHTML.trim();
            const newSlide = tempDiv.firstChild;
            
            venueCardSlide.parentNode.replaceChild(newSlide, venueCardSlide);
            // Images now load directly, no lazy loading needed
        }

        Toast.success('Your rating has been saved. Thank you for your feedback!');

    } catch (error) {
        console.error("Failed to save rating to localStorage:", error);
        ErrorHandler.handle(error, 'saving rating');
        // Revert optimistic update if needed
        venueRatings[venueId].pop();
    }
}

function setupRatingStars(venueId) {
    const starsContainer = document.querySelector('.rating-stars');
    if (!starsContainer) return;

    // Clear previous event listeners to avoid multiple submissions
    starsContainer.replaceWith(starsContainer.cloneNode(true));
    const newStarsContainer = document.querySelector('.rating-stars');

    const stars = newStarsContainer.querySelectorAll('span');
    const userRatings = JSON.parse(localStorage.getItem('userRatings')) || {};
    const currentRating = userRatings[venueId];

    const highlightStars = (rating) => {
        stars.forEach(star => {
            star.classList.toggle('selected', star.dataset.value <= rating);
        });
    };

    if (currentRating) {
        highlightStars(currentRating);
    }

    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            if (!newStarsContainer.classList.contains('rated')) {
                highlightStars(star.dataset.value);
            }
        });

        star.addEventListener('mouseout', () => {
            if (!newStarsContainer.classList.contains('rated')) {
                const userRatings = JSON.parse(localStorage.getItem('userRatings')) || {};
                const savedRating = userRatings[venueId];
                highlightStars(savedRating || 0);
            }
        });

        star.addEventListener('click', () => {
            const ratingValue = parseInt(star.dataset.value, 10);
            submitRating(venueId, ratingValue);
            newStarsContainer.classList.add('rated');
            highlightStars(ratingValue);
        });
    });
}

function fetchWeather() {
    const lat = 41.12;
    const lon = 20.80;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            if (data.current_weather) {
                displayWeather(data.current_weather);
            }
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

function displayWeather(weather) {
    const widgetContainer = document.getElementById('weather-widget-container');
    const temp = Math.round(weather.temperature);
    const weatherCode = weather.weathercode;

    const iconSrc = getWeatherIcon(weatherCode);
    const description = getWeatherDescription(weatherCode);

    const weatherWidgetHTML = `
        <div class="weather-widget">
            <img src="${iconSrc}" alt="Weather icon" class="weather-icon" loading="lazy">
            <div class="weather-details">
                <span class="weather-temperature">${temp}°C</span>
                <span class="weather-description">${description}</span>
            </div>
        </div>
    `;

    widgetContainer.innerHTML = weatherWidgetHTML;
}

function getWeatherDescription(code) {
    // WMO Weather interpretation codes
    const descriptions = {
        0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Depositing rime fog',
        51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
        56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
        61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
        66: 'Light freezing rain', 67: 'Heavy freezing rain',
        71: 'Slight snow fall', 73: 'Moderate snow fall', 75: 'Heavy snow fall',
        77: 'Snow grains',
        80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
        85: 'Slight snow showers', 86: 'Heavy snow showers',
        95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
    };
    return descriptions[code] || 'Weather';
}

function getWeatherIcon(code) {
    // Using calendar.svg as a placeholder for all weather conditions
    return 'images_ohrid/icons/calendar.svg';
}

// Function to set up the image modal
function setupImageModalClosers() {
    const imageModal = document.getElementById('image-modal');
    const closeImageModal = document.getElementById('image-modal-close');

    if (!imageModal || !closeImageModal) return;

    // When the user clicks on <span> (x), close the modal
    closeImageModal.onclick = function() {
        imageModal.classList.add('hidden');
    }

    // Also close if the user clicks outside the image
    imageModal.onclick = function(e) {
        if (e.target === imageModal) {
            imageModal.classList.add('hidden');
        }
    }
}

// Instagram Story functionality
let selectedTemplate = 'gradient-1';
let currentEventForStory = null;

function setupInstagramStoryModalListeners() {
    // Modal close button
    const closeBtn = document.getElementById('instagram-story-modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeInstagramStoryModal);
    } else {
        console.error('Close button not found');
    }
    
    // Modal backdrop click
    const modal = document.getElementById('instagram-story-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'instagram-story-modal') {
                closeInstagramStoryModal();
            }
        });
    } else {
        console.error('Instagram story modal not found');
    }
    
    // Template selection
    const templateOptions = document.querySelectorAll('.template-option');
    templateOptions.forEach((option, index) => {
        option.addEventListener('click', () => {
            templateOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedTemplate = option.dataset.template;
            // Update preview for both events and venues
            if (currentEventForStory) {
                updateStoryCardPreview();
            } else if (currentVenueForStory) {
                updateVenueStoryPreview();
            }
        });
    });
    
    // Download button with loading states
    const downloadBtn = document.getElementById('download-story-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            // Add loading state
            this.classList.add('btn-loading');
            this.disabled = true;
            
            // Store original text
            const originalText = this.textContent;
            this.setAttribute('data-original-text', originalText);
            
            try {
                downloadStoryImage();
                
                // Remove loading state after delay (simulate processing time)
                setTimeout(() => {
                    this.classList.remove('btn-loading');
                    this.disabled = false;
                    Toast.success('Instagram story downloaded successfully!', 'Download Complete');
                }, 2000);
                
            } catch (error) {
                console.error('Download error:', error);
                this.classList.remove('btn-loading');
                this.disabled = false;
                Toast.error('Failed to download Instagram story. Please try again.', 'Download Failed');
            }
        });
    } else {
        console.error('Download button not found');
    }
    
    // Open Instagram button
    const instagramBtn = document.getElementById('open-instagram-btn');
    if (instagramBtn) {
        instagramBtn.addEventListener('click', openInstagramApp);
    } else {
        console.error('Instagram button not found');
    }
}

function openInstagramStoryModal() {
    const modal = document.getElementById('event-detail-modal');
    const eventId = modal?.dataset.eventId;
    
    if (!eventId) {
        console.error('No event ID found in modal');
        return;
    }
    
    const event = eventsListData.find(e => e.id == eventId);
    if (!event) {
        console.error('Event not found:', eventId);
        return;
    }
    
    currentEventForStory = event;
    const storyModal = document.getElementById('instagram-story-modal');
    
    if (!storyModal) {
        console.error('Instagram story modal not found');
        return;
    }
    
    updateStoryCardPreview();
    storyModal.classList.add('visible');
    
    // Add body overflow hidden to prevent scrolling
    document.body.style.overflow = 'hidden';
}

function closeInstagramStoryModal() {
    const modal = document.getElementById('instagram-story-modal');
    if (modal) {
        modal.classList.remove('visible');
        // Restore body overflow
        document.body.style.overflow = '';
        
        // Clear current story data
        currentVenueForStory = null;
        // Note: currentEventForStory is managed by existing event functionality
    }
}

function updateStoryCardPreview() {
    if (!currentEventForStory) {
        console.error('No current event for story');
        return;
    }
    
    
    const preview = document.getElementById('story-card-preview');
    if (!preview) {
        console.error('Story card preview element not found');
        return;
    }
    
    const gradients = {
        'gradient-1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'gradient-4': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'gradient-5': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };
    
    preview.style.background = gradients[selectedTemplate] || gradients['gradient-1'];
    
    // Update content
    const eventDate = new Date(currentEventForStory.isoDate);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    const dateElement = document.getElementById('story-card-date');
    const titleElement = document.getElementById('story-card-title');
    const categoryElement = document.getElementById('story-card-category');
    const venueElement = document.getElementById('story-card-venue');
    const timeElement = document.getElementById('story-card-time');
    
    if (dateElement) dateElement.textContent = formattedDate;
    if (titleElement) titleElement.textContent = currentEventForStory.eventName || 'Event';
    if (categoryElement) categoryElement.textContent = currentEventForStory.category || 'Event';
    if (venueElement) venueElement.textContent = `📍 ${currentEventForStory.locationName || 'Ohrid'}`;
    if (timeElement) timeElement.textContent = `🕐 ${currentEventForStory.startTime || '20:00'}`;
    
    // Update image
    const storyImage = document.getElementById('story-card-image');
    if (storyImage) {
        if (currentEventForStory.imageUrl) {
            storyImage.src = currentEventForStory.imageUrl;
            storyImage.style.display = 'block';
        } else {
            storyImage.style.display = 'none';
        }
    }
    
}

function downloadStoryImage() {
    if (!currentEventForStory && !currentVenueForStory) {
        console.error('No current event or venue for story download');
        return;
    }
    
    
    // Create a high-resolution temporary preview element
    const tempPreview = createHighResolutionPreview();
    
    // Use html2canvas to capture the high-resolution preview
    if (typeof html2canvas !== 'undefined') {
        html2canvas(tempPreview, {
            width: 1080,
            height: 1920,
            scale: 1, // No scaling needed as we're already at target resolution
            backgroundColor: null,
            logging: false,
            allowTaint: true,
            useCORS: true
        }).then(canvas => {
            // Clean up the temporary element
            document.body.removeChild(tempPreview);
            downloadCanvas(canvas);
        }).catch(error => {
            console.error('html2canvas failed, falling back to manual drawing:', error);
            document.body.removeChild(tempPreview);
            downloadStoryImageManual();
        });
    } else {
        document.body.removeChild(tempPreview);
        downloadStoryImageManual();
    }
}

function createHighResolutionPreview() {
    // Check if we have venue or event data and normalize it
    let storyData;
    if (currentVenueForStory) {
        // Clean working hours by removing HTML tags and converting to simple text
        let cleanWorkingHours = currentVenueForStory.workingHours || 'Discover Ohrid';
        if (cleanWorkingHours !== 'Discover Ohrid') {
            cleanWorkingHours = cleanWorkingHours
                .replace(/<br>/g, ' | ')
                .replace(/<[^>]*>/g, '') // Remove any other HTML tags
                .trim();
        }
        
        storyData = {
            eventName: currentVenueForStory.name?.en || currentVenueForStory.name || 'Amazing Venue',
            category: '',  // Hide category for venues
            locationName: currentVenueForStory.location?.address || 'Ohrid',
            startTime: cleanWorkingHours,
            imageUrl: currentVenueForStory.imageUrl,
            isoDate: new Date().toISOString()
        };
    } else if (currentEventForStory) {
        storyData = currentEventForStory;
    } else {
        console.error('No story data available for preview');
        return null;
    }

    const tempPreview = document.createElement('div');
    tempPreview.className = 'story-card-preview';
    tempPreview.id = 'temp-story-card-preview';
    
    // Set to Instagram Story resolution
    tempPreview.style.width = '1080px';
    tempPreview.style.height = '1920px';
    tempPreview.style.position = 'absolute';
    tempPreview.style.left = '-9999px'; // Hide off-screen
    tempPreview.style.top = '-9999px';
    
    // Apply the same gradient background
    const gradients = {
        'gradient-1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'gradient-4': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'gradient-5': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };
    
    tempPreview.style.background = gradients[selectedTemplate] || gradients['gradient-1'];
    tempPreview.style.borderRadius = '2rem';
    tempPreview.style.overflow = 'hidden';
    
    // Create content structure with proper sizing for high resolution
    const content = document.createElement('div');
    content.className = 'story-card-content';
    content.style.width = '100%';
    content.style.height = '100%';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.justifyContent = 'space-between';
    content.style.padding = '120px 80px';
    content.style.color = 'white';
    content.style.textAlign = 'center';
    content.style.position = 'relative';
    
    // Add overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = 'linear-gradient(45deg, rgba(0,0,0,0.3), transparent)';
    overlay.style.zIndex = '1';
    content.appendChild(overlay);
    
    // Header section
    const header = document.createElement('div');
    header.style.position = 'relative';
    header.style.zIndex = '2';
    header.style.textAlign = 'center';
    
    let formattedDate;
    if (currentVenueForStory) {
        // For venues, show "Visit in Ohrid" instead of date
        formattedDate = 'Visit in Ohrid';
    } else {
        // For events, show formatted date
        const eventDate = new Date(storyData.isoDate);
        formattedDate = eventDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
    
    const dateElement = document.createElement('div');
    dateElement.textContent = formattedDate;
    dateElement.style.fontSize = '48px';
    dateElement.style.opacity = '0.9';
    dateElement.style.marginBottom = '40px';
    dateElement.style.textTransform = 'uppercase';
    dateElement.style.letterSpacing = '4px';
    dateElement.style.fontWeight = '600';
    header.appendChild(dateElement);
    
    const titleElement = document.createElement('div');
    titleElement.textContent = storyData.eventName || 'Event';
    titleElement.style.fontSize = '80px';
    titleElement.style.fontWeight = '700';
    titleElement.style.marginBottom = '40px';
    titleElement.style.lineHeight = '1.2';
    titleElement.style.wordWrap = 'break-word';
    header.appendChild(titleElement);
    
    const categoryElement = document.createElement('div');
    categoryElement.textContent = storyData.category || 'Event';
    categoryElement.style.fontSize = '36px';
    categoryElement.style.background = 'rgba(255, 255, 255, 0.2)';
    categoryElement.style.padding = '16px 48px';
    categoryElement.style.borderRadius = '50px';
    categoryElement.style.display = 'inline-block';
    categoryElement.style.backdropFilter = 'blur(10px)';
    categoryElement.style.fontWeight = '500';
    header.appendChild(categoryElement);
    
    // Image section
    const imageContainer = document.createElement('div');
    imageContainer.style.position = 'relative';
    imageContainer.style.zIndex = '2';
    imageContainer.style.display = 'flex';
    imageContainer.style.justifyContent = 'center';
    imageContainer.style.alignItems = 'center';
    imageContainer.style.minHeight = '600px';
    
    if (storyData.imageUrl) {
        const img = document.createElement('img');
        img.src = storyData.imageUrl;
        img.style.width = '480px';
        img.style.height = '480px';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        img.style.border = '12px solid rgba(255, 255, 255, 0.3)';
        img.style.boxShadow = '0 16px 60px rgba(0, 0, 0, 0.3)';
        imageContainer.appendChild(img);
    }
    
    // Footer section
    const footer = document.createElement('div');
    footer.style.position = 'relative';
    footer.style.zIndex = '2';
    footer.style.textAlign = 'center';
    
    const venueElement = document.createElement('div');
    venueElement.textContent = `📍 ${storyData.locationName || 'Ohrid'}`;
    venueElement.style.fontSize = '52px';
    venueElement.style.opacity = '0.9';
    venueElement.style.marginBottom = '32px';
    venueElement.style.fontWeight = '500';
    footer.appendChild(venueElement);
    
    const timeElement = document.createElement('div');
    timeElement.textContent = `🕐 ${storyData.startTime || '20:00'}`;
    timeElement.style.fontSize = '64px';
    timeElement.style.fontWeight = '600';
    timeElement.style.marginBottom = '40px';
    footer.appendChild(timeElement);
    
    const brandingElement = document.createElement('div');
    brandingElement.textContent = 'OHRIDHUB';
    brandingElement.style.fontSize = '44px';
    brandingElement.style.opacity = '0.8';
    brandingElement.style.fontWeight = '500';
    brandingElement.style.textTransform = 'uppercase';
    brandingElement.style.letterSpacing = '4px';
    footer.appendChild(brandingElement);
    
    // Assemble the structure
    content.appendChild(header);
    content.appendChild(imageContainer);
    content.appendChild(footer);
    tempPreview.appendChild(content);
    
    // Add to DOM temporarily
    document.body.appendChild(tempPreview);
    
    return tempPreview;
}

function downloadStoryImageManual() {
    // Check if we have venue or event data and normalize it
    let storyData;
    if (currentVenueForStory) {
        // Map venue data to match event structure for drawing
        // Clean working hours by removing HTML tags and converting to simple text
        let cleanWorkingHours = currentVenueForStory.workingHours || 'Discover Ohrid';
        if (cleanWorkingHours !== 'Discover Ohrid') {
            cleanWorkingHours = cleanWorkingHours
                .replace(/<br>/g, ' | ')
                .replace(/<[^>]*>/g, '') // Remove any other HTML tags
                .trim();
        }
        
        storyData = {
            eventName: currentVenueForStory.name?.en || currentVenueForStory.name || 'Amazing Venue',
            category: 'Venue',
            locationName: currentVenueForStory.location?.address || 'Ohrid',
            startTime: cleanWorkingHours,
            imageUrl: currentVenueForStory.imageUrl,
            isoDate: new Date().toISOString() // Use current date for venues
        };
    } else if (currentEventForStory) {
        storyData = currentEventForStory;
    } else {
        console.error('No story data available for download');
        return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Instagram Story dimensions with high DPI support
    const baseWidth = 1080;
    const baseHeight = 1920;
    const scale = window.devicePixelRatio || 2; // Use device pixel ratio or default to 2 for high quality
    
    // Set actual canvas size for high DPI
    canvas.width = baseWidth * scale;
    canvas.height = baseHeight * scale;
    
    // Scale the context to match the device pixel ratio
    ctx.scale(scale, scale);
    
    // Set canvas display size (CSS size)
    canvas.style.width = baseWidth + 'px';
    canvas.style.height = baseHeight + 'px';
    
    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Enhanced gradients with more sophisticated colors
    const gradientColors = {
        'gradient-1': {
            colors: ['#667eea', '#764ba2'],
            angle: 135,
            name: 'Purple Dream'
        },
        'gradient-2': {
            colors: ['#f093fb', '#f5576c'],
            angle: 135,
            name: 'Sunset Glow'
        },
        'gradient-3': {
            colors: ['#4facfe', '#00f2fe'],
            angle: 135,
            name: 'Ocean Breeze'
        },
        'gradient-4': {
            colors: ['#43e97b', '#38f9d7'],
            angle: 135,
            name: 'Forest Fresh'
        },
        'gradient-5': {
            colors: ['#fa709a', '#fee140'],
            angle: 135,
            name: 'Golden Hour'
        }
    };
    
    const selectedGradient = gradientColors[selectedTemplate] || gradientColors['gradient-1'];
    const [color1, color2] = selectedGradient.colors;
    
    // Create enhanced gradient with radial overlay
    const gradient = ctx.createLinearGradient(0, 0, baseWidth, baseHeight);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    
    // Fill background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, baseWidth, baseHeight);
    
    // Add sophisticated overlay pattern
    const radialGradient = ctx.createRadialGradient(
        baseWidth / 2, baseHeight / 2, 0,
        baseWidth / 2, baseHeight / 2, baseWidth
    );
    radialGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    radialGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
    radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    
    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, baseWidth, baseHeight);
    
    // Add subtle texture pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < baseWidth; i += 4) {
        for (let j = 0; j < baseHeight; j += 4) {
            if (Math.random() > 0.7) {
                ctx.fillRect(i, j, 2, 2);
            }
        }
    }
    
    // Layout constants for better positioning
    const padding = 80;
    const headerY = 200;
    const imageY = 800;
    const footerY = 1550;
    
    // Enhanced text styling
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add text shadow function
    function addTextShadow(ctx, shadowColor = 'rgba(0, 0, 0, 0.3)', blur = 8) {
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = blur;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
    }
    
    // Reset shadow function
    function resetShadow(ctx) {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    
    // Header section with enhanced styling
    
    // Date with improved styling
    let formattedDate;
    if (currentVenueForStory) {
        // For venues, show "Visit in Ohrid" instead of date
        formattedDate = 'VISIT IN OHRID';
    } else {
        // For events, show formatted date
        const eventDate = new Date(storyData.isoDate);
        formattedDate = eventDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).toUpperCase();
    }
    
    addTextShadow(ctx);
    ctx.font = '600 32px system-ui, -apple-system, sans-serif';
    ctx.globalAlpha = 0.9;
    ctx.fillText(formattedDate, baseWidth / 2, headerY - 20);
    resetShadow(ctx);
    ctx.globalAlpha = 1;
    
    // Event title with enhanced typography
    addTextShadow(ctx);
    ctx.font = '700 64px system-ui, -apple-system, sans-serif';
    const title = storyData.eventName || 'Event';
    
    // Enhanced text wrapping with better line height
    wrapTextEnhanced(ctx, title, baseWidth / 2, headerY + 60, baseWidth - 160, 80);
    resetShadow(ctx);
    
    // Category badge with modern design (hidden for venues)
    const category = currentVenueForStory ? '' : (storyData.category || 'Event');
    ctx.font = '500 28px system-ui, -apple-system, sans-serif';
    const categoryMetrics = ctx.measureText(category);
    const badgeWidth = categoryMetrics.width + 60;
    const badgeHeight = 50;
    const badgeX = (baseWidth - badgeWidth) / 2;
    const badgeY = headerY + 200;
    
    // Enhanced badge with gradient and shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    
    // Create badge gradient
    const badgeGradient = ctx.createLinearGradient(badgeX, badgeY, badgeX, badgeY + badgeHeight);
    badgeGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    badgeGradient.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
    
    ctx.fillStyle = badgeGradient;
    ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
    
    // Add badge border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(badgeX, badgeY, badgeWidth, badgeHeight);
    
    resetShadow(ctx);
    
    // Badge text
    ctx.fillStyle = 'white';
    ctx.fillText(category, baseWidth / 2, badgeY + badgeHeight / 2);
    
    // Event image with enhanced styling
    if (storyData.imageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        // Add timeout for image loading
        let imageLoadTimeout;
        
        img.onload = function() {
            clearTimeout(imageLoadTimeout);
            
            // Enhanced circular image with multiple effects
            const imageSize = 320; // Increased size for better mobile visibility
            const imageX = baseWidth / 2;
            const centerY = imageY;
            
            // Add glow effect behind image
            ctx.shadowColor = color2;
            ctx.shadowBlur = 40;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.arc(imageX, centerY, imageSize / 2 + 20, 0, 2 * Math.PI);
            ctx.fill();
            resetShadow(ctx);
            
            // Draw main image with clipping
            ctx.save();
            ctx.beginPath();
            ctx.arc(imageX, centerY, imageSize / 2, 0, 2 * Math.PI);
            ctx.clip();
            
            // Add slight image enhancement
            ctx.filter = 'brightness(1.1) contrast(1.1) saturate(1.2)';
            ctx.drawImage(img, imageX - imageSize / 2, centerY - imageSize / 2, imageSize, imageSize);
            ctx.filter = 'none';
            ctx.restore();
            
            // Enhanced border with gradient
            const borderGradient = ctx.createLinearGradient(
                imageX - imageSize / 2, centerY - imageSize / 2,
                imageX + imageSize / 2, centerY + imageSize / 2
            );
            borderGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
            borderGradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
            
            ctx.strokeStyle = borderGradient;
            ctx.lineWidth = 8; // Increased border width
            ctx.beginPath();
            ctx.arc(imageX, centerY, imageSize / 2, 0, 2 * Math.PI);
            ctx.stroke();
            
            // Add inner highlight
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(imageX, centerY, imageSize / 2 - 4, 0, 2 * Math.PI);
            ctx.stroke();
            
            finishCanvasDrawing();
        };
        
        img.onerror = function() {
            clearTimeout(imageLoadTimeout);
            console.log('Image failed to load, creating placeholder');
            createPlaceholder();
        };
        
        // Set timeout for image loading (5 seconds)
        imageLoadTimeout = setTimeout(() => {
            console.log('Image loading timeout, creating placeholder');
            createPlaceholder();
        }, 5000);
        
        img.src = storyData.imageUrl;
    } else {
        createPlaceholder();
    }
    
    function createPlaceholder() {
        // Create attractive placeholder when no image
        const imageSize = 320; // Increased size for better mobile visibility
        const imageX = baseWidth / 2;
        const centerY = imageY;
        
        // Placeholder circle with gradient
        const placeholderGradient = ctx.createRadialGradient(
            imageX, centerY, 0,
            imageX, centerY, imageSize / 2
        );
        placeholderGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        placeholderGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
        
        ctx.fillStyle = placeholderGradient;
        ctx.beginPath();
        ctx.arc(imageX, centerY, imageSize / 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add placeholder border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(imageX, centerY, imageSize / 2, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Add event icon in placeholder
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '80px system-ui, -apple-system, sans-serif'; // Increased icon size
        ctx.fillText('🎉', imageX, centerY);
        
        finishCanvasDrawing();
    }
    
    function finishCanvasDrawing() {
        // Footer section with enhanced styling
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        
        // Enhanced venue info
        addTextShadow(ctx);
        ctx.font = '500 38px system-ui, -apple-system, sans-serif';
        ctx.globalAlpha = 0.95;
        ctx.fillText(`📍 ${storyData.locationName || 'Ohrid'}`, baseWidth / 2, footerY);
        resetShadow(ctx);
        
        // Enhanced time info
        addTextShadow(ctx);
        ctx.font = '600 42px system-ui, -apple-system, sans-serif';
        ctx.globalAlpha = 1;
        ctx.fillText(`🕐 ${storyData.startTime || '20:00'}`, baseWidth / 2, footerY + 70);
        resetShadow(ctx);
        
        // Enhanced branding with subtle styling
        ctx.font = '600 32px system-ui, -apple-system, sans-serif';
        ctx.globalAlpha = 0.8;
        addTextShadow(ctx, 'rgba(0, 0, 0, 0.2)', 4);
        ctx.fillText('OHRIDHUB', baseWidth / 2, footerY + 140);
        resetShadow(ctx);
        
        // Add decorative elements
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = 'white';
        
        // Top decorative line
        ctx.fillRect(baseWidth / 2 - 40, 80, 80, 3);
        
        // Bottom decorative line
        ctx.fillRect(baseWidth / 2 - 40, 1840, 80, 3);
        
        ctx.globalAlpha = 1;
        
        downloadCanvas(canvas);
    }
    
    // Enhanced text wrapping function
    function wrapTextEnhanced(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        const lines = [];
        
        // First pass: determine all lines
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                lines.push(line.trim());
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        if (line.trim()) {
            lines.push(line.trim());
        }
        
        // Second pass: draw centered lines
        const totalHeight = lines.length * lineHeight;
        let startY = y - totalHeight / 2 + lineHeight / 2;
        
        lines.forEach((line, index) => {
            ctx.fillText(line, x, startY + index * lineHeight);
        });
    }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, currentY);
}

function downloadCanvas(canvas) {
    try {
        // Create a temporary canvas at the correct resolution for download
        const downloadCanvas = document.createElement('canvas');
        const downloadCtx = downloadCanvas.getContext('2d');
        
        // Set the download canvas to Instagram Story dimensions
        downloadCanvas.width = 1080;
        downloadCanvas.height = 1920;
        
        // Enable high-quality rendering
        downloadCtx.imageSmoothingEnabled = true;
        downloadCtx.imageSmoothingQuality = 'high';
        
        // Draw the high-DPI canvas onto the download canvas, scaling it down
        downloadCtx.drawImage(canvas, 0, 0, downloadCanvas.width, downloadCanvas.height);
        
        // Create download link
        const link = document.createElement('a');
        const fileName = currentVenueForStory ? 
            `${(currentVenueForStory.name?.en || currentVenueForStory.name || 'venue').replace(/[^a-z0-9]/gi, '_')}-instagram-story.png` :
            `${(currentEventForStory.eventName || 'event').replace(/[^a-z0-9]/gi, '_')}-instagram-story.png`;
        link.download = fileName;
        
        // Use maximum quality for the download
        link.href = downloadCanvas.toDataURL('image/png', 1.0);
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Image downloaded successfully:', fileName);
    } catch (error) {
        console.error('Error during canvas download:', error);
        
        // Fallback: try direct download from original canvas
        try {
            const link = document.createElement('a');
                    const fileName = currentVenueForStory ? 
            `${(currentVenueForStory.name?.en || currentVenueForStory.name || 'venue').replace(/[^a-z0-9]/gi, '_')}-instagram-story.png` :
            `${(currentEventForStory.eventName || 'event').replace(/[^a-z0-9]/gi, '_')}-instagram-story.png`;
            link.download = fileName;
            link.href = canvas.toDataURL('image/png', 1.0);
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (fallbackError) {
            console.error('Fallback download also failed:', fallbackError);
            Toast.error('Unable to download the image. Please try again.', 'Download Failed');
        }
    }
}

function openInstagramApp() {
    
    try {
        // Check if it's a mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            // Try to open Instagram app
            const instagramURL = 'instagram://camera';
            
            // Create a hidden iframe to try opening the app
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = instagramURL;
            document.body.appendChild(iframe);
            
            // Fallback to Instagram web after a short delay
            setTimeout(() => {
                document.body.removeChild(iframe);
                window.open('https://www.instagram.com/', '_blank');
            }, 1500);
        } else {
            // On desktop, open Instagram web
            window.open('https://www.instagram.com/', '_blank');
        }
    } catch (error) {
        console.error('Error opening Instagram:', error);
        // Fallback to Instagram web
        window.open('https://www.instagram.com/', '_blank');
    }
}

// --- BREADCRUMB NAVIGATION ---
function generateBreadcrumbSchema(breadcrumbs) {
    const existingSchema = document.getElementById('breadcrumb-schema');
    if (existingSchema) {
        existingSchema.remove();
    }

    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
        }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'breadcrumb-schema';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
}

function renderBreadcrumbs(breadcrumbs) {
    const breadcrumbContainer = document.getElementById('breadcrumb-container');
    if (!breadcrumbContainer || !breadcrumbs || breadcrumbs.length === 0) return;

    const breadcrumbHTML = breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        if (isLast) {
            return `<span class="breadcrumb-current" aria-current="page">${item.name}</span>`;
        } else {
            return `<a href="${item.url}" class="breadcrumb-link">${item.name}</a>`;
        }
    }).join('<span class="breadcrumb-separator" aria-hidden="true">›</span>');

    breadcrumbContainer.innerHTML = `
        <nav class="breadcrumb-nav" aria-label="Breadcrumb">
            <div class="container">
                <ol class="breadcrumb-list">
                    ${breadcrumbHTML}
                </ol>
            </div>
        </nav>
    `;

    breadcrumbContainer.classList.remove('hidden');
    
    // Generate structured data for breadcrumbs
    generateBreadcrumbSchema(breadcrumbs);
}

function updateBreadcrumbs(currentPage, additionalItems = []) {
    // Don't show breadcrumbs on homepage
    if (currentPage === 'Home' && additionalItems.length === 0) {
        const breadcrumbContainer = document.getElementById('breadcrumb-container');
        if (breadcrumbContainer) {
            breadcrumbContainer.classList.add('hidden');
        }
        return;
    }

    const baseBreadcrumbs = [
        { name: 'Home', url: '/' }
    ];

    let breadcrumbs = [...baseBreadcrumbs];
    
    // Add additional breadcrumb items
    breadcrumbs = breadcrumbs.concat(additionalItems);
    
    // Add current page as last item (only if it's not Home)
    if (currentPage !== 'Home') {
        breadcrumbs.push({
            name: currentPage,
            url: window.location.href
        });
    }

    renderBreadcrumbs(breadcrumbs);
}

// --- PERFORMANCE MONITORING ---
function measurePerformance() {
    if ('performance' in window) {
        // Measure page load time
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            
            // Log performance metrics (can be sent to analytics)
            console.log('Page Load Time:', loadTime + 'ms');
            
            // Measure Core Web Vitals
            if ('web-vital' in window) {
                getCLS(console.log);
                getFID(console.log);
                getFCP(console.log);
                getLCP(console.log);
                getTTFB(console.log);
            }
        });
    }
}

// --- ACCESSIBILITY IMPROVEMENTS ---
function improveAccessibility() {
    // Add skip links functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById('main-content');
            if (target) {
                target.focus();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Improve focus management for modals
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const closeButton = modal.querySelector('.modal-close-button');
                if (closeButton) {
                    closeButton.click();
                }
            }
        });
    });

    // Add keyboard navigation for sliders
    const sliders = document.querySelectorAll('.keen-slider');
    sliders.forEach(slider => {
        slider.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                const prevButton = slider.parentElement.querySelector('.slider-arrow.left');
                if (prevButton) prevButton.click();
            } else if (e.key === 'ArrowRight') {
                const nextButton = slider.parentElement.querySelector('.slider-arrow.right');
                if (nextButton) nextButton.click();
            }
        });
    });
}

// MAIN INITIALIZATION
async function init() {
    fetchAllData();
    document.getElementById('main-page-content')?.classList.remove('hidden');
    setupImageModalClosers();
    // Delay Instagram setup to ensure DOM is fully loaded
    setTimeout(() => {
        setupInstagramStoryModalListeners();
    }, 100);
}

// Wait for DOM to be ready before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
} 

// Contact Form Management
class ContactFormManager {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.submitButton = this.form?.querySelector('button[type="submit"]');
        this.submitText = this.form?.querySelector('.submit-text');
        this.submitLoading = this.form?.querySelector('.submit-loading');
        this.successMessage = document.getElementById('form-success');
        this.errorMessage = document.getElementById('form-error');
        
        this.initializeForm();
    }
    
    initializeForm() {
        if (!this.form) return;
        
        // Add real-time validation
        this.addRealTimeValidation();
        
        // Handle form submission - let HTML handle it natively for Formspree
        this.form.addEventListener('submit', (e) => {
            // For Formspree, let the form submit naturally
            if (this.form.action && this.form.action.includes('formspree.io')) {
                // Set the reply-to field
                const replyToField = this.form.querySelector('input[name="_replyto"]');
                if (replyToField) {
                    const emailField = this.form.querySelector('input[name="email"]');
                    if (emailField) {
                        replyToField.value = emailField.value;
                    }
                }
                // Let form submit naturally - no preventDefault
                return true;
            }
            // For other submissions, use JavaScript
            this.handleSubmit(e);
        });
    }
    
    addRealTimeValidation() {
        const nameInput = document.getElementById('contact-name');
        const emailInput = document.getElementById('contact-email');
        const messageInput = document.getElementById('contact-message');
        
        nameInput?.addEventListener('blur', () => this.validateName());
        emailInput?.addEventListener('blur', () => this.validateEmail());
        messageInput?.addEventListener('blur', () => this.validateMessage());
        
        // Clear errors on input
        nameInput?.addEventListener('input', () => this.clearError('name'));
        emailInput?.addEventListener('input', () => this.clearError('email'));
        messageInput?.addEventListener('input', () => this.clearError('message'));
    }
    
    validateName() {
        const nameInput = document.getElementById('contact-name');
        const name = nameInput.value.trim();
        
        if (!name) {
            this.showFieldError('name', 'Name is required');
            return false;
        }
        
        if (name.length < 2) {
            this.showFieldError('name', 'Name must be at least 2 characters');
            return false;
        }
        
        this.clearError('name');
        return true;
    }
    
    validateEmail() {
        const emailInput = document.getElementById('contact-email');
        const email = emailInput.value.trim();
        
        if (!email) {
            this.showFieldError('email', 'Email is required');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showFieldError('email', 'Please enter a valid email address');
            return false;
        }
        
        this.clearError('email');
        return true;
    }
    
    validateMessage() {
        const messageInput = document.getElementById('contact-message');
        const message = messageInput.value.trim();
        
        if (!message) {
            this.showFieldError('message', 'Message is required');
            return false;
        }
        
        if (message.length < 10) {
            this.showFieldError('message', 'Message must be at least 10 characters');
            return false;
        }
        
        this.clearError('message');
        return true;
    }
    
    showFieldError(field, message) {
        const input = document.getElementById(`contact-${field}`);
        const errorElement = document.getElementById(`${field}-error`);
        
        if (input) input.classList.add('error');
        if (errorElement) errorElement.textContent = message;
    }
    
    clearError(field) {
        const input = document.getElementById(`contact-${field}`);
        const errorElement = document.getElementById(`${field}-error`);
        
        if (input) input.classList.remove('error');
        if (errorElement) errorElement.textContent = '';
    }
    
    clearAllErrors() {
        ['name', 'email', 'message'].forEach(field => this.clearError(field));
    }
    
    validateForm() {
        this.clearAllErrors();
        
        const nameValid = this.validateName();
        const emailValid = this.validateEmail();
        const messageValid = this.validateMessage();
        
        return nameValid && emailValid && messageValid;
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate form
        if (!this.validateForm()) {
            this.showError('Please correct the errors above.');
            return;
        }
        
        // Show loading state
        this.setLoading(true);
        this.hideMessages();
        
        try {
            // Get form data
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());
            
            // Simulate API call (replace with actual endpoint)
            const success = await this.submitToAPI(data);
            
            if (success) {
                this.showSuccess();
                this.form.reset();
                this.clearAllErrors();
            } else {
                throw new Error('Submission failed');
            }
            
        } catch (error) {
            console.error('Contact form submission error:', error);
            this.showError('Sorry, there was an error sending your message. Please try again or contact us directly at contact@ohridhub.mk');
        } finally {
            this.setLoading(false);
        }
    }
    
    async submitToAPI(data) {
        try {
            // Submit to Formspree - configured with your form endpoint
            const response = await fetch('https://formspree.io/f/xrblkjja', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    subject: data.subject || 'New Contact Form Message',
                    message: data.message,
                    _replyto: data.email,
                    _subject: `OhridHub Contact: ${data.subject || 'New Message'}`
                })
            });
            
            if (response.ok) {
                console.log('✅ Email sent successfully via Formspree');
                return true;
            } else {
                console.error('❌ Formspree error:', response.status);
                return false;
            }
        } catch (error) {
            console.error('❌ Network error submitting form:', error);
            return false;
        }
    }
    
    // Removed EmailJS - using simple Formspree instead
    
    setLoading(loading) {
        if (!this.submitButton) return;
        
        this.submitButton.disabled = loading;
        
        if (loading) {
            this.submitText.style.display = 'none';
            this.submitLoading.style.display = 'inline';
        } else {
            this.submitText.style.display = 'inline';
            this.submitLoading.style.display = 'none';
        }
    }
    
    showSuccess() {
        this.successMessage.style.display = 'block';
        this.errorMessage.style.display = 'none';
        
        // Scroll to success message
        this.successMessage.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        this.successMessage.style.display = 'none';
        
        // Scroll to error message
        this.errorMessage.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
    
    hideMessages() {
        this.successMessage.style.display = 'none';
        this.errorMessage.style.display = 'none';
    }
}

// Venue Instagram Story functionality
let currentVenueForStory = null;

function openVenueInstagramStoryModal() {
    // Get the current venue data from the modal
    const venueName = document.getElementById('modal-venue-name')?.textContent;
    const venueType = document.getElementById('modal-venue-type')?.textContent;
    const venueDescription = document.getElementById('modal-venue-description')?.textContent;
    const venueImage = document.getElementById('modal-venue-image')?.src;
    
    if (!venueName) {
        console.error('No venue data available for Instagram story');
        return;
    }
    
    // Find the venue data from venuesData
    const venue = venuesData.find(v => v.name === venueName || v.name?.en === venueName);
    
    if (!venue) {
        console.error('Venue not found in data');
        return;
    }
    
    currentVenueForStory = venue;
    
    // Update modal title
    const modalTitle = document.getElementById('instagram-story-modal-title');
    if (modalTitle) {
        modalTitle.textContent = 'Share Venue on Instagram';
    }
    
    // Update story preview with venue data
    updateVenueStoryPreview();
    
    // Setup listeners if not already done (reuse the existing function)
    setupInstagramStoryModalListeners();
    
    // Show the Instagram story modal
    const storyModal = document.getElementById('instagram-story-modal');
    if (storyModal) {
        storyModal.classList.add('visible');
        document.body.style.overflow = 'hidden';
    } else {
        console.error('Instagram story modal not found');
    }
}

function updateVenueStoryPreview() {
    if (!currentVenueForStory) return;
    
    // Update template background
    const preview = document.getElementById('story-card-preview');
    if (preview) {
        const gradients = {
            'gradient-1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'gradient-2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'gradient-3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'gradient-4': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'gradient-5': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        };
        preview.style.background = gradients[selectedTemplate] || gradients['gradient-1'];
    }
    
    const storyTitle = document.getElementById('story-card-title');
    const storyCategory = document.getElementById('story-card-category');
    const storyVenue = document.getElementById('story-card-venue');
    const storyTime = document.getElementById('story-card-time');
    const storyImage = document.getElementById('story-card-image');
    const storyDate = document.getElementById('story-card-date');
    
    if (storyTitle) {
        storyTitle.textContent = currentVenueForStory.name?.en || currentVenueForStory.name || 'Amazing Venue';
    }
    
    if (storyCategory) {
        storyCategory.textContent = '';
        storyCategory.style.display = 'none';
    }
    
    if (storyVenue && currentVenueForStory.location) {
        storyVenue.textContent = `📍 ${currentVenueForStory.location.address || 'Ohrid, North Macedonia'}`;
    }
    
    if (storyTime && currentVenueForStory.workingHours) {
        // Clean working hours for preview display
        let cleanWorkingHours = currentVenueForStory.workingHours
            .replace(/<br>/g, ' | ')
            .replace(/<[^>]*>/g, '') // Remove any other HTML tags
            .trim();
        storyTime.textContent = `⏰ ${cleanWorkingHours}`;
    } else if (storyTime) {
        storyTime.textContent = '🌟 Discover Ohrid';
    }
    
    if (storyDate) {
        storyDate.textContent = 'Visit in Ohrid';
    }
    
    if (storyImage && currentVenueForStory.imageUrl) {
        storyImage.src = currentVenueForStory.imageUrl;
        storyImage.alt = currentVenueForStory.name?.en || currentVenueForStory.name || 'Venue image';
    }
}

function generateVenueHashtags() {
    if (!currentVenueForStory) return '';
    
    let hashtags = ['#Ohrid', '#Macedonia', '#OhridHub', '#Travel', '#Balkans'];
    
    // Add venue type hashtags
    if (currentVenueForStory.type) {
        const types = Array.isArray(currentVenueForStory.type) ? currentVenueForStory.type : [currentVenueForStory.type];
        types.forEach(type => {
            if (type) {
                hashtags.push(`#${type.replace(/\s+/g, '').replace(/-/g, '')}`);
            }
        });
    }
    
    // Add venue tags
    if (currentVenueForStory.tags) {
        currentVenueForStory.tags.forEach(tag => {
            hashtags.push(`#${tag.replace(/\s+/g, '')}`);
        });
    }
    
    // Add specific venue hashtags
    hashtags.push('#Restaurant', '#Dining', '#NorthMacedonia', '#LakeOhrid');
    
    return hashtags.slice(0, 15).join(' '); // Limit to 15 hashtags
}

// =============== HISTORICAL FACTS FUNCTIONALITY ===============

function initializeHistoricalFacts() {
    if (!historicalFacts || historicalFacts.length === 0) {
        console.warn('No historical facts data available');
        return;
    }
    
    // Set today's fact based on day of year for consistency
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    currentFactIndex = (dayOfYear - 1) % historicalFacts.length;
    
    displayCurrentFact();
    setupFactEventListeners();
}

// =============== VENUE SHARE FUNCTIONALITY ===============

function initializeVenueShareButton(venue) {
    const shareBtn = document.getElementById('venue-share-btn');
    if (!shareBtn) return;
    
    // Remove any existing event listeners
    shareBtn.replaceWith(shareBtn.cloneNode(true));
    const newShareBtn = document.getElementById('venue-share-btn');
    
    newShareBtn.addEventListener('click', () => shareVenue(venue));
}

async function shareVenue(venue) {
    const venueName = venue.name?.en || venue.name || 'Venue';
    const venueDescription = venue.description?.en || venue.description || `Discover ${venueName} in Ohrid`;
    const venueUrl = `${window.location.origin}/venues/${venue.id}`;
    
    const shareData = {
        title: `${venueName} - OhridHub`,
        text: venueDescription.substring(0, 160) + (venueDescription.length > 160 ? '...' : ''),
        url: venueUrl
    };
    
    try {
        // Check if Web Share API is supported (mainly mobile devices)
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
            console.log('Venue shared successfully via Web Share API');
            return;
        }
    } catch (error) {
        console.log('Web Share API failed, falling back to clipboard:', error);
    }
    
    // Fallback: Copy to clipboard and show notification
    try {
        await navigator.clipboard.writeText(venueUrl);
        showShareNotification('Link copied to clipboard!', 'success');
    } catch (error) {
        console.log('Clipboard API failed, showing share options:', error);
        showShareOptionsModal(shareData);
    }
}

function showShareNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.share-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `share-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showShareOptionsModal(shareData) {
    // Create share options modal as fallback
    const shareModal = document.createElement('div');
    shareModal.className = 'share-options-modal';
    shareModal.innerHTML = `
        <div class="share-options-content">
            <div class="share-options-header">
                <h3>Share this venue</h3>
                <button class="share-close-btn" onclick="this.closest('.share-options-modal').remove()">×</button>
            </div>
            <div class="share-options-body">
                <div class="share-link-container">
                    <input type="text" class="share-link-input" value="${shareData.url}" readonly>
                    <button class="copy-link-btn" onclick="copyShareLink(this, '${shareData.url}')">Copy</button>
                </div>
                <div class="share-social-buttons">
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}" 
                       target="_blank" class="share-social-btn facebook">
                        Facebook
                    </a>
                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}" 
                       target="_blank" class="share-social-btn twitter">
                        Twitter
                    </a>
                    <a href="https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}" 
                       target="_blank" class="share-social-btn whatsapp">
                        WhatsApp
                    </a>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(shareModal);
    
    // Close modal when clicking outside
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            shareModal.remove();
        }
    });
}

function copyShareLink(button, url) {
    navigator.clipboard.writeText(url).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        const input = button.previousElementSibling;
        input.select();
        input.setSelectionRange(0, 99999);
        document.execCommand('copy');
        
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    });
}

function displayCurrentFact() {
    const fact = historicalFacts[currentFactIndex];
    if (!fact) return;
    
    const factIcon = document.getElementById('daily-fact-icon');
    const factPeriod = document.getElementById('daily-fact-period');
    const factDescription = document.getElementById('daily-fact-description');
    
    if (factIcon) factIcon.textContent = fact.icon;
    if (factPeriod) factPeriod.textContent = fact.period;
    if (factDescription) factDescription.textContent = fact.fact;
    
    // Add smooth transition effect
    const factCard = document.querySelector('.historical-fact-card');
    if (factCard) {
        factCard.style.transform = 'scale(0.98)';
        setTimeout(() => {
            factCard.style.transform = 'scale(1)';
        }, 150);
    }
}

function setupFactEventListeners() {
    const prevBtn = document.getElementById('prev-fact');
    const nextBtn = document.getElementById('next-fact');
    const randomBtn = document.getElementById('random-fact');
    const churchesBtn = document.getElementById('churches-cta-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentFactIndex = (currentFactIndex - 1 + historicalFacts.length) % historicalFacts.length;
            displayCurrentFact();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentFactIndex = (currentFactIndex + 1) % historicalFacts.length;
            displayCurrentFact();
        });
    }
    
    if (randomBtn) {
        randomBtn.addEventListener('click', () => {
            const randomIndex = Math.floor(Math.random() * historicalFacts.length);
            currentFactIndex = randomIndex;
            displayCurrentFact();
        });
    }
    
    if (churchesBtn) {
        churchesBtn.addEventListener('click', () => {
            window.location.href = 'churches.html';
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        if (e.key === 'ArrowLeft') {
            prevBtn?.click();
        } else if (e.key === 'ArrowRight') {
            nextBtn?.click();
        } else if (e.key === ' ' && e.ctrlKey) {
            e.preventDefault();
            randomBtn?.click();
        }
    });
}

// Initialize contact form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize contact form
    new ContactFormManager();
}); 

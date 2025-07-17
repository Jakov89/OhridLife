// --- GLOBAL VARIABLES ---
let venuesData = [];
let eventsListData = [];
let featuredEventsData = [];
let learnOhridTexts = {};
let venueRatings = {}; // Holds all user-submitted ratings

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
        subcategories: ['kayaking', 'sup', 'diving', 'cruises', 'hiking', 'atv', 'sports', 'camping', 'gym', 'fitness', 'paragliding'],
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
});

// --- DATA FETCHING ---
async function fetchAllData() {
    // Add loading state
    const mainContent = document.getElementById('main-page-content');
    if (mainContent) {
        mainContent.classList.add('loading');
    }

    try {
        const [venuesResponse, eventsResponse, organizationsResponse, learnOhridResponse] = await Promise.all([
            fetch('/api/venues'),
            fetch('/api/events'),
            fetch('/api/organizations'),
            fetch('/api/learn-ohrid-texts')
        ]);

        // Check response status
        if (!venuesResponse.ok) throw new Error(`Venues API error: ${venuesResponse.status}`);
        if (!eventsResponse.ok) throw new Error(`Events API error: ${eventsResponse.status}`);
        if (!organizationsResponse.ok) throw new Error(`Organizations API error: ${organizationsResponse.status}`);
        if (!learnOhridResponse.ok) throw new Error(`Learn API error: ${learnOhridResponse.status}`);

        const [venues, events, organizations, learnOhrid] = await Promise.all([
            venuesResponse.json(),
            eventsResponse.json(),
            organizationsResponse.json(),
            learnOhridResponse.json()
        ]);

        venuesData = venues.map(normalizeVenueDataItem);
        eventsListData = events.filter(event => !event.isHidden);
        featuredEventsData = organizations;
        learnOhridTexts = learnOhrid;

        // Remove loading state
        if (mainContent) {
            mainContent.classList.remove('loading');
        }

        initializeApp();
        
        // Handle URL parameters after data is loaded
        handleUrlParameters();
        
        // Initialize calendar after data is loaded
        initializeCalendar();

    } catch (error) {
        console.error("Fatal Error: Could not fetch initial data.", error);
        
        // Remove loading state
        if (mainContent) {
            mainContent.classList.remove('loading');
        }
        
        // Show user-friendly error message
        showErrorMessage('Unable to load content. Please check your internet connection and refresh the page.');
        
        // Fallback content
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-fallback">
                    <h2>Content Unavailable</h2>
                    <p>We're having trouble loading the page content. Please try:</p>
                    <ul>
                        <li>Refreshing the page</li>
                        <li>Checking your internet connection</li>
                        <li>Trying again in a few moments</li>
                    </ul>
                    <button onclick="location.reload()" class="btn btn-primary">Refresh Page</button>
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
function initializeApp() {
    setupEventListeners();
    initializeLazyObserver();
    venueRatings = JSON.parse(localStorage.getItem('ohridHubVenueRatings')) || {}; // Load ratings
    // updateStats(); // Removed - statistics section deleted
    renderHeroSlider();
    populateRecommendations();
    populateVenueFilters();
    filterAndDisplayVenues();
    fetchWeather();
    // animateStatsOnScroll(); // Removed - statistics section deleted
    document.getElementById('main-page-content')?.classList.remove('hidden');
    setupImageModalClosers();
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

// --- SCHEMA.ORG DYNAMIC INJECTION ---
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
        "image": `${window.location.origin}/${venue.imageUrl}`,
        "telephone": venue.phone,
        "url": window.location.href // This should ideally be a direct link to the venue if such pages existed
    };

    // Only add address if venue has location
    if (venue.location?.address) {
        schema.address = {
            "@type": "PostalAddress",
            "streetAddress": venue.location.address,
            "addressLocality": "Ohrid",
            "addressCountry": "MK"
        };
        schema.geo = {
            "@type": "GeoCoordinates",
            // Note: This requires getting lat/lon from the Google Maps URL, which is complex.
            // A simpler approach is to use the address, or add lat/lon to your JSON.
        };
    }

    // Use a more specific type if possible
    const venueType = Array.isArray(venue.type.en) ? venue.type.en[0] : venue.type.en;
    switch (venueType) {
        case 'restaurant':
            schema['@type'] = 'Restaurant';
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
        "description": event.description,
        "startDate": `${event.isoDate}T${event.startTime || '00:00'}`,
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "eventStatus": "https://schema.org/EventScheduled",
        "location": {
            "@type": "Place",
            "name": event.locationName || "Ohrid",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Ohrid",
                "addressCountry": "MK"
            }
        }
    };

    if (event.imageUrl) {
        schema.image = `${window.location.origin}/${event.imageUrl}`;
    }

    if (event.eventBookingUrl && event.eventBookingUrl !== '#') {
        schema.offers = {
            "@type": "Offer",
            "url": event.eventBookingUrl,
            "availability": "https://schema.org/InStock"
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
function initializeLazyObserver() {
    lazyImageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;
                img.src = src;
                img.classList.add('lazy-loaded');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: "0px 0px 200px 0px" // Load images 200px before they enter the viewport
    });
}

function observeLazyImages(container) {
    if (!container || !lazyImageObserver) return;
    const images = container.querySelectorAll('img.lazy');
    images.forEach(img => lazyImageObserver.observe(img));
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

// --- RENDERING FUNCTIONS ---
function renderVenueCard(venue) {
    const name = venue.name?.en || 'Unnamed Venue';
    const description = venue.description?.en || 'No description available.';
    const location = venue.location?.address || null;
    
    let categoryString = 'General';
    if (venue.type?.en) {
        const type = Array.isArray(venue.type.en) ? venue.type.en[0] : venue.type.en;
        if (type && typeof type === 'string') {
            categoryString = type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    }

    const imageUrl = venue.imageUrl || 'https://via.placeholder.com/400x250?text=No+Image';
    // Use a tiny, fast-loading placeholder
    const placeholderUrl = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; 
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
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
            </svg>
            <span>${location}</span>
        </div>
    ` : '';

    return `
        <div class="keen-slider__slide" data-venue-id="${venue.id}">
            <div class="venue-card" onclick="openVenueModal(${venue.id})">
                <div class="venue-card-image-container">
                    <img src="${placeholderUrl}" data-src="${imageUrl}" alt="${name}" class="venue-card-image lazy" loading="lazy">
                    <div class="venue-card-badges">
                        ${recommendationBadge}
                        ${ratingBadge}
                    </div>
                </div>
                <div class="venue-card-content">
                    <span class="venue-card-category">${categoryString}</span>
                    <h3 class="venue-card-title">${name}</h3>
                    <p class="venue-card-description">${description}</p>
                    ${locationHtml}
                </div>
            </div>
        </div>
    `;
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
    observeLazyImages(recommendationsContainer); // Observe images in this container

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
    if (!mainCategoriesContainer) return;

    const mainCategories = ['All', ...Object.keys(mainCategoryConfig)];

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

    mainCategoriesContainer.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            // If the user clicks the icon/span, the target might be a child of the button
            const clickedButton = e.target.closest('.category-btn');
            if (!clickedButton) return;

            mainCategoriesContainer.querySelector('.category-btn.active')?.classList.remove('active');
            clickedButton.classList.add('active');
            
            const category = clickedButton.dataset.category;
            populateSubFilters(category);
            filterAndDisplayVenues();
        });
    });
}

function populateSubFilters(mainCategory) {
    const subCategoriesContainer = document.querySelector('#sub-categories-container');
    const subCategoriesList = document.querySelector('#sub-categories-container .sub-categories');

    if (!subCategoriesContainer || !subCategoriesList) return;

    subCategoriesList.innerHTML = '';
    if (mainCategory === 'All' || !mainCategoryConfig[mainCategory]) {
        subCategoriesContainer.classList.add('hidden');
        subCategoriesContainer.style.maxHeight = '0';
        return;
    }

    subCategoriesContainer.classList.remove('hidden');
    const subCategories = mainCategoryConfig[mainCategory].subcategories;
    subCategoriesList.innerHTML = subCategories.map(subCat => {
        const formattedName = subCat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `<button class="subcategory-btn" data-subcategory="${subCat}">${formattedName}</button>`;
    }).join('');

    // Set max-height for transition
    setTimeout(() => {
        subCategoriesContainer.style.maxHeight = subCategoriesList.scrollHeight + 40 + 'px'; // +40 for padding
    }, 10);


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
    if (types.some(type => ['atv', 'diving', 'sup', 'sports', 'gym', 'kayaking', 'hiking', 'camping', 'paragliding'].includes(type))) {
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
    
    // Apply smart rotation only when showing "All" venues
    if (activeMainCategory === 'All' && !activeSubCategory) {
        const rotatedVenues = applySmartRotationToVenues(filteredVenues);
        populateAllVenuesSlider(rotatedVenues);
    } else {
        // Use original ordering for specific categories
        populateAllVenuesSlider(filteredVenues);
    }
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
        observeLazyImages(sliderContainer); // Fix: Observe images for single venues too!
        return;
    }
    
    // For multiple venues, initialize the slider
    sliderContainer.classList.add('keen-slider');
    sliderContainer.innerHTML = venues.map(renderVenueCard).join('');

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

    observeLazyImages(sliderContainer); // Observe images in this container
}

function updateAllVenuesArrows(sliderInstance) {
    if (!sliderInstance) return;
    const arrows = sliderInstance.container.parentElement.querySelectorAll('.slider-arrow');
    if (arrows.length > 0) {
        arrows.forEach(arrow => {
            arrow.style.display = sliderInstance.track.details.slides.length > sliderInstance.options.slides.perView ? 'flex' : 'none';
        });
    }
}

function renderHeroSlider() {
    const sliderContainer = document.querySelector('#hero-slider-container');
    if (!sliderContainer) return;

    sliderContainer.innerHTML = `
        <div id="hero-slider" class="keen-slider">
            ${featuredEventsData.map(event => {
                const name = event.name?.en || event.title || 'Unnamed Event';
                const description = event.description?.en || event.description || '';
                const type = event.type?.en || event.type || 'Event';
                const imageUrl = event.imageUrl || './images_ohrid/placeholder.jpg';
                const eventUrl = `/organizations/${event.id}`;
                const imagePositionClass = event.imagePosition ? `hero-slide-image--align-${event.imagePosition}` : '';

                return `
                <a href="${eventUrl}" class="keen-slider__slide hero-slide">
                    <div class="hero-slide-image-container">
                         <img src="${imageUrl}" alt="${name}" class="hero-slide-image ${imagePositionClass}" loading="lazy">
                    </div>
                    <div class="hero-slide-text-content">
                        <span class="hero-slide-tag">${type}</span>
                        <h3>${name}</h3>
                        <p>${description}</p>
                    </div>
                </a>
                `;
            }).join('')}
        </div>
        <div class="hero-slider-dots"></div>
    `;

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
        const dotsContainer = sliderContainer.querySelector(".hero-slider-dots");
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

// --- MODAL ---
function openVenueModal(venueId) {
    const venue = venuesData.find(v => v.id == venueId);
    if (!venue) {
        console.error('Venue not found for ID:', venueId);
        return;
    }
    
    generateVenueSchema(venue); 

    const modal = document.getElementById('venue-modal');
    if (!modal) {
        console.error('Venue modal element not found in DOM.');
        return;
    }

    // --- Safely populate modal elements ---
    const name = venue.name?.en || 'Unnamed Venue';
    const type = venue.type?.en || 'No type specified';
    const description = venue.description?.en || 'No description available.';
    const imageUrl = venue.imageUrl || 'https://via.placeholder.com/400x250?text=No+Image';

    document.getElementById('modal-venue-image').src = imageUrl;
    document.getElementById('modal-venue-name').textContent = name;
    document.getElementById('modal-venue-type').textContent = Array.isArray(type) ? type.join(', ') : type;
    document.getElementById('modal-venue-description').textContent = description;

    // --- Populate Info Grid ---
    const infoGrid = document.getElementById('modal-info-grid');
    if(infoGrid) {
        const workingHoursHTML = venue.workingHours ? venue.workingHours.replace(/<br>/g, '\n').replace(/\n/g, '<br>') : '';
        infoGrid.innerHTML = `
            ${venue.location?.address ? `<div class="modal-info-item"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg><div class="modal-info-item-content"><h5>Location</h5><p>${venue.location.address}</p>${venue.location.googleMapsUrl ? `<a href="${venue.location.googleMapsUrl}" target="_blank" rel="noopener noreferrer">View on Google Maps</a>` : ''}</div></div>` : ''}
            ${venue.workingHours ? `<div class="modal-info-item"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><div class="modal-info-item-content"><h5>Working Hours</h5><p>${workingHoursHTML}</p></div></div>` : ''}
            ${venue.phone ? `<div class="modal-info-item"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg><div class="modal-info-item-content"><h5>Contact</h5><p><a href="tel:${venue.phone}">${venue.phone}</a></p></div></div>` : ''}
        `;
    }

    // --- Populate Rating ---
    const ratingContainer = document.getElementById('modal-rating-container');
    if (ratingContainer) {
        setupRatingStars(venueId); 
    }

    // --- Populate Gallery ---
    const galleryContainer = document.getElementById('modal-gallery-container');
    const galleryGrid = document.getElementById('modal-gallery-grid');
    if (galleryContainer && galleryGrid) {
        if (venue.gallery && venue.gallery.length > 0) {
            galleryGrid.innerHTML = venue.gallery.map(img => {
                // Use the alt text from JSON. If it's missing (null/undefined), fallback to venue name.
                // An empty string in the JSON (alt: "") is valid and should be preserved.
                const finalAltText = (img.alt !== null && img.alt !== undefined) ? img.alt : name;
                return `<img src="${img.url}" alt="${finalAltText}" class="modal-gallery-image" loading="lazy">`;
            }).join('');
            galleryContainer.style.display = 'block';

            galleryGrid.querySelectorAll('.modal-gallery-image').forEach(img => {
                img.addEventListener('click', () => {
                    const imageModal = document.getElementById('image-modal');
                    const imageModalImg = document.getElementById('image-modal-img');
                    if(imageModal && imageModalImg) {
                        imageModalImg.src = img.src;
                        imageModal.classList.remove('hidden');
                    }
                });
            });
        } else {
            galleryContainer.style.display = 'none';
            galleryGrid.innerHTML = '';
        }
    }
    
    // --- Populate Map ---
    const mapContainer = document.getElementById('modal-map-container');
    if(mapContainer) {
        if (venue.location?.mapIframe) {
            mapContainer.innerHTML = venue.location.mapIframe;
            mapContainer.style.display = 'block';
        } else {
            mapContainer.innerHTML = '';
            mapContainer.style.display = 'none';
        }
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; 

    const url = new URL(window.location);
    url.searchParams.set('venue', venueId);
    window.history.pushState({ venueId }, name, url);
}

function closeVenueModal() {
    const modal = document.getElementById('venue-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        
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

function openEventModal(eventId) {
    const event = eventsListData.find(e => e.id == eventId);
    if (!event) return;

    generateEventSchema(event); // Generate Schema.org data

    const modal = document.getElementById('event-detail-modal');
    if (!modal) return;

    // Store current event ID for sharing
    modal.dataset.eventId = eventId;

    modal.querySelector('#modal-event-name').textContent = event.eventName;

    const eventDescriptionEl = modal.querySelector('#modal-event-description');
    if (event.longDescription || event.description) {
        // Replace newline characters with <br> tags to render paragraphs
        eventDescriptionEl.innerHTML = (event.longDescription || event.description).replace(/\n/g, '<br>');
    } else {
        eventDescriptionEl.textContent = 'No description available.';
    }

    const eventImageEl = modal.querySelector('#modal-event-image');
    if (event.imageUrl) {
        eventImageEl.src = event.imageUrl;
        eventImageEl.alt = event.eventName;
        eventImageEl.style.display = 'block';
        eventImageEl.style.cursor = 'pointer';

        // Add the click listener here, right after setting the src, to open the existing image modal
        eventImageEl.onclick = () => {
             const imageModal = document.getElementById('image-modal');
             const modalImageContent = document.getElementById('image-modal-img'); // Use the correct ID
             if (imageModal && modalImageContent) {
                modalImageContent.src = eventImageEl.src;
                imageModal.classList.remove('hidden');
             }
        };

    } else {
        eventImageEl.style.display = 'none';
        eventImageEl.onclick = null; // Remove listener if there's no image
    }
    
    modal.querySelector('#modal-event-category').textContent = event.category;

    const mapContainer = modal.querySelector('#modal-event-location-map');
    const venue = venuesData.find(v => v.id === event.venueId);
    if (mapContainer) {
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

    const bookingBtn = document.getElementById('modal-event-booking-btn');
    if (event.eventBookingUrl && event.eventBookingUrl !== '#') {
        bookingBtn.href = event.eventBookingUrl;
        bookingBtn.style.display = 'inline-flex';
    } else {
        bookingBtn.style.display = 'none';
    }

    const dateTimeEl = modal.querySelector('#modal-event-date-time');
    if(dateTimeEl) {
        const date = new Date(event.isoDate);
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        dateTimeEl.textContent = `${day}, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${event.startTime}`;
    }

    const contactEl = modal.querySelector('#modal-event-contact');
    const contactPhoneEl = modal.querySelector('#modal-event-contact-phone');
    if (event.eventContact && contactEl && contactPhoneEl) {
        contactPhoneEl.textContent = event.eventContact;
        contactEl.style.display = 'flex';
    } else if (contactEl) {
        contactEl.style.display = 'none';
    }

    const ticketEl = modal.querySelector('#modal-event-ticket');
    const ticketPriceEl = modal.querySelector('#modal-event-ticket-price');
    if (event.ticketPrice && ticketEl && ticketPriceEl) {
        // Make the price clickable if eventBookingUrl exists
        if (event.eventBookingUrl && event.eventBookingUrl !== '#' && event.eventBookingUrl.trim() !== '') {
            ticketPriceEl.innerHTML = `<a href="${event.eventBookingUrl}" target="_blank" style="font-weight: bold; text-decoration: none; cursor: pointer; color: inherit;">${event.ticketPrice}</a>`;
        } else {
            ticketPriceEl.textContent = event.ticketPrice;
        }
        ticketEl.style.display = 'flex';
    } else if (ticketEl) {
        ticketEl.style.display = 'none';
    }



    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeEventModal() {
    const modal = document.getElementById('event-detail-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';

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

        return `
            <div class="daily-event-card detailed" data-event-id="${event.id}" ${isHidden}>
                ${event.imageUrl ? `<img src="${event.imageUrl}" alt="${event.eventName}" class="daily-event-image">` : ''}
                <div class="event-info">
                    <span class="event-title">${event.eventName}</span>
                    <div class="event-meta">
                        <div class="event-meta-item event-time">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span>${event.startTime || 'All Day'}</span>
                        </div>
                        <div class="event-meta-item event-venue">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            <span>${venueName}</span>
                        </div>
                        ${contactInfo}
                        ${ticketInfo}
                    </div>
                    <div class="event-footer">
                        <span class="event-category">${event.category}</span>
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
    listElement.querySelectorAll('.daily-event-card').forEach(card => {
        card.addEventListener('click', () => openEventModal(card.dataset.eventId));
    });

    // Add show more functionality
    const showMoreBtn = document.getElementById('show-more-events-btn');
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => {
            const hiddenEvents = listElement.querySelectorAll('.daily-event-card[style*="display: none"]');
            const isExpanded = hiddenEvents.length === 0;
            
            if (isExpanded) {
                // Collapse: hide events beyond first 3
                const allEvents = listElement.querySelectorAll('.daily-event-card');
                allEvents.forEach((event, index) => {
                    if (index >= 3) {
                        event.style.opacity = '0';
                        event.style.transform = 'translateY(-10px)';
                        setTimeout(() => {
                            event.style.display = 'none';
                        }, 200);
                    }
                });
                showMoreBtn.querySelector('.show-more-text').textContent = `Show ${eventsForDate.length - 3} More Events`;
                showMoreBtn.querySelector('svg').style.transform = 'rotate(0deg)';
            } else {
                // Expand: show all events
                hiddenEvents.forEach((event, index) => {
                    event.style.display = 'flex';
                    event.style.opacity = '0';
                    event.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        event.style.opacity = '1';
                        event.style.transform = 'translateY(0)';
                    }, index * 100 + 50);
                });
                showMoreBtn.querySelector('.show-more-text').textContent = 'Show Less';
                showMoreBtn.querySelector('svg').style.transform = 'rotate(180deg)';
            }
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
            observeLazyImages(newSlide); // Make sure the new image is observed
        }

        alert('Thank you for your rating!');

    } catch (error) {
        console.error("Failed to save rating to localStorage:", error);
        alert('Sorry, your rating could not be saved.');
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
            updateStoryCardPreview();
        });
    });
    
    // Download button
    const downloadBtn = document.getElementById('download-story-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadStoryImage);
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
    if (!currentEventForStory) {
        console.error('No current event for story download');
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
    
    const eventDate = new Date(currentEventForStory.isoDate);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
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
    titleElement.textContent = currentEventForStory.eventName || 'Event';
    titleElement.style.fontSize = '80px';
    titleElement.style.fontWeight = '700';
    titleElement.style.marginBottom = '40px';
    titleElement.style.lineHeight = '1.2';
    titleElement.style.wordWrap = 'break-word';
    header.appendChild(titleElement);
    
    const categoryElement = document.createElement('div');
    categoryElement.textContent = currentEventForStory.category || 'Event';
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
    
    if (currentEventForStory.imageUrl) {
        const img = document.createElement('img');
        img.src = currentEventForStory.imageUrl;
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
    venueElement.textContent = `📍 ${currentEventForStory.locationName || 'Ohrid'}`;
    venueElement.style.fontSize = '52px';
    venueElement.style.opacity = '0.9';
    venueElement.style.marginBottom = '32px';
    venueElement.style.fontWeight = '500';
    footer.appendChild(venueElement);
    
    const timeElement = document.createElement('div');
    timeElement.textContent = `🕐 ${currentEventForStory.startTime || '20:00'}`;
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
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Instagram Story dimensions (9:16 aspect ratio)
    canvas.width = 1080;
    canvas.height = 1920;
    
    // Get gradient - match exactly what's in the preview
    const gradients = {
        'gradient-1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'gradient-4': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'gradient-5': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };
    
    // Parse gradient colors for canvas
    const gradientColors = {
        'gradient-1': ['#667eea', '#764ba2'],
        'gradient-2': ['#f093fb', '#f5576c'],
        'gradient-3': ['#4facfe', '#00f2fe'],
        'gradient-4': ['#43e97b', '#38f9d7'],
        'gradient-5': ['#fa709a', '#fee140']
    };
    
    const [color1, color2] = gradientColors[selectedTemplate] || gradientColors['gradient-1'];
    
    // Create gradient to match CSS (135deg)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    
    // Fill background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add subtle overlay for better text readability
    ctx.fillStyle = 'linear-gradient(45deg, rgba(0,0,0,0.3), transparent)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Layout to match the preview exactly
    const headerY = 150;
    const imageY = 600;
    const footerY = 1500;
    
    // Header section (top)
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    
    // Date
    const eventDate = new Date(currentEventForStory.isoDate);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    ctx.font = 'normal 28px Arial';
    ctx.globalAlpha = 0.9;
    ctx.fillText(formattedDate, canvas.width / 2, headerY);
    ctx.globalAlpha = 1;
    
    // Event title (allow for multiple lines)
    ctx.font = 'bold 48px Arial';
    const title = currentEventForStory.eventName || 'Event';
    wrapText(ctx, title, canvas.width / 2, headerY + 60, canvas.width - 100, 60);
    
    // Category badge
    const category = currentEventForStory.category || 'Event';
    ctx.font = 'normal 24px Arial';
    const categoryMetrics = ctx.measureText(category);
    const badgeWidth = categoryMetrics.width + 30;
    const badgeHeight = 32;
    const badgeX = (canvas.width - badgeWidth) / 2;
    const badgeY = headerY + 160;
    
    // Draw badge background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
    
    // Draw badge text
    ctx.fillStyle = 'white';
    ctx.fillText(category, canvas.width / 2, badgeY + 22);
    
    // Event image (circular, centered)
    if (currentEventForStory.imageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            // Draw circular image in the center
            const imageSize = 240;
            const imageX = canvas.width / 2;
            const centerY = imageY + 200;
            
            ctx.save();
            ctx.beginPath();
            ctx.arc(imageX, centerY, imageSize / 2, 0, 2 * Math.PI);
            ctx.clip();
            
            // Draw image to fill the circle
            ctx.drawImage(img, imageX - imageSize / 2, centerY - imageSize / 2, imageSize, imageSize);
            ctx.restore();
            
            // Add subtle border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(imageX, centerY, imageSize / 2, 0, 2 * Math.PI);
            ctx.stroke();
            
            finishCanvasDrawing();
        };
        img.onerror = function() {
            finishCanvasDrawing();
        };
        img.src = currentEventForStory.imageUrl;
    } else {
        finishCanvasDrawing();
    }
    
    function finishCanvasDrawing() {
        // Footer section (bottom)
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        
        // Venue
        ctx.font = 'normal 32px Arial';
        ctx.globalAlpha = 0.9;
        ctx.fillText(`📍 ${currentEventForStory.locationName || 'Ohrid'}`, canvas.width / 2, footerY);
        
        // Time
        ctx.font = '600 36px Arial';
        ctx.globalAlpha = 1;
        ctx.fillText(`🕐 ${currentEventForStory.startTime || '20:00'}`, canvas.width / 2, footerY + 60);
        
        // Branding
        ctx.font = '500 28px Arial';
        ctx.globalAlpha = 0.8;
        ctx.fillText('OHRIDHUB', canvas.width / 2, footerY + 120);
        ctx.globalAlpha = 1;
        
        downloadCanvas(canvas);
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
        const link = document.createElement('a');
        const fileName = `${(currentEventForStory.eventName || 'event').replace(/[^a-z0-9]/gi, '_')}-instagram-story.png`;
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        console.error('Error during canvas download:', error);
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

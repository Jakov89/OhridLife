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
        subcategories: ['kayaking', 'sup', 'diving', 'cruises', 'hiking', 'atv', 'sports', 'camping', 'gym', 'fitness'],
    },
    'Health & Wellness': {
        icon: '⚕️',
        subcategories: ['hospital', 'pharmacy', 'dentist', 'spa'],
    },
    'Rentals & Services': {
        icon: '🚗',
        subcategories: ['rent-a-car', 'rent-a-bike', 'rent-a-scooter'],
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
    try {
        const [venues, events, organizations, learnOhrid] = await Promise.all([
            fetch('/api/venues').then(res => res.json()),
            fetch('/api/events').then(res => res.json()),
            fetch('/api/organizations').then(res => res.json()),
            fetch('/api/learn-ohrid-texts').then(res => res.json())
        ]);

        venuesData = venues.map(normalizeVenueDataItem);
        eventsListData = events.filter(event => !event.isHidden);
        featuredEventsData = organizations;
        learnOhridTexts = learnOhrid;

        initializeApp();

    } catch (error) {
        console.error("Fatal Error: Could not fetch initial data.", error);
        const mainContent = document.getElementById('main-page-content');
        if (mainContent) {
            mainContent.innerHTML = '<p style="color: red; text-align: center; padding: 2rem;">Could not load page content. Please try again later.</p>';
        }
    }
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

// --- INITIALIZATION ---
function initializeApp() {
    setupEventListeners();
    initializeLazyObserver();
    venueRatings = JSON.parse(localStorage.getItem('ohridHubVenueRatings')) || {}; // Load ratings
    renderHeroSlider();
    populateRecommendations();
    populateVenueFilters();
    filterAndDisplayVenues();
    initializeCalendar();
    fetchWeather();
    initializePlannerLogic();
    animateStatsOnScroll();
    document.getElementById('main-page-content')?.classList.remove('hidden');
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
        "address": {
            "@type": "PostalAddress",
            "streetAddress": venue.location.address,
            "addressLocality": "Ohrid",
            "addressCountry": "MK"
        },
        "geo": {
            "@type": "GeoCoordinates",
            // Note: This requires getting lat/lon from the Google Maps URL, which is complex.
            // A simpler approach is to use the address, or add lat/lon to your JSON.
        },
        "url": window.location.href // This should ideally be a direct link to the venue if such pages existed
    };

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
    const location = venue.location?.address || 'Location not specified.';
    
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
                    <div class="venue-card-location">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                        </svg>
                        <span>${location}</span>
                    </div>
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
        slides: { perView: 1.2, spacing: 15 },
        breakpoints: {
            '(min-width: 520px)': { slides: { perView: 2.2, spacing: 20 } },
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
    
    populateAllVenuesSlider(filteredVenues);
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
    }
}

function openEventModal(eventId) {
    const event = eventsListData.find(e => e.id == eventId);
    if (!event) return;

    generateEventSchema(event); // Generate Schema.org data

    const modal = document.getElementById('event-detail-modal');
    if (!modal) return;

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
    } else {
        eventImageEl.style.display = 'none';
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

// ================================================================================================
// --- DAY PLANNER LOGIC (INTEGRATED FROM day-planner.js) ---
// ================================================================================================

let plannerData = {};
let plannerSelectedDate = new Date().toISOString().split('T')[0];

function initializePlannerLogic() {
    // Re-assign plannerData from localStorage
    plannerData = JSON.parse(localStorage.getItem('ohridHubPlanner')) || {};

    // Setup planner-specific event listeners
    document.getElementById('plan-day-night-type')?.addEventListener('change', populateActivityTypes);
    document.getElementById('plan-activity-type')?.addEventListener('change', handleActivityChange);
    document.getElementById('add-plan-item-form')?.addEventListener('submit', handleFormSubmit);
    document.getElementById('clear-plan-btn')?.addEventListener('click', handleClearPlan);
    document.getElementById('currentPlanDisplay')?.addEventListener('click', handlePlanItemDelete);
    document.getElementById('planner-event-search-results')?.addEventListener('click', handlePlannerQuickAddEvent);


    populateActivityTypes();
    renderPlanForDate(plannerSelectedDate);
    // The calendar initialization for the planner will be merged into the main calendar function
}


// --- PLANNER POPULATION FUNCTIONS ---
const dayActivities = ['Breakfast', 'Lunch', 'Dinner', 'Coffee', 'Beach', 'Activity', 'Shopping', 'Custom'];
const nightActivities = ['Dinner', 'Club', 'Pub', 'Event', 'Custom'];

const activityToVenueTypeMap = {
    'Breakfast': ['restaurant'],
    'Lunch': ['restaurant'],
    'Dinner': ['restaurant'],
    'Coffee': ['coffee', 'cafe'],
    'Beach': ['beach'],
    'Club': ['club'],
    'Pub': ['pub'],
    'Shopping': ['market', 'souvenir', 'boutique'],
    'Activity': ['kayaking', 'sup', 'diving', 'cruises', 'hiking', 'atv', 'sports', 'camping']
};


function updateAndPopulateTimeSelect() {
    const timeOfDaySelect = document.getElementById('plan-day-night-type');
    const timeSelect = document.getElementById('plan-item-time');
    if (!timeOfDaySelect || !timeSelect) return;

    const timeOfDay = timeOfDaySelect.value;
    let timeOptionsHtml = `<option value="Any time">Any time</option>`;

    if (timeOfDay === 'Daytime') {
        const dayTimes = [];
        for (let h = 7; h <= 18; h++) {
            dayTimes.push(`${String(h).padStart(2, '0')}:00`);
            if (h < 18) {
                dayTimes.push(`${String(h).padStart(2, '0')}:30`);
            }
        }
        timeOptionsHtml += dayTimes.map(t => `<option value="${t}">${t}</option>`).join('');

    } else if (timeOfDay === 'Nighttime') {
        const nightTimes = [];
        for (let h = 19; h <= 23; h++) {
            nightTimes.push(`${String(h).padStart(2, '0')}:00`);
            nightTimes.push(`${String(h).padStart(2, '0')}:30`);
        }
        nightTimes.push('00:00');
        nightTimes.push('00:30');
        nightTimes.push('01:00');
        timeOptionsHtml += nightTimes.map(t => `<option value="${t}">${t}</option>`).join('');
    }
    timeSelect.innerHTML = timeOptionsHtml;
}

function populateActivityTypes() {
    const timeOfDaySelect = document.getElementById('plan-day-night-type');
    const activityTypeSelect = document.getElementById('plan-activity-type');
    if (!timeOfDaySelect || !activityTypeSelect) return;

    const timeOfDay = timeOfDaySelect.value;
    const activities = timeOfDay === 'Daytime' ? dayActivities : nightActivities;
    activityTypeSelect.innerHTML = `<option value="" disabled selected>Select activity...</option>` +
        activities.map(act => `<option value="${act}">${act}</option>`).join('');

    updateAndPopulateTimeSelect();
    handleActivityChange();
}

function populateVenueSelect(activityType) {
    const venueSelect = document.getElementById('plan-item-venue-select');
    if (!venueSelect) return;

    let filteredVenues = venuesData;
    const venueTypesToMatch = activityToVenueTypeMap[activityType];

    if (venueTypesToMatch && venueTypesToMatch.length > 0) {
        filteredVenues = venuesData.filter(venue => {
            const venueTypeList = Array.isArray(venue.type.en) ? venue.type.en : [venue.type.en];
            return venueTypeList.some(t => venueTypesToMatch.includes(t.toLowerCase()));
        });
    }

    if (filteredVenues.length > 0) {
        venueSelect.innerHTML = `<option value="" disabled selected>Select a venue...</option>` +
            filteredVenues
                .sort((a, b) => (a.name?.en || '').localeCompare(b.name?.en || ''))
                .map(v => `<option value="${v.id}">${v.name.en}</option>`)
                .join('');
    } else {
        venueSelect.innerHTML = `<option value="" disabled selected>No venues for this activity</option>`;
    }
}


// --- PLANNER EVENT HANDLERS ---
function handleActivityChange() {
    const activityTypeSelect = document.getElementById('plan-activity-type');
    const venueSelectGroup = document.getElementById('plan-item-venue-group');
    if (!activityTypeSelect || !venueSelectGroup) return;

    const activity = activityTypeSelect.value;
    const venueActivities = ['Breakfast', 'Lunch', 'Dinner', 'Coffee', 'Club', 'Pub', 'Beach', 'Shopping', 'Activity'];
    const shouldShowVenues = venueActivities.includes(activity);

    venueSelectGroup.style.display = shouldShowVenues ? 'block' : 'none';

    if (shouldShowVenues) {
        populateVenueSelect(activity);
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    const timeOfDaySelect = document.getElementById('plan-day-night-type');
    const activityTypeSelect = document.getElementById('plan-activity-type');
    const venueSelectGroup = document.getElementById('plan-item-venue-group');
    const venueSelect = document.getElementById('plan-item-venue-select');
    const timeSelect = document.getElementById('plan-item-time');
    const notesInput = document.getElementById('plan-item-notes');
    const form = document.getElementById('add-plan-item-form');
    
    const newPlanItem = {
        id: Date.now(),
        timeOfDay: timeOfDaySelect.value,
        activityType: activityTypeSelect.value,
        venueId: venueSelectGroup.style.display === 'none' || !venueSelect.value ? null : parseInt(venueSelect.value),
        time: timeSelect.value,
        notes: notesInput.value.trim()
    };

    if (!plannerData[plannerSelectedDate]) {
        plannerData[plannerSelectedDate] = [];
    }
    plannerData[plannerSelectedDate].push(newPlanItem);
    plannerData[plannerSelectedDate].sort((a, b) => a.time.localeCompare(b.time));

    savePlannerData();
    renderPlanForDate(plannerSelectedDate);
    form.reset();
    populateActivityTypes();
}

function handleClearPlan() {
    if (plannerData[plannerSelectedDate]) {
        delete plannerData[plannerSelectedDate];
        savePlannerData();
        renderPlanForDate(plannerSelectedDate);
    }
}

function handlePlanItemDelete(e) {
    if (e.target.classList.contains('delete-plan-item-btn')) {
        const itemId = parseInt(e.target.dataset.id);
        plannerData[plannerSelectedDate] = plannerData[plannerSelectedDate].filter(item => item.id !== itemId);
        if (plannerData[plannerSelectedDate].length === 0) {
            delete plannerData[plannerSelectedDate];
        }
        savePlannerData();
        renderPlanForDate(plannerSelectedDate);
    }
}

function handlePlannerQuickAddEvent(e) {
    const button = e.target.closest('.add-event-to-plan-btn');
    if (!button) return;

    const eventId = parseInt(button.dataset.eventId);
    const event = eventsListData.find(e => e.id === eventId);
    if (!event) return;

    const newPlanItem = {
        id: Date.now(),
        timeOfDay: 'Event',
        activityType: 'Event',
        eventId: event.id,
        time: event.time.split(' - ')[0], // Use start time
        notes: ''
    };
    
    if (!plannerData[plannerSelectedDate]) {
        plannerData[plannerSelectedDate] = [];
    }
    plannerData[plannerSelectedDate].push(newPlanItem);
    plannerData[plannerSelectedDate].sort((a, b) => a.time.localeCompare(b.time));

    savePlannerData();
    renderPlanForDate(plannerSelectedDate);
    alert(`'${event.name.en}' added to your plan for ${plannerSelectedDate}!`);
}


// --- PLANNER RENDERING & SAVING ---
function renderPlanForDate(dateStr) {
    const planDisplay = document.getElementById('currentPlanDisplay');
    const currentlyViewingDateEl = document.getElementById('currently-viewing-date');
    const clearPlanBtnContainer = document.getElementById('clear-selected-date-plan-button-container');
    const clearButtonDateText = document.getElementById('clear-button-date-text');
    const planDetailsContainer = document.getElementById('selected-date-plan-details');

    if (!planDisplay || !currentlyViewingDateEl || !clearPlanBtnContainer || !clearButtonDateText || !planDetailsContainer) return;
    
    planDetailsContainer.classList.remove('hidden');
    currentlyViewingDateEl.textContent = dateStr;
    clearButtonDateText.textContent = dateStr;

    const items = plannerData[dateStr];

    if (!items || items.length === 0) {
        planDisplay.innerHTML = '<p class="text-muted-foreground italic">No plans for this day. Add items using the form or by selecting an event.</p>';
        clearPlanBtnContainer.classList.add('hidden');
        return;
    }
    
    clearPlanBtnContainer.classList.remove('hidden');

    planDisplay.innerHTML = items.map(item => {
        let title = item.activityType;
        let details = '';
        let icon = '📝'; // Default icon

        if (item.eventId) {
            const event = eventsListData.find(e => e.id === item.eventId);
            if (event) {
                title = event.name.en;
                icon = '🗓️';
                details = `<p class="plan-item-location">${event.location || 'Event Location'}</p>`;
            }
        } else if (item.venueId) {
            const venue = venuesData.find(v => v.id === item.venueId);
            if (venue) {
                title = venue.name.en;
                icon = '📍';
                details = `<p class="plan-item-location">${venue.location.address}</p>`;
            }
        }

        if (item.notes) {
            details += `<p class="plan-item-notes">Notes: ${item.notes}</p>`;
        }
        
        return `
            <div class="plan-item">
                <div class="plan-item-icon">${icon}</div>
                <div class="plan-item-content">
                    <div class="plan-item-header">
                        <h5 class="plan-item-title">${title}</h5>
                        <span class="plan-item-time">${item.time}</span>
                    </div>
                    <div class="plan-item-details">${details}</div>
                </div>
                <button class="delete-plan-item-btn" data-id="${item.id}">&times;</button>
            </div>
        `;
    }).join('');
}


function savePlannerData() {
    localStorage.setItem('ohridHubPlanner', JSON.stringify(plannerData));
}

// ================================================================================================
// --- END OF DAY PLANNER LOGIC ---
// ================================================================================================


// --- CALENDAR & EVENTS (MAIN PAGE) ---
function initializeCalendar() {
    const calendarContainer = document.getElementById('calendar-container');
    if (!calendarContainer) return;

    const eventDates = new Set(eventsListData.map(e => e.isoDate));

    const fp = flatpickr(calendarContainer, {
        inline: true,
        utc: true,
        dateFormat: "Y-m-d",
        defaultDate: "today",
        onChange: (selectedDates, dateStr) => {
            renderEventsForDate(dateStr);
            // Also update the planner's selected date
            plannerSelectedDate = dateStr;
            renderPlanForDate(dateStr);
        },
        onDayCreate: (dObj, dStr, fp, dayElem) => {
            // Re-format the date from the day element to match the 'YYYY-MM-DD' format
            // of our event data, avoiding timezone issues.
            const year = dayElem.dateObj.getFullYear();
            const month = String(dayElem.dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dayElem.dateObj.getDate()).padStart(2, '0');
            const date = `${year}-${month}-${day}`;

            if (eventDates.has(date)) {
                dayElem.classList.add('has-events');
            }
            if (plannerData[date] && plannerData[date].length > 0) {
                 dayElem.classList.add('has-plan');
            }
        },
        onReady: (selectedDates, dateStr, instance) => {
            const todayStr = instance.now.toISOString().split('T')[0];
            renderEventsForDate(todayStr);
            renderPlanForDate(todayStr);
        }
    });
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

    listElement.innerHTML = ''; // Clear previous events

    // Destroy previous slider if it exists
    if (sliders.dailyEvents) {
        sliders.dailyEvents.destroy();
        delete sliders.dailyEvents;
    }
    // Make sure the list is not a slider by default
    listElement.classList.remove('keen-slider');


    if (eventsForDate.length === 0) {
        listElement.innerHTML = '<p class="no-events-message">No events scheduled for this day. Please select another date.</p>';
        return;
    }
    
    listElement.innerHTML = eventsForDate.map(event => {
        const venue = venuesData.find(v => v.id === event.venueId);
        const venueName = venue?.name?.en || event.locationName || 'To be announced';

        return `
            <div class="daily-event-card detailed keen-slider__slide" data-event-id="${event.id}">
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
                    </div>
                    <div class="event-footer">
                        <span class="event-category">${event.category}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    listElement.querySelectorAll('.daily-event-card').forEach(card => {
        card.addEventListener('click', () => openEventModal(card.dataset.eventId));
    });

    const upArrow = document.getElementById('daily-events-arrow-up');
    const downArrow = document.getElementById('daily-events-arrow-down');

    if (eventsForDate.length > 3) {
        listElement.classList.add('keen-slider');
        const dailySlider = createSlider(listElement, {
            vertical: true,
            loop: false,
            slides: {
                perView: 3,
                spacing: 15
            }
        }, 'dailyEvents');

        upArrow.style.display = 'flex';
        downArrow.style.display = 'flex';
        upArrow.addEventListener('click', () => dailySlider?.prev());
        downArrow.addEventListener('click', () => dailySlider?.next());

    } else {
        upArrow.style.display = 'none';
        downArrow.style.display = 'none';
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
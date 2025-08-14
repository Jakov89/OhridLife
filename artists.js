// --- GLOBAL VARIABLES ---
let artistsData = [];
let eventsData = [];
let filteredArtists = [];
let currentCategory = 'all';
let currentSubcategory = 'all';
let displayedArtists = 12; // Number of artists to show initially
const artistsPerPage = 12;

// --- SLIDER INSTANCES ---
const artistSliders = {};

// --- ARTIST CATEGORY CONFIG ---
const artistCategoryConfig = {
    'DJ': {
        icon: '🎧',
        subcategories: [],
    },
    'Band': {
        icon: '🎵',
        subcategories: ['Disco-Funk', 'Rock', 'Pop', 'Jazz', 'Electronic'],
    },
    'Singer': {
        icon: '🎤',
        subcategories: ['Pop', 'Rock', 'Jazz', 'Folk'],
    },
    'Stand-up Comedian': {
        icon: '🎭',
        subcategories: ['Comedy'],
    },
    'Musician': {
        icon: '🎸',
        subcategories: ['Acoustic', 'Rock', 'Jazz'],
    },
    'Rap': {
        icon: '🎤',
        subcategories: ['Hip Hop', 'Rap'],
    }
};

// --- DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    fetchArtistsData();
    setupEventListeners();
    checkForSharedArtist();
});

// --- CHECK FOR SHARED ARTIST ---
function checkForSharedArtist() {
    const urlParams = new URLSearchParams(window.location.search);
    const artistId = urlParams.get('artist');
    
    console.log('Checking for shared artist, ID:', artistId); // Debug log
    
    if (artistId) {
        // Wait a bit for the data to load, then open the modal
        const checkAndOpen = () => {
            console.log('Artists data loaded:', artistsData.length > 0); // Debug log
            
            if (artistsData.length > 0) {
                const artist = artistsData.find(a => a.id == artistId);
                console.log('Found artist:', artist); // Debug log
                
                if (artist) {
                    console.log('Opening modal for artist:', artist.name); // Debug log
                    // Small delay to ensure everything is rendered
                    setTimeout(() => {
                        openArtistModal(parseInt(artistId));
                        // Clean up URL without refreshing the page
                        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                        window.history.replaceState({}, document.title, newUrl);
                    }, 1000); // Increased delay
                } else {
                    console.log('Artist not found with ID:', artistId); // Debug log
                }
            } else {
                // If data isn't loaded yet, try again in 200ms
                console.log('Data not ready, retrying...'); // Debug log
                setTimeout(checkAndOpen, 200);
            }
        };
        
        checkAndOpen();
    }
}

// --- SKELETON LOADING FUNCTIONS ---
function showArtistSkeletons() {
    const featuredSkeleton = document.getElementById('featured-skeleton');
    if (featuredSkeleton) {
        featuredSkeleton.classList.remove('hidden');
    }
    
    // Hide actual content
    const featuredSlider = document.getElementById('featured-artists-slider-container');
    if (featuredSlider) {
        featuredSlider.style.display = 'none';
    }
}

function hideArtistSkeletons() {
    const featuredSkeleton = document.getElementById('featured-skeleton');
    if (featuredSkeleton) {
        featuredSkeleton.classList.add('hidden');
    }
    
    // Show actual content
    const featuredSlider = document.getElementById('featured-artists-slider-container');
    if (featuredSlider) {
        featuredSlider.style.display = 'block';
    }
}

// --- DATA FETCHING ---
async function fetchArtistsData() {
    showArtistSkeletons();
    
    try {
        const [artistsResponse, eventsResponse] = await Promise.all([
            fetch('/api/artists'),
            fetch('/api/events')
        ]);
        
        if (!artistsResponse.ok) {
            throw new Error(`Artists HTTP error! status: ${artistsResponse.status}`);
        }
        if (!eventsResponse.ok) {
            throw new Error(`Events HTTP error! status: ${eventsResponse.status}`);
        }
        
        artistsData = await artistsResponse.json();
        eventsData = await eventsResponse.json();
        
        // Link events to artists
        linkEventsToArtists();
        
        filteredArtists = [...artistsData];
        
        hideArtistSkeletons();
        
        await initializeArtistsApp();
        
        // Check for shared artist after everything is loaded
        checkForSharedArtist();
        
    } catch (error) {
        console.error('Error loading artists data:', error);
        hideArtistSkeletons();
        showErrorState();
    }
}

// --- LINK EVENTS TO ARTISTS ---
function linkEventsToArtists() {
    artistsData.forEach(artist => {
        // Find events for this artist
        const artistEvents = eventsData
            .filter(event => event.artistId === artist.id)
            .map(event => ({
                name: event.eventName,
                date: formatEventDate(event.isoDate),
                venue: event.locationName,
                time: event.startTime
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
        
        // Add to artist's upcoming events (keep existing events and add new ones)
        if (artistEvents.length > 0) {
            artist.upcomingEvents = [...(artist.upcomingEvents || []), ...artistEvents];
        }
    });
}

// --- FORMAT EVENT DATE ---
function formatEventDate(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

// --- APP INITIALIZATION ---
async function initializeArtistsApp() {
    try {
        populateFeaturedArtists();
        populateCategoryFilters();
        populateArtistsGrid();
        
        // Update the current active filter
        updateActiveFilter();
        
    } catch (error) {
        console.error('Error initializing artists app:', error);
        showErrorState();
    }
}

// --- RENDERING FUNCTIONS ---
function renderArtistCard(artist, isSlider = false) {
    const name = artist.name || 'Unknown Artist';
    const description = artist.description || 'No description available.';
    const category = artist.category || 'Artist';
    const subcategory = artist.subcategory || '';
    const imageUrl = artist.imageUrl || 'https://via.placeholder.com/400x300/cccccc/666666?text=No+Image';
    const rating = artist.rating || 0;
    const experience = artist.experience || '';
    
    const ratingStars = generateRatingStars(rating);
    const categoryIcon = artistCategoryConfig[category]?.icon || '🎭';
    
    const cardClass = isSlider ? 'keen-slider__slide' : 'artist-card-wrapper';
    
    return `
        <div class="${cardClass}" data-artist-id="${artist.id}">
            <div class="artist-card" onclick="openArtistModal(${artist.id})">
                <div class="artist-card-image-container">
                    <img src="${imageUrl}" alt="${name}" class="artist-card-image" loading="lazy">
                    <div class="artist-card-category-badge">
                        <span class="category-icon">${categoryIcon}</span>
                        <span class="category-text">${category}</span>
                    </div>
                </div>
                <div class="artist-card-content">
                    <h3 class="artist-card-title">${name}</h3>
                    ${subcategory ? `<span class="artist-card-subcategory">${subcategory}</span>` : ''}
                    <p class="artist-card-description">${description}</p>
                    <div class="artist-card-meta">
                        <div class="artist-rating">
                            ${ratingStars}
                            <span class="rating-value">${rating.toFixed(1)}</span>
                        </div>
                        ${experience ? `<span class="artist-experience">${experience}</span>` : ''}
                    </div>
                    <div class="artist-card-specialties">
                        ${artist.specialties ? artist.specialties.slice(0, 3).map(specialty => 
                            `<span class="specialty-tag">${specialty}</span>`
                        ).join('') : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<span class="star filled">★</span>';
    }
    
    // Half star
    if (hasHalfStar) {
        starsHTML += '<span class="star half">★</span>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<span class="star empty">☆</span>';
    }
    
    return starsHTML;
}

// Fisher-Yates shuffle algorithm for artists
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// --- FEATURED ARTISTS ---
function populateFeaturedArtists() {
    const featuredContainer = document.querySelector('#featured-artists-slider');
    if (!featuredContainer) return;
    
    // Get all active artists, shuffle them, and take maximum 5
    const activeArtists = artistsData.filter(artist => artist.isActive);
    
    if (activeArtists.length === 0) {
        featuredContainer.innerHTML = '<p class="no-artists-message">No featured artists available.</p>';
        return;
    }
    
    const shuffledArtists = shuffleArray(activeArtists);
    const featuredArtists = shuffledArtists.slice(0, Math.min(5, shuffledArtists.length));
    
    featuredContainer.innerHTML = featuredArtists.map(artist => renderArtistCard(artist, true)).join('');
    
    // Create slider with adjusted breakpoints for maximum 5 items
    createArtistSlider('#featured-artists-slider', {
        loop: featuredArtists.length > 1,
        slides: { perView: 1.1, spacing: 10 },
        breakpoints: {
            '(min-width: 480px)': { slides: { perView: 1.3, spacing: 12 } },
            '(min-width: 640px)': { slides: { perView: 2.1, spacing: 15 } },
            '(min-width: 768px)': { slides: { perView: 2.5, spacing: 20 } },
            '(min-width: 1024px)': { slides: { perView: 3.5, spacing: 25 } },
            '(min-width: 1200px)': { slides: { perView: Math.min(4, featuredArtists.length), spacing: 25 } },
        },
    }, 'featured');
    
    // Setup arrow navigation
    document.querySelector('#featured-arrow-left')?.addEventListener('click', () => 
        artistSliders.featured?.prev());
    document.querySelector('#featured-arrow-right')?.addEventListener('click', () => 
        artistSliders.featured?.next());
}

// --- CATEGORY FILTERS ---
function populateCategoryFilters() {
    const mainCategoriesContainer = document.querySelector('.main-categories');
    if (!mainCategoriesContainer) return;
    
    // Clear existing filters except "All Artists"
    const allButton = mainCategoriesContainer.querySelector('[data-category="all"]');
    mainCategoriesContainer.innerHTML = '';
    
    // Re-add "All Artists" button
    if (allButton) {
        mainCategoriesContainer.appendChild(allButton);
    }
    
    // Add category buttons
    Object.keys(artistCategoryConfig).forEach(category => {
        const config = artistCategoryConfig[category];
        const artistCount = artistsData.filter(artist => artist.category === category).length;
        
        if (artistCount > 0) {
            const button = document.createElement('button');
            button.className = 'category-filter';
            button.setAttribute('data-category', category);
            button.innerHTML = `${config.icon} ${category} (${artistCount})`;
            mainCategoriesContainer.appendChild(button);
        }
    });
}

// --- SUBCATEGORY FILTERS ---
function populateSubcategoryFilters(category) {
    const subCategoriesContainer = document.querySelector('.sub-categories');
    if (!subCategoriesContainer) return;
    
    if (category === 'all') {
        document.getElementById('sub-categories-container').classList.add('hidden');
        return;
    }
    
    const config = artistCategoryConfig[category];
    if (!config || !config.subcategories) {
        document.getElementById('sub-categories-container').classList.add('hidden');
        return;
    }
    
    // Get unique subcategories from actual data
    const availableSubcategories = [...new Set(
        artistsData
            .filter(artist => artist.category === category)
            .map(artist => artist.subcategory)
            .filter(Boolean)
    )];
    
    if (availableSubcategories.length <= 1) {
        document.getElementById('sub-categories-container').classList.add('hidden');
        return;
    }
    
    subCategoriesContainer.innerHTML = '';
    
    // Add "All" subcategory button
    const allButton = document.createElement('button');
    allButton.className = 'category-filter subcategory-filter active';
    allButton.setAttribute('data-subcategory', 'all');
    allButton.textContent = `All ${category}s`;
    subCategoriesContainer.appendChild(allButton);
    
    // Add subcategory buttons
    availableSubcategories.forEach(subcategory => {
        const artistCount = artistsData.filter(artist => 
            artist.category === category && artist.subcategory === subcategory
        ).length;
        
        const button = document.createElement('button');
        button.className = 'category-filter subcategory-filter';
        button.setAttribute('data-subcategory', subcategory);
        button.textContent = `${subcategory} (${artistCount})`;
        subCategoriesContainer.appendChild(button);
    });
    
    document.getElementById('sub-categories-container').classList.remove('hidden');
}

// --- ARTISTS GRID ---
function populateArtistsGrid() {
    const gridContainer = document.getElementById('artists-grid');
    const noArtistsMessage = document.getElementById('no-artists-message');
    const loadMoreContainer = document.getElementById('load-more-container');
    
    if (!gridContainer) return;
    
    if (filteredArtists.length === 0) {
        gridContainer.innerHTML = '';
        noArtistsMessage?.classList.remove('hidden');
        loadMoreContainer?.classList.add('hidden');
        return;
    }
    
    noArtistsMessage?.classList.add('hidden');
    
    // Show all filtered artists in horizontal scroll
    gridContainer.innerHTML = filteredArtists.map(artist => renderArtistCard(artist, false)).join('');
    
    // Hide load more button since we're showing all artists in scroll
    loadMoreContainer?.classList.add('hidden');
}

// --- FILTERING ---
function filterArtists() {
    filteredArtists = artistsData.filter(artist => {
        if (!artist.isActive) return false;
        
        // Category filter
        if (currentCategory !== 'all' && artist.category !== currentCategory) {
            return false;
        }
        
        // Subcategory filter
        if (currentSubcategory !== 'all' && artist.subcategory !== currentSubcategory) {
            return false;
        }
        
        return true;
    });
    
    // Reset display counter
    displayedArtists = artistsPerPage;
    
    populateArtistsGrid();
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    // Scroll arrows for artists grid
    setupScrollArrows();
    
    // Category filters
    document.addEventListener('click', (e) => {
        if (e.target.matches('.category-filter:not(.subcategory-filter)')) {
            const category = e.target.getAttribute('data-category');
            if (category) {
                currentCategory = category;
                currentSubcategory = 'all';
                
                // Update active states
                document.querySelectorAll('.category-filter:not(.subcategory-filter)').forEach(btn => 
                    btn.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update subcategory filters
                populateSubcategoryFilters(category);
                
                // Filter and display artists
                filterArtists();
            }
        }
        
        // Subcategory filters
        if (e.target.matches('.subcategory-filter')) {
            const subcategory = e.target.getAttribute('data-subcategory');
            if (subcategory) {
                currentSubcategory = subcategory;
                
                // Update active states
                document.querySelectorAll('.subcategory-filter').forEach(btn => 
                    btn.classList.remove('active'));
                e.target.classList.add('active');
                
                // Filter and display artists
                filterArtists();
            }
        }
    });
    
    // Load more button removed - using horizontal scroll instead
    
    // Modal close button
    document.querySelector('#artist-modal .modal-close-button')?.addEventListener('click', closeArtistModal);
    
    // Close modal on outside click
    document.getElementById('artist-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'artist-modal') {
            closeArtistModal();
        }
    });
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeArtistModal();
        }
    });
}

function updateActiveFilter() {
    // Set initial active state for "All Artists"
    const allButton = document.querySelector('[data-category="all"]');
    if (allButton) {
        allButton.classList.add('active');
    }
}

// --- SLIDER CREATION ---
function createArtistSlider(elementOrSelector, options, name) {
    const sliderElement = typeof elementOrSelector === 'string' 
        ? document.querySelector(elementOrSelector) 
        : elementOrSelector;
        
    if (!sliderElement) return null;
    
    // Destroy existing slider if it exists
    if (artistSliders[name]) {
        artistSliders[name].destroy();
        delete artistSliders[name];
    }
    
    // Add keen-slider class if not present
    if (!sliderElement.classList.contains('keen-slider')) {
        sliderElement.classList.add('keen-slider');
    }
    
    const slider = new KeenSlider(sliderElement, options);
    artistSliders[name] = slider;
    return slider;
}

// --- ARTIST MODAL ---
function openArtistModal(artistId) {
    const artist = artistsData.find(a => a.id === artistId);
    if (!artist) return;
    
    const modal = document.getElementById('artist-modal');
    if (!modal) return;
    
    // Populate modal content
    populateArtistModal(artist);
    
    // Show modal
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
}

function closeArtistModal() {
    const modal = document.getElementById('artist-modal');
    if (!modal) return;
    
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
}

// --- SHARE MODAL FUNCTIONS ---
function openShareModal(artistId) {
    const artist = artistsData.find(a => a.id === artistId);
    if (!artist) return;
    
    const shareModal = document.getElementById('share-modal');
    const shareUrlInput = document.getElementById('share-url-input');
    
    // Generate the shareable URL
    const currentUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${currentUrl}?artist=${artistId}`;
    
    shareUrlInput.value = shareUrl;
    shareModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    
    // Select the URL for easy copying
    shareUrlInput.select();
}

function closeShareModal() {
    const shareModal = document.getElementById('share-modal');
    shareModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    
    // Hide success message
    const successMessage = document.getElementById('share-success');
    successMessage.classList.add('hidden');
}

function copyShareUrl() {
    const shareUrlInput = document.getElementById('share-url-input');
    const successMessage = document.getElementById('share-success');
    
    try {
        shareUrlInput.select();
        shareUrlInput.setSelectionRange(0, 99999); // For mobile devices
        
        navigator.clipboard.writeText(shareUrlInput.value).then(() => {
            // Show success message
            successMessage.classList.remove('hidden');
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                successMessage.classList.add('hidden');
            }, 3000);
        }).catch(() => {
            // Fallback for older browsers
            document.execCommand('copy');
            successMessage.classList.remove('hidden');
            setTimeout(() => {
                successMessage.classList.add('hidden');
            }, 3000);
        });
    } catch (err) {
        console.error('Failed to copy URL:', err);
    }
}

function populateArtistModal(artist) {
    // Basic info
    document.getElementById('modal-artist-name').textContent = artist.name || 'Unknown Artist';
    document.getElementById('modal-artist-category').textContent = 
        `${artist.category}${artist.subcategory ? ` • ${artist.subcategory}` : ''}`;
    
    // Image
    const modalImage = document.getElementById('modal-artist-image');
    modalImage.src = artist.profileImage || artist.imageUrl || 'https://via.placeholder.com/400x300/cccccc/666666?text=No+Image';
    modalImage.alt = artist.name || 'Artist image';
    
    // Rating
    const ratingContainer = document.getElementById('modal-artist-rating');
    if (artist.rating) {
        ratingContainer.innerHTML = `
            <div class="rating-stars">${generateRatingStars(artist.rating)}</div>
            <span class="rating-text">${artist.rating.toFixed(1)} / 5</span>
        `;
    } else {
        ratingContainer.innerHTML = '<span class="rating-text">No rating yet</span>';
    }
    
    // Experience
    const experienceContainer = document.getElementById('modal-artist-experience');
    if (artist.experience) {
        experienceContainer.innerHTML = `<strong>Experience:</strong> ${artist.experience}`;
        experienceContainer.style.display = 'block';
    } else {
        experienceContainer.style.display = 'none';
    }
    
    // Bio
    const bioContainer = document.getElementById('modal-artist-bio');
    bioContainer.innerHTML = `<p>${artist.bio || artist.description || 'No biography available.'}</p>`;
    
    // Specialties
    const specialtiesContainer = document.querySelector('#modal-artist-specialties .specialties-tags');
    if (artist.specialties && artist.specialties.length > 0) {
        specialtiesContainer.innerHTML = artist.specialties
            .map(specialty => `<span class="specialty-tag">${specialty}</span>`)
            .join('');
        document.getElementById('modal-artist-specialties').style.display = 'block';
    } else {
        document.getElementById('modal-artist-specialties').style.display = 'none';
    }
    
    // Social media
    const socialContainer = document.querySelector('#modal-artist-social .social-links');
    if (artist.socialMedia) {
        let socialHTML = '';
        if (artist.socialMedia.instagram) {
            // Handle both full URLs and usernames
            let instagramUrl = artist.socialMedia.instagram;
            if (!instagramUrl.startsWith('http')) {
                instagramUrl = `https://instagram.com/${instagramUrl.replace('@', '')}`;
            }
            socialHTML += `<a href="${instagramUrl}" target="_blank" rel="noopener noreferrer" class="social-link instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>${artist.id === 4 ? 'Maca MF Instagram' : 'Instagram'}</span>
            </a>`;
        }
        if (artist.socialMedia.facebook) {
            // Handle both full URLs and usernames
            let facebookUrl = artist.socialMedia.facebook;
            if (!facebookUrl.startsWith('http')) {
                facebookUrl = `https://facebook.com/${facebookUrl}`;
            }
            socialHTML += `<a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" class="social-link facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
                <span>${artist.id === 4 ? 'Maca MF Facebook' : 'Facebook'}</span>
            </a>`;
        }
        
        // Handle secondary Instagram (instagram2)
        if (artist.socialMedia.instagram2) {
            let instagramUrl2 = artist.socialMedia.instagram2;
            if (!instagramUrl2.startsWith('http')) {
                instagramUrl2 = `https://instagram.com/${instagramUrl2.replace('@', '')}`;
            }
            socialHTML += `<a href="${instagramUrl2}" target="_blank" rel="noopener noreferrer" class="social-link instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Meckarov Instagram</span>
            </a>`;
        }
        
        // Handle secondary Facebook (facebook2)
        if (artist.socialMedia.facebook2) {
            let facebookUrl2 = artist.socialMedia.facebook2;
            if (!facebookUrl2.startsWith('http')) {
                facebookUrl2 = `https://facebook.com/${facebookUrl2}`;
            }
            socialHTML += `<a href="${facebookUrl2}" target="_blank" rel="noopener noreferrer" class="social-link facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
                <span>Meckarov Facebook</span>
            </a>`;
        }
        
        // Add Share This Profile button
        socialHTML += `<button class="social-link share-profile" onclick="openShareModal(${artist.id})">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92S19.61 16.08 18 16.08z"/>
            </svg>
            Share This Profile
        </button>`;
        
        if (socialHTML) {
            socialContainer.innerHTML = socialHTML;
            document.getElementById('modal-artist-social').style.display = 'block';
        } else {
            document.getElementById('modal-artist-social').style.display = 'none';
        }
    } else {
        document.getElementById('modal-artist-social').style.display = 'none';
    }
    
    // Upcoming events
    const eventsContainer = document.querySelector('#modal-upcoming-events .events-list');
    if (artist.upcomingEvents && artist.upcomingEvents.length > 0) {
        eventsContainer.innerHTML = artist.upcomingEvents
            .map(event => `
                <div class="upcoming-event">
                    <div class="event-date">${event.date}</div>
                    <div class="event-details">
                        <div class="event-name">${event.name}</div>
                        <div class="event-venue">${event.venue}</div>
                    </div>
                </div>
            `)
            .join('');
        document.getElementById('modal-upcoming-events').style.display = 'block';
    } else {
        eventsContainer.innerHTML = '<p class="no-events">No upcoming events scheduled.</p>';
        document.getElementById('modal-upcoming-events').style.display = 'block';
    }
    
    // Update contact/book button
    updateContactButton(artist);
}

function updateContactButton(artist) {
    const bookButton = document.getElementById('book-artist-btn');
    if (!bookButton) return;
    
    // Hide booking button only if artist has hideBooking flag AND no contact info
    if (artist.hideBooking && !artist.contact) {
        bookButton.style.display = 'none';
        return;
    }
    
    if (artist.contact) {
        // Make sure button is visible when contact info exists
        bookButton.style.display = 'block';
        
        // Update button text and icon based on contact type
        let icon, text, clickHandler;
        
        switch (artist.contact.type) {
            case 'instagram':
                icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>`;
                text = artist.contact.label || 'Contact on Instagram';
                clickHandler = () => {
                    let url = artist.contact.value;
                    if (!url.startsWith('http')) {
                        url = `https://instagram.com/${url.replace('@', '')}`;
                    }
                    window.open(url, '_blank', 'noopener,noreferrer');
                };
                break;
            case 'phone':
                icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>`;
                text = artist.contact.label || 'Call Artist';
                clickHandler = () => {
                    window.location.href = `tel:${artist.contact.value}`;
                };
                break;
            case 'email':
                icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                </svg>`;
                text = artist.contact.label || 'Email Artist';
                clickHandler = () => {
                    window.location.href = `mailto:${artist.contact.value}`;
                };
                break;
            default:
                // Fallback to original book button
                icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>`;
                text = 'Book This Artist';
                clickHandler = () => {
                    const subject = encodeURIComponent(`Book Artist: ${artist.name}`);
                    const body = encodeURIComponent(`Hi,\n\nI would like to inquire about booking ${artist.name} for an event.\n\nPlease provide information about availability and pricing.\n\nThank you!`);
                    window.open(`mailto:contact@ohridhub.mk?subject=${subject}&body=${body}`, '_blank');
                };
        }
        
        bookButton.innerHTML = `${icon} ${text}`;
        bookButton.onclick = clickHandler;
        
    } else {
        // Default book button for artists without contact info
        bookButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            Book This Artist
        `;
        bookButton.onclick = () => {
            const subject = encodeURIComponent(`Book Artist: ${artist.name}`);
            const body = encodeURIComponent(`Hi,\n\nI would like to inquire about booking ${artist.name} for an event.\n\nPlease provide information about availability and pricing.\n\nThank you!`);
            window.open(`mailto:contact@ohridhub.mk?subject=${subject}&body=${body}`, '_blank');
        };
    }
}

// --- ERROR HANDLING ---
function showErrorState() {
    const gridContainer = document.getElementById('artists-grid');
    const featuredContainer = document.getElementById('featured-artists-slider-container');
    
    const errorMessage = `
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>Unable to Load Artists</h3>
            <p>We're having trouble loading the artists data. Please try refreshing the page.</p>
            <button class="btn btn-primary" onclick="location.reload()">Refresh Page</button>
        </div>
    `;
    
    if (gridContainer) {
        gridContainer.innerHTML = errorMessage;
    }
    
    if (featuredContainer) {
        featuredContainer.innerHTML = errorMessage;
    }
}

// --- SCROLL ARROWS FUNCTIONALITY ---
function setupScrollArrows() {
    const artistsGrid = document.getElementById('artists-grid');
    const scrollLeftBtn = document.getElementById('artists-scroll-left');
    const scrollRightBtn = document.getElementById('artists-scroll-right');
    
    if (!artistsGrid || !scrollLeftBtn || !scrollRightBtn) return;
    
    // Scroll amount (width of one card plus gap)
    const scrollAmount = 324; // 300px card + 24px gap
    
    // Scroll left
    scrollLeftBtn.addEventListener('click', () => {
        artistsGrid.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });
    
    // Scroll right
    scrollRightBtn.addEventListener('click', () => {
        artistsGrid.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });
    
    // Update arrow states based on scroll position
    function updateArrowStates() {
        const { scrollLeft, scrollWidth, clientWidth } = artistsGrid;
        
        // Disable left arrow if at the beginning
        scrollLeftBtn.disabled = scrollLeft <= 0;
        
        // Disable right arrow if at the end
        scrollRightBtn.disabled = scrollLeft >= scrollWidth - clientWidth - 10; // 10px tolerance
    }
    
    // Update arrow states on scroll
    artistsGrid.addEventListener('scroll', debounce(updateArrowStates, 100));
    
    // Initial arrow state update
    setTimeout(updateArrowStates, 100);
    
    // Update arrows when content changes
    const observer = new MutationObserver(() => {
        setTimeout(updateArrowStates, 100);
    });
    
    observer.observe(artistsGrid, { childList: true });
}

// --- UTILITY FUNCTIONS ---
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

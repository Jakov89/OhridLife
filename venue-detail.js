document.addEventListener('DOMContentLoaded', () => {
    const venueId = window.location.pathname.split('/').pop();
    const venueContentContainer = document.getElementById('venue-content-container');

    if (venueId && venueContentContainer) {
        fetchVenueDetails(venueId, venueContentContainer);
    } else {
        venueContentContainer.innerHTML = '<p class="error-message">Could not load venue details. Invalid ID.</p>';
    }
});

function updateMetaTags(venue) {
    // Get the venue name, defaulting to a generic title if not available
    const name = venue.name?.en || venue.name || 'Venue';
    const description = venue.description?.en || venue.description || 'Discover amazing venues in Ohrid, North Macedonia';
    
    // Update page title
    document.title = `${name} - OhridHub`;
    
    // Update meta description
    document.querySelector('meta[name="description"]').content = description;
    
    // Update Open Graph meta tags
    document.querySelector('meta[property="og:title"]').content = `${name} - OhridHub`;
    document.querySelector('meta[property="og:description"]').content = description;
    
    // Update image if available
    if (venue.imageUrl) {
        const baseUrl = 'https://www.ohridhub.com';
        const normalizedImageUrl = venue.imageUrl.startsWith('/') ? venue.imageUrl : `/${venue.imageUrl}`;
        const fullImageUrl = `${baseUrl}${normalizedImageUrl}`;
        document.querySelector('meta[property="og:image"]').content = fullImageUrl;
        document.querySelector('meta[name="twitter:image"]').content = fullImageUrl;
    }
    
    // Update Twitter Card meta tags
    document.querySelector('meta[name="twitter:title"]').content = `${name} - OhridHub`;
    document.querySelector('meta[name="twitter:description"]').content = description;
    
    // Update canonical URL and og:url
    const canonicalUrl = `https://www.ohridhub.com/venue/${venue.id}`;
    document.querySelector('link[rel="canonical"]').href = canonicalUrl;
    document.querySelector('meta[property="og:url"]').content = canonicalUrl;
    document.querySelector('meta[property="twitter:url"]').content = canonicalUrl;
}

async function fetchVenueDetails(id, container) {
    try {
        const response = await fetch(`/api/venues/${id}`);
        if (!response.ok) {
            throw new Error(`Venue not found (status: ${response.status})`);
        }
        const venue = await response.json();
        renderVenueDetails(venue, container);
    } catch (error) {
        console.error('Error fetching venue details:', error);
        container.innerHTML = `<p class="error-message">Sorry, we couldn't load the details for this venue. Please try again later.</p>`;
    }
}

function renderVenueDetails(venue, container) {
    // Update meta tags for social sharing
    updateMetaTags(venue);

    // Clear the "Loading..." message
    container.innerHTML = '';

    const name = venue.name?.en || 'Unnamed Venue';
    const description = venue.description?.en || 'No description available.';
    const imageUrl = venue.imageUrl || 'https://via.placeholder.com/1200x400?text=OhridHub';

    const header = document.createElement('div');
    header.className = 'venue-detail-header';
    header.innerHTML = `
        <img src="/${imageUrl}" alt="${name}" class="venue-detail-main-image" loading="lazy">
        <div class="venue-detail-title-overlay">
            <h1>${name}</h1>
        </div>
    `;

    const content = document.createElement('div');
    content.className = 'venue-detail-content';
    content.innerHTML = `
        <div class="venue-detail-info-panel">
            <h2>About ${name}</h2>
            <p>${description}</p>
            <!-- Add more details like working hours, contact, etc. here -->
        </div>
        <div class="venue-detail-gallery-panel">
            <h3>Gallery</h3>
            <div id="venue-gallery-grid" class="venue-gallery-grid">
                <!-- Gallery images will be injected here -->
            </div>
        </div>
    `;

    container.appendChild(header);
    container.appendChild(content);

    // Populate the gallery
    const galleryGrid = document.getElementById('venue-gallery-grid');
    if (venue.gallery && venue.gallery.length > 0) {
        galleryGrid.innerHTML = venue.gallery.map(img => {
            const altText = (img.alt !== null && img.alt !== undefined) ? img.alt : name;
            return `<img src="/${img.url}" alt="${altText}" class="gallery-image" loading="lazy">`;
        }).join('');
    } else {
        galleryGrid.innerHTML = '<p>No gallery images available.</p>';
    }
} 
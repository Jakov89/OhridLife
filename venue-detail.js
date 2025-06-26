document.addEventListener('DOMContentLoaded', () => {
    const venueId = window.location.pathname.split('/').pop();
    const venueContentContainer = document.getElementById('venue-content-container');

    if (venueId && venueContentContainer) {
        fetchVenueDetails(venueId, venueContentContainer);
    } else {
        venueContentContainer.innerHTML = '<p class="error-message">Could not load venue details. Invalid ID.</p>';
    }
});

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
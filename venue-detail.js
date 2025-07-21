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
    // Use the new MetaTagManager for comprehensive meta tag updates
    if (window.MetaTagManager) {
        const metaData = window.MetaTagManager.generateVenueMeta(venue);
        window.MetaTagManager.updatePageMeta(metaData);
    } else {
        // Fallback to basic updates if MetaTagManager isn't loaded
        const name = venue.name?.en || venue.name || 'Venue';
        const description = venue.description?.en || venue.description || 'Discover amazing venues in Ohrid, North Macedonia';
        document.title = `${name} - OhridHub`;
        
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.content = description;
    }
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

    const name = venue.name || 'Unnamed Venue';
    const description = venue.description || 'No description available.';
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
            <div class="venue-details">
                ${venue.phone ? `<p><strong>Phone:</strong> ${venue.phone}</p>` : ''}
                ${venue.workingHours ? `<p><strong>Working Hours:</strong> ${venue.workingHours}</p>` : ''}
                ${venue.priceLevel ? `<p><strong>Price Level:</strong> ${Array(venue.priceLevel).fill('€').join('')}</p>` : ''}
                ${venue.rating ? `<p><strong>Rating:</strong> ${venue.rating} ⭐</p>` : ''}
            </div>
            ${venue.location?.mapIframe ? `
            <div class="venue-map">
                <h3>Location</h3>
                ${venue.location.mapIframe}
            </div>` : ''}
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

    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.id = 'venue-modal';
    modalContainer.className = 'venue-modal';
    modalContainer.innerHTML = `
        <div class="modal-content" id="modal-details-content">
            <span class="close-modal">&times;</span>
            <div class="modal-image-container">
                <img id="modal-image" src="" alt="">
            </div>
            <div class="modal-navigation">
                <button class="modal-nav prev">&lt;</button>
                <button class="modal-nav next">&gt;</button>
            </div>
        </div>
    `;
    container.appendChild(modalContainer);

    // Populate the gallery
    const galleryGrid = document.getElementById('venue-gallery-grid');
    let currentImageIndex = 0;
    
    if (venue.gallery && venue.gallery.length > 0) {
        galleryGrid.innerHTML = venue.gallery.map((img, index) => {
            const altText = img.alt || name;
            return `<img src="/${img.url}" alt="${altText}" class="gallery-image" data-index="${index}" loading="lazy">`;
        }).join('');

        // Add click event listeners to gallery images
        const galleryImages = galleryGrid.querySelectorAll('.gallery-image');
        const modal = document.getElementById('venue-modal');
        const modalImage = document.getElementById('modal-image');
        const closeBtn = modal.querySelector('.close-modal');
        const prevBtn = modal.querySelector('.modal-nav.prev');
        const nextBtn = modal.querySelector('.modal-nav.next');

        function openModal(index) {
            currentImageIndex = index;
            modal.style.display = 'block';
            updateModalImage();
        }

        function closeModal() {
            modal.style.display = 'none';
        }

        function updateModalImage() {
            const img = venue.gallery[currentImageIndex];
            modalImage.src = '/' + img.url;
            modalImage.alt = img.alt || name;
            
            // Update navigation buttons visibility
            prevBtn.style.display = currentImageIndex > 0 ? 'block' : 'none';
            nextBtn.style.display = currentImageIndex < venue.gallery.length - 1 ? 'block' : 'none';
        }

        galleryImages.forEach(img => {
            img.addEventListener('click', () => {
                openModal(parseInt(img.dataset.index));
            });
        });

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentImageIndex > 0) {
                currentImageIndex--;
                updateModalImage();
            }
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentImageIndex < venue.gallery.length - 1) {
                currentImageIndex++;
                updateModalImage();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (modal.style.display === 'block') {
                if (e.key === 'Escape') closeModal();
                if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
                    currentImageIndex--;
                    updateModalImage();
                }
                if (e.key === 'ArrowRight' && currentImageIndex < venue.gallery.length - 1) {
                    currentImageIndex++;
                    updateModalImage();
                }
            }
        });
    } else {
        galleryGrid.innerHTML = '<p>No gallery images available.</p>';
    }
} 
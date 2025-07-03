document.addEventListener('DOMContentLoaded', () => {
    initializeOrganizationPage();
    setupEventModalListeners();
});

let eventsListData = []; // Store events data for modal access

async function initializeOrganizationPage() {
    const orgId = getOrganizationIdFromUrl();
    if (!orgId) {
        displayError('Could not find organization ID in URL.');
        return;
    }

    try {
        // Fetch the specific event by its ID
        const response = await fetch(`/api/organizations/${orgId}`);
        if (!response.ok) {
             if (response.status === 404) {
                displayError(`Organization with ID ${orgId} not found.`);
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return;
        }
        
        const organization = await response.json();

        if (organization) {
            renderOrganizationDetails(organization);
            fetchAndRenderAssociatedEvents(orgId);
        } else {
             // This case should ideally not be reached if the API returns 404 for not found
            displayError(`Organization with ID ${orgId} not found.`);
        }
    } catch (error) {
        console.error('Error fetching or rendering organization details:', error);
        displayError('Could not load organization details. Please try again later.');
    }
}

function getOrganizationIdFromUrl() {
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length >= 3 && pathParts[1] === 'organizations') {
        return pathParts[2];
    }
    return null;
}

function renderOrganizationDetails(org) {
    document.title = `${org.title} - OhridHub`;
    document.getElementById('org-name').textContent = org.title;
    
    // Use longDescription if available, otherwise use the regular description.
    const description = org.longDescription || org.description || '';
    document.getElementById('org-description').innerHTML = description.replace(/\\n/g, '<br>');
    
    const mainImage = document.getElementById('org-main-image');
    mainImage.src = org.imageUrl || '/images_ohrid/placeholder.jpg';
    mainImage.alt = `Main image for ${org.title}`;

    const galleryContainer = document.getElementById('org-gallery');
    if (org.gallery && org.gallery.length > 0) {
        galleryContainer.innerHTML = ''; // Clear existing content
        org.gallery.forEach(imgSrc => {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'gallery-image-container';
            imgContainer.innerHTML = `
                <img src="${imgSrc}" alt="Gallery image for ${org.title}" class="gallery-image" loading="lazy">
            `;
            galleryContainer.appendChild(imgContainer);
        });
    } else {
        document.getElementById('org-gallery-title').style.display = 'none';
        galleryContainer.style.display = 'none';
    }
}

async function fetchAndRenderAssociatedEvents(orgId) {
    try {
        const response = await fetch(`/api/organizations/${orgId}/events`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const events = await response.json();
        eventsListData = events; // Store for modal access
        const container = document.getElementById('associated-events-container');

        if (events.length > 0) {
            document.getElementById('associated-events-title').style.display = 'block';
            container.innerHTML = '';
            
            // Sort events by date to ensure they appear in chronological order
            events.sort((a, b) => new Date(a.isoDate) - new Date(b.isoDate));

            events.forEach(event => {
                const eventCard = createAssociatedEventCard(event);
                container.appendChild(eventCard);
            });
        } else {
            document.getElementById('associated-events-title').style.display = 'none';
        }
    } catch (error) {
        console.error('Could not fetch associated events:', error);
    }
}

function createAssociatedEventCard(event) {
    const card = document.createElement('div');
    card.className = 'associated-event-card';
    card.style.cursor = 'pointer';
    card.dataset.eventId = event.id;

    const title = event.eventName || 'Event';
    // Use shortDescription if available, otherwise truncate description
    const description = event.shortDescription || (event.description || '').substring(0, 100) + '...';
    const date = new Date(event.isoDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    card.innerHTML = `
        <div class="assoc-card-content">
            <h4 class="assoc-card-title">${title}</h4>
            <p class="assoc-card-date">${date}</p>
            <p class="assoc-card-description">${description}</p>
        </div>
    `;

    // Add click handler to open event modal
    card.addEventListener('click', () => {
        openEventModal(event.id);
    });
    
    return card;
}

function displayError(message) {
    const container = document.querySelector('#organization-page .container');
    if (container) {
        container.innerHTML = `<p style="color: red; text-align: center;">${message}</p>`;
    }
}

function setupEventModalListeners() {
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
}

function openEventModal(eventId) {
    const event = eventsListData.find(e => e.id == eventId);
    if (!event) return;

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
        eventImageEl.style.cursor = 'pointer';

        // Add the click listener here, right after setting the src, to open the existing image modal
        eventImageEl.onclick = () => {
             const imageModal = document.getElementById('image-modal');
             const modalImageContent = document.getElementById('modal-image-content');
             if (imageModal && modalImageContent) {
                modalImageContent.src = eventImageEl.src;
                imageModal.classList.remove('hidden');
             }
        };

    } else {
        eventImageEl.style.display = 'none';
        eventImageEl.onclick = null;
    }
    
    modal.querySelector('#modal-event-category').textContent = event.category;

    const mapContainer = modal.querySelector('#modal-event-location-map');
    if (mapContainer) {
        let iframe = null;
        if (event.locationIframe) {
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



    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeEventModal() {
    const modal = document.getElementById('event-detail-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
} 
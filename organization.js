document.addEventListener('DOMContentLoaded', () => {
    initializeOrganizationPage();
});

async function initializeOrganizationPage() {
    const orgId = getOrganizationIdFromUrl();
    if (!orgId) {
        displayError('Could not find organization ID in URL.');
        return;
    }

    try {
        // Fetch the specific event by its ID
        const response = await fetch(`/api/events/${orgId}`);
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
    const name = org.name?.en || org.title || org.eventName || 'Unnamed Organization';
    document.title = `${name} - OhridHub`;

    document.getElementById('org-name').textContent = name;
    const description = org.longDescription || org.description?.en || org.description || '';
    document.getElementById('org-description').innerHTML = description.replace(/\\n/g, '<br>');
    
    const mainImage = document.getElementById('org-main-image');
    mainImage.src = org.imageUrl || '/images_ohrid/placeholder.jpg';
    mainImage.alt = `Main image for ${name}`;

    const galleryContainer = document.getElementById('org-gallery');
    if (org.gallery && org.gallery.length > 0) {
        org.gallery.forEach(imgSrc => {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'gallery-image-container';
            imgContainer.innerHTML = `
                <img src="${imgSrc}" alt="Gallery image for ${name}" class="gallery-image" loading="lazy">
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
        const container = document.getElementById('associated-events-container');

        if (events.length > 0) {
            document.getElementById('associated-events-title').style.display = 'block';
            container.innerHTML = '';
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

    const title = event.eventName || 'Event';
    const description = (event.description || '').substring(0, 100) + '...';
    const date = new Date(event.isoDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    card.innerHTML = `
        <div class="assoc-card-content">
            <h4 class="assoc-card-title">${title}</h4>
            <p class="assoc-card-date">${date}</p>
            <p class="assoc-card-description">${description}</p>
        </div>
    `;
    
    return card;
}

function displayError(message) {
    const container = document.querySelector('#organization-page .container');
    if (container) {
        container.innerHTML = `<p style="color: red; text-align: center;">${message}</p>`;
    }
} 
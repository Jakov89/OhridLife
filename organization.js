// Instagram Story functionality
let selectedTemplate = 'gradient-1';
let currentEventForStory = null;

function setupInstagramStoryModalListeners() {
    console.log('Setting up Instagram story modal listeners...');
    
    // Modal close button
    const closeBtn = document.getElementById('instagram-story-modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeInstagramStoryModal);
        console.log('Close button listener attached');
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
        console.log('Modal backdrop listener attached');
    } else {
        console.error('Instagram story modal not found');
    }
    
    // Template selection
    const templateOptions = document.querySelectorAll('.template-option');
    console.log('Found template options:', templateOptions.length);
    templateOptions.forEach((option, index) => {
        option.addEventListener('click', () => {
            console.log('Template clicked:', option.dataset.template);
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
        console.log('Download button listener attached');
    } else {
        console.error('Download button not found');
    }
    
    // Open Instagram button
    const instagramBtn = document.getElementById('open-instagram-btn');
    if (instagramBtn) {
        instagramBtn.addEventListener('click', openInstagramApp);
        console.log('Instagram button listener attached');
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
    
    console.log('Updating story card preview for event:', currentEventForStory.eventName);
    
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
    
    console.log('Selected template:', selectedTemplate);
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
    
    console.log('Story card preview updated successfully');
}

function downloadStoryImage() {
    if (!currentEventForStory) {
        console.error('No current event for story download');
        return;
    }
    
    console.log('Starting story image download for event:', currentEventForStory.eventName);
    
    // Use html2canvas to capture the preview element directly
    const previewElement = document.getElementById('story-card-preview');
    if (!previewElement) {
        console.error('Preview element not found');
        return;
    }
    
    // If html2canvas is not available, use manual canvas drawing
    if (typeof html2canvas === 'undefined') {
        downloadStoryImageManual();
        return;
    }
    
    // Capture the preview element as canvas
    html2canvas(previewElement, {
        width: 1080,
        height: 1920,
        scale: 5.4, // Scale up to Instagram story resolution (1080x1920)
        backgroundColor: null,
        logging: false
    }).then(canvas => {
        downloadCanvas(canvas);
    }).catch(error => {
        console.error('html2canvas failed, falling back to manual drawing:', error);
        downloadStoryImageManual();
    });
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
    console.log('Converting canvas to data URL and downloading...');
    
    try {
        const link = document.createElement('a');
        const fileName = `${(currentEventForStory.eventName || 'event').replace(/[^a-z0-9]/gi, '_')}-instagram-story.png`;
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Download triggered successfully:', fileName);
    } catch (error) {
        console.error('Error during canvas download:', error);
    }
}

function openInstagramApp() {
    console.log('Opening Instagram app/web...');
    
    try {
        // Check if it's a mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            console.log('Mobile device detected, trying to open Instagram app...');
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
                console.log('Fallback to Instagram web...');
                window.open('https://www.instagram.com/', '_blank');
            }, 1500);
        } else {
            // On desktop, open Instagram web
            console.log('Desktop device detected, opening Instagram web...');
            window.open('https://www.instagram.com/', '_blank');
        }
    } catch (error) {
        console.error('Error opening Instagram:', error);
        // Fallback to Instagram web
        window.open('https://www.instagram.com/', '_blank');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeOrganizationPage();
    setupEventModalListeners();
    setupInstagramStoryModalListeners();
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
            const slide = document.createElement('div');
            slide.className = 'keen-slider__slide';
            
            const imgContainer = document.createElement('div');
            imgContainer.className = 'gallery-image-container';
            imgContainer.innerHTML = `
                <img src="${imgSrc}" alt="Gallery image for ${org.title}" class="gallery-image" loading="lazy">
            `;
            
            slide.appendChild(imgContainer);
            galleryContainer.appendChild(slide);
        });
        
        // Initialize the slider after DOM is ready
        initializeGallerySlider();
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
}

function openEventModal(eventId) {
    const event = eventsListData.find(e => e.id == eventId);
    if (!event) return;

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

    const ticketEl = modal.querySelector('#modal-event-ticket');
    const ticketPriceEl = modal.querySelector('#modal-event-ticket-price');
    if (event.ticketPrice && ticketEl && ticketPriceEl) {
        ticketPriceEl.textContent = event.ticketPrice;
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
    }
}

function shareCurrentEvent() {
    const modal = document.getElementById('event-detail-modal');
    const eventId = modal?.dataset.eventId;
    
    if (!eventId) return;
    
    const event = eventsListData.find(e => e.id == eventId);
    if (!event) return;
    
    const eventUrl = `${window.location.origin}/events/${eventId}`;
    const eventTitle = event.eventName;
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

// Initialize gallery slider
function initializeGallerySlider() {
    const galleryContainer = document.getElementById('org-gallery');
    if (!galleryContainer || typeof KeenSlider === 'undefined') return;
    
    const slider = new KeenSlider('#org-gallery', {
        loop: false,
        slides: { 
            perView: 3,
            spacing: 16
        },
        breakpoints: {
            '(max-width: 768px)': {
                slides: { perView: 2, spacing: 12 }
            },
            '(max-width: 480px)': {
                slides: { perView: 1, spacing: 8 }
            }
        },
        created(s) {
            updateArrows(s);
        },
        slideChanged(s) {
            updateArrows(s);
        }
    });
    
    function updateArrows(s) {
        const leftArrow = document.getElementById('org-gallery-arrow-left');
        const rightArrow = document.getElementById('org-gallery-arrow-right');
        
        if (leftArrow && rightArrow) {
            // Show/hide arrows based on current position
            leftArrow.style.opacity = s.track.details.rel === 0 ? '0.3' : '1';
            rightArrow.style.opacity = s.track.details.rel === s.track.details.slides.length - s.options.slides.perView ? '0.3' : '1';
            
            leftArrow.style.pointerEvents = s.track.details.rel === 0 ? 'none' : 'auto';
            rightArrow.style.pointerEvents = s.track.details.rel === s.track.details.slides.length - s.options.slides.perView ? 'none' : 'auto';
        }
    }
    
    // Setup navigation arrows
    const leftArrow = document.getElementById('org-gallery-arrow-left');
    const rightArrow = document.getElementById('org-gallery-arrow-right');
    
    if (leftArrow && rightArrow) {
        leftArrow.addEventListener('click', () => slider.prev());
        rightArrow.addEventListener('click', () => slider.next());
    }
    
    // Add click functionality to images for fullscreen view
    const images = galleryContainer.querySelectorAll('.gallery-image');
    images.forEach(img => {
        img.addEventListener('click', () => {
            const imageModal = document.getElementById('image-modal');
            const modalImage = document.getElementById('modal-image-content');
            if (imageModal && modalImage) {
                modalImage.src = img.src;
                modalImage.alt = img.alt;
                imageModal.classList.remove('hidden');
            }
        });
    });
} 
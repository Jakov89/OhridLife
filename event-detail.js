document.addEventListener('DOMContentLoaded', () => {
    let eventData = null;
    let venuesData = [];
    
    // Initialize the page
    initializeEventPage();
    
    async function initializeEventPage() {
        try {
            // Get event ID from URL
            const eventId = getEventIdFromUrl();
            
            if (!eventId) {
                showError('Event ID not found in URL');
                return;
            }
            
            // Load venues data first
            await loadVenuesData();
            
            // Load event data
            await loadEventData(eventId);
            
            // Set up event listeners
            setupEventListeners();
            
        } catch (error) {
            console.error('Error initializing event page:', error);
            showError('Failed to load event details. Please try again.');
        }
    }
    
    function getEventIdFromUrl() {
        const pathParts = window.location.pathname.split('/').filter(part => part.length > 0);
        const eventId = pathParts[pathParts.length - 1];
        
        // Validate that we have a numeric event ID
        const parsedId = parseInt(eventId, 10);
        if (isNaN(parsedId) || parsedId <= 0) {
            console.error('Invalid event ID in URL:', eventId);
            return null;
        }
        
        return parsedId;
    }
    
    async function loadVenuesData() {
        try {
            // Try both venue endpoints to ensure compatibility
            let response = await fetch('/api/venues');
            if (!response.ok) {
                console.warn('Primary venues API failed, trying fallback');
                // If venues_reorganized doesn't work, try the original venues.json via direct fetch
                response = await fetch('/data/venues.json');
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const rawVenues = await response.json();
            venuesData = Array.isArray(rawVenues) ? rawVenues.map(normalizeVenueDataItem) : [];
            console.log('Loaded venues data:', venuesData.length, 'venues');
        } catch (error) {
            console.error('Failed to load venues data:', error);
            // Don't fail completely, just continue without venue data
            venuesData = [];
        }
    }
    
    async function loadEventData(eventId) {
        try {
            const response = await fetch(`/api/events/${eventId}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    showError('Event not found');
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return;
            }
            
            eventData = await response.json();
            
            if (!eventData) {
                throw new Error('Event data is empty');
            }
            
            displayEventData(eventData);
            
        } catch (error) {
            console.error('Error loading event data:', error);
            showError('Failed to load event details. Please check your connection and try again.');
        }
    }
    
    function displayEventData(event) {
        try {
            // Hide loading spinner
            document.getElementById('event-loading').style.display = 'none';
            
            // Show event card
            document.getElementById('event-detail-card').style.display = 'block';
            
            // Update page title
            document.title = `${event.eventName || 'Event'} - OhridHub`;
            
            // Event image - normalize image path
            const eventImage = document.getElementById('event-image');
            if (event.imageUrl) {
                // Normalize image path - ensure it starts with / but doesn't have double slashes
                const normalizedImageUrl = event.imageUrl.startsWith('/') ? event.imageUrl : `/${event.imageUrl}`;
                eventImage.src = normalizedImageUrl;
                eventImage.alt = event.eventName || 'Event image';
                eventImage.style.display = 'block';
            } else {
                eventImage.style.display = 'none';
            }
            
            // Event title and category
            document.getElementById('event-title').textContent = event.eventName || 'Event';
            document.getElementById('event-category').textContent = event.category || 'Event';
            
            // Date and time
            if (event.isoDate) {
                const eventDate = new Date(event.isoDate);
                const formattedDate = eventDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                const timeText = event.startTime ? `${formattedDate} at ${event.startTime}` : formattedDate;
                document.getElementById('event-date-time').textContent = timeText;
            } else {
                document.getElementById('event-date-time').textContent = 'Date to be announced';
            }
            
            // Location - improved venue lookup with fallback
            let locationText = 'To be announced';
            
            if (event.venueId && venuesData.length > 0) {
                const venue = venuesData.find(v => v.id === event.venueId || v.id === parseInt(event.venueId));
                if (venue) {
                    locationText = venue.name?.en || venue.name || event.locationName || 'Venue';
                }
            }
            
            if (locationText === 'To be announced' && event.locationName) {
                locationText = event.locationName;
            }
            
            document.getElementById('event-location').textContent = locationText;
            
            // Contact info
            const contactInfo = document.getElementById('event-contact-info');
            const contactText = document.getElementById('event-contact');
            if (event.eventContact) {
                contactInfo.style.display = 'flex';
                contactText.textContent = event.eventContact;
            } else {
                contactInfo.style.display = 'none';
            }
            
            // Price info
            const priceInfo = document.getElementById('event-price-info');
            const priceText = document.getElementById('event-price');
            if (event.ticketPrice) {
                priceInfo.style.display = 'flex';
                priceText.textContent = event.ticketPrice;
            } else {
                priceInfo.style.display = 'none';
            }
            
            // Description
            const descriptionEl = document.getElementById('event-description-content');
            if (event.description || event.longDescription) {
                const description = event.longDescription || event.description;
                descriptionEl.innerHTML = description.replace(/\n/g, '<br>');
            } else {
                descriptionEl.textContent = 'No description available.';
            }
            
            // Booking button
            const bookingBtn = document.getElementById('event-booking-btn');
            if (event.eventBookingUrl && event.eventBookingUrl !== '#' && event.eventBookingUrl.trim() !== '') {
                bookingBtn.href = event.eventBookingUrl;
                bookingBtn.style.display = 'inline-flex';
            } else {
                bookingBtn.style.display = 'none';
            }
            
            // Location map
            const mapContainer = document.getElementById('event-map-container');
            const mapSection = document.getElementById('event-location-map');
            
            if (event.locationIframe) {
                mapContainer.innerHTML = event.locationIframe;
                mapSection.style.display = 'block';
            } else {
                mapSection.style.display = 'none';
            }
            
        } catch (error) {
            console.error('Error displaying event data:', error);
            showError('Error displaying event information. Please refresh the page.');
        }
    }
    
    function setupEventListeners() {
        // Share event button
        document.getElementById('share-event-btn').addEventListener('click', shareEvent);
        
        // Add to planner button
        document.getElementById('add-to-planner-btn').addEventListener('click', addToPlanner);
        
        // Image click to open modal (if you want to add this feature)
        const eventImage = document.getElementById('event-image');
        eventImage.addEventListener('click', () => {
            if (eventImage.src) {
                openImageModal(eventImage.src);
            }
        });
    }
    
    function shareEvent() {
        const eventUrl = window.location.href;
        const eventTitle = eventData?.eventName || 'Event';
        const shareBtn = document.getElementById('share-event-btn');
        
        // Always copy to clipboard directly - no native share dialog
        navigator.clipboard.writeText(eventUrl).then(() => {
            showNotification('Event link copied to clipboard!');
            
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
    
    function addToPlanner() {
        if (!eventData) return;
        
        const plannerData = JSON.parse(localStorage.getItem('ohridHubPlanner')) || {};
        const eventDate = eventData.isoDate;
        
        if (!plannerData[eventDate]) {
            plannerData[eventDate] = [];
        }
        
        // Check if event already exists in planner
        const existingEvent = plannerData[eventDate].find(item => 
            item.eventId === eventData.id
        );
        
        if (existingEvent) {
            showNotification('Event already in your planner!');
            return;
        }
        
        // Add event to planner
        const plannerItem = {
            id: Date.now(),
            eventId: eventData.id,
            eventName: eventData.eventName,
            timeOfDay: getTimeOfDay(eventData.startTime),
            activityType: 'Event',
            venueId: eventData.venueId,
            time: eventData.startTime || '20:00',
            notes: `${eventData.eventName} - ${eventData.category}`,
            isEvent: true
        };
        
        plannerData[eventDate].push(plannerItem);
        localStorage.setItem('ohridHubPlanner', JSON.stringify(plannerData));
        
        showNotification('Event added to your day planner!');
    }
    
    function getTimeOfDay(time) {
        if (!time) return 'Evening';
        
        const hour = parseInt(time.split(':')[0]);
        if (hour < 12) return 'Morning';
        if (hour < 17) return 'Afternoon';
        return 'Evening';
    }
    
    function showError(message) {
        const loadingEl = document.getElementById('event-loading');
        if (loadingEl) {
            loadingEl.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 2rem;">
                    <h2 style="color: #dc3545; margin-bottom: 1rem;">Error</h2>
                    <p style="margin-bottom: 1.5rem;">${message}</p>
                    <button onclick="window.location.href='/'" class="btn btn-primary" style="margin-right: 1rem;">Go Home</button>
                    <button onclick="window.location.reload()" class="btn btn-secondary">Try Again</button>
                </div>
            `;
        } else {
            // Fallback if the loading element is not found
            alert(`Error: ${message}`);
        }
    }
    
    function showNotification(message) {
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
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    function openImageModal(imageSrc) {
        // Create image modal if it doesn't exist
        let imageModal = document.getElementById('image-modal');
        if (!imageModal) {
            imageModal = document.createElement('div');
            imageModal.id = 'image-modal';
            imageModal.className = 'modal-overlay';
            imageModal.innerHTML = `
                <div class="image-modal-content">
                    <button class="modal-close-button" id="image-modal-close">&times;</button>
                    <img id="modal-image-content" src="" alt="Event image">
                </div>
            `;
            document.body.appendChild(imageModal);
            
            // Add close listeners
            document.getElementById('image-modal-close').addEventListener('click', () => {
                imageModal.classList.add('hidden');
            });
            
            imageModal.addEventListener('click', (e) => {
                if (e.target === imageModal) {
                    imageModal.classList.add('hidden');
                }
            });
        }
        
        // Show modal with image
        document.getElementById('modal-image-content').src = imageSrc;
        imageModal.classList.remove('hidden');
    }
}); 
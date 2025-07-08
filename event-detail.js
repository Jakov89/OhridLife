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
            showError('Failed to load event details');
        }
    }
    
    function getEventIdFromUrl() {
        const pathParts = window.location.pathname.split('/');
        return pathParts[pathParts.length - 1];
    }
    
    async function loadVenuesData() {
        try {
            const response = await fetch('/api/venues');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const rawVenues = await response.json();
            venuesData = rawVenues.map(normalizeVenueDataItem);
        } catch (error) {
            console.error('Failed to load venues data:', error);
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
            displayEventData(eventData);
            
        } catch (error) {
            console.error('Error loading event data:', error);
            showError('Failed to load event details');
        }
    }
    
    function displayEventData(event) {
        // Hide loading spinner
        document.getElementById('event-loading').style.display = 'none';
        
        // Show event card
        document.getElementById('event-detail-card').style.display = 'block';
        
        // Update page title
        document.title = `${event.eventName} - OhridHub`;
        
        // Event image
        const eventImage = document.getElementById('event-image');
        if (event.imageUrl) {
            eventImage.src = event.imageUrl;
            eventImage.alt = event.eventName;
        } else {
            eventImage.style.display = 'none';
        }
        
        // Event title and category
        document.getElementById('event-title').textContent = event.eventName;
        document.getElementById('event-category').textContent = event.category;
        
        // Date and time
        const eventDate = new Date(event.isoDate);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const timeText = event.startTime ? `${formattedDate} at ${event.startTime}` : formattedDate;
        document.getElementById('event-date-time').textContent = timeText;
        
        // Location
        const venue = venuesData.find(v => v.id === event.venueId);
        const locationText = venue ? venue.name?.en || venue.name || event.locationName : event.locationName;
        document.getElementById('event-location').textContent = locationText || 'To be announced';
        
        // Contact info
        if (event.eventContact) {
            document.getElementById('event-contact-info').style.display = 'flex';
            document.getElementById('event-contact').textContent = event.eventContact;
        }
        
        // Price info
        if (event.ticketPrice) {
            document.getElementById('event-price-info').style.display = 'flex';
            document.getElementById('event-price').textContent = event.ticketPrice;
        }
        
        // Description
        const descriptionEl = document.getElementById('event-description-content');
        if (event.description) {
            descriptionEl.innerHTML = event.description.replace(/\n/g, '<br>');
        } else {
            descriptionEl.textContent = 'No description available.';
        }
        
        // Booking button
        const bookingBtn = document.getElementById('event-booking-btn');
        if (event.eventBookingUrl && event.eventBookingUrl !== '#') {
            bookingBtn.href = event.eventBookingUrl;
            bookingBtn.style.display = 'inline-flex';
        }
        
        // Location map
        if (event.locationIframe) {
            const mapContainer = document.getElementById('event-map-container');
            mapContainer.innerHTML = event.locationIframe;
            document.getElementById('event-location-map').style.display = 'block';
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
        const eventText = `Check out this event: ${eventTitle}`;
        
        if (navigator.share) {
            // Use native share API if available
            navigator.share({
                title: eventTitle,
                text: eventText,
                url: eventUrl
            }).catch(err => {
                console.log('Error sharing:', err);
                fallbackShare(eventUrl, eventText);
            });
        } else {
            fallbackShare(eventUrl, eventText);
        }
    }
    
    function fallbackShare(url, text) {
        // Copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Event link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
            // Fallback to showing the URL
            prompt('Copy this link to share:', url);
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
        document.getElementById('event-loading').innerHTML = `
            <div class="error-message">
                <h2>Error</h2>
                <p>${message}</p>
                <button onclick="window.location.href='/'" class="btn btn-primary">Go Home</button>
            </div>
        `;
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
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
        
        // Instagram Story button
        document.getElementById('instagram-story-btn').addEventListener('click', openInstagramStoryModal);
        
        // Add to planner button
        document.getElementById('add-to-planner-btn').addEventListener('click', addToPlanner);
        
        // Image click to open modal (if you want to add this feature)
        const eventImage = document.getElementById('event-image');
        eventImage.addEventListener('click', () => {
            if (eventImage.src) {
                openImageModal(eventImage.src);
            }
        });
        
        // Instagram Story modal listeners
        setupInstagramStoryModalListeners();
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
    
    // Instagram Story functionality
    let selectedTemplate = 'gradient-1';
    
    function setupInstagramStoryModalListeners() {
        // Modal close
        document.getElementById('instagram-story-modal-close').addEventListener('click', closeInstagramStoryModal);
        document.getElementById('instagram-story-modal').addEventListener('click', (e) => {
            if (e.target.id === 'instagram-story-modal') {
                closeInstagramStoryModal();
            }
        });
        
        // Template selection
        const templateOptions = document.querySelectorAll('.template-option');
        templateOptions.forEach(option => {
            option.addEventListener('click', () => {
                templateOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                selectedTemplate = option.dataset.template;
                updateStoryCardPreview();
            });
        });
        
        // Download button
        document.getElementById('download-story-btn').addEventListener('click', downloadStoryImage);
        
        // Open Instagram button
        document.getElementById('open-instagram-btn').addEventListener('click', openInstagramApp);
    }
    
    function openInstagramStoryModal() {
        if (!eventData) return;
        
        const modal = document.getElementById('instagram-story-modal');
        updateStoryCardPreview();
        modal.classList.add('visible');
    }
    
    function closeInstagramStoryModal() {
        const modal = document.getElementById('instagram-story-modal');
        modal.classList.remove('visible');
    }
    
    function updateStoryCardPreview() {
        if (!eventData) return;
        
        const preview = document.getElementById('story-card-preview');
        const gradients = {
            'gradient-1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'gradient-2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'gradient-3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'gradient-4': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'gradient-5': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        };
        
        preview.style.background = gradients[selectedTemplate];
        
        // Update content
        const eventDate = new Date(eventData.isoDate);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        document.getElementById('story-card-date').textContent = formattedDate;
        document.getElementById('story-card-title').textContent = eventData.eventName || 'Event';
        document.getElementById('story-card-category').textContent = eventData.category || 'Event';
        document.getElementById('story-card-venue').textContent = `📍 ${eventData.locationName || 'Ohrid'}`;
        document.getElementById('story-card-time').textContent = `🕐 ${eventData.startTime || '20:00'}`;
        
        // Update image
        const storyImage = document.getElementById('story-card-image');
        if (eventData.imageUrl) {
            storyImage.src = eventData.imageUrl;
            storyImage.style.display = 'block';
        } else {
            storyImage.style.display = 'none';
        }
    }
    
    function downloadStoryImage() {
        if (!eventData) return;
        
        console.log('Starting story image download for event:', eventData.eventName);
        
        // Create a high-resolution temporary preview element
        const tempPreview = createHighResolutionPreview();
        
        // Use html2canvas to capture the high-resolution preview
        if (typeof html2canvas !== 'undefined') {
            html2canvas(tempPreview, {
                width: 1080,
                height: 1920,
                scale: 1, // No scaling needed as we're already at target resolution
                backgroundColor: null,
                logging: false,
                allowTaint: true,
                useCORS: true
            }).then(canvas => {
                // Clean up the temporary element
                document.body.removeChild(tempPreview);
                downloadCanvas(canvas);
            }).catch(error => {
                console.error('html2canvas failed, falling back to manual drawing:', error);
                document.body.removeChild(tempPreview);
                downloadStoryImageManual();
            });
        } else {
            document.body.removeChild(tempPreview);
            downloadStoryImageManual();
        }
    }
    
    function createHighResolutionPreview() {
        const tempPreview = document.createElement('div');
        tempPreview.className = 'story-card-preview';
        tempPreview.id = 'temp-story-card-preview';
        
        // Set to Instagram Story resolution
        tempPreview.style.width = '1080px';
        tempPreview.style.height = '1920px';
        tempPreview.style.position = 'absolute';
        tempPreview.style.left = '-9999px'; // Hide off-screen
        tempPreview.style.top = '-9999px';
        
        // Apply the same gradient background
        const gradients = {
            'gradient-1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'gradient-2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'gradient-3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'gradient-4': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'gradient-5': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        };
        
        tempPreview.style.background = gradients[selectedTemplate] || gradients['gradient-1'];
        tempPreview.style.borderRadius = '2rem';
        tempPreview.style.overflow = 'hidden';
        
        // Create content structure with proper sizing for high resolution
        const content = document.createElement('div');
        content.className = 'story-card-content';
        content.style.width = '100%';
        content.style.height = '100%';
        content.style.display = 'flex';
        content.style.flexDirection = 'column';
        content.style.justifyContent = 'space-between';
        content.style.padding = '120px 80px';
        content.style.color = 'white';
        content.style.textAlign = 'center';
        content.style.position = 'relative';
        
        // Add overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.background = 'linear-gradient(45deg, rgba(0,0,0,0.3), transparent)';
        overlay.style.zIndex = '1';
        content.appendChild(overlay);
        
        // Header section
        const header = document.createElement('div');
        header.style.position = 'relative';
        header.style.zIndex = '2';
        header.style.textAlign = 'center';
        
        const eventDate = new Date(eventData.isoDate);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        const dateElement = document.createElement('div');
        dateElement.textContent = formattedDate;
        dateElement.style.fontSize = '48px';
        dateElement.style.opacity = '0.9';
        dateElement.style.marginBottom = '40px';
        dateElement.style.textTransform = 'uppercase';
        dateElement.style.letterSpacing = '4px';
        dateElement.style.fontWeight = '600';
        header.appendChild(dateElement);
        
        const titleElement = document.createElement('div');
        titleElement.textContent = eventData.eventName || 'Event';
        titleElement.style.fontSize = '80px';
        titleElement.style.fontWeight = '700';
        titleElement.style.marginBottom = '40px';
        titleElement.style.lineHeight = '1.2';
        titleElement.style.wordWrap = 'break-word';
        header.appendChild(titleElement);
        
        const categoryElement = document.createElement('div');
        categoryElement.textContent = eventData.category || 'Event';
        categoryElement.style.fontSize = '36px';
        categoryElement.style.background = 'rgba(255, 255, 255, 0.2)';
        categoryElement.style.padding = '16px 48px';
        categoryElement.style.borderRadius = '50px';
        categoryElement.style.display = 'inline-block';
        categoryElement.style.backdropFilter = 'blur(10px)';
        categoryElement.style.fontWeight = '500';
        header.appendChild(categoryElement);
        
        // Image section
        const imageContainer = document.createElement('div');
        imageContainer.style.position = 'relative';
        imageContainer.style.zIndex = '2';
        imageContainer.style.display = 'flex';
        imageContainer.style.justifyContent = 'center';
        imageContainer.style.alignItems = 'center';
        imageContainer.style.minHeight = '600px';
        
        if (eventData.imageUrl) {
            const img = document.createElement('img');
            img.src = eventData.imageUrl;
            img.style.width = '480px';
            img.style.height = '480px';
            img.style.borderRadius = '50%';
            img.style.objectFit = 'cover';
            img.style.border = '12px solid rgba(255, 255, 255, 0.3)';
            img.style.boxShadow = '0 16px 60px rgba(0, 0, 0, 0.3)';
            imageContainer.appendChild(img);
        }
        
        // Footer section
        const footer = document.createElement('div');
        footer.style.position = 'relative';
        footer.style.zIndex = '2';
        footer.style.textAlign = 'center';
        
        const venueElement = document.createElement('div');
        venueElement.textContent = `📍 ${eventData.locationName || 'Ohrid'}`;
        venueElement.style.fontSize = '52px';
        venueElement.style.opacity = '0.9';
        venueElement.style.marginBottom = '32px';
        venueElement.style.fontWeight = '500';
        footer.appendChild(venueElement);
        
        const timeElement = document.createElement('div');
        timeElement.textContent = `🕐 ${eventData.startTime || '20:00'}`;
        timeElement.style.fontSize = '64px';
        timeElement.style.fontWeight = '600';
        timeElement.style.marginBottom = '40px';
        footer.appendChild(timeElement);
        
        const brandingElement = document.createElement('div');
        brandingElement.textContent = 'OHRIDHUB';
        brandingElement.style.fontSize = '44px';
        brandingElement.style.opacity = '0.8';
        brandingElement.style.fontWeight = '500';
        brandingElement.style.textTransform = 'uppercase';
        brandingElement.style.letterSpacing = '4px';
        footer.appendChild(brandingElement);
        
        // Assemble the structure
        content.appendChild(header);
        content.appendChild(imageContainer);
        content.appendChild(footer);
        tempPreview.appendChild(content);
        
        // Add to DOM temporarily
        document.body.appendChild(tempPreview);
        
        return tempPreview;
    }
    
    function downloadStoryImageManual() {
        if (!eventData) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Instagram Story dimensions (9:16 aspect ratio)
        canvas.width = 1080;
        canvas.height = 1920;
        
        // Get gradient
        const gradients = {
            'gradient-1': ['#667eea', '#764ba2'],
            'gradient-2': ['#f093fb', '#f5576c'],
            'gradient-3': ['#4facfe', '#00f2fe'],
            'gradient-4': ['#43e97b', '#38f9d7'],
            'gradient-5': ['#fa709a', '#fee140']
        };
        
        const [color1, color2] = gradients[selectedTemplate];
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        
        // Fill background
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Set text color
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        
        // Date
        const eventDate = new Date(eventData.isoDate);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).toUpperCase();
        
        ctx.font = 'bold 32px Arial';
        ctx.fillText(formattedDate, canvas.width / 2, 200);
        
        // Event title
        ctx.font = 'bold 56px Arial';
        const title = eventData.eventName || 'Event';
        wrapText(ctx, title, canvas.width / 2, 300, canvas.width - 200, 80);
        
        // Category badge
        ctx.font = '28px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        const category = eventData.category || 'Event';
        const categoryWidth = ctx.measureText(category).width + 40;
        const categoryX = (canvas.width - categoryWidth) / 2;
        ctx.fillRect(categoryX, 420, categoryWidth, 60);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillText(category, canvas.width / 2, 460);
        
        // Venue and time
        ctx.fillStyle = 'white';
        ctx.font = '36px Arial';
        ctx.fillText(`📍 ${eventData.locationName || 'Ohrid'}`, canvas.width / 2, 1650);
        ctx.fillText(`🕐 ${eventData.startTime || '20:00'}`, canvas.width / 2, 1720);
        
        // Branding
        ctx.font = 'bold 32px Arial';
        ctx.fillText('OHRIDHUB', canvas.width / 2, 1800);
        
        // Load and draw event image if available
        if (eventData.imageUrl) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function() {
                // Draw circular image
                ctx.save();
                ctx.beginPath();
                ctx.arc(canvas.width / 2, 950, 200, 0, 2 * Math.PI);
                ctx.clip();
                ctx.drawImage(img, canvas.width / 2 - 200, 750, 400, 400);
                ctx.restore();
                
                // Add border
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.arc(canvas.width / 2, 950, 200, 0, 2 * Math.PI);
                ctx.stroke();
                
                downloadCanvas(canvas);
            };
            img.onerror = function() {
                downloadCanvas(canvas);
            };
            img.src = eventData.imageUrl;
        } else {
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
        const link = document.createElement('a');
        link.download = `${eventData.eventName || 'event'}-instagram-story.png`;
        link.href = canvas.toDataURL();
        link.click();
    }
    
    function openInstagramApp() {
        // Check if it's a mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            // Try to open Instagram app
            const instagramURL = 'instagram://camera';
            window.location.href = instagramURL;
            
            // Fallback to Instagram web after a short delay
            setTimeout(() => {
                window.open('https://www.instagram.com/', '_blank');
            }, 1000);
        } else {
            // On desktop, open Instagram web
            window.open('https://www.instagram.com/', '_blank');
        }
    }
}); 
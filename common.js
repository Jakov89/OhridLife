// Enhanced Navbar System
class NavbarManager {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.hamburger = null;
        this.navLinksContainer = null;
        this.lastScrollTop = 0;
        this.scrollThreshold = 100;
        this.scrollTimeout = null;
        this.isMenuOpen = false;
        
        this.init();
    }
    
    init() {
        this.render();
        this.setupEventListeners();
        this.handleActiveLink();
        this.setupScrollBehavior();
    }
    
    render() {
        if (!this.navbar) return;
        const container = this.navbar.querySelector('.container');
        if (!container) return;

        container.innerHTML = `
            <div class="nav-logo">
                <a href="/"><span class="logo-main">OhridHub</span></a>
            </div>
            <nav class="nav-links-container">
                <ul class="nav-links">
                    <li><a href="/" data-id="home">Home</a></li>
                    <li><a href="/#plan-your-visit" data-id="events">Events</a></li>
                    <li><a href="/artists" data-id="artists">Artists</a></li>
                    <li><a href="/day-planner" data-id="planner">Day Planner</a></li>
                    <li><a href="/learn.html" data-id="learn">Learn Ohrid</a></li>
                </ul>
            </nav>
            <button class="hamburger-menu" aria-label="Open navigation menu">
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
            </button>
        `;
        
        // Store references to elements
        this.hamburger = this.navbar.querySelector('.hamburger-menu');
        this.navLinksContainer = this.navbar.querySelector('.nav-links-container');
    }
    
    setupEventListeners() {
        if (!this.hamburger || !this.navLinksContainer) return;
        
        // Mobile menu toggle
        this.hamburger.addEventListener('click', () => this.toggleMobileMenu());
        
        // Close menu on link click
        this.navLinksContainer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    this.closeMobileMenu();
                }
            });
        });
        
        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && 
                !this.hamburger.contains(e.target) && 
                !this.navLinksContainer.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
        
        // Handle resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (window.innerWidth > 768 && this.isMenuOpen) {
                    this.closeMobileMenu();
                }
            }, 100);
        });
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }
    
    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.hamburger.classList.toggle('active');
        this.navLinksContainer.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    }
    
    closeMobileMenu() {
        this.isMenuOpen = false;
        this.hamburger.classList.remove('active');
        this.navLinksContainer.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
    
    handleActiveLink() {
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;
        
        this.navbar.querySelectorAll('.nav-links a').forEach(link => {
            const linkPath = link.getAttribute('href');
            
            // Handle both path and hash matches
            if ((currentPath === '/' && linkPath === '/') || 
                (currentPath !== '/' && linkPath.includes(currentPath)) ||
                (currentHash && linkPath.includes(currentHash))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    setupScrollBehavior() {
        let lastScrollTop = 0;
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add condensed class when scrolling down
            if (currentScroll > 0) {
                this.navbar.classList.add('nav-condensed');
            } else {
                this.navbar.classList.remove('nav-condensed');
            }
            
            // Hide navbar when scrolling down, show when scrolling up
            if (currentScroll > lastScrollTop && currentScroll > this.scrollThreshold) {
                // Scrolling down
                this.navbar.classList.add('nav-hidden');
            } else {
                // Scrolling up
                this.navbar.classList.remove('nav-hidden');
            }
            
            lastScrollTop = currentScroll;
            
            // Reset scroll direction detection after scroll stops
            scrollTimeout = setTimeout(() => {
                this.navbar.classList.remove('nav-hidden');
            }, 150);
        }, { passive: true }); // Performance optimization for scroll listener
    }
}

// Initialize navbar
document.addEventListener('DOMContentLoaded', () => {
    window.navbarManager = new NavbarManager();
    renderFooter();
});

function renderFooter() {
    const footer = document.getElementById('page-footer');
    if (!footer) return;

    footer.innerHTML = `
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3><span class="footer-logo-main">OhridHub</span></h3>
                    <p>Your ultimate guide to discovering the best events, venues, and experiences in the beautiful city of Ohrid, North Macedonia.</p>
                    <div class="footer-socials">
                        <a href="https://www.instagram.com/ohridhub/" target="_blank" rel="noopener noreferrer" aria-label="Visit our Instagram page">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </a>
                        <a href="https://www.facebook.com/profile.php?id=61577806165599" target="_blank" rel="noopener noreferrer" aria-label="Visit our Facebook page">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                        </a>
                        <a href="mailto:contact@ohridlife.com" aria-label="Contact us via email">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        </a>
                        <a href="https://www.tiktok.com/@ohridhub" target="_blank" rel="noopener noreferrer" aria-label="Visit our TikTok page">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                        </a>
                    </div>
                </div>
                
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/#plan-your-visit">Events</a></li>
                        <li><a href="/artists">Artists</a></li>
                        <li><a href="/day-planner">Day Planner</a></li>
                        <li><a href="/learn.html">Learn About Ohrid</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4>Explore</h4>
                    <ul>
                        <li><a href="/#discover-places">Venues & Places</a></li>
                        <li><a href="/#discover-places">Restaurants</a></li>
                        <li><a href="/#discover-places">Nightlife</a></li>
                        <li><a href="/#discover-places">Activities</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4>About Ohrid</h4>
                    <ul>
                        <li><a href="https://ohrid.gov.mk/%D0%B8%D1%81%D1%82%D0%BE%D1%80%D0%B8%D1%98%D0%B0-%D0%B7%D0%B0-%D0%BE%D1%85%D1%80%D0%B8%D0%B4/" target="_blank" rel="noopener noreferrer">History & Culture</a></li>
                        <li><a href="https://whc.unesco.org/en/list/99/" target="_blank" rel="noopener noreferrer">UNESCO Heritage</a></li>
                        <li><a href="/learn-ohrid">Local Traditions (Work In Progress)</a></li>
                        <li><a href="/learn-ohrid">Travel Tips (Work In Progress)</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4>Contact & Info</h4>
                    <ul>
                        <li><a href="mailto:contact@ohridhub.mk">Get in Touch</a></li>
                        <li><a href="mailto:contact@ohridhub.mk">Submit Event</a></li>
                        <li><a href="mailto:contact@ohridhub.mk">Add Your Venue</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} OhridHub. Made with ❤️ for Ohrid lovers worldwide.</p>
            </div>
        </div>
    `;
}

function normalizeVenueDataItem(venue) {
    const newVenue = { ...venue };
    if (typeof venue.name === 'string') {
        newVenue.name = { en: venue.name };
    }
    if (typeof venue.description === 'string') {
        newVenue.description = { en: venue.description };
    }
    if (typeof venue.type === 'string' || Array.isArray(venue.type)) {
        newVenue.type = { en: venue.type };
    }
    return newVenue;
} 

// Dynamic Meta Tag Management System
class MetaTagManager {
    static updatePageMeta(data) {
        // Update basic meta tags
        if (data.title) {
            document.title = data.title;
            this.updateMetaTag('og:title', data.title);
            this.updateMetaTag('twitter:title', data.title);
        }
        
        if (data.description) {
            this.updateMetaTag('description', data.description);
            this.updateMetaTag('og:description', data.description);
            this.updateMetaTag('twitter:description', data.description);
        }
        
        if (data.image) {
            const fullImageUrl = data.image.startsWith('http') ? data.image : `https://www.ohridhub.mk${data.image}`;
            this.updateMetaTag('og:image', fullImageUrl);
            this.updateMetaTag('twitter:image', fullImageUrl);
        }
        
        if (data.url) {
            const fullUrl = data.url.startsWith('http') ? data.url : `https://www.ohridhub.mk${data.url}`;
            this.updateMetaTag('og:url', fullUrl);
            this.updateMetaTag('twitter:url', fullUrl);
            this.updateLinkTag('canonical', fullUrl);
        }
        
        if (data.keywords) {
            this.updateMetaTag('keywords', data.keywords);
        }
        
        // Add structured data
        if (data.structuredData) {
            this.addStructuredData(data.structuredData);
        }
    }
    
    static updateMetaTag(name, content) {
        // Handle property-based meta tags (Open Graph, Twitter)
        let selector = `meta[property="${name}"]`;
        let meta = document.querySelector(selector);
        
        // If not found, try name-based meta tags
        if (!meta) {
            selector = `meta[name="${name}"]`;
            meta = document.querySelector(selector);
        }
        
        if (meta) {
            meta.setAttribute('content', content);
        } else {
            // Create new meta tag if it doesn't exist
            meta = document.createElement('meta');
            if (name.includes(':')) {
                meta.setAttribute('property', name);
            } else {
                meta.setAttribute('name', name);
            }
            meta.setAttribute('content', content);
            document.head.appendChild(meta);
        }
    }
    
    static updateLinkTag(rel, href) {
        let link = document.querySelector(`link[rel="${rel}"]`);
        if (link) {
            link.setAttribute('href', href);
        } else {
            link = document.createElement('link');
            link.setAttribute('rel', rel);
            link.setAttribute('href', href);
            document.head.appendChild(link);
        }
    }
    
    static addStructuredData(data) {
        // Remove existing structured data
        const existing = document.querySelector('script[type="application/ld+json"]');
        if (existing) {
            existing.remove();
        }
        
        // Add new structured data
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    }
    
    // Generate venue-specific meta data
    static generateVenueMeta(venue) {
        const title = `${venue.name} - ${venue.type} in Ohrid | OhridHub`;
        const description = `${venue.description.substring(0, 150)}... Discover ${venue.name}, a popular ${venue.type} in Ohrid. View photos, location, and more on OhridHub.`;
        const keywords = `${venue.name}, ${venue.type}, Ohrid, North Macedonia, ${venue.tags ? venue.tags.join(', ') : ''}`;
        const url = `/venue-detail.html?id=${venue.id}`;
        const image = venue.imageUrl || '/images_ohrid/photo1.jpg';
        
        const structuredData = {
            "@context": "https://schema.org",
            "@type": venue.type === 'restaurant' ? 'Restaurant' : 'LocalBusiness',
            "name": venue.name,
            "description": venue.description,
            "image": `https://www.ohridhub.mk${image}`,
            "url": `https://www.ohridhub.mk${url}`,
            "address": venue.location ? {
                "@type": "PostalAddress",
                "addressLocality": "Ohrid",
                "addressCountry": "North Macedonia",
                "streetAddress": venue.location.address
            } : undefined,
            "telephone": venue.phone,
            "priceRange": venue.priceLevel ? '$'.repeat(venue.priceLevel) : undefined,
            "aggregateRating": venue.rating ? {
                "@type": "AggregateRating",
                "ratingValue": venue.rating,
                "ratingCount": venue.ratingCount || 1
            } : undefined
        };
        
        return { title, description, keywords, url, image, structuredData };
    }
    
    // Generate event-specific meta data
    static generateEventMeta(event) {
        const title = `${event.title} - ${event.category} Event in Ohrid | OhridHub`;
        const description = `${event.description.substring(0, 150)}... Join this ${event.category} event on ${event.date} in Ohrid. ${event.ticketPrice}. More details on OhridHub.`;
        const keywords = `${event.title}, ${event.category}, Ohrid events, ${event.date}, ${event.locationName}`;
        const url = `/event-detail.html?id=${event.id}`;
        const image = event.imageUrl || '/images_ohrid/photo1.jpg';
        
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": event.title,
            "description": event.description,
            "image": `https://www.ohridhub.mk${image}`,
            "url": `https://www.ohridhub.mk${url}`,
            "startDate": event.isoDate + 'T' + (event.startTime || '20:00'),
            "location": {
                "@type": "Place",
                "name": event.locationName,
                "address": "Ohrid, North Macedonia"
            },
            "organizer": {
                "@type": "Organization",
                "name": "OhridHub"
            },
            "offers": event.ticketPrice !== 'Free Entry' ? {
                "@type": "Offer",
                "price": event.ticketPrice,
                "priceCurrency": "MKD",
                "availability": "https://schema.org/InStock"
            } : undefined
        };
        
        return { title, description, keywords, url, image, structuredData };
    }
}

// Enhanced Loading System for Better UX
class LoadingManager {
    static createSkeletonScreen(target, type = 'default') {
        const skeleton = document.createElement('div');
        skeleton.className = 'loading-skeleton-container';
        
        let skeletonHTML = '';
        
        switch (type) {
            case 'venue-card':
                skeletonHTML = `
                    <div class="loading-skeleton skeleton-image" style="width: 100%; height: 200px; margin-bottom: 1rem;"></div>
                    <div class="loading-skeleton skeleton-text" style="width: 70%; height: 1.5rem; margin-bottom: 0.5rem;"></div>
                    <div class="loading-skeleton skeleton-text" style="width: 90%; height: 1rem; margin-bottom: 0.5rem;"></div>
                    <div class="loading-skeleton skeleton-text" style="width: 60%; height: 1rem;"></div>
                `;
                break;
            case 'event-card':
                skeletonHTML = `
                    <div class="loading-skeleton skeleton-image" style="width: 100%; height: 150px; margin-bottom: 1rem;"></div>
                    <div class="loading-skeleton skeleton-text" style="width: 80%; height: 1.5rem; margin-bottom: 0.5rem;"></div>
                    <div class="loading-skeleton skeleton-text" style="width: 50%; height: 1rem; margin-bottom: 0.5rem;"></div>
                    <div class="loading-skeleton skeleton-text" style="width: 40%; height: 1rem;"></div>
                `;
                break;
            case 'venue-detail':
                skeletonHTML = `
                    <div class="loading-skeleton skeleton-image" style="width: 100%; height: 400px; margin-bottom: 2rem;"></div>
                    <div class="loading-skeleton skeleton-text" style="width: 60%; height: 2.5rem; margin-bottom: 1rem;"></div>
                    <div class="loading-skeleton skeleton-text" style="width: 100%; height: 1rem; margin-bottom: 0.5rem;"></div>
                    <div class="loading-skeleton skeleton-text" style="width: 100%; height: 1rem; margin-bottom: 0.5rem;"></div>
                    <div class="loading-skeleton skeleton-text" style="width: 80%; height: 1rem; margin-bottom: 2rem;"></div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <div class="loading-skeleton skeleton-image" style="width: 100%; height: 150px;"></div>
                        <div class="loading-skeleton skeleton-image" style="width: 100%; height: 150px;"></div>
                        <div class="loading-skeleton skeleton-image" style="width: 100%; height: 150px;"></div>
                    </div>
                `;
                break;
            default:
                skeletonHTML = `
                    <div class="loading-skeleton skeleton-text" style="width: 80%; height: 1.5rem; margin-bottom: 1rem;"></div>
                    <div class="loading-skeleton skeleton-text" style="width: 100%; height: 1rem; margin-bottom: 0.5rem;"></div>
                    <div class="loading-skeleton skeleton-text" style="width: 90%; height: 1rem;"></div>
                `;
        }
        
        skeleton.innerHTML = skeletonHTML;
        target.appendChild(skeleton);
        return skeleton;
    }
    
    static removeSkeletonScreen(target) {
        const skeletons = target.querySelectorAll('.loading-skeleton-container');
        skeletons.forEach(skeleton => skeleton.remove());
    }
    
    static showErrorState(target, message = 'Something went wrong. Please try again.', retry = null) {
        target.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>Oops!</h3>
                <p>${message}</p>
                ${retry ? '<button class="retry-button btn-primary" onclick="' + retry + '">Try Again</button>' : ''}
            </div>
        `;
    }
    
    static showEmptyState(target, message = 'No items found', description = '') {
        target.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>${message}</h3>
                ${description ? `<p>${description}</p>` : ''}
            </div>
        `;
    }
}

// Enhanced Toast Notification System
class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = new Map();
        this.createContainer();
    }

    createContainer() {
        if (document.querySelector('.toast-container')) return;
        
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    show(options) {
        const {
            type = 'info',
            title,
            message,
            duration = 5000,
            persistent = false,
            action = null
        } = options;

        const toast = document.createElement('div');
        const toastId = Date.now() + Math.random();
        toast.className = `toast ${type}`;
        toast.setAttribute('data-toast-id', toastId);

        const icon = this.getIcon(type);
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close notification">×</button>
            ${!persistent ? '<div class="toast-progress"></div>' : ''}
        `;

        // Add event listeners
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.hide(toastId));

        // Add action button if provided
        if (action) {
            const actionBtn = document.createElement('button');
            actionBtn.className = 'btn btn-sm btn-primary';
            actionBtn.textContent = action.text;
            actionBtn.addEventListener('click', () => {
                action.callback();
                this.hide(toastId);
            });
            toast.querySelector('.toast-content').appendChild(actionBtn);
        }

        this.container.appendChild(toast);
        this.toasts.set(toastId, { element: toast, timer: null });

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto-hide with progress bar
        if (!persistent && duration > 0) {
            const progressBar = toast.querySelector('.toast-progress');
            if (progressBar) {
                progressBar.style.width = '100%';
                progressBar.style.transitionDuration = `${duration}ms`;
                requestAnimationFrame(() => {
                    progressBar.style.width = '0%';
                });
            }

            const timer = setTimeout(() => {
                this.hide(toastId);
            }, duration);

            this.toasts.get(toastId).timer = timer;
        }

        return toastId;
    }

    hide(toastId) {
        const toastData = this.toasts.get(toastId);
        if (!toastData) return;

        const { element, timer } = toastData;
        
        if (timer) {
            clearTimeout(timer);
        }

        element.classList.remove('show');
        element.classList.add('hide');

        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.toasts.delete(toastId);
        }, 300);
    }

    hideAll() {
        this.toasts.forEach((_, toastId) => {
            this.hide(toastId);
        });
    }

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ⓘ'
        };
        return icons[type] || icons.info;
    }

    // Convenience methods
    success(message, title = 'Success') {
        return this.show({ type: 'success', title, message });
    }

    error(message, title = 'Error') {
        return this.show({ type: 'error', title, message, duration: 7000 });
    }

    warning(message, title = 'Warning') {
        return this.show({ type: 'warning', title, message, duration: 6000 });
    }

    info(message, title = '') {
        return this.show({ type: 'info', title, message });
    }
}

// Create global toast instance
const Toast = new ToastManager();

// Enhanced Error Handler with User-Friendly Messages
class ErrorHandler {
    static handle(error, context = '') {
        console.error(`Error ${context}:`, error);
        
        let userMessage = 'Something went wrong. Please try again.';
        let title = 'Error';
        
        if (error.message) {
            if (error.message.includes('fetch')) {
                userMessage = 'Unable to connect to the server. Please check your internet connection.';
                title = 'Connection Error';
            } else if (error.message.includes('404')) {
                userMessage = 'The requested content was not found.';
                title = 'Not Found';
            } else if (error.message.includes('500')) {
                userMessage = 'Server error. Please try again later.';
                title = 'Server Error';
            } else if (error.message.includes('Network')) {
                userMessage = 'Network error. Please check your connection and try again.';
                title = 'Network Error';
            }
        }
        
        Toast.error(userMessage, title);
    }
    
    static handleApiError(response, context = '') {
        let message = 'An unexpected error occurred.';
        let title = 'Error';
        
        switch (response.status) {
            case 404:
                message = 'The requested content was not found.';
                title = 'Not Found';
                break;
            case 500:
                message = 'Server error. Please try again later.';
                title = 'Server Error';
                break;
            case 403:
                message = 'You do not have permission to access this content.';
                title = 'Access Denied';
                break;
            case 429:
                message = 'Too many requests. Please wait a moment and try again.';
                title = 'Rate Limited';
                break;
            default:
                message = `Request failed with status ${response.status}.`;
        }
        
        Toast.error(message, title);
    }
}

// Performance monitoring utility
class PerformanceMonitor {
    static measurePageLoad() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                    
                    // Log performance metrics (can be sent to analytics)
                    console.log('Page Load Metrics:', {
                        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        fullLoad: loadTime,
                        firstByte: perfData.responseStart - perfData.requestStart
                    });
                    
                    // Mark as performance issue if load time > 3 seconds
                    if (loadTime > 3000) {
                        console.warn('Slow page load detected:', loadTime + 'ms');
                    }
                }, 0);
            });
        }
    }
    
    static observeLayoutShifts() {
        if ('LayoutShiftObserver' in window) {
            let clsValue = 0;
            let clsEntries = [];
            
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        clsEntries.push(entry);
                    }
                }
                
                if (clsValue > 0.1) {
                    console.warn('Layout shift detected:', clsValue);
                }
            });
            
            observer.observe({ entryTypes: ['layout-shift'] });
        }
    }
}

// Enhanced image loading with WebP support and lazy loading
class ImageOptimizer {
    static supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    
    static optimizeImage(img) {
        // Add intersection observer for better lazy loading
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const image = entry.target;
                        this.loadImage(image);
                        observer.unobserve(image);
                    }
                });
            }, {
                rootMargin: '50px'
            });
            
            imageObserver.observe(img);
        } else {
            // Fallback for browsers without IntersectionObserver
            this.loadImage(img);
        }
    }
    
    static loadImage(img) {
        const src = img.dataset.src || img.src;
        
        // Try WebP if supported
        if (this.supportsWebP() && src.includes('.jpg')) {
            const webpSrc = src.replace('.jpg', '.webp');
            
            // Test if WebP version exists
            const testImg = new Image();
            testImg.onload = () => {
                img.src = webpSrc;
                img.classList.add('loaded');
            };
            testImg.onerror = () => {
                img.src = src;
                img.classList.add('loaded');
            };
            testImg.src = webpSrc;
        } else {
            img.src = src;
            img.classList.add('loaded');
        }
    }
    
    static initializeImageOptimization() {
        // Only process images with data-src attribute (new lazy loaded images)
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.optimizeImage(img);
        });
        
        // Ensure existing images are visible and working
        document.querySelectorAll('img:not([data-src])').forEach(img => {
            if (!img.complete) {
                img.addEventListener('load', () => {
                    img.style.opacity = '1';
                });
            } else {
                img.style.opacity = '1';
            }
        });
        
        // Observer for dynamically added images - only process new data-src images
        if ('MutationObserver' in window) {
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1) {
                                // Only process images with data-src (new lazy loaded images)
                                const lazyImages = node.querySelectorAll ? node.querySelectorAll('img[data-src]') : [];
                                lazyImages.forEach(img => this.optimizeImage(img));
                                
                                // Ensure regular images are visible
                                const regularImages = node.querySelectorAll ? node.querySelectorAll('img:not([data-src])') : [];
                                regularImages.forEach(img => {
                                    img.style.opacity = '1';
                                });
                            }
                        });
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }
}

// Initialize performance monitoring
document.addEventListener('DOMContentLoaded', () => {
    PerformanceMonitor.measurePageLoad();
    PerformanceMonitor.observeLayoutShifts();
    
    // Immediate fix: ensure all existing images are visible
    document.querySelectorAll('img:not([data-src])').forEach(img => {
        img.style.opacity = '1';
    });
    
    ImageOptimizer.initializeImageOptimization();
});

// Lazy loading for images - Performance optimization
const lazyLoadImages = () => {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
        img.classList.add('lazy');
        imageObserver.observe(img);
    });
};

// Initialize lazy loading when DOM is ready
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Export for use in other files
window.MetaTagManager = MetaTagManager; 
window.LoadingManager = LoadingManager;
window.PerformanceMonitor = PerformanceMonitor;
window.ImageOptimizer = ImageOptimizer;
window.lazyLoadImages = lazyLoadImages; 
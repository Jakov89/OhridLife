function renderNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    const container = navbar.querySelector('.container');
    if (!container) return;

    container.innerHTML = `
        <div class="nav-logo">
            <a href="/"><span class="logo-main">OhridHub</span></a>
        </div>
        <nav class="nav-links-container">
            <ul class="nav-links">
                <li><a href="/" data-id="home">Home</a></li>
                <li><a href="/#plan-your-visit" data-id="events">Events</a></li>
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
}

function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinksContainer = document.querySelector('.nav-links-container');

    if (hamburger && navLinksContainer) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
            document.body.style.overflow = navLinksContainer.classList.contains('active') ? 'hidden' : '';
        });
    }
}

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

// Run on all pages
document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
    setupMobileMenu();
    renderFooter();
});

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

// Export for use in other files
window.MetaTagManager = MetaTagManager; 
window.LoadingManager = LoadingManager;
window.PerformanceMonitor = PerformanceMonitor;
window.ImageOptimizer = ImageOptimizer; 
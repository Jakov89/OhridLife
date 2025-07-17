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
                <li><a href="/learn" data-id="learn">Learn Ohrid</a></li>
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
                        <li><a href="/learn">Learn About Ohrid</a></li>
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
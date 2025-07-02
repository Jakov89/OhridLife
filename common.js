function renderNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    const container = navbar.querySelector('.container');
    if (!container) return;

    container.innerHTML = `
        <div class="nav-logo">
            <a href="/"><span class="logo-main">Ohrid</span><span class="logo-secondary">Hub</span></a>
        </div>
        <nav class="nav-links-container">
            <ul class="nav-links">
                <li><a href="/" data-id="home">Home</a></li>
                <li><a href="/#plan-your-visit" data-id="events">Events</a></li>
                <li><a href="/day-planner" data-id="planner">Day Planner</a></li>
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
                <h3><span class="footer-logo-main">Ohrid</span><span class="footer-logo-secondary">Hub</span></h3>
                <p>Your guide to the best of Ohrid</p>
            </div>
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
            </div>
            <div class="copyright">
                &copy; <span id="footer-year">${new Date().getFullYear()}</span> OhridHub. All rights reserved.
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
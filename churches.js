// Churches page JavaScript functionality
let churchesData = [];
let currentFilter = 'all';
let currentGalleryIndex = 0;
let currentGalleryImages = [];

document.addEventListener('DOMContentLoaded', () => {
    initializeChurchesPage();
});

async function initializeChurchesPage() {
    try {
        // Load churches data
        const response = await fetch('/data/churches.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        churchesData = data.churches;
        
        // Initialize page components
        setupEventListeners();
        renderChurches();
        renderVisitingTips(data.visiting_tips);
        
    } catch (error) {
        console.error('Error loading churches data:', error);
        showErrorState();
    }
}

function setupEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update filter and re-render
            currentFilter = btn.getAttribute('data-category');
            renderChurches();
        });
    });
    
    // Modal close buttons
    const modalCloseButtons = document.querySelectorAll('.modal-close-button');
    modalCloseButtons.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeModals();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModals();
        }
        
        // Gallery navigation
        const galleryModal = document.getElementById('gallery-modal');
        if (!galleryModal.classList.contains('hidden')) {
            if (e.key === 'ArrowLeft') {
                navigateGallery('prev');
            } else if (e.key === 'ArrowRight') {
                navigateGallery('next');
            }
        }
    });
    
    // Gallery navigation buttons
    document.getElementById('gallery-prev-btn')?.addEventListener('click', () => navigateGallery('prev'));
    document.getElementById('gallery-next-btn')?.addEventListener('click', () => navigateGallery('next'));
}

function renderChurches() {
    const gridContainer = document.querySelector('.grid-container');
    if (!gridContainer) return;
    
    // Filter churches based on current filter
    const filteredChurches = currentFilter === 'all' 
        ? churchesData 
        : churchesData.filter(church => church.category === currentFilter);
    
    if (filteredChurches.length === 0) {
        gridContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⛪</div>
                <h3>No churches found</h3>
                <p>Try selecting a different category to explore more churches.</p>
            </div>
        `;
        return;
    }
    
    gridContainer.innerHTML = filteredChurches.map(church => `
        <div class="church-card" data-church-id="${church.id}">
            <div class="church-image">
                <img src="${church.gallery && church.gallery[0] || 'images_ohrid/church_placeholder.jpg'}" 
                     alt="${church.name}" 
                     loading="lazy">
                <div class="church-period">${church.period}</div>
                <div class="church-category">${getCategoryLabel(church.category)}</div>
            </div>
            <div class="church-content">
                <h3 class="church-name">${church.name}</h3>
                <p class="church-style">${church.architectural_style}</p>
                <p class="church-description">${church.short_description}</p>
                
                <div class="church-features">
                    ${church.features.slice(0, 3).map(feature => 
                        `<span class="feature-tag">${feature}</span>`
                    ).join('')}
                </div>
                
                <div class="church-meta">
                    <span class="church-hours">${church.visiting_hours}</span>
                    <button class="view-details-btn" onclick="openChurchModal(${church.id})">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add click listeners to church cards
    document.querySelectorAll('.church-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('view-details-btn')) {
                const churchId = parseInt(card.getAttribute('data-church-id'));
                openChurchModal(churchId);
            }
        });
    });
}

function getCategoryLabel(category) {
    const labels = {
        'iconic': 'Iconic',
        'major': 'Major',
        'historic': 'Historic',
        'monastery': 'Monastery'
    };
    return labels[category] || category;
}

function openChurchModal(churchId) {
    const church = churchesData.find(c => c.id === churchId);
    if (!church) return;
    
    const modal = document.getElementById('church-modal');
    const modalContent = document.getElementById('church-modal-content');
    
    modalContent.innerHTML = `
        <div class="modal-church-header">
            <img src="${church.gallery && church.gallery[0] || 'images_ohrid/church_placeholder.jpg'}" 
                 alt="${church.name}" 
                 class="modal-church-image">
            <div class="modal-church-info">
                <h2>${church.name}</h2>
                <span class="modal-church-period">${church.period}</span>
                <p class="modal-church-style">${church.architectural_style} Architecture</p>
            </div>
        </div>
        
        <div class="modal-church-description">
            <p>${church.detailed_description}</p>
        </div>
        
        <div class="modal-church-details">
            <div class="detail-group">
                <h4>Historical Significance</h4>
                <p>${church.historical_significance}</p>
            </div>
            
            <div class="detail-group">
                <h4>Key Features</h4>
                <ul class="features-list">
                    ${church.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
            
            <div class="detail-group">
                <h4>Visiting Information</h4>
                <p><strong>Hours:</strong> ${church.visiting_hours}</p>
                <p><strong>Entrance Fee:</strong> ${church.entrance_fee}</p>
                <p><strong>Accessibility:</strong> ${church.accessibility}</p>
                <p><strong>Best Time:</strong> ${church.best_time_to_visit}</p>
            </div>
        </div>
        
        ${church.gallery && church.gallery.length > 1 ? `
            <div class="modal-gallery-section">
                <h4>Gallery</h4>
                <div class="modal-gallery-grid">
                    ${church.gallery.map((image, index) => `
                        <img src="${image}" 
                             alt="${church.name} - Image ${index + 1}" 
                             class="gallery-thumb"
                             onclick="openGalleryModal(${churchId}, ${index})"
                             loading="lazy">
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        ${church.map_embed ? `
            <div class="modal-map-section">
                <h4>Location</h4>
                <div class="modal-map-container">
                    ${church.map_embed}
                </div>
            </div>
        ` : ''}
    `;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function openGalleryModal(churchId, imageIndex = 0) {
    const church = churchesData.find(c => c.id === churchId);
    if (!church || !church.gallery) return;
    
    currentGalleryImages = church.gallery;
    currentGalleryIndex = imageIndex;
    
    updateGalleryModal();
    
    const galleryModal = document.getElementById('gallery-modal');
    galleryModal.classList.remove('hidden');
}

function updateGalleryModal() {
    const img = document.getElementById('gallery-modal-img');
    const counter = document.getElementById('gallery-counter');
    
    img.src = currentGalleryImages[currentGalleryIndex];
    counter.textContent = `${currentGalleryIndex + 1} / ${currentGalleryImages.length}`;
}

function navigateGallery(direction) {
    if (direction === 'prev') {
        currentGalleryIndex = (currentGalleryIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
    } else {
        currentGalleryIndex = (currentGalleryIndex + 1) % currentGalleryImages.length;
    }
    updateGalleryModal();
}

function closeModals() {
    const modals = document.querySelectorAll('.modal-overlay, .image-modal');
    modals.forEach(modal => {
        modal.classList.add('hidden');
    });
    document.body.style.overflow = '';
}

function renderVisitingTips(tips) {
    const tipsGrid = document.querySelector('.tips-grid');
    if (!tipsGrid || !tips) return;
    
    tipsGrid.innerHTML = tips.map(tip => `
        <div class="tip-item">
            <p>${tip}</p>
        </div>
    `).join('');
}

function showErrorState() {
    const gridContainer = document.querySelector('.grid-container');
    if (!gridContainer) return;
    
    gridContainer.innerHTML = `
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>Unable to load churches</h3>
            <p>Please check your internet connection and try refreshing the page.</p>
            <button onclick="window.location.reload()" class="btn btn-primary">
                Reload Page
            </button>
        </div>
    `;
}

// Add some CSS for the gallery and modal enhancements
const additionalStyles = `
<style>
.modal-gallery-section {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border);
}

.modal-gallery-section h4 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--foreground);
    margin-bottom: 1rem;
}

.modal-gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
}

.gallery-thumb {
    width: 100%;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.3s ease;
    border: 2px solid transparent;
}

.gallery-thumb:hover {
    transform: scale(1.05);
    border-color: var(--primary);
}

.gallery-nav {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    transform: translateY(-50%);
    display: flex;
    justify-content: space-between;
    padding: 0 2rem;
    pointer-events: none;
}

.gallery-nav-btn {
    background: rgba(0,0,0,0.7);
    color: white;
    border: none;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    pointer-events: auto;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.gallery-nav-btn:hover {
    background: rgba(0,0,0,0.9);
    transform: scale(1.1);
}

.gallery-counter {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
}

.empty-state,
.error-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 4rem 2rem;
    color: var(--muted-foreground);
}

.empty-icon,
.error-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.6;
}

.empty-state h3,
.error-state h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--foreground);
}

.empty-state p,
.error-state p {
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
}
</style>
`;

// Inject additional styles
document.head.insertAdjacentHTML('beforeend', additionalStyles);

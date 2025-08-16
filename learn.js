document.addEventListener('DOMContentLoaded', () => {
    const textContentElement = document.getElementById('text-content-display');
    let ohridTexts = {};
    let currentTimelinePeriod = 'ancient';
    let currentGalleryIndex = 0;
    
    // Gallery images with metadata
    const galleryImages = [
        {
            src: 'images_ohrid/ohrid1.jpg',
            title: 'Ohrid Panorama',
            description: 'Breathtaking panoramic view of Lake Ohrid and the historic old town'
        },
        {
            src: 'images_ohrid/ohrid2.jpg',
            title: 'Ancient Theatre',
            description: 'The well-preserved Hellenistic theatre dating from 200 BC'
        },
        {
            src: 'images_ohrid/ohrid3.jpg',
            title: 'Church of Saint John at Kaneo',
            description: 'The iconic 13th-century church perched on a cliff above the lake'
        },
        {
            src: 'images_ohrid/ohrid4.jpg',
            title: 'Samuel\'s Fortress',
            description: 'Medieval fortress walls overlooking the city and lake'
        },
        {
            src: 'images_ohrid/ohrid5.jpg',
            title: 'Old Town Streets',
            description: 'Charming cobblestone streets lined with traditional Ottoman houses'
        }
    ];

    // Timeline data
    const timelineData = {
        ancient: {
            title: 'Ancient Lychnidos',
            period: '200 BC - 500 AD',
            content: `
                <div class="timeline-event">
                    <h3>🏛️ Foundation of Lychnidos (200 BC)</h3>
                    <p>The ancient city of Lychnidos, meaning "City of Light," was established on the white limestone cliffs overlooking Lake Ohrid. As a vital station on the Via Egnatia connecting Rome to Constantinople, it became a thriving commercial and cultural hub.</p>
                </div>
                <div class="timeline-event">
                    <h3>🎭 Construction of the Theatre (200 BC)</h3>
                    <p>The magnificent Hellenistic theatre was built to accommodate 5,000 spectators. This architectural marvel continues to host performances today, bridging ancient and modern cultural traditions.</p>
                </div>
                <div class="timeline-event">
                    <h3>🛤️ Via Egnatia Trade Route (150 BC)</h3>
                    <p>The completion of the Via Egnatia transformed Lychnidos into a major trading post, bringing merchants, scholars, and travelers from across the Roman Empire and establishing its cosmopolitan character.</p>
                </div>
            `,
            image: 'images_ohrid/ancient_theatre.jpg'
        },
        medieval: {
            title: 'Golden Age of Learning',
            period: '893 - 1400 AD',
            content: `
                <div class="timeline-event">
                    <h3>📚 Saint Clement's School (893 AD)</h3>
                    <p>Saint Clement of Ohrid founded the first Slavic university at Plaošnik, creating the birthplace of Slavic literacy. Here, the Cyrillic alphabet was perfected and the first Slavic books were written.</p>
                </div>
                <div class="timeline-event">
                    <h3>👑 Capital of Samuel's Empire (997-1018 AD)</h3>
                    <p>Tsar Samuel established Ohrid as the capital of the First Bulgarian Empire. The city flourished as a political and religious center, with the construction of numerous churches and the famous fortress.</p>
                </div>
                <div class="timeline-event">
                    <h3>⛪ Age of Church Building (10th-14th century)</h3>
                    <p>During this period, Ohrid earned its title "Jerusalem of the Balkans" as 365 churches were built throughout the city and surrounding areas, creating an unprecedented concentration of sacred architecture.</p>
                </div>
            `,
            image: 'images_ohrid/medieval_church.jpg'
        },
        ottoman: {
            title: 'Ottoman Heritage',
            period: '1400 - 1912',
            content: `
                <div class="timeline-event">
                    <h3>🕌 Cultural Fusion (1400s)</h3>
                    <p>Under Ottoman rule, Ohrid became a unique blend of Christian and Islamic cultures. Many churches were converted to mosques, while new architectural styles emerged that combined Byzantine and Ottoman elements.</p>
                </div>
                <div class="timeline-event">
                    <h3>🏘️ Traditional Architecture (16th-19th century)</h3>
                    <p>The characteristic Ohrid houses with wooden balconies and carved details were built during this period. These traditional homes created the distinctive skyline that defines the old town today.</p>
                </div>
                <div class="timeline-event">
                    <h3>💎 Ohrid Pearls Tradition (17th-19th century)</h3>
                    <p>The famous Ohrid pearl tradition flourished, with artisans creating jewelry from the scales of the endemic Ohrid bleak fish. These pearls became a luxury item traded throughout Europe.</p>
                </div>
            `,
            image: 'images_ohrid/ottoman_house.jpg'
        },
        modern: {
            title: 'UNESCO Recognition',
            period: '1912 - Today',
            content: `
                <div class="timeline-event">
                    <h3>🏛️ Cultural Renaissance (1961)</h3>
                    <p>The Ohrid Summer Festival was established, transforming ancient venues into world-class performance spaces. This cultural renaissance brought international recognition to Ohrid's artistic heritage.</p>
                </div>
                <div class="timeline-event">
                    <h3>🌍 UNESCO World Heritage (1979-1980)</h3>
                    <p>Both Lake Ohrid and the historic city received UNESCO World Heritage status, recognizing their universal value to humanity. This dual designation is shared by very few places worldwide.</p>
                </div>
                <div class="timeline-event">
                    <h3>🔬 Archaeological Discoveries (1990s-2000s)</h3>
                    <p>Modern archaeological work at Plaošnik uncovered the remains of Saint Clement's original monastery and university, providing concrete evidence of Ohrid's role as the birthplace of Slavic literacy.</p>
                </div>
            `,
            image: 'images_ohrid/modern_ohrid.jpg'
        }
    };

    function initializePage() {
        setupEventListeners();
        fetchOhridText();
        initializeTimeline();
        initializeGallery();
    }

    function setupEventListeners() {
        // Timeline navigation
        document.querySelectorAll('.timeline-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const period = btn.getAttribute('data-period');
                switchTimelinePeriod(period);
            });
        });

        // Hero action buttons
        document.getElementById('explore-timeline-btn')?.addEventListener('click', () => {
            document.getElementById('timeline-section').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        });

        document.getElementById('visit-churches-btn')?.addEventListener('click', () => {
            window.location.href = 'churches.html';
        });

        // Language switcher event listeners will be added after text render
    }

    function renderText(lang) {
        const langButtons = `
            <div class="language-switcher">
                <button id="lang-en" class="btn-lang ${lang === 'en' ? 'active' : ''}">English</button>
                <button id="lang-mk" class="btn-lang ${lang === 'mk' ? 'active' : ''}">Македонски</button>
            </div>
        `;

        if (ohridTexts[lang]) {
            textContentElement.innerHTML = langButtons + ohridTexts[lang];
            updateMetaTags(lang);
            
            document.getElementById('lang-en').addEventListener('click', () => renderText('en'));
            document.getElementById('lang-mk').addEventListener('click', () => renderText('mk'));
        } else {
            textContentElement.innerHTML = '<p>Content could not be loaded.</p>';
        }
    }

    function updateMetaTags(lang) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = ohridTexts[lang];

        const title = tempDiv.querySelector('h1')?.innerText || 'Learn About Ohrid';
        const description = tempDiv.querySelector('p')?.innerText.substring(0, 160) || 'Discover the rich history and beauty of Ohrid.';

        // Use MetaTagManager if available for comprehensive updates
        if (window.MetaTagManager) {
            const metaData = {
                title: `${title} - OhridHub`,
                description: description,
                url: `/learn.html?lang=${lang}`,
                image: '/images_ohrid/photo1.jpg',
                keywords: `Ohrid, history, North Macedonia, tourism, ${lang === 'mk' ? 'македонски' : 'learn'}`
            };
            window.MetaTagManager.updatePageMeta(metaData);
        } else {
            // Fallback to element-based updates
            document.title = `${title} - OhridHub`;
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.content = description;
        }
        document.getElementById('twitter-description').setAttribute('content', description);
    }

    function fetchOhridText() {
        fetch('/api/learn-ohrid-texts')
            .then(response => response.json())
            .then(data => {
                ohridTexts = data;
                renderText('en'); // Default to English
            })
            .catch(error => {
                console.error('Error fetching Ohrid text:', error);
                textContentElement.innerHTML = '<p>Failed to load content. Please try again later.</p>';
            });
    }

    function initializeTimeline() {
        displayTimelineContent(currentTimelinePeriod);
    }

    function switchTimelinePeriod(period) {
        // Update active button
        document.querySelectorAll('.timeline-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-period="${period}"]`).classList.add('active');
        
        currentTimelinePeriod = period;
        displayTimelineContent(period);
    }

    function displayTimelineContent(period) {
        const timelineContent = document.getElementById('timeline-content');
        const data = timelineData[period];
        
        if (!timelineContent || !data) return;
        
        timelineContent.innerHTML = `
            <div class="timeline-header">
                <h3>${data.title}</h3>
                <span class="timeline-period-badge">${data.period}</span>
            </div>
            <div class="timeline-events">
                ${data.content}
            </div>
        `;
        
        // Add smooth transition effect
        timelineContent.style.opacity = '0';
        setTimeout(() => {
            timelineContent.style.opacity = '1';
        }, 100);
    }

    function initializeGallery() {
        const mainImageContainer = document.querySelector('.gallery-main-image');
        const thumbnailsContainer = document.querySelector('.gallery-thumbnails');
        
        if (!mainImageContainer || !thumbnailsContainer) return;

        // Function to update main image
        function updateMainImage() {
            const image = galleryImages[currentGalleryIndex];
            mainImageContainer.innerHTML = `
                <img src="${image.src}" 
                     alt="${image.title}" 
                     loading="lazy">
            `;
            
            // Update image info
            document.getElementById('gallery-image-title').textContent = image.title;
            document.getElementById('gallery-image-description').textContent = image.description;
            
            // Update active thumbnail
            document.querySelectorAll('.gallery-thumb').forEach((thumb, index) => {
                thumb.classList.toggle('active', index === currentGalleryIndex);
            });
        }

        // Create thumbnails
        thumbnailsContainer.innerHTML = galleryImages.map((image, index) => `
            <div class="gallery-thumb ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${image.src}" alt="${image.title}" loading="lazy">
            </div>
        `).join('');

        // Initialize main image
        updateMainImage();

        // Setup navigation buttons
        const prevBtn = document.getElementById('gallery-prev');
        const nextBtn = document.getElementById('gallery-next');

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
                updateMainImage();
            });

            nextBtn.addEventListener('click', () => {
                currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
                updateMainImage();
            });
        }

        // Setup thumbnail clicks
        document.querySelectorAll('.gallery-thumb').forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                currentGalleryIndex = index;
                updateMainImage();
            });
        });

        // Setup keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            if (e.key === 'ArrowLeft') {
                currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
                updateMainImage();
            } else if (e.key === 'ArrowRight') {
                currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
                updateMainImage();
            }
        });
        
        // Auto-play functionality (optional)
        let autoPlayInterval;
        
        function startAutoPlay() {
            autoPlayInterval = setInterval(() => {
                currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
                updateMainImage();
            }, 5000);
        }
        
        function stopAutoPlay() {
            clearInterval(autoPlayInterval);
        }
        
        // Start autoplay on load, stop on user interaction
        startAutoPlay();
        
        const gallerySection = document.getElementById('ohrid-gallery');
        gallerySection?.addEventListener('mouseenter', stopAutoPlay);
        gallerySection?.addEventListener('mouseleave', startAutoPlay);
    }

    initializePage();
}); 
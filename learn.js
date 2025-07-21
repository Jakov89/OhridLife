document.addEventListener('DOMContentLoaded', () => {
    const textContentElement = document.getElementById('ohrid-text-content');
    const gallerySlider = document.getElementById('gallery-slider');
    let ohridTexts = {};

    function initializePage() {
        setupEventListeners();
        fetchOhridText();
        initializeGallery();
    }

    function setupEventListeners() {
        // Event listeners are now dynamically added after text render
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

    function initializeGallery() {
        const galleryImages = [
            'images_ohrid/ohrid1.jpg',
            'images_ohrid/ohrid2.jpg',
            'images_ohrid/ohrid3.jpg',
            'images_ohrid/ohrid4.jpg',
            'images_ohrid/ohrid5.jpg'
        ];

        const mainImageContainer = document.querySelector('.gallery-main-image');
        if (!mainImageContainer) return;

        let currentIndex = 0;

        // Function to update main image
        function updateMainImage() {
            mainImageContainer.innerHTML = `
                <img src="${galleryImages[currentIndex]}" 
                     alt="Ohrid Gallery Image ${currentIndex + 1}" 
                     loading="lazy">
            `;
        }

        // Initialize main image
        updateMainImage();

        // Setup navigation
        const prevBtn = document.getElementById('gallery-prev');
        const nextBtn = document.getElementById('gallery-next');

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
                updateMainImage();
            });

            nextBtn.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % galleryImages.length;
                updateMainImage();
            });
        }

        // Setup keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
                updateMainImage();
            } else if (e.key === 'ArrowRight') {
                currentIndex = (currentIndex + 1) % galleryImages.length;
                updateMainImage();
            }
        });
    }

    initializePage();
}); 
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

        document.getElementById('meta-title').innerText = `${title} - OhridHub`;
        document.getElementById('meta-description').setAttribute('content', description);
        
        // Update Open Graph tags
        document.getElementById('og-title').setAttribute('content', `${title} - OhridHub`);
        document.getElementById('og-description').setAttribute('content', description);

        // Update Twitter tags
        document.getElementById('twitter-title').setAttribute('content', `${title} - OhridHub`);
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
            'images_ohrid/photo1.jpg',
            'images_ohrid/photo2.jpg',
            'images_ohrid/photo3.jpg',
            'images_ohrid/photo4.jpg',
            'images_ohrid/photo5.jpg'
        ];

        const sliderContainer = document.getElementById('gallery-slider');
        galleryImages.forEach(src => {
            const slide = document.createElement('div');
            slide.className = 'keen-slider__slide';
            const img = document.createElement('img');
            img.src = src;
            img.alt = 'Ohrid Gallery Image';
            slide.appendChild(img);
            sliderContainer.appendChild(slide);
        });

        if (galleryImages.length > 0 && typeof KeenSlider !== 'undefined') {
            const slider = new KeenSlider("#gallery-slider", {
                loop: true,
                slideChanged(s) {
                    updateUI(s);
                },
                created(s) {
                    addDotBtns(s);
                    addArrowBtns(s);
                    updateUI(s);
                }
            });
        }

        function updateUI(s) {
            updateDots(s);
            updateArrows(s);
        }

        function addDotBtns(s) {
            const dotsContainer = document.getElementById("gallery-dots");
            if (!dotsContainer) return;
            dotsContainer.innerHTML = "";
            s.track.details.slides.forEach((_e, idx) => {
                const dot = document.createElement("button");
                dot.classList.add("dot");
                dot.addEventListener("click", () => s.moveToIdx(idx));
                dotsContainer.appendChild(dot);
            });
        }

        function updateDots(s) {
             const dots = document.querySelectorAll("#gallery-dots .dot");
             dots.forEach((dot, idx) => {
                dot.classList.toggle("active", idx === s.track.details.rel);
            });
        }
        
        function addArrowBtns(s) {
            const arrowLeft = document.getElementById("gallery-arrow-left");
            const arrowRight = document.getElementById("gallery-arrow-right");
            if(arrowLeft && arrowRight) {
                arrowLeft.innerHTML = arrowSVG("left");
                arrowRight.innerHTML = arrowSVG("right");
                arrowLeft.addEventListener("click", () => s.prev());
                arrowRight.addEventListener("click", () => s.next());
            }
        }

        function updateArrows(s) {
            const arrowLeft = document.getElementById("gallery-arrow-left");
            const arrowRight = document.getElementById("gallery-arrow-right");
            if (arrowLeft && arrowRight && !s.options.loop) {
                arrowLeft.disabled = s.track.details.rel === 0;
                arrowRight.disabled = s.track.details.rel === s.track.details.slides.length - 1;
                arrowLeft.classList.toggle("arrow--disabled", arrowLeft.disabled);
                arrowRight.classList.toggle("arrow--disabled", arrowRight.disabled);
            }
        }

        function arrowSVG(direction) {
            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                ${direction === "left"
                ? "<path d='M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z'/>"
                : "<path d='M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z'/>"
                }
            </svg>`;
        }
    }

    initializePage();
}); 
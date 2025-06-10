// Global variables to store fetched data
let venuesData = [];
let featuredEventsData = [];
let eventsListData = [];
let learnOhridTexts = {}; // Renamed from 'texts' to avoid potential conflicts

const kulturnoLetoTexts = { // This will be used for Kulturno Leto's own translation later
    mk: {
        title: "Културолошка иницијатива 5 до 12",
        description: "Културолошка иницијатива 5 до 12 е платформа преку која од 2018 година се организираат алтернативни програми до фокус на младите, локалната заедница, урбаната култура, но и традицијата. Преку различни културно- уметнички и спортски активности, оваа платформа ја збогатува културата во Охрид и создава простор за развој на креативност и културно-уметничко изразување кај младите.",
        eventsHeader: "Програма / Events"
    },
    en: {
        title: "Cultural Initiative 5 to 12",
        description: "They're not myths, though they feel like legends. They don't carry weapons, but voice, color, sound, and movement. Their mission isn't to save, but to awaken. Each one carries a different energy and you'll find them wherever culture is born: on stage, on canvas, in the streets, in conversation, among the people. Their aim is not only to celebrate culture, but to protect the spaces where it grows — streets, squares, conversations, stages, and everyday moments. You'll see them soon. And you'll know when you meet them.",
        eventsHeader: "Program / Events"
    }
};

const ohridskoLetoTexts = {
    mk: {
        title: "Откријте ја магијата на Охридско лето!",
        content: `
            <p style="margin-bottom: 1.5rem;">
                Замислете си место каде што античката историја се среќава со жива модерна култура, сè поставено наспроти прекрасната позадина на спокојно, древно езеро. Добредојдовте во Охрид, Северна Македонија, дом на еден од најпочитуваните културни настани во Европа: <strong>Охридско лето</strong>.
            </p>
            <p style="margin-bottom: 1.5rem;">
                Кој се одржува секоја година од <strong>12 јули до 20 август</strong>, овој фестивал не е само низа на настапи; тоа е едномесечна прослава која го претвора целиот град во жива сцена. Од своето основање во 1961 година, фестивалот стана светилник за класичната музика и театарот, привлекувајќи светски познати уметници од сите краеви на светот.
            </p>
            <p style="margin-bottom: 1.5rem;">
               Што можете да очекувате? Замислете се себеси како седите во античкиот римски театар, под ѕвездено небо, фасцинирани од моќна опера или трогателна драматична претстава.
            </p>
            <p style="margin-bottom: 1.5rem;">
               Или можеби ќе се најдете во елегантната околина на црквата Света Софија, слушајќи ги возвишените мелодии на класичен концерт. Фестивалот, исто така, ги опфаќа традиционалниот фолклор, пленителни уметнички изложби и инспиративни поетски читања, нудејќи нешто за сечиј уметнички вкус.
            </p>
            <p style="margin-bottom: 1.5rem;">
               Охридско лето е повеќе од само забава; тоа е искуство вкоренето во богатото наследство на градот. Неговото членство во <strong>Европската асоцијација на фестивали</strong> од 1994 година ја нагласува неговата меѓународна важност и високиот квалитет на неговата програма.
            </p>
            <p>
               Без разлика дали сте искусен љубител на уметноста или едноставно барате уникатно и културно збогатувачко летно искуство, опуштената, семејна атмосфера на фестивалот, комбинирана со неверојатната убавина на Охрид и неговите историски локации, ветува незаборавно патување во срцето на креативноста и традицијата. Не само посетете го Охрид; <strong>искусете ја неговата летна магија!</strong>
            </p>
        `
    },
    en: {
        title: "Discover the Magic of the Ohrid Summer Festival!",
        content: `
            <p style="margin-bottom: 1.5rem;">
                Imagine a place where ancient history meets vibrant modern culture, all set against the breathtaking backdrop of a serene, ancient lake. Welcome to Ohrid, North Macedonia, home to one of Europe's most esteemed cultural events: the <strong>Ohrid Summer Festival</strong>.
            </p>
            <p style="margin-bottom: 1.5rem;">
                Running annually from <strong>July 12th to August 20th</strong>, this festival isn't just a series of performances; it's a month-long celebration that transforms the entire city into a living stage. Since its founding in 1961, the festival has become a beacon for classical music and theater, attracting world-renowned artists from across the globe.
            </p>
            <p style="margin-bottom: 1.5rem;">
               What can you expect? Picture yourself sitting in the ancient Roman theatre, under a starlit sky, captivated by a powerful opera or a poignant dramatic play.
            </p>
            <p style="margin-bottom: 1.5rem;">
               Or perhaps you'll find yourself in the elegant surroundings of the Church of St. Sofija, listening to the sublime melodies of a classical concert. The festival also embraces traditional folklore, captivating art exhibitions, and insightful poetry readings, offering something for every artistic taste.
            </p>
            <p style="margin-bottom: 1.5rem;">
               The Ohrid Summer Festival is more than just entertainment; it's an experience rooted in the city's rich heritage. Its membership in the <strong>European Festivals Association</strong> since 1994 underscores its international significance and the high caliber of its programming.
            </p>
            <p>
               Whether you're a seasoned art enthusiast or simply looking for a unique and culturally enriching summer experience, the festival's relaxed, family-friendly atmosphere, combined with the stunning beauty of Ohrid and its historic venues, promises an unforgettable journey into the heart of creativity and tradition. Don't just visit Ohrid; <strong>experience its summer magic!</strong>
            </p>
        `
    }
};

// let currentLanguage = 'mk'; // REMOVING global currentLanguage, each section will manage its own.

// Global variables for the simple map modal
let simpleMapModal = null;
let simpleMapModalContent = null;
let simpleMapModalCloseButton = null;

// --- DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    // --- DOM Element Declarations ---
    // It's good practice to declare all DOM elements that will be manipulated
    // This also helps in understanding what parts of the page the script interacts with.

    const navLinks = document.querySelectorAll('nav a');
    const pageSections = {
        main: document.getElementById('main-page-content'),
        learn: document.getElementById('learn-ohrid-content'),
        dayPlanner: document.getElementById('day-planner-section'),
        kulturnoLeto: document.getElementById('kulturno-leto-content'),
        ohridskoLeto: document.getElementById('ohridsko-leto-content'),
        ohridWineFest: document.getElementById('ohrid-wine-fest-content')
    };

    // Hero Section Elements
    const heroSection = document.getElementById('hero-section');
    const heroTitle = document.getElementById('hero-title');
    const heroDescription = document.getElementById('hero-description');
    const heroDate = document.getElementById('hero-date');
    let heroBookButton = document.getElementById('hero-book-button'); // Changed const to let
    const heroIndicatorsContainer = document.querySelector('.hero-indicators');

    // Event List Elements
    const eventListItemsContainer = document.getElementById('event-list-items-container');
    const eventDatePicker = document.getElementById('event-date-picker');
    const clearEventFilterButton = document.getElementById('clear-event-filter-button');

    // Explore Section Elements
    const exploreSection = document.getElementById('explore-section');
    // recommendationList and categoryFilters are dynamically created inside exploreSection

    // Popular Section Elements
    const popularSection = document.getElementById('popular-section');
    const popularSectionContainer = popularSection ? popularSection.querySelector('.container') : null; // Restoring this line
    // popularVenuesContainer is dynamically created or identified within renderPopularVenues

    // Day Planner Elements (New)
    const dayPlannerSection = document.getElementById('day-planner-section');
    const addPlanItemForm = document.getElementById('add-plan-item-form');
    const currentPlanDisplay = document.getElementById('currentPlanDisplay'); 
    console.log('Global declaration - currentPlanDisplay:', currentPlanDisplay); // Log 1
    const planDateInput = document.getElementById('plan-date');
    const planDayNightTypeSelect = document.getElementById('plan-day-night-type');
    const planActivityTypeSelect = document.getElementById('plan-activity-type'); 
    const planItemVenueGroup = document.getElementById('plan-item-venue-group');
    const planItemVenueSelect = document.getElementById('plan-item-venue-select');
    const planItemTimeInput = document.getElementById('plan-item-time');
    const planItemNotesInput = document.getElementById('plan-item-notes');
    const selectedDatePlanDetails = document.getElementById('selected-date-plan-details');
    const currentlyViewingDateSpan = document.getElementById('currently-viewing-date');
    const clearPlanBtn = document.getElementById('clear-plan-btn');
    const clearButtonDateText = document.getElementById('clear-button-date-text');

    // Day Planner Event Search Elements (New)
    const plannerEventSearchResults = document.getElementById('planner-event-search-results');

    let heroBgImageDiv; // Will be created dynamically if hero section exists

    // Navbar Elements
    const navbarElement = document.getElementById('navbar');
    let activeNavItem = 'home'; // Default active nav item, tracks the current "page" or section

    // Main Page and Learn Ohrid Content Containers
    const mainPageContent = document.getElementById('main-page-content');
    const learnOhridContentContainer = document.getElementById('learn-ohrid-content');
    const kulturnoLetoContentContainer = document.getElementById('kulturno-leto-content'); // New container
    const ohridskoLetoContentContainer = document.getElementById('ohridsko-leto-content'); // New container for Ohridsko Leto
    const ohridWineFestContentContainer = document.getElementById('ohrid-wine-fest-content');
    let ohridTextContentDiv; // For the text part of "Learn Ohrid"
    let ohridImageSlideshowDiv; // For the slideshow part of "Learn Ohrid"

    // Event List Container (Main page)
    // const eventListItemsContainer = document.getElementById('event-list-items-container');
    // const eventDatePickerInput = document.getElementById('event-date-picker'); 
    // const clearEventFilterButton = document.getElementById('clear-event-filter-button'); 
    
    // Explore Section Elements
    // const exploreSection = document.getElementById('explore-section');
    let activeFilterCategory = 'all'; // Default filter for venue recommendations

    // Popular Section Container
    // const popularSection = document.getElementById('popular-section');
    // const popularSectionContainer = popularSection ? popularSection.querySelector('.container') : null;

    // Venue Detail Modal Elements
    const venueModal = document.getElementById('venue-modal');
    const modalCloseButton = venueModal ? venueModal.querySelector('.modal-close-button') : null;
    const modalVenueImage = document.getElementById('modal-venue-image');
    const modalVenueName = document.getElementById('modal-venue-name');
    const modalVenueType = document.getElementById('modal-venue-type');
    const modalVenueDescription = document.getElementById('modal-venue-description');
    const modalVenueRatingElement = document.getElementById('modal-venue-rating'); // Parent of value and star
    const modalVenueRatingValue = modalVenueRatingElement ? modalVenueRatingElement.querySelector('.rating-value') : null;
    const modalVenuePrice = document.getElementById('modal-venue-price');
    const modalVenueAddress = document.getElementById('modal-venue-address');
    const modalVenueMapContainer = document.getElementById('modal-venue-map-container');
    const modalVenuePhone = document.getElementById('modal-venue-phone');
    const modalVenueHours = document.getElementById('modal-venue-hours');
    const modalBookNowButton = document.getElementById('modal-book-now-button');
    const modalVenueEventsList = document.getElementById('modal-venue-events-list');

    // Generic Image Modal
    const imageModal = document.getElementById('image-modal');
    const imageModalImg = document.getElementById('image-modal-img');
    const imageModalClose = document.getElementById('image-modal-close');

    // Event Detail Modal Elements (New)
    const eventDetailModal = document.getElementById('event-detail-modal');
    const eventDetailModalCloseButton = document.getElementById('event-detail-modal-close-button');
    const modalEventImage = document.getElementById('modal-event-image');
    const modalEventName = document.getElementById('modal-event-name');
    const modalEventDateTime = document.getElementById('modal-event-date-time');
    const modalEventDescription = document.getElementById('modal-event-description');
    const modalEventCategoryValue = document.getElementById('modal-event-category-value');
    const modalEventLocationMap = document.getElementById('modal-event-location-map'); // New

    // Mobile Navigation
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const primaryNav = document.querySelector('.nav-links');

    // Footer Year
    const footerYear = document.getElementById('footer-year');

    // Global variable for hero slideshow interval
    let heroInterval;
    let currentEventIndex = 0; // For hero section slideshow
    let currentOhridImageIndex = 0; // For Learn Ohrid slideshow

    // Day Planner Elements (New)
    // const dayPlannerSection = document.getElementById('day-planner-section');
    // const addPlanItemForm = document.getElementById('add-plan-item-form');
    // const currentPlanDisplay = document.getElementById('currentPlanDisplay'); // Corrected ID & has duplicate log
    // const planDateInput = document.getElementById('plan-date');
    // const planDayNightTypeSelect = document.getElementById('plan-day-night-type');
    // const addSampleItemToPlanBtn = document.getElementById('add-sample-item-to-plan-btn'); // Commented out in HTML

    // Day Planner Form Elements (New)
    // const planActivityTypeInput = document.getElementById('plan-activity-type'); // New (replaces planItemTypeInput)
    // const planItemTypeInput = document.getElementById('plan-item-type'); // Old, to be removed or commented
    // const planItemVenueGroup = document.getElementById('plan-item-venue-group'); // New
    // const planItemVenueSelect = document.getElementById('plan-item-venue-select'); // New
    // const planItemTimeInput = document.getElementById('plan-item-time');
    // const planItemNotesInput = document.getElementById('plan-item-notes'); // KEEPING THIS if not declared before
    // const addToPlanBtn = document.getElementById('add-to-plan-btn'); // Form submit handles this

    // Day Planner Event Suggestions (New)
    const eventSuggestionsList = document.getElementById('event-suggestions-list');

    // Day Planner State (New)
    let currentPlan = [];
    const LOCAL_STORAGE_PLAN_KEY = 'ohridLifeDayPlan'; // Key for localStorage
    let draggedItem = null; // For drag and drop state (New)
    let dragOverPlaceholder = null; // For visual feedback during drag (New)

    // --- Activity and Time options ---
    const daytimeActivities = [
        { value: "Breakfast", text: "Breakfast" },
        { value: "Walk", text: "Walk" },
        { value: "Lunch", text: "Lunch" },
        { value: "Coffee", text: "Coffee" },
        { value: "Sightseeing", text: "Sightseeing" },
        { value: "Shopping", text: "Shopping" },
        { value: "BeachTime", text: "Beach Time" },
        { value: "Relaxing", text: "Relaxing" },
        { value: "Adventure", text: "Adventure" }
    ];

    const nighttimeActivities = [
        { value: "Dinner", text: "Dinner" },
        { value: "Drinks", text: "Drinks" },
        { value: "Pub", text: "Pub Visit" },
        { value: "Club", text: "Club Visit" },
        { value: "Concert", text: "Concert" },
        { value: "Festival", text: "Festival" },
        { value: "SpecialEvent", text: "Special Event" }
    ];

    const activityToVenueTypeMap = {
        "Breakfast": ["restaurant", "coffee"],
        "Coffee": ["coffee"], // Some bars might serve good coffee
        "Lunch": ["restaurant"],
        "Dinner": ["restaurant"],
        "Drinks": ["bar", "pub", "club", "restaurant"], // Restaurants often have bars
        "Pub": ["pub"],
        "Club": ["club"]
        // Activities like "Walk", "Sightseeing", etc., don't map to specific venue types here
        // as the venue dropdown is hidden for them by `venueActivities` check.
    };

    const venueCategories = {
        'Food & Drinks': {
            'all': 'All',
            'restaurant': 'Restaurants',
            'coffee': 'Coffee',
            'pub': 'Pubs',
            'club': 'Clubs',
            'fast-food': 'Fast Food',
            'to-go': 'To-Go'
        },
        'Beach Life': {
            'beach': 'Beaches'
        },
        'Adventure/Sport': {
            'all': 'All',
            'kayaking': 'Kayaking',
            'sup': 'Sup',
            'paragliding': 'Paragliding',
            'gym': 'Gym',
            'diving': 'Diving',
            'fitness': 'Fitness',
            'karting': 'Karting',
            'camping': 'Camping',
            'hiking': 'Hiking',
            'atv': 'ATV',
            'sports': 'Sports'
        }
        // Future categories can be added here
        // 'Health & Wellness': { 'spa': 'Spas', 'gym': 'Gyms' },
        // 'Shopping': { 'souvenir': 'Souvenirs', 'fashion': 'Fashion' }
    };
    let activeMainCategory = null; // Set to null initially
    let activeSubCategory = 'all';

    function populateTimeOptions(isDaytime) {
        planItemTimeInput.innerHTML = ''; // Clear existing options
        let times = [];
        if (isDaytime) {
            // Daytime: 06:00 to 18:00
            for (let h = 6; h <= 18; h++) {
                for (let m = 0; m < 60; m += 30) {
                    const timeString = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                    times.push(timeString);
                }
            }
        } else {
            // Nighttime: 19:00 to 01:00 (next day)
            for (let h = 19; h <= 23; h++) {
                for (let m = 0; m < 60; m += 30) {
                    const timeString = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                    times.push(timeString);
                }
            }
            // Add 00:00, 00:30, 01:00 for next day
            times.push("00:00 (Next Day)");
            times.push("00:30 (Next Day)");
            times.push("01:00 (Next Day)");
        }

        times.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            planItemTimeInput.appendChild(option);
        });
        // Add "Any time" option
        const anyTimeOption = document.createElement('option');
        anyTimeOption.value = "Any time";
        anyTimeOption.textContent = "Any time";
        planItemTimeInput.prepend(anyTimeOption); // Add to the beginning
        planItemTimeInput.value = "Any time"; // Set as default
    }

    function populateActivityOptions(activities) {
        planActivityTypeSelect.innerHTML = ''; // Clear existing
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "Select an activity...";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        planActivityTypeSelect.appendChild(defaultOption);

        activities.forEach(activity => {
            const option = document.createElement('option');
            option.value = activity.value;
            option.textContent = activity.text;
            planActivityTypeSelect.appendChild(option);
        });
    }

    function populateVenueOptions(selectedActivity) {
        planItemVenueSelect.innerHTML = ''; // Clear existing
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "Select a venue...";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        planItemVenueSelect.appendChild(defaultOption);

        if (!venuesData || venuesData.length === 0) {
            const noVenueOption = document.createElement('option');
            noVenueOption.value = "";
            noVenueOption.textContent = "No venues loaded";
            noVenueOption.disabled = true;
            planItemVenueSelect.appendChild(noVenueOption);
            return;
        }

        const targetVenueTypes = activityToVenueTypeMap[selectedActivity] || [];
        let suitableVenues = [];

        if (targetVenueTypes.length > 0) {
            suitableVenues = venuesData.filter(venue => {
                if (!venue.type) return false;
                const venueTypes = Array.isArray(venue.type) ? venue.type.map(t => t.toLowerCase()) : [String(venue.type).toLowerCase()];
                return targetVenueTypes.some(targetType => venueTypes.includes(targetType.toLowerCase()));
            });
        } else {
            // If selectedActivity doesn't map to specific types (e.g. it's not in activityToVenueTypeMap)
            // or if the mapping is empty, we might show all venues or none. 
            // Given the current logic hides the dropdown for non-venue activities, this branch might not be hit often for filtering.
            // However, if a venue-requiring activity has no map entry, show all as a fallback.
            // OR, more strictly, if no map, no venues. Let's be strict for now:
            // suitableVenues = venuesData; // Fallback to show all if no specific types defined
        }

        if (suitableVenues.length > 0) {
            suitableVenues.forEach(venue => {
                const option = document.createElement('option');
                option.value = venue.name; // Or venue.id if you prefer to store ID
                option.textContent = venue.name;
                planItemVenueSelect.appendChild(option);
            });
        } else {
            const noMatchingVenueOption = document.createElement('option');
            noMatchingVenueOption.value = "";
            noMatchingVenueOption.textContent = targetVenueTypes.length > 0 ? "No suitable venues found" : "Select an activity first";
            noMatchingVenueOption.disabled = true;
            planItemVenueSelect.appendChild(noMatchingVenueOption);
        }
    }

    // --- Data Fetching ---
    async function fetchAllData() {
        try {
            const [venuesRes, eventsListRes, learnOhridTextsRes, featuredEventsRes] = await Promise.all([
                fetch('data/venues.json'),
                fetch('data/events.json'),
                fetch('data/learn_ohrid_text.json'),
                fetch('data/featured_events.json')
            ]);

            // Check if responses are ok
            if (!venuesRes.ok) throw new Error(`Failed to fetch venues: ${venuesRes.status} ${venuesRes.statusText}`);
            if (!eventsListRes.ok) throw new Error(`Failed to fetch events list: ${eventsListRes.status} ${eventsListRes.statusText}`);
            if (!learnOhridTextsRes.ok) throw new Error(`Failed to fetch Learn Ohrid texts: ${learnOhridTextsRes.status} ${learnOhridTextsRes.statusText}`);
            if (!featuredEventsRes.ok) throw new Error(`Failed to fetch featured events: ${featuredEventsRes.status} ${featuredEventsRes.statusText}`);
            
            venuesData = await venuesRes.json();
            eventsListData = await eventsListRes.json();
            learnOhridTexts = await learnOhridTextsRes.json();
            featuredEventsData = await featuredEventsRes.json();

            console.log("All data fetched successfully:", { venuesData, featuredEventsData, eventsListData, learnOhridTexts });
            
            initializeApp(); // Initialize the application after all data is loaded

        } catch (error) {
            console.error("Error fetching data:", error);
            if (mainPageContent) {
                mainPageContent.innerHTML = '<p style="color: red; text-align: center; padding: 2rem;">Could not load page content. Please check the console for errors and ensure all JSON data files (venues.json, featured_events.json, events.json, learn_ohrid_text.json) are present in the \'data\' folder and correctly formatted.</p>';
            }
        }
    }

    // --- Application Initialization ---
    function initializeApp() {
        console.log("Initializing app with fetched data...");
        
        loadPlanFromLocalStorage(); // Load plan early (New)
        setCssVariablesForOpacity(); // Helper for dynamic opacity based on CSS vars
        renderNavbar();
        
        if (heroSection && featuredEventsData && featuredEventsData.length > 0) {
            updateHeroSection(); // Initial update
            startHeroInterval(); // Start slideshow
            if (heroBookButton) {
                heroBookButton.addEventListener('click', () => {
                    const currentEvent = featuredEventsData[currentEventIndex];
                    if (currentEvent) {
                        if (currentEvent.bookingUrl && currentEvent.bookingUrl !== '#') {
                            window.open(currentEvent.bookingUrl, '_blank');
                        } else if (currentEvent.venueId) { // If no direct booking, try opening venue modal
                            openVenueModal(currentEvent.venueId);
                        }
                    }
                });
            }
        } else if (heroSection) {
            heroSection.classList.add('hidden'); // Hide hero if no data or element not found
            console.log("Hero section hidden due to no data or missing elements.");
        }
        
        if (exploreSection) {
            renderCategoryFilters();
            // renderRecommendationCards(); // Initial render for 'all' - REMOVED TO PREVENT ERROR
        }

        if (popularSectionContainer && venuesData && venuesData.length > 0) {
            renderPopularVenues();
        } else if (popularSectionContainer) {
            popularSectionContainer.innerHTML = '<p>No popular venues to display at the moment.</p>';
        }

        if (eventListItemsContainer && eventsListData) {
            renderEventListItems(getTodayDateString()); // Initial render for today's events
        } else if (eventListItemsContainer) {
             eventListItemsContainer.innerHTML = '<p>No upcoming events to display at the moment.</p>';
        }
        
        // Event Filter Listeners
        if (eventDatePicker) {
            flatpickr(eventDatePicker, {
                defaultDate: "today",
                dateFormat: "Y-m-d", // Match the filter logic
                onChange: function(selectedDates, dateStr, instance) {
                    renderEventListItems(dateStr);
                }
            });
        }
        if (clearEventFilterButton) {
            clearEventFilterButton.addEventListener('click', () => {
                const fp = eventDatePicker._flatpickr;
                if (fp) {
                    fp.clear();
                }
                renderEventListItems(); // Render all events
            });
        }
        
        setActiveLinkOnLoad(); // Important for setting the correct view on page load/refresh

        // Venue Modal listeners
        if (venueModal && modalCloseButton) {
            modalCloseButton.addEventListener('click', closeVenueModal);
        }
        if (venueModal) {
            venueModal.addEventListener('click', (event) => { // Close on overlay click
                if (event.target === venueModal) {
                    closeVenueModal();
                }
            });
        }

        // Generic Image Modal listeners
        if (imageModal && imageModalClose) {
            imageModalClose.addEventListener('click', closeImageModal);
            imageModal.addEventListener('click', (event) => { // Close on overlay click
                if (event.target === imageModal) {
                    closeImageModal();
                }
            });
        }

        // Mobile Nav Toggle Listener
        if (mobileNavToggle && primaryNav) {
            mobileNavToggle.addEventListener('click', () => {
                const isVisible = primaryNav.getAttribute('data-visible') === 'true';
                if (isVisible) {
                    primaryNav.setAttribute('data-visible', 'false');
                    mobileNavToggle.setAttribute('aria-expanded', 'false');
                } else {
                    primaryNav.setAttribute('data-visible', 'true');
                    mobileNavToggle.setAttribute('aria-expanded', 'true');
                }
            });
        }

        // Footer Year
        if (footerYear) {
            footerYear.textContent = new Date().getFullYear();
        }

        // Day Planner Form Submission Listener (New)
        if (addPlanItemForm) {
            // Event listener for Day/Night type change
            if (planDayNightTypeSelect) {
                planDayNightTypeSelect.addEventListener('change', (event) => {
                    const selectedType = event.target.value;
                    if (selectedType === "Daytime") {
                        populateActivityOptions(daytimeActivities);
                        populateTimeOptions(true);
                    } else if (selectedType === "Nighttime") {
                        populateActivityOptions(nighttimeActivities);
                        populateTimeOptions(false);
                    } else {
                        planActivityTypeSelect.innerHTML = '<option value="" disabled selected>Select time of day first...</option>'; // Changed from planActivityTypeInput
                        planItemTimeInput.innerHTML = '<option value="Any time" selected>Select time of day first</option>';
                    }
                    // Reset venue dropdown
                    planItemVenueGroup.style.display = 'none';
                    planItemVenueSelect.value = '';
                });
            }

            // Event listener for Activity type change
            if (planActivityTypeSelect) { // Changed from planActivityTypeInput
                planActivityTypeSelect.addEventListener('change', (event) => { // Changed from planActivityTypeInput
                    const selectedActivity = event.target.value;
                    const venueActivities = ["Coffee", "Lunch", "Dinner", "Drinks", "Pub", "Club", "Breakfast"];
                    if (venueActivities.includes(selectedActivity)) {
                        populateVenueOptions(selectedActivity); // Pass selected activity
                        planItemVenueGroup.style.display = 'block';
                    } else {
                        planItemVenueGroup.style.display = 'none';
                        planItemVenueSelect.value = '';
                    }
                });
            }

            addPlanItemForm.addEventListener('submit', (event) => {
                event.preventDefault(); // Prevent page reload

                const dayNightType = planDayNightTypeSelect.value;
                const activityType = planActivityTypeSelect.value;  // Changed from planActivityTypeInput
                const itemVenue = planItemVenueSelect.value; 
                const itemTime = planItemTimeInput.value;
                const itemNotes = planItemNotesInput.value.trim();

                if (!planDateInput.value) { // Ensure a date is selected
                    alert('Please select a date for the plan item.');
                    planDateInput.focus();
                    return;
                }
                if (!dayNightType) {
                    alert('Please select a time of day (Daytime/Nighttime).');
                    planDayNightTypeSelect.focus();
                    return;
                }
                if (!activityType) {
                    alert('Please select an activity.');
                    planActivityTypeSelect.focus(); // Changed from planActivityTypeInput
                    return;
                }

                const newItem = {
                    id: Date.now(), 
                    date: planDateInput.value, // Added date property
                    timeOfDay: dayNightType, 
                    activity: activityType, 
                    venue: itemVenue, 
                    time: itemTime || 'Any time', 
                    details: itemNotes
                };

                addItemToPlan(newItem);
                // renderCurrentPlanDisplay(); // displayPlanForDate will call this
                displayPlanForDate(planDateInput.value); // Show the plan for the date of the added item

                // Clear form fields
                addPlanItemForm.reset();
                planDayNightTypeSelect.value = ""; // Reset day/night dropdown
                planActivityTypeSelect.innerHTML = '<option value="" disabled selected>Select time of day first...</option>'; // Changed from planActivityTypeInput
                planItemTimeInput.innerHTML = '<option value="Any time" selected>Select time of day first</option>';
                planItemVenueGroup.style.display = 'none';
                planItemVenueSelect.innerHTML = '<option value="" disabled selected>Select a venue...</option>';
                planDayNightTypeSelect.focus(); // Focus back on the first input
            });
        }

        // Add event listener for the main date picker for the planner
        if (planDateInput) {
            flatpickr(planDateInput, {
                 dateFormat: "Y-m-d",
                 onChange: function(selectedDates, dateStr, instance) {
                    if (dateStr) {
                        displayPlanForDate(dateStr);
                        renderPlannerEventList(); // Update events when date changes
                    } else {
                        if(selectedDatePlanDetails) selectedDatePlanDetails.classList.add('hidden');
                        if(plannerEventSearchResults) plannerEventSearchResults.innerHTML = '<p>Select a date to see events.</p>'; // Clear results
                    }
                 }
            });
        }
        
        // Event Detail Modal Listener (New)
        if (eventDetailModal && eventDetailModalCloseButton) {
            eventDetailModalCloseButton.addEventListener('click', closeEventDetailModal);
            eventDetailModal.addEventListener('click', (e) => { // Close on overlay click
                if (e.target === eventDetailModal) {
                    closeEventDetailModal();
                }
            });
        }
        
        console.log("Application initialized successfully.");
    }

    // --- Helper: Set CSS Variables from HSL strings for rgba() usage ---
    function setCssVariablesForOpacity() {
        const rootStyle = getComputedStyle(document.documentElement);
        const backgroundHsl = rootStyle.getPropertyValue('--background').trim();
        const secondaryHsl = rootStyle.getPropertyValue('--secondary').trim();
        const mutedHsl = rootStyle.getPropertyValue('--muted').trim();
        const foregroundHsl = rootStyle.getPropertyValue('--foreground').trim();

        const extractHslValues = (hslString) => {
            const matches = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/i);
            if (matches) return { h: matches[1], s: matches[2], l: matches[3] };
            // Fallback if regex fails (e.g. if CSS var is not in hsl() format as expected)
            console.warn("Could not parse HSL string for CSS variables:", hslString, "Using fallback values.");
            return {h: '0', s: '0', l: '100'}; // Default to white or a neutral color
        };
        
        const backgroundValues = extractHslValues(backgroundHsl);
        document.documentElement.style.setProperty('--background-rgb', `${backgroundValues.h} ${backgroundValues.s}% ${backgroundValues.l}%`);
        document.documentElement.style.setProperty('--background-raw-rgb', `${backgroundValues.h},${backgroundValues.s}%,${backgroundValues.l}%`);

        const secondaryValues = extractHslValues(secondaryHsl);
        document.documentElement.style.setProperty('--secondary-hsl-h', secondaryValues.h);
        document.documentElement.style.setProperty('--secondary-hsl-s', secondaryValues.s + '%');
        document.documentElement.style.setProperty('--secondary-hsl-l', secondaryValues.l + '%');

        const mutedValues = extractHslValues(mutedHsl);
        document.documentElement.style.setProperty('--muted-hsl-h', mutedValues.h);
        document.documentElement.style.setProperty('--muted-hsl-s', mutedValues.s + '%');
        document.documentElement.style.setProperty('--muted-hsl-l', mutedValues.l + '%');

        const foregroundValues = extractHslValues(foregroundHsl);
        document.documentElement.style.setProperty('--foreground-hsl', `${foregroundValues.h} ${foregroundValues.s}% ${foregroundValues.l}%`);
    }

    // --- Hero Section Logic ---
    function updateHeroSection() {
        if (!heroSection || !featuredEventsData || featuredEventsData.length === 0) {
            console.warn("Hero section update skipped: Element not found or no featured events data.");
            if (heroSection) heroSection.classList.add('hidden');
            return;
        }
        
        const event = featuredEventsData[currentEventIndex];
        if (!event) {
            console.error("Hero Section: No event data found for current index:", currentEventIndex);
            return;
        }

        if (!heroBgImageDiv) { // Create background image div if it doesn't exist
            heroBgImageDiv = document.createElement('div');
            heroBgImageDiv.className = 'hero-background-image';
            
            const gradientDiv = document.createElement('div');
            gradientDiv.className = 'hero-background-gradient';
            
            heroSection.insertBefore(gradientDiv, heroSection.firstChild); 
            heroSection.insertBefore(heroBgImageDiv, gradientDiv); 
        }
        
        // Smooth transition for background image
        heroBgImageDiv.style.opacity = '0';
        setTimeout(() => {
            const isMobile = window.innerWidth <= 768;
            const imageUrl = isMobile && event.imageUrlMobile ? event.imageUrlMobile : event.imageUrl;
            heroBgImageDiv.style.backgroundImage = `url(${imageUrl})`;
            heroBgImageDiv.style.opacity = '1';
        }, 100); // Short delay for fade-in effect

        if (heroTitle) heroTitle.textContent = event.title;
        if (heroDescription) heroDescription.textContent = event.description;
        if (heroDate) heroDate.textContent = event.date;

        if (heroIndicatorsContainer) {
            heroIndicatorsContainer.innerHTML = ''; // Clear existing indicators
            featuredEventsData.forEach((_, index) => {
                const button = document.createElement('button');
                button.className = 'hero-indicator-button';
                if (index === currentEventIndex) {
                    button.classList.add('active');
                }
                button.setAttribute('aria-label', `View event ${index + 1}`);
                button.onclick = () => {
                    currentEventIndex = index;
                    updateHeroSection();
                    resetHeroInterval();
                };
                heroIndicatorsContainer.appendChild(button);
            });
        }

        // Clear previous event listeners to prevent multiple handlers
        const newHeroBookButton = heroBookButton.cloneNode(true);
        heroBookButton.parentNode.replaceChild(newHeroBookButton, heroBookButton);
        heroBookButton = newHeroBookButton; // Update reference to the new button

        if (event.specialLink === '#kulturno-leto') {
            heroBookButton.textContent = 'See more';
            heroBookButton.onclick = () => {
                showKulturnoLetoContent();
                // Potentially scroll to the content if it's not at the top of the viewport
                kulturnoLetoContentContainer.scrollIntoView({ behavior: 'smooth' });
            };
        } else if (event.specialLink === '#ohridsko-leto') { // Added for Ohridsko Leto
            heroBookButton.textContent = 'See more';
            heroBookButton.onclick = () => {
                showOhridskoLetoContent();
                ohridskoLetoContentContainer.scrollIntoView({ behavior: 'smooth' });
            };
        } else if (event.specialLink === '#ohrid-wine-fest') {
            heroBookButton.textContent = 'See more';
            heroBookButton.onclick = () => {
                showOhridWineFestContent();
                ohridWineFestContentContainer.scrollIntoView({ behavior: 'smooth' });
            };
        } else {
            heroBookButton.textContent = 'Book Now';
            if (event.bookingUrl) {
                heroBookButton.onclick = () => window.open(event.bookingUrl, '_blank');
            } else if (event.venueId) {
                const venue = venuesData.find(v => v.id === event.venueId);
                if (venue) {
                    heroBookButton.onclick = () => openVenueModal(event.venueId);
                } else {
                    heroBookButton.textContent = 'Details Unavailable';
                    heroBookButton.disabled = true;
                    heroBookButton.onclick = null;
                }
            } else {
                heroBookButton.textContent = 'Details Unavailable';
                heroBookButton.disabled = true;
                heroBookButton.onclick = null;
            }
        }
    }

    function startHeroInterval() {
        if (!featuredEventsData || featuredEventsData.length <= 1) return; // No slideshow for 0 or 1 item
        clearInterval(heroInterval); // Clear existing interval
        heroInterval = setInterval(() => {
            currentEventIndex = (currentEventIndex + 1) % featuredEventsData.length;
            updateHeroSection();
        }, 8000); // Change slide every 8 seconds
    }

    function resetHeroInterval() {
        if (!featuredEventsData || featuredEventsData.length <= 1) return;
        clearInterval(heroInterval);
        startHeroInterval();
    }

    // --- Navbar Logic ---
    function renderNavbar() {
        if (!navbarElement) {
            console.error("Navbar element not found, cannot render navbar.");
            return;
        }

        const container = navbarElement.querySelector('.container');
        container.innerHTML = ''; // Clear previous content for a clean slate

        // Logo
        const logo = document.createElement('div');
        logo.className = 'nav-logo';
        logo.innerHTML = '<span class="logo-main">Ohrid</span><span class="logo-secondary">Life</span>';
        logo.addEventListener('click', () => {
            showMainPageContent();
            setActiveNavLink(null); 
            window.history.pushState({}, '', '#');
        });
        container.appendChild(logo);

        // Hamburger Menu Button
        const mobileNavToggle = document.createElement('button');
        mobileNavToggle.className = 'mobile-nav-toggle';
        mobileNavToggle.innerHTML = '<span class="sr-only">Menu</span>'; // Accessible text, icon via CSS
        container.appendChild(mobileNavToggle);

        // Navigation Links Container
        const navLinksUl = document.createElement('ul');
        navLinksUl.className = 'nav-links';
        
        // --- Create and add all nav links to the UL ---
        const links = [
            { id: 'learn-ohrid', text: 'Learn about Ohrid', action: showLearnOhridContent },
            { id: 'kulturno-leto', text: 'Културолошко лето', action: showKulturnoLetoContent },
            { id: 'ohridsko-leto', text: 'Охридско Лето', action: showOhridskoLetoContent },
            { id: 'day-planner', text: 'Day Planner', action: showDayPlannerSection }
        ];

        links.forEach(linkInfo => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${linkInfo.id}`;
            a.textContent = linkInfo.text;
            a.dataset.id = linkInfo.id;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                linkInfo.action();
                // Close menu on link click for mobile
                if (window.innerWidth < 768) {
                    navbarElement.classList.remove('nav-open');
                }
            });
            li.appendChild(a);
            navLinksUl.appendChild(li);
        });

        container.appendChild(navLinksUl);

        // Event Listener for Hamburger
        mobileNavToggle.addEventListener('click', () => {
            navbarElement.classList.toggle('nav-open');
            const isExpanded = navbarElement.classList.contains('nav-open');
            mobileNavToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    function setActiveNavLink(activeElement) {
        if (!navbarElement) return;

        // Corrected selector to target all relevant nav links for clearing 'active' class
        const allNavLinks = navbarElement.querySelectorAll('.nav-links a[data-id]');
        allNavLinks.forEach(item => {
            item.classList.remove('active');
        });

        if (activeElement) {
            activeElement.classList.add('active');
            activeNavItem = activeElement.dataset.id || 'home';
        } else {
            // This case is for the main page (logo click) or when no specific link should be active
            activeNavItem = 'home';
        }
        console.log("Active nav item set to:", activeNavItem);
    }
    
    // --- Page/Content Switching Logic ---
    function setActiveLinkOnLoad() {
        const hash = window.location.hash;
        console.log("Setting active link on load for hash:", hash);
        if (hash === '#learn-ohrid') {
            showLearnOhridContent();
        } else if (hash === '#kulturno-leto') { 
            showKulturnoLetoContent();
        } else if (hash === '#ohridsko-leto') { 
            showOhridskoLetoContent();
        } else if (hash === '#day-planner') { 
            showDayPlannerSection();
        } else if (hash === '#ohrid-wine-fest') {
            showOhridWineFestContent();
        } else {
            showMainPageContent(); 
            // No explicit setActiveNavLink(null) here as showMainPageContent handles it.
        }
    }

    function showMainPageContent() {
        console.log("[Nav] Showing Main Page Content");
        if (mainPageContent) {
            mainPageContent.classList.remove('hidden');
            mainPageContent.style.display = ''; // Reset direct style if any
        }
        if (learnOhridContentContainer) {
            learnOhridContentContainer.classList.add('hidden');
            // learnOhridContentContainer.style.display = 'none'; // Revert
        }
        if (kulturnoLetoContentContainer) {
            kulturnoLetoContentContainer.classList.add('hidden');
            // kulturnoLetoContentContainer.style.display = 'none'; // Revert
        }
        if (ohridskoLetoContentContainer) {
            ohridskoLetoContentContainer.classList.add('hidden');
            // ohridskoLetoContentContainer.style.display = 'none'; // Revert
        }
        if (ohridWineFestContentContainer) {
            ohridWineFestContentContainer.classList.add('hidden');
        }
        if (dayPlannerSection) {
            dayPlannerSection.classList.add('hidden');
            // dayPlannerSection.style.display = 'none'; // Revert
        }
        
        if (navbarElement) { 
            setActiveNavLink(null); 
        }
        document.title = "OhridLife - Your Guide to Life in Ohrid";
        if (window.location.hash !== '' && window.location.hash !== '#') {
            window.history.pushState({}, '', '#');
        }
    }

    function showLearnOhridContent() {
        console.log("[Nav] Attempting to show Learn Ohrid");
        if (!learnOhridContentContainer) {
            console.error("Learn Ohrid content container not found.");
            return;
        }
        
        // Hide other primary content sections using class list
        if (mainPageContent) mainPageContent.classList.add('hidden');
        if (kulturnoLetoContentContainer) kulturnoLetoContentContainer.classList.add('hidden');
        if (ohridskoLetoContentContainer) ohridskoLetoContentContainer.classList.add('hidden');
        if (ohridWineFestContentContainer) ohridWineFestContentContainer.classList.add('hidden');
        if (dayPlannerSection) dayPlannerSection.classList.add('hidden');
        
        learnOhridContentContainer.classList.remove('hidden');
        learnOhridContentContainer.style.backgroundColor = ''; 

        let existingTextContentDiv = learnOhridContentContainer.querySelector('#ohrid-text-content');
        let existingLangButtons = learnOhridContentContainer.querySelector('.language-buttons-learn-ohrid');

        if (!existingTextContentDiv || !existingLangButtons) { // Re-create if either is missing
            console.log("[Learn Ohrid] Initializing content structure with language buttons.");
            learnOhridContentContainer.innerHTML = ''; 

            const langButtonContainer = document.createElement('div');
            langButtonContainer.className = 'language-buttons-learn-ohrid'; // Class for styling buttons
            ['mk', 'en'].forEach(lang => {
                const button = document.createElement('button');
                button.textContent = lang === 'mk' ? 'Македонски' : 'English';
                button.className = 'lang-button'; // General class for lang buttons
                button.dataset.lang = lang;
                button.addEventListener('click', () => renderLearnOhridText(lang));
                langButtonContainer.appendChild(button);
            });
            learnOhridContentContainer.appendChild(langButtonContainer);

            ohridTextContentDiv = document.createElement('div');
            ohridTextContentDiv.id = 'ohrid-text-content';
            learnOhridContentContainer.appendChild(ohridTextContentDiv);

            ohridImageSlideshowDiv = document.createElement('div');
            ohridImageSlideshowDiv.id = 'ohrid-image-slideshow';
            learnOhridContentContainer.appendChild(ohridImageSlideshowDiv);
        } else {
            ohridTextContentDiv = existingTextContentDiv;
            ohridImageSlideshowDiv = learnOhridContentContainer.querySelector('#ohrid-image-slideshow');
        }
        
        const lastSelectedLang = localStorage.getItem('selectedLanguageOhrid') || 'mk'; // Default to 'mk' or your preferred default
        renderLearnOhridText(lastSelectedLang); 

        if (navbarElement) {
            const learnOhridLink = navbarElement.querySelector('a[data-id="learn-ohrid"]');
            setActiveNavLink(learnOhridLink);
        }
        document.title = "OhridLife - Learn about Ohrid";
        window.history.pushState({}, '', '#learn-ohrid');
        console.log("[Nav] Finished showing Learn Ohrid. Hash set to #learn-ohrid");
    }

    function renderLearnOhridText(language) {
        if (!ohridTextContentDiv || !learnOhridTexts || !learnOhridTexts[language]) {
            console.error("Learn Ohrid: Text content div or language data not found.", { ohridTextContentDiv, learnOhridTexts, language });
            if(ohridTextContentDiv) ohridTextContentDiv.innerHTML = "<p>Content not available for this language.</p>";
            return;
        }
        ohridTextContentDiv.innerHTML = learnOhridTexts[language].fullContent;
        ohridTextContentDiv.setAttribute('lang', language);
        
        // Update active state for local buttons within learnOhridContentContainer
        if (learnOhridContentContainer) { // Ensure container exists
            const localLangButtons = learnOhridContentContainer.querySelectorAll('.language-buttons-learn-ohrid .lang-button');
            localLangButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.lang === language);
            });
        }
        localStorage.setItem('selectedLanguageOhrid', language); 

        ohridTextContentDiv.querySelectorAll('.ohrid-content-wrapper img').forEach(img => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => openImageModal(img.src));
        });

        renderOhridImageSlideshow(language);
    }
    
    // Updated slideshow function
    function renderOhridImageSlideshow(language) {
        console.log("[renderOhridImageSlideshow] Called for language:", language);
        console.log("[renderOhridImageSlideshow] learnOhridTexts object:", learnOhridTexts);
        if (learnOhridTexts && learnOhridTexts[language]) {
            console.log("[renderOhridImageSlideshow] Images for language '" + language + "':", learnOhridTexts[language].images);
        } else {
            console.log("[renderOhridImageSlideshow] learnOhridTexts or learnOhridTexts[language] is undefined.");
        }

        if (!ohridImageSlideshowDiv || !learnOhridTexts || !learnOhridTexts[language] || !learnOhridTexts[language].images) {
            console.error("Learn Ohrid Slideshow: Div, texts, or images for language not found.", { ohridImageSlideshowDiv, learnOhridTexts, language });
            if(ohridImageSlideshowDiv) ohridImageSlideshowDiv.innerHTML = "<p>Image slideshow not available.</p>";
            return;
        }

        const images = learnOhridTexts[language].images;
        ohridImageSlideshowDiv.innerHTML = ''; // Clear previous content

        if (!images || images.length === 0) {
            ohridImageSlideshowDiv.innerHTML = '<p style="text-align:center; padding:1rem; color: var(--muted-foreground);">No images available for the slideshow.</p>';
            return;
        }

        currentOhridImageIndex = 0; // Reset index

        const slideshowContainer = document.createElement('div');
        slideshowContainer.className = 'slideshow-container-learn-ohrid';

        const mainImage = document.createElement('img');
        mainImage.className = 'slideshow-main-image-learn-ohrid';
        mainImage.alt = 'Ohrid Slideshow Image';
        mainImage.style.cursor = 'pointer';
        mainImage.addEventListener('click', () => openImageModal(mainImage.src));

        const prevButton = document.createElement('button');
        prevButton.className = 'slideshow-arrow-learn-ohrid left';
        prevButton.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 18l-6-6 6-6"></path></svg>';
        prevButton.title = "Previous image";

        const nextButton = document.createElement('button');
        nextButton.className = 'slideshow-arrow-learn-ohrid right';
        nextButton.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 18l6-6-6-6"></path></svg>';
        nextButton.title = "Next image";

        function updateImage() {
            if (images.length > 0) {
                mainImage.src = images[currentOhridImageIndex];
                mainImage.alt = `Ohrid Image ${currentOhridImageIndex + 1}`;
            }
            prevButton.disabled = images.length <= 1 || currentOhridImageIndex === 0;
            nextButton.disabled = images.length <= 1 || currentOhridImageIndex === images.length - 1;
        }

        prevButton.addEventListener('click', () => {
            if (currentOhridImageIndex > 0) {
                currentOhridImageIndex--;
                updateImage();
            }
        });

        nextButton.addEventListener('click', () => {
            if (currentOhridImageIndex < images.length - 1) {
                currentOhridImageIndex++;
                updateImage();
            }
        });
        
        slideshowContainer.appendChild(prevButton);
        slideshowContainer.appendChild(mainImage);
        slideshowContainer.appendChild(nextButton);
        ohridImageSlideshowDiv.appendChild(slideshowContainer);

        updateImage(); // Initial image display
    }


    function openImageModal(src) {
        if (imageModal && imageModalImg) {
            imageModalImg.src = src;
            imageModal.classList.remove('hidden');
            imageModal.classList.add('visible');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeImageModal() {
        if (imageModal) {
            imageModal.classList.remove('visible');
            imageModal.classList.add('hidden');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    // --- Venue Modal Logic ---
    function openVenueModal(venueId) {
        if (!venuesData) {
            console.error("Venues data not loaded yet.");
            return;
        }
        
        // Ensure the modal content container is empty before populating
        const modalDetailsContent = document.getElementById('modal-details-content');
        if (modalDetailsContent) {
            // A simple way to "reset" before populating, though specific clearing is better
        }

        const venue = venuesData.find(v => v.id === parseInt(venueId, 10));
        if (!venue) {
            console.error("Venue not found for ID:", venueId);
            return;
        }

        if (modalVenueImage) modalVenueImage.src = venue.imageUrl || 'placeholder.jpg';
        if (modalVenueName) modalVenueName.textContent = venue.name || 'N/A';
        if (modalVenueType) modalVenueType.textContent = Array.isArray(venue.type) ? venue.type.join(' / ') : (venue.type || 'N/A');
        if (modalVenueDescription) modalVenueDescription.textContent = venue.description || 'No description available.';
        
        if (modalVenueRatingValue) modalVenueRatingValue.textContent = venue.rating ? venue.rating.toFixed(1) : 'N/A';
        // Star visibility could be handled by CSS or by adding/removing a class based on rating
        
        if (modalVenuePrice) modalVenuePrice.textContent = venue.priceLevel ? '$'.repeat(venue.priceLevel) : 'Price N/A';
        
        if (modalVenueAddress) modalVenueAddress.textContent = venue.location && venue.location.address ? venue.location.address : 'Address not available';
        
        if (modalVenueMapContainer) {
            if (venue.location && venue.location.mapIframe) {
                modalVenueMapContainer.innerHTML = venue.location.mapIframe;
            } else {
                modalVenueMapContainer.innerHTML = '<p style="text-align:center; padding: 1rem;">Map not available.</p>';
            }
        }
        
        if (modalVenuePhone) modalVenuePhone.textContent = venue.phone || 'Phone not available';
        if (modalVenueHours) modalVenueHours.innerHTML = venue.workingHours || 'Hours not available'; // Use innerHTML for <br>

        if (modalBookNowButton) {
            if (venue.bookingUrl && venue.bookingUrl !== '#') {
                modalBookNowButton.href = venue.bookingUrl;
                modalBookNowButton.textContent = 'Book Now';
                modalBookNowButton.onclick = (e) => { e.preventDefault(); window.open(venue.bookingUrl, '_blank'); };
                modalBookNowButton.disabled = false;
            } else {
                modalBookNowButton.href = '#';
                modalBookNowButton.textContent = 'Booking Info Unavailable';
                modalBookNowButton.onclick = (e) => e.preventDefault();
                modalBookNowButton.disabled = true;
            }
        }

        if (modalVenueEventsList && eventsListData) {
            modalVenueEventsList.innerHTML = ''; // Clear previous events
            const venueSpecificEvents = eventsListData.filter(event => event.venueId === venue.id);
            if (venueSpecificEvents.length > 0) {
                // Title for events in modal was here, but it's static in HTML, so just populate list
                venueSpecificEvents.forEach(event => {
                    const eventItem = createEventListItem(event, true); // true for modal context
                    modalVenueEventsList.appendChild(eventItem);
                });
            } else {
                modalVenueEventsList.innerHTML = '<p style="color: var(--muted-foreground); font-style: italic;">No upcoming events listed for this venue currently.</p>';
            }
        } else if (modalVenueEventsList) {
             modalVenueEventsList.innerHTML = '<p style="color: var(--muted-foreground); font-style: italic;">Could not load event information.</p>';
        }


        if (venueModal) {
            venueModal.classList.remove('hidden');
            venueModal.classList.add('visible'); // For CSS transitions if any
            document.body.style.overflow = 'hidden'; 
        }
    }

    function closeVenueModal() {
        if (venueModal) {
            venueModal.classList.remove('visible');
            setTimeout(() => { // Allow for transitions
                venueModal.classList.add('hidden');
                if (modalVenueMapContainer) modalVenueMapContainer.innerHTML = ''; // Clear map
                document.body.style.overflow = ''; 
            }, 300); 
        }
    }
    
    // --- Event List Item Creation (shared by main list and modal) ---
    function createEventListItem(event, isModalContext = false) {
        const item = document.createElement('div');
        item.className = isModalContext ? 'modal-event-item' : 'event-list-item';

        if (event.imageUrl && !isModalContext) {
            const image = document.createElement('img');
            image.src = event.imageUrl;
            image.alt = event.eventName || event.title;
            image.className = 'event-item-image';
            item.appendChild(image);
        }

        const infoDiv = document.createElement('div');
        infoDiv.className = 'event-item-info event-item-info-flex';
        infoDiv.style.display = 'flex';
        infoDiv.style.alignItems = 'baseline';
        infoDiv.style.gap = '0.75em'; // Adjust gap as needed for readability

        // Display Venue Name within the event item if available
        if (event.venueId && venuesData) { 
            const venue = venuesData.find(v => v.id === event.venueId);
            if (venue && venue.name) {
                const venueNameElem = document.createElement('span'); // Changed to span
                venueNameElem.className = isModalContext ? 'modal-event-venue-name' : 'event-venue-name';
                venueNameElem.textContent = venue.name + ": "; // Added space after colon
                infoDiv.appendChild(venueNameElem);
            }
        }
        
        const eventNameElem = document.createElement('span'); // Changed to span
        eventNameElem.className = isModalContext ? 'modal-event-name' : 'event-name';
        eventNameElem.style.fontWeight = isModalContext ? 'normal' : 'bold'; // Main list event name bolder
        eventNameElem.textContent = event.eventName || event.title;
        infoDiv.appendChild(eventNameElem);

        const timeDayElem = document.createElement('span'); // Changed to span
        timeDayElem.className = isModalContext ? 'modal-event-time-day' : 'event-time-day';
        timeDayElem.textContent = `(${event.day || ''} ${event.startTime || event.date || ''})`.trim();
        infoDiv.appendChild(timeDayElem);

        item.appendChild(infoDiv);

        // --- Clickability and Button Logic ---
        // const bookingUrl = event.eventBookingUrl || event.bookingUrl; // Not needed anymore

        if (event.venueId) {
            item.style.cursor = 'pointer';
            item.title = 'Click to view venue details'; // Tooltip for clarity
            item.addEventListener('click', (e) => {
                // If the click target or its parent was a button (none now), let its own handler work.
                // This check might be simplified or removed if no buttons are left inside the item.
                openVenueModal(event.venueId);
            });
        } else {
            // Event does not have a venueId, make it open the event detail modal
            item.style.cursor = 'pointer';
            item.title = 'Click to view event details';
            item.addEventListener('click', (e) => {
                // Prevent opening venue modal if somehow a venue-less item slipped through other checks
                // and also ensure that if future buttons are added inside, they can be clicked without triggering this.
                if (e.target.closest('button')) return; 
                openEventDetailModal(event.id); 
            });

            // Remove or don't create the 'Details Unavailable' button for these items
            const existingButton = item.querySelector('.event-book-button.simple-button');
            if (existingButton) {
                existingButton.remove();
            }
        }

        // Show disabled details button ONLY if the item is not clickable (no venueId)
        // This section is now effectively replaced by the else block above for non-venue events
        /*
        if (!event.venueId) { 
            const detailsButton = document.createElement('button');
            detailsButton.className = isModalContext ? 'modal-event-book-button simple-button' : 'event-book-button simple-button';
            detailsButton.textContent = 'Details Unavailable'; // More accurate text
            detailsButton.disabled = true;
            item.appendChild(detailsButton); // Should be appended to item, not infoDiv if it's a distinct element
        }
        */

        return item;
    }


    // --- Explore Section / Recommendation Cards ---
    function renderCategoryFilters() {
        if (!exploreSection) return;
        const mainContentContainer = exploreSection.querySelector('.container.mx-auto.px-4');
        if (!mainContentContainer) {
            console.error("Category Filters: Main container not found.");
            return;
        }

        // --- Main Category Filters ---
        let mainFiltersContainer = mainContentContainer.querySelector('.main-category-filters');
        if (!mainFiltersContainer) {
            mainFiltersContainer = document.createElement('div');
            mainFiltersContainer.className = 'main-category-filters';
            const headingElement = mainContentContainer.querySelector('h2');
            if (headingElement) {
                headingElement.insertAdjacentElement('afterend', mainFiltersContainer);
            } else {
                mainContentContainer.prepend(mainFiltersContainer);
            }
        }
        mainFiltersContainer.innerHTML = '';

        Object.keys(venueCategories).forEach(mainCat => {
            const button = document.createElement('button');
            button.textContent = mainCat;
            button.className = 'category-filter-button main';
            if (mainCat === activeMainCategory) {
                button.classList.add('active');
            }
            button.dataset.category = mainCat;
            button.addEventListener('click', () => {
                activeMainCategory = mainCat;
                const subCats = venueCategories[mainCat];
                activeSubCategory = Object.keys(subCats)[0]; // Select the first sub-category (usually 'all')
                renderCategoryFilters(); // Re-render all filters
                renderRecommendationCards(); // Re-render cards
            });
            mainFiltersContainer.appendChild(button);
        });

        // --- Sub Category Filters ---
        let subFiltersContainer = mainContentContainer.querySelector('.sub-category-filters');
        if (!subFiltersContainer) {
            subFiltersContainer = document.createElement('div');
            subFiltersContainer.className = 'sub-category-filters';
            mainFiltersContainer.insertAdjacentElement('afterend', subFiltersContainer);
        }
        subFiltersContainer.innerHTML = '';

        if (activeMainCategory) {
            const subCategories = venueCategories[activeMainCategory];
            if (Object.keys(subCategories).length > 1) { // Only show sub-filters if there's more than one option
                Object.entries(subCategories).forEach(([key, value]) => {
                    const button = document.createElement('button');
                    button.textContent = value;
                    button.className = 'category-filter-button sub';
                    if (key === activeSubCategory) {
                        button.classList.add('active');
                    }
                    button.dataset.category = key;
                    button.addEventListener('click', () => {
                        activeSubCategory = key;
                        renderCategoryFilters(); // Re-render to update active styles
                        renderRecommendationCards(); // Re-render cards
                    });
                    subFiltersContainer.appendChild(button);
                });
                subFiltersContainer.style.display = 'flex';
            } else {
                subFiltersContainer.style.display = 'none';
            }
        } else {
             subFiltersContainer.style.display = 'none';
        }
    }

    function renderRecommendationCards(category = 'all', targetContainer = null, itemsToShow = null) {
        const isPopularSection = !!targetContainer; // Check if we're rendering for popular or main explore
        let containerToRenderIn;
        let listParent;
        let recommendationWrapper; // Declared here

        if (isPopularSection) {
            containerToRenderIn = targetContainer; // Provided for popular section
            listParent = targetContainer; // Popular section's container itself will hold the list
        } else {
            if (!exploreSection) {
                console.error("Render Recommendations: Explore section not found.");
                return;
            }
            
            // Find or create the wrapper element for recommendations
            recommendationWrapper = exploreSection.querySelector('.recommendation-wrapper');
            if (!recommendationWrapper) {
                recommendationWrapper = document.createElement('div');
                recommendationWrapper.className = 'recommendation-wrapper';
                const subFilters = exploreSection.querySelector('.sub-category-filters');
                if (subFilters) {
                    subFilters.insertAdjacentElement('afterend', recommendationWrapper);
                } else {
                    const mainFilters = exploreSection.querySelector('.main-category-filters');
                    if (mainFilters) {
                        mainFilters.insertAdjacentElement('afterend', recommendationWrapper);
                    }
                }
            }

            // If no main category is selected, clear the wrapper and stop.
            if (!activeMainCategory) {
                recommendationWrapper.innerHTML = '';
                return; 
            }

            containerToRenderIn = recommendationWrapper;
            listParent = recommendationWrapper;
        }
        
        if (!venuesData) {
             console.error("Render Recommendations: Venues data not loaded.");
             if(listParent) listParent.innerHTML = "<p>Could not load venue recommendations.</p>";
             return;
        }

        // Clean up previous recommendations and scroll controls
        const oldScrollControls = listParent.querySelector('.recommendation-scroll-controls');
        if (oldScrollControls) {
            oldScrollControls.remove();
        }
         const oldList = listParent.querySelector('.recommendation-list');
        if (oldList) {
             oldList.remove();
        }

        const scrollControlsWrapper = document.createElement('div');
        scrollControlsWrapper.className = 'recommendation-scroll-controls';

        const recommendationsList = document.createElement('div');
        recommendationsList.className = 'recommendation-list';
        scrollControlsWrapper.appendChild(recommendationsList);

        let filteredVenues = venuesData;
        if (!isPopularSection) { // Only filter by category for the main explore section
            const subCatsToShow = venueCategories[activeMainCategory];
            
            if (activeSubCategory === 'all') {
                const allSubCatKeys = Object.keys(subCatsToShow).filter(k => k !== 'all');
                filteredVenues = venuesData.filter(venue => {
                    const venueTypes = Array.isArray(venue.type) ? venue.type : [venue.type];
                    return venueTypes.some(vt => allSubCatKeys.includes(vt));
                });
            } else {
                 filteredVenues = venuesData.filter(venue => {
                    return Array.isArray(venue.type) ? venue.type.includes(activeSubCategory) : venue.type === activeSubCategory;
                });
            }

        } else if (itemsToShow) { // For popular section, use shuffling and slicing
            // Shuffle the array randomly and then slice
            const shuffled = [...venuesData].sort(() => 0.5 - Math.random());
            filteredVenues = shuffled.slice(0, itemsToShow);
        }


        if (filteredVenues.length > 0) {
            // This logic needs to run after the list is in the DOM to get clientWidth, but we can prepare it.
            // We'll check for overflow after appending.
        }
        
        listParent.appendChild(scrollControlsWrapper);
        
        recommendationsList.innerHTML = ''; 

        if (filteredVenues.length === 0) {
            const noVenuesMsg = document.createElement('p');
            noVenuesMsg.textContent = isPopularSection ? 'No popular venues to show right now.' : `No venues found for category: ${activeSubCategory}`;
            noVenuesMsg.style.cssText = 'color: var(--muted-foreground); text-align: center; padding: 2rem; width: 100%;';
            recommendationsList.appendChild(noVenuesMsg);
            return;
        }

        filteredVenues.forEach(venue => {
            const card = document.createElement('div');
            card.className = 'recommendation-card';
            card.onclick = () => openVenueModal(venue.id);

            const imageLink = document.createElement('a'); // Make image clickable
            imageLink.href = "#"; 
            imageLink.className = 'recommendation-card-image-wrapper';
            imageLink.style.display = 'block';
            imageLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent card click if image is clicked
                openVenueModal(venue.id); 
            });

            const image = document.createElement('img');
            image.src = venue.imageUrl || 'placeholder.jpg';
            image.alt = venue.name;
            image.className = 'recommendation-card-image';
            imageLink.appendChild(image);
            card.appendChild(imageLink);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'recommendation-card-content';

            const name = document.createElement('h3');
            name.className = 'recommendation-card-name';
            name.textContent = venue.name;
            contentDiv.appendChild(name);

            // Optional: Add rating and price to card directly
            const cardDetails = document.createElement('div');
            cardDetails.className = 'recommendation-card-details';
            
            if(venue.rating){
                const ratingP = document.createElement('p');
                ratingP.innerHTML = `<span class="star">★</span> ${venue.rating.toFixed(1)}`;
                cardDetails.appendChild(ratingP);
            }
            if(venue.priceLevel){
                const priceP = document.createElement('p');
                priceP.textContent = '$'.repeat(venue.priceLevel);
                cardDetails.appendChild(priceP);
            }
            contentDiv.appendChild(cardDetails);

            card.appendChild(contentDiv);
            recommendationsList.appendChild(card);
        });

        // Now that the list is populated, check for overflow and add arrows if needed
        const cardWidth = 240 + 16; // card width + gap, approx.
        const containerWidth = listParent.clientWidth;
        if (filteredVenues.length * cardWidth > containerWidth) { // Only add arrows if content overflows
            const leftArrow = document.createElement('button');
            leftArrow.className = 'recommendation-list-arrow left';
            leftArrow.innerHTML = '<svg class="lucide-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 18l-6-6 6-6"></path></svg>';
            leftArrow.addEventListener('click', () => {
                recommendationsList.scrollBy({ left: -recommendationsList.clientWidth * 0.75, behavior: 'smooth' });
            });
            scrollControlsWrapper.insertBefore(leftArrow, recommendationsList);

            const rightArrow = document.createElement('button');
            rightArrow.className = 'recommendation-list-arrow right';
            rightArrow.innerHTML = '<svg class="lucide-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 18l6-6-6-6"></path></svg>';
            rightArrow.addEventListener('click', () => {
                recommendationsList.scrollBy({ left: recommendationsList.clientWidth * 0.75, behavior: 'smooth' });
            });
            scrollControlsWrapper.appendChild(rightArrow);
        }

        if (!exploreSection) {
            console.error("Render Recommendations: Explore section not found.");
            return;
        }

        if (!activeMainCategory) {
            let recommendationWrapper = exploreSection.querySelector('.recommendation-wrapper');
            if (!recommendationWrapper) {
                recommendationWrapper = document.createElement('div');
                recommendationWrapper.className = 'recommendation-wrapper';
                const subFilters = exploreSection.querySelector('.sub-category-filters');
                if (subFilters) {
                    subFilters.insertAdjacentElement('afterend', recommendationWrapper);
                } else {
                     exploreSection.querySelector('.main-category-filters').insertAdjacentElement('afterend', recommendationWrapper);
                }
            }

            if (!activeMainCategory) {
                recommendationWrapper.innerHTML = ''; // Clear the content instead of showing a prompt
                return; // Stop execution if no main category is selected
            }
            
             containerToRenderIn = recommendationWrapper;
             listParent = recommendationWrapper;
        }

        recommendationWrapper.appendChild(recommendationsList);
    }

    // --- Popular Venues Section (uses renderRecommendationCards with specific target) ---
    function renderPopularVenues() {
        if (!popularSectionContainer) {
            console.error("Popular Venues: Section container not found.");
            return;
        }
        popularSectionContainer.innerHTML = ''; // Clear any previous static H2 or content

        // Add the "Popular this week" heading dynamically
        const popularHeading = document.createElement('h2');
        popularHeading.className = 'text-2xl md:text-3xl font-bold mb-6'; // from index.html
        popularHeading.textContent = 'Popular this week';
        popularSectionContainer.appendChild(popularHeading);
        
        renderRecommendationCards('all', popularSectionContainer, 5); // 'all' category, render into popular, show 5
    }


    // --- Main Event List on Homepage ---
    function renderEventListItems(filterDate = null) { 
        if (!eventListItemsContainer) {
            console.error("Main event list container not found");
            return;
        }
        eventListItemsContainer.innerHTML = ''; 

        let eventsToRender = eventsListData;

        if (filterDate) {
            eventsToRender = eventsListData.filter(event => event.isoDate === filterDate);
        } else {
            // Filter out past events if no specific date is selected
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            const dd = String(today.getDate()).padStart(2, '0');
            const todayIsoDate = `${yyyy}-${mm}-${dd}`;

            eventsToRender = eventsListData.filter(event => event.isoDate >= todayIsoDate);
        }

        if (!eventsToRender || eventsToRender.length === 0) {
            let message = '<p style="text-align:center; padding: 1rem; color: var(--muted-foreground);">';
            if (filterDate) {
                const friendlyDate = new Date(filterDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                message += `No events found for ${friendlyDate}.</p>`;
            } else {
                message += 'No upcoming events listed currently.</p>';
            }
            eventListItemsContainer.innerHTML = message;
            return;
        }

        // Optional: Sort events by date if not already sorted in JSON and showing all
        if (!filterDate) {
            eventsToRender.sort((a, b) => new Date(a.isoDate) - new Date(b.isoDate));
        }

        eventsToRender.forEach(event => {
            const listItem = createEventListItem(event, false); // false for main list context
            eventListItemsContainer.appendChild(listItem);
        });
    }

    // --- Day Planner Logic (New) ---
    function showDayPlannerSection() {
        console.log("[Nav] Attempting to show Day Planner");
        if (!dayPlannerSection) {
            console.error("Day Planner section container not found.");
            return;
        }

        // Hide other main content sections
        if (mainPageContent) mainPageContent.classList.add('hidden');
        if (learnOhridContentContainer) learnOhridContentContainer.classList.add('hidden');
        if (kulturnoLetoContentContainer) kulturnoLetoContentContainer.classList.add('hidden');
        if (ohridskoLetoContentContainer) ohridskoLetoContentContainer.classList.add('hidden');
        if (ohridWineFestContentContainer) ohridWineFestContentContainer.classList.add('hidden');
        
        dayPlannerSection.classList.remove('hidden');
        if (learnOhridContentContainer) learnOhridContentContainer.style.backgroundColor = '';

        // Default to today's date if no date is currently selected in the input
        if (planDateInput && !planDateInput.value) {
            const todayStr = getTodayDateString();
            planDateInput.value = todayStr;
            // displayPlanForDate will be called implicitly by the 'change' event on planDateInput,
            // or explicitly if no 'change' event is fired by programmatic value setting.
            // To be safe, and ensure the plan for today is shown:
            displayPlanForDate(todayStr);
        } else if (planDateInput && planDateInput.value) {
            // If a date is already set, ensure its plan is displayed
            displayPlanForDate(planDateInput.value);
        } else {
             // Fallback if planDateInput doesn't exist, or no value, render with no specific date (will show 'select date' message)
            renderCurrentPlanDisplay(); 
        }

        renderPlannerEventList(); // New function call for the planner search

        if (navbarElement) {
            const plannerLink = navbarElement.querySelector('a[data-id="day-planner"]');
            setActiveNavLink(plannerLink);
        }
        document.title = "OhridLife - Day Planner";
        window.history.pushState({}, '', '#day-planner');
        console.log("[Nav] Finished showing Day Planner. Hash set to #day-planner");
    }

    function addItemToPlan(itemData) {
        if (!itemData || typeof itemData !== 'object') {
            console.error("addItemToPlan: Invalid itemData provided.", itemData);
            return;
        }
        // Basic validation for required fields
        // The following check for itemData.name is removed as the 'name' field is no longer used.
        /*
        if (!itemData.name) { 
            console.warn("addItemToPlan: Item missing name.", itemData);
            // Potentially add default values or skip adding
        }
        */
        // Ensure item has an ID
        if (!itemData.id) {
            itemData.id = Date.now();
            console.warn("addItemToPlan: Item was missing ID, assigned one:", itemData.id);
        }

        currentPlan.push(itemData);
        console.log("Item added to plan:", itemData, "Current plan:", currentPlan);
        savePlanToLocalStorage(); // Save after adding (New)
    }

    function displayPlanForDate(dateString) {
        if (!selectedDatePlanDetails || !currentlyViewingDateSpan) {
            console.error("displayPlanForDate: Essential Day Planner elements (selectedDatePlanDetails or currentlyViewingDateSpan) are not found in the DOM.");
            return;
        }

        const displayDate = dateString ? new Date(dateString + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Current Selections";
        currentlyViewingDateSpan.textContent = displayDate;

        // TODO: Implement logic to load/filter `currentPlan` for the given `dateString`
        // For now, renderCurrentPlanDisplay will show whatever is in the global currentPlan.
        // This assumes currentPlan is either already filtered or represents the active date's items.

        selectedDatePlanDetails.classList.remove('hidden'); 
        renderCurrentPlanDisplay(); 
    }

    function renderCurrentPlanDisplay() {
        console.log('At start of renderCurrentPlanDisplay, currentPlanDisplay:', currentPlanDisplay); // Log 3
        if (!currentPlanDisplay) {
            console.error("renderCurrentPlanDisplay: currentPlanDisplay element not found.");
            return;
        }
        currentPlanDisplay.innerHTML = ''; // Clear previous content

        const selectedDate = planDateInput ? planDateInput.value : null;

        if (!selectedDate) {
            currentPlanDisplay.innerHTML = '<p style="text-align: center; padding: 1rem; color: var(--muted-foreground);">Please select a date to view or add items to your plan.</p>';
            // Also hide the clear button if no date is selected
            const clearButtonContainer = document.getElementById('clear-selected-date-plan-button-container');
            if (clearButtonContainer) clearButtonContainer.classList.add('hidden'); 
            return;
        } else {
            // Show the clear button container if a date is selected
            const clearButtonContainer = document.getElementById('clear-selected-date-plan-button-container');
            if (clearButtonContainer) clearButtonContainer.classList.remove('hidden');
        }

        const itemsForSelectedDate = currentPlan.filter(item => item.date === selectedDate);

        if (itemsForSelectedDate.length === 0) {
            currentPlanDisplay.innerHTML = `<p style="text-align: center; padding: 1rem; color: var(--muted-foreground);">Your plan for ${new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} is empty. Add some activities!</p>`;
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'day-plan-list'; // For styling

        itemsForSelectedDate.forEach((item, index) => { // Iterate over filtered items
            const li = document.createElement('li');
            li.className = 'day-plan-item';
            li.dataset.itemId = item.id; 
            li.dataset.itemIndex = index; 
            li.draggable = true; 

            li.addEventListener('dragstart', handleDragStart);
            li.addEventListener('dragend', handleDragEnd);

            const itemText = document.createElement('span');
            itemText.className = 'day-plan-item-text';
            
            // Updated display logic
            let displayText = ``;
            if (item.name) { // Check for name (from event suggestions)
                displayText += item.name;
            } else if (item.activity) { // Fallback to activity (from manual form)
                displayText += item.activity;
            }
            
            if (item.venue) {
                displayText += ` at ${item.venue}`;
            }
            
            if (item.time && item.time.toLowerCase() !== 'any time') {
                 displayText += ` (${item.time})`;
            }
            
            // Optionally add item.timeOfDay (e.g., "Daytime") if needed in the display
            // displayText += ` [${item.timeOfDay}]`;


            itemText.textContent = displayText.trim();
            
            if (item.details) {
                const detailsSpan = document.createElement('span');
                detailsSpan.className = 'day-plan-item-details';
                detailsSpan.textContent = ` - ${item.details}`;
                // Append detailsSpan to li or itemText depending on desired layout
                // For simplicity, let's make it part of the main line if short, or a new line if long.
                // For now, appending to the same line:
                itemText.appendChild(detailsSpan); 
            }
            li.appendChild(itemText);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'day-plan-item-remove-btn';
            removeBtn.textContent = 'Remove';
            removeBtn.addEventListener('click', () => {
                removeItemFromPlan(item.id);
            });
            li.appendChild(removeBtn);

            ul.appendChild(li);
        });
        currentPlanDisplay.appendChild(ul);

        ul.addEventListener('dragover', handleDragOver);
        ul.addEventListener('dragenter', handleDragEnter);
        ul.addEventListener('dragleave', handleDragLeave);
        ul.addEventListener('drop', handleDrop);
    }

    function removeItemFromPlan(itemId) {
        currentPlan = currentPlan.filter(item => item.id !== itemId);
        savePlanToLocalStorage();
        renderCurrentPlanDisplay(); // Refresh main plan display
        // No need to re-render suggestions, but if an event was added from suggestions
        // and then removed from plan, it would still show in suggestions if not handled.
        // For now, this is acceptable as suggestions are static for the session once rendered.
        console.log("Item removed from plan. New plan:", currentPlan);
    }

    // --- Drag and Drop Handlers for Day Planner (New) ---
    function handleDragStart(e) {
        draggedItem = e.target; // The <li> element
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedItem.dataset.itemId); // Pass item ID
        
        // Add dragging class for visual feedback (timeout for smoother transition)
        setTimeout(() => {
            draggedItem.classList.add('dragging');
        }, 0);
        console.log('Drag Start:', draggedItem.dataset.itemId);
    }

    function handleDragEnd(e) {
        console.log('Drag End:', draggedItem ? draggedItem.dataset.itemId : 'null');
        // Clean up: remove dragging class and placeholder
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
        }
        draggedItem = null;
        removeDragOverPlaceholder();
    }

    function handleDragOver(e) {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';

        const list = e.currentTarget; // The <ul> element
        const afterElement = getDragAfterElement(list, e.clientY);
        
        removeDragOverPlaceholder(); // Remove previous placeholder

        if (!dragOverPlaceholder) {
            dragOverPlaceholder = document.createElement('li'); // Use 'li' for correct spacing
            dragOverPlaceholder.className = 'drag-over-placeholder';
        }

        if (afterElement == null) { // If dragging to the end of the list
            list.appendChild(dragOverPlaceholder);
        } else { // If dragging before another element
            list.insertBefore(dragOverPlaceholder, afterElement);
        }
    }

    function handleDragEnter(e) {
        e.preventDefault();
        // Can add class to list container for visual feedback if desired
        // e.currentTarget.classList.add('drag-over-active-list');
        console.log('Drag Enter list');
    }

    function handleDragLeave(e) {
        // Check if the leave is to an outside element, not a child
        if (!e.currentTarget.contains(e.relatedTarget)) {
            removeDragOverPlaceholder();
            // e.currentTarget.classList.remove('drag-over-active-list');
            console.log('Drag Leave list');
        }
    }
    
    function handleDrop(e) {
        e.preventDefault();
        const droppedItemId = e.dataTransfer.getData('text/plain');
        const list = e.currentTarget; // The <ul> element
        const afterElement = getDragAfterElement(list, e.clientY); // Where to insert

        console.log('Drop: Item ID', droppedItemId, 'After Element:', afterElement ? afterElement.dataset.itemId : 'end of list');

        // Find the dragged item's data in currentPlan
        const draggedItemDataIndex = currentPlan.findIndex(item => String(item.id) === droppedItemId);
        if (draggedItemDataIndex === -1) {
            console.error("Dropped item data not found in currentPlan array!");
            return; // Should not happen
        }
        const [itemToMove] = currentPlan.splice(draggedItemDataIndex, 1); // Remove from old position

        if (afterElement == null) { // Dropped at the end
            currentPlan.push(itemToMove);
        } else {
            const afterElementId = afterElement.dataset.itemId;
            const targetIndex = currentPlan.findIndex(item => String(item.id) === afterElementId);
            if (targetIndex !== -1) {
                currentPlan.splice(targetIndex, 0, itemToMove); // Insert at new position
            } else {
                // Fallback: if target not found (should not happen if IDs are consistent), append to end
                currentPlan.push(itemToMove);
                console.warn("Drop target element not found in currentPlan, appending to end.");
            }
        }

        savePlanToLocalStorage();
        renderCurrentPlanDisplay(); // Re-render to reflect new order
        // removeDragOverPlaceholder(); // Already handled by dragend or dragleave
        // list.classList.remove('drag-over-active-list');
    }

    function getDragAfterElement(container, y) {
        // Get all draggable items (excluding the one being dragged and placeholder)
        const draggableElements = [...container.querySelectorAll('.day-plan-item:not(.dragging):not(.drag-over-placeholder)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function removeDragOverPlaceholder() {
        if (dragOverPlaceholder && dragOverPlaceholder.parentNode) {
            dragOverPlaceholder.parentNode.removeChild(dragOverPlaceholder);
        }
        dragOverPlaceholder = null;
    }


    // --- Event Suggestions for Day Planner (New) ---
    function renderEventSuggestionsForPlanner() {
        if (!eventSuggestionsList) {
            console.error("Event suggestions container for planner not found.");
            return;
        }
        eventSuggestionsList.innerHTML = ''; // Clear previous suggestions

        if (!eventsListData || eventsListData.length === 0) {
            eventSuggestionsList.innerHTML = '<p style="color: var(--muted-foreground); font-style: italic;">No upcoming events to suggest right now.</p>';
            return;
        }

        // Get upcoming events (similar to renderEventListItems logic)
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayIsoDate = `${yyyy}-${mm}-${dd}`;

        const upcomingEvents = eventsListData
            .filter(event => event.isoDate >= todayIsoDate)
            .sort((a, b) => new Date(a.isoDate) - new Date(b.isoDate))
            .slice(0, 3); // Show top 3 upcoming events as suggestions

        if (upcomingEvents.length === 0) {
            eventSuggestionsList.innerHTML = '<p style="color: var(--muted-foreground); font-style: italic;">No upcoming events to suggest right now.</p>';
            return;
        }

        upcomingEvents.forEach(event => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'event-suggestion-item';
            
            // Forcing the correct layout directly on the element to bypass CSS issues
            suggestionItem.style.flexDirection = 'row';

            const infoDiv = document.createElement('div');
            infoDiv.className = 'event-suggestion-item-info';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'event-suggestion-item-name';
            nameSpan.textContent = event.eventName || event.title;
            infoDiv.appendChild(nameSpan);

            const dateSpan = document.createElement('span');
            dateSpan.className = 'event-suggestion-item-date';
            const friendlyDate = new Date(event.isoDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            dateSpan.textContent = `(${friendlyDate})`;
            infoDiv.appendChild(dateSpan);
            
            suggestionItem.appendChild(infoDiv);

            const addButton = document.createElement('button');
            addButton.className = 'add-suggestion-to-plan-btn';
            addButton.textContent = 'Add to Plan';
            addButton.addEventListener('click', () => {
                const planItem = {
                    id: Date.now(), // Unique ID
                    date: event.isoDate, // Explicitly set date from event's isoDate
                    name: event.eventName || event.title,
                    time: event.isoDate, // Keep original time property if used elsewhere, or decide if it's redundant
                    details: `Event on ${friendlyDate}${event.venueId ? ' (Venue ID: ' + event.venueId + ')' : ''}`,
                    isEventSuggestion: true // Optional flag
                };
                addItemToPlan(planItem);
                renderCurrentPlanDisplay(); // Re-render the main plan display
                // Optionally, disable the button or give feedback
                addButton.textContent = 'Added!';
                addButton.disabled = true;
                setTimeout(() => { // Reset button after a delay
                    addButton.textContent = 'Add to Plan';
                    addButton.disabled = false;
                }, 2000);
            });
            suggestionItem.appendChild(addButton);
            eventSuggestionsList.appendChild(suggestionItem);
        });
    }

    // --- LocalStorage for Day Planner (New) ---
    function savePlanToLocalStorage() {
        try {
            localStorage.setItem(LOCAL_STORAGE_PLAN_KEY, JSON.stringify(currentPlan));
            console.log("Plan saved to localStorage");
        } catch (e) {
            console.error("Error saving plan to localStorage:", e);
        }
    }

    function loadPlanFromLocalStorage() {
        try {
            const savedPlan = localStorage.getItem(LOCAL_STORAGE_PLAN_KEY);
            if (savedPlan) {
                currentPlan = JSON.parse(savedPlan);
                console.log("Plan loaded from localStorage:", currentPlan);
            } else {
                currentPlan = []; // Initialize if no saved plan
                console.log("No plan found in localStorage, initialized empty plan.");
            }
        } catch (e) {
            console.error("Error loading plan from localStorage:", e);
            currentPlan = []; // Initialize to empty on error
        }
    }

    // --- Event Detail Modal Logic (New) ---
    function openEventDetailModal(eventId) {
        if (!eventsListData) {
            console.error("Event Detail Modal: Events data not loaded yet.");
            return;
        }
        const event = eventsListData.find(e => e.id == eventId); // Use == for potential string/number ID mismatch
        if (!event) {
            console.error("Event Detail Modal: Event not found for ID:", eventId);
            return;
        }

        if (modalEventImage) {
            if (event.imageUrl) {
                modalEventImage.src = event.imageUrl;
                modalEventImage.alt = event.eventName || event.title || 'Event image';
                modalEventImage.style.display = 'block';
            } else {
                modalEventImage.style.display = 'none'; // Hide if no image
            }
        }
        if (modalEventName) modalEventName.textContent = event.eventName || event.title || 'N/A';
        
        let dateTimeString = '';
        if (event.isoDate) {
            const friendlyDate = new Date(event.isoDate + 'T00:00:00').toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
            });
            dateTimeString += friendlyDate;
        }
        if (event.startTime) {
            dateTimeString += (dateTimeString ? ', ' : '') + `Time: ${event.startTime}`;
        }
        if (modalEventDateTime) modalEventDateTime.textContent = dateTimeString || 'Date/Time not specified';

        if (modalEventDescription) modalEventDescription.textContent = event.description || 'No description available.';
        if (modalEventCategoryValue) modalEventCategoryValue.textContent = event.category || 'N/A';

        // Handle Location Iframe (New)
        if (modalEventLocationMap) {
            if (event.locationIframe) {
                modalEventLocationMap.innerHTML = event.locationIframe;
                modalEventLocationMap.style.display = 'block';
            } else {
                modalEventLocationMap.innerHTML = ''; // Clear previous iframe
                modalEventLocationMap.style.display = 'none';
            }
        }

        if (eventDetailModal) {
            eventDetailModal.classList.remove('hidden');
            eventDetailModal.classList.add('visible');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeEventDetailModal() {
        if (eventDetailModal) {
            eventDetailModal.classList.add('hidden');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    function showKulturnoLetoContent(language) { // CORRECTED AND FINAL VERSION
        if (!kulturnoLetoContentContainer) {
            console.error("Kulturno Leto content container not found.");
            return;
        }
        console.log("[Nav] Attempting to show Kulturno Leto");

        const currentKulturnoLetoLang = language || localStorage.getItem('selectedLanguageKulturnoLeto') || 'mk';
        localStorage.setItem('selectedLanguageKulturnoLeto', currentKulturnoLetoLang);

        // Hide other primary content sections
        if (mainPageContent) mainPageContent.classList.add('hidden');
        if (learnOhridContentContainer) learnOhridContentContainer.classList.add('hidden');
        if (ohridskoLetoContentContainer) ohridskoLetoContentContainer.classList.add('hidden');
        if (ohridWineFestContentContainer) ohridWineFestContentContainer.classList.add('hidden');
        if (dayPlannerSection) dayPlannerSection.classList.add('hidden');

        kulturnoLetoContentContainer.classList.remove('hidden');
        if (learnOhridContentContainer) learnOhridContentContainer.style.backgroundColor = '';

        // --- Start constructing content ---
        // Create a single container that will hold everything, ensuring consistent centering.
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'container';

        // Create and add language buttons to the wrapper first.
        const langButtonContainerKL = document.createElement('div');
        langButtonContainerKL.className = 'language-buttons-kulturno-leto';

        ['mk', 'en'].forEach(lang => {
            const button = document.createElement('button');
            button.textContent = lang === 'mk' ? 'Македонски' : 'English';
            button.className = 'lang-button';
            if (lang === currentKulturnoLetoLang) {
                button.classList.add('active');
            }
            button.dataset.lang = lang;
            button.addEventListener('click', () => showKulturnoLetoContent(lang));
            langButtonContainerKL.appendChild(button);
        });
        contentWrapper.appendChild(langButtonContainerKL); // Buttons are now inside the main container

        // Get the texts for the selected language
        const texts = kulturnoLetoTexts[currentKulturnoLetoLang];
        if (!texts) {
            console.error(`Texts for language '${currentKulturnoLetoLang}' not found in kulturnoLetoTexts.`);
            contentWrapper.innerHTML += '<p>Content not available in the selected language.</p>';
            kulturnoLetoContentContainer.innerHTML = '';
            kulturnoLetoContentContainer.appendChild(contentWrapper);
            return;
        }
        
        // Create a new div for the rest of the content to avoid overwriting buttons
        const textAndEventsDiv = document.createElement('div');
        textAndEventsDiv.innerHTML = `
            <h2 style="text-align: center; color: var(--primary); margin-bottom: 1.5rem; font-size: 2.25rem; font-weight: 700;">${texts.title}</h2>
            <p style="text-align: center; color: var(--foreground); margin-bottom: 2.5rem; font-size: 1.1rem; line-height: 1.7; max-width: 800px; margin-left: auto; margin-right: auto;">
                ${texts.description} 
            </p>
            <div id="kulturno-leto-events-list" class="kulturno-leto-events-list-container" style="margin-top: 1.5rem;"></div>
        `;
        contentWrapper.appendChild(textAndEventsDiv);

        // --- Replace the main container's content with our newly constructed wrapper ---
        kulturnoLetoContentContainer.innerHTML = '';
        kulturnoLetoContentContainer.appendChild(contentWrapper);

        const eventsListDiv = kulturnoLetoContentContainer.querySelector('#kulturno-leto-events-list');
        if (!eventsListDiv) {
            console.error("Kulturno Leto: events list container not found inside main container.");
            return;
        }

        // Event listing logic
        if (eventsListData && eventsListData.length > 0) {
            const kulturnoLetoEvents = eventsListData.filter(event => event.isKulturnoLetoEvent === true);
            if (kulturnoLetoEvents.length > 0) {
                kulturnoLetoEvents.forEach(event => {
                    const eventWrapperDiv = document.createElement('div');
                    eventWrapperDiv.className = 'kulturno-leto-event-item';

                    const eventHeaderDiv = document.createElement('div');
                    eventHeaderDiv.className = 'event-item-header';

                    const eventName = document.createElement('h4');
                    eventName.className = 'kulturno-leto-event-name';
                    eventName.textContent = event.eventName || event.title;
                    eventHeaderDiv.appendChild(eventName);

                    if (event.isoDate) {
                        const eventDate = document.createElement('p');
                        eventDate.className = 'kulturno-leto-event-date';
                        const friendlyDate = new Date(event.isoDate + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                        eventDate.textContent = `${friendlyDate}`;
                        if (event.startTime) {
                            eventDate.textContent += `, ${event.startTime}`;
                        }
                        eventHeaderDiv.appendChild(eventDate);
                    }
                    
                    eventWrapperDiv.appendChild(eventHeaderDiv);

                    if (event.description) {
                        const eventDesc = document.createElement('p');
                        eventDesc.className = 'kulturno-leto-event-description';
                        eventDesc.textContent = event.description;
                        eventWrapperDiv.appendChild(eventDesc);
                    }

                    if (event.category) {
                        const eventCategory = document.createElement('p');
                        eventCategory.className = 'kulturno-leto-event-category';
                        eventCategory.innerHTML = `Category: <span style="font-weight: 500;">${event.category}</span>`;
                        eventWrapperDiv.appendChild(eventCategory);
                    }

                    if (event.locationIframe) {
                        const mapButton = document.createElement('button');
                        mapButton.className = 'btn-view-map';
                        mapButton.style.marginTop = '0.5rem';

                        const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        svgIcon.setAttribute('viewBox', '0 0 24 24');
                        svgIcon.setAttribute('fill', 'currentColor');
                        svgIcon.setAttribute('width', '1em');
                        svgIcon.setAttribute('height', '1em');
                        svgIcon.innerHTML = `<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"></path>`;
                        mapButton.appendChild(svgIcon);

                        const buttonText = document.createElement('span');
                        buttonText.textContent = 'View Map';
                        mapButton.appendChild(buttonText);

                        mapButton.addEventListener('click', () => {
                            // Using the new simple map modal
                            openSimpleMapModal(event.locationIframe);
                        });
                        eventWrapperDiv.appendChild(mapButton);
                    }
                    
                    eventsListDiv.appendChild(eventWrapperDiv);
                });
            } else {
                eventsListDiv.innerHTML = `<p style="text-align:center; color: var(--muted-foreground); padding: 1.5rem 0;">No scheduled events for Културолошко лето at this time.</p>`;
            }
        } else {
            eventsListDiv.innerHTML = `<p style="text-align:center; color: var(--muted-foreground); padding: 1.5rem 0;">Could not load event schedule.</p>`;
        }
        
        if (navbarElement) {
            const klLink = navbarElement.querySelector('a[data-id="kulturno-leto"]');
            setActiveNavLink(klLink);
        }
        document.title = "OhridLife - Културолошко лето";
        window.history.pushState({}, '', '#kulturno-leto');
    }

    function renderOhridskoLetoText(language) {
        const texts = ohridskoLetoTexts[language];
        if (!ohridskoLetoContentContainer || !texts) {
            console.error("Ohridsko Leto: Content container or texts not found for language:", language);
            if(ohridskoLetoContentContainer) ohridskoLetoContentContainer.innerHTML = "<p>Content is not available for this language.</p>";
            return;
        }

        const contentWrapper = ohridskoLetoContentContainer.querySelector('.ohridsko-leto-content-wrapper');
        if (contentWrapper) {
            contentWrapper.innerHTML = `
                <h2 class="page-title">${texts.title}</h2>
                <div class="page-content">${texts.content}</div>
            `;
        }

        const langButtons = ohridskoLetoContentContainer.querySelectorAll('.language-buttons-ohridsko-leto .lang-button');
        langButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === language);
        });

        localStorage.setItem('selectedLanguageOhridskoLeto', language);
    }

    function showOhridskoLetoContent() {
        if (!ohridskoLetoContentContainer) {
            console.error("Ohridsko Leto content container not found.");
            return;
        }

        console.log("[Nav] Showing Ohridsko Leto");

        // Hide other main content sections
        if (mainPageContent) mainPageContent.classList.add('hidden');
        if (learnOhridContentContainer) learnOhridContentContainer.classList.add('hidden');
        if (kulturnoLetoContentContainer) kulturnoLetoContentContainer.classList.add('hidden');
        if (ohridWineFestContentContainer) ohridWineFestContentContainer.classList.add('hidden');
        if (dayPlannerSection) dayPlannerSection.classList.add('hidden');

        ohridskoLetoContentContainer.classList.remove('hidden');
        if (learnOhridContentContainer) learnOhridContentContainer.style.backgroundColor = '';

        if (!ohridskoLetoContentContainer.querySelector('.ohridsko-leto-content-wrapper')) {
            ohridskoLetoContentContainer.innerHTML = `
                <div class="container">
                    <div class="language-buttons-ohridsko-leto">
                        <button class="lang-button" data-lang="mk">Македонски</button>
                        <button class="lang-button" data-lang="en">English</button>
                    </div>
                    <div class="ohridsko-leto-content-wrapper">
                        <!-- Content will be injected by renderOhridskoLetoText -->
                    </div>
                </div>
            `;
            ohridskoLetoContentContainer.querySelectorAll('.language-buttons-ohridsko-leto .lang-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    renderOhridskoLetoText(e.target.dataset.lang);
                });
            });
        }
        
        const lastSelectedLang = localStorage.getItem('selectedLanguageOhridskoLeto') || 'mk';
        renderOhridskoLetoText(lastSelectedLang);

        if (navbarElement) {
            const olLink = navbarElement.querySelector('a[data-id="ohridsko-leto"]');
            setActiveNavLink(olLink);
        }
        document.title = "OhridLife - Охридско Лето";
        window.history.pushState({}, '', '#ohridsko-leto');
    }

    function showOhridWineFestContent() {
        if (!ohridWineFestContentContainer) {
            console.error("Ohrid Wine Fest content container not found.");
            return;
        }
        console.log("[Nav] Attempting to show Ohrid Wine Fest");

        // Hide other primary content sections
        if (mainPageContent) mainPageContent.classList.add('hidden');
        if (learnOhridContentContainer) learnOhridContentContainer.classList.add('hidden');
        if (kulturnoLetoContentContainer) kulturnoLetoContentContainer.classList.add('hidden');
        if (ohridskoLetoContentContainer) ohridskoLetoContentContainer.classList.add('hidden');
        if (dayPlannerSection) dayPlannerSection.classList.add('hidden');

        ohridWineFestContentContainer.classList.remove('hidden');

        // --- Start constructing content ---
        ohridWineFestContentContainer.innerHTML = `
            <div class="container">
                <h2 style="text-align: center; color: var(--primary); margin-bottom: 1.5rem; font-size: 2.25rem; font-weight: 700;">Ohrid Wine Fest</h2>
                <p style="text-align: center; color: var(--foreground); margin-bottom: 2.5rem; font-size: 1.1rem; line-height: 1.7; max-width: 800px; margin-left: auto; margin-right: auto;">
                    Get ready for the Ohrid Wine Fest, the first and only wine festival in Ohrid! Now in its fourth year, this traditional event takes place on the promenade by Hotel Palace. Enjoy an excellent music program alongside the largest selection of local and international wines and regional delicacies. Join us as the Ohrid Wine Fest kicks off the summer season in the beautiful Pearl of Macedonia!
                </p>
                <div id="ohrid-wine-fest-events-list" class="kulturno-leto-events-list-container" style="margin-top: 1.5rem;"></div>
            </div>
        `;

        const eventsListDiv = ohridWineFestContentContainer.querySelector('#ohrid-wine-fest-events-list');
        if (!eventsListDiv) {
            console.error("Ohrid Wine Fest: events list container not found.");
            return;
        }

        // Event listing logic - will require a new property in events.json, e.g., isOhridWineFestEvent
        if (eventsListData && eventsListData.length > 0) {
            const wineFestEvents = eventsListData.filter(event => event.isOhridWineFestEvent === true);
            if (wineFestEvents.length > 0) {
                wineFestEvents.forEach(event => {
                    // This uses the same styling as Kulturno Leto events for consistency
                    const eventWrapperDiv = document.createElement('div');
                    eventWrapperDiv.className = 'kulturno-leto-event-item';
                    // Populate with event details... (similar to showKulturnoLetoContent)
                    eventWrapperDiv.innerHTML = `
                        <div class="event-item-header">
                            <h4 class="kulturno-leto-event-name">${event.eventName || event.title}</h4>
                            <p class="kulturno-leto-event-date">${new Date(event.isoDate + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}${event.startTime ? `, ${event.startTime}` : ''}</p>
                        </div>
                        <p class="kulturno-leto-event-description">${event.description || ''}</p>
                    `;
                    eventsListDiv.appendChild(eventWrapperDiv);
                });
            } else {
                eventsListDiv.innerHTML = `<p style="text-align:center; color: var(--muted-foreground); padding: 1.5rem 0;">No scheduled events for Ohrid Wine Fest at this time.</p>`;
            }
        } else {
            eventsListDiv.innerHTML = `<p style="text-align:center; color: var(--muted-foreground); padding: 1.5rem 0;">Could not load event schedule.</p>`;
        }
        
        setActiveNavLink(null); // No nav link corresponds to this dynamic page
        document.title = "OhridLife - Ohrid Wine Fest";
        window.history.pushState({}, '', '#ohrid-wine-fest');
    }

    if (clearPlanBtn) {
        const updateClearButtonText = () => {
            const selectedDate = planDateInput.value;
            if (selectedDate && clearButtonDateText) {
                const friendlyDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
                clearButtonDateText.textContent = friendlyDate;
            }
        };

        planDateInput.addEventListener('change', updateClearButtonText);

        clearPlanBtn.addEventListener('click', () => {
            const selectedDate = planDateInput.value;
            if (selectedDate && confirm(`Are you sure you want to clear the entire plan for ${clearButtonDateText.textContent}? This cannot be undone.`)) {
                currentPlan = currentPlan.filter(item => item.date !== selectedDate);
                savePlanToLocalStorage();
                renderCurrentPlanDisplay(); 
            }
        });

        // Initial text update
        updateClearButtonText();
    }
    
    // --- Helper function to get today's date in YYYY-MM-DD format ---
    function getTodayDateString() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }


    // This function seems to be duplicated. I'll keep one definition.
    /*
    function setActiveNavLink(activeElement) {
        const navLinks = navbarElement.querySelectorAll('.nav-links a');
        navLinks.forEach(link => link.classList.remove('active'));
        if (activeElement) {
            activeElement.classList.add('active');
        }
    }
    */
    
    function createSimpleMapModalDOM() {
        if (document.getElementById('simple-map-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'simple-map-modal';
        modal.className = 'simple-map-modal-overlay hidden';

        const content = document.createElement('div');
        content.className = 'simple-map-modal-content';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'simple-map-close-button';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-label', 'Close map');

        const mapContainer = document.createElement('div');
        mapContainer.id = 'simple-map-modal-map-container';
        mapContainer.style.width = '100%';
        mapContainer.style.height = '70vh'; 

        content.appendChild(closeBtn);
        content.appendChild(mapContainer);
        modal.appendChild(content);
        document.body.appendChild(modal);

        // Assign to global vars
        simpleMapModal = modal;
        simpleMapModalContent = mapContainer;
        simpleMapModalCloseButton = closeBtn;

        // Add event listeners
        simpleMapModalCloseButton.addEventListener('click', closeSimpleMapModal);
        simpleMapModal.addEventListener('click', (e) => {
            if (e.target === simpleMapModal) {
                closeSimpleMapModal();
            }
        });
    }

    function openSimpleMapModal(iframeString) {
        if (!simpleMapModal) {
            createSimpleMapModalDOM();
        }

        if (simpleMapModalContent) {
            simpleMapModalContent.innerHTML = iframeString;
        }
        
        if (simpleMapModal) {
            simpleMapModal.classList.remove('hidden');
            simpleMapModal.classList.add('visible');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeSimpleMapModal() {
        if (simpleMapModal) {
            simpleMapModal.classList.remove('visible');
            setTimeout(() => {
                simpleMapModal.classList.add('hidden');
                if (simpleMapModalContent) {
                    simpleMapModalContent.innerHTML = ''; // Clear iframe to stop loading
                }
                document.body.style.overflow = '';
            }, 300); // Match CSS transition
        }
    }

    function renderPlannerEventList() {
        if (!plannerEventSearchResults) {
            console.log("Planner event search results container not found, skipping render.");
            return;
        }
        if (!eventsListData || eventsListData.length === 0) {
            plannerEventSearchResults.innerHTML = '<p>No events available to display.</p>';
            return;
        }

        const filterDate = planDateInput.value;

        if (!filterDate) {
            plannerEventSearchResults.innerHTML = '<p class="text-center text-muted-foreground p-4">Select a date to see available events.</p>';
            return;
        }

        const filteredEvents = eventsListData.filter(event => event.isoDate === filterDate);

        if (filteredEvents.length === 0) {
            const friendlyDate = new Date(filterDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
            plannerEventSearchResults.innerHTML = `<p class="text-center text-muted-foreground p-4">No events found for ${friendlyDate}.</p>`;
            return;
        }

        plannerEventSearchResults.innerHTML = ''; // Clear previous results
        const ul = document.createElement('ul');
        ul.className = 'planner-events-ul'; // Use a different class if needed

        filteredEvents.forEach(event => {
            const li = document.createElement('li');
            li.className = 'event-list-item'; // Can reuse this class

            const eventInfo = document.createElement('div');
            eventInfo.className = 'event-info';
            
            const eventName = document.createElement('h4');
            eventName.className = 'event-name';
            eventName.textContent = event.eventName || event.title;

            const eventTimeDay = document.createElement('p');
            eventTimeDay.className = 'event-time-day';
            const friendlyDate = new Date(event.isoDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            eventTimeDay.textContent = `${friendlyDate}${event.startTime ? ` at ${event.startTime}` : ''}`;
            
            eventInfo.appendChild(eventName);
            eventInfo.appendChild(eventTimeDay);
            
            li.appendChild(eventInfo);

            const addButton = document.createElement('button');
            addButton.className = 'btn add-to-plan-btn';
            addButton.textContent = 'Add to Plan';

            // Check if this event is already in the plan for its date
            const isAlreadyInPlan = currentPlan.some(planItem => planItem.eventId === event.id && planItem.date === event.isoDate);
            if (isAlreadyInPlan) {
                addButton.textContent = 'Added';
                addButton.disabled = true;
            }

            addButton.addEventListener('click', () => {
                const selectedPlanDate = planDateInput.value;
                if (!selectedPlanDate) {
                    alert("Please select a date for your plan first (top of the form).");
                    planDateInput.focus();
                    return;
                }
                
                const planItem = {
                    id: Date.now(),
                    eventId: event.id, // Store original event ID
                    date: selectedPlanDate, // Add to the currently selected plan date
                    name: event.eventName || event.title,
                    time: event.startTime || 'All day',
                    details: `Event: ${event.eventName}`,
                    timeOfDay: 'SpecialEvent' // Assign a specific type
                };
                
                addItemToPlan(planItem);
                displayPlanForDate(selectedPlanDate); // Refresh plan display for that date
                
                // Disable button after adding
                addButton.textContent = 'Added';
                addButton.disabled = true;
            });

            li.appendChild(addButton);
            ul.appendChild(li);
        });

        plannerEventSearchResults.appendChild(ul);
    }

    // --- Initial Data Load ---
    fetchAllData();
});
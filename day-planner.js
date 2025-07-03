import Sortable from 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/modular/sortable.esm.js';

document.addEventListener('DOMContentLoaded', () => {
    let venuesData = [];
    let eventsData = [];
    let plannerData = JSON.parse(localStorage.getItem('ohridHubPlanner')) || {};
    let currentlySelectedDate = new Date().toISOString().split('T')[0];
    let venueRatings = {};
    let flatpickrInstance = null;

    // DOM Elements
    const calendarContainer = document.getElementById('planner-calendar-container');
    const timeOfDaySelect = document.getElementById('day-planner-time-of-day');
    const activityTypeSelect = document.getElementById('day-planner-activity-type');
    const venueSelectGroup = document.getElementById('day-planner-venue-group');
    const venueSelect = document.getElementById('day-planner-venue-select');
    const timeSelect = document.getElementById('day-planner-time');
    const notesInput = document.getElementById('day-planner-notes');
    const form = document.getElementById('day-planner-form');
    const planDisplay = document.getElementById('currentPlanDisplay');
    const currentlyViewingDateEl = document.getElementById('currently-viewing-date');
    const clearPlanBtn = document.getElementById('clear-plan-btn');
    const clearButtonDateText = document.getElementById('clear-button-date-text');
    const dailyEventsSuggestionContainer = document.getElementById('daily-events-suggestion-container');
    const dailyEventsSuggestionList = document.getElementById('daily-events-suggestion-list');
    const sharePlanBtn = document.getElementById('share-plan-btn');

    // AI Planner DOM Elements
    const showAiPlannerBtn = document.getElementById('show-ai-planner-btn');
    const aiPlannerModal = document.getElementById('ai-planner-modal');
    const aiModalCloseBtn = document.getElementById('ai-modal-close-btn');
    const aiInterestChoices = document.getElementById('ai-interest-choices');
    const aiCompanyChoices = document.getElementById('ai-company-choices');
    const aiTimeChoices = document.getElementById('ai-time-choices');
    const generatePlanBtn = document.getElementById('generate-plan-btn');
    const aiPlanSuggestions = document.getElementById('ai-plan-suggestions');
    const aiSuggestionsList = document.getElementById('ai-suggestions-list');
    const startOverBtn = document.getElementById('start-over-ai-plan-btn');
    
    const aiPlannerConfig = {
        interests: {
            'Adventure': { icon: '🏞️', tags: ['adventure', 'sports'] },
            'Foodie': { icon: '🍔', tags: ['foodie', 'restaurant', 'fast-food'] },
            'Nightlife': { icon: '🌙', tags: ['nightlife', 'club', 'pub'] },
            'Relax': { icon: '🏖️', tags: ['relax', 'beach', 'coffee', 'scenic'] },
            'Culture': { icon: '🏛️', tags: ['culture', 'historic', 'museum'] },
            'Shopping': { icon: '🛍️', tags: ['shopping', 'market'] }
        },
        company: {
            'Solo Trip': { icon: '👤', tags: ['solo', 'adventure', 'cafe'] },
            'Couple': { icon: '❤️', tags: ['romantic', 'scenic'] },
            'Family Fun': { icon: '👨‍👩‍👧‍👦', tags: ['family-friendly', 'park'] },
            'Friends': { icon: '🎉', tags: ['friends', 'pub', 'club', 'party'] }
        },
        times: ['Full Day', 'Morning', 'Afternoon', 'Evening']
    };

    const activityToVenueTypeMap = {
        'Breakfast': ['restaurant'],
        'Lunch': ['restaurant'],
        'Dinner': ['restaurant'],
        'Coffee': ['coffee', 'cafe'],
        'Beach': ['beach'],
        'Club': ['club'],
        'Pub': ['pub'],
        'Shopping': ['market', 'souvenir', 'boutique'],
        'Activity': ['kayaking', 'sup', 'diving', 'cruises', 'hiking', 'atv', 'sports', 'camping']
    };

    // --- DATA FETCHING ---
    async function fetchEvents() {
        try {
            const response = await fetch('/api/events');
            eventsData = await response.json();
        } catch (error) {
            console.error('Failed to fetch events:', error);
        }
    }

    async function fetchVenues() {
        try {
            const response = await fetch('/api/venues');
            const rawVenues = await response.json();
            
            // Use the shared normalization function
            venuesData = rawVenues.map(normalizeVenueDataItem);
        } catch (error) {
            console.error('Failed to fetch venues:', error);
        }
    }

    // --- INITIALIZATION ---
    async function initializePlanner() {
        await Promise.all([fetchVenues(), fetchEvents()]);
        
        // Load ratings from localStorage
        venueRatings = JSON.parse(localStorage.getItem('ohridHubVenueRatings')) || {};

        // Check for a shared plan in the URL first
        if (!loadPlanFromURL()) {
            // If no shared plan, load from localStorage
            plannerData = JSON.parse(localStorage.getItem('ohridHubPlanner')) || {};
        }

        initializeCalendar();
        setupEventListeners();
        populateActivityTypes();
        renderPlanForDate(currentlySelectedDate);
        initializeAiPlanner();
        initializeSortable();
        dailyEventsSuggestionList.addEventListener('click', handleQuickAdd);
        sharePlanBtn.addEventListener('click', handleSharePlan);
    }

    function initializeCalendar() {
        const eventDates = new Set(eventsData.map(e => e.isoDate));

        flatpickrInstance = flatpickr(calendarContainer, {
            inline: true,
            utc: true,
            dateFormat: "Y-m-d",
            defaultDate: "today",
            onChange: (selectedDates, dateStr) => {
                currentlySelectedDate = dateStr;
                renderPlanForDate(dateStr);
                renderEventSuggestionsForDate(dateStr);
            },
            onReady: (selectedDates, dateStr, instance) => {
                // Also render suggestions for the initial date
                renderEventSuggestionsForDate(instance.now.toISOString().split('T')[0]);
            },
            onDayCreate: (dObj, dStr, fp, dayElem) => {
                const year = dayElem.dateObj.getFullYear();
                const month = String(dayElem.dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dayElem.dateObj.getDate()).padStart(2, '0');
                const date = `${year}-${month}-${day}`;
                
                if (eventDates.has(date)) {
                    dayElem.classList.add('has-events');
                    dayElem.setAttribute('aria-label', dayElem.getAttribute('aria-label') + ' (has events)');
                }
                if (plannerData[date] && plannerData[date].length > 0) {
                    dayElem.classList.add('has-plan');
                }
            }
        });
    }

    function setupEventListeners() {
        timeOfDaySelect?.addEventListener('change', populateActivityTypes);
        activityTypeSelect?.addEventListener('change', handleActivityChange);
        form?.addEventListener('submit', handleFormSubmit);
        clearPlanBtn?.addEventListener('click', handleClearPlan);
        planDisplay?.addEventListener('click', handlePlanItemDelete);
        dailyEventsSuggestionList?.addEventListener('click', handleQuickAdd);
    }

    function initializeSortable() {
        const planDisplayEl = document.getElementById('currentPlanDisplay');
        if (!planDisplayEl) return;

        new Sortable(planDisplayEl, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: (evt) => {
                const { oldIndex, newIndex } = evt;
                
                if (oldIndex === newIndex) return;

                // Reorder the data array
                const planForDate = plannerData[currentlySelectedDate];
                if (planForDate) {
                    const [movedItem] = planForDate.splice(oldIndex, 1);
                    planForDate.splice(newIndex, 0, movedItem);
                    savePlannerData();
                }
            },
        });
    }

    // --- POPULATION FUNCTIONS ---
    const dayActivities = ['Breakfast', 'Lunch', 'Dinner', 'Coffee', 'Beach', 'Activity', 'Shopping', 'Custom'];
    const nightActivities = ['Dinner', 'Club', 'Pub', 'Event', 'Custom'];

    function updateAndPopulateTimeSelect() {
        const timeOfDay = timeOfDaySelect.value;
        let timeOptionsHtml = `<option value="Any time">Any time</option>`;
    
        if (timeOfDay === 'Daytime') {
            // Generate times from 07:00 to 18:00
            const dayTimes = [];
            for (let h = 7; h <= 18; h++) {
                dayTimes.push(`${String(h).padStart(2, '0')}:00`);
                if (h < 18) { // Do not add 18:30
                    dayTimes.push(`${String(h).padStart(2, '0')}:30`);
                }
            }
            timeOptionsHtml += dayTimes.map(t => `<option value="${t}">${t}</option>`).join('');
    
        } else if (timeOfDay === 'Nighttime') {
            // Generate times from 19:00 to 01:00 the next day
            const nightTimes = [];
            for (let h = 19; h <= 23; h++) {
                nightTimes.push(`${String(h).padStart(2, '0')}:00`);
                nightTimes.push(`${String(h).padStart(2, '0')}:30`);
            }
            nightTimes.push('00:00');
            nightTimes.push('00:30');
            nightTimes.push('01:00');
            timeOptionsHtml += nightTimes.map(t => `<option value="${t}">${t}</option>`).join('');
        } else {
            // Default to all times if nothing is selected
            const allTimes = [];
            for (let h = 0; h < 24; h++) {
                allTimes.push(`${String(h).padStart(2, '0')}:00`);
                allTimes.push(`${String(h).padStart(2, '0')}:30`);
            }
            timeOptionsHtml += allTimes.map(t => `<option value="${t}">${t}</option>`).join('');
        }
    
        timeSelect.innerHTML = timeOptionsHtml;
    }

    function populateActivityTypes() {
        const timeOfDay = timeOfDaySelect.value;
        const activities = timeOfDay === 'Daytime' ? dayActivities : nightActivities;
        activityTypeSelect.innerHTML = `<option value="" disabled selected>Select activity...</option>` +
            activities.map(act => `<option value="${act}">${act}</option>`).join('');
        
        updateAndPopulateTimeSelect();
        handleActivityChange();
    }

    function populateVenueSelect(activityType) {
        let filteredVenues = venuesData;
        const venueTypesToMatch = activityToVenueTypeMap[activityType];

        if (venueTypesToMatch && venueTypesToMatch.length > 0) {
            filteredVenues = venuesData.filter(venue => {
                // Ensure we are accessing the 'en' property which holds the type string or array
                if (!venue.type || !venue.type.en) return false;
                
                const venueTypeList = Array.isArray(venue.type.en) ? venue.type.en : [venue.type.en];
                
                return venueTypeList.some(t => {
                    // Ensure t is a string before calling toLowerCase
                    return typeof t === 'string' && venueTypesToMatch.includes(t.toLowerCase());
                });
            });
        }

        if (filteredVenues.length > 0) {
            venueSelect.innerHTML = `<option value="" disabled selected>Select a venue...</option>` +
                filteredVenues
                    .sort((a, b) => (a.name?.en || '').localeCompare(b.name?.en || ''))
                    .map(v => `<option value="${v.id}">${v.name.en}</option>`)
                    .join('');
        } else {
            venueSelect.innerHTML = `<option value="" disabled selected>No venues for this activity</option>`;
        }
    }

    // --- EVENT HANDLERS ---
    function handleActivityChange() {
        const activity = activityTypeSelect.value;
        const venueActivities = ['Breakfast', 'Lunch', 'Dinner', 'Coffee', 'Club', 'Pub', 'Beach', 'Shopping', 'Activity'];
        const shouldShowVenues = venueActivities.includes(activity);
        
        venueSelectGroup.style.display = shouldShowVenues ? 'block' : 'none';

        if(shouldShowVenues) {
            populateVenueSelect(activity);
        }
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const newPlanItem = {
            id: Date.now(),
            timeOfDay: timeOfDaySelect.value,
            activityType: activityTypeSelect.value,
            venueId: venueSelectGroup.style.display === 'none' || !venueSelect.value ? null : parseInt(venueSelect.value),
            time: timeSelect.value,
            notes: notesInput.value.trim()
        };

        if (!plannerData[currentlySelectedDate]) {
            plannerData[currentlySelectedDate] = [];
        }
        
        // Don't sort here anymore, just add to the end. Sorting is now manual.
        plannerData[currentlySelectedDate].push(newPlanItem);

        savePlannerData();
        renderPlanForDate(currentlySelectedDate);
        form.reset();
        populateActivityTypes();
    }

    function handleClearPlan() {
        if (plannerData[currentlySelectedDate]) {
            delete plannerData[currentlySelectedDate];
            savePlannerData();
            renderPlanForDate(currentlySelectedDate);
        }
    }

    function handlePlanItemDelete(e) {
        if (e.target.classList.contains('delete-plan-item-btn')) {
            const itemId = parseInt(e.target.dataset.id);
            const itemElement = e.target.closest('.plan-item');
            const itemIndex = Array.from(planDisplay.children).indexOf(itemElement);

            if (itemIndex > -1) {
                plannerData[currentlySelectedDate].splice(itemIndex, 1);
                if (plannerData[currentlySelectedDate].length === 0) {
                    delete plannerData[currentlySelectedDate];
                }
                savePlannerData();
                renderPlanForDate(currentlySelectedDate);
            }
        }
    }

    function handleQuickAdd(e) {
        if (e.target.classList.contains('quick-add-btn')) {
            const eventId = e.target.dataset.eventId;
            const event = eventsData.find(ev => ev.id == eventId);
            if (!event) return;

            // Pre-fill the form
            timeOfDaySelect.value = event.startTime.startsWith('2') || event.startTime.startsWith('00') || event.startTime.startsWith('01') ? 'Nighttime' : 'Daytime';
            populateActivityTypes(); // update activities based on time of day
            
            activityTypeSelect.value = 'Event';
            handleActivityChange();
            
            // Set time - find closest match in dropdown
            const eventTime = event.startTime.substring(0, 5); // HH:MM
            let bestMatch = 'Any time';
            let found = false;
            for (let option of timeSelect.options) {
                if(option.value === eventTime) {
                    bestMatch = eventTime;
                    found = true;
                    break;
                }
            }
            timeSelect.value = bestMatch;

            notesInput.value = event.eventName;

            // Scroll to the form and maybe highlight it
            const formContainer = document.querySelector('.day-planner-form-container');
            formContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            formContainer.style.transition = 'all 0.3s ease-in-out';
            formContainer.style.boxShadow = '0 0 20px var(--primary)';
            setTimeout(() => {
                formContainer.style.boxShadow = '';
            }, 1500);
        }
    }

    // --- RENDER & DATA-SAVING ---
    function renderEventSuggestionsForDate(dateStr) {
        const eventsToday = eventsData.filter(event => event.isoDate === dateStr);

        if (eventsToday.length > 0) {
            dailyEventsSuggestionContainer.classList.remove('hidden');
            dailyEventsSuggestionList.innerHTML = eventsToday.map(event => `
                <div class="suggested-event-card">
                    <div class="suggested-event-info">
                        <div class="suggested-event-title">${event.eventName}</div>
                        <div class="suggested-event-meta">${event.startTime} at ${event.venue || 'TBA'}</div>
                    </div>
                    <button class="btn btn-secondary quick-add-btn" data-event-id="${event.id}">Quick Add</button>
                </div>
            `).join('');
        } else {
            dailyEventsSuggestionContainer.classList.add('hidden');
            dailyEventsSuggestionList.innerHTML = '';
        }
    }

    function renderPlanForDate(dateStr) {
        const date = new Date(dateStr + 'T12:00:00'); // Use noon to avoid timezone issues
        const dateDisplay = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        currentlyViewingDateEl.textContent = dateDisplay;
        
        const items = plannerData[dateStr];

        if (items && items.length > 0) {
            planDisplay.innerHTML = items.map(item => {
                let title = `<strong>${item.activityType}</strong>`;
                if(item.venueId) {
                    const venue = venuesData.find(v => v.id === item.venueId);
                    if(venue) title += ` at ${venue.name.en}`;
                }
                return `
                    <div class="plan-item">
                        <div class="plan-item-time">${item.time}</div>
                        <div class="plan-item-details">
                            <div class="plan-item-title">${title}</div>
                            ${item.notes ? `<div class="plan-item-notes">${item.notes}</div>` : ''}
                        </div>
                        <button class="delete-plan-item-btn" data-id="${item.id}" aria-label="Delete item">&times;</button>
                    </div>
                `;
            }).join('');
            clearPlanBtn.classList.remove('hidden');
            clearButtonDateText.textContent = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        } else {
            planDisplay.innerHTML = '<p class="empty-plan-message">Your plan for this day is empty. Add an item using the form!</p>';
            clearPlanBtn.classList.add('hidden');
        }
    }

    function savePlannerData() {
        try {
            localStorage.setItem('ohridHubPlanner', JSON.stringify(plannerData));
            console.log("Planner data saved for date:", new Date(currentlySelectedDate).toDateString());
            
            // After saving, re-render the calendar to show event dots
            if (flatpickrInstance) {
                flatpickrInstance.redraw();
            }
        } catch (error) {
            console.error('Failed to save planner data to localStorage:', error);
        }
    }

    // --- AI PLANNER ---

    function initializeAiPlanner() {
        showAiPlannerBtn.addEventListener('click', () => aiPlannerModal.classList.remove('hidden'));
        aiModalCloseBtn.addEventListener('click', () => aiPlannerModal.classList.add('hidden'));
        aiPlannerModal.addEventListener('click', (e) => {
            if (e.target === aiPlannerModal) aiPlannerModal.classList.add('hidden');
        });
        
        populateAiChoices();

        // --- New, More Robust Event Handling ---

        // Handle multi-select for Interests
        aiInterestChoices.addEventListener('click', (e) => {
            const button = e.target.closest('.ai-choice-btn');
            if (!button) return;

            const maxSelection = 3;
            const selectedButtons = aiInterestChoices.querySelectorAll('.active');

            if (button.classList.contains('active')) {
                button.classList.remove('active');
            } else if (selectedButtons.length < maxSelection) {
                button.classList.add('active');
            }
        });
        
        // Handle single-select for Company
        if(aiCompanyChoices) {
            aiCompanyChoices.addEventListener('click', (e) => {
                const button = e.target.closest('.ai-choice-btn');
                if (!button) return;
    
                const wasActive = button.classList.contains('active');
                aiCompanyChoices.querySelectorAll('.active').forEach(btn => btn.classList.remove('active'));
                if (!wasActive) {
                    button.classList.add('active');
                }
            });
        }

        // Handle single-select for Time
        aiTimeChoices.addEventListener('click', (e) => {
            const button = e.target.closest('.ai-choice-btn');
            if (!button || button.disabled) return;

            const wasActive = button.classList.contains('active');
            aiTimeChoices.querySelectorAll('.active').forEach(btn => btn.classList.remove('active'));
            if(!wasActive) {
                button.classList.add('active');
            }
        });
        
        generatePlanBtn.addEventListener('click', generateAndDisplayPlan);
        aiSuggestionsList.addEventListener('click', handleSuggestionClick);
        startOverBtn.addEventListener('click', handleStartOver);
    }

    function handleSuggestionClick(e) {
        const button = e.target.closest('.suggestion-card-add-btn');
        if (!button) return;
    
        const card = button.closest('.suggestion-card');
        if (!card) return;
    
        const venueId = parseInt(card.dataset.venueId);
        const activityType = card.dataset.activity;
        const notes = card.dataset.notes;
        const time = card.dataset.time;

        if (isNaN(venueId) || !activityType) return;
        
        let planForDate = plannerData[currentlySelectedDate] || [];
        const existingItemIndex = planForDate.findIndex(item => item.venueId === venueId);
    
        if (existingItemIndex > -1) {
            // --- ITEM EXISTS, REMOVE IT ---
            planForDate.splice(existingItemIndex, 1);
    
            // Update UI
            card.classList.remove('added');
            button.classList.remove('remove-btn');
            button.innerHTML = `
                <svg class="icon-plus" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span class="btn-text">Add</span>
            `;
    
        } else {
            // --- ITEM DOESN'T EXIST, ADD IT ---
            const newItem = {
                id: Date.now() + Math.random(),
                timeOfDay: time && (time.startsWith('2') || time.startsWith('0') || time.startsWith('1')) ? 'Nighttime' : 'Daytime',
                activityType: activityType === 'venue' ? 'Activity' : activityType.charAt(0).toUpperCase() + activityType.slice(1),
                venueId: venueId,
                time: time || 'Any time',
                notes: notes
            };
            planForDate.push(newItem);
            
            // Update UI
            card.classList.add('added');
            button.classList.add('remove-btn');
            button.innerHTML = `
                <svg class="icon-check" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span class="btn-text">Remove</span>
            `;
        }
        
        // --- COMMON LOGIC ---
        planForDate.sort((a, b) => {
            const timeA = a.time === 'Any time' ? '99:99' : a.time;
            const timeB = b.time === 'Any time' ? '99:99' : b.time;
            return timeA.localeCompare(timeB);
        });

        plannerData[currentlySelectedDate] = planForDate;
    
        savePlannerData();
        renderPlanForDate(currentlySelectedDate);
    }

    function populateAiChoices() {
        // Populate Interests
        aiInterestChoices.innerHTML = Object.keys(aiPlannerConfig.interests).map(key => {
            const interest = aiPlannerConfig.interests[key];
            return `
                <button class="ai-choice-btn" data-type="interest" data-value="${key}">
                    <span class="icon">${interest.icon}</span>
                    <span>${key}</span>
                </button>
            `;
        }).join('');

        // Populate Company
        if(aiCompanyChoices) {
            aiCompanyChoices.innerHTML = Object.keys(aiPlannerConfig.company).map(key => {
                const company = aiPlannerConfig.company[key];
                return `
                    <button class="ai-choice-btn" data-type="company" data-value="${key}">
                        <span class="icon">${company.icon}</span>
                        <span>${key}</span>
                    </button>
                `;
            }).join('');
        }

        // Populate Times
        aiTimeChoices.innerHTML = aiPlannerConfig.times.map(time => `
             <button class="ai-choice-btn" data-type="time" data-value="${time}">
                <span>${time}</span>
            </button>
        `).join('');
    }

    function generateAndDisplayPlan() {
        const selectedInterests = Array.from(aiInterestChoices.querySelectorAll('.active')).map(b => b.dataset.value);
        const selectedCompany = aiCompanyChoices?.querySelector('.active')?.dataset.value;
        const selectedTime = aiTimeChoices.querySelector('.active')?.dataset.value;

        if (selectedInterests.length === 0 || !selectedCompany || !selectedTime) {
            alert('Please make a selection for each category.');
            return;
        }

        const generatedPlan = generateItinerary(selectedInterests, selectedCompany, selectedTime, currentlySelectedDate);
        renderAiSuggestions(generatedPlan);

        document.getElementById('ai-planner-questions').classList.add('hidden');
        generatePlanBtn.classList.add('hidden');
        aiPlanSuggestions.classList.remove('hidden');
    }

    function generateItinerary(interests, company, timeOfDay, dateStr) {
        const selectedInterestTags = interests.flatMap(interest => aiPlannerConfig.interests[interest]?.tags || []);
        const selectedCompanyTags = aiPlannerConfig.company[company]?.tags || [];

        const adventureTypes = ['kayaking', 'sup', 'diving', 'cruises', 'hiking', 'atv', 'sports', 'camping'];

        let scoredVenues = venuesData.map(venue => {
            const venueTags = new Set(venue.tags || []);
            let score = 0;

            // Add a baseline score for matching an interest
            selectedInterestTags.forEach(tag => {
                if (venueTags.has(tag)) score += 1;
            });

            // Add a significant score boost for matching the company type
            selectedCompanyTags.forEach(tag => {
                if (venueTags.has(tag)) score += 3;
            });
            
            return { ...venue, score };

        }).filter(venue => venue.score > 0)
          .sort((a, b) => b.score - a.score);

        const suggestions = [];
        let usedVenueIds = new Set();

        const addActivity = (activityTypes, timeSlot) => {
            let potentialVenues;
            // Special handling for Adventure to ensure true adventure activities are prioritized
            if (interests.includes('Adventure') && activityTypes.some(t => adventureTypes.includes(t))) {
                potentialVenues = venuesData.filter(v => {
                    const venueTypeList = Array.isArray(v.type.en) ? v.type.en : [v.type.en || ''];
                    return !usedVenueIds.has(v.id) && venueTypeList.some(t => adventureTypes.includes(t));
                });
            } else {
                potentialVenues = scoredVenues.filter(v => {
                    if (usedVenueIds.has(v.id)) return false;
                    const venueTypeList = Array.isArray(v.type.en) ? v.type.en : [v.type.en || ''];
                    return venueTypeList.some(t => activityTypes.includes(t));
                });
            }

            if (potentialVenues.length > 0) {
                // --- Introduce randomness for variety ---
                const topCandidates = potentialVenues.slice(0, 5); // Take top 5
                const venue = topCandidates[Math.floor(Math.random() * topCandidates.length)]; // Pick one randomly

                usedVenueIds.add(venue.id);
                suggestions.push({
                    venueId: venue.id,
                    time: timeSlot,
                    text: venue.name.en,
                    type: 'venue'
                });
            } else if (activityTypes.includes('culture')) {
                suggestions.push({ time: timeSlot, text: `Explore Ohrid's Old Town`, type: 'custom' });
            }
        };
        
        // Generate a fuller itinerary based on time of day
        if (timeOfDay === 'Full Day') {
            addActivity(['breakfast', 'coffee'], '09:00');
            addActivity(['museum', 'historic', 'culture', ...adventureTypes], '11:00');
            addActivity(['lunch', 'restaurant'], '14:00');
            addActivity(['relax', 'beach', 'shopping'], '16:00');
            addActivity(['dinner', 'restaurant'], '20:00');
            addActivity(['nightlife', 'pub', 'club'], '22:00');
        } else if (timeOfDay === 'Morning') {
            addActivity(['breakfast', 'coffee'], '09:00');
            addActivity(['museum', 'historic', 'culture', ...adventureTypes], '11:00');
        } else if (timeOfDay === 'Afternoon') {
            addActivity(['lunch', 'restaurant'], '14:00');
            addActivity(['relax', 'beach', 'shopping'], '16:00');
        } else if (timeOfDay === 'Evening') {
            addActivity(['dinner', 'restaurant'], '20:00');
            addActivity(['nightlife', 'pub', 'club'], '22:00');
        }

        if (suggestions.length === 0) {
            suggestions.push({ text: "We couldn't create a plan for this combination. Please try different options!", type: 'custom' });
        }

        return suggestions;
    }

    function renderAiSuggestions(suggestions) {
        aiSuggestionsList.innerHTML = '';
        if (!suggestions || suggestions.length === 0) {
            aiSuggestionsList.innerHTML = `<p class="empty-plan-message">We couldn't find any suggestions for your choices. Please try a different combination.</p>`;
            return;
        }

        const planForDate = plannerData[currentlySelectedDate] || [];

        let listHtml = '';
        suggestions.forEach(item => {
            let icon = '✨'; // Default for custom
    
            if (item.type === 'venue' && item.venueId) {
                const venue = venuesData.find(v => v.id === item.venueId);
                if (venue) {
                    const venueIdentifier = venue.type?.en?.[0] || venue.tags?.[0] || '';
                    let foundInterest = Object.values(aiPlannerConfig.interests).find(i => i.tags.includes(venueIdentifier.toLowerCase()));
                    icon = foundInterest ? foundInterest.icon : '📍';
                }
            }

            const isAlreadyAdded = item.venueId ? planForDate.some(planItem => planItem.venueId === item.venueId) : false;
            
            const buttonContent = isAlreadyAdded
                ? `
                <svg class="icon-check" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span class="btn-text">Remove</span>
            `
                : `
                <svg class="icon-plus" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span class="btn-text">Add</span>
            `;
            
            listHtml += `
              <div class="suggestion-card ${isAlreadyAdded ? 'added' : ''}" 
                   data-venue-id="${item.venueId || ''}" 
                   data-activity="${item.type}"
                   data-notes="${item.text}"
                   data-time="${item.time || 'Any time'}">

                <div class="suggestion-card-content">
                    <div class="suggestion-card-icon">${icon}</div>
                    <div class="suggestion-card-info">
                        <h4 class="suggestion-card-title">${item.text}</h4>
                    </div>
                </div>

                <div class="suggestion-card-footer">
                    <div class="suggestion-card-time">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <span>${item.time || 'Suggested'}</span>
                    </div>
                    <button class="suggestion-card-add-btn ${isAlreadyAdded ? 'remove-btn' : ''}">
                        ${buttonContent}
                    </button>
                </div>
              </div>
            `;
        });
        
        aiSuggestionsList.innerHTML = listHtml;
    }

    function handleStartOver() {
        // Reset selections
        document.getElementById('ai-planner-questions').classList.remove('hidden');
        generatePlanBtn.classList.remove('hidden');
        aiPlanSuggestions.classList.add('hidden');
        aiSuggestionsList.innerHTML = '';
    
        // Clear previous selections
        const questionsContainer = document.getElementById('ai-planner-questions');
        if(questionsContainer) {
            questionsContainer.querySelectorAll('.active').forEach(btn => btn.classList.remove('active'));
        }
        aiTimeChoices.querySelectorAll('.ai-choice-btn').forEach(btn => {
            btn.disabled = false;
        });
    }

    function handleSharePlan() {
        const planToShare = {
            date: currentlySelectedDate,
            items: plannerData[currentlySelectedDate] || []
        };

        if (planToShare.items.length === 0) {
            alert("Your plan for this date is empty. Add some items to share.");
            return;
        }

        try {
            const jsonString = JSON.stringify(planToShare);
            const encodedData = btoa(jsonString); // Base64 encode
            const url = `${window.location.origin}${window.location.pathname}?plan=${encodedData}`;

            navigator.clipboard.writeText(url).then(() => {
                alert('A shareable link has been copied to your clipboard!');
            }, () => {
                alert('Could not copy the link. Please copy it manually:\n' + url);
            });
        } catch (error) {
            console.error('Failed to create shareable link:', error);
            alert('Could not create a shareable link. Please try again.');
        }
    }

    function loadPlanFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const planData = urlParams.get('plan');

        if (planData) {
            try {
                const decodedString = atob(planData); // Base64 decode
                const sharedPlan = JSON.parse(decodedString);
                
                if (sharedPlan.date && Array.isArray(sharedPlan.items)) {
                    currentlySelectedDate = sharedPlan.date;
                    plannerData = {
                        [sharedPlan.date]: sharedPlan.items
                    };
                    
                    // Clean the URL so a refresh doesn't keep loading the shared plan
                    const newUrl = `${window.location.origin}${window.location.pathname}`;
                    window.history.replaceState({}, document.title, newUrl);

                    return true; // Indicate that a shared plan was loaded
                }
            } catch (error) {
                console.error('Failed to parse shared plan data from URL:', error);
                alert('The shared plan link is invalid or corrupted.');
            }
        }
        return false; // No valid shared plan found
    }

    // --- START ---
    initializePlanner();
}); 
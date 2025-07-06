document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the day planner page
    if (!document.getElementById('planner-calendar-container')) {
        console.log('Not on day planner page, exiting...');
        return;
    }
    
    let venuesData = [];
    let eventsData = [];
    let plannerData = JSON.parse(localStorage.getItem('ohridHubPlanner')) || {};
    let currentlySelectedDate = new Date().toISOString().split('T')[0];
    let venueRatings = {};

    let currentWeatherData = null;
    let currentBudgetConfig = null;
    let currentSeason = null;

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
    const aiMoodChoices = document.getElementById('ai-mood-choices');
    const aiCompanyChoices = document.getElementById('ai-company-choices');
    const aiBudgetChoices = document.getElementById('ai-budget-choices');
    const aiTimeChoices = document.getElementById('ai-time-choices');
    const generatePlanBtn = document.getElementById('generate-plan-btn');
    const aiPlanSuggestions = document.getElementById('ai-plan-suggestions');
    const aiSuggestionsList = document.getElementById('ai-suggestions-list');
    const startOverBtn = document.getElementById('start-over-ai-plan-btn');
    
    const aiPlannerConfig = {
        moods: {
            'Active': { 
                icon: '⚡', 
                tags: ['adventure', 'sports', 'atv', 'diving', 'hiking', 'kayaking', 'extreme', 'thrill', 'challenge', 'outdoor'],
                personality: 'energetic',
                timePreference: 'morning',
                description: 'High energy activities and adventures'
            },
            'Relaxed': { 
                icon: '🌊', 
                tags: ['relax', 'beach', 'coffee', 'scenic', 'spa', 'quiet', 'peaceful', 'nature', 'reflection'],
                personality: 'calm',
                timePreference: 'afternoon',
                description: 'Calm, peaceful, and relaxing experiences'
            },
            'Social': { 
                icon: '🎉', 
                tags: ['friends', 'pub', 'club', 'party', 'social', 'celebration', 'music', 'dance', 'festival', 'lively'],
                personality: 'outgoing',
                timePreference: 'evening',
                description: 'Interactive, group-focused, and celebratory activities'
            },
            'Cultural': { 
                icon: '🔍', 
                tags: ['culture', 'historic', 'museum', 'learn', 'explore', 'traditional', 'educational'],
                personality: 'curious',
                timePreference: 'morning',
                description: 'Educational, cultural, and discovery-focused experiences'
            },
            'Romantic': { 
                icon: '❤️', 
                tags: ['romantic', 'scenic', 'intimate', 'sunset', 'dinner', 'cozy'],
                personality: 'intimate',
                timePreference: 'evening',
                description: 'Intimate, couple-focused romantic experiences'
            }
        },
        company: {
            'Solo Trip': { 
                icon: '👤', 
                tags: ['solo', 'adventure', 'cafe', 'self-discovery'],
                description: 'Perfect for personal exploration'
            },
            'Couple': { 
                icon: '❤️', 
                tags: ['romantic', 'scenic', 'intimate', 'cozy'],
                description: 'Romantic experiences for two'
            },
            'Family Fun': { 
                icon: '👨‍👩‍👧‍👦', 
                tags: ['family-friendly', 'park', 'safe', 'educational'],
                description: 'Family-appropriate activities'
            },
            'Friends': { 
                icon: '🎉', 
                tags: ['friends', 'pub', 'club', 'party', 'group'],
                description: 'Perfect for groups and socializing'
            }
        },
        budget: {
            'Budget-Friendly': { 
                icon: '💰', 
                maxDaily: 30,
                description: 'Under €30/day - Great value experiences',
                priceLevel: 1
            },
            'Moderate': { 
                icon: '💳', 
                maxDaily: 60,
                description: '€30-60/day - Balanced comfort and value',
                priceLevel: 2
            },
            'Luxury': { 
                icon: '💎', 
                maxDaily: 120,
                description: '€60-120/day - Premium experiences',
                priceLevel: 3
            },
            'No Limit': { 
                icon: '🌟', 
                maxDaily: 999,
                description: 'Best available options',
                priceLevel: 4
            }
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

    // Price estimation function
    function estimateVenuePrice(venue) {
        const venueTags = venue.tags || [];
        const venueType = Array.isArray(venue.type.en) ? venue.type.en[0] : venue.type.en;
        
        // High-end establishments (price level 3-4)
        if (venueTags.includes('luxury') || venueTags.includes('fine-dining') || venueTags.includes('upscale')) {
            return 4;
        }
        
        // Mid-range establishments (price level 2-3)
        if (venueType === 'restaurant' && !venueTags.includes('fast-food')) {
            return 2;
        }
        
        if (['club', 'pub'].includes(venueType)) {
            return 2;
        }
        
        // Budget-friendly (price level 1-2)
        if (venueTags.includes('budget') || venueTags.includes('fast-food') || venueType === 'coffee') {
            return 1;
        }
        
        // Activities can vary widely
        if (['kayaking', 'sup', 'diving', 'cruises', 'hiking', 'atv', 'sports'].includes(venueType)) {
            return venueTags.includes('premium') ? 3 : 2;
        }
        
        // Default to moderate pricing
        return 2;
    }

    // Determine if venue is primarily outdoor
    function isVenueOutdoor(venue) {
        const venueTags = venue.tags || [];
        const venueType = Array.isArray(venue.type.en) ? venue.type.en[0] : venue.type.en;
        
        // Definitely outdoor venues
        const outdoorTypes = ['beach', 'kayaking', 'sup', 'diving', 'cruises', 'hiking', 'atv', 'camping'];
        if (outdoorTypes.includes(venueType)) {
            return true;
        }
        
        // Check tags for outdoor indicators
        const outdoorTags = ['outdoor', 'beach', 'terrace', 'garden', 'patio', 'rooftop'];
        if (venueTags.some(tag => outdoorTags.includes(tag))) {
            return true;
        }
        
        // Indoor by default (restaurants, pubs, clubs, museums, etc.)
        return false;
    }

    // Get venue opening hours based on type
    function getVenueOpeningHours(venue) {
        const venueType = Array.isArray(venue.type.en) ? venue.type.en[0] : venue.type.en;
        const venueTags = venue.tags || [];
        
        // Default opening hours by venue type
        const defaultHours = {
            'restaurant': { open: '08:00', close: '23:00' },
            'coffee': { open: '07:00', close: '20:00' },
            'cafe': { open: '07:00', close: '20:00' },
            'pub': { open: '16:00', close: '02:00' },
            'club': { open: '21:00', close: '04:00' },
            'beach': { open: '06:00', close: '22:00' },
            'museum': { open: '09:00', close: '17:00' },
            'historic': { open: '08:00', close: '20:00' },
            'kayaking': { open: '08:00', close: '18:00' },
            'sup': { open: '08:00', close: '18:00' },
            'diving': { open: '08:00', close: '17:00' },
            'hiking': { open: '06:00', close: '19:00' },
            'atv': { open: '09:00', close: '17:00' },
            'shopping': { open: '09:00', close: '21:00' },
            'market': { open: '08:00', close: '20:00' }
        };
        
        return defaultHours[venueType] || { open: '09:00', close: '22:00' };
    }

    // Calculate travel time between venues (simplified zone-based system for Ohrid)
    function calculateTravelTime(venue1, venue2) {
        if (!venue1 || !venue2) return 15; // Default 15 minutes
        
        // Simplified zones for Ohrid
        const getVenueZone = (venue) => {
            const venueTags = venue.tags || [];
            const venueType = Array.isArray(venue.type.en) ? venue.type.en[0] : venue.type.en;
            
            // Old Town zone
            if (venueTags.includes('historic') || venueTags.includes('old-town')) {
                return 'old-town';
            }
            
            // Waterfront/Port zone
            if (venueTags.includes('waterfront') || venueTags.includes('port')) {
                return 'waterfront';
            }
            
            // Beach zone
            if (venueType === 'beach' || venueTags.includes('beach')) {
                return 'beach';
            }
            
            // Adventure/Nature zone (further out)
            if (['hiking', 'atv', 'camping'].includes(venueType)) {
                return 'nature';
            }
            
            // City center (default)
            return 'center';
        };
        
        const zone1 = getVenueZone(venue1);
        const zone2 = getVenueZone(venue2);
        
        // Travel time matrix (in minutes)
        const travelTimes = {
            'old-town': { 'old-town': 5, 'waterfront': 10, 'beach': 15, 'center': 8, 'nature': 25 },
            'waterfront': { 'old-town': 10, 'waterfront': 5, 'beach': 12, 'center': 7, 'nature': 30 },
            'beach': { 'old-town': 15, 'waterfront': 12, 'beach': 8, 'center': 12, 'nature': 20 },
            'center': { 'old-town': 8, 'waterfront': 7, 'beach': 12, 'center': 5, 'nature': 20 },
            'nature': { 'old-town': 25, 'waterfront': 30, 'beach': 20, 'center': 20, 'nature': 10 }
        };
        
        return travelTimes[zone1]?.[zone2] || 15;
    }

    // Optimize timing for itinerary flow
    function optimizeItineraryTiming(suggestions) {
        if (suggestions.length <= 1) return suggestions;
        
        const optimized = [...suggestions];
        
        // Use logical time slots instead of calculated times
        const logicalTimeSlots = {
            morning: ['09:00', '10:30', '12:00'],
            afternoon: ['14:00', '15:30', '17:00'],
            evening: ['19:00', '20:30', '22:00']
        };
        
        // Determine time period and assign logical slots
        let timeSlotIndex = 0;
        let currentPeriod = 'morning';
        
        optimized.forEach((suggestion, index) => {
            if (suggestion.venueId) {
                const venue = venuesData.find(v => v.id === suggestion.venueId);
                if (venue) {
                    const openingHours = getVenueOpeningHours(venue);
                    const venueType = Array.isArray(venue.type.en) ? venue.type.en[0] : venue.type.en;
                    
                    // Determine appropriate time period for venue type
                    if (['breakfast', 'coffee'].includes(venueType)) {
                        currentPeriod = 'morning';
                        timeSlotIndex = 0;
                    } else if (['lunch', 'restaurant'].includes(venueType) && currentPeriod === 'morning') {
                        currentPeriod = 'morning';
                        timeSlotIndex = 2; // 12:00 for lunch
                    } else if (['museum', 'historic', 'beach', 'adventure'].includes(venueType)) {
                        if (currentPeriod === 'morning' && timeSlotIndex < 2) {
                            timeSlotIndex = Math.min(timeSlotIndex + 1, 2);
                        } else if (currentPeriod === 'morning') {
                            currentPeriod = 'afternoon';
                            timeSlotIndex = 0;
                        }
                    } else if (['dinner'].includes(venueType) || parseTime(suggestion.time) >= 19*60) {
                        currentPeriod = 'evening';
                        timeSlotIndex = 0;
                    } else if (['pub', 'club'].includes(venueType)) {
                        currentPeriod = 'evening';
                        timeSlotIndex = Math.min(timeSlotIndex + 1, 2);
                    }
                    
                    // Assign time slot
                    const slots = logicalTimeSlots[currentPeriod];
                    if (slots && slots[timeSlotIndex]) {
                        const proposedTime = parseTime(slots[timeSlotIndex]);
                        const openTime = parseTime(openingHours.open);
                        
                        // Make sure venue is open
                        if (proposedTime >= openTime) {
                            suggestion.time = slots[timeSlotIndex];
                        } else {
                            // Use opening time rounded to next 30 minutes
                            const roundedOpenTime = Math.ceil(openTime / 30) * 30;
                            suggestion.time = formatTime(roundedOpenTime);
                        }
                        
                        suggestion.optimized = true;
                        suggestion.timingNote = `Optimized for ${currentPeriod} schedule`;
                    }
                }
            }
            
            // Move to next time slot for next venue
            if (timeSlotIndex < 2) {
                timeSlotIndex++;
            } else if (currentPeriod === 'morning') {
                currentPeriod = 'afternoon';
                timeSlotIndex = 0;
            } else if (currentPeriod === 'afternoon') {
                currentPeriod = 'evening';
                timeSlotIndex = 0;
            }
        });
        
        return optimized;
    }

    // Helper functions for time manipulation
    function parseTime(timeStr) {
        if (!timeStr || timeStr === 'Any time') return 540; // 9:00 AM default
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    function formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }

    // Simple duration calculation for venues
    function calculateSimpleDuration(venue, moods, company) {
        const venueType = Array.isArray(venue.type.en) ? venue.type.en[0] : venue.type.en;
        
        // Base durations in minutes
        const baseDurations = {
            'restaurant': 90,
            'coffee': 45,
            'cafe': 45,
            'pub': 120,
            'club': 180,
            'beach': 150,
            'museum': 90,
            'historic': 75,
            'kayaking': 120,
            'sup': 90,
            'diving': 180,
            'hiking': 300,
            'atv': 120,
            'sports': 90,
            'shopping': 90,
            'market': 60,
            'camping': 600  // 10 hours - full day activity
        };
        
        let duration = baseDurations[venueType] || 90;
        
        // Mood adjustments
        if (moods.includes('Relaxed')) {
            duration *= 1.3; // 30% longer for relaxed mood
        } else if (moods.includes('Active')) {
            duration *= 0.8; // 20% shorter for active mood
        }
        
        // Company adjustments
        if (company === 'Family Fun') {
            duration *= 1.2; // 20% longer for families
        } else if (company === 'Solo Trip') {
            duration *= 0.9; // 10% shorter for solo travelers
        }
        
        return Math.round(duration);
    }

    // Calculate estimated cost for a venue
    function calculateVenueCost(venue) {
        const priceLevel = estimateVenuePrice(venue);
        const venueType = Array.isArray(venue.type.en) ? venue.type.en[0] : venue.type.en;
        
        // Base costs by price level (in EUR)
        const baseCosts = {
            1: { meal: 8, drink: 3, activity: 15, default: 10 },
            2: { meal: 15, drink: 5, activity: 25, default: 20 },
            3: { meal: 25, drink: 8, activity: 40, default: 35 },
            4: { meal: 40, drink: 12, activity: 60, default: 50 }
        };
        
        const costs = baseCosts[priceLevel] || baseCosts[2];
        
        // Determine cost category
        if (['restaurant', 'cafe', 'coffee'].includes(venueType)) {
            return costs.meal;
        } else if (['pub', 'club'].includes(venueType)) {
            return costs.drink;
        } else if (['kayaking', 'sup', 'diving', 'atv', 'hiking'].includes(venueType)) {
            return costs.activity;
        } else {
            return costs.default;
        }
    }

    // Calculate total cost for an itinerary
    function calculateItineraryCost(planItems) {
        let totalCost = 0;
        planItems.forEach(item => {
            if (item.venueId) {
                const venue = venuesData.find(v => v.id === item.venueId);
                if (venue) {
                    totalCost += calculateVenueCost(venue);
                }
            }
        });
        return totalCost;
    }

    // Get price level display
    function getPriceLevelDisplay(priceLevel) {
        const displays = {
            1: { symbol: '€', label: 'Budget-friendly' },
            2: { symbol: '€€', label: 'Moderate' },
            3: { symbol: '€€€', label: 'Expensive' },
            4: { symbol: '€€€€', label: 'Luxury' }
        };
        return displays[priceLevel] || displays[2];
    }

    // Render budget tracker
    function renderBudgetTracker(selectedBudget, currentCost = 0) {
        const budgetDisplay = document.getElementById('budget-display');
        const budgetContainer = document.getElementById('budget-tracker-container');
        
        if (!budgetDisplay || !selectedBudget) {
            budgetContainer?.classList.add('hidden');
            return;
        }
        
        budgetContainer.classList.remove('hidden');
        const budgetConfig = aiPlannerConfig.budget[selectedBudget];
        const percentUsed = (currentCost / budgetConfig.maxDaily) * 100;
        const remaining = Math.max(0, budgetConfig.maxDaily - currentCost);
        
        let statusClass = 'good';
        let statusIcon = '✅';
        let statusText = 'Within budget';
        
        if (percentUsed > 100) {
            statusClass = 'over';
            statusIcon = '⚠️';
            statusText = 'Over budget';
        } else if (percentUsed > 80) {
            statusClass = 'warning';
            statusIcon = '⚡';
            statusText = 'Nearly at limit';
        }
        
        budgetDisplay.innerHTML = `
            <div class="budget-summary">
                <div class="budget-header">
                    <div class="budget-type">
                        <span class="budget-icon">${budgetConfig.icon}</span>
                        <span class="budget-name">${selectedBudget}</span>
                    </div>
                    <div class="budget-status ${statusClass}">
                        <span class="status-icon">${statusIcon}</span>
                        <span class="status-text">${statusText}</span>
                    </div>
                </div>
                
                <div class="budget-progress">
                    <div class="budget-bar">
                        <div class="budget-fill ${statusClass}" style="width: ${Math.min(100, percentUsed)}%"></div>
                    </div>
                    <div class="budget-labels">
                        <span class="spent">€${currentCost}</span>
                        <span class="total">€${budgetConfig.maxDaily}</span>
                    </div>
                </div>
                
                <div class="budget-details">
                    <div class="budget-remaining">
                        <span class="label">Remaining:</span>
                        <span class="amount">€${remaining}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Seasonal scoring and recommendations
    function getSeasonalScore(venue, season) {
        const venueType = Array.isArray(venue.type.en) ? venue.type.en[0] : venue.type.en;
        const venueTags = venue.tags || [];
        
        const seasonalBonus = {
            'spring': {
                'hiking': 1.5,
                'historic': 1.3,
                'cafe': 1.2,
                'garden': 1.4
            },
            'summer': {
                'beach': 2.0,
                'kayaking': 1.8,
                'sup': 1.8,
                'diving': 1.7,
                'cruises': 1.6,
                'outdoor': 1.4
            },
            'autumn': {
                'hiking': 1.6,
                'historic': 1.4,
                'museum': 1.3,
                'cafe': 1.3,
                'restaurant': 1.2
            },
            'winter': {
                'restaurant': 1.5,
                'cafe': 1.4,
                'museum': 1.6,
                'pub': 1.3,
                'club': 1.2,
                'historic': 1.1
            }
        };
        
        let bonus = 1.0;
        
        // Check venue type
        if (seasonalBonus[season] && seasonalBonus[season][venueType]) {
            bonus = Math.max(bonus, seasonalBonus[season][venueType]);
        }
        
        // Check tags
        venueTags.forEach(tag => {
            if (seasonalBonus[season] && seasonalBonus[season][tag]) {
                bonus = Math.max(bonus, seasonalBonus[season][tag]);
            }
        });
        
        return bonus;
    }

    function renderSeasonalWidget() {
        const seasonalDisplay = document.getElementById('seasonal-display');
        if (!seasonalDisplay) {
            console.log('Seasonal display element not found');
            return;
        }
        
        const now = new Date();
        const season = getSeason(now.getMonth() + 1);
        currentSeason = season;
        
        const seasonalInfo = {
            'spring': {
                icon: '🌸',
                title: 'Spring in Ohrid',
                description: 'Perfect time for hiking and exploring historic sites',
                highlights: ['Hiking trails bloom with wildflowers', 'Comfortable temperatures for walking tours', 'Great for outdoor cafes'],
                activities: ['hiking', 'historic', 'cafe']
            },
            'summer': {
                icon: '☀️',
                title: 'Summer in Ohrid',
                description: 'Beach season and water activities at their peak',
                highlights: ['Lake Ohrid at perfect swimming temperature', 'All water sports available', 'Beach clubs and outdoor dining'],
                activities: ['beach', 'kayaking', 'sup', 'diving']
            },
            'autumn': {
                icon: '🍂',
                title: 'Autumn in Ohrid',
                description: 'Golden season for culture and cozy venues',
                highlights: ['Stunning fall colors around the lake', 'Harvest season for local restaurants', 'Perfect weather for cultural sites'],
                activities: ['hiking', 'historic', 'restaurant', 'museum']
            },
            'winter': {
                icon: '❄️',
                title: 'Winter in Ohrid',
                description: 'Cozy indoor venues and authentic local experiences',
                highlights: ['Traditional winter atmosphere', 'Cozy restaurants and cafes', 'Indoor cultural experiences'],
                activities: ['restaurant', 'cafe', 'museum', 'pub']
            }
        };
        
        const info = seasonalInfo[season];
        
        seasonalDisplay.innerHTML = `
            <div class="seasonal-summary">
                <div class="seasonal-header">
                    <div class="seasonal-icon">${info.icon}</div>
                    <div class="seasonal-title-info">
                        <h4 class="seasonal-title">${info.title}</h4>
                        <p class="seasonal-description">${info.description}</p>
                    </div>
                </div>
                <div class="seasonal-highlights">
                    <h5>What's Great This Season:</h5>
                    <ul class="seasonal-list">
                        ${info.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

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

    async function fetchWeather() {
        console.log('Using seasonal weather fallback for Ohrid');
        // Use realistic seasonal weather data based on current date
        currentWeatherData = getSeasonalWeatherFallback();
    }

    function getSeasonalWeatherFallback() {
        const currentMonth = new Date().getMonth();
        const season = getSeason(currentMonth);
        
        const seasonalWeather = {
            spring: { temp: 18, desc: 'partly cloudy', icon: '02d', outdoor: true },
            summer: { temp: 28, desc: 'sunny', icon: '01d', outdoor: true },
            autumn: { temp: 16, desc: 'cloudy', icon: '03d', outdoor: true },
            winter: { temp: 5, desc: 'cold', icon: '04d', outdoor: false }
        };
        
        const weather = seasonalWeather[season];
        return {
            temperature: weather.temp,
            description: weather.desc,
            icon: weather.icon,
            humidity: 65,
            windSpeed: 2.5,
            isOutdoorFriendly: weather.outdoor
        };
    }

    function getSeason(month) {
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'autumn';
        return 'winter';
    }

    // --- INITIALIZATION ---
    async function initializePlanner() {
        await Promise.all([fetchVenues(), fetchEvents(), fetchWeather()]);
        
        // Load ratings from localStorage
        venueRatings = JSON.parse(localStorage.getItem('ohridHubVenueRatings')) || {};

        // Check for a shared plan in the URL first
        if (!loadPlanFromURL()) {
            // If no shared plan, load from localStorage
            plannerData = JSON.parse(localStorage.getItem('ohridHubPlanner')) || {};
        }

        initializeCalendar();
        setupEventListeners();
        // Only initialize day planner specific features if elements exist
        if (calendarContainer && planDisplay) {
            populateActivityTypes();
            renderPlanForDate(currentlySelectedDate);
        }
        
        // Always render widgets as they're available on any page
        renderWeatherWidget();
        renderSeasonalWidget();
        
        // Initialize AI planner (only on day planner page)
        initializeAiPlanner();
        initializeSortable();
        dailyEventsSuggestionList.addEventListener('click', handleQuickAdd);
        sharePlanBtn.addEventListener('click', handleSharePlan);
    }

    function initializeCalendar() {
        if (!calendarContainer) return;

        const eventDates = new Set(eventsData.map(e => e.isoDate));
        let currentDate = new Date();
        let selectedDate = new Date();
        currentlySelectedDate = new Date().toISOString().split('T')[0];

        // Initialize the calendar
        renderCalendar();
        
        // Set up event listeners
        document.getElementById('planner-prev-month').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
        
        document.getElementById('planner-next-month').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        function renderCalendar() {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            
            // Update month/year display
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            document.getElementById('planner-current-month-year').textContent = `${monthNames[month]} ${year}`;
            
            // Clear previous days
            const calendarDays = document.getElementById('planner-calendar-days');
            calendarDays.innerHTML = '';
            
            // Get first day of month and number of days
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const startDate = new Date(firstDay);
            startDate.setDate(startDate.getDate() - firstDay.getDay());
            
            // Generate 6 weeks of days
            for (let i = 0; i < 42; i++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);
                
                const dayElement = document.createElement('div');
                dayElement.classList.add('calendar-day');
                dayElement.textContent = date.getDate();
                
                const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                
                // Add classes based on date status
                if (date.getMonth() !== month) {
                    dayElement.classList.add('other-month');
                }
                
                if (isToday(date)) {
                    dayElement.classList.add('today');
                }
                
                if (isSameDate(date, selectedDate)) {
                    dayElement.classList.add('selected');
                }
                
                if (eventDates.has(dateStr)) {
                    dayElement.classList.add('has-events');
                }
                
                if (plannerData[dateStr] && plannerData[dateStr].length > 0) {
                    dayElement.classList.add('has-plan');
                }
                
                // Add click handler
                dayElement.addEventListener('click', () => {
                    // Remove previous selection
                    document.querySelectorAll('#planner-calendar-days .calendar-day.selected').forEach(el => {
                        el.classList.remove('selected');
                    });
                    
                    // Add selection to clicked day
                    dayElement.classList.add('selected');
                    selectedDate = new Date(date);
                    currentlySelectedDate = dateStr;
                    
                    // Update planner and events
                    renderPlanForDate(dateStr);
                    renderEventSuggestionsForDate(dateStr);
                });
                
                calendarDays.appendChild(dayElement);
            }
        }
        
        function isToday(date) {
            const today = new Date();
            return date.getDate() === today.getDate() &&
                   date.getMonth() === today.getMonth() &&
                   date.getFullYear() === today.getFullYear();
        }
        
        function isSameDate(date1, date2) {
            return date1.getDate() === date2.getDate() &&
                   date1.getMonth() === date2.getMonth() &&
                   date1.getFullYear() === date2.getFullYear();
        }
        
        // Listen for planner data updates to refresh calendar
        document.addEventListener('plannerDataUpdated', () => {
            renderCalendar();
        });
        
        // Initialize with today's events and plan
        const todayStr = new Date().toISOString().split('T')[0];
        renderEventSuggestionsForDate(todayStr);
        renderPlanForDate(todayStr);
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

        // Check if SortableJS is available
        if (typeof Sortable === 'undefined') {
            console.log('SortableJS not loaded, drag-and-drop functionality will be disabled');
            return;
        }

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
            
            // After saving, trigger a calendar re-render to show plan indicators
            // We'll dispatch a custom event that the calendar can listen for
            const calendarUpdateEvent = new CustomEvent('plannerDataUpdated');
            document.dispatchEvent(calendarUpdateEvent);
            
        } catch (error) {
            console.error('Failed to save planner data to localStorage:', error);
        }
    }

    function renderWeatherWidget() {
        const weatherDisplay = document.getElementById('weather-display');
        if (!weatherDisplay) {
            console.log('Weather display element not found');
            return;
        }
        
        if (!currentWeatherData) {
            weatherDisplay.innerHTML = '<div class="weather-loading">Loading weather...</div>';
            return;
        }

        const weatherAdvice = getWeatherAdvice(currentWeatherData);
        
        // Use a simple weather icon instead of external API
        const weatherIconMap = {
            '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️',
            '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
            '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        };
        
        const weatherIcon = weatherIconMap[currentWeatherData.icon] || '🌤️';

        weatherDisplay.innerHTML = `
            <div class="weather-current">
                <div class="weather-main">
                    <div class="weather-icon-emoji" style="font-size: 3rem; line-height: 1;">${weatherIcon}</div>
                    <div class="weather-info">
                        <div class="weather-temp">${currentWeatherData.temperature}°C</div>
                        <div class="weather-desc">${currentWeatherData.description}</div>
                    </div>
                </div>
                <div class="weather-details">
                    <div class="weather-detail">
                        <span class="weather-label">Humidity:</span>
                        <span class="weather-value">${currentWeatherData.humidity}%</span>
                    </div>
                    <div class="weather-detail">
                        <span class="weather-label">Wind:</span>
                        <span class="weather-value">${currentWeatherData.windSpeed} m/s</span>
                    </div>
                </div>
            </div>
            <div class="weather-advice">
                <div class="weather-advice-icon">${weatherAdvice.icon}</div>
                <div class="weather-advice-text">${weatherAdvice.text}</div>
            </div>
        `;
    }

    function getWeatherAdvice(weather) {
        if (weather.isOutdoorFriendly) {
            if (weather.temperature > 25) {
                return {
                    icon: '☀️',
                    text: 'Perfect weather for outdoor activities and beach time!'
                };
            } else if (weather.temperature > 15) {
                return {
                    icon: '🌤️',
                    text: 'Great weather for walking and sightseeing!'
                };
            }
        } else {
            if (weather.temperature < 10) {
                return {
                    icon: '❄️',
                    text: 'Perfect weather for cozy indoor venues and warm drinks!'
                };
            } else {
                return {
                    icon: '🌧️',
                    text: 'Great day for museums, restaurants, and indoor activities!'
                };
            }
        }
        return {
            icon: '🌤️',
            text: 'Check out our recommendations for today!'
        };
    }

    // --- AI PLANNER ---

    function initializeAiPlanner() {
        // Check if we're on the day planner page and all required elements exist
        if (!showAiPlannerBtn || !aiPlannerModal || !aiMoodChoices || !aiTimeChoices) {
            console.log('AI Planner elements not found - skipping initialization');
            return;
        }

        showAiPlannerBtn.addEventListener('click', () => aiPlannerModal.classList.remove('hidden'));
        aiModalCloseBtn.addEventListener('click', () => aiPlannerModal.classList.add('hidden'));
        aiPlannerModal.addEventListener('click', (e) => {
            if (e.target === aiPlannerModal) aiPlannerModal.classList.add('hidden');
        });
        
        populateAiChoices();

        // --- New, More Robust Event Handling ---

        // Handle multi-select for Moods (up to 2)
        if (aiMoodChoices) {
            aiMoodChoices.addEventListener('click', (e) => {
                const button = e.target.closest('.ai-choice-btn');
                if (!button) return;

                const maxSelection = 2;
                const selectedButtons = aiMoodChoices.querySelectorAll('.active');

                if (button.classList.contains('active')) {
                    button.classList.remove('active');
                } else if (selectedButtons.length < maxSelection) {
                    button.classList.add('active');
                }
            });
        }
        
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

        // Handle single-select for Budget
        if(aiBudgetChoices) {
            aiBudgetChoices.addEventListener('click', (e) => {
                const button = e.target.closest('.ai-choice-btn');
                if (!button) return;
    
                const wasActive = button.classList.contains('active');
                aiBudgetChoices.querySelectorAll('.active').forEach(btn => btn.classList.remove('active'));
                if (!wasActive) {
                    button.classList.add('active');
                }
            });
        }

        // Handle single-select for Time
        if (aiTimeChoices) {
            aiTimeChoices.addEventListener('click', (e) => {
                const button = e.target.closest('.ai-choice-btn');
                if (!button || button.disabled) return;

                const wasActive = button.classList.contains('active');
                aiTimeChoices.querySelectorAll('.active').forEach(btn => btn.classList.remove('active'));
                if(!wasActive) {
                    button.classList.add('active');
                }
            });
        }
        
        if (generatePlanBtn) generatePlanBtn.addEventListener('click', generateAndDisplayPlan);
        if (aiSuggestionsList) aiSuggestionsList.addEventListener('click', handleSuggestionClick);
        if (startOverBtn) startOverBtn.addEventListener('click', handleStartOver);
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
        
        // Update budget tracker if budget is configured
        if (currentBudgetConfig) {
            const currentCost = calculateItineraryCost(plannerData[currentlySelectedDate] || []);
            renderBudgetTracker(currentBudgetConfig, currentCost);
        }
    }

    function populateAiChoices() {
        // Populate Moods
        if (aiMoodChoices) {
            aiMoodChoices.innerHTML = Object.keys(aiPlannerConfig.moods).map(key => {
                const mood = aiPlannerConfig.moods[key];
                return `
                    <button class="ai-choice-btn" data-type="mood" data-value="${key}" title="${mood.description}">
                        <span class="icon">${mood.icon}</span>
                        <span>${key}</span>
                    </button>
                `;
            }).join('');
        }

        // Populate Company
        if(aiCompanyChoices) {
            aiCompanyChoices.innerHTML = Object.keys(aiPlannerConfig.company).map(key => {
                const company = aiPlannerConfig.company[key];
                return `
                    <button class="ai-choice-btn" data-type="company" data-value="${key}" title="${company.description}">
                        <span class="icon">${company.icon}</span>
                        <span>${key}</span>
                    </button>
                `;
            }).join('');
        }

        // Populate Budget
        if(aiBudgetChoices) {
            aiBudgetChoices.innerHTML = Object.keys(aiPlannerConfig.budget).map(key => {
                const budget = aiPlannerConfig.budget[key];
                return `
                    <button class="ai-choice-btn" data-type="budget" data-value="${key}" title="${budget.description}">
                        <span class="icon">${budget.icon}</span>
                        <span>${key}</span>
                    </button>
                `;
            }).join('');
        }

        // Populate Times
        if (aiTimeChoices) {
            aiTimeChoices.innerHTML = aiPlannerConfig.times.map(time => `
                 <button class="ai-choice-btn" data-type="time" data-value="${time}">
                    <span>${time}</span>
                </button>
            `).join('');
        }
    }

    function generateAndDisplayPlan() {
        const selectedMoods = Array.from(aiMoodChoices.querySelectorAll('.active')).map(b => b.dataset.value);
        const selectedCompany = aiCompanyChoices?.querySelector('.active')?.dataset.value;
        const selectedBudget = aiBudgetChoices?.querySelector('.active')?.dataset.value;
        const selectedTime = aiTimeChoices.querySelector('.active')?.dataset.value;

        if (selectedMoods.length === 0 || !selectedCompany || !selectedBudget || !selectedTime) {
            alert('Please make a selection for each category.');
            return;
        }

        const generatedPlan = generateItinerary(selectedMoods, selectedCompany, selectedBudget, selectedTime, currentlySelectedDate);
        // Pass selected moods and budget to suggestions
        generatedPlan.forEach(suggestion => {
            suggestion.selectedMoods = selectedMoods;
            suggestion.selectedBudget = selectedBudget;
        });
        
        // Store current budget config for tracking
        currentBudgetConfig = selectedBudget;
        
        renderAiSuggestions(generatedPlan);

        document.getElementById('ai-planner-questions').classList.add('hidden');
        generatePlanBtn.classList.add('hidden');
        aiPlanSuggestions.classList.remove('hidden');
    }

    function generateItinerary(moods, company, budget, timeOfDay, dateStr) {
        const selectedMoodTags = moods.flatMap(mood => aiPlannerConfig.moods[mood]?.tags || []);
        const selectedCompanyTags = aiPlannerConfig.company[company]?.tags || [];
        const budgetConfig = aiPlannerConfig.budget[budget];

        const adventureTypes = ['kayaking', 'sup', 'diving', 'cruises', 'hiking', 'atv', 'sports', 'camping'];
        
        // Smart categorization for day planning
        const dayCompatibleAdventures = ['kayaking', 'sup', 'diving', 'atv']; // 1-3 hours, can fit in day schedule
        const longAdventures = ['hiking', 'cruises']; // 4-6 hours, different schedule needed
        const fullDayAdventures = ['camping']; // 8+ hours, dominates the entire day

        let scoredVenues = venuesData.map(venue => {
            const venueTags = new Set(venue.tags || []);
            const venueType = Array.isArray(venue.type.en) ? venue.type.en[0] : venue.type.en;
            const venueName = venue.name.en.toLowerCase();
            let score = 0;
            
            // EXCLUSION RULES - venues that should never be recommended for certain combinations
            
            // Family Fun should NEVER get clubs, pubs, or nightlife venues
            if (company === 'Family Fun') {
                if (['club', 'pub'].includes(venueType) || venueTags.has('nightlife') || venueTags.has('alcohol')) {
                    return { ...venue, score: -1 }; // Exclude completely
                }
            }
            
            // Evening + Family Fun should avoid any adult-oriented venues
            if (company === 'Family Fun' && timeOfDay === 'Evening') {
                if (venueTags.has('adult') || venueTags.has('party') || venueTags.has('bar')) {
                    return { ...venue, score: -1 }; // Exclude completely
                }
            }
            
            // Solo Trip should avoid family-specific venues
            if (company === 'Solo Trip') {
                if (venueTags.has('family-only') || venueTags.has('kids')) {
                    score -= 2; // Penalize but don't exclude
                }
            }

            // Mood matching (40% weight) - contextual scoring
            moods.forEach(moodKey => {
                if (moodKey === 'Active') {
                    if (['atv', 'diving', 'hiking', 'kayaking', 'sup', 'sports'].includes(venueType)) {
                        score += 4;
                    } else if (venueTags.has('adventure') || venueTags.has('extreme') || venueTags.has('thrill')) {
                        score += 2;
                    }
                } else if (moodKey === 'Relaxed') {
                    if (['beach', 'cafe', 'coffee'].includes(venueType)) {
                        score += 4;
                    } else if (venueTags.has('relax') || venueTags.has('scenic') || venueTags.has('quiet') || venueTags.has('peaceful')) {
                        score += 2;
                    } else if (venueType === 'restaurant' && !venueTags.has('club')) {
                        score += 1;
                    }
                } else if (moodKey === 'Social') {
                    if (['pub', 'club', 'restaurant'].includes(venueType)) {
                        score += 4;
                    } else if (venueTags.has('social') || venueTags.has('friends') || venueTags.has('music') || venueTags.has('dance')) {
                        score += 2;
                    }
                } else if (moodKey === 'Cultural') {
                    if (['museum', 'historic'].includes(venueType)) {
                        score += 4;
                    } else if (venueTags.has('culture') || venueTags.has('historic') || venueTags.has('educational')) {
                        score += 2;
                    }
                } else if (moodKey === 'Romantic') {
                    if (venueType === 'restaurant' && (venueTags.has('romantic') || venueTags.has('scenic'))) {
                        score += 4;
                    } else if (venueTags.has('romantic') || venueTags.has('intimate') || venueTags.has('cozy')) {
                        score += 2;
                    }
                }
            });

            // Company type matching (30% weight)
            if (company === 'Solo Trip') {
                if (['cafe', 'coffee', 'museum', 'historic'].includes(venueType)) {
                    score += 3;
                } else if (venueTags.has('solo') || venueTags.has('quiet')) {
                    score += 2;
                }
            } else if (company === 'Couple') {
                if (venueType === 'restaurant' || venueTags.has('romantic')) {
                    score += 3;
                } else if (venueTags.has('scenic') || venueTags.has('intimate')) {
                    score += 2;
                }
                         } else if (company === 'Family Fun') {
                 if (['beach', 'museum', 'historic', 'cafe'].includes(venueType)) {
                     score += 4;
                 } else if (venueType === 'restaurant' && !venueTags.has('club') && !venueTags.has('bar')) {
                     score += 3;
                 } else if (venueTags.has('family-friendly') || venueTags.has('safe') || venueTags.has('educational')) {
                     score += 2;
                 } else if (['atv', 'hiking', 'kayaking', 'sup'].includes(venueType) && venueTags.has('safe')) {
                     score += 2; // Family-safe activities
                 }
             } else if (company === 'Friends') {
                if (['pub', 'club', 'restaurant'].includes(venueType)) {
                    score += 3;
                } else if (venueTags.has('social') || venueTags.has('group')) {
                    score += 2;
                }
            }

            // Budget consideration (20% weight) - simplified
            if (budget === 'Budget-Friendly') {
                // Prefer cafes, basic restaurants, free activities
                if (['cafe', 'coffee', 'beach', 'historic'].includes(venueType)) {
                    score += 2;
                } else if (venueType === 'restaurant' && !venueTags.has('luxury')) {
                    score += 1;
                }
            } else if (budget === 'Luxury') {
                // Prefer upscale venues
                if (venueTags.has('luxury') || venueTags.has('upscale')) {
                    score += 2;
                }
            } else {
                // Moderate - neutral scoring
                score += 1;
            }

            // Weather suitability (10% weight)
            if (currentWeatherData) {
                const isOutdoorVenue = isVenueOutdoor(venue);
                if (currentWeatherData.isOutdoorFriendly && isOutdoorVenue) {
                    score += 1; // Boost outdoor venues in good weather
                } else if (!currentWeatherData.isOutdoorFriendly && !isOutdoorVenue) {
                    score += 1; // Boost indoor venues in bad weather
                } else if (!currentWeatherData.isOutdoorFriendly && isOutdoorVenue) {
                    score -= 1; // Penalize outdoor venues in bad weather
                }
            }
            
            // Apply seasonal scoring bonus
            const currentSeason = getSeason(new Date().getMonth() + 1);
            const seasonalBonus = getSeasonalScore(venue, currentSeason);
            score *= seasonalBonus;
            
            return { ...venue, score };

        }).filter(venue => venue.score > 0); // Exclude negative scores (excluded venues)
        
        // Get recently used venues from session to add variety
        const sessionKey = `recentVenues_${moods.join('_')}_${company}_${timeOfDay}`;
        let recentlyUsed = JSON.parse(sessionStorage.getItem(sessionKey) || '[]');
        
        // Add slight penalty to recently used venues (not exclude, just make less likely)
        const applyRecencyPenalty = (venue) => {
            if (recentlyUsed.includes(venue.id)) {
                venue.score *= 0.7; // 30% penalty for recently used
            }
            return venue;
        };

        // Apply recency penalty and sort by score
        scoredVenues = scoredVenues.map(applyRecencyPenalty).sort((a, b) => b.score - a.score);

        let suggestions = [];
        let usedVenueIds = new Set();
        let adventureUsed = false; // Track if we've already added an adventure activity

        const addActivity = (activityTypes, timeSlot, allowAdventure = true) => {
            let potentialVenues;
            // Special handling for Adventure-related moods to ensure true adventure activities are prioritized
            if (moods.includes('Active') && activityTypes.some(t => adventureTypes.includes(t))) {
                potentialVenues = venuesData.filter(v => {
                    if (usedVenueIds.has(v.id)) return false;
                    if (!v || !v.type || !v.type.en) return false;
                    
                    const venueTypeList = Array.isArray(v.type.en) ? v.type.en : [v.type.en || ''];
                    const venueType = venueTypeList[0];
                    
                    // Avoid conflicting venue types (don't suggest multiple beaches, multiple restaurants, etc.)
                    const existingTypes = new Set();
                    suggestions.forEach(s => {
                        if (s.venueId) {
                            const existingVenue = venuesData.find(ev => ev.id === s.venueId);
                            if (existingVenue && existingVenue.type && existingVenue.type.en) {
                                const existingType = Array.isArray(existingVenue.type.en) ? existingVenue.type.en[0] : existingVenue.type.en;
                                existingTypes.add(existingType);
                            }
                        }
                    });
                    
                    // Don't add same type of venue twice (no multiple beaches, restaurants, etc.)
                    if (existingTypes.has(venueType)) return false;
                    
                    return venueTypeList.some(t => adventureTypes.includes(t));
                });
            } else {
                potentialVenues = scoredVenues.filter(v => {
                    if (usedVenueIds.has(v.id)) return false;
                    if (!v || !v.type || !v.type.en) return false;
                    
                    const venueTypeList = Array.isArray(v.type.en) ? v.type.en : [v.type.en || ''];
                    const venueType = venueTypeList[0];
                    
                    // Double-check exclusions for family fun
                    if (company === 'Family Fun') {
                        if (['club', 'pub'].includes(venueType)) {
                            return false; // Never include clubs/pubs for families
                        }
                        
                        // Additional family checks
                        const venueName = v.name && v.name.en ? v.name.en.toLowerCase() : '';
                        const venueTags = v.tags || [];
                        
                                                 // Sports complexes need specific family-friendly verification
                         if (venueType === 'sports') {
                             // Only allow sports venues that are explicitly family-friendly
                             if (!venueTags.includes('family-friendly') && 
                                 !venueName.includes('family') && 
                                 !venueName.includes('kids') && 
                                 !venueName.includes('children') &&
                                 !venueName.includes('playground')) {
                                 return false; // Exclude adult sports complexes like football stadiums
                             }
                         }
                    }
                    
                    // Avoid conflicting venue types
                    const existingTypes = new Set();
                    suggestions.forEach(s => {
                        if (s.venueId) {
                            const existingVenue = venuesData.find(ev => ev.id === s.venueId);
                            if (existingVenue && existingVenue.type && existingVenue.type.en) {
                                const existingType = Array.isArray(existingVenue.type.en) ? existingVenue.type.en[0] : existingVenue.type.en;
                                existingTypes.add(existingType);
                            }
                        }
                    });
                    
                    // Don't add same type of venue twice
                    if (existingTypes.has(venueType)) return false;
                    
                    return venueTypeList.some(t => activityTypes.includes(t));
                });
            }

            if (potentialVenues.length > 0) {
                // --- Enhanced variety selection ---
                let venue;
                
                if (potentialVenues.length <= 3) {
                    // If few options, pick randomly from all
                    venue = potentialVenues[Math.floor(Math.random() * potentialVenues.length)];
                } else {
                    // Use weighted random selection to give variety but still favor better venues
                    const scoreGroups = {
                        excellent: potentialVenues.filter(v => v.score >= 8),
                        good: potentialVenues.filter(v => v.score >= 5 && v.score < 8),
                        decent: potentialVenues.filter(v => v.score >= 2 && v.score < 5),
                        any: potentialVenues.filter(v => v.score > 0)
                    };
                    
                    // Weighted selection: 50% excellent, 30% good, 15% decent, 5% any
                    const random = Math.random();
                    if (random < 0.5 && scoreGroups.excellent.length > 0) {
                        venue = scoreGroups.excellent[Math.floor(Math.random() * scoreGroups.excellent.length)];
                    } else if (random < 0.8 && scoreGroups.good.length > 0) {
                        venue = scoreGroups.good[Math.floor(Math.random() * scoreGroups.good.length)];
                    } else if (random < 0.95 && scoreGroups.decent.length > 0) {
                        venue = scoreGroups.decent[Math.floor(Math.random() * scoreGroups.decent.length)];
                    } else if (scoreGroups.any.length > 0) {
                        venue = scoreGroups.any[Math.floor(Math.random() * scoreGroups.any.length)];
                    } else {
                        // Fallback: pick the first venue if all else fails
                        venue = potentialVenues[0];
                    }
                }
                
                // Safety check to ensure venue is defined
                if (!venue || !venue.type || !venue.type.en) {
                    console.warn('Invalid venue selected, skipping:', venue);
                    return; // Skip this venue
                }
                
                const venueType = Array.isArray(venue.type.en) ? venue.type.en[0] : venue.type.en;
                
                // Check if this is an adventure activity
                if (adventureTypes.includes(venueType)) {
                    if (adventureUsed && allowAdventure) {
                        // Adventure already used, try to find non-adventure venue instead
                        const nonAdventureVenues = potentialVenues.filter(v => {
                            if (!v || !v.type || !v.type.en) return false;
                            const vType = Array.isArray(v.type.en) ? v.type.en[0] : v.type.en;
                            return !adventureTypes.includes(vType);
                        });
                        
                        if (nonAdventureVenues.length > 0) {
                            const nonAdvVenue = nonAdventureVenues[0];
                            if (nonAdvVenue && nonAdvVenue.name && nonAdvVenue.name.en) {
                                usedVenueIds.add(nonAdvVenue.id);
                                suggestions.push({
                                    venueId: nonAdvVenue.id,
                                    time: timeSlot,
                                    text: nonAdvVenue.name.en,
                                    type: 'venue',
                                    selectedMoods: moods,
                                    duration: calculateSimpleDuration(nonAdvVenue, moods, company)
                                });
                            }
                        }
                        return; // Don't add another adventure
                    } else if (allowAdventure) {
                        adventureUsed = true; // Mark adventure as used
                        
                        // Check if this is a full-day adventure (camping)
                        if (fullDayAdventures.includes(venueType)) {
                            // Camping selected - this will dominate the day
                            const venueName = venue.name && venue.name.en ? venue.name.en : 'Unknown Venue';
                            console.log(`🏕️ Full-day camping selected: ${venueName} - this will dominate the itinerary`);
                            
                            usedVenueIds.add(venue.id);
                            suggestions.push({
                                venueId: venue.id,
                                time: timeSlot,
                                text: venueName,
                                type: 'venue',
                                selectedMoods: moods,
                                duration: calculateSimpleDuration(venue, moods, company),
                                fullDayActivity: true
                            });
                            
                            // For camping, add only dinner at the end, skip other activities
                            return;
                        }
                    }
                }

                usedVenueIds.add(venue.id);
                
                const venueName = venue.name && venue.name.en ? venue.name.en : 'Unknown Venue';
                const venueScore = venue.score !== undefined ? venue.score.toFixed(1) : 'N/A';
                console.log(`Selected venue: ${venueName} (Type: ${venueType}, Score: ${venueScore}) for ${timeSlot}`);
                
                suggestions.push({
                    venueId: venue.id,
                    time: timeSlot,
                    text: venueName,
                    type: 'venue',
                    selectedMoods: moods,
                    duration: calculateSimpleDuration(venue, moods, company)
                });
            } else if (activityTypes.includes('culture')) {
                suggestions.push({ time: timeSlot, text: `Explore Ohrid's Old Town`, type: 'custom' });
            }
        };
        
        // Generate a logical itinerary based on time of day and company type
        if (timeOfDay === 'Full Day') {
            // Check if we should do a camping-focused day first
            const campingFocused = moods.includes('Active') && Math.random() < 0.3; // 30% chance for active moods
            
            if (campingFocused) {
                // Camping-focused day: mainly camping + dinner
                console.log('🏕️ Generating camping-focused itinerary');
                addActivity([...fullDayAdventures], '09:00'); // Start camping early
                
                // Check if camping was actually selected
                const lastSuggestion = suggestions[suggestions.length - 1];
                if (lastSuggestion && lastSuggestion.fullDayActivity) {
                    // Camping selected - add only dinner at the end
                    addActivity(['restaurant'], '19:00', false); // Dinner after camping
                    
                    if (company !== 'Family Fun') {
                        addActivity(['pub', 'cafe'], '21:30', false); // Optional evening drink
                    }
                } else {
                    // Camping not available, fall back to regular day
                    addActivity(['coffee', 'cafe'], '09:00');
                    addActivity([...dayCompatibleAdventures], '11:00');
                    addActivity(['restaurant'], '14:00');
                    addActivity(['beach', 'cafe'], '16:30', false);
                    addActivity(['restaurant'], '19:30');
                }
            } else {
                // Regular full day logic
                if (moods.includes('Active') && company === 'Solo Trip') {
                    // Special logic for Active Solo Trip - your optimal timing
                    addActivity(['coffee', 'cafe'], '09:00'); // Morning fuel
                    addActivity([...dayCompatibleAdventures], '12:00'); // ONE adventure that fits the schedule
                    addActivity(['restaurant'], '15:00'); // Late lunch after adventure
                    addActivity(['pub', 'club'], '21:00'); // Evening social
                } else {
                    // Default full day logic - CAREFULLY add only ONE adventure maximum
                    addActivity(['coffee', 'cafe'], '09:00'); // Morning coffee
                    
                    // Morning activity: If Active mood, prioritize adventure; otherwise cultural/historic
                    if (moods.includes('Active')) {
                        addActivity([...dayCompatibleAdventures, ...fullDayAdventures], '10:30'); // ONE adventure only (including camping)
                    } else {
                        addActivity(['museum', 'historic'], '10:30'); // Cultural activity
                    }
                    
                    // Check if a full-day activity was selected
                    const hasFullDayActivity = suggestions.some(s => s.fullDayActivity);
                    
                    if (!hasFullDayActivity) {
                        // Regular day continues
                        addActivity(['restaurant'], '13:00'); // Lunch
                        addActivity(['beach', 'shopping', 'cafe'], '15:30', false); // Explicitly no adventures
                        addActivity(['restaurant'], '19:30'); // Dinner
                        
                        // Evening activity depends on company type
                        if (company === 'Family Fun') {
                            addActivity(['cafe'], '21:00', false); // Family evening, no adventures
                        } else {
                            addActivity(['pub', 'club'], '22:00', false); // Adult nightlife, no adventures
                        }
                    } else {
                        // Full-day activity selected, just add dinner
                        addActivity(['restaurant'], '19:00', false); // Dinner after full-day activity
                    }
                }
            }
        } else if (timeOfDay === 'Morning') {
            addActivity(['coffee', 'cafe'], '09:00');
            addActivity(['museum', 'historic', ...dayCompatibleAdventures], '10:30'); // Allow adventure in morning
        } else if (timeOfDay === 'Afternoon') {
            addActivity(['restaurant'], '13:00'); // Lunch
            addActivity(['beach', 'shopping', ...dayCompatibleAdventures], '15:30'); // Allow adventure in afternoon
        } else if (timeOfDay === 'Evening') {
            addActivity(['restaurant'], '19:30'); // Dinner
            
            // Late evening activity depends on company type - NO adventures at night
            if (company === 'Family Fun') {
                addActivity(['cafe'], '21:00', false); // Family-friendly evening
            } else if (company === 'Couple') {
                addActivity(['cafe'], '21:30', false); // Romantic evening
            } else {
                addActivity(['pub', 'club'], '22:00', false); // Friends/Solo nightlife
            }
        }

        if (suggestions.length === 0) {
            suggestions.push({ text: "We couldn't create a plan for this combination. Please try different options!", type: 'custom' });
        } else {
            // Apply smart scheduling optimization
            suggestions = optimizeItineraryTiming(suggestions);
            
            // Add timing indicators for optimized suggestions
            suggestions.forEach(suggestion => {
                if (suggestion.optimized && suggestion.venueId) {
                    const venue = venuesData.find(v => v.id === suggestion.venueId);
                    if (venue) {
                        const openingHours = getVenueOpeningHours(venue);
                        suggestion.timingNote = `Optimized timing (opens ${openingHours.open})`;
                    }
                }
            });
        }

        // Track selected venues for variety in future generations
        const selectedVenueIds = suggestions
            .filter(s => s.venueId)
            .map(s => s.venueId);
        
        if (selectedVenueIds.length > 0) {
            // Add to recently used list (keep last 10)
            recentlyUsed = [...new Set([...selectedVenueIds, ...recentlyUsed])].slice(0, 10);
            sessionStorage.setItem(sessionKey, JSON.stringify(recentlyUsed));
        }

        return suggestions;
    }

    function calculateMoodCompatibility(venue, selectedMoods) {
        if (!selectedMoods || selectedMoods.length === 0) return null;
        if (!venue || !venue.type || !venue.type.en || !venue.name || !venue.name.en) return null;
        
        const venueTags = new Set(venue.tags || []);
        const venueType = Array.isArray(venue.type.en) ? venue.type.en[0] : venue.type.en;
        const venueName = venue.name.en.toLowerCase();
        
        let totalMatches = 0;
        let matchingMoods = [];
        
        selectedMoods.forEach(moodKey => {
            const mood = aiPlannerConfig.moods[moodKey];
            if (mood) {
                let moodScore = 0;
                
                // Context-aware matching based on venue type and name
                if (moodKey === 'Active') {
                    // High energy activities - ONLY true active sports
                    if (['atv', 'diving', 'hiking', 'kayaking', 'sup'].includes(venueType)) {
                        moodScore += 3;
                    } else if (venueType === 'sports' && (venueName.includes('adventure') || venueName.includes('active'))) {
                        moodScore += 2;
                    } else if (venueTags.has('adventure') || venueTags.has('extreme') || venueTags.has('active')) {
                        moodScore += 2;
                    }
                    // Regular beaches are NOT active unless they offer water sports
                    if (venueType === 'beach' && !venueName.includes('kayak') && !venueName.includes('sup') && 
                        !venueName.includes('diving') && !venueTags.has('water-sports')) {
                        moodScore = 0; // Exclude regular beaches from active
                    }
                } else if (moodKey === 'Relaxed') {
                    // Relaxing activities
                    if (['beach', 'cafe', 'coffee'].includes(venueType)) {
                        moodScore += 3;
                    } else if (venueTags.has('relax') || venueTags.has('scenic') || venueTags.has('peaceful') || venueTags.has('quiet')) {
                        moodScore += 2;
                    } else if (venueType === 'restaurant' && !venueTags.has('club')) {
                        moodScore += 1;
                    }
                } else if (moodKey === 'Social') {
                    // Social venues
                    if (['pub', 'club', 'restaurant'].includes(venueType)) {
                        moodScore += 3;
                    } else if (venueTags.has('social') || venueTags.has('friends') || venueTags.has('music') || venueTags.has('dance')) {
                        moodScore += 2;
                    }
                } else if (moodKey === 'Cultural') {
                    // Educational/cultural venues
                    if (['museum', 'historic'].includes(venueType)) {
                        moodScore += 3;
                    } else if (venueTags.has('culture') || venueTags.has('historic') || venueTags.has('learn') || venueTags.has('educational')) {
                        moodScore += 2;
                    }
                } else if (moodKey === 'Romantic') {
                    // Romantic venues
                    if (venueType === 'restaurant' && (venueTags.has('romantic') || venueTags.has('scenic'))) {
                        moodScore += 3;
                    } else if (venueTags.has('romantic') || venueTags.has('intimate') || venueTags.has('sunset') || venueTags.has('cozy')) {
                        moodScore += 2;
                    }
                }
                
                if (moodScore > 0) {
                    totalMatches += moodScore;
                    matchingMoods.push(moodKey);
                }
            }
        });
        
        // Determine compatibility level
        let level, icon, reason;
        
        if (totalMatches >= 5) {
            level = 'excellent';
            icon = '🎯';
            reason = `Perfect match for ${matchingMoods.join(' & ')} mood${matchingMoods.length > 1 ? 's' : ''}`;
        } else if (totalMatches >= 3) {
            level = 'good';
            icon = '👍';
            reason = `Great fit for ${matchingMoods.join(' & ')} mood${matchingMoods.length > 1 ? 's' : ''}`;
        } else if (totalMatches >= 1) {
            level = 'fair';
            icon = '✓';
            reason = `Good option for ${matchingMoods.join(' & ')} mood${matchingMoods.length > 1 ? 's' : ''}`;
        } else {
            level = 'neutral';
            icon = '◯';
            reason = 'Recommended based on other preferences';
        }
        
        return { level, icon, reason };
    }

    function renderAiSuggestions(suggestions) {
        if (!aiSuggestionsList) {
            console.log('AI suggestions list element not found');
            return;
        }
        
        aiSuggestionsList.innerHTML = '';
        if (!suggestions || suggestions.length === 0) {
            aiSuggestionsList.innerHTML = `<p class="empty-plan-message">We couldn't find any suggestions for your choices. Please try a different combination.</p>`;
            return;
        }

        const planForDate = plannerData[currentlySelectedDate] || [];

        let listHtml = '';
        suggestions.forEach(item => {
            let icon = '✨'; // Default for custom
            let moodCompatibility = null;
    
            if (item.type === 'venue' && item.venueId) {
                const venue = venuesData.find(v => v.id === item.venueId);
                if (venue && venue.type && venue.type.en) {
                    const venueIdentifier = venue.type?.en?.[0] || venue.tags?.[0] || '';
                    let foundMood = Object.values(aiPlannerConfig.moods).find(m => m.tags.includes(venueIdentifier.toLowerCase()));
                    icon = foundMood ? foundMood.icon : '📍';
                    
                    // Calculate mood compatibility
                    moodCompatibility = calculateMoodCompatibility(venue, item.selectedMoods || []);
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
            
            const compatibilityHTML = moodCompatibility ? `
                <div class="mood-compatibility">
                    <div class="compatibility-indicator ${moodCompatibility.level}">
                        <span class="compatibility-icon">${moodCompatibility.icon}</span>
                        <span class="compatibility-text">${moodCompatibility.level}</span>
                    </div>
                    <div class="compatibility-reason">${moodCompatibility.reason}</div>
                </div>
            ` : '';

            const timingHTML = item.optimized ? `
                <div class="timing-optimization">
                    <div class="timing-indicator">
                        <span class="timing-icon">⏰</span>
                        <span class="timing-text">Smart Timing</span>
                    </div>
                    ${item.timingNote ? `<div class="timing-note">${item.timingNote}</div>` : ''}
                </div>
            ` : '';

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
                        ${compatibilityHTML}
                        ${timingHTML}
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
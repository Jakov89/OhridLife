# 🏙️ City Selector Feature - Complete Guide

## Overview

A beautiful, modern city selector that allows users to filter venues between **Ohrid** and **Struga**. The design features an elegant card-based interface with smooth animations and responsive layouts.

---

## ✨ Features

- **Modern Card Design**: Sleek gradient background with shadow effects
- **Animated Icons**: Pulsing location icon and interactive city emojis
- **Visual Feedback**: Checkmark animation when city is selected
- **Smooth Transitions**: Hover effects and click animations
- **Fully Responsive**: Adapts beautifully from desktop to mobile
- **Accessible**: Keyboard navigation and screen reader friendly

---

## 🎨 Design Highlights

### Desktop View
- Two-column grid layout
- Large emoji icons (🏛️ for Ohrid, 🌊 for Struga)
- City names with descriptive subtitles
- Animated checkmark on selection
- Hover effects with lift animation

### Mobile View
- Single column stack layout
- Optimized button sizing
- Touch-friendly interactions
- Smooth transitions

---

## 📦 What's Included

### Files Created/Modified

1. **index.html** - City selector UI
2. **style.css** - Modern styling and animations
3. **index.js** - City filtering logic
4. **add-city-to-venues.js** - Helper script to add city field
5. **update-struga-venues.js** - Helper script to identify Struga venues
6. **CITY-SELECTOR-GUIDE.md** - This documentation

---

## 🚀 Quick Start

### Step 1: Data is Ready ✅

The city field has been added to all 136 venues (currently all set to "Ohrid").

### Step 2: Update Struga Venues

You now need to identify which venues should be in Struga. You have two options:

#### Option A: Use the Automated Script

```bash
node update-struga-venues.js
```

This will search for venues with "struga" keywords and ask for confirmation before updating.

#### Option B: Manual Update

Open `data/venues_reorganized.json` and find Struga venues, then change:

```json
{
  "id": 123,
  "name": "Some Venue in Struga",
  "city": "Struga",  // Change from "Ohrid" to "Struga"
  ...
}
```

**💡 Tip**: Search for venue names, descriptions, or addresses that mention Struga.

### Step 3: Test It!

1. Start your server: `node server.js`
2. Open http://localhost:3000
3. Scroll to "Explore All Venues"
4. Click between Ohrid and Struga buttons
5. Watch venues filter instantly!

---

## 🎯 How It Works

### User Flow

1. User sees the city selector card at the top of venues section
2. User clicks on "Ohrid" or "Struga" button
3. Button animates with checkmark
4. Venues filter to show only selected city
5. Categories update to reflect available venues in that city

### Technical Flow

```javascript
User clicks button
    ↓
Update selectedCity variable
    ↓
Call filterAndDisplayVenues()
    ↓
Filter by city first (performVenueFiltering)
    ↓
Then apply category filters
    ↓
Render filtered venues
```

---

## 🎨 Customization Options

### Change City Emojis

In `index.html`, modify the emoji in `city-btn-icon`:

```html
<div class="city-btn-icon">🏛️</div>  <!-- Change to any emoji -->
```

### Change City Subtitles

```html
<span class="city-btn-subtitle">Pearl of the Balkans</span>  <!-- Customize text -->
```

### Change Colors

In `style.css`, modify the active state gradient:

```css
.city-select-btn.active {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    /* Change to your preferred colors */
}
```

### Add More Cities

1. **Add HTML button:**
```html
<button class="city-select-btn" data-city="NewCity">
    <div class="city-btn-icon">🏰</div>
    <div class="city-btn-content">
        <span class="city-btn-name">NewCity</span>
        <span class="city-btn-subtitle">Description</span>
    </div>
    <div class="city-btn-checkmark">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
        </svg>
    </div>
</button>
```

2. **Update CSS for 3-column grid (if needed):**
```css
.city-selector-buttons {
    grid-template-columns: repeat(3, 1fr);
}
```

3. **Add venues with the new city:**
```json
{
  "city": "NewCity",
  ...
}
```

---

## 📱 Responsive Breakpoints

- **Desktop** (> 768px): 2-column grid, full padding
- **Tablet** (≤ 768px): Single column, reduced padding
- **Mobile** (≤ 480px): Compact spacing, smaller icons

---

## 🎭 Animations & Effects

### 1. Pulsing Location Icon
- Smooth scale animation every 2 seconds
- Draws attention to the selector

### 2. Button Hover Effects
- Lift animation (translateY)
- Blue border color
- Subtle shadow growth

### 3. Active State Transition
- Gradient background fade-in
- Checkmark scale and opacity animation
- Text color changes

### 4. Click Feedback
- Quick scale-down on click
- Returns to normal in 150ms

---

## 🔧 Troubleshooting

### Issue: Buttons not showing
**Solution:** Check if city-selector-wrapper exists in HTML and CSS is loaded.

### Issue: Filtering not working
**Solution:** 
1. Open browser console
2. Check for "City selector initialized" message
3. Verify `selectedCity` variable is set
4. Make sure venues have `city` field

### Issue: All venues still showing
**Solution:** The filtering code defaults to "Ohrid" if no city field exists. Make sure the script ran successfully.

### Issue: Styling looks different
**Solution:**
1. Clear browser cache (Ctrl+F5)
2. Check for CSS conflicts
3. Verify style.css is the latest version

---

## 📊 Data Structure

Each venue now includes:

```json
{
  "id": 121,
  "name": "Venue Name",
  "city": "Ohrid",  // or "Struga"
  "description": "...",
  "type": ["restaurant"],
  ...
}
```

**Important:** Venues without a `city` field default to "Ohrid" for backward compatibility.

---

## 🎯 Best Practices

### For Adding Struga Venues

1. **Search by Location**: Look for venue addresses mentioning Struga
2. **Search by Description**: Find references to Struga in descriptions
3. **Verify Manually**: Double-check before updating
4. **Keep Backup**: The script creates backups automatically

### For Performance

- City filtering is done client-side (instant)
- Venues are cached after initial load
- Only necessary DOM updates on filter change

---

## 💡 Future Enhancement Ideas

1. **Venue Count Badge**: Show number of venues per city
2. **Remember Selection**: Use localStorage to save preference
3. **URL Parameters**: Allow deep linking to specific city
4. **Map View**: Show cities on an interactive map
5. **Multiple Selection**: Allow "Show All Cities" option
6. **Search Integration**: Filter search results by city too

---

## 📝 Example: Adding Struga Venues Manually

```javascript
// In venues_reorganized.json

// Before:
{
  "id": 150,
  "name": "Restaurant in Struga",
  "city": "Ohrid",  // ❌ Incorrect
  ...
}

// After:
{
  "id": 150,
  "name": "Restaurant in Struga",
  "city": "Struga",  // ✅ Correct
  ...
}
```

---

## 🆘 Need Help?

1. Check this guide
2. Review browser console for errors
3. Check backup files if data is corrupted
4. Test with a small number of venues first

---

## ✅ Checklist

- [x] City selector UI added to HTML
- [x] Modern CSS styling with animations
- [x] JavaScript filtering logic implemented
- [x] City field added to all venues
- [ ] Struga venues identified and updated
- [ ] Tested on different screen sizes
- [ ] Tested with both cities
- [ ] Verified category filtering still works

---

## 📈 Current Status

- **Total Venues**: 136
- **Ohrid Venues**: 136 (all venues currently)
- **Struga Venues**: 0 (to be updated)

**Next Action**: Run `update-struga-venues.js` or manually update Struga venues in the JSON file.

---

**Created**: November 2025
**Version**: 1.0
**Status**: Implementation Complete ✅

---

Enjoy your beautiful new city selector! 🎉


























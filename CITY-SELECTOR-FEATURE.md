# City Selector Feature for Venues

This document explains the new city selection feature that allows users to filter venues between **Ohrid** and **Struga**.

## Overview

Users can now:
1. **Choose between Ohrid or Struga** at the top of the venues section
2. **View only venues** from the selected city
3. **Filter by categories** within the selected city
4. **Search venues** within the selected city

## What Was Changed

### 1. HTML (`index.html`)
- Added a city selector UI with two buttons: Ohrid and Struga
- Placed before the venue search bar
- Responsive design with emoji icons

### 2. JavaScript (`index.js`)
- Added `selectedCity` global variable (defaults to 'Ohrid')
- Added `initializeCitySelector()` function to handle city button clicks
- Modified `performVenueFiltering()` to filter by city first
- City filtering happens before category/subcategory filtering

### 3. CSS (`style.css`)
- Added `.city-selector-container` styles
- Added `.city-btn` styles with hover and active states
- Responsive styles for mobile devices

### 4. Helper Scripts
Two Node.js scripts to help you add and manage the `city` field in your venues:

#### `add-city-to-venues.js`
- Adds a `city` field to all venues (defaults to "Ohrid")
- Creates a backup before making changes
- Shows statistics of venue distribution

#### `update-struga-venues.js`
- Identifies potential Struga venues based on keywords
- Asks for confirmation before updating
- Updates identified venues to "Struga"

## Setup Instructions

### Step 1: Add City Field to Venues

Run the first script to add the `city` field to all venues:

```bash
node add-city-to-venues.js
```

This will:
- Create a backup at `data/venues_reorganized.json.backup`
- Add `"city": "Ohrid"` to all venues
- Show statistics

### Step 2: Identify and Update Struga Venues

You have two options:

#### Option A: Use the Automated Script (Recommended)

```bash
node update-struga-venues.js
```

This script will:
- Search for venues with "struga" or "струга" in their name, description, or address
- Show you a list of potential Struga venues
- Ask for confirmation before updating
- Update venues to `"city": "Struga"`

**Note:** You can customize the keywords by editing the `strugaKeywords` array in the script.

#### Option B: Manual Update

1. Open `data/venues_reorganized.json`
2. Search for venues that should be in Struga
3. Add or change the `city` field:
   ```json
   {
     "id": 123,
     "name": "Venue Name",
     "city": "Struga",
     ...
   }
   ```
4. Save the file

### Step 3: Test the Feature

1. Start your development server:
   ```bash
   npm start
   ```
   or
   ```bash
   node server.js
   ```

2. Open your browser and navigate to the homepage
3. Scroll to the "Explore All Venues" section
4. You should see the city selector with "Ohrid" and "Struga" buttons
5. Click on each button to see the venues filtered by city

## How It Works

### Default Behavior
- All venues without a `city` field are treated as "Ohrid" venues (backward compatibility)
- The "Ohrid" button is selected by default when the page loads

### Filtering Logic
1. **City Selection**: User clicks on "Ohrid" or "Struga"
2. **City Filtering**: System filters all venues by the selected city
3. **Category Filtering**: User can then filter by categories (Food & Drink, Nightlife, etc.)
4. **Subcategory Filtering**: User can further filter by subcategories
5. **Search**: Users can search within the filtered results

### Data Structure

Each venue now has a `city` field:

```json
{
  "id": 121,
  "name": "Sky Corner",
  "city": "Ohrid",
  "description": "...",
  "type": ["restaurant", "coffee", "club"],
  ...
}
```

## Adding New Struga Venues

When adding new venues to `data/venues_reorganized.json`, simply include the `city` field:

```json
{
  "id": 999,
  "name": "New Struga Venue",
  "city": "Struga",
  "description": "Description here...",
  "type": ["restaurant"],
  ...
}
```

## Customization

### Adding More Cities

If you want to add more cities (e.g., "Debar", "Bitola"):

1. **Update HTML** (`index.html`):
   ```html
   <button class="city-btn" data-city="Debar">
       <span>📍</span>
       Debar
   </button>
   ```

2. **Update venues data**: Add venues with `"city": "Debar"`

3. The JavaScript will automatically handle the new city

### Changing Default City

To change the default selected city, edit `index.js`:

```javascript
let selectedCity = 'Struga'; // Change from 'Ohrid' to 'Struga'
```

Also update the `active` class in `index.html`:

```html
<button class="city-btn active" data-city="Struga">
    <span>📍</span>
    Struga
</button>
<button class="city-btn" data-city="Ohrid">
    <span>📍</span>
    Ohrid
</button>
```

## Troubleshooting

### Issue: No venues showing for Struga
**Solution:** Make sure you've run the setup scripts to add the `city` field to venues.

### Issue: All venues still showing Ohrid
**Solution:** Check that your venues have the correct `city` field. Run `update-struga-venues.js` or manually update the JSON file.

### Issue: City buttons not responding
**Solution:** 
1. Check browser console for JavaScript errors
2. Make sure `initializeCitySelector()` is being called
3. Clear browser cache and refresh

### Issue: Styles not applying
**Solution:**
1. Clear browser cache
2. Make sure `style.css` is properly loaded
3. Check for CSS conflicts with other styles

## Technical Details

### Performance
- Filtering is done client-side for fast response
- Venues are cached in `venuesData` array
- Only filtered venues are rendered to the DOM

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Touch-friendly buttons on mobile devices

### Accessibility
- Proper `aria-label` attributes
- Keyboard navigation support
- Screen reader friendly

## Future Enhancements

Potential improvements:
1. Add a "Both Cities" or "All" option
2. Show venue count per city
3. Remember user's city preference (localStorage)
4. Add city-specific events filtering
5. Add map view with city boundaries

## Questions?

If you have any questions or need help:
1. Check this documentation
2. Review the helper scripts
3. Check the code comments in `index.js`
4. Test with the provided example data

---

**Created:** $(date)
**Version:** 1.0
**Author:** OhridHub Development Team










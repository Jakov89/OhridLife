# Open/Closed Status Feature

## Overview
The venue cards now display real-time "Open" or "Closed" status based on the venue's working hours and the current time.

## Features

### ✅ What's Implemented

1. **Real-Time Status Detection**
   - Automatically calculates if venue is currently open based on time
   - Updates dynamically when page is loaded
   - Works with current day of week and time

2. **Visual Status Badges**
   - **Green badge with pulsing dot**: Venue is OPEN 🟢
   - **Red badge with static dot**: Venue is CLOSED 🔴
   - Displayed prominently on every venue card

3. **Smart Working Hours Parsing**
   - Handles multiple time formats:
     - Simple: `"08:00 - 22:00"`
     - Daily: `"Mon-Sun: 08:00-00:00"`
     - Different days: `"Mon-Fri: 08:00-20:00<br>Sat: 09:00-13:00"`
     - 24/7 venues: `"00:00 - 24:00"` → Shows "Open 24/7"
     - Closed days: `"Sun: Closed"`
     - After midnight: `"22:00 - 02:00"` (closes at 2 AM)

4. **Hover Information**
   - Hovering over the status badge shows full working hours
   - Helps users see when venue opens/closes

## Badge Appearance

### Open Status
```
 🟢 Open
```
- **Color**: Green (`rgba(34, 197, 94, 0.95)`)
- **Animation**: Pulsing dot
- **Shows**: "Open" or "Open 24/7"

### Closed Status
```
 🔴 Closed
```
- **Color**: Red (`rgba(239, 68, 68, 0.95)`)
- **Animation**: Static dot
- **Shows**: "Closed"

## How It Works

### 1. Time Calculation
```javascript
// Gets current day (0=Sunday, 1=Monday, etc.) and time in minutes
const now = new Date();
const currentDay = now.getDay();
const currentTime = now.getHours() * 60 + now.getMinutes();
```

### 2. Working Hours Parsing
The system intelligently parses various formats:
- Extracts day ranges (Mon-Fri, Sat-Sun)
- Extracts time ranges (08:00-22:00)
- Handles HTML tags (`<br>` separators)
- Recognizes special cases (24/7, Closed)

### 3. Status Display
- Badge automatically added to venue card overlay
- Positioned next to venue type badge
- Mobile responsive (smaller on mobile devices)

## Examples

### Example 1: Regular Hours
**Venue**: Restaurant
**Working Hours**: `"Mon-Sun: 08:00-22:00"`
**Current Time**: 14:30 (2:30 PM) on Tuesday
**Result**: 🟢 **Open**

### Example 2: Closed
**Venue**: Pharmacy
**Working Hours**: `"Mon-Sat: 08:00-20:00<br>Sun: Closed"`
**Current Time**: 10:00 AM on Sunday
**Result**: 🔴 **Closed**

### Example 3: Late Night
**Venue**: Nightclub
**Working Hours**: `"22:00 - 04:00"`
**Current Time**: 01:00 AM (1:00 AM)
**Result**: 🟢 **Open** (handles after-midnight closing)

### Example 4: 24/7
**Venue**: Gas Station
**Working Hours**: `"00:00 - 24:00"`
**Result**: 🟢 **Open 24/7**

## Badge Positioning

The status badge appears on the **venue card image overlay**, positioned:
- After the venue type badge
- Before the "Recommended" badge (if applicable)

```html
<div class="venue-image-overlay">
    <span class="venue-type-badge">Restaurant</span>
    <span class="venue-status-badge status-open">● Open</span>  ← NEW!
    <span class="recommended-badge">★ Recommended</span>
</div>
```

## Responsive Design

### Desktop
- Full-size badges (6px padding, 0.75rem font)
- Animated pulsing dot for open venues
- Clear spacing between badges

### Mobile
- Smaller badges (4px padding, 0.7rem font)
- Optimized for small screens
- Still clearly visible and readable

## CSS Classes

```css
.venue-status-badge           /* Base badge style */
.venue-status-badge.status-open    /* Green, animated */
.venue-status-badge.status-closed  /* Red, static */
```

## JavaScript Functions

### Main Functions
- `isVenueOpen(workingHours)` - Determines if venue is currently open
- `matchesDay(schedule, currentDay)` - Checks if schedule applies to current day
- `extractHours(text)` - Extracts opening/closing times from text
- `checkIfOpenNow(hours, currentTime)` - Compares current time with hours
- `formatTime(hours, minutes)` - Formats time as HH:MM

## Limitations & Edge Cases

### Handled ✅
- ✅ Multiple day ranges (Mon-Fri, Sat-Sun)
- ✅ Different hours per day
- ✅ 24/7 venues
- ✅ After-midnight closing (22:00-02:00)
- ✅ Closed specific days
- ✅ HTML tags in working hours

### Not Yet Handled ⚠️
- ⚠️ Public holidays (shows regular schedule)
- ⚠️ Special event hours
- ⚠️ Seasonal hours (Summer vs Winter)
- ⚠️ Break times (e.g., "08:00-12:00, 16:00-20:00" shows as closed during break)

## Future Enhancements

### Possible Improvements
1. **Time Until Opening/Closing**
   - Show "Opens at 09:00" when closed
   - Show "Closes at 22:00" when open

2. **Break Time Support**
   - Handle venues with mid-day breaks
   - Show "Open • Closes 12:00, Reopens 16:00"

3. **Live Updates**
   - Auto-refresh status without page reload
   - Update status every minute using `setInterval()`

4. **Holiday Support**
   - Add holiday schedule to venue data
   - Show special hours for holidays

5. **Seasonal Hours**
   - Support summer/winter schedule switching
   - Automatic detection based on date

## Testing

### To Test the Feature:
1. Open the website
2. Browse venues on homepage
3. Look for colored badges on venue cards:
   - Green = Open now
   - Red = Closed now
4. Hover over badge to see full working hours
5. Test at different times of day to see status change

### Test Cases:
- **Morning (8 AM)**: Most restaurants should show "Open"
- **Late Night (2 AM)**: Most places "Closed", clubs may be "Open"
- **Sunday Morning**: Check venues with Sunday closings
- **Midnight**: Test after-midnight closing times

## Technical Details

### Performance
- ✅ Lightweight calculation (< 1ms per venue)
- ✅ No external API calls
- ✅ Runs client-side (no server load)
- ✅ Cached per page load

### Browser Compatibility
- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Android)
- ✅ Uses standard JavaScript Date API

## Troubleshooting

### Badge Not Showing
- Check if venue has `workingHours` field in data
- Verify working hours format is parseable

### Wrong Status
- Check system clock is correct
- Verify working hours format in venue data
- Test with different time formats

### Badge Overlapping
- Badges automatically stack
- CSS flexbox handles positioning
- Responsive at all screen sizes

---

**Created**: October 2025
**Status**: ✅ Live and Working
**Maintained by**: OhridHub Team


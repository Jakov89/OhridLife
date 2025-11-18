# 🎨 City Selector - Design Preview

## Visual Mockup

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                       ┃
┃         Explore All Venues                            ┃
┃    From lakeside restaurants to adventure sports...  ┃
┃                                                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛


╔═══════════════════════════════════════════════════════╗
║                                                       ║
║           📍 Select Your City                         ║
║           ︶︶︶︶︶︶︶︶︶︶︶︶︶                              ║
║                                                       ║
║    ┌─────────────────────┐  ┌─────────────────────┐ ║
║    │                     │  │                     │ ║
║    │   🏛️                │  │   🌊                │ ║
║    │                     │  │                     │ ║
║    │   Ohrid             │  │   Struga            │ ║
║    │   Pearl of the      │  │   City of Poetry    │ ║
║    │   Balkans           │  │                     │ ║
║    │                     │  │                     │ ║
║    │              ✓      │  │                     │ ║
║    │                     │  │                     │ ║
║    └─────────────────────┘  └─────────────────────┘ ║
║     [ACTIVE - Blue Glow]     [Hover - Subtle Lift]  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝

           │                      │
           └──────────┬───────────┘
                      │
                      ▼
              Venues Filter Here
```

---

## 🎨 Color Palette

### Active State (Selected City)
```
Background: Linear Gradient
  ├─ Start: #007bff (Bright Blue)
  └─ End:   #0056b3 (Deep Blue)

Border: #007bff (2px solid)
Shadow: 0 8px 30px rgba(0, 123, 255, 0.4)
Text: White (#ffffff)
```

### Inactive State (Unselected City)
```
Background: White (#ffffff)
Border: #e0e6ed (2px solid)
Text: Dark Gray (#2c3e50)
Subtitle: Medium Gray (#6c757d)
```

### Card Background
```
Gradient: #ffffff → #f8f9fa
Shadow: 0 10px 40px rgba(0, 0, 0, 0.08)
Border: 1px solid rgba(0, 0, 0, 0.05)
```

---

## 📐 Dimensions

### Desktop (> 768px)
```
Card Width: max 700px (centered)
Card Padding: 2rem
Button Padding: 1.25rem 1.5rem
Icon Size: 2.5rem (40px)
Button Border Radius: 16px
Gap Between Buttons: 1rem
```

### Mobile (≤ 768px)
```
Card Padding: 1.5rem
Button Padding: 1rem 1.25rem
Icon Size: 2rem (32px)
Layout: Single column (stacked)
```

---

## ✨ Animation Details

### 1. Location Icon (Header)
```
Animation: Pulse
Duration: 2s
Timing: ease-in-out
Loop: infinite

Keyframes:
  0%:   scale(1.0)
  50%:  scale(1.1)  ← Slightly larger
  100%: scale(1.0)
```

### 2. Button Hover
```
Transform: translateY(-4px)  ← Lifts up
Border Color: #007bff        ← Blue highlight
Shadow: 0 8px 25px rgba(0,123,255,0.2)
Transition: 0.3s cubic-bezier
```

### 3. Button Active (Click)
```
Immediate:
  - Remove active from others
  - Add active to clicked

Animation:
  1. Scale down to 0.95     (0ms)
  2. Scale back to 1.0      (150ms)
  3. Checkmark appears      (0.3s with bounce)
     - opacity: 0 → 1
     - scale: 0 → 1
```

### 4. Checkmark Appearance
```
Timing Function: cubic-bezier(0.68, -0.55, 0.265, 1.55)
  ↑ Creates a "bounce" effect
  
Duration: 0.3s
Transforms:
  - opacity: 0 → 1
  - scale: 0 → 1
```

---

## 🎭 Interaction States

### Default State
```
┌─────────────────────┐
│  🏛️  Ohrid          │
│     Pearl of the    │
│     Balkans         │
└─────────────────────┘
Background: White
Border: Light gray
```

### Hover State
```
┌─────────────────────┐  ↑ Lifts 4px
│  🏛️  Ohrid          │  ← Icon rotates 5°
│     Pearl of the    │
│     Balkans         │
└─────────────────────┘
Background: White with blue tint
Border: Blue
Shadow: Larger blue glow
```

### Active State
```
┌─────────────────────┐
│  🏛️  Ohrid       ✓  │  ← Checkmark shows
│     Pearl of the    │
│     Balkans         │
└─────────────────────┘
Background: Blue gradient
Border: Blue
Text: White
Shadow: Strong blue glow
```

---

## 📱 Responsive Breakpoints

### Large Desktop (> 1200px)
```
╔═══════════════════════════════════════════════╗
║        📍 Select Your City                    ║
║  ┌──────────────┐      ┌──────────────┐      ║
║  │ 🏛️  Ohrid    │      │ 🌊  Struga   │      ║
║  └──────────────┘      └──────────────┘      ║
╚═══════════════════════════════════════════════╝
```

### Tablet (768px - 1200px)
```
╔═══════════════════════════════════╗
║    📍 Select Your City            ║
║  ┌────────────┐  ┌────────────┐  ║
║  │ 🏛️ Ohrid   │  │ 🌊 Struga  │  ║
║  └────────────┘  └────────────┘  ║
╚═══════════════════════════════════╝
```

### Mobile (< 768px)
```
╔═════════════════════════╗
║  📍 Select Your City    ║
║                         ║
║  ┌───────────────────┐ ║
║  │  🏛️  Ohrid        │ ║
║  │  Pearl of Balkans │ ║
║  └───────────────────┘ ║
║                         ║
║  ┌───────────────────┐ ║
║  │  🌊  Struga       │ ║
║  │  City of Poetry   │ ║
║  └───────────────────┘ ║
╚═════════════════════════╝
```

---

## 🎯 Typography

```
Header Title: "Select Your City"
  Font Size: 1.4rem (22.4px)
  Weight: 700 (Bold)
  Color: #2c3e50
  Letter Spacing: -0.5px

City Name:
  Font Size: 1.25rem (20px)
  Weight: 700 (Bold)
  Color: #2c3e50 (inactive)
         #ffffff (active)

City Subtitle:
  Font Size: 0.875rem (14px)
  Weight: 500 (Medium)
  Color: #6c757d (inactive)
         rgba(255,255,255,0.9) (active)
```

---

## 🌟 Special Effects

### Gradient Overlay (Button Hover)
```css
Pseudo-element ::before
  Position: Absolute (covers button)
  Background: linear-gradient(135deg, 
    rgba(0,123,255,0.05) → rgba(0,86,179,0.05))
  Opacity: 0 → 1 on hover
  Creates subtle blue tint effect
```

### Card Hover Effect
```css
Card lifts 2px up
Shadow grows from 40px to 50px blur
Transition: 0.3s ease
Creates "floating" effect
```

### Icon Animations
```css
Hover: scale(1.1) + rotate(5deg)
Active: scale(1.15) + drop-shadow
Creates playful interaction
```

---

## 💫 User Experience Flow

```
1. User lands on page
   ↓
   Sees elegant city selector card
   Location icon gently pulses

2. User hovers over Struga button
   ↓
   Button lifts up smoothly
   Blue glow appears
   Icon rotates slightly

3. User clicks Struga
   ↓
   Button scales down briefly (click feedback)
   Active state transitions smoothly
   Checkmark pops in with bounce
   Ohrid button reverts to white

4. Venues filter instantly
   ↓
   Only Struga venues show
   Categories update
   Search is scoped to Struga
```

---

## 🎨 Design Philosophy

### Principles Used

1. **Card-Based Design**
   - Modern, clean, contained
   - Clear visual hierarchy

2. **Subtle Animations**
   - Not distracting
   - Provide feedback
   - Feel premium

3. **Color Psychology**
   - Blue = Trust, reliability
   - Gradient = Modern, dynamic
   - White = Clean, simple

4. **Micro-interactions**
   - Hover feedback
   - Click animations
   - State transitions

5. **Accessibility**
   - High contrast ratios
   - Clear visual states
   - Keyboard navigable

---

## 📊 Comparison: Before & After

### Before
```
[ Ohrid ]  [ Struga ]
Simple text buttons
```

### After
```
╔══════════════════════════════════════╗
║      📍 Select Your City              ║
║  ┌────────────┐    ┌────────────┐   ║
║  │ 🏛️ Ohrid  ✓│    │ 🌊 Struga  │   ║
║  │ Pearl of... │    │ City of... │   ║
║  └────────────┘    └────────────┘   ║
╚══════════════════════════════════════╝
```

**Improvements:**
- ✅ Much more visual interest
- ✅ Clear selected state
- ✅ Professional appearance
- ✅ Better user guidance
- ✅ Memorable experience

---

This design creates a premium feel while remaining clean and functional! 🎉


































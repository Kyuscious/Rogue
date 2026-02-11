# Viewport & Scrolling Fix Documentation

**STATUS:** ✅ DONE - UI/viewport issues resolved  
**LAST UPDATED:** February 10, 2026

## Problems Identified

1. **Unwanted scrolling** on QuestSelect and other screens
2. **Height issues** - viewport was 110-120vh instead of 100vh
3. **CSS not loading on production build** (Render.com) - browser default styles being used
4. **Inconsistent styling** between local and production builds

## Solutions Implemented

### 1. Global CSS Reset (`src/styles/global.css`)

Created a comprehensive global reset that ensures:
- **No browser default styles** interfere with custom styling
- **Viewport fills exactly 100% of screen** without overflow
- **Consistent font smoothing** across all browsers
- **Scrollbars styled** for any necessary modal/popup scrolling
- **Input fields consistently styled** across browsers

**Key changes:**
```css
html {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#root {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
```

### 2. Updated Import Order (`src/main.tsx`)

Global CSS now loaded BEFORE App.css to establish base styles:
```tsx
import './styles/global.css'      // Global reset first
import './components/App.css'     // App-specific styles second
```

This ensures:
- Global reset doesn't override specific component styles
- Production builds maintain same styling as local
- No browser defaults seep through

### 3. Fixed QuestSelect Layout

Changed from `overflow-y: auto` to `overflow: hidden` on:
- `.quest-select` - removed scroll
- `.inventory-panel` - removed scroll
- `.quests-container` - removed scroll

Updated grid to fit content without scrolling:
```css
.quest-select {
  grid-template-rows: auto 1fr;  /* Character panel auto-size */
  gap: 12px;                      /* Reduced gap */
  overflow: hidden;               /* No scrolling */
}
```

Made text more compact:
- Quest cards: reduced padding (12px → 10px), font-size (default → 13px)
- Quest titles: smaller font (18px → 14px)
- Quest paths: single column grid, reduced padding

### 4. Fixed App.css

Removed duplicate/conflicting rules:
- Removed duplicate `* { margin, padding, box-sizing }` (now in global.css)
- Removed duplicate `#root` styling (now in global.css)
- Changed `height: 100vh` to `height: 100%` (viewport-relative)
- Removed `position: fixed; top: 0; left: 0` from body (breaks layouts)

Updated `.explore-screen`:
```css
.explore-screen {
  max-height: 100%;      /* Was 100vh */
  overflow: hidden;      /* Was overflow-y: auto */
}
```

## Production Build Compatibility

The global CSS reset ensures that:

✅ **Render.com and other hosting** will use your custom styles
✅ **No browser defaults** override styling
✅ **Consistent appearance** across Chrome, Firefox, Safari
✅ **No scrollbars** appear unexpectedly
✅ **Modals/popups** can still scroll internally if needed

## Result

### Local & Production Both Now Have:
- ✅ Viewport fills entire screen (100vh/100%)
- ✅ No unwanted scrollbars
- ✅ QuestSelect fits on screen without scrolling
- ✅ All sections visible simultaneously
- ✅ Consistent styling across browsers
- ✅ Scrolling only for intentional popups/modals

## CSS Hierarchy (Load Order)

```
1. Browser defaults (reset by our global.css)
2. global.css - Base reset, prevents browser styles
3. App.css - Component-specific app styles
4. Individual component CSS - Override as needed
```

## Key Principles Applied

1. **No scrolling by default** - only when explicitly needed
2. **Height = 100% not 100vh** - responsive to parent container
3. **Overflow hidden** - prevents unwanted scrollbars
4. **Explicit sizing** - don't rely on implicit height calculations
5. **Grid/Flex layouts** - natural fit-to-content behavior

## Testing Checklist

- ✅ No scrollbar on main screens
- ✅ QuestSelect all content visible
- ✅ Inventory, Spells, Weapons all visible
- ✅ Quest paths all visible
- ✅ Character status visible
- ✅ No unwanted overflow on battle screen
- ✅ No unwanted overflow on region selection
- ✅ No unwanted overflow on shop
- ✅ Styling consistent between local and production

## Future Considerations

When adding scrollable sections (e.g., event popups, credits):

```css
/* Scrollable popup example */
.modal {
  overflow-y: auto;           /* Allow scroll */
  max-height: 90vh;           /* Limit size */
  scrollbar-color: #4a9eff rgba(0, 0, 0, 0.3);  /* Custom scrollbar */
}
```

The global CSS already includes styled scrollbars, so any scrollable element will have consistent styling.

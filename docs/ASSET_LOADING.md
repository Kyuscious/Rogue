# Asset Loading System

This document explains the region-based asset loading system implemented in Runeterrogue.

## Architecture Overview

The game uses a **region-based asset loading** strategy to optimize memory usage and loading times. Assets are loaded and unloaded dynamically as players travel between regions.

## Folder Structure

```
public/
  assets/
    global/          # Always-loaded assets
      images/        # UI elements, common items
      audio/         # Menu sounds, button clicks
    regions/         # Region-specific assets
      demacia/
        images/      # Demacia backgrounds, enemies
        audio/       # Demacia music, battle themes
      noxus/
        images/      # Noxus backgrounds, enemies
        audio/       # Noxus music, battle themes
      ...other regions
```

## Key Components

### 1. Asset Loader (`src/game/assetLoader.ts`)

Core functions:
- `loadGlobalAssets()` - Load UI and common assets on app start
- `loadRegionAssets(region)` - Load assets for a specific region
- `unloadRegionAssets()` - Free memory by removing previous region's assets
- `preloadImage(src)` - Preload and cache an image
- `preloadAudio(src)` - Preload and cache an audio file

### 2. Loading Screen (`src/components/screens/LoadingScreen/`)

Visual feedback during asset loading:
- Progress bar (0-100%)
- Loading message
- Animated spinner
- Region name display

### 3. Integration in App.tsx

The `handleSelectRegion()` function:
1. Shows loading screen
2. Unloads previous region's assets
3. Loads new region's assets with progress updates
4. Transitions to quest selection

## Adding Assets

### Step 1: Add Files

Place your assets in the appropriate folder:
```bash
# For region-specific assets
public/assets/regions/demacia/images/background.jpg
public/assets/regions/demacia/audio/theme.mp3

# For global assets
public/assets/global/images/item-icon.svg
public/assets/global/audio/click.mp3
```

### Step 2: Register in Asset Manifest

Update `src/game/assetLoader.ts`:

```typescript
const REGION_ASSETS: Record<Region, RegionAssets> = {
  demacia: {
    images: [
      '/assets/regions/demacia/images/background.jpg',
      '/assets/regions/demacia/images/enemy-soldier.png',
      // Add more images here
    ],
    audio: [
      '/assets/regions/demacia/audio/theme.mp3',
      '/assets/regions/demacia/audio/battle.mp3',
      // Add more audio here
    ],
  },
  // ...other regions
};
```

### Step 3: Use in Components

Access loaded assets:
```typescript
import { getLoadedAsset, isAssetLoaded } from '../game/assetLoader';

// Check if loaded
if (isAssetLoaded('/assets/regions/demacia/images/background.jpg')) {
  const img = getLoadedAsset('/assets/regions/demacia/images/background.jpg');
  // Use the image
}
```

## Adding Item Images

### 1. Create the Image

Place item image in:
```
public/assets/global/images/item-{name}.svg
```

### 2. Update Item Definition

In `src/game/items.ts`, add `imagePath`:

```typescript
{
  id: 'dorans_blade',
  name: "Doran's Blade",
  description: '...',
  imagePath: '/assets/global/images/item-dorans-blade.svg',
  stats: { ... },
}
```

### 3. Display in UI

The PreGameSetup component automatically displays item images if `imagePath` is set.

## Performance Targets

- **Global assets**: 1-2 MB (always in memory)
- **Per-region assets**: 2-5 MB (loaded on demand)
- **Total in memory**: 3-7 MB at any time
- **Loading time**: < 2 seconds per region

## Benefits

✅ **Memory Efficiency**: Only current region's assets in memory  
✅ **Faster Initial Load**: Don't load all assets upfront  
✅ **Natural Loading Points**: Transitions between regions  
✅ **Scalable**: Can add unlimited regions without bloating memory  
✅ **Better UX**: Loading screen provides feedback during transitions  

## Future Enhancements

- [ ] Preload adjacent regions in background
- [ ] Add audio manager for music crossfading
- [ ] Implement asset compression
- [ ] Add loading screen tips/lore
- [ ] Cache assets in IndexedDB for offline support

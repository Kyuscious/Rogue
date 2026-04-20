# Asset Loading System

**STATUS:** ✅ DONE - Unified feature reference  
**LAST UPDATED:** April 19, 2026

## Overview
The game uses region-based asset loading to reduce memory usage and shorten startup cost. Global assets stay loaded, while region assets are loaded and unloaded as the player travels.

## Structure

```text
public/assets/
  global/   # always-available UI/common assets
  regions/  # per-region images and audio
```

## Core Pieces

### Asset Loader
Located in `src/game/assetLoader.ts`.

Main responsibilities:
- load global assets on app start
- preload region-specific images and audio
- unload old region assets when changing regions
- cache loaded assets for reuse

### Loading Screen
Located under `src/components/screens/LoadingScreen/`.

Provides:
- progress bar
- region loading message
- animated feedback during transitions

### App Integration
Region selection now:
1. shows the loading scene
2. unloads the prior region
3. loads new region assets with progress updates
4. transitions into gameplay

## Item Image Support
Item definitions can specify `imagePath`, allowing item icons to appear automatically in supported UI surfaces.

## Benefits
- lower memory footprint
- better scalability as regions expand
- clearer UX during transitions
- structured place for future art/audio additions

## Usage Checklist
- add assets to the correct `public/assets/...` folder
- register them in the region manifest in `assetLoader.ts`
- verify the loading screen and item art appear correctly in game

## Future Improvements
- preload nearby/next regions in the background
- add music crossfading
- compress assets further
- extend loading-screen tips or lore content

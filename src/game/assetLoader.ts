import { Region } from './types';

// Define asset manifests for each region
interface RegionAssets {
  images: string[];
  audio: string[];
}

const REGION_ASSETS: Record<Region, RegionAssets> = {
  demacia: {
    images: [
      '/assets/regions/demacia/images/background.jpg',
      '/assets/regions/demacia/images/enemy-soldier.png',
    ],
    audio: [
      '/assets/regions/demacia/audio/theme.mp3',
      '/assets/regions/demacia/audio/battle.mp3',
    ],
  },
  noxus: {
    images: [
      '/assets/regions/noxus/images/background.jpg',
      '/assets/regions/noxus/images/enemy-warrior.png',
    ],
    audio: [
      '/assets/regions/noxus/audio/theme.mp3',
      '/assets/regions/noxus/audio/battle.mp3',
    ],
  },
  freljord: {
    images: [],
    audio: [],
  },
  ionia: {
    images: [],
    audio: [],
  },
  piltover: {
    images: [],
    audio: [],
  },
  zaun: {
    images: [],
    audio: [],
  },
  'shadow_isles': {
    images: [],
    audio: [],
  },
  targon: {
    images: [],
    audio: [],
  },
  shurima: {
    images: [],
    audio: [],
  },
  bilgewater: {
    images: [],
    audio: [],
  },
  ixtal: {
    images: [],
    audio: [],
  },
  'bandle_city': {
    images: [],
    audio: [],
  },
  void: {
    images: [],
    audio: [],
  },
  camavor: {
    images: [],
    audio: [],
  },
  ice_sea: {
    images: [],
    audio: [],
  },
  marai_territory: {
    images: [],
    audio: [],
  },
  runeterra: {
    images: [],
    audio: [],
  },
};

// Global assets that are always loaded
const GLOBAL_ASSETS = {
  images: [
    '/assets/global/images/ui-icons.png',
    '/assets/global/images/item-dorans-blade.svg',
  ],
  audio: [
    '/assets/global/audio/menu-theme.mp3',
    '/assets/global/audio/click.mp3',
  ],
};

// Store loaded assets to prevent duplicate loading
const loadedAssets = new Map<string, HTMLImageElement | HTMLAudioElement>();
let currentRegionAssets: string[] = [];

/**
 * Preload an image and cache it
 */
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    // Return cached image if already loaded
    if (loadedAssets.has(src)) {
      resolve(loadedAssets.get(src) as HTMLImageElement);
      return;
    }

    const img = new Image();
    img.onload = () => {
      loadedAssets.set(src, img);
      resolve(img);
    };
    img.onerror = () => {
      console.warn(`Failed to load image: ${src}`);
      resolve(img); // Resolve anyway to not block loading
    };
    img.src = src;
  });
};

/**
 * Preload an audio file and cache it
 */
export const preloadAudio = (src: string): Promise<HTMLAudioElement> => {
  return new Promise((resolve) => {
    // Return cached audio if already loaded
    if (loadedAssets.has(src)) {
      resolve(loadedAssets.get(src) as HTMLAudioElement);
      return;
    }

    const audio = new Audio();
    audio.oncanplaythrough = () => {
      loadedAssets.set(src, audio);
      resolve(audio);
    };
    audio.onerror = () => {
      console.warn(`Failed to load audio: ${src}`);
      resolve(audio); // Resolve anyway to not block loading
    };
    audio.src = src;
  });
};

/**
 * Load all global assets (call this once at app start)
 */
export const loadGlobalAssets = async (
  onProgress?: (progress: number, message: string) => void
): Promise<void> => {
  const allAssets = [...GLOBAL_ASSETS.images, ...GLOBAL_ASSETS.audio];
  const total = allAssets.length;
  let loaded = 0;

  for (const asset of GLOBAL_ASSETS.images) {
    await preloadImage(asset);
    loaded++;
    if (onProgress) {
      onProgress((loaded / total) * 100, `Loading UI assets...`);
    }
  }

  for (const asset of GLOBAL_ASSETS.audio) {
    await preloadAudio(asset);
    loaded++;
    if (onProgress) {
      onProgress((loaded / total) * 100, `Loading audio...`);
    }
  }
};

/**
 * Load all assets for a specific region
 */
export const loadRegionAssets = async (
  region: Region,
  onProgress?: (progress: number, message: string) => void
): Promise<void> => {
  const assets = REGION_ASSETS[region];
  if (!assets) {
    console.warn(`No assets defined for region: ${region}`);
    return;
  }

  const allAssets = [...assets.images, ...assets.audio];
  const total = allAssets.length;
  
  if (total === 0) {
    // No assets for this region yet (placeholder)
    if (onProgress) {
      onProgress(100, 'Region ready!');
    }
    return;
  }

  let loaded = 0;

  // Load images
  for (const imagePath of assets.images) {
    await preloadImage(imagePath);
    loaded++;
    currentRegionAssets.push(imagePath);
    if (onProgress) {
      onProgress((loaded / total) * 100, `Loading ${region} visuals...`);
    }
  }

  // Load audio
  for (const audioPath of assets.audio) {
    await preloadAudio(audioPath);
    loaded++;
    currentRegionAssets.push(audioPath);
    if (onProgress) {
      onProgress((loaded / total) * 100, `Loading ${region} audio...`);
    }
  }
};

/**
 * Unload current region's assets to free memory
 */
export const unloadRegionAssets = (): void => {
  for (const assetPath of currentRegionAssets) {
    loadedAssets.delete(assetPath);
  }
  currentRegionAssets = [];
  
  // Browser will handle garbage collection automatically
};

/**
 * Get a loaded asset by path
 */
export const getLoadedAsset = (path: string): HTMLImageElement | HTMLAudioElement | undefined => {
  return loadedAssets.get(path);
};

/**
 * Check if an asset is loaded
 */
export const isAssetLoaded = (path: string): boolean => {
  return loadedAssets.has(path);
};

/**
 * Get the total number of loaded assets
 */
export const getLoadedAssetCount = (): number => {
  return loadedAssets.size;
};

/**
 * Profile System
 * Tracks player progress across multiple save slots
 */

export interface ProfileStats {
  battlesWon: number;
  enemiesKilled: number; // Total enemies killed across all runs
  gamesCompleted: number;
  runsFailed: number;
  itemsDiscovered: string[]; // Array of discovered item IDs
  discoveredConnections: string[]; // Array of "from-to" connections (e.g., "demacia-noxus")
  discoveredQuests: string[]; // Array of discovered quest IDs
  discoveredShopItems: string[]; // Array of discovered shop item names per region
  discoveredEnemies: string[]; // Array of discovered enemy IDs
  visitedRegions: string[]; // Array of region IDs that have been visited at least once
  unlockedItems: string[]; // Array of unlocked item IDs (for items with unlock requirements)
  hoursPlayed: number; // Total hours played
  lastPlayedTimestamp: number; // Timestamp of last session
  achievementsDisabled: boolean; // True if "Unlock All" was used
}

export interface PlayerProfile {
  id: number;
  name: string;
  stats: ProfileStats;
  createdAt: number; // Timestamp of profile creation
}

const DEFAULT_PROFILE_STATS: ProfileStats = {
  battlesWon: 0,
  enemiesKilled: 0,
  gamesCompleted: 0,
  runsFailed: 0,
  itemsDiscovered: [],
  discoveredConnections: [],
  discoveredQuests: [],
  discoveredShopItems: [],
  discoveredEnemies: [],
  visitedRegions: [],
  unlockedItems: [], // Initialize with empty array
  hoursPlayed: 0,
  lastPlayedTimestamp: Date.now(),
  achievementsDisabled: false,
};

/**
 * Create a new profile with default stats
 */
export function createProfile(id: number, name?: string): PlayerProfile {
  return {
    id,
    name: name || `Profile ${id}`,
    stats: { ...DEFAULT_PROFILE_STATS },
    createdAt: Date.now(),
  };
}

/**
 * Load all profiles from localStorage
 */
export function loadProfiles(): PlayerProfile[] {
  const stored = localStorage.getItem('playerProfiles');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse profiles:', e);
    }
  }
  
  // Initialize with 3 default profiles
  const defaultProfiles = [
    createProfile(1),
    createProfile(2),
    createProfile(3),
  ];
  saveProfiles(defaultProfiles);
  return defaultProfiles;
}

/**
 * Save all profiles to localStorage
 */
export function saveProfiles(profiles: PlayerProfile[]): void {
  localStorage.setItem('playerProfiles', JSON.stringify(profiles));
}

/**
 * Get the active profile ID from localStorage
 */
export function getActiveProfileId(): number {
  const stored = localStorage.getItem('activeProfileId');
  return stored ? parseInt(stored, 10) : 1;
}

/**
 * Set the active profile ID in localStorage
 */
export function setActiveProfileId(profileId: number): void {
  localStorage.setItem('activeProfileId', profileId.toString());
}

/**
 * Get the active profile
 */
export function getActiveProfile(): PlayerProfile {
  const profiles = loadProfiles();
  const activeId = getActiveProfileId();
  return profiles.find(p => p.id === activeId) || profiles[0];
}

/**
 * Update a specific profile
 */
export function updateProfile(profileId: number, updates: Partial<PlayerProfile>): void {
  const profiles = loadProfiles();
  const index = profiles.findIndex(p => p.id === profileId);
  if (index !== -1) {
    profiles[index] = { ...profiles[index], ...updates };
    saveProfiles(profiles);
  }
}

/**
 * Reset a profile to default stats
 */
export function resetProfile(profileId: number): void {
  const profiles = loadProfiles();
  const index = profiles.findIndex(p => p.id === profileId);
  if (index !== -1) {
    profiles[index] = {
      ...profiles[index],
      stats: { ...DEFAULT_PROFILE_STATS, lastPlayedTimestamp: Date.now() },
    };
    saveProfiles(profiles);
  }
}

/**
 * Rename a profile
 */
export function renameProfile(profileId: number, newName: string): void {
  updateProfile(profileId, { name: newName });
}

/**
 * Increment battles won for active profile
 */
export function incrementBattlesWon(): void {
  const profile = getActiveProfile();
  updateProfile(profile.id, {
    stats: {
      ...profile.stats,
      battlesWon: profile.stats.battlesWon + 1,
      lastPlayedTimestamp: Date.now(),
    },
  });
}

/**
 * Increment enemies killed for active profile
 */
export function incrementEnemiesKilled(): void {
  const profile = getActiveProfile();
  updateProfile(profile.id, {
    stats: {
      ...profile.stats,
      enemiesKilled: profile.stats.enemiesKilled + 1,
      lastPlayedTimestamp: Date.now(),
    },
  });
}

/**
 * Increment games completed for active profile
 */
export function incrementGamesCompleted(): void {
  const profile = getActiveProfile();
  updateProfile(profile.id, {
    stats: {
      ...profile.stats,
      gamesCompleted: profile.stats.gamesCompleted + 1,
      lastPlayedTimestamp: Date.now(),
    },
  });
}

/**
 * Increment runs failed for active profile
 */
export function incrementRunsFailed(): void {
  const profile = getActiveProfile();
  updateProfile(profile.id, {
    stats: {
      ...profile.stats,
      runsFailed: profile.stats.runsFailed + 1,
      lastPlayedTimestamp: Date.now(),
    },
  });
}

/**
 * Discover a new item (add to discovered items list)
 */
export function discoverItem(itemId: string): void {
  const profile = getActiveProfile();
  if (!profile.stats.itemsDiscovered.includes(itemId)) {
    updateProfile(profile.id, {
      stats: {
        ...profile.stats,
        itemsDiscovered: [...profile.stats.itemsDiscovered, itemId],
        lastPlayedTimestamp: Date.now(),
      },
    });
  }
}

/**
 * Discover a new region connection (add to discovered connections list)
 * Connection format: "from-to" (e.g., "demacia-noxus")
 */
export function discoverConnection(fromRegion: string, toRegion: string): void {
  const profile = getActiveProfile();
  const connectionKey = `${fromRegion}-${toRegion}`;
  
  // Initialize discoveredConnections if it doesn't exist (backward compatibility)
  const discoveredConnections = profile.stats.discoveredConnections || [];
  
  if (!discoveredConnections.includes(connectionKey)) {
    updateProfile(profile.id, {
      stats: {
        ...profile.stats,
        discoveredConnections: [...discoveredConnections, connectionKey],
        lastPlayedTimestamp: Date.now(),
      },
    });
  }
}

/**
 * Check if a region connection has been discovered
 */
export function isConnectionDiscovered(fromRegion: string, toRegion: string): boolean {
  const profile = getActiveProfile();
  const connectionKey = `${fromRegion}-${toRegion}`;
  // Handle profiles that don't have discoveredConnections yet (backward compatibility)
  if (!profile.stats.discoveredConnections) {
    return false;
  }
  return profile.stats.discoveredConnections.includes(connectionKey);
}

/**
 * Mark a region as visited (for unlock tracking)
 */
export function visitRegion(regionId: string): void {
  const profile = getActiveProfile();
  
  // Initialize visitedRegions if it doesn't exist (backward compatibility)
  const visitedRegions = profile.stats.visitedRegions || [];
  
  if (!visitedRegions.includes(regionId)) {
    updateProfile(profile.id, {
      stats: {
        ...profile.stats,
        visitedRegions: [...visitedRegions, regionId],
        lastPlayedTimestamp: Date.now(),
      },
    });
  }
}

/**
 * Get the count of visited regions for unlock progress
 */
export function getVisitedRegionsCount(): number {
  const profile = getActiveProfile();
  return profile.stats.visitedRegions?.length || 0;
}

/**
 * Update hours played for active profile
 * Call this periodically during gameplay
 */
export function updatePlayTime(additionalHours: number): void {
  const profile = getActiveProfile();
  updateProfile(profile.id, {
    stats: {
      ...profile.stats,
      hoursPlayed: profile.stats.hoursPlayed + additionalHours,
      lastPlayedTimestamp: Date.now(),
    },
  });
}

/**
 * Calculate play time since last session
 * Returns hours played in current session
 */
export function calculateSessionPlayTime(): number {
  const profile = getActiveProfile();
  const now = Date.now();
  const lastPlayed = profile.stats.lastPlayedTimestamp;
  const millisPlayed = now - lastPlayed;
  return millisPlayed / (1000 * 60 * 60); // Convert to hours
}

/**
 * Format hours played to display string
 */
export function formatPlayTime(hours: number): string {
  if (hours < 1) {
    const minutes = Math.floor(hours * 60);
    return `${minutes}m`;
  } else if (hours < 10) {
    return `${hours.toFixed(1)}h`;
  } else {
    return `${Math.floor(hours)}h`;
  }
}

/**
 * Check if a profile has a run in progress
 */
export function hasRunInProgress(profileId: number): boolean {
  const savedRun = localStorage.getItem('savedRun');
  if (!savedRun) return false;
  
  try {
    const parsedRun = JSON.parse(savedRun);
    // Check if the saved run belongs to this profile and is valid
    const savedProfileId = parsedRun.profileId || 1; // Default to profile 1 for old saves
    return savedProfileId === profileId && parsedRun.currentFloor >= 0;
  } catch {
    return false;
  }
}

/**
 * Unlock all content for a profile (100% save file)
 * Disables achievements for this profile
 */
export function unlockAllContent(profileId: number): void {
  const profiles = loadProfiles();
  const profile = profiles.find(p => p.id === profileId);
  if (!profile) return;

  // Get all item IDs from ITEM_DATABASE
  const allItemIds = [
    // Starter items
    'dorans_blade', 'dorans_ring', 'dorans_shield',
    // Common items
    'health_potion', 'cloth_armor', 'amplifying_tome', 'long_sword', 'ruby_crystal',
    'sapphire_crystal', 'rejuvenation_bead', 'boots',
    // Epic items
    'vampiric_scepter', 'chain_vest', 'null_magic_mantle', 'pickaxe', 'needlessly_large_rod',
    'giants_belt', 'blasting_wand', 'bf_sword', 'recurve_bow', 'cloak_of_agility',
    // Legendary items
    'infinity_edge', 'rabadons_deathcap', 'blade_of_the_ruined_king', 'zhonyas_hourglass',
    'guardian_angel', 'warmogs_armor', 'trinity_force', 'runaans_hurricane',
    // Mythic items
    'ludens_tempest', 'eclipse', 'immortal_shieldbow', 'sunfire_aegis',
    // Ultimate items  
    'nashors_tooth', 'lich_bane', 'rylais_crystal_scepter', 'banshees_veil',
    // Exalted items
    'mejais_soulstealer', 'dark_seal', 'tear_of_the_goddess', 'seraphs_embrace',
    // Transcendent items
    'Staff of Ages'
  ];

  // Get all region connections
  const allConnections = [
    // Starting regions
    'demacia-noxus', 'demacia-freljord',
    'ionia-bandle_city', 'ionia-bilgewater',
    'shurima-ixtal', 'shurima-zaun',
    // Intermediate regions
    'noxus-freljord', 'noxus-piltover',
    'freljord-targon', 'freljord-zaun',
    'zaun-ixtal', 'zaun-piltover',
    'ixtal-void', 'ixtal-bandle_city',
    'bandle_city-piltover', 'bandle_city-bilgewater',
    'bilgewater-shadow_isles', 'bilgewater-noxus',
    // Piltover teleporter
    'piltover-demacia', 'piltover-ionia', 'piltover-shurima',
    // Ending regions
    'shadow_isles-ionia', 'shadow_isles-demacia',
    'void-shurima', 'void-ionia',
    'targon-demacia', 'targon-shurima',
  ];

  updateProfile(profileId, {
    stats: {
      ...profile.stats,
      itemsDiscovered: allItemIds,
      discoveredConnections: allConnections,
      unlockedItems: allItemIds, // Unlock all items too
      achievementsDisabled: true,
    }
  });
}

/**
 * Check if an item is unlocked for the active profile
 * Items without unlock requirements are always available
 */
export function isItemUnlocked(itemId: string): boolean {
  const profile = getActiveProfile();
  
  // Achievements disabled means everything is unlocked
  if (profile.stats.achievementsDisabled) {
    return true;
  }
  
  // Initialize unlockedItems if it doesn't exist (backward compatibility)
  const unlockedItems = profile.stats.unlockedItems || [];
  
  return unlockedItems.includes(itemId);
}

/**
 * Unlock an item for the active profile
 */
export function unlockItem(itemId: string): void {
  const profile = getActiveProfile();
  
  // Initialize unlockedItems if it doesn't exist (backward compatibility)
  const unlockedItems = profile.stats.unlockedItems || [];
  
  if (!unlockedItems.includes(itemId)) {
    updateProfile(profile.id, {
      stats: {
        ...profile.stats,
        unlockedItems: [...unlockedItems, itemId],
        lastPlayedTimestamp: Date.now(),
      },
    });
    console.log(`🔓 Item unlocked: ${itemId}`);
  }
}


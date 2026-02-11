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

  // Get all item IDs from ITEM_DATABASE (complete list of 87 items)
  const allItemIds = [
    // Starter items
    'dorans_blade', 'dorans_shield', 'dorans_ring', 'cull', 'world_atlas', 'dark_seal', 'tear_of_the_goddess',
    // Consumables
    'health_potion', 'flashbomb_trap', 'stealth_ward', 'control_ward', 'oracle_lens', 'farsight_alteration', 'poro_snax',
    // Common items
    'long_sword', 'cloth_armor', 'amplifying_tome', 'ruby_crystal', 'sapphire_crystal', 'fearie_charm', 'dagger',
    'rejuvenation_bead', 'boots', 'pickaxe', 'null_magic_mantle', 'blasting_wand', 'bf_sword', 'cloak_of_agility', 'glowing_mote',
    // Epic consumables
    'elixir_of_iron', 'elixir_of_sorcery', 'elixir_of_wrath',
    // Epic items
    'aether_wisp', 'bamis_cinder', 'bandleglass_mirror', 'blighting_jewel', 'bramble_vest', 'catalyst_of_aeons',
    'caufields_warhammer', 'chain_vest', 'crystalline_bracer', 'executioners_calling', 'fated_ashes', 'fiendish_codex',
    'forbidden_idol', 'giants_belt', 'glacial_buckler', 'haunting_guise', 'heartbound_axe', 'hexdrinker',
    'hextech_alternator', 'kindlegem', 'last_whisper', 'lifeline', 'lost_chapter', 'negatron_cloak', 'noonquiver',
    'oblivion_orb', 'phage', 'quicksilver_sash', 'rectrix', 'recurve_bow', 'scouts_slingshot', 'seekers_armguard',
    'serrated_dirk', 'sheen', 'spectre_cowl', 'steel_sigil', 'the_brutalizer', 'tiamat', 'tunneler', 'vampiric_scepter',
    'verdant_barrier', 'wardens_mail', 'winged_moonplate', 'zeal',
    // Legendary items
    'mejais_soulstealer', 'infinity_edge', 'abyssal_mask', 'nashor_tooth', 'trinity_force', 'rabadons_deathcap',
    'kaenic_rookern', 'warmogs_armor', 'lich_bane', 'guardian_angel', 'chalicar'
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

  // Get all enemy IDs
  const allEnemyIds = [
    'demacia_soldier', 'demacia_scout', 'demacia_guard', 'demacia_wild_boar', 'demacia_general',
    'demacia_silverwing_knight', 'demacia_crag_beast', 'demacia_crag_elder', 'demacia_mageseeker',
    'demacia_warhorse_commander', 'garen', 'ionia_spirit_walker', 'ionia_shadow_assassin',
    'ionia_kinkou_ninja', 'ionia_vastayan_hunter', 'ionia_forest_spirit', 'ionia_master_swordsman',
    'ionia_spirit_blossom', 'ionia_vastayan_elder', 'ionia_shadow_reaper', 'ionia_ancient_spirit',
    'ionia_wuju_bladesman', 'yasuo', 'ahri', 'shurima_sand_soldier', 'shurima_tomb_guardian',
    'shurima_desert_nomad', 'shurima_sand_scarab', 'shurima_sun_priest', 'shurima_ascended_warrior',
    'shurima_sun_disc_keeper', 'shurima_xer_sai_tunneler', 'shurima_emperor_construct',
    'shurima_desert_tyrant', 'shurima_sun_guardian', 'nasus', 'azir', 'noxus_legionnaire',
    'noxus_raider', 'noxus_executioner', 'noxus_battle_mage', 'noxus_warmonger', 'noxus_crimson_elite',
    'noxus_blood_ritualist', 'noxus_trifarian_captain', 'noxus_war_general', 'noxus_warlord',
    'noxus_master_assassin', 'darius', 'katarina', 'freljord_warrior', 'freljord_elite',
    'freljord_boss', 'zaun_chemtech', 'zaun_enforcer', 'zaun_boss', 'ixtal_warrior', 'ixtal_shaman',
    'ixtal_boss', 'bandle_poro', 'bandle_soldier', 'bandle_elite', 'bandle_boss', 'bilgewater_pirate',
    'bilgewater_captain', 'bilgewater_boss', 'piltover_guard', 'piltover_officer', 'piltover_boss',
    'shadow_isles_undead', 'shadow_isles_spectre', 'shadow_isles_boss', 'void_creature',
    'void_spawn', 'void_boss', 'targon_celestial', 'targon_guardian', 'targon_boss',
    'camavor_wraith', 'camavor_knight', 'camavor_viego', 'marai_tidecaller', 'marai_warrior',
    'marai_scout', 'marai_wave_bearer', 'marai_deep_guardian', 'marai_siren_warden',
    'marai_leviathan', 'ice_sea_frostborn', 'ice_sea_glacial_mage', 'ice_sea_frost_archer',
    'ice_sea_blizzard_knight', 'ice_sea_frost_sorcerer', 'ice_sea_frost_tyrant',
    'ice_sea_eternal_winter', 'runeterra_bandit', 'runeterra_mercenary', 'runeterra_void_spawn',
    'runeterra_dragon_whelp', 'runeterra_rogue_mage', 'runeterra_elder_dragon', 'runeterra_void_hunter',
    'runeterra_warlord', 'runeterra_ancient_dragon', 'runeterra_void_terror', 'runeterra_bandit_king',
    'janna', 'brand', 'ryze'
  ];

  // Get all quest IDs
  const allQuestIds = [
    'demacia_path_1', 'demacia_path_1_safe', 'demacia_path_1_balanced', 'demacia_path_1_risky',
    'demacia_path_2', 'demacia_path_2_safe', 'demacia_path_2_balanced', 'demacia_path_2_risky',
    'demacia_path_3', 'demacia_path_3_safe', 'demacia_path_3_balanced', 'demacia_path_3_risky',
    'demacia_path_4', 'demacia_path_4_safe', 'demacia_path_4_balanced', 'demacia_path_4_risky',
    'demacia_path_5', 'demacia_path_5_safe', 'demacia_path_5_balanced', 'demacia_path_5_risky',
    'ionia_path_1', 'ionia_path_1_safe', 'ionia_path_1_balanced', 'ionia_path_1_risky',
    'ionia_path_2', 'ionia_path_2_safe', 'ionia_path_2_balanced', 'ionia_path_2_risky',
    'ionia_path_3', 'ionia_path_3_safe', 'ionia_path_3_balanced', 'ionia_path_3_risky',
    'ionia_path_4', 'ionia_path_4_safe', 'ionia_path_4_balanced', 'ionia_path_4_risky',
    'ionia_path_5', 'ionia_path_5_safe', 'ionia_path_5_balanced', 'ionia_path_5_risky',
    'shurima_path_1', 'shurima_path_1_safe', 'shurima_path_1_balanced', 'shurima_path_1_risky',
    'shurima_path_2', 'shurima_path_2_safe', 'shurima_path_2_balanced', 'shurima_path_2_risky',
    'shurima_path_3', 'shurima_path_3_safe', 'shurima_path_3_balanced', 'shurima_path_3_risky',
    'shurima_path_4', 'shurima_path_4_safe', 'shurima_path_4_balanced', 'shurima_path_4_risky',
    'shurima_path_5', 'shurima_path_5_safe', 'shurima_path_5_balanced', 'shurima_path_5_risky',
    'noxus_path_1', 'noxus_path_1_safe', 'noxus_path_1_balanced', 'noxus_path_1_risky',
    'noxus_path_2', 'noxus_path_2_safe', 'noxus_path_2_balanced', 'noxus_path_2_risky',
    'noxus_path_3', 'noxus_path_3_safe', 'noxus_path_3_balanced', 'noxus_path_3_risky',
    'freljord_path_1', 'freljord_path_1_safe', 'freljord_path_1_risky',
    'zaun_path_1', 'zaun_path_1_safe', 'zaun_path_1_risky',
    'ixtal_path_1', 'ixtal_path_1_safe', 'ixtal_path_1_risky',
    'bandle_city_path_1', 'bandle_city_path_1_safe', 'bandle_city_path_1_risky',
    'bilgewater_path_1', 'bilgewater_path_1_safe', 'bilgewater_path_1_risky',
    'piltover_path_1', 'piltover_path_1_safe', 'piltover_path_1_risky',
    'shadow_isles_path_1', 'shadow_isles_path_1_safe', 'shadow_isles_path_1_risky',
    'void_path_1', 'void_path_1_safe', 'void_path_1_risky',
    'targon_path_1', 'targon_path_1_safe', 'targon_path_1_risky',
    'camavor_path_1', 'camavor_path_1_safe', 'camavor_path_1_balanced', 'camavor_path_1_risky',
    'marai_path_1', 'marai_path_1_safe', 'marai_path_1_balanced', 'marai_path_1_risky',
    'marai_path_2', 'marai_path_2_safe', 'marai_path_2_balanced', 'marai_path_2_risky',
    'ice_sea_path_1', 'ice_sea_path_1_safe', 'ice_sea_path_1_balanced', 'ice_sea_path_1_risky',
    'ice_sea_path_2', 'ice_sea_path_2_safe', 'ice_sea_path_2_balanced', 'ice_sea_path_2_risky'
  ];

  // Get all regions
  const allRegions = [
    'demacia', 'ionia', 'shurima', 'noxus', 'freljord', 'zaun', 'ixtal', 'bandle_city',
    'bilgewater', 'piltover', 'shadow_isles', 'void', 'targon', 'camavor', 'ice_sea',
    'marai_territory', 'runeterra'
  ];

  // Get all shop items (region:item combinations)
  const allShopItems: string[] = [];
  const shopItemTypes = ['cloth_armor', 'health_potion', 'random_items'];
  allRegions.forEach(region => {
    shopItemTypes.forEach(itemType => {
      allShopItems.push(`${region}:${itemType}`);
    });
  });

  updateProfile(profileId, {
    stats: {
      ...profile.stats,
      itemsDiscovered: allItemIds,
      discoveredConnections: allConnections,
      discoveredEnemies: allEnemyIds,
      discoveredQuests: allQuestIds,
      discoveredShopItems: allShopItems,
      visitedRegions: allRegions,
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


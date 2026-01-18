/**
 * Profile Unlockables System
 * Tracks unlocked content per profile (starter items, characters, etc.)
 * Designed to be easily exportable for remote sync in the future
 */

import { getActiveProfile } from './profileSystem';

export interface UnlockRequirement {
  type: 'battles_won' | 'regions_visited' | 'items_discovered' | 'games_completed';
  value: number;
  description: string;
}

export interface UnlockableItem {
  id: string;
  name: string;
  category: 'starter_item' | 'character' | 'feature';
  requirement: UnlockRequirement;
  isUnlocked: (stats: any) => boolean;
  getProgress: (stats: any) => { current: number; required: number };
}

/**
 * Registry of all unlockable content
 * Add new unlockables here as they're implemented
 */
export const UNLOCKABLES: Record<string, UnlockableItem> = {
  // STARTER ITEMS
  dorans_blade: {
    id: 'dorans_blade',
    name: "Doran's Blade",
    category: 'starter_item',
    requirement: {
      type: 'battles_won',
      value: 0,
      description: 'Available from the start',
    },
    isUnlocked: () => true,
    getProgress: () => ({ current: 1, required: 1 }),
  },
  
  dorans_shield: {
    id: 'dorans_shield',
    name: "Doran's Shield",
    category: 'starter_item',
    requirement: {
      type: 'battles_won',
      value: 0,
      description: 'Available from the start',
    },
    isUnlocked: () => true,
    getProgress: () => ({ current: 1, required: 1 }),
  },
  
  dorans_ring: {
    id: 'dorans_ring',
    name: "Doran's Ring",
    category: 'starter_item',
    requirement: {
      type: 'battles_won',
      value: 0,
      description: 'Available from the start',
    },
    isUnlocked: () => true,
    getProgress: () => ({ current: 1, required: 1 }),
  },
  
  cull: {
    id: 'cull',
    name: 'Cull',
    category: 'starter_item',
    requirement: {
      type: 'battles_won',
      value: 100,
      description: 'Win 100 battles',
    },
    isUnlocked: (stats) => (stats.battlesWon || 0) >= 100,
    getProgress: (stats) => ({ 
      current: stats.battlesWon || 0, 
      required: 100
    }),
  },
  
  world_atlas: {
    id: 'world_atlas',
    name: 'World Atlas',
    category: 'starter_item',
    requirement: {
      type: 'regions_visited',
      value: 14,
      description: 'Visit all 14 regions',
    },
    isUnlocked: (stats) => (stats.visitedRegions?.length || 0) >= 14,
    getProgress: (stats) => ({ 
      current: stats.visitedRegions?.length || 0, 
      required: 14 
    }),
  },
  
  dark_seal: {
    id: 'dark_seal',
    name: 'Dark Seal',
    category: 'starter_item',
    requirement: {
      type: 'items_discovered', // Reusing type; actual check is custom
      value: 150,
      description: 'Reach 150 Ability Power in a single run',
    },
    isUnlocked: (stats) => {
      // Check if item is in the unlockedItems array
      const unlockedItems = stats.unlockedItems || [];
      return unlockedItems.includes('dark_seal');
    },
    getProgress: (stats) => {
      // Progress can't be tracked from profile stats (it's per-run)
      // Return completed or 0/150
      const unlockedItems = stats.unlockedItems || [];
      return {
        current: unlockedItems.includes('dark_seal') ? 150 : 0,
        required: 150
      };
    },
  },
};

/**
 * Check if an item is unlocked for the active profile
 */
export function isItemUnlocked(itemId: string): boolean {
  const unlockable = UNLOCKABLES[itemId];
  if (!unlockable) return false;
  
  const profile = getActiveProfile();
  return unlockable.isUnlocked(profile.stats);
}

/**
 * Get unlock progress for an item
 */
export function getUnlockProgress(itemId: string): { current: number; required: number } | null {
  const unlockable = UNLOCKABLES[itemId];
  if (!unlockable) return null;
  
  const profile = getActiveProfile();
  return unlockable.getProgress(profile.stats);
}

/**
 * Get all unlockable starter items with their unlock status
 */
export function getStarterItemsWithUnlockStatus(): Array<{
  id: string;
  name: string;
  unlocked: boolean;
  unlockProgress?: string;
  requirement: UnlockRequirement;
}> {
  const profile = getActiveProfile();
  
  return Object.values(UNLOCKABLES)
    .filter(u => u.category === 'starter_item')
    .map(unlockable => {
      const progress = unlockable.getProgress(profile.stats);
      const unlocked = unlockable.isUnlocked(profile.stats);
      
      return {
        id: unlockable.id,
        name: unlockable.name,
        unlocked,
        unlockProgress: unlocked ? undefined : `${progress.current}/${progress.required}`,
        requirement: unlockable.requirement,
      };
    });
}

/**
 * Export profile unlocks data for remote sync
 * Returns a JSON-serializable object that can be sent to a server
 */
export function exportProfileUnlocks(profileId: number): any {
  const profiles = JSON.parse(localStorage.getItem('playerProfiles') || '[]');
  const profile = profiles.find((p: any) => p.id === profileId);
  
  if (!profile) return null;
  
  return {
    profileId: profile.id,
    profileName: profile.name,
    stats: profile.stats,
    unlockedItems: Object.keys(UNLOCKABLES)
      .filter(itemId => {
        const unlockable = UNLOCKABLES[itemId];
        return unlockable.isUnlocked(profile.stats);
      }),
    exportedAt: Date.now(),
    version: '1.0.0', // For future compatibility
  };
}

/**
 * Import profile unlocks data from remote sync
 * Merges remote data with local data (takes the higher progress)
 */
export function importProfileUnlocks(data: any): void {
  if (!data || !data.profileId) {
    throw new Error('Invalid unlock data');
  }
  
  const profiles = JSON.parse(localStorage.getItem('playerProfiles') || '[]');
  const profileIndex = profiles.findIndex((p: any) => p.id === data.profileId);
  
  if (profileIndex === -1) {
    throw new Error('Profile not found');
  }
  
  // Merge stats - take the higher value for each stat
  const localStats = profiles[profileIndex].stats;
  const remoteStats = data.stats;
  
  profiles[profileIndex].stats = {
    battlesWon: Math.max(localStats.battlesWon || 0, remoteStats.battlesWon || 0),
    enemiesKilled: Math.max(localStats.enemiesKilled || 0, remoteStats.enemiesKilled || 0),
    gamesCompleted: Math.max(localStats.gamesCompleted || 0, remoteStats.gamesCompleted || 0),
    runsFailed: Math.max(localStats.runsFailed || 0, remoteStats.runsFailed || 0),
    hoursPlayed: Math.max(localStats.hoursPlayed || 0, remoteStats.hoursPlayed || 0),
    // For arrays, merge and deduplicate
    itemsDiscovered: [...new Set([...(localStats.itemsDiscovered || []), ...(remoteStats.itemsDiscovered || [])])],
    discoveredConnections: [...new Set([...(localStats.discoveredConnections || []), ...(remoteStats.discoveredConnections || [])])],
    discoveredQuests: [...new Set([...(localStats.discoveredQuests || []), ...(remoteStats.discoveredQuests || [])])],
    discoveredShopItems: [...new Set([...(localStats.discoveredShopItems || []), ...(remoteStats.discoveredShopItems || [])])],
    discoveredEnemies: [...new Set([...(localStats.discoveredEnemies || []), ...(remoteStats.discoveredEnemies || [])])],
    visitedRegions: [...new Set([...(localStats.visitedRegions || []), ...(remoteStats.visitedRegions || [])])],
    lastPlayedTimestamp: Math.max(localStats.lastPlayedTimestamp || 0, remoteStats.lastPlayedTimestamp || 0),
    achievementsDisabled: localStats.achievementsDisabled || remoteStats.achievementsDisabled,
  };
  
  localStorage.setItem('playerProfiles', JSON.stringify(profiles));
}

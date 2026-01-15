import { Region } from './types';
import { getItemById } from './items';
import { InventoryItem } from './types';

/**
 * Reward pools organized by region, enemy tier, and floor progression
 * This centralizes all reward generation logic for milestone floors
 */

export interface RewardPoolConfig {
  elite: string[]; // Floors 5-9
  boss: string[];  // Floors 10+
}

/**
 * Region-specific reward pools
 * Each region has thematic items that fit its lore
 */
export const REGION_REWARD_POOLS: Record<Region, RewardPoolConfig> = {
  demacia: {
    elite: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
    boss: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
  },
  ionia: {
    elite: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
    boss: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
  },
  shurima: {
    elite: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
    boss: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
  },
  noxus: {
    elite: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
    boss: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
  },
  freljord: {
    elite: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
    boss: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
  },
  zaun: {
    elite: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
    boss: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
  },
  ixtal: {
    elite: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
    boss: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
  },
  bandle_city: {
    elite: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
    boss: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
  },
  bilgewater: {
    elite: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
    boss: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
  },
  piltover: {
    elite: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
    boss: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
  },
  shadow_isles: {
    elite: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
    boss: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
  },
  void: {
    elite: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
    boss: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
  },
  targon: {
    elite: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
    boss: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
  },
};

/**
 * Default reward pool when no region is selected
 */
const DEFAULT_REWARD_POOL: RewardPoolConfig = {
  elite: [
    'long_sword',
    'cloth_armor',
    'health_potion',
    'amplifying_tome',
    'pickaxe',
  ],
  boss: [
    'long_sword',
    'cloth_armor',
    'health_potion',
    'amplifying_tome',
    'pickaxe',
  ],
};

/**
 * Generate reward options for milestone floors
 * Always returns exactly 3 items
 * 
 * @param region - Current region
 * @param floor - Current floor number
 * @param playerClass - Player's class (for future filtering)
 * @returns Array of exactly 3 InventoryItems
 */
export function generateRewardOptions(
  region: Region | null,
  floor: number,
  _playerClass: string
): InventoryItem[] {
  // Determine tier based on floor
  const isBossTier = floor >= 10;
  const poolKey = isBossTier ? 'boss' : 'elite';
  
  // Get appropriate reward pool
  const pools = region ? REGION_REWARD_POOLS[region] : DEFAULT_REWARD_POOL;
  const rewardPool = pools[poolKey];
  
  // Ensure we have at least 3 items in the pool
  if (rewardPool.length < 3) {
    console.error('Reward pool has fewer than 3 items!', { region, floor, poolKey, rewardPool });
    // Fallback to default pool
    const fallbackPool = DEFAULT_REWARD_POOL[poolKey];
    return generateFromPool(fallbackPool);
  }
  
  return generateFromPool(rewardPool);
}

/**
 * Helper function to generate 3 unique rewards from a pool
 */
function generateFromPool(pool: string[]): InventoryItem[] {
  const selectedRewards: InventoryItem[] = [];
  const poolCopy = [...pool];
  
  // Select 3 unique items
  for (let i = 0; i < 3; i++) {
    if (poolCopy.length === 0) {
      console.error('Ran out of items in pool!');
      break;
    }
    
    const randomIndex = Math.floor(Math.random() * poolCopy.length);
    const itemId = poolCopy[randomIndex];
    const item = getItemById(itemId);
    
    if (item) {
      selectedRewards.push({
        itemId: item.id,
        quantity: 1,
      });
      // Remove selected item to avoid duplicates
      poolCopy.splice(randomIndex, 1);
    } else {
      console.warn(`Item not found: ${itemId}`);
      // Remove invalid item and try again
      poolCopy.splice(randomIndex, 1);
      i--; // Retry this iteration
    }
  }
  
  // Ensure we always return exactly 3 items
  if (selectedRewards.length < 3) {
    console.error('Failed to generate 3 rewards!', { generated: selectedRewards.length });
  }
  
  return selectedRewards;
}

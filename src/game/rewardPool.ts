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

export interface ShopPoolConfig {
  common: string[]; // Basic stat items
  consumables: string[]; // Potions and usables
  legendary: string[]; // High-tier items (act 2+)
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
  camavor: {
    elite: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
    boss: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
  },
  ice_sea: {
    elite: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
    boss: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
  },
  marai: {
    elite: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
    boss: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
  },
};

/**
 * Region-specific shop pools
 * Each region offers different items for purchase
 */
export const REGION_SHOP_POOLS: Record<Region, ShopPoolConfig> = {
  demacia: {
    common: ['long_sword', 'cloth_armor', 'amplifying_tome', 'ruby_crystal', 'boots'],
    consumables: ['health_potion', 'stealth_ward'],
    legendary: ['infinity_edge', 'guardian_angel', 'trinity_force', 'blade_of_the_ruined_king'],
  },
  ionia: {
    common: ['long_sword', 'amplifying_tome', 'boots', 'ruby_crystal', 'rejuvenation_bead'],
    consumables: ['health_potion', 'stealth_ward'],
    legendary: ['nashors_tooth', 'blade_of_the_ruined_king', 'runaans_hurricane'],
  },
  shurima: {
    common: ['amplifying_tome', 'cloth_armor', 'ruby_crystal', 'sapphire_crystal', 'boots'],
    consumables: ['health_potion', 'oracle_lens'],
    legendary: ['rabadons_deathcap', 'zhonyas_hourglass', 'ludens_tempest'],
  },
  noxus: {
    common: ['long_sword', 'cloth_armor', 'pickaxe', 'vampiric_scepter', 'boots'],
    consumables: ['health_potion', 'stealth_ward'],
    legendary: ['eclipse', 'blade_of_the_ruined_king', 'infinity_edge', 'trinity_force'],
  },
  freljord: {
    common: ['cloth_armor', 'ruby_crystal', 'giants_belt', 'chain_vest', 'boots'],
    consumables: ['health_potion', 'stealth_ward'],
    legendary: ['warmogs_armor', 'sunfire_aegis', 'guardian_angel'],
  },
  zaun: {
    common: ['amplifying_tome', 'needlessly_large_rod', 'blasting_wand', 'sapphire_crystal', 'boots'],
    consumables: ['health_potion', 'oracle_lens', 'farsight_alteration'],
    legendary: ['zhonyas_hourglass', 'rabadons_deathcap', 'ludens_tempest', 'lich_bane'],
  },
  ixtal: {
    common: ['long_sword', 'recurve_bow', 'cloak_of_agility', 'boots', 'dagger'],
    consumables: ['health_potion', 'stealth_ward'],
    legendary: ['runaans_hurricane', 'blade_of_the_ruined_king', 'immortal_shieldbow'],
  },
  bandle_city: {
    common: ['amplifying_tome', 'ruby_crystal', 'boots', 'kindlegem', 'rejuvenation_bead'],
    consumables: ['health_potion', 'stealth_ward', 'oracle_lens'],
    legendary: ['rabadons_deathcap', 'nashors_tooth', 'lich_bane', 'banshees_veil'],
  },
  bilgewater: {
    common: ['long_sword', 'pickaxe', 'vampiric_scepter', 'cloth_armor', 'boots'],
    consumables: ['health_potion', 'oracle_lens'],
    legendary: ['blade_of_the_ruined_king', 'infinity_edge', 'immortal_shieldbow'],
  },
  piltover: {
    common: ['amplifying_tome', 'needlessly_large_rod', 'long_sword', 'pickaxe', 'boots'],
    consumables: ['health_potion', 'stealth_ward', 'farsight_alteration'],
    legendary: ['rabadons_deathcap', 'zhonyas_hourglass', 'trinity_force', 'infinity_edge'],
  },
  shadow_isles: {
    common: ['amplifying_tome', 'needlessly_large_rod', 'cloth_armor', 'null_magic_mantle', 'boots'],
    consumables: ['health_potion', 'oracle_lens'],
    legendary: ['zhonyas_hourglass', 'banshees_veil', 'rabadons_deathcap', 'lich_bane'],
  },
  void: {
    common: ['amplifying_tome', 'long_sword', 'null_magic_mantle', 'chain_vest', 'boots'],
    consumables: ['health_potion', 'oracle_lens'],
    legendary: ['ludens_tempest', 'eclipse', 'blade_of_the_ruined_king'],
  },
  targon: {
    common: ['cloth_armor', 'ruby_crystal', 'amplifying_tome', 'giants_belt', 'boots'],
    consumables: ['health_potion', 'stealth_ward'],
    legendary: ['warmogs_armor', 'guardian_angel', 'rabadons_deathcap', 'sunfire_aegis'],
  },
  camavor: {
    common: ['long_sword', 'cloth_armor', 'amplifying_tome', 'vampiric_scepter', 'boots'],
    consumables: ['health_potion', 'oracle_lens'],
    legendary: ['eclipse', 'blade_of_the_ruined_king', 'zhonyas_hourglass'],
  },
  ice_sea: {
    common: ['long_sword', 'cloth_armor', 'ruby_crystal', 'boots'],
    consumables: ['health_potion', 'stealth_ward'],
    legendary: ['warmogs_armor', 'infinity_edge', 'guardian_angel'],
  },
  marai: {
    common: ['amplifying_tome', 'sapphire_crystal', 'ruby_crystal', 'boots'],
    consumables: ['health_potion', 'oracle_lens'],
    legendary: ['nashors_tooth', 'lich_bane', 'rabadons_deathcap'],
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

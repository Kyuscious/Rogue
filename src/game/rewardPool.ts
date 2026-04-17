import { Region } from './types';
import { getItemById, ITEM_DATABASE, Item, ItemRarity, CharacterClass } from './items';
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
  marai_territory: {
    elite: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
    boss: ['long_sword', 'cloth_armor', 'health_potion', 'amplifying_tome', 'pickaxe'],
  },
  runeterra: {
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
  marai_territory: {
    common: ['amplifying_tome', 'sapphire_crystal', 'ruby_crystal', 'boots'],
    consumables: ['health_potion', 'oracle_lens'],
    legendary: ['nashors_tooth', 'lich_bane', 'rabadons_deathcap'],
  },
  runeterra: {
    common: ['long_sword', 'cloth_armor', 'ruby_crystal', 'boots'],
    consumables: ['health_potion', 'stealth_ward'],
    legendary: ['infinity_edge', 'rabadons_deathcap', 'guardian_angel'],
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

export type RewardVisualDifficulty = 'easy' | 'fair' | 'hard';

export interface PathRewardContext {
  difficulty?: 'safe' | 'fair' | 'risky';
  lootType?: string;
  pathName?: string;
  pathDescription?: string;
}

const STARTER_REWARD_EXCLUSIONS = new Set([
  'dorans_blade',
  'dorans_shield',
  'dorans_ring',
  'cull',
  'world_atlas',
  'dark_seal',
  'tear_of_the_goddess',
]);

const LOOT_TYPE_CLASS_POOLS: Record<string, CharacterClass[]> = {
  damage: ['assassin', 'skirmisher', 'marksman', 'juggernaut'],
  attackDamage: ['assassin', 'skirmisher', 'marksman', 'juggernaut'],
  critical: ['assassin', 'skirmisher', 'marksman', 'juggernaut'],
  defense: ['vanguard', 'warden', 'juggernaut'],
  tankDefense: ['vanguard', 'warden', 'juggernaut'],
  abilityPower: ['mage', 'enchanter'],
  utility: ['mage', 'enchanter', 'warden'],
  mobility: ['assassin', 'skirmisher', 'marksman'],
  mixed: ['assassin', 'skirmisher', 'marksman', 'juggernaut', 'mage', 'enchanter'],
  hybrid: ['assassin', 'skirmisher', 'marksman', 'juggernaut', 'mage'],
};

function normalizeLootType(lootType?: string): string {
  if (!lootType) return 'mixed';

  if (['damage', 'attackDamage', 'critical'].includes(lootType)) return 'damage';
  if (['defense', 'tankDefense'].includes(lootType)) return 'defense';
  if (['abilityPower'].includes(lootType)) return 'abilityPower';
  if (['utility'].includes(lootType)) return 'utility';
  if (['mobility'].includes(lootType)) return 'mobility';

  return 'mixed';
}

export function getPathVisualDifficulty(context?: PathRewardContext): RewardVisualDifficulty {
  const pathText = `${context?.pathName || ''} ${context?.pathDescription || ''}`.toLowerCase();

  if (context?.difficulty === 'risky') return 'hard';
  if (context?.difficulty === 'fair' || /balanced|moderate|varied/.test(pathText)) return 'fair';

  return 'easy';
}

function itemMatchesClassPool(item: Item, allowedClasses: CharacterClass[]): boolean {
  if (!item.classes || item.classes.length === 0) return true;
  return item.classes.some((characterClass) => allowedClasses.includes(characterClass));
}

function itemMatchesLootType(item: Item, lootType?: string): boolean {
  const stats = item.stats || {};
  const normalizedLootType = normalizeLootType(lootType);

  switch (normalizedLootType) {
    case 'damage':
      return Boolean(
        stats.attackDamage ||
        stats.criticalChance ||
        stats.criticalDamage ||
        stats.lethality ||
        stats.speed ||
        stats.lifeSteal ||
        stats.healingOnHit
      );
    case 'abilityPower':
      return Boolean(
        stats.abilityPower ||
        stats.haste ||
        stats.magicPenetration ||
        stats.omnivamp ||
        stats.heal_shield_power
      );
    case 'defense':
      return Boolean(
        stats.health ||
        stats.health_regen ||
        stats.armor ||
        stats.magicResist ||
        stats.tenacity
      );
    case 'mobility':
      return Boolean(stats.movementSpeed || stats.speed || stats.attackRange);
    case 'utility':
      return Boolean(
        stats.heal_shield_power ||
        stats.haste ||
        stats.magicFind ||
        stats.movementSpeed ||
        stats.goldGain ||
        stats.xpGain
      );
    case 'mixed':
    default:
      return Object.keys(stats).length > 0;
  }
}

export function getRewardRarityWeights(
  context?: PathRewardContext,
  isBossTier: boolean = false
): Array<{ rarity: ItemRarity; weight: number }> {
  const visualDifficulty = getPathVisualDifficulty(context);

  if (visualDifficulty === 'hard') {
    return isBossTier
      ? [
          { rarity: 'epic', weight: 75 },
          { rarity: 'legendary', weight: 25 },
        ]
      : [
          { rarity: 'epic', weight: 90 },
          { rarity: 'legendary', weight: 10 },
        ];
  }

  if (visualDifficulty === 'fair') {
    return isBossTier
      ? [
          { rarity: 'common', weight: 55 },
          { rarity: 'epic', weight: 45 },
        ]
      : [
          { rarity: 'common', weight: 70 },
          { rarity: 'epic', weight: 30 },
        ];
  }

  return [{ rarity: 'common', weight: 100 }];
}

export function getContextualRewardItems(
  context?: PathRewardContext,
  isBossTier: boolean = false
): Item[] {
  const normalizedLootType = normalizeLootType(context?.lootType);
  const allowedClasses = LOOT_TYPE_CLASS_POOLS[normalizedLootType] || LOOT_TYPE_CLASS_POOLS.mixed;
  const rarityWeights = getRewardRarityWeights(context, isBossTier);
  let allowedRarities = rarityWeights.map((entry) => entry.rarity);

  const basePool = Object.values(ITEM_DATABASE).filter((item) => {
    if (STARTER_REWARD_EXCLUSIONS.has(item.id)) return false;
    if (item.consumable) return false;
    if (!item.stats || Object.keys(item.stats).length === 0) return false;
    if (!itemMatchesClassPool(item, allowedClasses)) return false;
    return itemMatchesLootType(item, normalizedLootType);
  });

  let filteredPool = basePool.filter((item) => allowedRarities.includes(item.rarity));

  const fallbackRarities: Record<RewardVisualDifficulty, ItemRarity[]> = {
    easy: ['common', 'epic', 'legendary'],
    fair: ['common', 'epic', 'legendary'],
    hard: ['epic', 'legendary', 'mythic'],
  };

  for (const rarity of fallbackRarities[getPathVisualDifficulty(context)]) {
    if (filteredPool.length >= 3) break;
    if (!allowedRarities.includes(rarity)) {
      allowedRarities = [...allowedRarities, rarity];
      filteredPool = basePool.filter((item) => allowedRarities.includes(item.rarity));
    }
  }

  return filteredPool.length > 0 ? filteredPool : basePool;
}

/**
 * Generate reward options for milestone floors
 * Always returns exactly 3 items
 */
export function generateRewardOptions(
  region: Region | null,
  floor: number,
  _playerClass: string,
  pathContext?: PathRewardContext
): InventoryItem[] {
  const isBossTier = floor >= 10;
  const poolKey = isBossTier ? 'boss' : 'elite';

  if (pathContext?.lootType) {
    const contextualPool = getContextualRewardItems(pathContext, isBossTier);
    const rarityWeights = getRewardRarityWeights(pathContext, isBossTier);

    if (contextualPool.length >= 3) {
      return generateFromItemPool(contextualPool, rarityWeights);
    }
  }

  const pools = region ? REGION_REWARD_POOLS[region] : DEFAULT_REWARD_POOL;
  const rewardPool = pools[poolKey];

  if (rewardPool.length < 3) {
    console.error('Reward pool has fewer than 3 items!', { region, floor, poolKey, rewardPool });
    const fallbackPool = DEFAULT_REWARD_POOL[poolKey];
    return generateFromPool(fallbackPool);
  }

  return generateFromPool(rewardPool);
}

function generateFromItemPool(
  pool: Item[],
  rarityWeights: Array<{ rarity: ItemRarity; weight: number }>
): InventoryItem[] {
  const selectedRewards: InventoryItem[] = [];
  const poolCopy = [...pool];

  while (selectedRewards.length < 3 && poolCopy.length > 0) {
    const availableWeights = rarityWeights.filter((entry) =>
      poolCopy.some((item) => item.rarity === entry.rarity)
    );

    let selectedItem: Item | undefined;

    if (availableWeights.length > 0) {
      const totalWeight = availableWeights.reduce((sum, entry) => sum + entry.weight, 0);
      let randomValue = Math.random() * totalWeight;
      let selectedRarity = availableWeights[0].rarity;

      for (const entry of availableWeights) {
        randomValue -= entry.weight;
        if (randomValue <= 0) {
          selectedRarity = entry.rarity;
          break;
        }
      }

      const rarityItems = poolCopy.filter((item) => item.rarity === selectedRarity);
      selectedItem = rarityItems[Math.floor(Math.random() * rarityItems.length)];
    } else {
      selectedItem = poolCopy[Math.floor(Math.random() * poolCopy.length)];
    }

    if (!selectedItem) break;

    selectedRewards.push({
      itemId: selectedItem.id,
      quantity: 1,
    });

    const selectedIndex = poolCopy.findIndex((item) => item.id === selectedItem.id);
    if (selectedIndex >= 0) {
      poolCopy.splice(selectedIndex, 1);
    }
  }

  return selectedRewards;
}

/**
 * Helper function to generate 3 unique rewards from a pool
 */
function generateFromPool(pool: string[]): InventoryItem[] {
  const selectedRewards: InventoryItem[] = [];
  const poolCopy = [...pool];

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
      poolCopy.splice(randomIndex, 1);
    } else {
      console.warn(`Item not found: ${itemId}`);
      poolCopy.splice(randomIndex, 1);
      i--;
    }
  }

  if (selectedRewards.length < 3) {
    console.error('Failed to generate 3 rewards!', { generated: selectedRewards.length });
  }

  return selectedRewards;
}

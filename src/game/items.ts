import { PassiveId } from './itemPassives';
import { ITEM_PASSIVES } from './itemPassives';

export type ItemRarity = 'starter' | 'common' | 'epic' | 'legendary' | 'mythic' | 'ultimate' | 'exalted' | 'transcendent';
export type EnemyTier = 'minion' | 'elite' | 'champion' | 'boss';
export type CharacterClass = 'mage' | 'vanguard' | 'warden' | 'juggernaut' | 'skirmisher' | 'assassin' | 'marksman' | 'enchanter';
export type LootType = 'attackDamage' | 'abilityPower' | 'tankDefense' | 'mobility' | 'utility' | 'hybrid' | 'critical';

/**
 * Helper function to get passive description from passiveId
 */
function getPassiveDescription(passiveId?: PassiveId): string | undefined {
  if (!passiveId) return undefined;
  const passive = ITEM_PASSIVES[passiveId];
  return passive ? `${passive.name}: ${passive.description}` : undefined;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  price: number; // Gold cost to purchase in shop
  stats: {
    // Survivability
    health?: number;
    health_regen?: number;
    armor?: number;
    magicResist?: number;
    tenacity?: number;
    
    // Attack
    attackRange?: number;
    attackDamage?: number;
    attackSpeed?: number;
    criticalChance?: number;
    criticalDamage?: number;
    lethality?: number;
    lifeSteal?: number;
    
    // Spell
    abilityPower?: number;
    abilityHaste?: number;
    magicPenetration?: number;
    heal_shield_power?: number;
    omnivamp?: number;
    
    // Mobility
    movementSpeed?: number;
    
    // Misc
    goldGain?: number;
    xpGain?: number;
    magicFind?: number;
  };
  passive?: string;
  passiveId?: PassiveId;
  consumable?: boolean; // If true, item is consumed on use
  onUseEffect?: string; // Description of what happens when used
}

export interface InventoryItem {
  item: Item;
  quantity: number;
}

export interface Enemy {
  id: string;
  name: string;
  region: string;
  tier: EnemyTier;
  class: CharacterClass;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  abilities: any[];
  level: number;
  itemDrops: string[]; // item IDs that can drop
  goldReward: number;
  experienceReward: number;
  lootType: LootType;
}

/**
 * Tier-based loot rarity pools (independent of level)
 * Each tier determines which rarities can be looted
 */

// Minion tier loot: 80% Common, 20% Epic
export const MINION_RARITY_POOL = [
  { rarity: 'common' as const, weight: 80 },
  { rarity: 'epic' as const, weight: 20 },
];

// Elite tier loot: 20% Epic, 70% Legendary, 10% Mythic
export const ELITE_RARITY_POOL = [
  { rarity: 'epic' as const, weight: 20 },
  { rarity: 'legendary' as const, weight: 70 },
  { rarity: 'mythic' as const, weight: 10 },
];

// Champion tier loot: 75% Ultimate, 25% Exalted
export const CHAMPION_RARITY_POOL = [
  { rarity: 'ultimate' as const, weight: 75 },
  { rarity: 'exalted' as const, weight: 25 },
];

// Boss tier loot: 55% Legendary, 40% Mythic, 5% Ultimate
export const BOSS_RARITY_POOL = [
  { rarity: 'legendary' as const, weight: 55 },
  { rarity: 'mythic' as const, weight: 40 },
  { rarity: 'ultimate' as const, weight: 5 },
];

// Legacy table for backwards compatibility
export const CLASS_LOOT_TABLES: Record<CharacterClass, string[]> = {
  mage: ['amplifying_tome'],
  vanguard: ['cloth_armor'],
  warden: ['cloth_armor'],
  juggernaut: ['long_sword'],
  skirmisher: ['long_sword'],
  assassin: ['long_sword'],
  marksman: ['long_sword'],
  enchanter: ['kindlegem'],
};

export interface ItemPassive {
  name: string;
  description: string;
}

export interface SummonerStats {
  level: number;
  experience: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  armor: number;
  magicResist: number;
  abilityPower: number;
  attackSpeed: number;
}

// Starting items for the beginning of the journey
export const STARTING_ITEMS: Item[] = [
  {
    id: 'dorans_blade',
    name: "Doran's Blade",
    description: 'The starting weapon of champions who deal physical damage',
    rarity: 'starter',
    price: 0,
    stats: {
      attackDamage: 8,
      health: 80,
      lifeSteal: 1,
    },
    passiveId: 'blade_lifesteal_amplifier',
    get passive() { return getPassiveDescription(this.passiveId); },
  },
  {
    id: 'dorans_shield',
    name: "Doran's Shield",
    description: 'Protective gear for those who prefer defense',
    rarity: 'starter',
    price: 0,
    stats: {
      armor: 8,
      magicResist: 8,
      health: 120,
    },
    passiveId: 'shield_adaptive_defense',
    get passive() { return getPassiveDescription(this.passiveId); },
  },
  {
    id: 'dorans_ring',
    name: "Doran's Ring",
    description: 'A mystic focus for spellcasting champions',
    rarity: 'starter',
    price: 0,
    stats: {
      abilityPower: 15,
      health: 80,
    },
    passiveId: 'ring_spell_scaling',
    get passive() { return getPassiveDescription(this.passiveId); },
  },
];

// Complete item database
export const ITEM_DATABASE: Record<string, Item> = {
  // Starter Items
  dorans_blade: STARTING_ITEMS[0],
  dorans_shield: STARTING_ITEMS[1],
  dorans_ring: STARTING_ITEMS[2],

  // Common Items
  long_sword: {
    id: 'long_sword',
    name: 'Long Sword',
    description: 'A basic sword for the journey ahead',
    rarity: 'common',
    price: 350,
    stats: { attackDamage: 10 },
  },
  health_potion: {
    id: 'health_potion',
    name: 'Health Potion',
    description: 'A magical elixir that restores health over time',
    rarity: 'common',
    price: 50,
    stats: {},
    consumable: true,
    onUseEffect: 'Restores 50 health over 5 turns',
  },
  cloth_armor: {
    id: 'cloth_armor',
    name: 'Cloth Armor',
    description: 'Basic protection',
    rarity: 'common',
    price: 300,
    stats: { armor: 15 },
  },
  amplifying_tome: {
    id: 'amplifying_tome',
    name: 'Amplifying Tome',
    description: 'A simple book to enhance magical power',
    rarity: 'common',
    price: 350,
    stats: { abilityPower: 15 },
  },


  // Epic Items
  pickaxe: {
    id: 'pickaxe',
    name: 'Pickaxe',
    description: 'A powerful mining tool turned weapon',
    rarity: 'epic',
    price: 80,
    stats: { attackDamage: 25 },
  },
  null_magic_mantle: {
    id: 'null_magic_mantle',
    name: 'Null-Magic Mantle',
    description: 'Magical protection against spells',
    rarity: 'epic',
    price: 400,
    stats: { magicResist: 25 },
  },
  kindlegem: {
    id: 'kindlegem',
    name: 'Kindlegem',
    description: 'A glowing gem of inner warmth',
    rarity: 'epic',
    price: 400,
    stats: { health: 150 },
  },

  // Legendary Items
  infinity_edge: {
    id: 'infinity_edge',
    name: 'Infinity Edge',
    description: 'Attack damage and critical strike power',
    rarity: 'legendary',
    price: 200,
    stats: { attackDamage: 70, lifeSteal: 10 },
  },
  abyssal_mask: {
    id: 'abyssal_mask',
    name: 'Abyssal Mask',
    description: 'Deep sea protection',
    rarity: 'legendary',
    price: 220,
    stats: { health: 300, magicResist: 40, omnivamp: 10 },
  },
  nashor_tooth: {
    id: 'nashor_tooth',
    name: "Nashor's Tooth",
    description: "The fang of Nasthor the beast",
    rarity: 'legendary',
    price: 210,
    stats: { abilityPower: 60, attackSpeed: 0.5, health: 200 },
  },

  // Mythic Items
  trinity_force: {
    id: 'trinity_force',
    name: 'Trinity Force',
    description: 'A legendary combination of power',
    rarity: 'mythic',
    price: 300,
    stats: {
      attackDamage: 80,
      health: 250,
      attackSpeed: 0.5,
    },
  },

  rabadons_deathcap: {
    id: 'rabadons_deathcap',
    name: "Rabadon's Deathcap",
    description: 'Amplifies all ability power',
    rarity: 'legendary',
    price: 250,
    stats: { abilityPower: 120, health: 200 },
    passiveId: 'magical_opus',
    get passive() { return getPassiveDescription(this.passiveId); },
  },

  kaenic_rookern: {
    id: 'kaenic_rookern',
    name: 'Kaenic Rookern',
    description: 'A legendary shield',
    rarity: 'legendary',
    price: 240,
    stats: { armor: 80, magicResist: 40, health: 400 },
  },
  warmogs_armor: {
    id: 'warmogs_armor',
    name: "Warmog's Armor",
    description: 'Massive health boost ',
    rarity: 'legendary',
    price: 280,
    stats: { health: 1000 },
    passive: 'Heals 5% every round you do not get damaged',
  },
  //Ultimate Items
  guardian_angel: {
    id: 'guardian_angel', 
    name: 'Guardian Angel',
    description: 'Revive upon death',
    rarity: 'transcendent',
    price: 500,
    stats: { attackDamage: 50, armor: 40, health: 300 },
    passive: 'Upon death, revive with 50% health on the next turn',
  },
  // Exalted Items
  luci_staff: {
    id: 'luci_staff',
    name: "Luci's Staff",
    description: 'Empowers abilities with dark magic',
    rarity: 'exalted',
    price: 400,
    stats: { abilityPower: 100, omnivamp: 15, health: 250 },
    passive: 'Abilities deal bonus magic damage over time',
  },
  // Transcendent Items
  lich_bane: {
    id: 'lich_bane',
    name: "Lich Bane",
    description: 'Empowers your next attack after using an ability',
    rarity: 'transcendent',
    price: 450,
    stats: { abilityPower: 80, attackSpeed: 0.3, health: 200 },
    passive: 'After using an ability, your next basic attack deals bonus magic damage',
  },
};

export function getItemById(id: string): Item | undefined {
  return ITEM_DATABASE[id];
}

export function getItemsByRarity(rarity: ItemRarity): Item[] {
  return Object.values(ITEM_DATABASE).filter((item) => item.rarity === rarity);
}

export function getRandomItemByRarity(rarity: ItemRarity): Item {
  const items = getItemsByRarity(rarity);
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Get a random loot item based on enemy tier
 * Tier determines rarity pools, not level
 * MINION: 80% Common, 20% Epic
 * ELITE: 20% Epic, 70% Legendary, 10% Mythic
 * CHAMPION: 75% Ultimate, 25% Exalted
 * BOSS: 55% Legendary, 40% Mythic, 5% Ultimate
 */
export function getRandomLootByTier(enemyTier: 'minion' | 'elite' | 'champion' | 'boss' = 'minion'): Item | undefined {
  let rarityPool: Array<{ rarity: ItemRarity; weight: number }>;
  
  if (enemyTier === 'boss') {
    rarityPool = BOSS_RARITY_POOL as Array<{ rarity: ItemRarity; weight: number }>;
  } else if (enemyTier === 'champion') {
    rarityPool = CHAMPION_RARITY_POOL as Array<{ rarity: ItemRarity; weight: number }>;
  } else if (enemyTier === 'elite') {
    rarityPool = ELITE_RARITY_POOL as Array<{ rarity: ItemRarity; weight: number }>;
  } else {
    rarityPool = MINION_RARITY_POOL as Array<{ rarity: ItemRarity; weight: number }>;
  }
  
  // Weighted random selection of rarity
  const totalWeight = rarityPool.reduce((sum, item) => sum + item.weight, 0);
  let randomWeight = Math.random() * totalWeight;
  
  let selectedRarity: ItemRarity = 'common';
  for (const item of rarityPool) {
    randomWeight -= item.weight;
    if (randomWeight <= 0) {
      selectedRarity = item.rarity;
      break;
    }
  }
  
  // Get items of the selected rarity
  const potentialItems = Object.values(ITEM_DATABASE).filter(
    (item) => item.rarity === selectedRarity && item.stats && Object.keys(item.stats).length > 0
  );
  
  if (potentialItems.length === 0) return undefined;
  
  return potentialItems[Math.floor(Math.random() * potentialItems.length)];
}

// Backwards compatibility wrapper
export function getRandomLootByClass(_characterClass: CharacterClass, enemyTier: 'minion' | 'elite' | 'champion' | 'boss' = 'minion'): Item | undefined {
  return getRandomLootByTier(enemyTier);
}

/**
 * Get all passive IDs from a list of inventory items
 */
export function getPassiveIdsFromInventory(inventory: Array<{ itemId: string; quantity: number }>): PassiveId[] {
  const passiveIds: PassiveId[] = [];
  
  for (const invItem of inventory) {
    const item = ITEM_DATABASE[invItem.itemId];
    if (item && item.passiveId) {
      passiveIds.push(item.passiveId);
    }
  }
  
  return passiveIds;
}

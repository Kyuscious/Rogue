import { PassiveId, getPassiveById } from './itemPassives';

export type ItemRarity = 'starter' | 'common' | 'epic' | 'legendary' | 'mythic' | 'ultimate' | 'exalted' | 'transcendent';
export type EnemyTier = 'minion' | 'elite' | 'champion' | 'boss';
export type CharacterClass = 'mage' | 'vanguard' | 'warden' | 'juggernaut' | 'skirmisher' | 'assassin' | 'marksman' | 'enchanter';
export type LootType = 'attackDamage' | 'abilityPower' | 'tankDefense' | 'mobility' | 'utility' | 'hybrid' | 'critical';

export interface Item {
  id: string;
  name?: string; // Deprecated: Use getItemTranslation(id) from i18n/helpers instead
  description?: string; // Deprecated: Use getItemTranslation(id) from i18n/helpers instead
  rarity: ItemRarity;
  price: number; // Gold cost to purchase in shop
  imagePath?: string; // Path to item image asset
  classes?: CharacterClass[]; // Classes that can use this item (undefined = all classes)
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
    healingOnHit?: number; // Flat healing when attack lands
    
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
    trueDamage?: number; // Flat damage that bypasses armor/MR (on-hit for attacks and spells)
  };
  passive?: string;
  cursed?: boolean; // Whether the item is cursed and cannot be unequipped without special means
  passiveId?: PassiveId;
  consumable?: boolean; // If true, item is consumed on use
  active?: {
    name: string;
    description: string;
    cooldown: number; // Turns until can use again
    range?: number; // Range in units (uses attack range if not specified)
    castTime?: number; // Cast time before effect applies
    setupTime?: number; // Setup time for traps
    effectRadius?: number; // Area of effect radius
    stunDuration?: number; // Stun duration in turns
    requiresEnemyInRange?: boolean; // Must have enemy in range to use
  };
  onUseEffect?: string; // Description of what happens when used
  unlockRequirement?: {
    type: 'stat_threshold' | 'achievement' | 'progression';
    description: string; // Human-readable unlock condition
    // For stat_threshold type
    stat?: 'abilityPower' | 'attackDamage' | 'health';
    threshold?: number; // Required stat value
    // For achievement type
    achievementId?: string;
    // For progression type
    regionsVisited?: number;
    enemiesKilled?: number;
  };
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

// Minion tier loot: 5% Starter, 75% Common, 20% Epic
// Lower rarities allow negative magicFind to reduce loot quality
export const MINION_RARITY_POOL = [
  { rarity: 'starter' as const, weight: 5 },
  { rarity: 'common' as const, weight: 75 },
  { rarity: 'epic' as const, weight: 20 },
];

// Elite tier loot: 10% Common, 15% Epic, 60% Legendary, 15% Mythic
// Lower rarities allow negative magicFind to reduce loot quality
export const ELITE_RARITY_POOL = [
  { rarity: 'common' as const, weight: 10 },
  { rarity: 'epic' as const, weight: 15 },
  { rarity: 'legendary' as const, weight: 60 },
  { rarity: 'mythic' as const, weight: 15 },
];

// Champion tier loot: 5% Epic, 10% Legendary, 15% Mythic, 55% Ultimate, 15% Exalted
// Lower rarities allow negative magicFind to reduce loot quality significantly
export const CHAMPION_RARITY_POOL = [
  { rarity: 'epic' as const, weight: 5 },
  { rarity: 'legendary' as const, weight: 10 },
  { rarity: 'mythic' as const, weight: 15 },
  { rarity: 'ultimate' as const, weight: 55 },
  { rarity: 'exalted' as const, weight: 15 },
];

// Boss tier loot: 5% Epic, 45% Legendary, 35% Mythic, 10% Ultimate, 5% Exalted
// Lower rarities allow negative magicFind to reduce loot quality
export const BOSS_RARITY_POOL = [
  { rarity: 'epic' as const, weight: 5 },
  { rarity: 'legendary' as const, weight: 45 },
  { rarity: 'mythic' as const, weight: 35 },
  { rarity: 'ultimate' as const, weight: 10 },
  { rarity: 'exalted' as const, weight: 5 },
];

/**
 * Shop rarity pools by act (influenced by magicFind)
 */

// Act 1 shop: 5% Starter, 60% Common, 30% Epic, 5% Legendary
// Lower rarities allow negative magicFind to reduce shop quality
export const SHOP_ACT_1_POOL = [
  { rarity: 'starter' as const, weight: 5 },
  { rarity: 'common' as const, weight: 60 },
  { rarity: 'epic' as const, weight: 30 },
  { rarity: 'legendary' as const, weight: 5 },
];

// Act 2 shop: 5% Common, 60% Epic, 30% Legendary, 5% Mythic
// Lower rarities allow negative magicFind to reduce shop quality
export const SHOP_ACT_2_POOL = [
  { rarity: 'common' as const, weight: 5 },
  { rarity: 'epic' as const, weight: 60 },
  { rarity: 'legendary' as const, weight: 30 },
  { rarity: 'mythic' as const, weight: 5 },
];

// Act 3 shop: 3% Common, 7% Epic, 10% Legendary, 55% Mythic, 20% Ultimate, 5% Exalted
// Lower rarities allow negative magicFind to reduce shop quality significantly
export const SHOP_ACT_3_POOL = [
  { rarity: 'common' as const, weight: 3 },
  { rarity: 'epic' as const, weight: 7 },
  { rarity: 'legendary' as const, weight: 10 },
  { rarity: 'mythic' as const, weight: 55 },
  { rarity: 'ultimate' as const, weight: 20 },
  { rarity: 'exalted' as const, weight: 5 },
];

// Act 4+ (Endless) shop: 2% Epic, 5% Legendary, 60% Mythic, 25% Ultimate, 8% Exalted
// Lower rarities allow deep negative magicFind to severely reduce shop quality
export const SHOP_ENDLESS_POOL = [
  { rarity: 'epic' as const, weight: 2 },
  { rarity: 'legendary' as const, weight: 5 },
  { rarity: 'mythic' as const, weight: 60 },
  { rarity: 'ultimate' as const, weight: 25 },
  { rarity: 'exalted' as const, weight: 8 },
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

// Default starting items (always available)
export const DEFAULT_STARTING_ITEMS: Item[] = [
  {
    id: 'dorans_blade',
    name: "Doran's Blade",
    description: 'A blade for explorers who deal physical damage',
    rarity: 'starter',
    price: 0,
    imagePath: '/assets/global/images/item-dorans-blade.svg',
    stats: {
      attackDamage: 8,
      health: 80,
      lifeSteal: 1,
    },
    passiveId: 'life_draining',
  },
  {
    id: 'dorans_shield',
    name: "Doran's Shield",
    description: 'Protective gear for explorers who prefer defense',
    rarity: 'starter',
    price: 0,
    stats: {
      health: 110,
      health_regen: 4,
    },
    passiveId: 'enduring_focus',
  },
  {
    id: 'dorans_ring',
    name: "Doran's Ring",
    description: 'A mystic focus for spellcasting explorers',
    rarity: 'starter',
    price: 0,
    stats: {
      abilityPower: 18,
      health: 90,
    },
    passiveId: 'drain',
  },
];

// Unlockable starting items (require achievements/progression)
export const UNLOCKABLE_STARTING_ITEMS: Item[] = [
  {
    id: 'cull',
    name: 'Cull',
    description: 'A scythe for greedy explorers',
    rarity: 'starter',
    price: 0,
    stats: {
      health: 50,
      attackDamage: 7,
      healingOnHit: 3,
      goldGain: 50,
    },
    passiveId: 'reap',
    unlockRequirement: {
      type: 'achievement',
      description: 'Complete Act 1 with 5000+ gold',
      achievementId: 'wealthy_explorer',
    },
  },
  {
    id: 'world_atlas',
    name: 'World Atlas',
    description: 'The book for the most curious explorers',
    rarity: 'starter',
    price: 0,
    stats: {
      health: 50,
      xpGain: 50,
    },
    passiveId: 'pathfinder',
    unlockRequirement: {
      type: 'progression',
      description: 'Visit 10 different regions',
      regionsVisited: 10,
    },
  },
  {
    id: 'dark_seal',
    name: 'Dark Seal',
    description: 'Glory: Defeating Champion or Legend tier enemies grants +10 AP permanently (stacks endlessly).',
    rarity: 'starter',
    price: 350,
    stats: {
      health: 50,
      abilityPower: 15,
    },
    passiveId: 'glory',
    unlockRequirement: {
      type: 'stat_threshold',
      description: 'Reach 150 Ability Power in a single run',
      stat: 'abilityPower',
      threshold: 150,
    },
  },
];

// Combined array of all starting items
export const STARTING_ITEMS: Item[] = [
  ...DEFAULT_STARTING_ITEMS,
  ...UNLOCKABLE_STARTING_ITEMS,
];

// Complete item database
export const ITEM_DATABASE: Record<string, Item> = {
  // Starter Items (Default)
  dorans_blade: DEFAULT_STARTING_ITEMS[0],
  dorans_shield: DEFAULT_STARTING_ITEMS[1],
  dorans_ring: DEFAULT_STARTING_ITEMS[2],
  
  // Starter Items (Unlockable)
  cull: UNLOCKABLE_STARTING_ITEMS[0],
  world_atlas: UNLOCKABLE_STARTING_ITEMS[1],
  dark_seal: UNLOCKABLE_STARTING_ITEMS[2],

  // Common Usables
  
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
  
  // ACTIVE ITEMS - Combat Abilities

  
  // CONSUMABLE - Trap Item
  flashbomb_trap: {
    id: 'flashbomb_trap',
    name: 'Flashbomb Trap',
    description: 'A trap that stuns enemies after setup time',
    rarity: 'common',
    price: 75,
    stats: {},
    consumable: true,
    active: {
      name: 'Set Flashbomb',
      description: 'Places trap at enemy location (500 range). After 0.5 turn setup, stuns for 0.5 turns in 50 unit radius.',
      cooldown: 0,
      range: 500,
      setupTime: 0.5,
      stunDuration: 0.5,
      effectRadius: 50,
      requiresEnemyInRange: true,
    },
    onUseEffect: 'Places a trap that stuns after 0.5 turns. Can be dodged by moving away.',
  },
  
  stealth_ward: {
    id: 'stealth_ward',
    name: 'Stealth Ward',
    description: 'Invisible ward that reveals the stats of the enemy',
    rarity: 'common',
    price: 75,
    stats: {},
    consumable: true,
    onUseEffect: 'Reveals the enemy stats for the remainder of the encounter',
  },
  oracle_lens: {
    id: 'oracle_lens',
    name: 'Oracle Lens',
    description: 'A mystical lens that reveals hidden enemies',
    rarity: 'common',
    price: 50,
    stats: {},
    consumable: true,
    onUseEffect: 'Allows to attack invisible enemies for the next 3 turns',
  },
  farsight_alteration: {
    id: 'farsight_alteration',
    name: 'Farsight Alteration',
    description: 'A magical device that allows to plan ahead',
    rarity: 'common',
    price: 50,
    stats: {},
    consumable: true,
    onUseEffect: 'Reveals what the next encounter will be',
  },

  // Common Items
  
  long_sword: {
    id: 'long_sword',
    name: 'Long Sword',
    description: 'A basic sword for the journey ahead',
    rarity: 'common',
    price: 350,
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { attackDamage: 10 },
  },
  cloth_armor: {
    id: 'cloth_armor',
    name: 'Cloth Armor',
    description: 'Basic protection',
    rarity: 'common',
    price: 300,
    classes: ['vanguard', 'warden', 'juggernaut'],
    imagePath: '/assets/global/images/item-cloth-armor.svg',
    stats: { armor: 15 },
  },
  amplifying_tome: {
    id: 'amplifying_tome',
    name: 'Amplifying Tome',
    description: 'A simple book to enhance magical power',
    rarity: 'common',
    price: 350,
    classes: ['mage', 'enchanter'],
    stats: { abilityPower: 15 },
  },
  kindlegem: {
    id: 'kindlegem',
    name: 'Kindlegem',
    description: 'A glowing gem of inner warmth',
    rarity: 'common',
    price: 400,
    classes: ['vanguard', 'warden', 'juggernaut', 'enchanter'],
    stats: { health: 150 },
  },
  sapphire_crystal: {
    id: 'sapphire_crystal',
    name: 'Sapphire Crystal',
    description: 'A crystal that enhances magical abilities',
    rarity: 'common',
    price: 300,
    stats: { xpGain: 1 },
  },
  fearie_charm: {
    id: 'fearie_charm',
    name: 'Faerie Charm',
    description: 'A charm that boosts magical abilities',
    rarity: 'common',
    price: 200,
    stats: { magicFind: 5 },
  },
  dagger: {
    id: 'dagger',
    name: 'Dagger',
    description: 'A small blade for quick strikes',
    rarity: 'common',
    price: 250,
    classes: ['assassin', 'skirmisher', 'marksman'],
    stats: { attackSpeed: 0.1 },
  },
  rejuvenation_bead: {
    id: 'rejuvenation_bead',
    name: 'Rejuvenation Bead',
    description: 'A bead that enhances health regeneration',
    rarity: 'common',
    price: 150,
    stats: { health_regen: 2 },
  },
  boots: {
    id: 'boots',
    name: 'Boots',
    description: 'Basic footwear to increase movement speed',
    rarity: 'common',
    price: 300,
    stats: { movementSpeed: 25 },
  },
  // Epic Usables
  
  elixir_of_iron: {
    id: 'elixir_of_iron',
    name: 'Elixir of Iron',
    description: 'Grants a powerful buff for 15 encounters',
    rarity: 'epic',
    price: 500,
    stats: {},
    consumable: true,
    onUseEffect: 'Gain +300 Health, +250 Tenacity, and +150 Movement Speed for 15 encounters (persists across acts/regions)',
  },
  
  elixir_of_sorcery: {
    id: 'elixir_of_sorcery',
    name: 'Elixir of Sorcery',
    description: 'Grants magical power and true damage for 15 encounters',
    rarity: 'epic',
    price: 500,
    stats: {},
    consumable: true,
    onUseEffect: 'Gain +50 Ability Power, +10 Magic Find, and +25 True Damage (ignores armor/MR) for 15 encounters (persists across acts/regions)',
  },
  
  elixir_of_wrath: {
    id: 'elixir_of_wrath',
    name: 'Elixir of Wrath',
    description: 'Grants physical power and lifesteal for 15 encounters',
    rarity: 'epic',
    price: 500,
    stats: {},
    consumable: true,
    onUseEffect: 'Gain +30 Attack Damage and +12% Lifesteal for 15 encounters (persists across acts/regions)',
  },

  // Epic Items
  pickaxe: {
    id: 'pickaxe',
    name: 'Pickaxe',
    description: 'A powerful mining tool turned weapon',
    rarity: 'epic',
    price: 80,
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { attackDamage: 25 },
  },
  null_magic_mantle: {
    id: 'null_magic_mantle',
    name: 'Null-Magic Mantle',
    description: 'Magical protection against spells',
    rarity: 'epic',
    price: 400,
    classes: ['vanguard', 'warden', 'juggernaut', 'skirmisher'],
    stats: { magicResist: 25 },
  },
  

  // Legendary Items
  
  mejais_soulstealer: {
    id: 'mejais_soulstealer',
    name: "Mejai's Soulstealer",
    description: 'Upgraded Glory: Defeating Champion or Legend tier enemies grants +15 AP permanently (stacks endlessly). Carries over stacks from Dark Seal.',
    rarity: 'legendary',
    price: 1150,
    classes: ['mage', 'enchanter'],
    stats: {
      health: 50,
      abilityPower: 20,
      movementSpeed: 100,
    },
    passiveId: 'glory_upgraded',
  },
  
  infinity_edge: {
    id: 'infinity_edge',
    name: 'Infinity Edge',
    description: 'Attack damage and critical strike power',
    rarity: 'legendary',
    price: 200,
    classes: ['marksman', 'assassin', 'skirmisher'],
    stats: { attackDamage: 70, lifeSteal: 10 },
  },
  abyssal_mask: {
    id: 'abyssal_mask',
    name: 'Abyssal Mask',
    description: 'Deep sea protection',
    rarity: 'legendary',
    price: 220,
    classes: ['vanguard', 'warden', 'juggernaut'],
    stats: { health: 300, magicResist: 40, omnivamp: 10 },
  },
  nashor_tooth: {
    id: 'nashor_tooth',
    name: "Nashor's Tooth",
    description: "The fang of Nasthor the beast",
    rarity: 'legendary',
    price: 210,
    classes: ['mage'],
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
    passive: 'Magical Opus: Increases your total Ability Power by 30%.',
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
  lich_bane: {
    id: 'lich_bane',
    name: "Lich Bane",
    description: 'Empowers your next attack after using an ability',
    rarity: 'transcendent',
    price: 450,
    stats: { abilityPower: 80, attackSpeed: 0.3, health: 200 },
    passive: 'After using an ability, your next basic attack deals bonus magic damage',
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
  chalicar: {
    id: 'chalicar',
    name: 'Chalicar',
    description: 'The Legendary Jeweled crossblade boomerang',
    rarity: 'exalted',
    price: 5000,
    stats: { attackDamage: 90, health: 200 },
    }
  // Transcendent Items
  
};

export function getItemById(id: string): Item | undefined {
  return ITEM_DATABASE[id];
}

export function getItemsByRarity(rarity: ItemRarity): Item[] {
  return Object.values(ITEM_DATABASE).filter((item) => item.rarity === rarity);
}

/**
 * Get items that match a specific character class
 * @param characterClass - The class to filter by
 * @param excludeConsumables - Whether to exclude consumable items
 * @returns Array of items usable by the class
 */
export function getItemsByClass(characterClass: CharacterClass, excludeConsumables: boolean = true): Item[] {
  return Object.values(ITEM_DATABASE).filter((item) => {
    // Exclude consumables if requested
    if (excludeConsumables && item.consumable) return false;
    
    // If item has no class restriction, it's usable by all
    if (!item.classes || item.classes.length === 0) return true;
    
    // Check if the character's class is in the item's allowed classes
    return item.classes.includes(characterClass);
  });
}

/**
 * Get allowed item rarities based on region tier and encounter progression
 * This creates a progressive difficulty curve
 * @param regionTier - The tier of the current region
 * @param encounterCount - Total encounters completed in the run
 * @returns Array of allowed rarities for enemy items
 */
export function getAllowedRaritiesForEnemies(
  regionTier: 'starting' | 'standard' | 'advanced' | 'hard' | 'travelling',
  encounterCount: number
): ItemRarity[] {
  // Base pools by region tier
  const rarityPools: Record<string, ItemRarity[]> = {
    // Starting regions: Common items, gradually add Epic
    starting: encounterCount <= 3 ? ['common'] 
            : encounterCount <= 6 ? ['common', 'epic']
            : ['common', 'epic'],
    
    // Standard regions: Common to Epic, add Legendary later
    standard: encounterCount <= 3 ? ['common', 'epic'] 
            : encounterCount <= 6 ? ['common', 'epic', 'legendary']
            : ['common', 'epic', 'legendary'],
    
    // Advanced regions: Epic to Legendary, add Mythic later
    advanced: encounterCount <= 3 ? ['epic', 'legendary'] 
            : encounterCount <= 6 ? ['epic', 'legendary', 'mythic']
            : ['epic', 'legendary', 'mythic'],
    
    // Hard regions: Legendary to Ultimate
    hard: encounterCount <= 3 ? ['legendary', 'mythic'] 
        : encounterCount <= 6 ? ['legendary', 'mythic', 'ultimate']
        : ['legendary', 'mythic', 'ultimate'],
    
    // Travelling regions: Mix of everything, scales with progression
    travelling: encounterCount <= 3 ? ['epic', 'legendary'] 
              : encounterCount <= 6 ? ['epic', 'legendary', 'mythic']
              : ['legendary', 'mythic', 'ultimate'],
  };
  
  return rarityPools[regionTier] || ['common'];
}

/**
 * Get N random items for an enemy based on their class, encounter count, and region
 * @param characterClass - The enemy's character class
 * @param encounterCount - Current encounter number (determines item count and rarity)
 * @param regionTier - The difficulty tier of the current region
 * @returns Array of random items suitable for the enemy
 */
export function getRandomItemsForEnemy(
  characterClass: CharacterClass, 
  encounterCount: number,
  regionTier: 'starting' | 'standard' | 'advanced' | 'hard' | 'travelling' = 'starting'
): Item[] {
  // Get all items matching the class
  const classItems = getItemsByClass(characterClass, true);
  
  if (classItems.length === 0) return [];
  
  // Exclude starter items (dorans items, cull, world_atlas, dark_seal) from enemy loot
  const starterItemIds = ['dorans_blade', 'dorans_shield', 'dorans_ring', 'cull', 'world_atlas', 'dark_seal'];
  const nonStarterItems = classItems.filter(item => !starterItemIds.includes(item.id));
  
  // Filter by allowed rarities based on progression
  const allowedRarities = getAllowedRaritiesForEnemies(regionTier, encounterCount);
  const availableItems = nonStarterItems.filter(item => allowedRarities.includes(item.rarity));
  
  // Fallback to non-starter items if no items match the rarity filter
  const itemPool = availableItems.length > 0 ? availableItems : nonStarterItems;
  
  // Determine number of items based on encounter count and region tier
  let itemCount = 1;
  
  // Item count scales with both encounters and region tier
  if (regionTier === 'starting') {
    if (encounterCount >= 8) itemCount = 2;
    else if (encounterCount >= 4) itemCount = 1;
  } else if (regionTier === 'standard') {
    if (encounterCount >= 7) itemCount = 3;
    else if (encounterCount >= 4) itemCount = 2;
    else itemCount = 1;
  } else if (regionTier === 'advanced') {
    if (encounterCount >= 6) itemCount = 3;
    else if (encounterCount >= 3) itemCount = 2;
    else itemCount = 1;
  } else if (regionTier === 'hard' || regionTier === 'travelling') {
    if (encounterCount >= 5) itemCount = 4;
    else if (encounterCount >= 3) itemCount = 3;
    else itemCount = 2;
  }
  
  // Select random items without duplicates
  const selectedItems: Item[] = [];
  const poolCopy = [...itemPool];
  
  for (let i = 0; i < itemCount && poolCopy.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * poolCopy.length);
    selectedItems.push(poolCopy[randomIndex]);
    poolCopy.splice(randomIndex, 1); // Remove to avoid duplicates
  }
  
  return selectedItems;
}

export function getRandomItemByRarity(rarity: ItemRarity): Item {
  const items = getItemsByRarity(rarity);
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Get a random loot item based on enemy tier
 * Tier determines rarity pools, not level
 * Pools include lower rarities to enable negative magicFind penalties
 * 
 * MINION: 5% Starter, 75% Common, 20% Epic
 * ELITE: 10% Common, 15% Epic, 60% Legendary, 15% Mythic
 * CHAMPION: 5% Epic, 10% Legendary, 15% Mythic, 55% Ultimate, 15% Exalted
 * BOSS: 5% Epic, 45% Legendary, 35% Mythic, 10% Ultimate, 5% Exalted
 * 
 * @param enemyTier - The tier of the enemy
 * @param magicFind - Player's magic find stat (positive increases high rarities, negative increases low rarities)
 */
export function getRandomLootByTier(enemyTier: 'minion' | 'elite' | 'champion' | 'boss' = 'minion', magicFind: number = 0): Item | undefined {
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
  
  // Apply magic find modifier to rarity weights
  // Positive magic find increases weight of higher rarities
  // Negative magic find increases weight of lower rarities
  const modifiedPool = rarityPool.map((entry, index) => {
    // Higher index = higher rarity. Magic find shifts weights toward higher rarities
    const rarityBonus = magicFind * (index / (rarityPool.length - 1));
    // Ensure weight doesn't go below 1
    const newWeight = Math.max(1, entry.weight + rarityBonus);
    return { ...entry, weight: newWeight };
  });
  
  // Weighted random selection of rarity
  const totalWeight = modifiedPool.reduce((sum, item) => sum + item.weight, 0);
  let randomWeight = Math.random() * totalWeight;
  
  let selectedRarity: ItemRarity = 'common';
  for (const item of modifiedPool) {
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
export function getRandomLootByClass(_characterClass: CharacterClass, enemyTier: 'minion' | 'elite' | 'champion' | 'boss' = 'minion', magicFind: number = 0): Item | undefined {
  return getRandomLootByTier(enemyTier, magicFind);
}

/**
 * Get a random shop item based on current act
 * Act determines base rarity pools, magicFind shifts weights toward higher/lower rarities
 * Pools include lower rarities to enable negative magicFind penalties
 * 
 * Act 1: 5% Starter, 60% Common, 30% Epic, 5% Legendary
 * Act 2: 5% Common, 60% Epic, 30% Legendary, 5% Mythic
 * Act 3: 3% Common, 7% Epic, 10% Legendary, 55% Mythic, 20% Ultimate, 5% Exalted
 * Act 4+ (Endless): 2% Epic, 5% Legendary, 60% Mythic, 25% Ultimate, 8% Exalted
 * 
 * @param currentAct - The current act number (1-4+)
 * @param magicFind - Player's magic find stat (positive = better items, negative = worse items)
 * @param excludeIds - Optional array of item IDs to exclude from selection
 */
export function getRandomShopItemByAct(currentAct: number, magicFind: number = 0, excludeIds: string[] = []): Item | undefined {
  let rarityPool: Array<{ rarity: ItemRarity; weight: number }>;
  
  if (currentAct >= 4) {
    rarityPool = SHOP_ENDLESS_POOL as Array<{ rarity: ItemRarity; weight: number }>;
  } else if (currentAct === 3) {
    rarityPool = SHOP_ACT_3_POOL as Array<{ rarity: ItemRarity; weight: number }>;
  } else if (currentAct === 2) {
    rarityPool = SHOP_ACT_2_POOL as Array<{ rarity: ItemRarity; weight: number }>;
  } else {
    rarityPool = SHOP_ACT_1_POOL as Array<{ rarity: ItemRarity; weight: number }>;
  }
  
  // Apply magic find modifier to rarity weights
  // Positive magic find increases weight of higher rarities
  const modifiedPool = rarityPool.map((entry, index) => {
    // Higher index = higher rarity. Magic find shifts weights toward higher rarities
    const rarityBonus = magicFind * (index / (rarityPool.length - 1));
    // Ensure weight doesn't go below 1
    const newWeight = Math.max(1, entry.weight + rarityBonus);
    return { ...entry, weight: newWeight };
  });
  
  // Weighted random selection of rarity
  const totalWeight = modifiedPool.reduce((sum, item) => sum + item.weight, 0);
  let randomWeight = Math.random() * totalWeight;
  
  let selectedRarity: ItemRarity = 'common';
  for (const item of modifiedPool) {
    randomWeight -= item.weight;
    if (randomWeight <= 0) {
      selectedRarity = item.rarity;
      break;
    }
  }
  
  // Get items of the selected rarity (excluding specified IDs and consumables)
  const potentialItems = Object.values(ITEM_DATABASE).filter(
    (item) => 
      item.rarity === selectedRarity && 
      !excludeIds.includes(item.id) &&
      !item.consumable &&
      item.stats && 
      Object.keys(item.stats).length > 0
  );
  
  if (potentialItems.length === 0) return undefined;
  
  return potentialItems[Math.floor(Math.random() * potentialItems.length)];
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

/**
 * Get passive description from ITEM_PASSIVES by ID
 * This eliminates the need to duplicate passive descriptions in items
 */
export function getPassiveDescription(passiveId: PassiveId): string | undefined {
  const passive = getPassiveById(passiveId);
  return passive?.description;
}

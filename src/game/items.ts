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
    speed?: number;
    criticalChance?: number;
    criticalDamage?: number;
    lethality?: number;
    lifeSteal?: number;
    healingOnHit?: number; // Flat healing when attack lands
    
    // Spell
    abilityPower?: number;
    haste?: number;
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
  haste: number;
}

// Default starting items (always available)
export const DEFAULT_STARTING_ITEMS: Item[] = [
  {
    id: 'dorans_blade',
    name: "Doran's Blade",
    description: 'A blade for explorers who deal physical damage',
    rarity: 'starter',
    price: 0,
    imagePath: '/assets/global/images/items/Doran\'s_Blade_item.png',
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
    imagePath: '/assets/global/images/items/Doran\'s_Shield_item.png',
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
    imagePath: '/assets/global/images/items/Doran\'s_Ring_item.png',
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
    imagePath: '/assets/global/images/items/Cull_item.png',
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
    imagePath: '/assets/global/images/items/Dark_Seal_item.png',
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
    onUseEffect: 'Restores 100 health over 5 turns',
  },
 
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
    description: 'Invisible ward that reveals the stats of enemies for the encounter',
    rarity: 'common',
    price: 50,
    stats: {},
    consumable: true,
    onUseEffect: 'Reveals the enemy stats for the remainder of the encounter',
  },
  control_ward: {
    id: 'control_ward',
    name: 'Control Ward',
    description: 'A ward that reveals the stats of enemies for multiple encounters',
    rarity: 'common',
    price: 75,
    stats: {},
    consumable: true,
    onUseEffect: 'Reveals the enemy stats for the next 5 encounters',
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
  poro_snax: {
    id: 'poro_snax',
    name: 'Poro Snax',
    description: 'A treat for poros',
    rarity: 'common',
    price: 0,
    stats: {},
    consumable: true,
    onUseEffect: 'It must do something',
  },

  // Common Items
  
  long_sword: {
    id: 'long_sword',
    name: 'Long Sword',
    description: 'A basic sword for the journey ahead',
    rarity: 'common',
    price: 350,
    imagePath: '/assets/global/images/items/Long_Sword_item.png',
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
    imagePath: '/assets/global/images/items/Cloth_Armor_item.png',
    stats: { armor: 15 },
  },
  amplifying_tome: {
    id: 'amplifying_tome',
    name: 'Amplifying Tome',
    description: 'A simple book to enhance magical power',
    rarity: 'common',
    price: 400,
    imagePath: '/assets/global/images/items/Amplifying_Tome_item.png',
    classes: ['mage', 'enchanter'],
    stats: { abilityPower: 15 },
  },
  ruby_crystal: {
    id: 'ruby_crystal',
    name: 'Ruby Crystal',
    description: 'A glowing gem of inner warmth',
    rarity: 'common',
    price: 400,
    imagePath: '/assets/global/images/items/Ruby_Crystal_item.png',
    classes: ['vanguard', 'warden', 'juggernaut', 'enchanter'],
    stats: { health: 150 },
  },
  sapphire_crystal: {
    id: 'sapphire_crystal',
    name: 'Sapphire Crystal',
    description: 'A crystal that enhances magical abilities',
    rarity: 'common',
    price: 300,
    imagePath: '/assets/global/images/items/Sapphire_Crystal_item.png',
    classes: ['mage', 'enchanter'],
    stats: { xpGain: 0.3 },
  },
  fearie_charm: {
    id: 'fearie_charm',
    name: 'Faerie Charm',
    description: 'A charm that boosts magical abilities',
    rarity: 'common',
    price: 200,
    imagePath: '/assets/global/images/items/Faerie_Charm_item.png',
    classes: ['mage', 'enchanter'],
    stats: { magicFind: 5 },
  },
  dagger: {
    id: 'dagger',
    name: 'Dagger',
    description: 'A small blade for quick strikes',
    rarity: 'common',
    price: 250,
    imagePath: '/assets/global/images/items/Dagger_item.png',
    classes: ['assassin', 'skirmisher', 'marksman'],
    stats: { speed: 0.1 },
  },
  rejuvenation_bead: {
    id: 'rejuvenation_bead',
    name: 'Rejuvenation Bead',
    description: 'A bead that enhances health regeneration',
    rarity: 'common',
    price: 150,
    imagePath: '/assets/global/images/items/Rejuvenation_Bead_item.png',
    classes: ['vanguard', 'warden', 'juggernaut', 'enchanter'],
    stats: { health_regen: 2 },
  },
  boots: {
    id: 'boots',
    name: 'Boots',
    description: 'Basic footwear to increase movement speed',
    rarity: 'common',
    price: 300,
    imagePath: '/assets/global/images/items/Boots_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'vanguard', 'warden', 'juggernaut', 'enchanter'],
    stats: { movementSpeed: 25 },
  },
  pickaxe: {
    id: 'pickaxe',
    name: 'Pickaxe',
    description: 'A powerful mining tool turned weapon',
    rarity: 'common',
    price: 80,
    imagePath: '/assets/global/images/items/Pickaxe_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { attackDamage: 25 },
  },
  null_magic_mantle: {
    id: 'null_magic_mantle',
    name: 'Null-Magic Mantle',
    description: 'Magical protection against spells',
    rarity: 'common',
    price: 400,
    imagePath: '/assets/global/images/items/Null-Magic_Mantle_item.png',
    classes: ['vanguard', 'warden', 'juggernaut', 'skirmisher'],
    stats: { magicResist: 25 },
  },
  blasting_wand: {
    id: 'blasting_wand',
    name: 'Blasting Wand',
    description: 'A wand that amplifies magical power',
    rarity: 'common',
    price: 850,
    imagePath: '/assets/global/images/items/Blasting_Wand_item.png',
    classes: ['mage', 'enchanter'],
    stats: { abilityPower: 40 },
  },
  bf_sword: {
    id: 'bf_sword',
    name: 'B.F. Sword',
    description: 'A massive sword for those who crave power',
    rarity: 'common',
    price: 1300,
    imagePath: '/assets/global/images/items/BF_Sword_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { attackDamage: 40 },
  },
  cloak_of_agility: {
    id: 'cloak_of_agility',
    name: 'Cloak of Agility',
    description: 'A cloak that enhances critical strike capabilities',
    rarity: 'common',
    price: 600,
    imagePath: '/assets/global/images/items/Cloak_of_Agility_item.png',
    classes: ['skirmisher', 'assassin', 'marksman'],
    stats: { criticalChance: 15},
  },
  glowing_mote: {
    id: 'glowing_mote',
    name: 'Glowing Mote',
    description: 'A mysterious mote that enhances haste',
    rarity: 'common',
    price: 250,
    imagePath: '/assets/global/images/items/Glowing_Mote_item.png',
    classes: ['mage', 'enchanter'],
    stats: { haste: 5 },
  },


  // Epic Usables
  
  elixir_of_iron: {
    id: 'elixir_of_iron',
    name: 'Elixir of Iron',
    description: 'Grants a powerful buff for 15 encounters',
    rarity: 'epic',
    price: 500,
    imagePath: '/assets/global/images/items/Elixir_of_Iron_item.png',
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
    imagePath: '/assets/global/images/items/Elixir_of_Sorcery_item.png',
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
    imagePath: '/assets/global/images/items/Elixir_of_Wrath_item.png',
    stats: {},
    consumable: true,
    onUseEffect: 'Gain +30 Attack Damage and +12% Lifesteal for 15 encounters (persists across acts/regions)',
  },

  // Epic Items
  aether_wisp: {
    id: 'aether_wisp',
    name: 'Aether Wisp',
    description: 'A wisp of pure magical energy',
    rarity: 'epic',
    price: 300,
    imagePath: '/assets/global/images/items/Aether_Wisp_item.png',
    classes: ['mage', 'enchanter'],
    stats: { abilityPower: 30, movementSpeed: 40 },
  },
  bamis_cinder: {
    id: 'bamis_cinder',
    name: "Bami's Cinder",
    description: 'A burning cinder that grants health and an aura',
    rarity: 'epic',
    price: 900,
    imagePath: '/assets/global/images/items/Bamis_Cinder_item.png',
    classes: ['vanguard', 'warden', 'juggernaut'],
    stats: { health: 150, haste: 5 },
    passiveId: 'immolate',
    passive: 'Burning Aura: Deals magic damage to nearby enemies each turn',
  },
  bandleglass_mirror: {
    id: 'bandleglass_mirror',
    name: 'Bandleglass Mirror',
    description: 'A mirror that grants a shield and reflects damage',
    rarity: 'epic',
    price: 900,
    imagePath: '/assets/global/images/items/Bandleglass_Mirror_item.png',
    classes: ['vanguard', 'warden', 'juggernaut'],
    stats: { abilityPower: 20, haste: 10, magicFind: 10 },
   },
  blighting_jewel: {
    id: 'blighting_jewel',
    name: 'Blighting Jewel',
    description: 'A jewel that curses enemies on hit',
    rarity: 'epic',
    price: 1100,
    imagePath: '/assets/global/images/items/Blighting_Jewel_item.png',
    classes: ['skirmisher', 'assassin', 'mage', 'enchanter'],
    stats: { abilityPower: 25, magicPenetration: 15 },
    },
  bramble_vest: {
    id: 'bramble_vest',
    name: 'Bramble Vest',
    description: 'A vest that damages attackers and reduces healing',
    rarity: 'epic',
    price: 800,
    imagePath: '/assets/global/images/items/Bramble_Vest_item.png',
    classes: ['vanguard', 'warden', 'juggernaut'],
    stats: { armor: 30 },
    passiveId: 'thorns',
    passive: 'Thorns: When hit by a basic attack, deal magic damage to the attacker and reduce their healing received for 2 turns.',
  },
  catalyst_of_aeons: {
    id: 'catalyst_of_aeons',
    name: 'Catalyst of Aeons',
    description: 'A catalyst that grants health and a shield',
    rarity: 'epic',
    price: 900,
    imagePath: '/assets/global/images/items/Catalyst_of_Aeons_item.png',
    classes: ['vanguard', 'warden', 'juggernaut', 'enchanter'],
    stats: { health: 300, xpGain: .0375 },
    passiveId: 'eternity',
    passive: 'Eternity: At the start of combat, gain a shield equal to 15% of your max health for 3 turns.',
  },
  caufields_warhammer: {
    id: 'caufields_warhammer',
    name: "Caulfield's Warhammer",
    description: 'A warhammer that grants attack damage and a powerful passive',
    rarity: 'epic',
    price: 1050,
    imagePath: '/assets/global/images/items/Caulfields_Warhammer_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { attackDamage: 20, haste: 10 },
  },
  chain_vest: {
    id: 'chain_vest',
    name: 'Chain Vest',
    description: 'A vest that provides solid armor',
    rarity: 'epic',
    price: 800,
    imagePath: '/assets/global/images/items/Chain_Vest_item.png',
    classes: ['vanguard', 'warden', 'juggernaut'],
    stats: { armor: 40 },
  },
  crystalline_bracer: {
    id: 'crystalline_bracer',
    name: 'Crystalline Bracer',
    description: 'A bracer that grants health and a shield',
    rarity: 'epic',
    price: 800,
    imagePath: '/assets/global/images/items/Crystalline_Bracer_item.png',
    classes: ['vanguard', 'warden', 'juggernaut', 'enchanter'],
    stats: { health: 200, health_regen: 10 },
  },
  executioners_calling: {
    id: 'executioners_calling',
    name: "Executioner's Calling",
    description: 'A weapon that applies Grievous Wounds to enemies on hit',
    rarity: 'epic',
    price: 900,
    imagePath: '/assets/global/images/items/Executioners_Calling_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { attackDamage: 15 },
    passiveId: 'grievous_wounds',
    passive: 'Grievous Wounds: Basic attacks and damaging abilities apply Grievous Wounds, reducing healing received by 50% for 2 turns.',
  },
  fated_ashes: {
    id: 'fated_ashes',
    name: 'Fated Ashes',
    description: 'Ashes that grant a powerful shield and a fiery passive',
    rarity: 'epic',
    price: 1000,
    imagePath: '/assets/global/images/items/Fated_Ashes_item.png',
    classes: ['vanguard', 'warden', 'juggernaut'],
    stats: { abilityPower: 30 },
  },
  fiendish_codex: {
    id: 'fiendish_codex',
    name: 'Fiendish Codex',
    description: 'A codex that grants ability power and a powerful passive',
    rarity: 'epic',
    price: 850,
    imagePath: '/assets/global/images/items/Fiendish_Codex_item.png',
    classes: ['mage', 'enchanter'],
    stats: { abilityPower: 25, haste: 10 },
  },
  forbidden_idol: {
    id: 'forbidden_idol',
    name: 'Forbidden Idol',
    description: 'An idol that grants magic resist and a powerful passive',
    rarity: 'epic',
    price: 600,
    imagePath: '/assets/global/images/items/Forbidden_Idol_item.png',
    classes: ['vanguard', 'warden', 'juggernaut', 'enchanter'],
    stats: { magicFind: 5, heal_shield_power: 8 },
  },
  giants_belt: {
    id: 'giants_belt',
    name: "Giant's Belt",
    description: 'A belt that grants a large health boost',
    rarity: 'epic',
    price: 900,
    imagePath: '/assets/global/images/items/Giants_Belt_item.png',
    classes: ['vanguard', 'warden', 'juggernaut'],
    stats: { health: 350 },
  },
  glacial_buckler: {
    id: 'glacial_buckler',
    name: 'Glacial Buckler',
    description: 'A magical buckler that grants armor.',
    rarity: 'epic',
    price: 800,
    imagePath: '/assets/global/images/items/Glacial_Buckler_item.png',
    classes: ['vanguard', 'warden', 'juggernaut'],
    stats: { haste: 10,armor: 25, magicFind: 3, },
  },
  hauting_guise : {
    id: 'haunting_guise',
    name: 'Haunting Guise',
    description: 'A guise that makes you stronger the longer you fight',
    rarity: 'epic',
    price: 1300,
    imagePath: '/assets/global/images/items/Haunting_Guise_item.png',
    classes: ['mage', 'enchanter'],
    stats: { abilityPower: 30, health: 200},
    passiveId: 'madness',
    passive: 'Madness: Gain 5 Ability Power and 5 Magic Find every 2 turns in combat (stacks up to 5 times). Resets after combat.',
  },
  heartbound_axe: {
    id: 'heartbound_axe',
    name: 'Heartbound Axe',
    description: 'An axe that grows stronger as you take damage',
    rarity: 'epic',
    price: 1200,
    imagePath: '/assets/global/images/items/Heartbound_Axe_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { attackDamage: 20, speed: 20 },
  },
  hexdrinker: {
    id: 'hexdrinker',
    name: 'Hexdrinker',
    description: 'A magical item that grants a shield when taking magic damage',
    rarity: 'epic',
    price: 1300,
    imagePath: '/assets/global/images/items/Hexdrinker_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { attackDamage: 25, magicResist: 20 },
    passiveId: 'lifeline',
    passive: 'Lifeline: When you take magic damage that would reduce you below 30% health, gain a shield that absorbs 100 magic damage for 2 turns. Can only trigger once every 5 turns.',
  },
  hextech_alternator: {
    id: 'hextech_alternator',
    name: 'Hextech Alternator',
    description: 'A hextech item that grants attack damage and a powerful passive',
    rarity: 'epic',
    price: 1100,
    imagePath: '/assets/global/images/items/Hextech_Alternator_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { attackDamage: 20, haste: 10 },
    passiveId: 'revved',
    passive: 'Revved: damaging the enemy deals 65 additional damage every 3 turns',
  },
  kindlegem: {
    id: 'kindlegem',
    name: 'Kindlegem',
    description: 'A gem that grants health and a powerful passive',
    rarity: 'epic',
    price: 800, 
    imagePath: '/assets/global/images/items/Kindlegem_item.png',
    classes: ['vanguard', 'warden', 'juggernaut', 'enchanter'],
    stats: { health: 200, haste: 10},
  },
  lest_whisper: {
    id: 'lest_whisper',
    name: "Lest Whisper",
    description: 'A whisper that grants attack damage and a powerful passive',
    rarity: 'epic',
    price: 1450,
    imagePath: '/assets/global/images/items/Lest_Whisper_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { attackDamage: 20, lethality: 20 },
  },
  lifeline: {
    id: 'lifeline',
    name: 'Lifeline',
    description: 'A lifeline that grants a powerful shield when taking damage',
    rarity: 'epic',
    price: 1600,
    imagePath: '/assets/global/images/items/Lifeline_item.png',
    classes: ['vanguard', 'warden', 'juggernaut'],
    stats: { attackDamage: 25, movementSpeed: 40, lethality: 5 },
    passiveId: 'soul_anchor',
    passive: 'Soul Anchor: ' // TBD
  },
  lost_chapter: {
    id: 'lost_chapter',
    name: 'Lost Chapter',
    description: 'A chapter that grants ability power and a powerful passive',
    rarity: 'epic',
    price: 800,
    imagePath: '/assets/global/images/items/Lost_Chapter_item.png',
    classes: ['mage', 'enchanter'],
    stats: { abilityPower: 40, haste: 10, xpGain: 0.3 },
    passiveId: 'enlighten',
    passive: 'Enlighten: When leveling up, get an extra 20% of the XP required for the next level as a bonus.', // Not additively , logarythimic scaling
  },
  negatron_cloak: {
    id: 'negatron_cloak',
    name: 'Negatron Cloak',
    description: 'A cloak that grants magic resist and a powerful passive',
    rarity: 'epic',
    price: 900,
    imagePath: '/assets/global/images/items/Negatron_Cloak_item.png',
    classes: ['vanguard', 'warden', 'juggernaut', 'enchanter'],
    stats: { magicResist: 45 },
  },
  noonquiver: {
    id: 'noonquiver',
    name: 'Noonquiver',
    description: 'A quiver that grants attack damage and critical strike chance',
    rarity: 'epic',
    price: 1300,
    imagePath: '/assets/global/images/items/Noonquiver_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { attackDamage: 20, criticalChance: 20 },
  },
  oblivion_orb: {
    id: 'oblivion_orb',
    name: 'Oblivion Orb',
    description: 'An orb that grants ability power and applies Grievous Wounds',
    rarity: 'epic',
    price: 800,
    imagePath: '/assets/global/images/items/Oblivion_Orb_item.png',
    classes: ['mage', 'enchanter'],
    stats: { abilityPower: 25 },
    passiveId: 'grievous_wounds',
    passive: 'Grievous Wounds: Damaging enemies with abilities applies Grievous Wounds, reducing their healing received by 50% for 2 turns.',
  },
  phage: {
    id: 'phage',
    name: 'Phage',
    description: 'A weapon that grants attack damage, health, and a powerful passive',
    rarity: 'epic',
    price: 1100,
    imagePath: '/assets/global/images/items/Phage_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { attackDamage: 15, health: 200 },
    passiveId: 'rage',
    passive: 'Rage: Basic attacks grant 20% increased movement speed for 2 turns (stacks up to 3 times).',
  },
  quicksilver_sash: {
    id: 'quicksilver_sash',
    name: 'Quicksilver Sash',
    description: 'A sash that grants magic resist and a powerful active',
    rarity: 'epic',
    price: 1300,
    imagePath: '/assets/global/images/items/Quicksilver_Sash_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { magicResist: 25 },
    passiveId: 'quicksilver',
    passive: 'Quicksilver: Removes all crowd control effects and grants 50% tenacity for 1 turn. Cooldown: 3 turns.',
  },
  rectrix: {
    id: 'rectrix',
    name: 'Rectrix',
    description: 'A weapon that grants attack damage and a powerful passive',
    rarity: 'epic',
    price: 775,
    imagePath: '/assets/global/images/items/Rectrix_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { movementSpeed: 40, attackDamage: 15 },
  },
  recurve_bow: {
    id: 'recurve_bow',
    name: 'Recurve Bow',
    description: 'A bow that grants attack damage and a powerful passive',
    rarity: 'epic',
    price: 700,
    imagePath: '/assets/global/images/items/Recurve_Bow_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { speed: 15 },
    passiveId: 'sting',
    passive: 'Sting: Attacks deals an additional 15 damage on-hit.',
  },
  scouts_sligshot: {
    id: 'scouts_slingshot',
    name: "Scout's Slingshot",
    description: 'A slingshot that grants attack damage and a powerful passive',
    rarity: 'epic',
    price: 600,
    imagePath: '/assets/global/images/items/Scouts_Slingshot_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { speed: 20 },
    passiveId: 'bullseyes',
    passive: 'Bullseyes: ', //TBD
  },
  seekers_armguard: {
    id: 'seekers_armguard',
    name: "Seeker's Armguard",
    description: 'An armguard that grants armor and a delaying passive',
    rarity: 'epic',
    price: 800,
    imagePath: '/assets/global/images/items/Seekers_Armguard_item.png',
    classes: ['vanguard', 'warden', 'juggernaut','mage', 'enchanter'],
    stats: { armor: 20, haste: 10 },
    passiveId: 'time_stop',
    passive: 'Time Stop: When taking damage that would reduce you below 1hp, enter stasis for 1 turn instead (once per encounter).',
  },
  serrated_dirk: {
    id: 'serrated_dirk',
    name: 'Serrated Dirk',
    description: 'A dirk that grants attack damage and lethality',
    rarity: 'epic',
    price: 1000,
    imagePath: '/assets/global/images/items/Serrated_Dirk_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { attackDamage: 20, lethality: 10 },
  },
  sheen: {
    id: 'sheen',
    name: 'Sheen',
    description: 'A sheen that grants a powerful passive',
    rarity: 'epic',
    price: 700,
    imagePath: '/assets/global/images/items/Sheen_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { haste: 10 },
    passiveId: 'spellblade',
    passive: 'Spellblade: After using an ability, your next basic attack deals bonus damage equal to 50% of your total attack damage. 2 turns cooldown.',
  },
  spectre_cowl: {
    id: 'spectre_cowl',
    name: 'Spectre Cowl',
    description: 'A cowl that grants magic resist and a powerful passive',
    rarity: 'epic',
    price: 1250,
    imagePath: '/assets/global/images/items/Spectre_Cowl_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { magicResist: 35, health: 200, health_regen: 10 },
  },
  steel_sigil: {
    id: 'steel_sigil',
    name: 'Steel Sigil',
    description: 'A sigil that grants armor and attack damage',
    rarity: 'epic',
    price: 1100,
    imagePath: '/assets/global/images/items/Steel_Sigil_item.png',
    classes: ['vanguard', 'warden', 'juggernaut'],
    stats: { armor: 30, attackDamage: 15 },
  },
  the_brutalizer: {
    id: 'the_brutalizer',
    name: 'The Brutalizer',
    description: 'A brutalizer',
    rarity: 'epic',
    price: 1100,
    imagePath: '/assets/global/images/items/The_Brutalizer_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { attackDamage: 25, haste: 10, lethality: 5 },
  },
  tiamat: {
    id: 'tiamat',
    name: 'Tiamat',
    description: 'A tiamat',
    rarity: 'epic',
    price: 1200,
    imagePath: '/assets/global/images/items/Tiamat_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { attackDamage: 20 },
    passiveId: 'crescent',
   passive: 'Crescent: .', //TBD
  },
  tunneler: {
    id: 'tunneler',
    name: 'Tunneler',
    description: 'A tunneler',
    rarity: 'epic',
    price: 1150,
    imagePath: '/assets/global/images/items/Tunneler_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { attackDamage: 15, health: 250 },
  },
  vampiric_scepter: {
    id: 'vampiric_scepter',
    name: 'Vampiric Scepter',
    description: 'A scepter that grants attack damage and lifesteal',
    rarity: 'epic',
    price: 900,
    imagePath: '/assets/global/images/items/Vampiric_Scepter_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { attackDamage: 15, lifeSteal: 7 },
  },
  verdant_barrier: {
    id: 'verdant_barrier',
    name: 'Verdant Barrier',
    description: 'A barrier that grants magic resist and a powerful passive',
    rarity: 'epic',
    price: 1600,
    imagePath: '/assets/global/images/items/Verdant_Barrier_item.png',
    classes: ['vanguard', 'warden', 'juggernaut', 'enchanter'],
    stats: { magicResist: 30, health: 150 },
    passiveId: 'annul',
    passive: 'Annul: Blocks the first spell that hits you each encounter',
  },
  wardens_mail: {
    id: 'wardens_mail',
    name: "Warden's Mail",
    description: "A mail that grants armor and a powerful passive",
    rarity: 'epic',
    price: 1000,
    imagePath: '/assets/global/images/items/Wardens_Mail_item.png',
    classes: ['vanguard', 'warden', 'juggernaut'],
    stats: { armor: 40 },
    passiveId: 'rock_solid',
    passive: 'Rock Solid: Every instance of damage is reduced 15, with a maximum reduction of 20% of the orginal amount.',
  },
  winged_moonplate: {
    id: 'winged_moonplate',
    name: 'Winged Moonplate',
    description: 'A moonplate that grants armor and a powerful passive',
    rarity: 'epic',
    price: 800,
    imagePath: '/assets/global/images/items/Winged_Moonplate_item.png',
    classes: ['vanguard', 'warden', 'juggernaut'],
    stats: { armor: 30, movementSpeed: 40 },
  },
  zeal: {
    id: 'zeal',
    name: 'Zeal',
    description: 'A zeal that grants attack speed and critical strike chance',
    rarity: 'epic',
    price: 1200,
    imagePath: '/assets/global/images/items/Zeal_item.png',
    classes: ['skirmisher', 'assassin', 'marksman', 'juggernaut'],
    stats: { speed: 20, criticalChance: 20, movementSpeed: 40 },
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
    stats: { abilityPower: 60, speed: 0.5, health: 200 },
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
      speed: 0.5,
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
    stats: { abilityPower: 80, speed: 0.3, health: 200 },
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
  },
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

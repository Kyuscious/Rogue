import { Character } from '../../types';
import { DEFAULT_STATS } from '../../statsSystem';

// Ionia minion-tier enemies
export const IONIA_MINIONS: Character[] = [
  // Faction: Spirit (magical beings and spirit walkers)
  {
    id: 'ionia_spirit_walker',
    name: 'Spirit Walker',
    role: 'enemy',
    class: 'mage',
    region: 'ionia',
    tier: 'minion',
    faction: 'spirit',
    hp: 40,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 40,
      attackDamage: 5,
      abilityPower: 12,
      magicResist: 8,
      attackSpeed: 0.7,
    },
  },
  {
    id: 'ionia_shadow_assassin',
    name: 'Shadow Assassin',
    role: 'enemy',
    class: 'assassin',
    region: 'ionia',
    tier: 'minion',
    faction: 'shadow',
    hp: 35,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 35,
      attackDamage: 12,
      abilityPower: 8,
      movementSpeed: 160,
      attackSpeed: 0.9,
    },
  },
  {
    id: 'ionia_kinkou_ninja',
    name: 'Kinkou Ninja',
    role: 'enemy',
    class: 'skirmisher',
    region: 'ionia',
    tier: 'minion',
    faction: 'martial',
    hp: 50,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 50,
      attackDamage: 10,
      abilityPower: 6,
      movementSpeed: 140,
      attackSpeed: 0.8,
    },
  },
  // Faction: Vastayan (animal-like magical creatures)
  {
    id: 'ionia_vastayan_hunter',
    name: 'Vastayan Hunter',
    role: 'enemy',
    class: 'marksman',
    region: 'ionia',
    tier: 'minion',
    faction: 'vastayan',
    hp: 42,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 42,
      attackDamage: 11,
      abilityPower: 5,
      movementSpeed: 145,
      attackSpeed: 0.85,
    },
  },
  {
    id: 'ionia_forest_spirit',
    name: 'Forest Spirit',
    role: 'enemy',
    class: 'enchanter',
    region: 'ionia',
    tier: 'minion',
    faction: 'spirit',
    hp: 38,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 38,
      attackDamage: 4,
      abilityPower: 14,
      magicResist: 10,
      attackSpeed: 0.6,
    },
  },
];

// Ionia elite-tier enemies
export const IONIA_ELITES: Character[] = [
  {
    id: 'ionia_master_swordsman',
    name: 'Master Swordsman',
    role: 'enemy',
    class: 'skirmisher',
    region: 'ionia',
    tier: 'elite',
    faction: 'martial',
    hp: 110,
    abilities: [],
    level: 3,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 110,
      attackDamage: 38,
      abilityPower: 20,
      armor: 10,
      movementSpeed: 150,
      attackSpeed: 0.75,
    },
  },
  {
    id: 'ionia_spirit_blossom',
    name: 'Spirit Blossom',
    role: 'enemy',
    class: 'mage',
    region: 'ionia',
    tier: 'elite',
    faction: 'spirit',
    hp: 95,
    abilities: [],
    level: 3,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 95,
      attackDamage: 15,
      abilityPower: 45,
      magicResist: 20,
      attackSpeed: 0.6,
    },
  },
  {
    id: 'ionia_vastayan_elder',
    name: 'Vastayan Elder',
    role: 'enemy',
    class: 'juggernaut',
    region: 'ionia',
    tier: 'elite',
    faction: 'vastayan',
    hp: 125,
    abilities: [],
    level: 3,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 125,
      attackDamage: 32,
      abilityPower: 25,
      armor: 15,
      magicResist: 15,
      attackSpeed: 0.6,
    },
  },
];

// Ionia boss-tier enemies
export const IONIA_BOSSES: Character[] = [
  {
    id: 'ionia_shadow_reaper',
    name: 'Shadow Reaper',
    role: 'enemy',
    class: 'assassin',
    region: 'ionia',
    tier: 'boss',
    faction: 'shadow',
    hp: 130,
    abilities: [],
    level: 5,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 130,
      attackDamage: 60,
      abilityPower: 40,
      armor: 20,
      movementSpeed: 170,
      attackSpeed: 0.85,
    },
  },
  {
    id: 'ionia_ancient_spirit',
    name: 'Ancient Spirit',
    role: 'enemy',
    class: 'mage',
    region: 'ionia',
    tier: 'boss',
    faction: 'spirit',
    hp: 140,
    abilities: [],
    level: 5,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 140,
      attackDamage: 20,
      abilityPower: 85,
      armor: 15,
      magicResist: 30,
      attackSpeed: 0.5,
    },
  },
  {
    id: 'ionia_wuju_bladesman',
    name: 'Wuju Bladesman',
    role: 'enemy',
    class: 'skirmisher',
    region: 'ionia',
    tier: 'boss',
    faction: 'martial',
    hp: 145,
    abilities: [],
    level: 5,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 145,
      attackDamage: 65,
      abilityPower: 30,
      armor: 25,
      movementSpeed: 155,
      attackSpeed: 0.8,
    },
  },
];

// Ionia champion-tier enemies
export const IONIA_CHAMPIONS: Character[] = [
  {
    id: 'yasuo',
    name: 'Yasuo',
    role: 'enemy',
    class: 'skirmisher',
    region: 'ionia',
    tier: 'champion',
    faction: 'martial',
    hp: 210,
    abilities: [],
    level: 10,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 210,
      attackDamage: 75,
      abilityPower: 40,
      armor: 35,
      movementSpeed: 160,
      attackSpeed: 0.9,
    },
  },
  {
    id: 'ahri',
    name: 'Ahri',
    role: 'enemy',
    class: 'mage',
    region: 'ionia',
    tier: 'champion',
    faction: 'vastayan',
    hp: 190,
    abilities: [],
    level: 10,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 190,
      attackDamage: 30,
      abilityPower: 90,
      armor: 25,
      magicResist: 35,
      movementSpeed: 150,
      attackSpeed: 0.7,
    },
  },
];

// Ionia legend-tier enemies (ultra rare/endgame)
export const IONIA_LEGENDS: Character[] = [
  // TODO: Add legendary enemies like Master Yi, Zed, Shen, Karma for Ionia.
];

export function getIoniaEnemyById(id: string): Character | undefined {
  const allEnemies = [...IONIA_MINIONS, ...IONIA_ELITES, ...IONIA_CHAMPIONS, ...IONIA_BOSSES];
  const enemy = allEnemies.find((e) => e.id === id);
  
  // Return a deep copy to prevent mutation of the original enemy object
  if (!enemy) return undefined;
  return {
    ...enemy,
    stats: { ...enemy.stats },
    abilities: [...enemy.abilities],
    inventory: enemy.inventory ? [...enemy.inventory] : undefined,
  };
}

export function getRandomIoniaEnemy(tier: 'minion' | 'elite' | 'boss' | 'champion' | 'legend' ): Character {
  let pool: Character[] = [];
  if (tier === 'minion') pool = IONIA_MINIONS;
  if (tier === 'elite') pool = IONIA_ELITES;
  if (tier === 'champion') pool = IONIA_CHAMPIONS;
  if (tier === 'boss') pool = IONIA_BOSSES;
  if (tier === 'legend') pool = IONIA_LEGENDS;
  
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Get minions from a specific faction
 * Factions: 'spirit' (magical spirits), 'martial' (ninjas/warriors), 'vastayan' (magical creatures), 'shadow' (assassins)
 */
export function getIoniaMinionsFromFaction(faction: 'spirit' | 'martial' | 'vastayan' | 'shadow'): Character[] {
  return IONIA_MINIONS.filter(m => m.faction === faction);
}

/**
 * Get elites from a specific faction
 */
export function getIoniaElitesFromFaction(faction: 'spirit' | 'martial' | 'vastayan' | 'shadow'): Character[] {
  return IONIA_ELITES.filter(e => e.faction === faction);
}

/**
 * Get bosses from a specific faction
 */
export function getIoniaBossesFromFaction(faction: 'spirit' | 'martial' | 'vastayan' | 'shadow'): Character[] {
  return IONIA_BOSSES.filter(b => b.faction === faction);
}

/**
 * Get an enemy by tier and faction
 */
export function getIoniaEnemyByTierAndFaction(tier: 'minion' | 'elite' | 'boss', faction: 'spirit' | 'martial' | 'vastayan' | 'shadow'): Character {
  let pool: Character[] = [];
  if (tier === 'minion') pool = getIoniaMinionsFromFaction(faction);
  else if (tier === 'elite') pool = getIoniaElitesFromFaction(faction);
  else if (tier === 'boss') pool = getIoniaBossesFromFaction(faction);
  
  if (pool.length === 0) {
    // Fallback to any enemy of that tier
    if (tier === 'minion') pool = IONIA_MINIONS;
    else if (tier === 'elite') pool = IONIA_ELITES;
    else if (tier === 'boss') pool = IONIA_BOSSES;
  }
  
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Resolve an enemy ID, which can be either:
 * - A static ID like 'yasuo' or 'ionia_spirit_walker'
 * - A random selector like 'random:minion:spirit' which expands to a random spirit minion
 * 
 * Format: 'random:tier:faction'
 * Example: 'random:minion:spirit' -> random spirit minion
 */
export function resolveIoniaEnemyId(enemyIdOrMarker: string): string {
  if (!enemyIdOrMarker.startsWith('random:')) {
    // Static ID, return as-is
    return enemyIdOrMarker;
  }

  // Parse the random marker: 'random:tier:faction'
  const parts = enemyIdOrMarker.split(':');
  if (parts.length !== 3) {
    console.warn('Invalid random enemy marker:', enemyIdOrMarker);
    return 'ionia_spirit_walker'; // Fallback
  }

  const [, tier, faction] = parts;
  const enemy = getIoniaEnemyByTierAndFaction(
    tier as 'minion' | 'elite' | 'boss',
    faction as 'spirit' | 'martial' | 'vastayan' | 'shadow'
  );
  
  return enemy.id;
}

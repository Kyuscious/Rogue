import { Character } from '../../types';
import { DEFAULT_STATS } from '../../statsSystem';

// Runeterra enemies
// These are non-region-specific enemies, neutral monsters, and champions that don't belong to a specific region

// Generic minion-tier enemies (bandits, mercenaries, wild creatures)
export const RUNETERRA_MINIONS: Character[] = [
  {
    id: 'runeterra_bandit',
    name: 'Runeterra Bandit',
    role: 'enemy',
    class: 'assassin',
    region: 'runeterra',
    tier: 'minion',
    faction: 'criminal',
    hp: 40,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 40,
      attackDamage: 12,
      armor: 5,
      movementSpeed: 145,
      attackSpeed: 0.7,
    },
  },
  {
    id: 'runeterra_mercenary',
    name: 'Mercenary',
    role: 'enemy',
    class: 'skirmisher',
    region: 'runeterra',
    tier: 'minion',
    faction: 'mercenary',
    hp: 48,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 48,
      attackDamage: 11,
      armor: 6,
      attackSpeed: 0.65,
    },
  },
  {
    id: 'runeterra_void_spawn',
    name: 'Void Spawn',
    role: 'enemy',
    class: 'skirmisher',
    region: 'runeterra',
    tier: 'minion',
    faction: 'void',
    hp: 45,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 45,
      attackDamage: 13,
      abilityPower: 8,
      movementSpeed: 140,
      attackSpeed: 0.75,
    },
  },
  {
    id: 'runeterra_dragon_whelp',
    name: 'Dragon Whelp',
    role: 'enemy',
    class: 'juggernaut',
    region: 'runeterra',
    tier: 'minion',
    faction: 'dragon',
    hp: 55,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 55,
      attackDamage: 10,
      abilityPower: 10,
      armor: 7,
      magicResist: 7,
      attackSpeed: 0.6,
    },
  },
  {
    id: 'runeterra_rogue_mage',
    name: 'Rogue Mage',
    role: 'enemy',
    class: 'mage',
    region: 'runeterra',
    tier: 'minion',
    faction: 'mercenary',
    hp: 38,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 38,
      attackDamage: 5,
      abilityPower: 14,
      magicResist: 8,
      attackSpeed: 0.6,
    },
  },
];

// Elite-tier enemies
export const RUNETERRA_ELITES: Character[] = [
  {
    id: 'runeterra_elder_dragon',
    name: 'Elder Dragon',
    role: 'enemy',
    class: 'juggernaut',
    region: 'runeterra',
    tier: 'elite',
    faction: 'dragon',
    hp: 135,
    abilities: [],
    level: 3,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 135,
      attackDamage: 35,
      abilityPower: 30,
      armor: 20,
      magicResist: 20,
      attackSpeed: 0.6,
    },
  },
  {
    id: 'runeterra_void_hunter',
    name: 'Void Hunter',
    role: 'enemy',
    class: 'assassin',
    region: 'runeterra',
    tier: 'elite',
    faction: 'void',
    hp: 105,
    abilities: [],
    level: 3,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 105,
      attackDamage: 42,
      abilityPower: 25,
      armor: 12,
      movementSpeed: 155,
      attackSpeed: 0.75,
    },
  },
  {
    id: 'runeterra_warlord',
    name: 'Warlord',
    role: 'enemy',
    class: 'juggernaut',
    region: 'runeterra',
    tier: 'elite',
    faction: 'mercenary',
    hp: 125,
    abilities: [],
    level: 3,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 125,
      attackDamage: 38,
      armor: 18,
      magicResist: 10,
      attackSpeed: 0.6,
    },
  },
];

// Boss-tier enemies
export const RUNETERRA_BOSSES: Character[] = [
  {
    id: 'runeterra_ancient_dragon',
    name: 'Ancient Dragon',
    role: 'enemy',
    class: 'juggernaut',
    region: 'runeterra',
    tier: 'boss',
    faction: 'dragon',
    hp: 170,
    abilities: [],
    level: 5,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 170,
      attackDamage: 55,
      abilityPower: 50,
      armor: 32,
      magicResist: 32,
      attackSpeed: 0.55,
    },
  },
  {
    id: 'runeterra_void_terror',
    name: 'Void Terror',
    role: 'enemy',
    class: 'juggernaut',
    region: 'runeterra',
    tier: 'boss',
    faction: 'void',
    hp: 165,
    abilities: [],
    level: 5,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 165,
      attackDamage: 60,
      abilityPower: 60,
      armor: 25,
      magicResist: 25,
      attackSpeed: 0.65,
    },
  },
  {
    id: 'runeterra_bandit_king',
    name: 'Bandit King',
    role: 'enemy',
    class: 'assassin',
    region: 'runeterra',
    tier: 'boss',
    faction: 'criminal',
    hp: 150,
    abilities: [],
    level: 5,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 150,
      attackDamage: 70,
      armor: 22,
      movementSpeed: 165,
      attackSpeed: 0.8,
    },
  },
];

// Champion-tier enemies (non-region champions like Janna, Brand, Bard, etc.)
export const RUNETERRA_CHAMPIONS: Character[] = [
  {
    id: 'janna',
    name: 'Janna',
    role: 'enemy',
    class: 'enchanter',
    region: 'runeterra',
    tier: 'champion',
    faction: 'elemental',
    hp: 185,
    abilities: [],
    level: 10,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 185,
      attackDamage: 25,
      abilityPower: 85,
      armor: 28,
      magicResist: 38,
      movementSpeed: 155,
      attackSpeed: 0.65,
    },
  },
  {
    id: 'brand',
    name: 'Brand',
    role: 'enemy',
    class: 'mage',
    region: 'runeterra',
    tier: 'champion',
    faction: 'elemental',
    hp: 195,
    abilities: [],
    level: 10,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 195,
      attackDamage: 28,
      abilityPower: 95,
      armor: 25,
      magicResist: 32,
      attackSpeed: 0.6,
    },
  },
  {
    id: 'ryze',
    name: 'Ryze',
    role: 'enemy',
    class: 'mage',
    region: 'runeterra',
    tier: 'champion',
    faction: 'wanderer',
    hp: 200,
    abilities: [],
    level: 10,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 200,
      attackDamage: 30,
      abilityPower: 90,
      armor: 30,
      magicResist: 35,
      attackSpeed: 0.65,
    },
  },
];

// Legend-tier enemies
export const RUNETERRA_LEGENDS: Character[] = [
  // TODO: Add legendary enemies like Aurelion Sol, Bard, or cosmic entities
];

export function getRuneterraEnemyById(id: string): Character | undefined {
  const allEnemies = [...RUNETERRA_MINIONS, ...RUNETERRA_ELITES, ...RUNETERRA_CHAMPIONS, ...RUNETERRA_BOSSES];
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

export function getRandomRuneterraEnemy(tier: 'minion' | 'elite' | 'boss' | 'champion' | 'legend' ): Character {
  let pool: Character[] = [];
  if (tier === 'minion') pool = RUNETERRA_MINIONS;
  if (tier === 'elite') pool = RUNETERRA_ELITES;
  if (tier === 'champion') pool = RUNETERRA_CHAMPIONS;
  if (tier === 'boss') pool = RUNETERRA_BOSSES;
  if (tier === 'legend') pool = RUNETERRA_LEGENDS;
  
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Get minions from a specific faction
 * Factions: 'criminal' (bandits), 'mercenary' (hired fighters), 'void' (void creatures), 'dragon' (dragons), 'elemental' (elementals)
 */
export function getRuneterraMinionsFromFaction(faction: 'criminal' | 'mercenary' | 'void' | 'dragon'): Character[] {
  return RUNETERRA_MINIONS.filter(m => m.faction === faction);
}

/**
 * Get elites from a specific faction
 */
export function getRuneterraElitesFromFaction(faction: 'criminal' | 'mercenary' | 'void' | 'dragon'): Character[] {
  return RUNETERRA_ELITES.filter(e => e.faction === faction);
}

/**
 * Get bosses from a specific faction
 */
export function getRuneterraBossesFromFaction(faction: 'criminal' | 'mercenary' | 'void' | 'dragon'): Character[] {
  return RUNETERRA_BOSSES.filter(b => b.faction === faction);
}

/**
 * Get an enemy by tier and faction
 */
export function getRuneterraEnemyByTierAndFaction(tier: 'minion' | 'elite' | 'boss', faction: 'criminal' | 'mercenary' | 'void' | 'dragon'): Character {
  let pool: Character[] = [];
  if (tier === 'minion') pool = getRuneterraMinionsFromFaction(faction);
  else if (tier === 'elite') pool = getRuneterraElitesFromFaction(faction);
  else if (tier === 'boss') pool = getRuneterraBossesFromFaction(faction);
  
  if (pool.length === 0) {
    // Fallback to any enemy of that tier
    if (tier === 'minion') pool = RUNETERRA_MINIONS;
    else if (tier === 'elite') pool = RUNETERRA_ELITES;
    else if (tier === 'boss') pool = RUNETERRA_BOSSES;
  }
  
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Resolve an enemy ID, which can be either:
 * - A static ID like 'janna' or 'runeterra_bandit'
 * - A random selector like 'random:minion:void' which expands to a random void minion
 * 
 * Format: 'random:tier:faction'
 * Example: 'random:minion:void' -> random void minion
 */
export function resolveRuneterraEnemyId(enemyIdOrMarker: string): string {
  if (!enemyIdOrMarker.startsWith('random:')) {
    // Static ID, return as-is
    return enemyIdOrMarker;
  }

  // Parse the random marker: 'random:tier:faction'
  const parts = enemyIdOrMarker.split(':');
  if (parts.length !== 3) {
    console.warn('Invalid random enemy marker:', enemyIdOrMarker);
    return 'runeterra_bandit'; // Fallback
  }

  const [, tier, faction] = parts;
  const enemy = getRuneterraEnemyByTierAndFaction(
    tier as 'minion' | 'elite' | 'boss',
    faction as 'criminal' | 'mercenary' | 'void' | 'dragon'
  );
  
  return enemy.id;
}

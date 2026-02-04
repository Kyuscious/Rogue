import { Character } from '../../types';
import { DEFAULT_STATS } from '../../statsSystem';

// Shurima minion-tier enemies
export const SHURIMA_MINIONS: Character[] = [
  // Faction: Sand Warrior (ancient constructs and sand soldiers)
  {
    id: 'shurima_sand_soldier',
    name: 'Sand Soldier',
    role: 'enemy',
    class: 'juggernaut',
    region: 'shurima',
    tier: 'minion',
    faction: 'construct',
    hp: 52,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 52,
      attackDamage: 9,
      abilityPower: 7,
      armor: 6,
      speed: 0.6,
    },
  },
  {
    id: 'shurima_tomb_guardian',
    name: 'Tomb Guardian',
    role: 'enemy',
    class: 'vanguard',
    region: 'shurima',
    tier: 'minion',
    faction: 'construct',
    hp: 60,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 60,
      attackDamage: 7,
      abilityPower: 8,
      armor: 8,
      magicResist: 6,
      speed: 0.5,
    },
  },
  {
    id: 'shurima_desert_nomad',
    name: 'Desert Nomad',
    role: 'enemy',
    class: 'marksman',
    region: 'shurima',
    tier: 'minion',
    faction: 'mortal',
    hp: 44,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 44,
      attackDamage: 11,
      abilityPower: 4,
      movementSpeed: 140,
      speed: 0.8,
    },
  },
  // Faction: Beast (desert creatures)
  {
    id: 'shurima_sand_scarab',
    name: 'Sand Scarab',
    role: 'enemy',
    class: 'skirmisher',
    region: 'shurima',
    tier: 'minion',
    faction: 'beast',
    hp: 48,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 48,
      attackDamage: 10,
      armor: 5,
      movementSpeed: 135,
      speed: 0.75,
    },
  },
  {
    id: 'shurima_sun_priest',
    name: 'Sun Priest',
    role: 'enemy',
    class: 'mage',
    region: 'shurima',
    tier: 'minion',
    faction: 'mortal',
    hp: 40,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 40,
      attackDamage: 5,
      abilityPower: 13,
      magicResist: 8,
      speed: 0.6,
    },
  },
];

// Shurima elite-tier enemies
export const SHURIMA_ELITES: Character[] = [
  {
    id: 'shurima_ascended_warrior',
    name: 'Ascended Warrior',
    role: 'enemy',
    class: 'juggernaut',
    region: 'shurima',
    tier: 'elite',
    faction: 'construct',
    hp: 130,
    abilities: [],
    level: 3,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 130,
      attackDamage: 35,
      abilityPower: 25,
      armor: 18,
      magicResist: 12,
      speed: 0.6,
    },
  },
  {
    id: 'shurima_sun_disc_keeper',
    name: 'Sun Disc Keeper',
    role: 'enemy',
    class: 'mage',
    region: 'shurima',
    tier: 'elite',
    faction: 'mortal',
    hp: 100,
    abilities: [],
    level: 3,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 100,
      attackDamage: 18,
      abilityPower: 48,
      armor: 12,
      magicResist: 20,
      speed: 0.6,
    },
  },
  {
    id: 'shurima_xer_sai_tunneler',
    name: 'Xer\'Sai Tunneler',
    role: 'enemy',
    class: 'skirmisher',
    region: 'shurima',
    tier: 'elite',
    faction: 'beast',
    hp: 115,
    abilities: [],
    level: 3,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 115,
      attackDamage: 40,
      abilityPower: 10,
      armor: 14,
      movementSpeed: 145,
      speed: 0.7,
    },
  },
];

// Shurima boss-tier enemies
export const SHURIMA_BOSSES: Character[] = [
  {
    id: 'shurima_emperor_construct',
    name: 'Emperor\'s Construct',
    role: 'enemy',
    class: 'warden',
    region: 'shurima',
    tier: 'boss',
    faction: 'construct',
    hp: 160,
    abilities: [],
    level: 5,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 160,
      attackDamage: 45,
      abilityPower: 55,
      armor: 28,
      magicResist: 25,
      speed: 0.5,
    },
  },
  {
    id: 'shurima_desert_tyrant',
    name: 'Desert Tyrant',
    role: 'enemy',
    class: 'juggernaut',
    region: 'shurima',
    tier: 'boss',
    faction: 'beast',
    hp: 155,
    abilities: [],
    level: 5,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 155,
      attackDamage: 65,
      abilityPower: 30,
      armor: 30,
      movementSpeed: 140,
      speed: 0.65,
    },
  },
  {
    id: 'shurima_sun_guardian',
    name: 'Sun Guardian',
    role: 'enemy',
    class: 'mage',
    region: 'shurima',
    tier: 'boss',
    faction: 'mortal',
    hp: 145,
    abilities: [],
    level: 5,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 145,
      attackDamage: 25,
      abilityPower: 88,
      armor: 18,
      magicResist: 32,
      speed: 0.5,
    },
  },
];

// Shurima champion-tier enemies
export const SHURIMA_CHAMPIONS: Character[] = [
  {
    id: 'nasus',
    name: 'Nasus',
    role: 'enemy',
    class: 'juggernaut',
    region: 'shurima',
    tier: 'champion',
    faction: 'construct',
    hp: 220,
    abilities: [],
    level: 10,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 220,
      attackDamage: 80,
      abilityPower: 50,
      armor: 45,
      magicResist: 35,
      speed: 0.65,
    },
  },
  {
    id: 'azir',
    name: 'Azir',
    role: 'enemy',
    class: 'mage',
    region: 'shurima',
    tier: 'champion',
    faction: 'construct',
    hp: 200,
    abilities: [],
    level: 10,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 200,
      attackDamage: 35,
      abilityPower: 95,
      armor: 30,
      magicResist: 40,
      speed: 0.6,
    },
  },
];

// Shurima legend-tier enemies (ultra rare/endgame)
export const SHURIMA_LEGENDS: Character[] = [
  // TODO: Add legendary enemies like Xerath, Renekton for Shurima.
];

export function getShurimaEnemyById(id: string): Character | undefined {
  const allEnemies = [...SHURIMA_MINIONS, ...SHURIMA_ELITES, ...SHURIMA_CHAMPIONS, ...SHURIMA_BOSSES];
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

export function getRandomShurimaEnemy(tier: 'minion' | 'elite' | 'boss' | 'champion' | 'legend' ): Character {
  let pool: Character[] = [];
  if (tier === 'minion') pool = SHURIMA_MINIONS;
  if (tier === 'elite') pool = SHURIMA_ELITES;
  if (tier === 'champion') pool = SHURIMA_CHAMPIONS;
  if (tier === 'boss') pool = SHURIMA_BOSSES;
  if (tier === 'legend') pool = SHURIMA_LEGENDS;
  
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Get minions from a specific faction
 * Factions: 'construct' (sand soldiers/ancient warriors), 'mortal' (desert dwellers), 'beast' (desert creatures)
 */
export function getShurimaMinionsFromFaction(faction: 'construct' | 'mortal' | 'beast'): Character[] {
  return SHURIMA_MINIONS.filter(m => m.faction === faction);
}

/**
 * Get elites from a specific faction
 */
export function getShurimaElitesFromFaction(faction: 'construct' | 'mortal' | 'beast'): Character[] {
  return SHURIMA_ELITES.filter(e => e.faction === faction);
}

/**
 * Get bosses from a specific faction
 */
export function getShurimaBossesFromFaction(faction: 'construct' | 'mortal' | 'beast'): Character[] {
  return SHURIMA_BOSSES.filter(b => b.faction === faction);
}

/**
 * Get an enemy by tier and faction
 */
export function getShurimaEnemyByTierAndFaction(tier: 'minion' | 'elite' | 'boss', faction: 'construct' | 'mortal' | 'beast'): Character {
  let pool: Character[] = [];
  if (tier === 'minion') pool = getShurimaMinionsFromFaction(faction);
  else if (tier === 'elite') pool = getShurimaElitesFromFaction(faction);
  else if (tier === 'boss') pool = getShurimaBossesFromFaction(faction);
  
  if (pool.length === 0) {
    // Fallback to any enemy of that tier
    if (tier === 'minion') pool = SHURIMA_MINIONS;
    else if (tier === 'elite') pool = SHURIMA_ELITES;
    else if (tier === 'boss') pool = SHURIMA_BOSSES;
  }
  
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Resolve an enemy ID, which can be either:
 * - A static ID like 'azir' or 'shurima_sand_soldier'
 * - A random selector like 'random:minion:construct' which expands to a random construct minion
 * 
 * Format: 'random:tier:faction'
 * Example: 'random:minion:construct' -> random construct minion
 */
export function resolveShurimaEnemyId(enemyIdOrMarker: string): string {
  if (!enemyIdOrMarker.startsWith('random:')) {
    // Static ID, return as-is
    return enemyIdOrMarker;
  }

  // Parse the random marker: 'random:tier:faction'
  const parts = enemyIdOrMarker.split(':');
  if (parts.length !== 3) {
    console.warn('Invalid random enemy marker:', enemyIdOrMarker);
    return 'shurima_sand_soldier'; // Fallback
  }

  const [, tier, faction] = parts;
  const enemy = getShurimaEnemyByTierAndFaction(
    tier as 'minion' | 'elite' | 'boss',
    faction as 'construct' | 'mortal' | 'beast'
  );
  
  return enemy.id;
}


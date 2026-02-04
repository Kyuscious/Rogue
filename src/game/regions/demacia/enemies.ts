import { Character } from '../../types';
import { DEFAULT_STATS } from '../../statsSystem';

// Demacia minion-tier enemies
export const DEMACIA_MINIONS: Character[] = [
  //Faction : Demacia's guards
  {
    id: 'demacia_soldier',
    name: 'Demacia Soldier',
    role: 'enemy',
    class: 'juggernaut',
    region: 'demacia',
    tier: 'minion',
    faction: 'guard',
    hp: 55,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 55,
      attackDamage: 8,
      abilityPower: 6,
      armor: 5,
      speed: 0.6,
    },
    inventory: [
      { itemId: 'longsword', quantity: 1 },
      { itemId: 'cloth_armor', quantity: 1 },
    ],
  },
  {
    id: 'demacia_scout',
    name: 'Demacia Scout',
    role: 'enemy',
    class: 'marksman',
    region: 'demacia',
    tier: 'minion',
    faction: 'guard',
    hp: 45,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 45,
      attackDamage: 10,
      abilityPower: 4,
      movementSpeed: 150,
      speed: 0.8,
    },
  },
  {
    id: 'demacia_guard',
    name: 'Demacia Guard',
    role: 'enemy',
    class: 'vanguard',
    region: 'demacia',
    tier: 'minion',
    faction: 'guard',
    hp: 75,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 75,
      abilityPower: 10,
      attackDamage: 10,
      armor: 10,
      magicResist: 5,
      speed: 0.5,
    },
  },
  //Faction : Demacia's beasts
  {
    id: 'demacia_wild_boar',
    name: 'Demacia Wild Boar',
    role: 'enemy',
    class: 'skirmisher',
    region: 'demacia',
    tier: 'minion',
    faction: 'beast',
    hp: 70,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 70,
      attackDamage: 7,
      abilityPower: 0,
      armor: 8,
      movementSpeed: 100,
      speed: 0.7,
    },
  },

];

// Demacia elite-tier enemies
export const DEMACIA_ELITES: Character[] = [
  {
    id: 'demacia_general',
    name: 'General',
    role: 'enemy',
    class: 'juggernaut',
    region: 'demacia',
    tier: 'elite',
    faction: 'guard',
    hp: 120,
    abilities: [],    level: 3,    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 120,
      attackDamage: 40,
      armor: 20,
      magicResist: 10,
      speed: 0.5,
    },
  },
  {
    id: 'demacia_silverwing_knight',
    name: 'Silverwing Knight',
    role: 'enemy',
    class: 'warden',
    region: 'demacia',
    tier: 'elite',
    faction: 'guard',
    hp: 110,
    abilities: [],
    level: 3,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 110,
      attackDamage: 30,
      abilityPower: 35,
      armor: 12,
      speed: 0.5,
    },
  },

  {
    id: 'demacia_crag_beast',
    name: 'Crag Beast',
    role: 'enemy',
    class: 'juggernaut',
    region: 'demacia',
    tier: 'elite',
    faction: 'beast',
    hp: 120,
    abilities: [],
    level: 3,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 120,
      abilityPower: 0,
      attackDamage: 35,
      armor: 15,
      magicResist: 15,
      speed: 0.5,
    },
  },
  ];
  

// Demacia boss-tier enemies
export const DEMACIA_BOSSES: Character[] = [
  {
    id: 'demacia_crag_elder',
    name: 'Crag Beast Elder',
    role: 'enemy',
    class: 'juggernaut',
    region: 'demacia',
    tier: 'boss',
    faction: 'beast',
    hp: 150,
    abilities: [],
    level: 5,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 150,
      attackDamage: 50,
      abilityPower: 10,
      armor: 30,
      magicResist: 20,
      speed: 0.5,
    },
  },
  {
    id: 'demacia_mageseeker',
    name: 'Mage Seeker',
    role: 'enemy',
    class: 'mage',
    region: 'demacia',
    tier: 'boss',
    faction: 'guard',
    hp: 120,
    abilities: [],
    level: 5,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 120,
      attackDamage: 30,
      abilityPower: 80,
      armor: 15,
      magicResist: 25,
      speed: 0.5,
    },
  },
  {
    id: 'demacia_warhorse_commander',
    name: 'Warhorse Commander',
    role: 'enemy',
    class: 'juggernaut',
    region: 'demacia',
    tier: 'boss',
    faction: 'guard',
    hp: 140,
    abilities: [],
    level: 5,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 140,
      attackDamage: 55,
      armor: 25,
      magicResist: 15,
      speed: 0.5,
    },
  },
];

// Demacia champion-tier enemies
export const DEMACIA_CHAMPIONS: Character[] = [
  {
    id: 'garen',
    name: 'Garen',
    role: 'enemy',
    class: 'juggernaut',
    region: 'demacia',
    tier: 'champion',
    faction: 'guard',
    hp: 200,
    abilities: [],
    level: 10,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 200,
      attackDamage: 70,
      armor: 40,
      magicResist: 30,
      speed: 0.6,
    },
  },
];

// Demacia legend-tier enemies (ultra rare/endgame)
export const DEMACIA_LEGENDS: Character[] = [
  // TODO: Add legendary enemies like Morgana, Kayle for demacia.
];

export function getDemaciaEnemyById(id: string): Character | undefined {
  const allEnemies = [...DEMACIA_MINIONS, ...DEMACIA_ELITES, ...DEMACIA_CHAMPIONS, ...DEMACIA_BOSSES];
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

export function getRandomDemaciaEnemy(tier: 'minion' | 'elite' | 'boss' | 'champion' | 'legend' ): Character {
  let pool: Character[] = [];
  if (tier === 'minion') pool = DEMACIA_MINIONS;
  if (tier === 'elite') pool = DEMACIA_ELITES;
  if (tier === 'champion') pool = DEMACIA_CHAMPIONS;
  if (tier === 'boss') pool = DEMACIA_BOSSES;
  if (tier === 'legend') pool = DEMACIA_LEGENDS;
  
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Get minions from a specific faction
 * Factions: 'guard' (soldiers/scouts/guards), 'beast' (wild animals)
 */
export function getDemaciaMinionsFromFaction(faction: 'guard' | 'beast'): Character[] {
  if (faction === 'guard') {
    return DEMACIA_MINIONS.filter(m => ['demacia_soldier', 'demacia_scout', 'demacia_guard'].includes(m.id));
  } else if (faction === 'beast') {
    return DEMACIA_MINIONS.filter(m => m.id.includes('wild') || m.id === 'demacia_wild_boar');
  }
  return DEMACIA_MINIONS;
}

/**
 * Get elites from a specific faction
 * Factions: 'guard' (generals/knights), 'beast' (crag beasts)
 */
export function getDemaciaElitesFromFaction(faction: 'guard' | 'beast'): Character[] {
  if (faction === 'guard') {
    return DEMACIA_ELITES.filter(e => ['demacia_general', 'demacia_silverwing_knight'].includes(e.id));
  } else if (faction === 'beast') {
    return DEMACIA_ELITES.filter(e => e.id === 'demacia_crag_beast');
  }
  return DEMACIA_ELITES;
}

/**
 * Get bosses from a specific faction
 * Factions: 'guard' (mageseeker/commander), 'beast' (crag elder)
 */
export function getDemaciaEnemyByTierAndFaction(tier: 'minion' | 'elite' | 'boss', faction: 'guard' | 'beast'): Character {
  let pool: Character[] = [];
  if (tier === 'minion') pool = getDemaciaMinionsFromFaction(faction);
  else if (tier === 'elite') pool = getDemaciaElitesFromFaction(faction);
  else if (tier === 'boss') {
    if (faction === 'guard') {
      pool = DEMACIA_BOSSES.filter(b => ['demacia_mageseeker', 'demacia_warhorse_commander'].includes(b.id));
    } else if (faction === 'beast') {
      pool = DEMACIA_BOSSES.filter(b => b.id === 'demacia_crag_elder');
    }
  }
  
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Resolve an enemy ID, which can be either:
 * - A static ID like 'garen' or 'demacia_soldier'
 * - A random selector like 'random:minion:guard' which expands to a random guard minion
 * 
 * Format: 'random:tier:faction'
 * Example: 'random:minion:guard' -> random guard minion
 */
export function resolveDemaciaEnemyId(enemyIdOrMarker: string): string {
  if (!enemyIdOrMarker.startsWith('random:')) {
    // Static ID, return as-is
    return enemyIdOrMarker;
  }

  // Parse the random marker: 'random:tier:faction'
  const parts = enemyIdOrMarker.split(':');
  if (parts.length !== 3) {
    console.warn('Invalid random enemy marker:', enemyIdOrMarker);
    return 'demacia_soldier'; // Fallback
  }

  const [, tier, faction] = parts;
  const enemy = getDemaciaEnemyByTierAndFaction(
    tier as 'minion' | 'elite' | 'boss',
    faction as 'guard' | 'beast'
  );
  
  return enemy.id;
}

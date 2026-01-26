import { Character } from '../../types';
import { DEFAULT_STATS } from '../../statsSystem';

// Noxus minion-tier enemies
export const NOXUS_MINIONS: Character[] = [
  // Faction: Legion (soldiers and warriors)
  {
    id: 'noxus_legionnaire',
    name: 'Noxian Legionnaire',
    role: 'enemy',
    class: 'juggernaut',
    region: 'noxus',
    tier: 'minion',
    faction: 'legion',
    hp: 58,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 58,
      attackDamage: 11,
      armor: 7,
      attackSpeed: 0.6,
    },
  },
  {
    id: 'noxus_raider',
    name: 'Noxian Raider',
    role: 'enemy',
    class: 'skirmisher',
    region: 'noxus',
    tier: 'minion',
    faction: 'warband',
    hp: 50,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 50,
      attackDamage: 13,
      armor: 5,
      movementSpeed: 145,
      attackSpeed: 0.75,
    },
  },
  {
    id: 'noxus_executioner',
    name: 'Noxian Executioner',
    role: 'enemy',
    class: 'assassin',
    region: 'noxus',
    tier: 'minion',
    faction: 'assassin',
    hp: 42,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 42,
      attackDamage: 14,
      movementSpeed: 150,
      attackSpeed: 0.8,
    },
  },
  {
    id: 'noxus_battle_mage',
    name: 'Noxian Battle Mage',
    role: 'enemy',
    class: 'mage',
    region: 'noxus',
    tier: 'minion',
    faction: 'magic',
    hp: 40,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 40,
      attackDamage: 6,
      abilityPower: 15,
      armor: 4,
      attackSpeed: 0.6,
    },
  },
  {
    id: 'noxus_warmonger',
    name: 'Warmonger',
    role: 'enemy',
    class: 'vanguard',
    region: 'noxus',
    tier: 'minion',
    faction: 'legion',
    hp: 62,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 62,
      attackDamage: 9,
      armor: 9,
      magicResist: 5,
      attackSpeed: 0.5,
    },
  },
];

// Noxus elite-tier enemies
export const NOXUS_ELITES: Character[] = [
  {
    id: 'noxus_crimson_elite',
    name: 'Crimson Elite',
    role: 'enemy',
    class: 'juggernaut',
    region: 'noxus',
    tier: 'elite',
    faction: 'legion',
    hp: 135,
    abilities: [],
    level: 3,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 135,
      attackDamage: 40,
      armor: 20,
      magicResist: 12,
      attackSpeed: 0.65,
    },
  },
  {
    id: 'noxus_blood_ritualist',
    name: 'Blood Ritualist',
    role: 'enemy',
    class: 'mage',
    region: 'noxus',
    tier: 'elite',
    faction: 'magic',
    hp: 100,
    abilities: [],
    level: 3,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 100,
      attackDamage: 20,
      abilityPower: 50,
      armor: 10,
      magicResist: 18,
      attackSpeed: 0.6,
    },
  },
  {
    id: 'noxus_trifarian_captain',
    name: 'Trifarian Captain',
    role: 'enemy',
    class: 'warden',
    region: 'noxus',
    tier: 'elite',
    faction: 'legion',
    hp: 128,
    abilities: [],
    level: 3,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 128,
      attackDamage: 35,
      armor: 22,
      magicResist: 15,
      attackSpeed: 0.55,
    },
  },
];

// Noxus boss-tier enemies
export const NOXUS_BOSSES: Character[] = [
  {
    id: 'noxus_war_general',
    name: 'Noxian War General',
    role: 'enemy',
    class: 'juggernaut',
    region: 'noxus',
    tier: 'boss',
    faction: 'legion',
    hp: 165,
    abilities: [],
    level: 5,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 165,
      attackDamage: 68,
      armor: 30,
      magicResist: 20,
      attackSpeed: 0.6,
    },
  },
  {
    id: 'noxus_warlord',
    name: 'Noxian Warlord',
    role: 'enemy',
    class: 'juggernaut',
    region: 'noxus',
    tier: 'boss',
    faction: 'warband',
    hp: 170,
    abilities: [],
    level: 5,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 170,
      attackDamage: 70,
      armor: 28,
      magicResist: 18,
      attackSpeed: 0.65,
    },
  },
  {
    id: 'noxus_master_assassin',
    name: 'Master Assassin',
    role: 'enemy',
    class: 'assassin',
    region: 'noxus',
    tier: 'boss',
    faction: 'assassin',
    hp: 140,
    abilities: [],
    level: 5,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 140,
      attackDamage: 75,
      armor: 20,
      movementSpeed: 170,
      attackSpeed: 0.85,
    },
  },
];

// Noxus champion-tier enemies
export const NOXUS_CHAMPIONS: Character[] = [
  {
    id: 'darius',
    name: 'Darius',
    role: 'enemy',
    class: 'juggernaut',
    region: 'noxus',
    tier: 'champion',
    faction: 'legion',
    hp: 230,
    abilities: [],
    level: 10,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 230,
      attackDamage: 85,
      armor: 48,
      magicResist: 32,
      attackSpeed: 0.65,
    },
  },
  {
    id: 'katarina',
    name: 'Katarina',
    role: 'enemy',
    class: 'assassin',
    region: 'noxus',
    tier: 'champion',
    faction: 'assassin',
    hp: 195,
    abilities: [],
    level: 10,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 195,
      attackDamage: 78,
      abilityPower: 55,
      armor: 30,
      movementSpeed: 165,
      attackSpeed: 0.9,
    },
  },
];

// Noxus legend-tier enemies
export const NOXUS_LEGENDS: Character[] = [
  // TODO: Add legendary enemies like Swain, Draven, Vladimir for Noxus.
];

export function getNoxusEnemyById(id: string): Character | undefined {
  const allEnemies = [...NOXUS_MINIONS, ...NOXUS_ELITES, ...NOXUS_CHAMPIONS, ...NOXUS_BOSSES];
  const enemy = allEnemies.find((e) => e.id === id);
  
  if (!enemy) return undefined;
  return {
    ...enemy,
    stats: { ...enemy.stats },
    abilities: [...enemy.abilities],
    inventory: enemy.inventory ? [...enemy.inventory] : undefined,
  };
}

export function getRandomNoxusEnemy(tier: 'minion' | 'elite' | 'boss' | 'champion' | 'legend' ): Character {
  let pool: Character[] = [];
  if (tier === 'minion') pool = NOXUS_MINIONS;
  if (tier === 'elite') pool = NOXUS_ELITES;
  if (tier === 'champion') pool = NOXUS_CHAMPIONS;
  if (tier === 'boss') pool = NOXUS_BOSSES;
  if (tier === 'legend') pool = NOXUS_LEGENDS;
  
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getNoxusMinionsFromFaction(faction: 'legion' | 'warband' | 'assassin' | 'magic'): Character[] {
  return NOXUS_MINIONS.filter(m => m.faction === faction);
}

export function getNoxusElitesFromFaction(faction: 'legion' | 'warband' | 'assassin' | 'magic'): Character[] {
  return NOXUS_ELITES.filter(e => e.faction === faction);
}

export function getNoxusBossesFromFaction(faction: 'legion' | 'warband' | 'assassin' | 'magic'): Character[] {
  return NOXUS_BOSSES.filter(b => b.faction === faction);
}

export function getNoxusEnemyByTierAndFaction(tier: 'minion' | 'elite' | 'boss', faction: 'legion' | 'warband' | 'assassin' | 'magic'): Character {
  let pool: Character[] = [];
  if (tier === 'minion') pool = getNoxusMinionsFromFaction(faction);
  else if (tier === 'elite') pool = getNoxusElitesFromFaction(faction);
  else if (tier === 'boss') pool = getNoxusBossesFromFaction(faction);
  
  if (pool.length === 0) {
    if (tier === 'minion') pool = NOXUS_MINIONS;
    else if (tier === 'elite') pool = NOXUS_ELITES;
    else if (tier === 'boss') pool = NOXUS_BOSSES;
  }
  
  return pool[Math.floor(Math.random() * pool.length)];
}

export function resolveNoxusEnemyId(enemyIdOrMarker: string): string {
  if (!enemyIdOrMarker.startsWith('random:')) {
    return enemyIdOrMarker;
  }

  const parts = enemyIdOrMarker.split(':');
  if (parts.length !== 3) {
    console.warn('Invalid random enemy marker:', enemyIdOrMarker);
    return 'noxus_legionnaire';
  }

  const [, tier, faction] = parts;
  const enemy = getNoxusEnemyByTierAndFaction(
    tier as 'minion' | 'elite' | 'boss',
    faction as 'legion' | 'warband' | 'assassin' | 'magic'
  );
  
  return enemy.id;
}

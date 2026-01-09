import { Character } from '../../types';
import { DEFAULT_STATS } from '../../statsSystem';

// Shurima minion-tier enemies
export const SHURIMA_MINIONS: Character[] = [
  {
    id: 'shurima_soldier',
    name: 'Shurima Soldier',
    role: 'enemy',
    region: 'shurima',
    class: 'juggernaut',
    tier: 'minion',
    hp: 32,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 32,
      attackDamage: 9,
      armor: 4,
      attackSpeed: 0.5,
    },
  },
];

// Shurima elite-tier enemies
export const SHURIMA_ELITES: Character[] = [
  {
    id: 'shurima_azir',
    name: 'Azir the Emperor',
    role: 'enemy',
    region: 'shurima',
    class: 'mage',
    tier: 'elite',
    hp: 110,
    abilities: [],
    level: 3,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 110,
      abilityPower: 55,
      armor: 15,
      magicResist: 18,
      attackSpeed: 0.5,
    },
  },
];

// Shurima boss-tier enemies
export const SHURIMA_BOSSES: Character[] = [
  {
    id: 'shurima_sun_guardian',
    name: 'Sun Guardian',
    role: 'enemy',
    region: 'shurima',
    class: 'warden',
    tier: 'boss',
    hp: 160,
    abilities: [],
    level: 5,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 160,
      abilityPower: 85,
      armor: 20,
      magicResist: 30,
      attackSpeed: 0.5,
    },
  },
];

// Shurima champion-tier enemies
export const SHURIMA_CHAMPIONS: Character[] = [
  {
    id: 'xerath',
    name: 'Xerath',
    role: 'enemy',
    region: 'shurima',
    class: 'mage',
    tier: 'champion',
    hp: 180,
    abilities: [],
    level: 10,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 180,
      abilityPower: 120,
      armor: 20,
      magicResist: 35,
      attackSpeed: 0.5,
    },
  },
];

export function getShurımaEnemyById(id: string): Character | undefined {
  const allEnemies = [...SHURIMA_MINIONS, ...SHURIMA_ELITES, ...SHURIMA_CHAMPIONS, ...SHURIMA_BOSSES];
  return allEnemies.find((enemy) => enemy.id === id);
}

export function getRandomShurımaEnemy(tier: 'minion' | 'elite' | 'champion' | 'boss'): Character {
  let pool: Character[] = [];
  if (tier === 'minion') pool = SHURIMA_MINIONS;
  if (tier === 'elite') pool = SHURIMA_ELITES;
  if (tier === 'champion') pool = SHURIMA_CHAMPIONS;
  if (tier === 'boss') pool = SHURIMA_BOSSES;
  
  return pool[Math.floor(Math.random() * pool.length)];
}

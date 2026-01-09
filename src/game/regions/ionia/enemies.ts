import { Character } from '../../types';
import { DEFAULT_STATS } from '../../statsSystem';

// Ionia minion-tier enemies
export const IONIA_MINIONS: Character[] = [
  {
    id: 'ionia_spirit',
    name: 'Ionia Spirit',
    role: 'enemy',
    region: 'ionia',
    class: 'mage',
    tier: 'minion',
    hp: 28,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 28,
      abilityPower: 10,
      armor: 3,
      attackSpeed: 0.5,
    },
  },
];

// Ionia elite-tier enemies
export const IONIA_ELITES: Character[] = [
  {
    id: 'ionia_akali',
    name: 'Akali the Rogue',
    role: 'enemy',
    region: 'ionia',
    class: 'assassin',
    tier: 'elite',
    hp: 95,
    abilities: [],
    level: 3,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 95,
      attackDamage: 45,
      armor: 12,
      magicResist: 12,
      movementSpeed: 160,
      attackSpeed: 0.5,
    },
  },
];

// Ionia boss-tier enemies
export const IONIA_BOSSES: Character[] = [
  {
    id: 'ionia_karma',
    name: 'Karma the Enlightened',
    role: 'enemy',
    region: 'ionia',
    class: 'enchanter',
    tier: 'boss',
    hp: 130,
    abilities: [],
    level: 5,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 130,
      abilityPower: 70,
      armor: 18,
      magicResist: 22,
      attackSpeed: 0.5,
    },
  },
];

// Ionia champion-tier enemies
export const IONIA_CHAMPIONS: Character[] = [
  {
    id: 'yasuo',
    name: 'Yasuo',
    role: 'enemy',
    region: 'ionia',
    class: 'skirmisher',
    tier: 'champion',
    hp: 175,
    abilities: [],
    level: 10,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 175,
      attackDamage: 80,
      armor: 25,
      magicResist: 20,
      movementSpeed: 160,
      attackSpeed: 0.7,
    },
  },
];

export function getIoniaEnemyById(id: string): Character | undefined {
  const allEnemies = [...IONIA_MINIONS, ...IONIA_ELITES, ...IONIA_CHAMPIONS, ...IONIA_BOSSES];
  return allEnemies.find((enemy) => enemy.id === id);
}

export function getRandomIoniaEnemy(tier: 'minion' | 'elite' | 'champion' | 'boss'): Character {
  let pool: Character[] = [];
  if (tier === 'minion') pool = IONIA_MINIONS;
  if (tier === 'elite') pool = IONIA_ELITES;
  if (tier === 'champion') pool = IONIA_CHAMPIONS;
  if (tier === 'boss') pool = IONIA_BOSSES;
  
  return pool[Math.floor(Math.random() * pool.length)];
}

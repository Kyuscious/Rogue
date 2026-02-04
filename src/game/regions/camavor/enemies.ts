import { Character } from '../../types';
import { DEFAULT_STATS } from '../../statsSystem';

// Camavor minion-tier enemies
export const CAMAVOR_MINIONS: Character[] = [
  {
    id: 'camavor_wraith',
    name: 'Camavor Wraith',
    role: 'enemy',
    class: 'assassin',
    region: 'camavor',
    tier: 'minion',
    faction: 'undead',
    hp: 50,
    abilities: [],
    level: 1,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 50,
      attackDamage: 12,
      movementSpeed: 140,
      speed: 0.7,
    },
  },
];

// Camavor elite-tier enemies
export const CAMAVOR_ELITES: Character[] = [
  {
    id: 'camavor_knight',
    name: 'Ruined Knight',
    role: 'enemy',
    class: 'juggernaut',
    region: 'camavor',
    tier: 'elite',
    faction: 'undead',
    hp: 130,
    abilities: [],
    level: 3,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 130,
      attackDamage: 45,
      armor: 25,
      magicResist: 15,
      speed: 0.5,
    },
  },
];

// Camavor boss-tier enemies
export const CAMAVOR_BOSSES: Character[] = [
  {
    id: 'camavor_viego',
    name: 'The Ruined King',
    role: 'enemy',
    class: 'skirmisher',
    region: 'camavor',
    tier: 'boss',
    faction: 'ruined',
    hp: 180,
    abilities: [],
    level: 5,
    experience: 0,
    stats: {
      ...DEFAULT_STATS,
      health: 180,
      attackDamage: 60,
      armor: 30,
      magicResist: 30,
      speed: 0.6,
    },
  },
];

// Camavor champion-tier enemies
export const CAMAVOR_CHAMPIONS: Character[] = [];

// Camavor legend-tier enemies
export const CAMAVOR_LEGENDS: Character[] = [];

export function getCamavorEnemyById(id: string): Character | undefined {
  const allEnemies = [...CAMAVOR_MINIONS, ...CAMAVOR_ELITES, ...CAMAVOR_CHAMPIONS, ...CAMAVOR_BOSSES];
  return allEnemies.find((enemy) => enemy.id === id);
}

export function getRandomCamavorEnemy(tier: 'minion' | 'elite' | 'boss' | 'champion' | 'legend'): Character {
  let pool: Character[] = [];
  if (tier === 'minion') pool = CAMAVOR_MINIONS;
  if (tier === 'elite') pool = CAMAVOR_ELITES;
  if (tier === 'champion') pool = CAMAVOR_CHAMPIONS;
  if (tier === 'boss') pool = CAMAVOR_BOSSES;
  if (tier === 'legend') pool = CAMAVOR_LEGENDS;
  
  return pool[Math.floor(Math.random() * pool.length)];
}

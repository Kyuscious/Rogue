import { Character } from '../../types';
import { DEFAULT_STATS } from '../../statsSystem';

// Bilgewater minion-tier enemies
export const BILGEWATER_MINIONS: Character[] = [
  {
    id: 'bilgewater_pirate',
    name: 'Bilgewater Pirate',
    role: 'enemy',
    class: 'skirmisher',
    region: 'bilgewater',
    tier: 'minion',
    hp: 50,
    abilities: [],
    level: 1,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

// Bilgewater elite-tier enemies
export const BILGEWATER_ELITES: Character[] = [
  {
    id: 'bilgewater_captain',
    name: 'Sea Captain',
    role: 'enemy',
    class: 'skirmisher',
    region: 'bilgewater',
    tier: 'elite',
    hp: 100,
    abilities: [],
    level: 5,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

// Bilgewater boss-tier enemies
export const BILGEWATER_BOSSES: Character[] = [
  {
    id: 'bilgewater_boss',
    name: 'Gangplank',
    role: 'enemy',
    class: 'skirmisher',
    region: 'bilgewater',
    tier: 'boss',
    hp: 180,
    abilities: [],
    level: 10,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

export function getBilgewaterEnemyById(id: string): Character | undefined {
  return [
    ...BILGEWATER_MINIONS,
    ...BILGEWATER_ELITES,
    ...BILGEWATER_BOSSES,
  ].find(enemy => enemy.id === id);
}

export function getRandomBilgewaterEnemy(tier: 'minion' | 'elite' | 'boss' = 'minion'): Character {
  const tierMap = {
    minion: BILGEWATER_MINIONS,
    elite: BILGEWATER_ELITES,
    boss: BILGEWATER_BOSSES,
  };
  const enemies = tierMap[tier];
  return enemies[Math.floor(Math.random() * enemies.length)];
}

export function resolveBilgewaterEnemyId(id: string): Character | undefined {
  return getBilgewaterEnemyById(id);
}

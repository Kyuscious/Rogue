import { Character } from '../../types';
import { DEFAULT_STATS } from '../../statsSystem';

// Targon minion-tier enemies
export const TARGON_MINIONS: Character[] = [
  {
    id: 'targon_celestial',
    name: 'Celestial Scout',
    role: 'enemy',
    class: 'marksman',
    region: 'targon',
    tier: 'minion',
    hp: 45,
    abilities: [],
    level: 1,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

// Targon elite-tier enemies
export const TARGON_ELITES: Character[] = [
  {
    id: 'targon_guardian',
    name: 'Celestial Guardian',
    role: 'enemy',
    class: 'marksman',
    region: 'targon',
    tier: 'elite',
    hp: 95,
    abilities: [],
    level: 5,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

// Targon boss-tier enemies
export const TARGON_BOSSES: Character[] = [
  {
    id: 'targon_boss',
    name: 'Aspect of Twilight',
    role: 'enemy',
    class: 'marksman',
    region: 'targon',
    tier: 'boss',
    hp: 180,
    abilities: [],
    level: 10,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

export function getTargonEnemyById(id: string): Character | undefined {
  return [
    ...TARGON_MINIONS,
    ...TARGON_ELITES,
    ...TARGON_BOSSES,
  ].find(enemy => enemy.id === id);
}

export function getRandomTargonEnemy(tier: 'minion' | 'elite' | 'boss' = 'minion'): Character {
  const tierMap = {
    minion: TARGON_MINIONS,
    elite: TARGON_ELITES,
    boss: TARGON_BOSSES,
  };
  const enemies = tierMap[tier];
  return enemies[Math.floor(Math.random() * enemies.length)];
}

export function resolveTargonEnemyId(id: string): Character | undefined {
  return getTargonEnemyById(id);
}

import { Character } from '../../types';
import { DEFAULT_STATS } from '../../statsSystem';

// Piltover minion-tier enemies
export const PILTOVER_MINIONS: Character[] = [
  {
    id: 'piltover_guard',
    name: 'Piltover Guard',
    role: 'enemy',
    class: 'vanguard',
    region: 'piltover',
    tier: 'minion',
    hp: 48,
    abilities: [],
    level: 1,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

// Piltover elite-tier enemies
export const PILTOVER_ELITES: Character[] = [
  {
    id: 'piltover_officer',
    name: 'Piltover Officer',
    role: 'enemy',
    class: 'vanguard',
    region: 'piltover',
    tier: 'elite',
    hp: 100,
    abilities: [],
    level: 5,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

// Piltover boss-tier enemies
export const PILTOVER_BOSSES: Character[] = [
  {
    id: 'piltover_boss',
    name: 'Marcus',
    role: 'enemy',
    class: 'vanguard',
    region: 'piltover',
    tier: 'boss',
    hp: 170,
    abilities: [],
    level: 10,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

export function getPiltoverEnemyById(id: string): Character | undefined {
  return [
    ...PILTOVER_MINIONS,
    ...PILTOVER_ELITES,
    ...PILTOVER_BOSSES,
  ].find(enemy => enemy.id === id);
}

export function getRandomPiltoverEnemy(tier: 'minion' | 'elite' | 'boss' = 'minion'): Character {
  const tierMap = {
    minion: PILTOVER_MINIONS,
    elite: PILTOVER_ELITES,
    boss: PILTOVER_BOSSES,
  };
  const enemies = tierMap[tier];
  return enemies[Math.floor(Math.random() * enemies.length)];
}

export function resolvePiltoverEnemyId(id: string): Character | undefined {
  return getPiltoverEnemyById(id);
}

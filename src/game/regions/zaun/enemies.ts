import { Character } from '../../types';
import { DEFAULT_STATS } from '../../statsSystem';

// Zaun minion-tier enemies
export const ZAUN_MINIONS: Character[] = [
  {
    id: 'zaun_chemtech',
    name: 'Chemtech Soldier',
    role: 'enemy',
    class: 'warden',
    region: 'zaun',
    tier: 'minion',
    hp: 52,
    abilities: [],
    level: 1,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

// Zaun elite-tier enemies
export const ZAUN_ELITES: Character[] = [
  {
    id: 'zaun_enforcer',
    name: 'Zaun Enforcer',
    role: 'enemy',
    class: 'warden',
    region: 'zaun',
    tier: 'elite',
    hp: 105,
    abilities: [],
    level: 5,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

// Zaun boss-tier enemies
export const ZAUN_BOSSES: Character[] = [
  {
    id: 'zaun_boss',
    name: 'Deckard',
    role: 'enemy',
    class: 'warden',
    region: 'zaun',
    tier: 'boss',
    hp: 190,
    abilities: [],
    level: 10,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

export function getZaunEnemyById(id: string): Character | undefined {
  return [
    ...ZAUN_MINIONS,
    ...ZAUN_ELITES,
    ...ZAUN_BOSSES,
  ].find(enemy => enemy.id === id);
}

export function getRandomZaunEnemy(tier: 'minion' | 'elite' | 'boss' = 'minion'): Character {
  const tierMap = {
    minion: ZAUN_MINIONS,
    elite: ZAUN_ELITES,
    boss: ZAUN_BOSSES,
  };
  const enemies = tierMap[tier];
  return enemies[Math.floor(Math.random() * enemies.length)];
}

export function resolveZaunEnemyId(id: string): Character | undefined {
  return getZaunEnemyById(id);
}

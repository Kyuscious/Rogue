import { Character } from '../../types';
import { DEFAULT_STATS } from '../../statsSystem';

// Ixtal minion-tier enemies
export const IXTAL_MINIONS: Character[] = [
  {
    id: 'ixtal_warrior',
    name: 'Ixtal Warrior',
    role: 'enemy',
    class: 'vanguard',
    region: 'ixtal',
    tier: 'minion',
    hp: 45,
    abilities: [],
    level: 1,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

// Ixtal elite-tier enemies
export const IXTAL_ELITES: Character[] = [
  {
    id: 'ixtal_shaman',
    name: 'Ixtal Shaman',
    role: 'enemy',
    class: 'mage',
    region: 'ixtal',
    tier: 'elite',
    hp: 85,
    abilities: [],
    level: 5,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

// Ixtal boss-tier enemies
export const IXTAL_BOSSES: Character[] = [
  {
    id: 'ixtal_boss',
    name: 'Nidalee',
    role: 'enemy',
    class: 'mage',
    region: 'ixtal',
    tier: 'boss',
    hp: 160,
    abilities: [],
    level: 10,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

export function getIxtalEnemyById(id: string): Character | undefined {
  return [
    ...IXTAL_MINIONS,
    ...IXTAL_ELITES,
    ...IXTAL_BOSSES,
  ].find(enemy => enemy.id === id);
}

export function getRandomIxtalEnemy(tier: 'minion' | 'elite' | 'boss' = 'minion'): Character {
  const tierMap = {
    minion: IXTAL_MINIONS,
    elite: IXTAL_ELITES,
    boss: IXTAL_BOSSES,
  };
  const enemies = tierMap[tier];
  return enemies[Math.floor(Math.random() * enemies.length)];
}

export function resolveIxtalEnemyId(id: string): Character | undefined {
  return getIxtalEnemyById(id);
}

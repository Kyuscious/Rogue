import { Character } from '../../types';
import { DEFAULT_STATS } from '../../statsSystem';

// Freljord minion-tier enemies
export const FRELJORD_MINIONS: Character[] = [
  {
    id: 'freljord_warrior',
    name: 'Freljord Warrior',
    role: 'enemy',
    class: 'juggernaut',
    region: 'freljord',
    tier: 'minion',
    hp: 60,
    abilities: [],
    level: 1,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

// Freljord elite-tier enemies
export const FRELJORD_ELITES: Character[] = [
  {
    id: 'freljord_elite',
    name: 'Freljord Champion',
    role: 'enemy',
    class: 'juggernaut',
    region: 'freljord',
    tier: 'elite',
    hp: 120,
    abilities: [],
    level: 5,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

// Freljord boss-tier enemies
export const FRELJORD_BOSSES: Character[] = [
  {
    id: 'freljord_boss',
    name: 'Sejuani',
    role: 'enemy',
    class: 'juggernaut',
    region: 'freljord',
    tier: 'boss',
    hp: 200,
    abilities: [],
    level: 10,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

export function getFreljordEnemyById(id: string): Character | undefined {
  return [
    ...FRELJORD_MINIONS,
    ...FRELJORD_ELITES,
    ...FRELJORD_BOSSES,
  ].find(enemy => enemy.id === id);
}

export function getRandomFreljordEnemy(tier: 'minion' | 'elite' | 'boss' = 'minion'): Character {
  const tierMap = {
    minion: FRELJORD_MINIONS,
    elite: FRELJORD_ELITES,
    boss: FRELJORD_BOSSES,
  };
  const enemies = tierMap[tier];
  return enemies[Math.floor(Math.random() * enemies.length)];
}

export function resolveFreljordEnemyId(id: string): Character | undefined {
  return getFreljordEnemyById(id);
}

import { Character } from '../../types';
import { DEFAULT_STATS } from '../../statsSystem';

// Shadow Isles minion-tier enemies
export const SHADOW_ISLES_MINIONS: Character[] = [
  {
    id: 'shadow_isles_undead',
    name: 'Shadow Minion',
    role: 'enemy',
    class: 'warden',
    region: 'shadow_isles',
    tier: 'minion',
    hp: 50,
    abilities: [],
    level: 1,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

// Shadow Isles elite-tier enemies
export const SHADOW_ISLES_ELITES: Character[] = [
  {
    id: 'shadow_isles_spectre',
    name: 'Shadow Spectre',
    role: 'enemy',
    class: 'warden',
    region: 'shadow_isles',
    tier: 'elite',
    hp: 110,
    abilities: [],
    level: 5,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

// Shadow Isles boss-tier enemies
export const SHADOW_ISLES_BOSSES: Character[] = [
  {
    id: 'shadow_isles_boss',
    name: 'Shadow Warden',
    role: 'enemy',
    class: 'warden',
    region: 'shadow_isles',
    tier: 'boss',
    hp: 210,
    abilities: [],
    level: 10,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

export function getShadowIslesEnemyById(id: string): Character | undefined {
  return [
    ...SHADOW_ISLES_MINIONS,
    ...SHADOW_ISLES_ELITES,
    ...SHADOW_ISLES_BOSSES,
  ].find(enemy => enemy.id === id);
}

export function getRandomShadowIslesEnemy(tier: 'minion' | 'elite' | 'boss' = 'minion'): Character {
  const tierMap = {
    minion: SHADOW_ISLES_MINIONS,
    elite: SHADOW_ISLES_ELITES,
    boss: SHADOW_ISLES_BOSSES,
  };
  const enemies = tierMap[tier];
  return enemies[Math.floor(Math.random() * enemies.length)];
}

export function resolveShadowIslesEnemyId(id: string): Character | undefined {
  return getShadowIslesEnemyById(id);
}

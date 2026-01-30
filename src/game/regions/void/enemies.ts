import { Character } from '../../types';
import { DEFAULT_STATS } from '../../statsSystem';

// Void minion-tier enemies
export const VOID_MINIONS: Character[] = [
  {
    id: 'void_creature',
    name: 'Void Creature',
    role: 'enemy',
    class: 'juggernaut',
    region: 'void',
    tier: 'minion',
    hp: 48,
    abilities: [],
    level: 1,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

// Void elite-tier enemies
export const VOID_ELITES: Character[] = [
  {
    id: 'void_spawn',
    name: 'Void Spawn',
    role: 'enemy',
    class: 'juggernaut',
    region: 'void',
    tier: 'elite',
    hp: 95,
    abilities: [],
    level: 5,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

// Void boss-tier enemies
export const VOID_BOSSES: Character[] = [
  {
    id: 'void_boss',
    name: 'Void Herald',
    role: 'enemy',
    class: 'juggernaut',
    region: 'void',
    tier: 'boss',
    hp: 200,
    abilities: [],
    level: 10,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

export function getVoidEnemyById(id: string): Character | undefined {
  return [
    ...VOID_MINIONS,
    ...VOID_ELITES,
    ...VOID_BOSSES,
  ].find(enemy => enemy.id === id);
}

export function getRandomVoidEnemy(tier: 'minion' | 'elite' | 'boss' = 'minion'): Character {
  const tierMap = {
    minion: VOID_MINIONS,
    elite: VOID_ELITES,
    boss: VOID_BOSSES,
  };
  const enemies = tierMap[tier];
  return enemies[Math.floor(Math.random() * enemies.length)];
}

export function resolveVoidEnemyId(id: string): Character | undefined {
  return getVoidEnemyById(id);
}

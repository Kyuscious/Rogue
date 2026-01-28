import { Character } from '../types';
import { Region } from '../types';
import { DEFAULT_STATS } from '../statsSystem';
import { getDemaciaEnemyById, resolveDemaciaEnemyId } from './demacia';
import { getIoniaEnemyById, resolveIoniaEnemyId } from './ionia';
import { getShurimaEnemyById, resolveShurimaEnemyId } from './shurima';

// Placeholder enemies for regions without implemented enemies yet
export const PLACEHOLDER_MINION: Character = {
  id: 'placeholder_minion',
  name: 'Placeholder Minion',
  role: 'enemy',
  class: 'juggernaut',
  region: 'demacia',
  tier: 'minion',
  faction: 'none',
  hp: 100,
  abilities: [],
  level: 1,
  experience: 0,
  stats: {
    ...DEFAULT_STATS,
    health: 100,
    attackDamage: 10,
    armor: 5,
    attackSpeed: 0.6,
  },
  inventory: [],
};

export const PLACEHOLDER_ELITE: Character = {
  id: 'placeholder_elite',
  name: 'Placeholder Elite',
  role: 'enemy',
  class: 'juggernaut',
  region: 'demacia',
  tier: 'elite',
  faction: 'none',
  hp: 150,
  abilities: [],
  level: 3,
  experience: 0,
  stats: {
    ...DEFAULT_STATS,
    health: 150,
    attackDamage: 25,
    armor: 15,
    magicResist: 10,
    attackSpeed: 0.5,
  },
  inventory: [],
};

export const PLACEHOLDER_BOSS: Character = {
  id: 'placeholder_boss',
  name: 'Placeholder Boss',
  role: 'enemy',
  class: 'juggernaut',
  region: 'demacia',
  tier: 'boss',
  faction: 'none',
  hp: 200,
  abilities: [],
  level: 5,
  experience: 0,
  stats: {
    ...DEFAULT_STATS,
    health: 200,
    attackDamage: 40,
    armor: 25,
    magicResist: 20,
    attackSpeed: 0.5,
  },
  inventory: [],
};

/**
 * Universal enemy resolver that works across all regions
 * Falls back to placeholder enemies for unimplemented regions
 * IMPORTANT: Always returns a copy to prevent mutation of database objects
 */
export function getEnemyById(id: string): Character | undefined {
  // Try each region's enemy database
  const demaciaEnemy = getDemaciaEnemyById(id);
  if (demaciaEnemy) return demaciaEnemy;

  const ioniaEnemy = getIoniaEnemyById(id);
  if (ioniaEnemy) return ioniaEnemy;

  const shurimaEnemy = getShurimaEnemyById(id);
  if (shurimaEnemy) return shurimaEnemy;

  // Fall back to placeholders - return copies to prevent mutation
  if (id === 'placeholder_minion') return { ...PLACEHOLDER_MINION, stats: { ...PLACEHOLDER_MINION.stats }, abilities: [...PLACEHOLDER_MINION.abilities] };
  if (id === 'placeholder_elite') return { ...PLACEHOLDER_ELITE, stats: { ...PLACEHOLDER_ELITE.stats }, abilities: [...PLACEHOLDER_ELITE.abilities] };
  if (id === 'placeholder_boss') return { ...PLACEHOLDER_BOSS, stats: { ...PLACEHOLDER_BOSS.stats }, abilities: [...PLACEHOLDER_BOSS.abilities] };

  // Default fallback
  console.warn(`Enemy "${id}" not found, using placeholder minion`);
  return { ...PLACEHOLDER_MINION, stats: { ...PLACEHOLDER_MINION.stats }, abilities: [...PLACEHOLDER_MINION.abilities] };
}

/**
 * Resolve an enemy ID marker (which can be either static or random) for a specific region
 * For example: 'random:minion:beast' gets resolved to an actual enemy ID from that region
 * @param enemyIdOrMarker - The enemy ID or random marker (e.g., 'random:minion:beast')
 * @param region - The region to resolve from
 * @returns The actual enemy ID
 */
export function resolveEnemyIdByRegion(enemyIdOrMarker: string, region: Region): string {
  // Use region-specific resolver functions
  if (region === 'demacia') {
    return resolveDemaciaEnemyId(enemyIdOrMarker);
  } else if (region === 'ionia') {
    return resolveIoniaEnemyId(enemyIdOrMarker);
  } else if (region === 'shurima') {
    return resolveShurimaEnemyId(enemyIdOrMarker);
  }
  
  // For other regions, just return the ID as-is (no random markers implemented)
  return enemyIdOrMarker;
}

import { Character } from '../../types';
import { DEFAULT_STATS } from '../../statsSystem';

// Bandle City minion-tier enemies
export const BANDLE_CITY_MINIONS: Character[] = [
  {
    id: 'bandle_soldier',
    name: 'Bandle Guard',
    role: 'enemy',
    class: 'marksman',
    region: 'bandle_city',
    tier: 'minion',
    hp: 40,
    abilities: [],
    level: 1,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

// Bandle City elite-tier enemies
export const BANDLE_CITY_ELITES: Character[] = [
  {
    id: 'bandle_elite',
    name: 'Bandle Commander',
    role: 'enemy',
    class: 'marksman',
    region: 'bandle_city',
    tier: 'elite',
    hp: 80,
    abilities: [],
    level: 5,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

// Bandle City boss-tier enemies
export const BANDLE_CITY_BOSSES: Character[] = [
  {
    id: 'bandle_boss',
    name: 'Teemo',
    role: 'enemy',
    class: 'marksman',
    region: 'bandle_city',
    tier: 'boss',
    hp: 150,
    abilities: [],
    level: 10,
    experience: 0,
    stats: DEFAULT_STATS,
  },
];

export function getBandleCityEnemyById(id: string): Character | undefined {
  return [
    ...BANDLE_CITY_MINIONS,
    ...BANDLE_CITY_ELITES,
    ...BANDLE_CITY_BOSSES,
  ].find(enemy => enemy.id === id);
}

export function getRandomBandleCityEnemy(tier: 'minion' | 'elite' | 'boss' = 'minion'): Character {
  const tierMap = {
    minion: BANDLE_CITY_MINIONS,
    elite: BANDLE_CITY_ELITES,
    boss: BANDLE_CITY_BOSSES,
  };
  const enemies = tierMap[tier];
  return enemies[Math.floor(Math.random() * enemies.length)];
}

export function resolveBandleCityEnemyId(id: string): Character | undefined {
  return getBandleCityEnemyById(id);
}

/**
 * Bandle City Events
 */

import { GameEvent } from '../../events/eventTypes';

export const BANDLE_CITY_EVENTS: GameEvent[] = [
  {
    id: 'bandle_city_scout',
    title: 'Bandle Scout',
    description: 'A quick encounter with a Bandle scout',
    type: 'encounter',
    icon: '🏹',
    rarity: 'common',
    originRegions: ['bandle_city'],
    data: {
      enemyName: 'Bandle Scout',
      enemyLevel: 5,
      goldReward: 150,
      experienceReward: 75,
    },
  },
];

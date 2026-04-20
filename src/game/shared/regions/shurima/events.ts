/**
 * Shurima Events
 */

import { GameEvent } from '@screens/PostRegionChoice/events/eventTypes';

export const SHURIMA_EVENTS: GameEvent[] = [
  {
    id: 'shurima_desert',
    title: 'Desert Nomads',
    description: 'A group of desert nomads blocks the path',
    type: 'encounter',
    icon: '🐪',
    rarity: 'common',
    originRegions: ['shurima'],
    data: {
      enemyName: 'Desert Nomad',
      enemyLevel: 7,
      goldReward: 200,
      experienceReward: 100,
    },
  },
];

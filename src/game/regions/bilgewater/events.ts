/**
 * Bilgewater Events
 */

import { GameEvent } from '../../events/eventTypes';

export const BILGEWATER_EVENTS: GameEvent[] = [
  {
    id: 'bilgewater_encounter',
    title: 'Bilgewater Encounter',
    description: 'A tense moment on the high seas',
    type: 'encounter',
    icon: '⛵',
    rarity: 'common',
    originRegions: ['bilgewater'],
    data: {
      enemyName: 'Bilgewater Corsair',
      enemyLevel: 6,
      goldReward: 180,
      experienceReward: 90,
    },
  },
];

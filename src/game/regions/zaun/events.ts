/**
 * Zaun Events
 */

import { GameEvent } from '../../events/eventTypes';

export const ZAUN_EVENTS: GameEvent[] = [
  {
    id: 'zaun_chemistry',
    title: 'Zaun Chemistry',
    description: 'A dangerous chemical experiment gone wrong',
    type: 'encounter',
    icon: '☢️',
    rarity: 'common',
    originRegions: ['zaun'],
    data: {
      enemyName: 'Chemtech Aberration',
      enemyLevel: 7,
      goldReward: 200,
      experienceReward: 100,
    },
  },
];

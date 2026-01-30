/**
 * Camavor Events
 */

import { GameEvent } from '../../events/eventTypes';

export const CAMAVOR_EVENTS: GameEvent[] = [
  {
    id: 'camavor_trial',
    title: 'Camavor Trial',
    description: 'A challenge from the people of Camavor',
    type: 'encounter',
    icon: '⚔️',
    rarity: 'common',
    originRegions: ['camavor'],
    data: {
      enemyName: 'Camavor Warrior',
      enemyLevel: 5,
      goldReward: 150,
      experienceReward: 75,
    },
  },
];

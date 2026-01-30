/**
 * Void Events
 */

import { GameEvent } from '../../events/eventTypes';

export const VOID_EVENTS: GameEvent[] = [
  {
    id: 'void_breach',
    title: 'Void Breach',
    description: 'Something tears through the fabric of reality',
    type: 'encounter',
    icon: '👁️',
    rarity: 'rare',
    originRegions: ['void'],
    data: {
      enemyName: 'Void Entity',
      enemyLevel: 8,
      goldReward: 250,
      experienceReward: 125,
    },
  },
];

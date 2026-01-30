/**
 * Ixtal Events
 */

import { GameEvent } from '../../events/eventTypes';

export const IXTAL_EVENTS: GameEvent[] = [
  {
    id: 'ixtal_ritual',
    title: 'Ixtal Ritual',
    description: 'An ancient ritual in the heart of Ixtal',
    type: 'encounter',
    icon: '🔮',
    rarity: 'common',
    originRegions: ['ixtal'],
    data: {
      enemyName: 'Ixtal Mystic',
      enemyLevel: 6,
      goldReward: 170,
      experienceReward: 85,
    },
  },
];

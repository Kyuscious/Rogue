/**
 * Bandle City Events
 */

import { GameEvent } from '@screens/PostRegionChoice/events/eventTypes';

export const BANDLE_CITY_EVENTS: GameEvent[] = [
  {
    id: 'bandle_city_pet_keeper',
    title: 'Yordle Pet Keeper',
    description: 'A cheerful keeper offers a trained silverwing hatchling to worthy adventurers.',
    type: 'dialogue',
    icon: '🪺',
    rarity: 'rare',
    originRegions: ['bandle_city'],
    data: {
      npcName: 'Pet Keeper Poppy',
      dialogue: '"Every hero needs a little helper! Take good care of this one."',
      familiarId: 'silverwing_scout',
      options: [
        {
          id: 'accept_hatchling',
          text: 'Adopt the hatchling',
          outcome: 'familiar',
          value: 'silverwing_scout',
          successRate: 100,
        },
      ],
    },
  },
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

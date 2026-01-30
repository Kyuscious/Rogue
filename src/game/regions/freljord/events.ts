/**
 * Freljord Events
 * Region-specific events for Freljord - Survival, ice, harsh wilderness
 */

import { GameEvent } from '../../events/eventTypes';

export const FRELJORD_EVENTS: GameEvent[] = [
  {
    id: 'freljord_blizzard',
    title: 'Blizzard Strikes',
    description: 'A sudden blizzard threatens to overwhelm you',
    type: 'visual_novel',
    icon: '🌨️',
    rarity: 'common',
    originRegions: ['freljord'],
    data: {
      narrative: 'Snow whips around you as the temperature plummets. You can barely see through the driving wind. You must find shelter or face freezing to death.',
      choices: [
        {
          id: 'find_shelter',
          text: 'Seek shelter from the storm',
          outcome: 'buff',
          value: 'weathered',
          successRate: 85,
        },
        {
          id: 'push_through',
          text: 'Push onward through the blizzard',
          outcome: 'hp',
          value: -20,
          successRate: 55,
        },
      ],
    },
  },
  {
    id: 'freljord_frost_warden',
    title: 'Frost Warden',
    description: 'An ancient guardian of the frozen wastes blocks your path',
    type: 'encounter',
    icon: '❄️',
    rarity: 'rare',
    originRegions: ['freljord'],
    data: {
      enemyName: 'Frost Warden',
      enemyLevel: 9,
      goldReward: 320,
      experienceReward: 160,
    },
  },
  {
    id: 'freljord_crystalline_caves',
    title: 'Crystalline Caves',
    description: 'Caverns of ice crystals hold treasures frozen in time',
    type: 'treasure',
    icon: '💎',
    rarity: 'epic',
    originRegions: ['freljord'],
    data: {
      treasureType: 'cache',
      items: ['frost_core', 'ice_shard'],
      gold: 550,
      risk: 'trap',
    },
  },
  {
    id: 'freljord_tribal_hunter',
    title: 'Tribal Hunter',
    description: 'A skilled hunter from the Freljord tribes confronts you',
    type: 'encounter',
    icon: '🏹',
    rarity: 'rare',
    originRegions: ['freljord'],
    data: {
      enemyName: 'Tribal Hunter',
      enemyLevel: 8,
      goldReward: 300,
      experienceReward: 150,
    },
  },
  {
    id: 'freljord_frozen_beast',
    title: 'Ancient Frozen Beast',
    description: 'A colossal creature, frozen for ages, begins to stir',
    type: 'encounter',
    icon: '🐉',
    rarity: 'epic',
    originRegions: ['freljord'],
    data: {
      enemyName: 'Frozen Beast',
      enemyLevel: 12,
      goldReward: 550,
      experienceReward: 275,
    },
  },
];

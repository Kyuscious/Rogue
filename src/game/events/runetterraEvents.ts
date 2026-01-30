/**
 * Runeterra Base Events
 * Events accessible from all regions - the foundation of Runeterra
 */

import { GameEvent } from './eventTypes';

export const RUNETERRA_EVENTS: GameEvent[] = [
  {
    id: 'runeterra_ancient_ruin',
    title: 'Ancient Ruin',
    description: 'The remnants of an ancient civilization',
    type: 'treasure',
    icon: '🏛️',
    rarity: 'common',
    originRegions: ['runeterra'],
    data: {
      treasureType: 'cache',
      items: ['ancient_coin', 'rusted_artifact'],
      gold: 150,
      risk: 'none',
    },
  },
  {
    id: 'runeterra_wandering_scholar',
    title: 'Wandering Scholar',
    description: 'A mysterious scholar offers ancient knowledge',
    type: 'dialogue',
    icon: '📚',
    rarity: 'common',
    originRegions: ['runeterra'],
    data: {
      npcName: 'Wandering Scholar',
      dialogue: 'The scholar eyes you carefully. "I have studied the ways of Runeterra for many years. Perhaps I can teach you something useful."',
      options: [
        {
          id: 'learn_lore',
          text: 'Listen to their teachings',
          outcome: 'buff',
          value: 'enlightened',
          successRate: 100,
        },
      ],
    },
  },
  {
    id: 'runeterra_treasure_hoard',
    title: 'Treasure Hoard',
    description: 'An explorer\'s cache of riches',
    type: 'treasure',
    icon: '💰',
    rarity: 'rare',
    originRegions: ['runeterra'],
    data: {
      treasureType: 'hoard',
      items: ['explorer_pendant'],
      gold: 350,
      risk: 'none',
    },
  },
  {
    id: 'runeterra_mysterious_fog',
    title: 'Mysterious Fog',
    description: 'An unnatural mist obscures the path ahead',
    type: 'visual_novel',
    icon: '🌫️',
    rarity: 'rare',
    originRegions: ['runeterra'],
    data: {
      narrative: 'A thick fog rolls in around you. You can\'t see more than a few feet ahead. Something moves within the mist, but you can\'t make out what.',
      choices: [
        {
          id: 'push_through',
          text: 'Push through the fog',
          outcome: 'gold',
          value: 200,
          successRate: 60,
        },
        {
          id: 'wait_for_clarity',
          text: 'Wait for it to clear',
          outcome: 'buff',
          value: 'patient',
          successRate: 100,
        },
      ],
    },
  },
  {
    id: 'runeterra_fortune_teller',
    title: 'Fortune Teller',
    description: 'A seer gazes into your future',
    type: 'dialogue',
    icon: '🔮',
    rarity: 'epic',
    originRegions: ['runeterra'],
    data: {
      npcName: 'Fortune Teller',
      dialogue: 'The fortune teller peers into a crystal ball. "I see great trials ahead... and great rewards for those brave enough to claim them."',
      options: [
        {
          id: 'accept_fortune',
          text: 'Accept their prophecy',
          outcome: 'buff',
          value: 'fortold_hero',
          successRate: 100,
        },
      ],
    },
  },
];

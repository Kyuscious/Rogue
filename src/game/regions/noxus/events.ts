/**
 * Noxus Events
 * Region-specific events for Noxus - Strength, war, power
 */

import { GameEvent } from '../../events/eventTypes';

export const NOXUS_EVENTS: GameEvent[] = [
  {
    id: 'noxus_arena_duel',
    title: 'Arena Duel',
    description: 'A warrior challenges you to single combat in the Noxian Arena',
    type: 'encounter',
    icon: '⚔️',
    rarity: 'common',
    originRegions: ['noxus'],
    data: {
      enemyName: 'Noxian Warrior',
      enemyLevel: 6,
      goldReward: 200,
      experienceReward: 100,
    },
  },
  {
    id: 'noxus_warlord_challenge',
    title: 'Warlord\'s Challenge',
    description: 'A powerful Noxian warlord tests your strength and resolve',
    type: 'visual_novel',
    icon: '👑',
    rarity: 'epic',
    originRegions: ['noxus'],
    data: {
      narrative: 'A Noxian warlord eyes you with interest. "Show me your strength," they demand. You sense this encounter will define your standing in Noxus.',
      choices: [
        {
          id: 'accept_challenge',
          text: 'Accept the warlord\'s challenge',
          outcome: 'buff',
          value: 'noxian_strength',
          successRate: 70,
        },
        {
          id: 'decline_respectfully',
          text: 'Respectfully decline',
          outcome: 'relation',
          value: 'noxian_respect',
          successRate: 85,
        },
      ],
    },
  },
  {
    id: 'noxus_spoils_of_war',
    title: 'Spoils of War',
    description: 'Discover the treasures left behind from a conquered settlement',
    type: 'treasure',
    icon: '💰',
    rarity: 'rare',
    originRegions: ['noxus'],
    data: {
      treasureType: 'cache',
      items: ['war_trophy', 'plundered_gold'],
      gold: 400,
      risk: 'none',
    },
  },
  {
    id: 'noxus_crimson_order',
    title: 'Crimson Order Initiation',
    description: 'The Crimson Order offers you membership - for a price',
    type: 'visual_novel',
    icon: '🔴',
    rarity: 'epic',
    originRegions: ['noxus'],
    data: {
      narrative: 'Members of the Crimson Order approach you. They see potential in you and offer initiation into their ranks. What will you choose?',
      choices: [
        {
          id: 'join_order',
          text: 'Join the Crimson Order',
          outcome: 'buff',
          value: 'crimson_member',
          successRate: 100,
        },
        {
          id: 'refuse_order',
          text: 'Refuse their offer',
          outcome: 'stat',
          value: '+10 AD',
          successRate: 75,
        },
      ],
    },
  },
  {
    id: 'noxus_executioner_squad',
    title: 'Executioner Squad',
    description: 'Noxian executioners hunt a target through the streets',
    type: 'encounter',
    icon: '⚰️',
    rarity: 'rare',
    originRegions: ['noxus'],
    data: {
      enemyName: 'Executioner Squad Leader',
      enemyLevel: 9,
      goldReward: 320,
      experienceReward: 160,
    },
  },
];

/**
 * Ionia Events
 * Region-specific events for Ionia - Spiritual, peaceful, mystical
 */

import { GameEvent } from '../../events/eventTypes';

export const IONIA_EVENTS: GameEvent[] = [
  {
    id: 'ionia_spirit_meditation',
    title: 'Spirit Meditation',
    description: 'Meditate beneath ancient spirit trees and find inner peace',
    type: 'visual_novel',
    icon: '🌸',
    rarity: 'common',
    originRegions: ['ionia'],
    data: {
      narrative: 'You find yourself in a serene forest. Ancient spirit trees tower above you, their branches glowing with ethereal light. A sense of calm washes over you as you sit to meditate.',
      choices: [
        {
          id: 'meditate_fully',
          text: 'Embrace the meditative state',
          outcome: 'buff',
          value: 'serenity',
          successRate: 100,
        },
        {
          id: 'resist_meditation',
          text: 'Remain alert and focused',
          outcome: 'stat',
          value: '+5 AP',
          successRate: 80,
        },
      ],
    },
  },
  {
    id: 'ionia_spirit_guardian_encounter',
    title: 'Spirit Guardian',
    description: 'A guardian spirit challenges your worthiness to traverse these lands',
    type: 'encounter',
    icon: '👻',
    rarity: 'rare',
    originRegions: ['ionia'],
    data: {
      enemyName: 'Spirit Guardian',
      enemyLevel: 7,
      goldReward: 250,
      experienceReward: 125,
    },
  },
  {
    id: 'ionia_sacred_shrine',
    title: 'Sacred Shrine',
    description: 'Discover a shrine dedicated to Ionia\'s ancient protectors',
    type: 'treasure',
    icon: '⛩️',
    rarity: 'rare',
    originRegions: ['ionia'],
    data: {
      treasureType: 'reliquary',
      items: ['spirit_bead', 'meditation_scroll'],
      gold: 300,
      risk: 'none',
    },
  },
  {
    id: 'ionia_shadow_threat',
    title: 'Shadow Encroachment',
    description: 'Dark magic seeps into the spiritual lands - something must be done',
    type: 'visual_novel',
    icon: '🌑',
    rarity: 'epic',
    originRegions: ['ionia'],
    data: {
      narrative: 'The spiritual harmony of Ionia is disrupted. A shadow spreads across the land, corrupting the natural balance. The spirits cry out for aid.',
      choices: [
        {
          id: 'fight_shadow',
          text: 'Confront the shadow directly',
          outcome: 'hp',
          value: -30,
          successRate: 60,
        },
        {
          id: 'cleanse_shadow',
          text: 'Use spiritual magic to cleanse it',
          outcome: 'gold',
          value: 400,
          successRate: 75,
        },
      ],
    },
  },
  {
    id: 'ionia_ki_nexus',
    title: 'Ki Energy Nexus',
    description: 'A powerful concentration of spiritual energy offers great power - or great danger',
    type: 'treasure',
    icon: '⚡',
    rarity: 'epic',
    originRegions: ['ionia'],
    data: {
      treasureType: 'cache',
      items: ['ki_crystal'],
      gold: 500,
      risk: 'cursed',
    },
  },
];

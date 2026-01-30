/**
 * Targon Events
 * Region-specific events for Targon - Celestial, cosmic power, ascension
 */

import { GameEvent } from '../../events/eventTypes';

export const TARGON_EVENTS: GameEvent[] = [
  {
    id: 'targon_celestial_grove',
    title: 'Celestial Grove',
    description: 'A sacred grove where the stars touch the earth',
    type: 'visual_novel',
    icon: '✨',
    rarity: 'rare',
    originRegions: ['targon'],
    data: {
      narrative: 'You stand in a mystical grove where celestial light bathes everything in ethereal radiance. The air hums with cosmic energy. You feel chosen by forces greater than yourself.',
      choices: [
        {
          id: 'commune_stars',
          text: 'Commune with the celestial forces',
          outcome: 'buff',
          value: 'starblessed',
          successRate: 100,
        },
        {
          id: 'resist_power',
          text: 'Resist the overwhelming cosmic power',
          outcome: 'stat',
          value: '+20 AP',
          successRate: 80,
        },
      ],
    },
  },
  {
    id: 'targon_fallen_star',
    title: 'Fallen Star',
    description: 'A piece of a fallen celestial body lies before you',
    type: 'treasure',
    icon: '🌟',
    rarity: 'epic',
    originRegions: ['targon'],
    data: {
      treasureType: 'relic',
      items: ['celestial_fragment'],
      gold: 800,
      risk: 'none',
    },
  },
  {
    id: 'targon_celestial_guardian',
    title: 'Celestial Guardian',
    description: 'A divine being manifests to test your worthiness',
    type: 'encounter',
    icon: '👼',
    rarity: 'epic',
    originRegions: ['targon'],
    data: {
      enemyName: 'Celestial Guardian',
      enemyLevel: 11,
      goldReward: 600,
      experienceReward: 300,
    },
  },
  {
    id: 'targon_ascension_ritual',
    title: 'Ascension Ritual',
    description: 'An ancient ritual promises transcendence and divine power',
    type: 'visual_novel',
    icon: '⚡',
    rarity: 'legendary',
    originRegions: ['targon'],
    data: {
      narrative: 'You discover an ancient site where mortals once ascended to godhood. The ritual calls to you, promising ultimate power beyond imagination. But the cost is unknown.',
      choices: [
        {
          id: 'undergo_ritual',
          text: 'Undergo the ascension ritual',
          outcome: 'buff',
          value: 'ascended',
          successRate: 50,
        },
        {
          id: 'decline_ritual',
          text: 'Decline and preserve your humanity',
          outcome: 'item',
          value: 'divine_token',
          successRate: 100,
        },
      ],
    },
  },
  {
    id: 'targon_cosmic_horror',
    title: 'Cosmic Horror',
    description: 'Something vast and incomprehensible descends from the stars',
    type: 'encounter',
    icon: '👁️',
    rarity: 'legendary',
    originRegions: ['targon'],
    data: {
      enemyName: 'Cosmic Abomination',
      enemyLevel: 15,
      goldReward: 1000,
      experienceReward: 500,
    },
  },
];

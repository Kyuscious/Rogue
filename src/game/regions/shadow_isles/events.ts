/**
 * Shadow Isles Events
 * Region-specific events for Shadow Isles - Darkness, undeath, corruption
 */

import { GameEvent } from '../../events/eventTypes';

export const SHADOW_ISLES_EVENTS: GameEvent[] = [
  {
    id: 'shadow_isles_spectral_apparition',
    title: 'Spectral Apparition',
    description: 'A ghostly spirit appears before you, wailing with torment',
    type: 'encounter',
    icon: '👻',
    rarity: 'common',
    originRegions: ['shadow_isles'],
    data: {
      enemyName: 'Tortured Spirit',
      enemyLevel: 6,
      goldReward: 180,
      experienceReward: 90,
    },
  },
  {
    id: 'shadow_isles_dark_pact',
    title: 'Dark Pact',
    description: 'A shadowy entity offers you power in exchange for your service',
    type: 'visual_novel',
    icon: '🤝',
    rarity: 'epic',
    originRegions: ['shadow_isles'],
    data: {
      narrative: 'A dark figure emerges from the mist. It offers you tremendous power if you agree to become its instrument. The offer is tempting but dangerous.',
      choices: [
        {
          id: 'accept_pact',
          text: 'Accept the dark pact',
          outcome: 'buff',
          value: 'shadow_empowered',
          successRate: 100,
        },
        {
          id: 'refuse_pact',
          text: 'Refuse and fight back',
          outcome: 'hp',
          value: -25,
          successRate: 70,
        },
      ],
    },
  },
  {
    id: 'shadow_isles_cursed_treasure',
    title: 'Cursed Treasure Hoard',
    description: 'A mass of spectral gold and items lies before you, emanating dark magic',
    type: 'treasure',
    icon: '💀',
    rarity: 'epic',
    originRegions: ['shadow_isles'],
    data: {
      treasureType: 'hoard',
      items: ['death_mark', 'spectral_chain'],
      gold: 650,
      risk: 'cursed',
    },
  },
  {
    id: 'shadow_isles_spreading_corruption',
    title: 'Spreading Corruption',
    description: 'The land itself is being corrupted by an unseen force',
    type: 'visual_novel',
    icon: '🌑',
    rarity: 'rare',
    originRegions: ['shadow_isles'],
    data: {
      narrative: 'You witness the landscape warping and twisting as darkness spreads. Ancient graves burst open, and the very air grows cold. You must decide what to do.',
      choices: [
        {
          id: 'seal_corruption',
          text: 'Attempt to seal the corruption',
          outcome: 'stat',
          value: '+15 MR',
          successRate: 65,
        },
        {
          id: 'escape_corruption',
          text: 'Flee to safety',
          outcome: 'item',
          value: 'escape_rune',
          successRate: 95,
        },
      ],
    },
  },
  {
    id: 'shadow_isles_undead_champion',
    title: 'Undead Champion',
    description: 'The mightiest warrior the Shadow Isles could produce now walks as a revenant',
    type: 'encounter',
    icon: '⚔️',
    rarity: 'epic',
    originRegions: ['shadow_isles'],
    data: {
      enemyName: 'Undead Champion',
      enemyLevel: 11,
      goldReward: 500,
      experienceReward: 250,
    },
  },
];

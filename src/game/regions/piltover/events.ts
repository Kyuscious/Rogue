/**
 * Piltover Events
 * Region-specific events for Piltover - Technology, innovation, progress
 */

import { GameEvent } from '../../events/eventTypes';

export const PILTOVER_EVENTS: GameEvent[] = [
  {
    id: 'piltover_hextech_lab',
    title: 'Hextech Laboratory',
    description: 'A Hextech laboratory with mysterious technological artifacts',
    type: 'treasure',
    icon: '⚙️',
    rarity: 'rare',
    originRegions: ['piltover'],
    data: {
      treasureType: 'cache',
      items: ['hextech_crystal', 'enforcer_device'],
      gold: 350,
      risk: 'none',
    },
  },
  {
    id: 'piltover_rogue_construct',
    title: 'Rogue Construct',
    description: 'An automated battle construct has gone haywire - it must be stopped',
    type: 'encounter',
    icon: '🤖',
    rarity: 'rare',
    originRegions: ['piltover'],
    data: {
      enemyName: 'Automated Construct',
      enemyLevel: 8,
      goldReward: 280,
      experienceReward: 140,
    },
  },
  {
    id: 'piltover_invention',
    title: 'Mysterious Invention',
    description: 'A strange contraption awaits - but what does it do?',
    type: 'visual_novel',
    icon: '🔧',
    rarity: 'epic',
    originRegions: ['piltover'],
    data: {
      narrative: 'You find an intricate mechanical device with unknown purpose. Gears spin, lights flicker. You must decide what to do with it.',
      choices: [
        {
          id: 'dismantle_invention',
          text: 'Carefully dismantle it for parts',
          outcome: 'item',
          value: 'hextech_component',
          successRate: 70,
        },
        {
          id: 'activate_invention',
          text: 'Activate the device',
          outcome: 'buff',
          value: 'hex_powered',
          successRate: 55,
        },
      ],
    },
  },
  {
    id: 'piltover_chemical_disaster',
    title: 'Chemical Disaster',
    description: 'A catastrophic explosion has created hazardous conditions',
    type: 'treasure',
    icon: '☣️',
    rarity: 'epic',
    originRegions: ['piltover'],
    data: {
      treasureType: 'cache',
      items: ['chemical_fuel', 'alchemist_vial'],
      gold: 600,
      risk: 'hazardous',
    },
  },
  {
    id: 'piltover_enforcer_checkpoint',
    title: 'Enforcer Checkpoint',
    description: 'Piltover Enforcers have set up a checkpoint to inspect travelers',
    type: 'visual_novel',
    icon: '🛡️',
    rarity: 'common',
    originRegions: ['piltover'],
    data: {
      narrative: 'Armed Enforcers stop you at a checkpoint. They demand to know your business in their city. You must convince them you mean no harm.',
      choices: [
        {
          id: 'bluff_official',
          text: 'Claim to be a city official',
          outcome: 'gold',
          value: -100,
          successRate: 40,
        },
        {
          id: 'be_honest',
          text: 'Tell them the truth about your journey',
          outcome: 'relation',
          value: 'allied_enforcers',
          successRate: 90,
        },
      ],
    },
  },
];

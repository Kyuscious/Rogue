/**
 * Summoner Spells System
 * 
 * D/F summoner spells available during combat
 * Classic LoL spells adapted for solo roguelike
 */

import { CharacterStats } from './statsSystem';

export type SummonerSpell = {
  slot: 'D' | 'F';
  name: string;
  description: string;
  cooldown: number; // in turns
  manaCost: number;
  effects: SummonerEffect[];
};

export type SummonerEffect =
  | {
      type: 'teleport';
      distance: number;
      parameters: {};
    }
  | {
      type: 'heal';
      amount: number;
      instantaneous: boolean;
    }
  | {
      type: 'damage_reduction';
      duration: number;
      amount: number;
      multiplier: number;
    }
  | {
      type: 'true_damage';
      amount: number;
      adScaling: number;
    }
  | {
      type: 'crowd_control';
      ccType: 'stun' | 'slow' | 'root' | 'knockback';
      duration: number;
      parameters: Record<string, number>;
    }
  | {
      type: 'buff';
      name: string;
      duration: number;
      statModifiers: Partial<CharacterStats>;
    };

/**
 * Available summoner spells
 * Player chooses 2 from this pool at start of run
 */
export const SUMMONER_SPELL_POOL: SummonerSpell[] = [
  {
    slot: 'D',
    name: 'Flash',
    description: 'Instantly move a short distance',
    cooldown: 300, // 5 minutes in 6-sec turns = 50 turns; scaled down
    manaCost: 0,
    effects: [
      {
        type: 'teleport',
        distance: 4,
        parameters: {},
      },
    ],
  },
  {
    slot: 'F',
    name: 'Heal',
    description: 'Restore health instantly',
    cooldown: 240, // 4 minutes
    manaCost: 0,
    effects: [
      {
        type: 'heal',
        amount: 100,
        instantaneous: true,
      },
    ],
  },
  {
    slot: 'D',
    name: 'Ignite',
    description: 'Burn enemy with true damage',
    cooldown: 180, // 3 minutes
    manaCost: 0,
    effects: [
      {
        type: 'true_damage',
        amount: 50,
        adScaling: 0.2, // scales slightly with AD
      },
      {
        type: 'debuff',
        ccType: 'none',
        name: 'Burning',
        duration: 3,
        parameters: {
          damagePerTurn: 20,
        },
      } as any,
    ],
  },
  {
    slot: 'F',
    name: 'Smite',
    description: 'Strike enemy with pure force',
    cooldown: 90, // 1.5 minutes - damage jungle monster summon
    manaCost: 0,
    effects: [
      {
        type: 'true_damage',
        amount: 80,
        adScaling: 0.5,
      },
    ],
  },
  {
    slot: 'D',
    name: 'Exhaust',
    description: 'Slow and weaken enemy',
    cooldown: 210, // 3.5 minutes
    manaCost: 0,
    effects: [
      {
        type: 'crowd_control',
        ccType: 'slow',
        duration: 3,
        parameters: {
          slowAmount: 0.5, // 50% slow
        },
      },
    ],
  },
  {
    slot: 'F',
    name: 'Teleport',
    description: 'Instantly travel across the battlefield',
    cooldown: 360, // 6 minutes - long cooldown as in LoL
    manaCost: 0,
    effects: [
      {
        type: 'teleport',
        distance: 10,
        parameters: {},
      },
    ],
  },
  {
    slot: 'D',
    name: 'Cleanse',
    description: 'Remove all debuffs from yourself',
    cooldown: 210, // 3.5 minutes
    manaCost: 0,
    effects: [
      {
        type: 'buff',
        name: 'Cleansed',
        duration: 0, // Instant effect
        statModifiers: {},
      },
    ],
  },
  {
    slot: 'F',
    name: 'Ghost',
    description: 'Gain movement speed and pass through units',
    cooldown: 240, // 4 minutes
    manaCost: 0,
    effects: [
      {
        type: 'buff',
        name: 'Ghost',
        duration: 10,
        statModifiers: {
          movementSpeed: 100,
          tenacity: 50, // Can't be slowed
        },
      },
    ],
  },
  {
    slot: 'D',
    name: 'Barrier',
    description: 'Shield yourself from incoming damage',
    cooldown: 210, // 3.5 minutes
    manaCost: 0,
    effects: [
      {
        type: 'buff',
        name: 'Shielded',
        duration: 2,
        statModifiers: {
          armor: 60,
          magicResist: 40,
        },
      },
    ],
  },
  {
    slot: 'F',
    name: 'Garrison',
    description: 'Empower structure defenses - adapted as self-buff',
    cooldown: 120, // 2 minutes
    manaCost: 0,
    effects: [
      {
        type: 'buff',
        name: 'Fortified',
        duration: 5,
        statModifiers: {
          armor: 40,
          magicResist: 40,
        },
      },
    ],
  },
];

/**
 * Get available summoner spells for a slot
 */
export function getSummonerSpellsForSlot(slot: 'D' | 'F'): SummonerSpell[] {
  return SUMMONER_SPELL_POOL.filter((spell) => spell.slot === slot);
}

/**
 * Get a summoner spell by name
 */
export function getSummonerSpellByName(name: string): SummonerSpell | undefined {
  return SUMMONER_SPELL_POOL.find((spell) => spell.name === name);
}

/**
 * Default summoner spells for a run (can be customized)
 */
export function getDefaultSummonerSpells(): [SummonerSpell, SummonerSpell] {
  return [
    SUMMONER_SPELL_POOL.find((s) => s.name === 'Flash')!,
    SUMMONER_SPELL_POOL.find((s) => s.name === 'Heal')!,
  ];
}

/**
 * Select summoner spells from pool
 * Called at run start for player to choose
 */
export function selectSummonerSpells(
  spellD: SummonerSpell,
  spellF: SummonerSpell
): [SummonerSpell, SummonerSpell] {
  if (spellD.slot !== 'D' || spellF.slot !== 'F') {
    throw new Error('Invalid summoner spell slots');
  }
  return [spellD, spellF];
}

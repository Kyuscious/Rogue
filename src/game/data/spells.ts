import { Region } from '@game/types';

/**
 * Spells System
 * Spells replace the base spell action entirely
 * Players can carry up to 5 spells and switch between them in battle
 */

export interface SpellEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'utility' | 'special' | 'stun';
  damageScaling?: {
    abilityPower?: number; // Percentage of AP (100 = 100%)
    attackDamage?: number; // Percentage of AD
    health?: number; // Percentage of max HP
    flatPhysicalDamage?: number; // Flat physical damage reduced by armor
    trueDamage?: number; // Flat true damage
    missingHealthTrueDamage?: number; // Percentage of target missing HP dealt as true damage
  };
  healScaling?: {
    abilityPower?: number; // Percentage of AP
    missingHealth?: number; // Percentage of missing HP
    flatAmount?: number; // Flat heal amount
    lowHealthBonus?: { // Bonus multiplier when below HP threshold
      threshold: number; // HP percentage threshold (e.g., 40 = below 40% HP)
      multiplier: number; // Multiplier for total heal (e.g., 1.5 = 150% of base)
    };
  };
  stunDuration?: number; // Duration of stun in turns
  slowPercent?: number; // Percentage to slow movement speed
  slowDuration?: number; // Duration of slow in turns
  description: string;
}

export interface Spell {
  id: string;
  name?: string; // Deprecated: Use getSpellTranslation(id) from i18n/helpers instead
  description?: string; // Deprecated: Use getSpellTranslation(id) from i18n/helpers instead
  rarity: 'starter' | 'common' | 'epic' | 'legendary';
  effects: SpellEffect[];
  range?: number; // Spell range in units (default: uses attack range)
  castTime?: number; // Cast time in turns before effect applies
  imagePath?: string;
  cooldown?: number; // Turns until can use again (0 = no cooldown)
  originRegion?: Region; // Primary region this spell originates from
  manaCost?: number; // Future: mana system
  areaOfEffect?: {
    type: 'rectangle' | 'circle';
    size: number; // Width for rectangle, radius for circle
  };
  targeting?: {
    mode: 'none' | 'self' | 'single' | 'multiple' | 'aoe';
    selectionRule?: 'first-in-range' | 'last-in-range' | 'all-in-range' | 'auto-priority';
    range?: number;
    maxTargets?: number;
    requiresTargetInRange?: boolean;
    targetSide?: 'player' | 'enemy';
  };
}

export const SPELL_DATABASE: Record<string, Spell> = {
  // STARTER SPELLS - One for each starting Region
  
  for_demacia: { // Demacia starter spell
    id: 'for_demacia',
    name: 'For Demacia!',
    description: 'Warcry of Demacia that bolsters your resolve, granting +5% Attack Damage and a shield equal to 5% of your max HP for the next turn.',
    rarity: 'starter',
    effects: [
      {
        type: 'buff',
        description: 'Grants +5% Attack Damage and a shield equal to 5% of your max HP for 1 turn.',
      },
    ],
    targeting: {
      mode: 'self',
      targetSide: 'player',
    },
    cooldown: 0,
    originRegion: 'demacia',
  },

  rejuvenation: { // Ionia starter spell
    id: 'rejuvenation',
    name: 'Rejuvenation',
    description: 'Concentrate your spiritual energy to heal your wounds for 5 HP + 20% of your Ability Power.',
    rarity: 'starter',
    effects: [
      {
        type: 'heal',
        healScaling: {
          flatAmount: 5,
          abilityPower: 20, // 20% AP scaling
        },
        description: 'Heals for 5 + 20% of your Ability Power.',
      },
    ],
    targeting: {
      mode: 'self',
      targetSide: 'player',
    },
    cooldown: 0,
    originRegion: 'ionia',
  },

  quicksand: { // Shurima starter spell
    id: 'quicksand',
    name: 'Quicksand',
    description: 'Summon quicksand to damage and slow an enemy, reducing their movement speed by 10% for 1 turn.',
    rarity: 'starter',
    effects: [
      {
        type: 'damage',
        damageScaling: {
          abilityPower: 20, // 20% AP scaling
        },
        description: 'Deals 20% of your Ability Power as damage.',
      },
      {
        type: 'debuff',
        description: 'Reduces target movement speed by 10% for 1 turn.',
        // Slow effect parameters
        slowPercent: 10, // 10% movement speed reduction
        slowDuration: 1, // 1 turn
      },
    ],
    targeting: {
      mode: 'single',
      selectionRule: 'first-in-range',
      range: 500,
      requiresTargetInRange: true,
      targetSide: 'enemy',
    },
    cooldown: 0,
    originRegion: 'shurima',
  },


  test_spell: {
    id: 'test_spell',
    name: 'Test Spell',
    description: 'A basic spell that deals magic damage based on your Ability Power.',
    rarity: 'starter',
    effects: [
      {
        type: 'damage',
        damageScaling: {
          abilityPower: 100, // 100% AP scaling
        },
        description: 'Deals 100% of your Ability Power as magic damage.',
      },
    ],
    targeting: {
      mode: 'single',
      selectionRule: 'first-in-range',
      range: 500,
      requiresTargetInRange: true,
      targetSide: 'enemy',
    },
    cooldown: 0,
    originRegion: 'runeterra',
  },


  // Common Spells

  purify: { 
    id: 'purify',
    name: 'Purify',
    description: 'Removes all debuffs from a target ally.',
    rarity: 'starter',
    effects: [
      {
        type: 'utility',
        description: 'Removes all debuffs from target ally.',
      },
    ],
    targeting: {
      mode: 'self',
      targetSide: 'player',
    },
    cooldown: 1,
    originRegion: 'demacia',
  },
  // Epic Spells

  // Legendary Spells
  emperors_divide: {
    id: 'emperors_divide',
    name: 'Emperor\'s Divide',
    description: 'Azir calls forth imperial soldiers to reinforce his line.',
    rarity: 'legendary',
    effects: [
      {
        type: 'special',
        description: 'Summons up to 2 Sand Soldiers with Azir\'s level. These summoned soldiers carry no items.',
      },
    ],
    targeting: {
      mode: 'none',
    },
    cooldown: 7,
    originRegion: 'shurima',
  },

  demacian_justice: {
    id: 'demacian_justice',
    name: 'Demacian Justice',
    description: 'Call upon the might of Demacia to execute a targeted enemy with a heavy strike and missing-health true damage.',
    rarity: 'legendary',
    effects: [
      {
        type: 'damage',
        damageScaling: {
          flatPhysicalDamage: 250,
          missingHealthTrueDamage: 30,
        },
        description: 'Deals 250 physical damage, then true damage equal to 30% of the target\'s missing health.',
      },
    ],
    targeting: {
      mode: 'single',
      selectionRule: 'first-in-range',
      range: 500,
      requiresTargetInRange: true,
      targetSide: 'enemy',
    },
    cooldown: 3,
    originRegion: 'demacia',
  },

  wish: {
    id: 'wish',
    name: 'Wish',
    description: 'Restore health. Heals for 150 + 50% AP. If below 40% HP, heals for 50% more!',
    rarity: 'legendary',
    effects: [
      {
        type: 'heal',
        healScaling: {
          flatAmount: 150,
          abilityPower: 50, // 50% AP scaling
          lowHealthBonus: {
            threshold: 40, // Below 40% HP
            multiplier: 1.5, // Heal for 150% (50% more)
          },
        },
        description: 'Heals 150 + 50% AP. Heals 50% more if below 40% max HP.',
      },
    ],
    targeting: {
      mode: 'self',
      targetSide: 'player',
    },
    cooldown: 5, // 5 turn cooldown for legendary
    originRegion: 'targon',
  },
  
  dazzle: {
    id: 'dazzle',
    name: 'Dazzle',
    description: 'After 1.0 turn cast time, stuns the target for 1.0 turn. Range: 625 units.',
    rarity: 'legendary',
    range: 625,
    castTime: 1.0,
    effects: [
      {
        type: 'stun',
        stunDuration: 1.0,
        description: 'Stuns target for 1.0 turn after 1.0 turn cast time.',
      },
    ],
    targeting: {
      mode: 'aoe',
      selectionRule: 'first-in-range',
      range: 625,
      requiresTargetInRange: true,
      targetSide: 'enemy',
    },
    areaOfEffect: {
      type: 'rectangle',
      size: 625, // Shows range as a rectangle
    },
    cooldown: 3,
    originRegion: 'targon',
  },
};

/**
 * Get spell by ID
 */
export function getSpellById(spellId: string): Spell | undefined {
  return SPELL_DATABASE[spellId];
}

/**
 * Get all spells
 */
export function getAllSpells(): Spell[] {
  return Object.values(SPELL_DATABASE);
}

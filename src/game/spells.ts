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
    trueDamage?: number; // Flat true damage
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
  description: string;
}

export interface Spell {
  id: string;
  name: string;
  description: string;
  rarity: 'starter' | 'common' | 'epic' | 'legendary';
  effects: SpellEffect[];
  range?: number; // Spell range in units (default: uses attack range)
  castTime?: number; // Cast time in turns before effect applies
  imagePath?: string;
  cooldown?: number; // Turns until can use again (0 = no cooldown)
  manaCost?: number; // Future: mana system
  areaOfEffect?: {
    type: 'rectangle' | 'circle';
    size: number; // Width for rectangle, radius for circle
  };
}

export const SPELL_DATABASE: Record<string, Spell> = {
  // STARTER SPELLS - One for each starting Region
  
  for_demacia: { // Demacia starter spell
    id: 'for_demacia',
    name: 'For Demacia!',
    description: 'Warcry of Demacia that bolsters your resolve, granting +5% AD and +0.5 Attack Speed for 1 turn.',
    rarity: 'starter',
    effects: [
      {
        type: 'buff',
        description: 'Grants +5% Attack Damage and +0.5 Attack Speed for the next turn (starts at next integer turn).',
      },
    ],
    cooldown: 2,
  },

  rejuvenation: { // Ionia starter spell
    id: 'rejuvenation',
    name: 'Rejuvenation',
    description: 'Concentrate your spiritual energy to heal your wounds for 20 HP + 20% of your Ability Power.',
    rarity: 'starter',
    effects: [
      {
        type: 'heal',
        healScaling: {
          flatAmount: 20,
          abilityPower: 20, // 20% AP scaling
        },
        description: 'Heals for 20 + 20% of your Ability Power.',
      },
    ],
    cooldown: 2,
  },

  quicksand: { // Shurima starter spell
    id: 'quicksand',
    name: 'Quicksand',
    description: 'Summon quicksand to damage and slow an enemy, reducing their movement speed by 10% for 3 turns.',
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
        description: 'Reduces target movement speed by 10% for 3 turns.',
      },
    ],
    cooldown: 2,
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
    cooldown: 0,
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
    cooldown: 1,
  },
  // Epic Spells

  // Legend Spells
  // HEALING SPELL - Conditional Healing
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
    cooldown: 5, // 5 turn cooldown for legendary
  },
  
  // CROWD CONTROL SPELL - Dazzle
  dazzle: {
    id: 'dazzle',
    name: 'Dazzle',
    description: 'After 1.0 turn cast time, stuns the target for 1.0 turn. Range: 625 units.',
    rarity: 'epic',
    range: 625,
    castTime: 1.0,
    effects: [
      {
        type: 'stun',
        stunDuration: 1.0,
        description: 'Stuns target for 1.0 turn after 1.0 turn cast time.',
      },
    ],
    areaOfEffect: {
      type: 'rectangle',
      size: 625, // Shows range as a rectangle
    },
    cooldown: 3,
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

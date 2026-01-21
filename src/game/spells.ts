/**
 * Spells System
 * Spells replace the base spell action entirely
 * Players can carry up to 5 spells and switch between them in battle
 */

export interface SpellEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'utility' | 'special';
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
  description: string;
}

export interface Spell {
  id: string;
  name: string;
  description: string;
  rarity: 'starter' | 'common' | 'epic' | 'legendary';
  effects: SpellEffect[];
  imagePath?: string;
  cooldown?: number; // Turns until can use again (0 = no cooldown)
  manaCost?: number; // Future: mana system
}

export const SPELL_DATABASE: Record<string, Spell> = {
  // STARTER SPELL - Basic Spell Replacement
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

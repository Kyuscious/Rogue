/**
 * Character Abilities System
 * 
 * Q/W/E/R abilities with:
 * - Scaling (AD or AP)
 * - Cooldowns
 * - Mana costs
 * - Effects (damage, CC, buffs, debuffs)
 */

import { CharacterStats } from './statsSystem';

export type AbilitySchool = 'physical' | 'magical' | 'mixed' | 'true';

export type Ability = {
  key: 'Q' | 'W' | 'E' | 'R';
  name: string;
  description: string;
  manaCost: number;
  cooldown: number; // in turns
  range: number;
  
  // Damage
  baseDamage: number;
  adScaling: number; // % of AD
  apScaling: number; // % of AP
  school: AbilitySchool;
  
  // Effects
  effects: AbilityEffect[];
};

export type AbilityEffect =
  | {
      type: 'damage';
      multiplier: number; // damage = (baseDamage + scaling) * multiplier
    }
  | {
      type: 'heal';
      amount: number; // flat heal
      apScaling: number; // % of AP
    }
  | {
      type: 'buff';
      name: string;
      duration: number; // in turns
      effects: BuffModifier[];
    }
  | {
      type: 'debuff';
      name: string;
      duration: number;
      effects: DebuffModifier[];
    }
  | {
      type: 'crowd_control';
      ccType: 'stun' | 'root' | 'slow' | 'knockback';
      duration: number;
      parameters: Record<string, number>; // slow %age, knockback distance, etc
    };

export type BuffModifier = {
  stat: keyof CharacterStats;
  amount: number;
  multiplier: number; // 1.0 = no change, 1.2 = +20%
};

export type DebuffModifier = {
  type: 'damage_reduction' | 'damage_amplification';
  amount: number;
};

/**
 * Get all abilities for a class
 */
export const ABILITY_DATABASE: Record<string, Ability[]> = {
  // MAGE - Focus: AP scaling, spellcasting
  mage: [
    {
      key: 'Q',
      name: 'Fireball',
      description: 'Hurl a fireball at your enemy',
      manaCost: 40,
      cooldown: 1,
      range: 7,
      baseDamage: 60,
      adScaling: 0,
      apScaling: 0.75,
      school: 'magical',
      effects: [
        {
          type: 'damage',
          multiplier: 1.0,
        },
      ],
    },
    {
      key: 'W',
      name: 'Arcane Mist',
      description: 'Cloud of mana-infused mist',
      manaCost: 50,
      cooldown: 2,
      range: 6,
      baseDamage: 80,
      adScaling: 0,
      apScaling: 0.8,
      school: 'magical',
      effects: [
        {
          type: 'damage',
          multiplier: 1.0,
        },
        {
          type: 'debuff',
          name: 'Silenced',
          duration: 2,
          effects: [],
        },
      ],
    },
    {
      key: 'E',
      name: 'Mana Shield',
      description: 'Protect yourself with arcane energy',
      manaCost: 60,
      cooldown: 3,
      range: 0,
      baseDamage: 0,
      adScaling: 0,
      apScaling: 0.5,
      school: 'magical',
      effects: [
        {
          type: 'buff',
          name: 'Shielded',
          duration: 3,
          effects: [
            {
              stat: 'armor',
              amount: 30,
              multiplier: 1.0,
            },
            {
              stat: 'magicResist',
              amount: 30,
              multiplier: 1.0,
            },
          ],
        },
      ],
    },
    {
      key: 'R',
      name: 'Meteor Strike',
      description: 'Call down meteors on a wide area',
      manaCost: 100,
      cooldown: 5,
      range: 8,
      baseDamage: 150,
      adScaling: 0,
      apScaling: 1.0,
      school: 'magical',
      effects: [
        {
          type: 'damage',
          multiplier: 1.0,
        },
        {
          type: 'crowd_control',
          ccType: 'stun',
          duration: 1,
          parameters: {},
        },
      ],
    },
  ],

  // TANK - Focus: Low damage, survival
  tank: [
    {
      key: 'Q',
      name: 'Shield Bash',
      description: 'Bash with your shield',
      manaCost: 35,
      cooldown: 1,
      range: 2,
      baseDamage: 40,
      adScaling: 0.6,
      apScaling: 0,
      school: 'physical',
      effects: [
        {
          type: 'damage',
          multiplier: 1.0,
        },
      ],
    },
    {
      key: 'W',
      name: 'Fortify',
      description: 'Harden your defenses temporarily',
      manaCost: 50,
      cooldown: 3,
      range: 0,
      baseDamage: 0,
      adScaling: 0,
      apScaling: 0,
      school: 'true',
      effects: [
        {
          type: 'buff',
          name: 'Fortified',
          duration: 3,
          effects: [
            {
              stat: 'armor',
              amount: 50,
              multiplier: 1.0,
            },
          ],
        },
      ],
    },
    {
      key: 'E',
      name: 'Taunt',
      description: 'Draw enemy attention and reduce damage',
      manaCost: 45,
      cooldown: 4,
      range: 5,
      baseDamage: 0,
      adScaling: 0,
      apScaling: 0,
      school: 'true',
      effects: [
        {
          type: 'buff',
          name: 'Taunted',
          duration: 2,
          effects: [
            {
              stat: 'armor',
              amount: 30,
              multiplier: 1.0,
            },
          ],
        },
      ],
    },
    {
      key: 'R',
      name: 'Unbreakable',
      description: 'Become an immovable force',
      manaCost: 80,
      cooldown: 6,
      range: 0,
      baseDamage: 0,
      adScaling: 0,
      apScaling: 0,
      school: 'true',
      effects: [
        {
          type: 'buff',
          name: 'Unbreakable',
          duration: 4,
          effects: [
            {
              stat: 'armor',
              amount: 80,
              multiplier: 1.0,
            },
            {
              stat: 'magicResist',
              amount: 60,
              multiplier: 1.0,
            },
          ],
        },
      ],
    },
  ],

  // FIGHTER - Focus: Balanced AD/Survivability
  fighter: [
    {
      key: 'Q',
      name: 'Slash',
      description: 'A powerful slash with your weapon',
      manaCost: 35,
      cooldown: 1,
      range: 3,
      baseDamage: 70,
      adScaling: 0.8,
      apScaling: 0,
      school: 'physical',
      effects: [
        {
          type: 'damage',
          multiplier: 1.0,
        },
      ],
    },
    {
      key: 'W',
      name: 'Riposte',
      description: 'Counter-attack and gain defense',
      manaCost: 40,
      cooldown: 3,
      range: 2,
      baseDamage: 60,
      adScaling: 0.7,
      apScaling: 0,
      school: 'physical',
      effects: [
        {
          type: 'damage',
          multiplier: 1.0,
        },
        {
          type: 'buff',
          name: 'Countered',
          duration: 2,
          effects: [
            {
              stat: 'armor',
              amount: 25,
              multiplier: 1.0,
            },
          ],
        },
      ],
    },
    {
      key: 'E',
      name: 'Bloodthirst',
      description: 'Gain lifestealing on next attacks',
      manaCost: 50,
      cooldown: 4,
      range: 0,
      baseDamage: 0,
      adScaling: 0,
      apScaling: 0,
      school: 'physical',
      effects: [
        {
          type: 'buff',
          name: 'Bloodthirst',
          duration: 3,
          effects: [
            {
              stat: 'lifeSteal',
              amount: 25,
              multiplier: 1.0,
            },
          ],
        },
      ],
    },
    {
      key: 'R',
      name: 'Last Stand',
      description: 'Stand firm and gain massive defense',
      manaCost: 90,
      cooldown: 5,
      range: 0,
      baseDamage: 100,
      adScaling: 0.9,
      apScaling: 0,
      school: 'physical',
      effects: [
        {
          type: 'damage',
          multiplier: 1.2,
        },
        {
          type: 'buff',
          name: 'Last Stand',
          duration: 4,
          effects: [
            {
              stat: 'armor',
              amount: 60,
              multiplier: 1.0,
            },
            {
              stat: 'health',
              amount: 100,
              multiplier: 1.0,
            },
          ],
        },
      ],
    },
  ],

  // ASSASSIN - Focus: High burst, low survivability
  assassin: [
    {
      key: 'Q',
      name: 'Quick Strike',
      description: 'Fast, precise strike',
      manaCost: 30,
      cooldown: 1,
      range: 2,
      baseDamage: 65,
      adScaling: 0.85,
      apScaling: 0,
      school: 'physical',
      effects: [
        {
          type: 'damage',
          multiplier: 1.1, // Slight bonus
        },
      ],
    },
    {
      key: 'W',
      name: 'Shadow Step',
      description: 'Dodge and reposition',
      manaCost: 40,
      cooldown: 2,
      range: 0,
      baseDamage: 0,
      adScaling: 0,
      apScaling: 0,
      school: 'true',
      effects: [
        {
          type: 'buff',
          name: 'Untargetable',
          duration: 1,
          effects: [
            {
              stat: 'armor',
              amount: 100,
              multiplier: 1.0,
            },
          ],
        },
      ],
    },
    {
      key: 'E',
      name: 'Ambush',
      description: 'Set up for a devastating strike',
      manaCost: 50,
      cooldown: 3,
      range: 4,
      baseDamage: 90,
      adScaling: 0.95,
      apScaling: 0,
      school: 'physical',
      effects: [
        {
          type: 'damage',
          multiplier: 1.5, // High burst
        },
        {
          type: 'crowd_control',
          ccType: 'knockback',
          duration: 1,
          parameters: { distance: 2 },
        },
      ],
    },
    {
      key: 'R',
      name: 'Death Mark',
      description: 'Mark enemy for execution',
      manaCost: 100,
      cooldown: 6,
      range: 6,
      baseDamage: 200,
      adScaling: 1.1,
      apScaling: 0,
      school: 'physical',
      effects: [
        {
          type: 'damage',
          multiplier: 2.0, // Massive burst
        },
        {
          type: 'debuff',
          name: 'Marked for Death',
          duration: 3,
          effects: [
            {
              type: 'damage_amplification',
              amount: 0.2, // 20% more damage taken
            },
          ],
        },
      ],
    },
  ],

  // ADC (Attack Damage Carry) - Focus: Sustained AD damage
  adc: [
    {
      key: 'Q',
      name: 'Piercing Shot',
      description: 'Accurate shot at range',
      manaCost: 30,
      cooldown: 1,
      range: 8,
      baseDamage: 55,
      adScaling: 0.9,
      apScaling: 0,
      school: 'physical',
      effects: [
        {
          type: 'damage',
          multiplier: 1.0,
        },
      ],
    },
    {
      key: 'W',
      name: 'Volley',
      description: 'Rapid multi-shot attack',
      manaCost: 45,
      cooldown: 2,
      range: 7,
      baseDamage: 75,
      adScaling: 0.85,
      apScaling: 0,
      school: 'physical',
      effects: [
        {
          type: 'damage',
          multiplier: 1.2, // Hits multiple times
        },
      ],
    },
    {
      key: 'E',
      name: 'Kiting',
      description: 'Maintain distance and attack',
      manaCost: 50,
      cooldown: 3,
      range: 0,
      baseDamage: 0,
      adScaling: 0,
      apScaling: 0,
      school: 'true',
      effects: [
        {
          type: 'buff',
          name: 'On the Move',
          duration: 3,
          effects: [
            {
              stat: 'movementSpeed',
              amount: 60,
              multiplier: 1.0,
            },
            {
              stat: 'armor',
              amount: 15,
              multiplier: 1.0,
            },
          ],
        },
      ],
    },
    {
      key: 'R',
      name: 'Barrage',
      description: 'Rain of arrows on the battlefield',
      manaCost: 80,
      cooldown: 5,
      range: 10,
      baseDamage: 120,
      adScaling: 1.0,
      apScaling: 0,
      school: 'physical',
      effects: [
        {
          type: 'damage',
          multiplier: 1.3,
        },
        {
          type: 'crowd_control',
          ccType: 'slow',
          duration: 2,
          parameters: { slowAmount: 0.4 }, // 40% slow
        },
      ],
    },
  ],

  // SUPPORT - Focus: Healing/Buffing allies (adapted for 1v1)
  support: [
    {
      key: 'Q',
      name: 'Holy Bolt',
      description: 'Healing projectile',
      manaCost: 45,
      cooldown: 2,
      range: 6,
      baseDamage: 35,
      adScaling: 0.3,
      apScaling: 0.6,
      school: 'magical',
      effects: [
        {
          type: 'heal',
          amount: 50,
          apScaling: 0.5,
        },
      ],
    },
    {
      key: 'W',
      name: 'Blessing',
      description: 'Bless yourself with protective power',
      manaCost: 50,
      cooldown: 3,
      range: 0,
      baseDamage: 0,
      adScaling: 0,
      apScaling: 0,
      school: 'magical',
      effects: [
        {
          type: 'buff',
          name: 'Blessed',
          duration: 3,
          effects: [
            {
              stat: 'magicResist',
              amount: 40,
              multiplier: 1.0,
            },
            {
              stat: 'armor',
              amount: 20,
              multiplier: 1.0,
            },
          ],
        },
      ],
    },
    {
      key: 'E',
      name: 'Cleanse',
      description: 'Remove debuffs and cleanse yourself',
      manaCost: 55,
      cooldown: 4,
      range: 0,
      baseDamage: 0,
      adScaling: 0,
      apScaling: 0,
      school: 'true',
      effects: [
        {
          type: 'heal',
          amount: 80,
          apScaling: 0.4,
        },
      ],
    },
    {
      key: 'R',
      name: 'Divine Intervention',
      description: 'Channel divine power for massive healing and support',
      manaCost: 100,
      cooldown: 6,
      range: 0,
      baseDamage: 0,
      adScaling: 0,
      apScaling: 0.8,
      school: 'magical',
      effects: [
        {
          type: 'heal',
          amount: 150,
          apScaling: 0.7,
        },
        {
          type: 'buff',
          name: 'Divine Shield',
          duration: 4,
          effects: [
            {
              stat: 'armor',
              amount: 50,
              multiplier: 1.0,
            },
            {
              stat: 'magicResist',
              amount: 50,
              multiplier: 1.0,
            },
          ],
        },
      ],
    },
  ],

  // BRUISER - Focus: Mixed damage and durability
  bruiser: [
    {
      key: 'Q',
      name: 'Heavy Blow',
      description: 'Powerful crushing attack',
      manaCost: 35,
      cooldown: 1,
      range: 3,
      baseDamage: 80,
      adScaling: 0.8,
      apScaling: 0,
      school: 'physical',
      effects: [
        {
          type: 'damage',
          multiplier: 1.0,
        },
      ],
    },
    {
      key: 'W',
      name: 'Tenacity',
      description: 'Push through and resist effects',
      manaCost: 50,
      cooldown: 3,
      range: 0,
      baseDamage: 0,
      adScaling: 0,
      apScaling: 0,
      school: 'true',
      effects: [
        {
          type: 'buff',
          name: 'Tenacious',
          duration: 3,
          effects: [
            {
              stat: 'tenacity',
              amount: 40,
              multiplier: 1.0,
            },
          ],
        },
      ],
    },
    {
      key: 'E',
      name: 'Momentum',
      description: 'Build up power and deal extra damage',
      manaCost: 45,
      cooldown: 2,
      range: 4,
      baseDamage: 70,
      adScaling: 0.85,
      apScaling: 0,
      school: 'physical',
      effects: [
        {
          type: 'damage',
          multiplier: 1.15,
        },
      ],
    },
    {
      key: 'R',
      name: 'Berserker Rage',
      description: 'Enter a state of raw power',
      manaCost: 100,
      cooldown: 5,
      range: 0,
      baseDamage: 130,
      adScaling: 1.0,
      apScaling: 0,
      school: 'physical',
      effects: [
        {
          type: 'damage',
          multiplier: 1.4,
        },
        {
          type: 'buff',
          name: 'Berserk',
          duration: 4,
          effects: [
            {
              stat: 'attackDamage',
              amount: 50,
              multiplier: 1.0,
            },
            {
              stat: 'armor',
              amount: 30,
              multiplier: 1.0,
            },
          ],
        },
      ],
    },
  ],

  // ENCHANTER - Focus: Utility and AP scaling (adapted for 1v1)
  enchanter: [
    {
      key: 'Q',
      name: 'Arcane Orb',
      description: 'Launch an orb of pure magic',
      manaCost: 40,
      cooldown: 1,
      range: 7,
      baseDamage: 55,
      adScaling: 0,
      apScaling: 0.8,
      school: 'magical',
      effects: [
        {
          type: 'damage',
          multiplier: 1.0,
        },
      ],
    },
    {
      key: 'W',
      name: 'Protection Circle',
      description: 'Create a protective aura',
      manaCost: 50,
      cooldown: 3,
      range: 0,
      baseDamage: 0,
      adScaling: 0,
      apScaling: 0,
      school: 'magical',
      effects: [
        {
          type: 'buff',
          name: 'Protected',
          duration: 3,
          effects: [
            {
              stat: 'armor',
              amount: 30,
              multiplier: 1.0,
            },
            {
              stat: 'magicResist',
              amount: 30,
              multiplier: 1.0,
            },
          ],
        },
      ],
    },
    {
      key: 'E',
      name: 'Enchantment',
      description: 'Enhance yourself with magic',
      manaCost: 55,
      cooldown: 4,
      range: 0,
      baseDamage: 0,
      adScaling: 0,
      apScaling: 0,
      school: 'magical',
      effects: [
        {
          type: 'buff',
          name: 'Enchanted',
          duration: 4,
          effects: [
            {
              stat: 'abilityPower',
              amount: 40,
              multiplier: 1.0,
            },
            {
              stat: 'movementSpeed',
              amount: 30,
              multiplier: 1.0,
            },
          ],
        },
      ],
    },
    {
      key: 'R',
      name: 'Eternal Blessing',
      description: 'Empower yourself with ancient magic',
      manaCost: 100,
      cooldown: 6,
      range: 0,
      baseDamage: 100,
      adScaling: 0,
      apScaling: 0.9,
      school: 'magical',
      effects: [
        {
          type: 'damage',
          multiplier: 1.0,
        },
        {
          type: 'heal',
          amount: 100,
          apScaling: 0.6,
        },
        {
          type: 'buff',
          name: 'Blessed',
          duration: 4,
          effects: [
            {
              stat: 'abilityPower',
              amount: 50,
              multiplier: 1.0,
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Get abilities for a character class
 */
export function getAbilitiesForClass(characterClass: string): Ability[] {
  return ABILITY_DATABASE[characterClass] || ABILITY_DATABASE.fighter;
}

/**
 * Get a specific ability
 */
export function getAbility(
  characterClass: string,
  key: 'Q' | 'W' | 'E' | 'R'
): Ability | undefined {
  const abilities = getAbilitiesForClass(characterClass);
  return abilities.find((a) => a.key === key);
}

/**
 * Weapons System
 * Weapons replace the base attack action entirely
 * Players can carry up to 3 weapons and switch between them in battle
 */

export interface WeaponEffect {
  type: 'damage' | 'movement' | 'buff' | 'debuff' | 'special';
  damageScaling?: {
    attackDamage?: number; // Percentage of AD (100 = 100%)
    abilityPower?: number; // Percentage of AP
    health?: number; // Percentage of max HP
    trueDamage?: number; // Flat true damage
  };
  movementAmount?: number; // Units to move (positive = towards, negative = away)
  description: string;
}

export interface Weapon {
  id: string;
  name: string;
  description: string;
  rarity: 'starter' | 'common' | 'epic' | 'legendary';
  effects: WeaponEffect[];
  imagePath?: string;
  cooldown?: number; // Turns until can use again (0 = no cooldown)
}

export const WEAPON_DATABASE: Record<string, Weapon> = {
  // STARTER WEAPON - Basic Attack Replacement
  test_weapon: {
    id: 'test_weapon',
    name: 'Test Weapon',
    description: 'A basic weapon that deals physical damage based on your Attack Damage.',
    rarity: 'starter',
    effects: [
      {
        type: 'damage',
        damageScaling: {
          attackDamage: 100, // 100% AD scaling
        },
        description: 'Deals 100% of your Attack Damage as physical damage.',
      },
    ],
    cooldown: 0,
  },

  // BLEEDING WEAPON - Applies stacking DoT debuff
  delverhold_greateaxe: {
    id: 'delverhold_greateaxe',
    name: 'Delverhold Greateaxe',
    description: 'A massive axe that causes devastating bleeding wounds. Each strike inflicts Hemorrhage, dealing 30% AD per turn for 5 turns. Stacks up to 5 times.',
    rarity: 'legendary',
    effects: [
      {
        type: 'damage',
        damageScaling: {
          attackDamage: 100, // 100% AD scaling
        },
        description: 'Deals 100% of your Attack Damage as physical damage.',
      },
      {
        type: 'debuff',
        description: 'Applies Hemorrhage: 30% AD damage per turn for 5 turns. Stacks up to 5 times (150% AD max). Refreshes duration on stack.',
      },
    ],
    cooldown: 0,
  },
};

/**
 * Get weapon by ID
 */
export function getWeaponById(weaponId: string): Weapon | undefined {
  return WEAPON_DATABASE[weaponId];
}

/**
 * Get all weapons
 */
export function getAllWeapons(): Weapon[] {
  return Object.values(WEAPON_DATABASE);
}

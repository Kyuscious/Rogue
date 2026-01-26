/**
 * Weapons System
 * Weapons replace the base attack action entirely
 * Players can carry up to 3 weapons and switch between them in battle
 */

export interface WeaponEffect {
  type: 'damage' | 'movement' | 'buff' | 'debuff' | 'special' | 'stun';
  damageScaling?: {
    attackDamage?: number; // Percentage of AD (100 = 100%)
    abilityPower?: number; // Percentage of AP
    health?: number; // Percentage of max HP
    trueDamage?: number; // Flat true damage
  };
  movementAmount?: number; // Units to move (positive = towards, negative = away)
  stunDuration?: number; // Turns to stun target
  description: string;
}

export interface Weapon {
  id: string;
  name?: string; // Deprecated: Use getWeaponTranslation(id) from i18n/helpers instead
  description?: string; // Deprecated: Use getWeaponTranslation(id) from i18n/helpers instead
  rarity: 'starter' | 'common' | 'epic' | 'legendary';
  effects: WeaponEffect[];
  imagePath?: string;
  cooldown?: number; // Turns until can use again (0 = no cooldown)
  stats?: {
    // Survivability
    health?: number;
    armor?: number;
    magicResist?: number;
    // Attack
    attackRange?: number;
    attackDamage?: number;
    attackSpeed?: number;
    // Spell
    abilityPower?: number;
    // Mobility
    movementSpeed?: number;
  };
}

export const WEAPON_DATABASE: Record<string, Weapon> = {
  // STARTER WEAPON - One for each starting Region

  demacian_steel_blade: {
    id: 'demacian_steel_blade',
    name: 'Demacian Steel Blade',
    description: 'A demacian sword that protects you from magic and deals Attack damage.',
    rarity: 'starter',
    effects: [
      {
        type: 'damage',
        damageScaling: {
          attackDamage: 60, // 60% AD scaling
        },
        description: 'Deals 60% of your Attack Damage damage.',
      },
    ],
    stats: {
      magicResist: 10,
      attackDamage: 5,
    },
    cooldown: 0,
  },
  
  spirit_tree_bow: {
    id: 'spirit_tree_bow',
    name: 'Spirit Tree Bow',
    description: 'A bow crafted from the wood of ancient spirit trees that deals both physical and magical damage.',
    rarity: 'starter',
    effects: [
      {
        type: 'damage',
        damageScaling: {
          attackDamage: 30, // 30% AD scaling
        
          abilityPower: 30, // 30% AP scaling
        },
        description: 'Deals 30% of your Attack Damage and 30% of your Ability Power as damage.',
      },
    ],
    stats: {
      attackRange: 375,
      movementSpeed: 30,
    },
    cooldown: 0,
  },

  glyphed_bronze_spear: {
    id: 'glyphed_bronze_spear',
    name: 'Glyphed Bronze Spear',
    description: 'A spear etched with ancient runes that channels magical energy to quickly strike foes.',
    rarity: 'starter',
    effects: [
      {
        type: 'damage',
        damageScaling: {
          abilityPower: 20, // 20% AP scaling
          attackDamage: 40, // 40% AD scaling
        },
        description: 'Deals 20% of your Ability Power and 40% of your Attack Damage as damage.',
      },
    ],
    stats: {
      attackSpeed: 0.2,
      attackRange: 100,
    },
    cooldown: 0,
  },

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
  // LOOTABLE WEAPONS

  //COMMON WEAPON - Simple damage dealer

  swinging_glaive: {
    id: 'swinging_glaive',
    name: 'Swinging Glaive',
    description: 'A heavy glaive that deals significant physical damage with each swing.',
    rarity: 'starter',
    effects: [
      {
        type: 'damage',
        damageScaling: {
          attackDamage: 15, // 15% AD scaling
        },
        description: 'Deals 15% of your Attack Damage as physical damage.',
      },
    ],
    cooldown: 0,
  },
  
  // STUN WEAPON - Deals damage and stuns
  shield_of_daybreak: {
    id: 'shield_of_daybreak',
    name: 'Shield of Daybreak',
    description: 'Strike enemies with radiant force, dealing 30% AD damage and stunning them for 1.0 turn. Uses your attack range.',
    rarity: 'epic',
    effects: [
      {
        type: 'damage',
        damageScaling: {
          attackDamage: 30, // 30% AD scaling
        },
        description: 'Deals 30% of your Attack Damage as physical damage.',
      },
      {
        type: 'stun',
        stunDuration: 1.0,
        description: 'Stuns the target for 1.0 turn.',
      },
    ],
    cooldown: 3,
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

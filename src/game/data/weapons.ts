import { Region } from '@game/types';

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
  originRegion?: Region; // Primary region this weapon originates from
  // Weapon stats are metadata for attack behavior (for example weapon-specific range)
  // and must not be merged into player core stats just by equipping the weapon.
  stats?: {
    // Survivability
    health?: number;
    armor?: number;
    magicResist?: number;
    // Attack
    attackRange?: number;
    attackDamage?: number;
    speed?: number;
    // Spell
    abilityPower?: number;
    // Mobility
    movementSpeed?: number;
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
    originRegion: 'demacia',
    cooldown: 0,
    targeting: {
      mode: 'single',
      selectionRule: 'first-in-range',
      requiresTargetInRange: true,
    },
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
    originRegion: 'ionia',
    stats: {
      attackRange: 375,
    },
    cooldown: 0,
    targeting: {
      mode: 'single',
      selectionRule: 'first-in-range',
      requiresTargetInRange: true,
    },
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
    originRegion: 'shurima',
    stats: {
      attackRange: 150,
    },
    cooldown: 0,
    targeting: {
      mode: 'single',
      selectionRule: 'first-in-range',
      requiresTargetInRange: true,
    },
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
    originRegion: 'runeterra',
    targeting: {
      mode: 'single',
      selectionRule: 'first-in-range',
      requiresTargetInRange: true,
    },
  },
  // LOOTABLE WEAPONS

  //COMMON WEAPON - Simple damage dealer

  swinging_glaive: {
    id: 'swinging_glaive',
    name: 'Swinging Glaive',
    description: 'A heavy glaive that deals significant physical damage with each swing.',
    rarity: 'common',
    effects: [
      {
        type: 'damage',
        damageScaling: {
          attackDamage: 30, // 30% AD scaling
        },
        description: 'Deals 30% of your Attack Damage as physical damage.',
      },
    ],
    cooldown: 0,
    originRegion: 'noxus',
    targeting: {
      mode: 'aoe',
      selectionRule: 'all-in-range',
      requiresTargetInRange: true,
    },
  },
  
  // EPIC WEAPON - New mechanics
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
    originRegion: 'targon',
    targeting: {
      mode: 'single',
      selectionRule: 'first-in-range',
      requiresTargetInRange: true,
    },
  },

  // LEGENDARY WEAPON - 
  staff_of_office: {
    id: 'staff_of_office',
    name: 'Staff of Office',
    description: 'A royal staff that channels imperial magic through each strike.',
    rarity: 'legendary',
    effects: [
      {
        type: 'damage',
        damageScaling: {
          abilityPower: 35,
        },
        description: 'Deals magic damage equal to 35% of the wielder\'s Ability Power.',
      },
    ],
    cooldown: 0,
    originRegion: 'shurima',
    stats: {
      attackRange: 425,
    },
    targeting: {
      mode: 'single',
      selectionRule: 'first-in-range',
      requiresTargetInRange: true,
    },
  },

  blowgun: {
    id: 'blowgun',
    name: 'Blowgun',
    description: 'A precise dart weapon. Deals 50% AP on hit and applies poison for 3 turns. Poison does not stack and refreshes duration.',
    rarity: 'legendary',
    effects: [
      {
        type: 'damage',
        damageScaling: {
          abilityPower: 50,
        },
        description: 'Deals magic damage equal to 50% of the wielder\'s Ability Power.',
      },
      {
        type: 'debuff',
        description: 'Applies Poison: 30% current AP per turn for 3 turns. Reapplying refreshes duration only.',
      },
    ],
    cooldown: 0,
    originRegion: 'bandle_city',
    stats: {
      attackRange: 475,
    },
    targeting: {
      mode: 'single',
      selectionRule: 'first-in-range',
      requiresTargetInRange: true,
    },
  },

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
    originRegion: 'noxus',
    targeting: {
      mode: 'single',
      selectionRule: 'first-in-range',
      requiresTargetInRange: true,
    },
  },
};

export const MELEE_RANGE_THRESHOLD = 150;

export type WeaponAttackType = 'melee' | 'ranged';

/**
 * Returns the effective range used by this weapon attack.
 * - Ranged weapons: explicit weapon range above melee threshold.
 * - Melee weapons: always use player range (even if player range is buffed above 150).
 */
export function getEffectiveWeaponRange(weapon: Weapon, playerAttackRange: number): number {
  const weaponConfiguredRange = weapon.targeting?.range ?? weapon.stats?.attackRange;
  if (weaponConfiguredRange !== undefined && weaponConfiguredRange > MELEE_RANGE_THRESHOLD) {
    return weaponConfiguredRange;
  }
  return playerAttackRange;
}

/**
 * Weapon attack type is based on weapon definition, never on current player range.
 */
export function getWeaponAttackType(weapon: Weapon): WeaponAttackType {
  const weaponConfiguredRange = weapon.targeting?.range ?? weapon.stats?.attackRange;
  return weaponConfiguredRange !== undefined && weaponConfiguredRange > MELEE_RANGE_THRESHOLD
    ? 'ranged'
    : 'melee';
}

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

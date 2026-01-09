/**
 * LoL-Inspired Stats System
 * This system tracks all character stats similar to League of Legends
 */

import { CharacterClass } from './types';

export type LootType = 
  | 'attackDamage' 
  | 'abilityPower' 
  | 'tankDefense' 
  | 'mobility' 
  | 'utility' 
  | 'hybrid' 
  | 'critical';

/**
 * Core stats that every character has
 * Inspired by League of Legends stat system
 */
export interface CharacterStats {
  // Primary Stats
  health: number;
  attackDamage: number;
  abilityPower: number;
  armor: number;
  magicResist: number;
  
  // Attack Stats
  attackSpeed: number;
  attackRange: number;
  criticalChance: number;
  criticalDamage: number;
  
  // Ability Stats
  abilityHaste: number;
  
  // Survivability
  lifeSteal: number;
  spellVamp: number;
  omnivamp: number;
  
  // Mobility & Utility
  movementSpeed: number;
  tenacity: number; // Crowd control reduction
  
  // Misc
  goldGain: number;
  xpGain: number;
  lethality: number;
  magicPenetration: number;
}

/**
 * Default stat values for new characters
 */
export const DEFAULT_STATS: CharacterStats = {
  health: 125,
  attackDamage: 50,
  abilityPower: 30,
  armor: 20,
  magicResist: 20,
  
  attackSpeed: 0.7,
  attackRange: 125,
  criticalChance: 0,
  criticalDamage: 0,
  
  abilityHaste: 0,
  
  lifeSteal: 0,
  spellVamp: 0,
  omnivamp: 0,
  
  movementSpeed: 350,
  tenacity: 0,
  
  goldGain: 1,
  xpGain: 1,
  lethality: 0,
  magicPenetration: 0,
};

/**
 * Class-specific stat distribution multipliers
 * These scale the base stats for each class
 */
export const CLASS_STAT_MULTIPLIERS: Record<CharacterClass, Partial<CharacterStats>> = {
  mage: {
    abilityPower: 1.8,
    health: 1.2,
    magicResist: 1.2,
    abilityHaste: 0.2,
  },
  vanguard: {
    health: 1.8,
    armor: 1.8,
    magicResist: 1.5,
    attackDamage: 0.5,
    abilityPower: 0.3,
  },
  warden: {
    health: 1.5,
    armor: 1.5,
    magicResist: 1.3,
    tenacity: 0.2,
  },
  juggernaut: {
    health: 1.3,
    attackDamage: 1.4,
    armor: 1.2,
    lifeSteal: 0.1,
    omnivamp: 0.2,
  },
  skirmisher: {
    attackDamage: 1.3,
    abilityPower: 1.0,
    attackSpeed: 0.1,
    movementSpeed: 1.2,
    health: 1.2,
  },
  assassin: {
    attackDamage: 1.5,
    abilityPower: 1.2,
    lethality: 0.4,
    movementSpeed: 1.2,
    criticalChance: 0.2,
  },
  marksman: {
    attackDamage: 1.7,
    attackSpeed: 0.1,
    criticalChance: 0.35,
    criticalDamage: 2.5,
    attackRange: 1.5,
    lifeSteal: 0.15,
  },
  enchanter: {
    health: 1.2,
    armor: 1.1,
    magicResist: 1.1,
    attackDamage: 0.6,
  },
};

/**
 * Loot type to class alignment
 * Shows which classes benefit most from each loot type
 */
export const LOOT_TYPE_TO_CLASSES: Record<LootType, CharacterClass[]> = {
  attackDamage: ['marksman', 'assassin', 'juggernaut'],
  abilityPower: ['mage', 'enchanter'],
  tankDefense: ['vanguard', 'warden'],
  mobility: ['assassin', 'skirmisher', 'mage'],
  utility: ['enchanter', 'warden'],
  hybrid: ['juggernaut', 'skirmisher', 'marksman'],
  critical: ['marksman', 'assassin', 'skirmisher'],
};

/**
 * Quest path loot type defaults by class
 */
export const CLASS_PREFERRED_LOOT: Record<CharacterClass, LootType> = {
  mage: 'abilityPower',
  vanguard: 'tankDefense',
  warden: 'tankDefense',
  juggernaut: 'hybrid',
  skirmisher: 'hybrid',
  assassin: 'critical',
  marksman: 'attackDamage',
  enchanter: 'utility',
};

/**
 * Get stat bonuses from class multipliers per level
 * Returns the stats added based on class and level
 * Example: Tank at level 10 gets +18 armor (1.8 * 10)
 */
export function getClassStatBonuses(
  characterClass: CharacterClass,
  level: number
): Partial<CharacterStats> {
  const multipliers = CLASS_STAT_MULTIPLIERS[characterClass];
  const bonuses: Partial<CharacterStats> = {};
  
  (Object.keys(multipliers) as Array<keyof CharacterStats>).forEach((stat) => {
    const multiplier = multipliers[stat] || 0;
    bonuses[stat] = Math.round(multiplier * level);
  });
  
  return bonuses;
}

/**
 * Get scaled stats for a character based on level and class
 */
export function getScaledStats(
  baseStats: CharacterStats,
  level: number,
  characterClass: CharacterClass
): CharacterStats {
  const scaledStats: CharacterStats = { ...baseStats };
  const decimalStats = ['attackSpeed', 'lifeSteal', 'spellVamp', 'omnivamp', 'tenacity', 'goldGain', 'xpGain', 'criticalChance', 'criticalDamage', 'abilityHaste'];
  const classBonuses = getClassStatBonuses(characterClass, level);
  
  // Apply level scaling (each level adds ~5% to most stats)
  const levelMultiplier = 1 + (level - 1) * 0.05;
  
  // First apply level scaling to all base stats
  (Object.keys(baseStats) as Array<keyof CharacterStats>).forEach((stat) => {
    const scaledValue = baseStats[stat] * levelMultiplier;
    scaledStats[stat as keyof CharacterStats] = decimalStats.includes(stat) 
      ? parseFloat(scaledValue.toFixed(2)) 
      : Math.round(scaledValue);
  });
  
  // Then add class bonuses on top
  (Object.keys(classBonuses) as Array<keyof CharacterStats>).forEach((stat) => {
    const bonus = classBonuses[stat] || 0;
    const currentValue = scaledStats[stat as keyof CharacterStats] || 0;
    const newValue = currentValue + bonus;
    
    // Keep decimal stats as decimals when adding bonuses
    scaledStats[stat as keyof CharacterStats] = decimalStats.includes(stat)
      ? parseFloat(newValue.toFixed(2))
      : Math.round(newValue);
  });
  
  return scaledStats;
}

/**
 * Calculate damage based on attacker's AD and defender's armor
 * Formula inspired by LoL: damage * (100 / (100 + armor))
 */
export function calculateArmorMitigation(baseDamage: number, armor: number): number {
  return Math.round(baseDamage * (100 / (100 + Math.max(0, armor))));
}

/**
 * Calculate magic damage based on AP and magic resist
 */
export function calculateMagicMitigation(baseDamage: number, magicResist: number): number {
  return Math.round(baseDamage * (100 / (100 + Math.max(0, magicResist))));
}

/**
 * Get a description of character strengths/weaknesses
 */
export function getClassDescription(characterClass: CharacterClass): string {
  const descriptions: Record<CharacterClass, string> = {
    mage: 'Spellcaster focused on Ability Power and sustained damage',
    vanguard: 'Frontline defender with exceptional durability',
    warden: 'Protective champion with crowd control abilities',
    juggernaut: 'Durable warrior balancing damage and survivability',
    skirmisher: 'Mobile fighter excelling at combat flexibility',
    assassin: 'High-burst damage dealer with mobility and crits',
    marksman: 'Ranged carry optimized for critical strikes and attack damage',
    enchanter: 'Utility champion providing buffs and support to allies',
  };
  
  return descriptions[characterClass];
}

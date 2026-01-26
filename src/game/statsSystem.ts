/**
 * LoL-Inspired Stats System
 * This system tracks all character stats similar to League of Legends
 */

import { CharacterClass } from './types';
import { applyPassiveStatModifiers, PassiveId } from './itemPassives';
import { MAX_TENACITY } from './crowdControlSystem';

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
  //Survivability
  health: number,
  health_regen: number,
  armor: number,
  magicResist: number,
  tenacity: number,
  
  //Attack
  attackRange: number,
  attackDamage: number,
  attackSpeed: number,
  criticalChance: number,
  criticalDamage: number,
  lethality: number,
  lifeSteal: number,
  healingOnHit: number,

  //Spell
  abilityPower: number,
  abilityHaste: number,
  magicPenetration: number,
  heal_shield_power: number,
  omnivamp: number,
  
  //Mobility
  movementSpeed: number,
  
  //Misc
  goldGain: number,
  xpGain: number,
  magicFind: number,
  trueDamage: number, // Flat damage that bypasses all resistances (on-hit)
}

/**
 * Default stat values for new characters
 */
export const DEFAULT_STATS: CharacterStats = {
  //Survivability
  health: 125,
  health_regen: 1,
  armor: 20,
  magicResist: 20,
  tenacity: 0,
  
  //Attack
  attackRange: 125,
  attackDamage: 50,
  attackSpeed: 0.7,
  criticalChance: 0,
  criticalDamage: 200,
  lethality: 0,
  lifeSteal: 0,
  healingOnHit: 0,

  //Spell
  abilityPower: 30,
  abilityHaste: 0,
  magicPenetration: 0,
  heal_shield_power: 0,
  omnivamp: 0,
  
  //Mobility
  movementSpeed: 350,
  
  //Misc
  goldGain: 1,
  xpGain: 1,
  magicFind: 0,
  trueDamage: 0,
  
  
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
 * Now includes passive item effects
 * NOTE: Does NOT apply 5% per level multiplier - only class bonuses scale with level
 */
export function getScaledStats(
  baseStats: CharacterStats,
  level: number,
  characterClass: CharacterClass,
  passiveIds: PassiveId[] = []
): CharacterStats {
  const scaledStats: CharacterStats = { ...baseStats };
  const decimalStats = ['attackSpeed', 'lifeSteal', 'spellVamp', 'omnivamp', 'tenacity', 'goldGain', 'xpGain', 'criticalChance', 'criticalDamage', 'abilityHaste', 'health_regen', 'heal_shield_power', 'magicFind'];
  const classBonuses = getClassStatBonuses(characterClass, level);
  
  // NO LONGER APPLY 5% LEVEL MULTIPLIER - This was causing exponential stat growth
  // Stats now scale ONLY through class bonuses (e.g., Marksman gets +1.7 AD per level)
  
  // Add class bonuses directly to base stats
  (Object.keys(classBonuses) as Array<keyof CharacterStats>).forEach((stat) => {
    const bonus = classBonuses[stat] || 0;
    const currentValue = scaledStats[stat as keyof CharacterStats] || 0;
    const newValue = currentValue + bonus;
    
    // Keep decimal stats as decimals when adding bonuses
    scaledStats[stat as keyof CharacterStats] = decimalStats.includes(stat)
      ? parseFloat(newValue.toFixed(2))
      : Math.round(newValue);
  });
  
  // Finally, apply passive item modifiers (e.g., conversions, multipliers)
  const finalStats = applyPassiveStatModifiers(scaledStats, level, passiveIds);
  
  // Round decimal stats properly and apply caps
  (Object.keys(finalStats) as Array<keyof CharacterStats>).forEach((stat) => {
    if (!decimalStats.includes(stat)) {
      finalStats[stat as keyof CharacterStats] = Math.round(finalStats[stat as keyof CharacterStats]);
    }
    
    // Cap tenacity at MAX_TENACITY (100)
    if (stat === 'tenacity') {
      finalStats.tenacity = Math.min(MAX_TENACITY, finalStats.tenacity);
    }
  });
  
  return finalStats;
}

/**
 * Calculate damage reduction percentage based on armor/magic resist
 * Uses diminishing returns formula:
 * - 100 armor/MR = ~9% reduction
 * - 1000 armor/MR = 50% reduction
 * - 5000 armor/MR = ~83% reduction
 * Formula: resistance / (resistance + 1000)
 * Capped at 90% reduction maximum
 */
export function calculateDamageReduction(resistance: number): number {
  const reduction = resistance / (resistance + 1000);
  return Math.min(0.90, Math.max(0, reduction));
}

/**
 * Calculate physical damage after armor mitigation and lethality
 * Lethality reduces enemy armor before damage calculation
 */
export function calculatePhysicalDamage(
  baseDamage: number, 
  enemyArmor: number, 
  attackerLethality: number = 0
): number {
  // Apply lethality (flat armor reduction)
  const effectiveArmor = Math.max(0, enemyArmor - attackerLethality);
  
  // Calculate damage reduction
  const damageReduction = calculateDamageReduction(effectiveArmor);
  
  // Apply reduction to damage
  const finalDamage = baseDamage * (1 - damageReduction);
  
  return Math.max(1, Math.floor(finalDamage));
}

/**
 * Calculate magic damage after magic resist mitigation and magic penetration
 * Magic penetration reduces enemy magic resist before damage calculation
 */
export function calculateMagicDamage(
  baseDamage: number, 
  enemyMagicResist: number, 
  attackerMagicPenetration: number = 0
): number {
  // Apply magic penetration (flat magic resist reduction)
  const effectiveMagicResist = Math.max(0, enemyMagicResist - attackerMagicPenetration);
  
  // Calculate damage reduction
  const damageReduction = calculateDamageReduction(effectiveMagicResist);
  
  // Apply reduction to damage
  const finalDamage = baseDamage * (1 - damageReduction);
  
  return Math.max(1, Math.floor(finalDamage));
}

/**
 * Check if an attack critically strikes
 * Critical chance is stored as a decimal (25% = 0.25)
 * Returns true if the attack crits
 */
export function rollCriticalStrike(criticalChance: number): boolean {
  if (criticalChance <= 0) return false;
  const cappedChance = Math.min(1.0, Math.max(0, criticalChance));
  return Math.random() < cappedChance;
}

/**
 * Calculate total damage including physical/magic damage with resistances + true damage
 * True damage bypasses all armor and magic resist
 * 
 * @param physicalDamage - Base physical damage (before mitigation)
 * @param magicDamage - Base magic damage (before mitigation)
 * @param trueDamage - True damage (bypasses resistances)
 * @param enemyArmor - Enemy's armor stat
 * @param enemyMagicResist - Enemy's magic resist stat
 * @param attackerLethality - Attacker's lethality (reduces enemy armor)
 * @param attackerMagicPen - Attacker's magic penetration (reduces enemy MR)
 * @returns Total damage dealt
 */
export function calculateTotalDamage(
  physicalDamage: number,
  magicDamage: number,
  trueDamage: number,
  enemyArmor: number,
  enemyMagicResist: number,
  attackerLethality: number = 0,
  attackerMagicPen: number = 0
): number {
  let totalDamage = 0;

  // Apply physical damage with armor mitigation
  if (physicalDamage > 0) {
    totalDamage += calculatePhysicalDamage(physicalDamage, enemyArmor, attackerLethality);
  }

  // Apply magic damage with MR mitigation
  if (magicDamage > 0) {
    totalDamage += calculateMagicDamage(magicDamage, enemyMagicResist, attackerMagicPen);
  }

  // Add true damage (no mitigation)
  totalDamage += trueDamage;

  return Math.max(1, Math.floor(totalDamage));
}

/**
 * Calculate critical strike damage multiplier
 * Base crit damage is 200% (2.0x)
 * criticalDamage stat (stored as percentage) adds to the base
 * Example: criticalDamage = 200 means 200% total = 2.0x multiplier
 *          criticalDamage = 250 means 250% total = 2.5x multiplier
 */
export function calculateCriticalDamage(
  baseDamage: number,
  criticalDamage: number
): number {
  // criticalDamage stat is stored as a percentage (200 = 200% = 2.0x)
  const multiplier = criticalDamage / 100;
  return baseDamage * multiplier;
}

/**
 * Calculate lifesteal healing based on damage dealt
 * Lifesteal is stored as a percentage (5 = 5%, 10 = 10%)
 * Returns the amount of HP to heal
 */
export function calculateLifestealHealing(
  damageDealt: number,
  lifeStealPercent: number
): number {
  // Convert percentage to decimal (5 -> 0.05)
  const healing = damageDealt * (lifeStealPercent / 100);
  return Math.floor(healing);
}

/**
 * DEPRECATED: Old armor mitigation formula (kept for backwards compatibility)
 * Use calculatePhysicalDamage instead
 */
export function calculateArmorMitigation(baseDamage: number, armor: number): number {
  return calculatePhysicalDamage(baseDamage, armor, 0);
}

/**
 * DEPRECATED: Old magic mitigation formula (kept for backwards compatibility)
 * Use calculateMagicDamage instead
 */
export function calculateMagicMitigation(baseDamage: number, magicResist: number): number {
  return calculateMagicDamage(baseDamage, magicResist, 0);
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

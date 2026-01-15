import { Character, EnemyTier } from './types';

/**
 * Level 1->2 requires 10 EXP
 * Level 2->3 requires 15 EXP
 * Level 3->4 requires 22 EXP
 * etc. (roughly 1.5x scaling per level)
 */

/**
 * Calculate total EXP required to reach a specific level
 * Uses a polynomial curve
 */
export function getExpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  
  // Formula: EXP = level^3
  // This gives a smooth exponential curve with slower leveling
  return Math.floor(Math.pow(level, 3));
}

/**
 * Calculate EXP needed to go from current level to next level
 */
export function getExpForNextLevel(currentLevel: number): number {
  return getExpRequiredForLevel(currentLevel + 1) - getExpRequiredForLevel(currentLevel);
}

/**
 * Calculate EXP reward from defeating an enemy
 * Based on enemy tier and level
 */
export function calculateExpReward(enemy: Character, playerLevel: number): number {
  const baseTierExp: Record<EnemyTier, number> = {
    minion: 5,
    elite: 12,
    boss: 25,
    champion: 35,
    legend: 80,
  };
  
  const tierExp = baseTierExp[enemy.tier || 'minion'];
  const enemyLevel = enemy.level || 1;
  
  // Level difference multiplier (more EXP for higher level enemies)
  const levelDiff = enemyLevel - playerLevel;
  const levelMultiplier = 1 + (levelDiff * 0.05); // 5% more per level difference
  
  // Minimum 50% EXP if enemy is lower level
  const finalMultiplier = Math.max(0.5, levelMultiplier);
  
  return Math.floor(tierExp * enemyLevel * finalMultiplier);
}

/**
 * Check if player should level up and return new level
 * Returns null if no level up, otherwise returns new stats after level up
 */
export function checkLevelUp(
  currentExp: number,
  currentLevel: number
): { newLevel: number; remainingExp: number } | null {
  const expForNextLevel = getExpRequiredForLevel(currentLevel + 1);
  
  if (currentExp >= expForNextLevel) {
    // Level up! Check for multiple level ups
    let newLevel = currentLevel + 1;
    let remainingExp = currentExp;
    
    // Keep leveling up if we have enough EXP
    while (remainingExp >= getExpRequiredForLevel(newLevel + 1)) {
      newLevel++;
    }
    
    return { newLevel, remainingExp };
  }
  
  return null;
}

/**
 * Calculate enemy level based on floor/encounter number
 * Enemies gradually increase in level as player progresses
 */
export function calculateEnemyLevel(floor: number, baseTier: EnemyTier): number {
  // Base level by tier
  const baseLevelByTier: Record<EnemyTier, number> = {
    minion: 1,
    elite: 2,
    boss: 3,
    champion: 4,
    legend: 8,
  };
  
  const baseLevel = baseLevelByTier[baseTier];
  
  // Add levels based on floor progression
  // Gradual scaling: +1 level every 2 floors
  const floorBonus = Math.floor(floor / 2);
  
  return baseLevel + floorBonus;
}

/**
 * Get level up rewards (stat increases)
 */
export function getLevelUpStatBoosts(): {
  health: number;
  attackDamage: number;
  abilityPower: number;
  armor: number;
  magicResist: number;
} {
  // These are BASE stat increases per level
  // Small increases - loot should be primary source of power
  return {
    health: 5,
    attackDamage: 2,
    abilityPower: 2,
    armor: 1,
    magicResist: 1,
  };
}

/**
 * Format EXP display for UI
 */
export function formatExpDisplay(currentExp: number, currentLevel: number): {
  currentLevelExp: number;
  expForNextLevel: number;
  percentage: number;
} {
  const expForCurrentLevel = getExpRequiredForLevel(currentLevel);
  const expForNextLevel = getExpRequiredForLevel(currentLevel + 1);
  
  const currentLevelExp = currentExp - expForCurrentLevel;
  const expNeeded = expForNextLevel - expForCurrentLevel;
  const percentage = (currentLevelExp / expNeeded) * 100;
  
  return {
    currentLevelExp,
    expForNextLevel: expNeeded,
    percentage: Math.min(100, Math.max(0, percentage)),
  };
}

import { Character } from '../types';
import { CharacterStats, getClassStatBonuses } from '../statsSystem';
import { ITEM_DATABASE } from '../items';

/**
 * Calculate player's current maximum HP with all bonuses
 * Does NOT apply 5% per level multiplier - only class bonuses
 */
export function calculatePlayerMaxHp(player: Character): number {
  const classBonuses = getClassStatBonuses(player.class, player.level);
  const healthBonus = classBonuses.health || 0;
  return player.stats.health + healthBonus;
}

/**
 * Get player's combat stats with all bonuses applied
 * Does NOT apply 5% per level multiplier - only class bonuses
 */
export function getPlayerCombatStats(player: Character): CharacterStats {
  const baseStats = { ...player.stats };
  const classBonuses = getClassStatBonuses(player.class, player.level);

  const finalStats: CharacterStats = { ...baseStats };

  // Apply class bonuses (no level multiplier)
  Object.entries(classBonuses).forEach(([stat, bonus]) => {
    if (bonus) {
      (finalStats as any)[stat] = ((finalStats as any)[stat] || 0) + bonus;
    }
  });

  return finalStats;
}

/**
 * Apply item stats to player character
 * Returns updated character with new stats
 */
export function applyItemToPlayer(
  player: Character,
  itemId: string
): Character {
  const item = ITEM_DATABASE[itemId];
  if (!item) {
    console.error('Item not found:', itemId);
    return player;
  }

  const updatedStats = { ...player.stats };

  // Apply all item stats dynamically
  Object.entries(item.stats).forEach(([stat, value]) => {
    if (value && typeof value === 'number') {
      (updatedStats as any)[stat] = ((updatedStats as any)[stat] || 0) + value;
    }
  });

  return {
    ...player,
    stats: updatedStats,
    // Preserve current HP (don't reset to max)
    hp: player.hp,
  };
}

/**
 * Remove item stats from player character
 * Returns updated character with stats reduced
 */
export function removeItemFromPlayer(
  player: Character,
  itemId: string
): Character {
  const item = ITEM_DATABASE[itemId];
  if (!item) {
    console.error('Item not found:', itemId);
    return player;
  }

  const updatedStats = { ...player.stats };

  // Remove all item stats
  Object.entries(item.stats).forEach(([stat, value]) => {
    if (value && typeof value === 'number') {
      (updatedStats as any)[stat] = Math.max(
        0,
        ((updatedStats as any)[stat] || 0) - value
      );
    }
  });

  return {
    ...player,
    stats: updatedStats,
    // Preserve current HP
    hp: player.hp,
  };
}

/**
 * Apply level up stat boosts to player
 * Returns updated character with increased stats and HP
 */
export function applyLevelUp(
  player: Character,
  newLevel: number,
  statBoosts: Partial<CharacterStats>
): Character {
  const levelsGained = newLevel - player.level;

  // Calculate new stats
  const newStats: CharacterStats = { ...player.stats };
  Object.entries(statBoosts).forEach(([stat, boost]) => {
    if (boost && typeof boost === 'number') {
      (newStats as any)[stat] = ((newStats as any)[stat] || 0) + boost * levelsGained;
    }
  });

  // Calculate HP increase (only class bonuses, no level multiplier)
  const oldClassBonus = getClassStatBonuses(player.class, player.level).health || 0;
  const newClassBonus = getClassStatBonuses(player.class, newLevel).health || 0;
  const oldMaxHp = player.stats.health + oldClassBonus;
  const newMaxHp = newStats.health + newClassBonus;
  const hpIncrease = newMaxHp - oldMaxHp;

  // Heal player by the HP increase amount
  const newHp = Math.min(player.hp + hpIncrease, newMaxHp);

  return {
    ...player,
    level: newLevel,
    stats: newStats,
    hp: newHp,
  };
}

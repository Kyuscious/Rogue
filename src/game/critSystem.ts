/**
 * Crit system utilities.
 * Supports crit chance provided either as a decimal (0.25 = 25%)
 * or as a percentage value (25 = 25%).
 */

export type RandomGenerator = () => number;

/**
 * Normalize crit chance into a 0..1 probability range.
 */
export function normalizeCriticalChance(criticalChance: number): number {
  if (!Number.isFinite(criticalChance) || criticalChance <= 0) {
    return 0;
  }

  // Backward-compatible handling:
  // - 0..1 => already decimal probability
  // - >1   => treat as percentage points (e.g. 15 => 15%)
  const asProbability = criticalChance <= 1 ? criticalChance : criticalChance / 100;
  return Math.min(1, Math.max(0, asProbability));
}

/**
 * Roll RNG to determine whether the attack crits.
 */
export function rollCriticalStrikeRng(
  criticalChance: number,
  rng: RandomGenerator = Math.random
): boolean {
  const chance = normalizeCriticalChance(criticalChance);
  if (chance <= 0) {
    return false;
  }

  const roll = Math.min(1, Math.max(0, rng()));
  return roll < chance;
}

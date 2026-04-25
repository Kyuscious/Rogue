/**
 * AoE Utilities
 * Reusable functions for calculating Area of Effect positioning and direction
 */

export interface AoECalculation {
  sourcePosition: number;
  targetPosition: number;
  size: number;
  isInRange: boolean;
  direction: 'positive' | 'negative'; // Positive = towards higher numbers, Negative = towards lower numbers
}

/**
 * Calculate AoE direction and range check
 * @param sourcePosition - The position of the caster (e.g., player position)
 * @param targetPosition - The position of the target (e.g., enemy position)
 * @param abilityRange - The maximum range of the ability
 * @param aoeSize - The size of the AoE effect
 * @returns AoE calculation with direction and range validation
 */
export function calculateAoEDirection(
  sourcePosition: number,
  targetPosition: number,
  abilityRange: number,
  aoeSize: number
): AoECalculation {
  const distance = Math.abs(targetPosition - sourcePosition);
  const isInRange = distance <= abilityRange;
  const direction = targetPosition > sourcePosition ? 'positive' : 'negative';

  return {
    sourcePosition,
    targetPosition,
    size: aoeSize,
    isInRange,
    direction,
  };
}

/**
 * Check if target is within ability range
 * @param sourcePosition - The position of the caster
 * @param targetPosition - The position of the target
 * @param range - The maximum range of the ability
 * @returns True if target is in range
 */
export function isTargetInRange(
  sourcePosition: number,
  targetPosition: number,
  range: number
): boolean {
  return Math.abs(targetPosition - sourcePosition) <= range;
}

/**
 * Get direction from source to target
 * @param sourcePosition - The position of the caster
 * @param targetPosition - The position of the target
 * @returns Direction as 'positive' or 'negative'
 */
export function getDirection(
  sourcePosition: number,
  targetPosition: number
): 'positive' | 'negative' {
  return targetPosition > sourcePosition ? 'positive' : 'negative';
}

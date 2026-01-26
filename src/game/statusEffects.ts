/**
 * Status Effects System
 * Handles buffs, debuffs, and crowd control effects
 * 
 * Status Effect Types:
 * - stun: Completely disables the target, delaying all their actions
 * - slow: Reduces movement speed by a percentage
 * - root: Prevents movement and displacement but allows other actions
 * - silence: Prevents casting spells (not yet implemented)
 * - buff: Positive effects that enhance stats
 * - debuff: Negative effects that reduce stats
 */

export interface StatusEffect {
  id: string;
  type: 'stun' | 'slow' | 'root' | 'silence' | 'buff' | 'debuff';
  duration: number; // Duration in turns
  value?: number; // Optional value (e.g., slow percentage)
  appliedAt: number; // Timeline time when applied
  castTime?: number; // Optional cast time before effect applies
  source: 'player' | 'enemy';
  targetId: string; // Who the effect is applied to
}

export interface StunEffect extends StatusEffect {
  type: 'stun';
  delayAmount: number; // How many turns to delay actions
}

/**
 * Apply a stun effect by delaying all future actions of the target
 * Stun completely disables the target, preventing all actions
 * @param targetId The entity to stun ('player' or 'enemy')
 * @param stunDuration Duration in turns to delay actions
 * @param currentTime Current timeline time
 * @returns StunEffect object
 */
export function createStunEffect(
  targetId: string,
  stunDuration: number,
  currentTime: number,
  source: 'player' | 'enemy',
  castTime: number = 0
): StunEffect {
  return {
    id: `stun_${targetId}_${Date.now()}`,
    type: 'stun',
    duration: stunDuration,
    delayAmount: stunDuration,
    appliedAt: currentTime,
    castTime,
    source,
    targetId,
  };
}

/**
 * Check if an entity is stunned at a given time
 */
export function isStunned(
  effects: StatusEffect[],
  entityId: string,
  currentTime: number
): boolean {
  return effects.some(
    (effect) =>
      effect.type === 'stun' &&
      effect.targetId === entityId &&
      currentTime >= effect.appliedAt + (effect.castTime || 0) &&
      currentTime < effect.appliedAt + (effect.castTime || 0) + effect.duration
  );
}

/**
 * Get the total stun delay that should be applied to future actions
 */
export function getStunDelay(
  effects: StatusEffect[],
  entityId: string,
  actionTime: number
): number {
  return effects
    .filter((effect) => effect.type === 'stun' && effect.targetId === entityId)
    .reduce((totalDelay, effect) => {
      const stunEffect = effect as StunEffect;
      
      // Only apply delay if the action would occur during or after the stun
      if (actionTime >= effect.appliedAt) {
        return totalDelay + stunEffect.delayAmount;
      }
      
      return totalDelay;
    }, 0);
}

/**
 * Create a slow effect that reduces movement speed
 * Slow reduces movement speed by a percentage, making it harder to close distance or kite
 * @param targetId The entity to slow ('player' or 'enemy')
 * @param duration Duration in turns
 * @param slowPercent Percentage to reduce movement speed (e.g., 10 = 10% slow)
 * @param currentTime Current timeline time
 * @param source Who applied the slow
 * @returns StatusEffect object
 */
export function createSlowEffect(
  targetId: string,
  duration: number,
  slowPercent: number,
  currentTime: number,
  source: 'player' | 'enemy'
): StatusEffect {
  return {
    id: `slow_${targetId}_${Date.now()}`,
    type: 'slow',
    duration,
    value: slowPercent,
    appliedAt: currentTime,
    source,
    targetId,
  };
}

/**
 * Get the movement speed modifier from active slow effects
 * @param effects All active status effects
 * @param entityId The entity to check
 * @param currentTime Current timeline time
 * @returns Multiplier to apply to movement speed (e.g., 0.9 = 10% slow)
 */
export function getSlowModifier(
  effects: StatusEffect[],
  entityId: string,
  currentTime: number
): number {
  const activeSlows = effects.filter(
    (effect) =>
      effect.type === 'slow' &&
      effect.targetId === entityId &&
      currentTime >= effect.appliedAt &&
      currentTime < effect.appliedAt + effect.duration
  );

  if (activeSlows.length === 0) return 1.0;

  // Stack slows multiplicatively (e.g., two 10% slows = 0.9 * 0.9 = 0.81 = 19% total)
  return activeSlows.reduce((modifier, effect) => {
    const slowPercent = effect.value || 0;
    return modifier * (1 - slowPercent / 100);
  }, 1.0);
}

/**
 * Create a root effect that prevents movement
 * Root prevents the target from moving or being displaced, but they can still attack and cast spells
 * @param targetId The entity to root ('player' or 'enemy')
 * @param duration Duration in turns
 * @param currentTime Current timeline time
 * @param source Who applied the root
 * @returns StatusEffect object
 */
export function createRootEffect(
  targetId: string,
  duration: number,
  currentTime: number,
  source: 'player' | 'enemy'
): StatusEffect {
  return {
    id: `root_${targetId}_${Date.now()}`,
    type: 'root',
    duration,
    appliedAt: currentTime,
    source,
    targetId,
  };
}

/**
 * Check if an entity is rooted at a given time
 * Rooted entities cannot move or be displaced
 */
export function isRooted(
  effects: StatusEffect[],
  entityId: string,
  currentTime: number
): boolean {
  return effects.some(
    (effect) =>
      effect.type === 'root' &&
      effect.targetId === entityId &&
      currentTime >= effect.appliedAt &&
      currentTime < effect.appliedAt + effect.duration
  );
}


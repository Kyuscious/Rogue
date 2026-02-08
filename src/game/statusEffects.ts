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
  type: 'stun' | 'slow' | 'root' | 'silence' | 'buff' | 'debuff' | 'burn';
  duration: number; // Duration in turns
  value?: number; // Optional value (e.g., slow percentage, burn stacks, etc.)
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

/**
 * Burn Effect System - Bami's Cinder Immolate Passive
 * 
 * Mechanics:
 * - Every physical attack or when attacked, apply burn stacks to target
 * - Each burn stack deals 15 damage per turn
 * - Burn lasts 2 turns with the current stacks
 * - When new stacks are added, duration refreshes to 2 turns
 * - Multiple Bami's Cinder items stack additively (2 items = 2 stacks per hit)
 * 
 * Example:
 * Turn 1: Player attacks with 1 Bami's Cinder → Applies 1 burn stack (2 turn duration)
 * Turn 2: Burn deals 1 * 15 = 15 damage. Player attacks again → 2 burn stacks (duration refreshes to 2 turns)
 * Turn 3: Burn deals 2 * 15 = 30 damage. Enemy doesn't attack → 2 turns pass
 * Turn 4: Burn has 1 turn left
 * Turn 5: Burn expires (0 turns left)
 */

/**
 * Create or update a burn effect on a target
 * Burn stacks additively and refreshes duration when new stacks are added
 * @param effects Current status effects
 * @param targetId The entity to apply burn to
 * @param stacksToAdd Number of burn stacks to add (based on item count)
 * @param currentTime Current timeline time
 * @param source Who applied the burn
 * @returns Updated effects array with new/updated burn
 */
export function applyBurn(
  effects: StatusEffect[],
  targetId: string,
  stacksToAdd: number,
  currentTime: number,
  source: 'player' | 'enemy'
): StatusEffect[] {
  const burnDuration = 2; // 2 turns
  const existingBurn = effects.find(
    (effect) =>
      effect.type === 'burn' &&
      effect.targetId === targetId &&
      currentTime < effect.appliedAt + effect.duration
  );

  if (existingBurn) {
    // Update existing burn: add stacks and refresh duration
    return effects.map((effect) =>
      effect.id === existingBurn.id
        ? {
            ...effect,
            value: (effect.value || 0) + stacksToAdd,
            duration: burnDuration, // Reset duration to 2 turns
            appliedAt: currentTime, // Update apply time so duration resets
          }
        : effect
    );
  }

  // Create new burn effect
  return [
    ...effects,
    {
      id: `burn_${targetId}_${Date.now()}`,
      type: 'burn',
      duration: burnDuration,
      value: stacksToAdd,
      appliedAt: currentTime,
      source,
      targetId,
    },
  ];
}

/**
 * Get total burn damage to apply at turn start
 * Each burn stack deals 15 damage per turn
 * @param effects Current status effects
 * @param entityId The entity to check
 * @param currentTime Current timeline time
 * @returns Total burn damage (stackCount * 15)
 */
export function getBurnDamage(
  effects: StatusEffect[],
  entityId: string,
  currentTime: number
): number {
  const activeBurn = effects.find(
    (effect) =>
      effect.type === 'burn' &&
      effect.targetId === entityId &&
      currentTime >= effect.appliedAt &&
      currentTime < effect.appliedAt + effect.duration
  );

  if (!activeBurn) return 0;

  const stackCount = activeBurn.value || 1;
  return stackCount * 15; // 15 damage per stack
}

/**
 * Get the number of active burn stacks on an entity
 * @param effects Current status effects
 * @param entityId The entity to check
 * @param currentTime Current timeline time
 * @returns Number of active burn stacks
 */
export function getBurnStacks(
  effects: StatusEffect[],
  entityId: string,
  currentTime: number
): number {
  const activeBurn = effects.find(
    (effect) =>
      effect.type === 'burn' &&
      effect.targetId === entityId &&
      currentTime >= effect.appliedAt &&
      currentTime < effect.appliedAt + effect.duration
  );

  return activeBurn ? activeBurn.value || 1 : 0;
}

/**
 * Get remaining turns on burn effect
 * @param effects Current status effects
 * @param entityId The entity to check
 * @param currentTime Current timeline time
 * @returns Remaining turns (or 0 if no active burn)
 */
export function getBurnDuration(
  effects: StatusEffect[],
  entityId: string,
  currentTime: number
): number {
  const activeBurn = effects.find(
    (effect) =>
      effect.type === 'burn' &&
      effect.targetId === entityId &&
      currentTime >= effect.appliedAt &&
      currentTime < effect.appliedAt + effect.duration
  );

  if (!activeBurn) return 0;

  return activeBurn.duration - (currentTime - activeBurn.appliedAt);
}

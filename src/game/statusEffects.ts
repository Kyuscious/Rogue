/**
 * Status Effects System
 * Handles buffs, debuffs, and crowd control effects like stuns
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

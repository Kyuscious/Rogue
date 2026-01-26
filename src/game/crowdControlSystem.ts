/**
 * Crowd Control System
 * 
 * This system handles all crowd control effects and their interactions with tenacity.
 * Tenacity reduces the duration of crowd control effects (capped at 100).
 */

export type CrowdControlType = 
  | 'stun'        // Cannot move, attack, or cast spells
  | 'root'        // Cannot move but can still attack and cast spells
  | 'blind'       // Attacks miss (0% hit chance)
  | 'silence'     // Cannot cast spells but can still move and attack
  | 'taunt'       // Forced to attack the taunter
  | 'fear'        // Forced to move away from source
  | 'charm'       // Forced to walk towards source
  | 'slow'        // Reduced movement speed
  | 'snare'       // Cannot dash or blink
  | 'disarm'      // Cannot auto-attack
  | 'ground'      // Cannot dash or use movement abilities
  | 'polymorph'   // Cannot move, attack, or cast (same as stun but with different visual)
  | 'suppression' // Cannot move, attack, or cast (ignores cleanse effects)
  | 'knockup'     // Cannot move, attack, or cast (airborne, ignores tenacity)
  | 'sleep';      // Cannot move, attack, or cast (breaks on damage)

/**
 * Crowd Control Effect Interface
 */
export interface CrowdControlEffect {
  type: CrowdControlType;
  duration: number; // Base duration in turns (e.g., 1.0 = 1 turn)
  source: string; // Source of the CC (character ID or ability name)
  reducedByTenacity: boolean; // Whether this CC is affected by tenacity
  breaksOnDamage: boolean; // Whether taking damage breaks this CC
  stackable: boolean; // Whether multiple instances can stack
}

/**
 * Crowd Control Categories
 * Groups CC types by their severity and interaction with tenacity
 */
export const CC_CATEGORIES = {
  // Hard CC - Complete loss of control
  hardCC: ['stun', 'polymorph', 'suppression', 'knockup', 'sleep', 'fear', 'charm', 'taunt'] as CrowdControlType[],
  
  // Soft CC - Partial loss of control
  softCC: ['root', 'slow', 'snare', 'ground'] as CrowdControlType[],
  
  // Action Denial - Specific action restrictions
  actionDenial: ['blind', 'silence', 'disarm'] as CrowdControlType[],
  
  // Tenacity Immune - CC that ignores tenacity
  tenacityImmune: ['knockup', 'suppression'] as CrowdControlType[],
  
  // Damage Breakable - CC that breaks when damaged
  damageBreakable: ['sleep'] as CrowdControlType[],
};

/**
 * Maximum tenacity value (100 = 100% = immune to CC)
 */
export const MAX_TENACITY = 100;

/**
 * Calculate the effective duration of a crowd control effect after tenacity reduction
 * 
 * @param baseDuration - Base CC duration in turns
 * @param tenacity - Character's tenacity stat (0-100)
 * @param ccType - Type of crowd control
 * @returns Effective CC duration after tenacity reduction
 * 
 * @example
 * // 1 turn stun with 0 tenacity
 * calculateCCDuration(1.0, 0, 'stun') // Returns 1.0
 * 
 * // 1 turn stun with 50 tenacity
 * calculateCCDuration(1.0, 50, 'stun') // Returns 0.5
 * 
 * // 1 turn stun with 100 tenacity
 * calculateCCDuration(1.0, 100, 'stun') // Returns 0
 * 
 * // 2 turn knockup with 100 tenacity (ignores tenacity)
 * calculateCCDuration(2.0, 100, 'knockup') // Returns 2.0
 */
export function calculateCCDuration(
  baseDuration: number,
  tenacity: number,
  ccType: CrowdControlType
): number {
  // Knockups and suppressions ignore tenacity
  if (CC_CATEGORIES.tenacityImmune.includes(ccType)) {
    return baseDuration;
  }
  
  // Cap tenacity between 0 and MAX_TENACITY
  const effectiveTenacity = Math.max(0, Math.min(MAX_TENACITY, tenacity));
  
  // Calculate reduction: 100 tenacity = 100% reduction = immune
  const reductionMultiplier = 1 - (effectiveTenacity / 100);
  
  // Calculate final duration
  const finalDuration = baseDuration * reductionMultiplier;
  
  // Round to 2 decimal places
  return Math.max(0, parseFloat(finalDuration.toFixed(2)));
}

/**
 * Check if a character is immune to crowd control
 * Returns true if tenacity is 100 or higher (for non-knockup/suppression CC)
 */
export function isImmuneToCC(tenacity: number, ccType: CrowdControlType): boolean {
  // Knockups and suppressions cannot be fully negated
  if (CC_CATEGORIES.tenacityImmune.includes(ccType)) {
    return false;
  }
  
  return tenacity >= MAX_TENACITY;
}

/**
 * Create a crowd control effect with proper defaults
 */
export function createCCEffect(
  type: CrowdControlType,
  duration: number,
  source: string,
  options?: {
    reducedByTenacity?: boolean;
    breaksOnDamage?: boolean;
    stackable?: boolean;
  }
): CrowdControlEffect {
  return {
    type,
    duration,
    source,
    reducedByTenacity: options?.reducedByTenacity ?? !CC_CATEGORIES.tenacityImmune.includes(type),
    breaksOnDamage: options?.breaksOnDamage ?? CC_CATEGORIES.damageBreakable.includes(type),
    stackable: options?.stackable ?? false,
  };
}

/**
 * Apply CC effect to a character considering their tenacity
 * Returns the effective CC effect with adjusted duration
 */
export function applyCCEffect(
  effect: CrowdControlEffect,
  targetTenacity: number
): CrowdControlEffect {
  const effectiveDuration = effect.reducedByTenacity
    ? calculateCCDuration(effect.duration, targetTenacity, effect.type)
    : effect.duration;
  
  return {
    ...effect,
    duration: effectiveDuration,
  };
}

/**
 * Get a human-readable description of a CC type
 */
export function getCCDescription(ccType: CrowdControlType): string {
  const descriptions: Record<CrowdControlType, string> = {
    stun: 'Cannot move, attack, or cast spells',
    root: 'Cannot move but can attack and cast spells',
    blind: 'Attacks miss',
    silence: 'Cannot cast spells',
    taunt: 'Forced to attack the taunter',
    fear: 'Forced to flee',
    charm: 'Forced to walk towards source',
    slow: 'Reduced movement speed',
    snare: 'Cannot dash or blink',
    disarm: 'Cannot auto-attack',
    ground: 'Cannot use movement abilities',
    polymorph: 'Transformed - Cannot act',
    suppression: 'Cannot act (ignores cleanse)',
    knockup: 'Airborne - Cannot act (ignores tenacity)',
    sleep: 'Cannot act (breaks on damage)',
  };
  
  return descriptions[ccType];
}

/**
 * Get display name for CC type
 */
export function getCCDisplayName(ccType: CrowdControlType): string {
  const displayNames: Record<CrowdControlType, string> = {
    stun: 'Stunned',
    root: 'Rooted',
    blind: 'Blinded',
    silence: 'Silenced',
    taunt: 'Taunted',
    fear: 'Feared',
    charm: 'Charmed',
    slow: 'Slowed',
    snare: 'Snared',
    disarm: 'Disarmed',
    ground: 'Grounded',
    polymorph: 'Polymorphed',
    suppression: 'Suppressed',
    knockup: 'Knocked Up',
    sleep: 'Asleep',
  };
  
  return displayNames[ccType];
}

/**
 * Check if a CC type prevents actions (hard CC)
 */
export function preventsActions(ccType: CrowdControlType): boolean {
  return CC_CATEGORIES.hardCC.includes(ccType);
}

/**
 * Check if a CC type prevents movement
 */
export function preventsMovement(ccType: CrowdControlType): boolean {
  return [...CC_CATEGORIES.hardCC, 'root', 'snare'].includes(ccType);
}

/**
 * Check if a CC type prevents attacks
 */
export function preventsAttacks(ccType: CrowdControlType): boolean {
  return [...CC_CATEGORIES.hardCC, 'disarm', 'blind'].includes(ccType);
}

/**
 * Check if a CC type prevents spells
 */
export function preventsSpells(ccType: CrowdControlType): boolean {
  return [...CC_CATEGORIES.hardCC, 'silence'].includes(ccType);
}

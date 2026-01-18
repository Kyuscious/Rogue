/**
 * On-Hit Effects System
 * 
 * This module handles all on-hit effects that trigger when an attack successfully lands.
 * On-hit effects are only applied when damage > 0 (when the attack hits).
 * 
 * Examples: healing on hit, bonus damage on hit, apply debuffs on hit, etc.
 */

import { Character } from './types';
import { CharacterStats } from './statsSystem';

export interface OnHitResult {
  bonusDamage: number;
  healing: number;
  effects: OnHitEffectDescription[];
}

export interface OnHitEffectDescription {
  name: string;
  value: number;
  type: 'damage' | 'healing' | 'debuff' | 'buff';
}

/**
 * Calculate all on-hit effects from character stats
 * This is called after an attack successfully hits (damage > 0)
 */
export function calculateOnHitEffects(
  _attacker: Character,
  _target: Character,
  baseDamage: number,
  attackerStats: CharacterStats
): OnHitResult {
  const result: OnHitResult = {
    bonusDamage: 0,
    healing: 0,
    effects: [],
  };

  // Healing on Hit - Direct healing when attack lands
  if (attackerStats.healingOnHit && attackerStats.healingOnHit > 0) {
    result.healing += attackerStats.healingOnHit;
    result.effects.push({
      name: 'Healing on Hit',
      value: attackerStats.healingOnHit,
      type: 'healing',
    });
  }

  // Life Steal - Percentage healing based on damage dealt (attacks only)
  if (attackerStats.lifeSteal && attackerStats.lifeSteal > 0) {
    const lifeStealHealing = Math.max(1, Math.round(baseDamage * (attackerStats.lifeSteal / 100)));
    result.healing += lifeStealHealing;
    result.effects.push({
      name: 'Life Steal',
      value: lifeStealHealing,
      type: 'healing',
    });
  }

  // Omnivamp - Percentage healing based on ALL damage dealt (stacks with lifesteal on attacks)
  if (attackerStats.omnivamp && attackerStats.omnivamp > 0) {
    const omnivampHealing = Math.max(1, Math.round(baseDamage * (attackerStats.omnivamp / 100)));
    result.healing += omnivampHealing;
    result.effects.push({
      name: 'Omnivamp',
      value: omnivampHealing,
      type: 'healing',
    });
  }

  // Add more on-hit effects here:
  // - Bonus magic damage on hit
  // - Apply burn/poison debuffs
  // - Slow effects
  // - Chain lightning to nearby enemies
  // - etc.

  return result;
}

/**
 * Apply on-hit effects to the attacker and target
 * Returns the total bonus damage and healing to apply
 */
export function applyOnHitEffects(
  attacker: Character,
  _target: Character,
  onHitResult: OnHitResult
): { totalBonusDamage: number; totalHealing: number } {
  let totalBonusDamage = onHitResult.bonusDamage;
  let totalHealing = onHitResult.healing;

  // Healing is capped at attacker's max HP
  const maxHp = attacker.stats.health || 100;
  const currentHp = attacker.hp;
  totalHealing = Math.min(totalHealing, maxHp - currentHp);

  return { totalBonusDamage, totalHealing };
}

/**
 * Format on-hit effects for display in combat log
 */
export function formatOnHitEffects(effects: OnHitEffectDescription[]): string {
  if (effects.length === 0) return '';

  const messages: string[] = [];
  
  for (const effect of effects) {
    if (effect.type === 'healing') {
      messages.push(`+${Math.round(effect.value)} HP (${effect.name})`);
    } else if (effect.type === 'damage') {
      messages.push(`+${Math.round(effect.value)} damage (${effect.name})`);
    }
  }

  return messages.length > 0 ? ` [${messages.join(', ')}]` : '';
}

/**
 * Shield System
 * Handles shield application, damage absorption, and shield-related buff mechanics
 * 
 * Shields are stored as individual instances in an array, ordered by creation time (FIFO).
 * Damage is applied to shields in order - oldest shields take damage first.
 * Shields expire individually when their duration reaches 0, removing only their remaining amount.
 */

import { Character, StatusEffect } from './types';
import { getScaledStats } from './statsSystem';

/**
 * Get total shield from all shield instances
 * @param character - The character to check
 * @returns Total shield amount across all instances
 */
export function getTotalShield(character: Character): number {
  if (!character.shields || character.shields.length === 0) return 0;
  return character.shields.reduce((sum, shield) => sum + shield.currentAmount, 0);
}

/**
 * Apply damage to a character, affecting shields (FIFO) before HP
 * Damage hits the oldest shield first, overflowing to newer shields and then HP
 * @param character - The character receiving damage
 * @param damage - Amount of damage to apply
 * @returns Object containing damage dealt to shields and HP
 */
export function applyDamageWithShield(character: Character, damage: number): {
  shieldDamage: number;
  hpDamage: number;
  totalRemainingShield: number;
} {
  let remainingDamage = damage;
  let shieldDamage = 0;

  // Apply damage to shields in FIFO order (oldest first)
  if (character.shields && character.shields.length > 0) {
    for (let i = 0; i < character.shields.length && remainingDamage > 0; i++) {
      const shield = character.shields[i];
      const damageToShield = Math.min(remainingDamage, shield.currentAmount);
      
      shield.currentAmount -= damageToShield;
      shieldDamage += damageToShield;
      remainingDamage -= damageToShield;
    }
  }

  // Remaining damage goes to HP
  const hpDamage = remainingDamage;
  character.hp = Math.max(0, character.hp - hpDamage);

  // Calculate total remaining shield for return value
  const totalRemainingShield = getTotalShield(character);

  return {
    shieldDamage,
    hpDamage,
    totalRemainingShield,
  };
}

/**
 * Add a new shield instance to a character
 * @param character - The character receiving the shield
 * @param shieldId - Unique identifier for this shield instance
 * @param amount - Amount of shield to add
 * @param duration - Duration in turns before this shield expires
 */
export function addShield(character: Character, shieldId: string, amount: number, duration: number): void {
  if (!character.shields) {
    character.shields = [];
  }

  character.shields.push({
    id: shieldId,
    currentAmount: amount,
    maxAmount: amount,
    duration: duration,
  });
  
  console.log(`🛡️ SHIELD CREATED: ${shieldId} for ${character.name}`, {
    amount,
    duration,
    totalShields: character.shields.length,
  });
}

/**
 * Apply the For Demacia! buff to a character
 * Grants +5% AD and shield equal to 5% max HP for 2 turns
 * @param character - The character receiving the buff
 * @param uniqueId - Unique identifier for this buff instance
 */
export function applyForDemaciaBuff(character: Character, uniqueId: string): StatusEffect {
  // Calculate shield amount: 5% of max HP
  const maxHp = character.role === 'enemy' 
    ? character.stats.health 
    : getScaledStats(character.stats, character.level, character.class).health;
  const shieldAmount = Math.round(maxHp * 0.05);

  // Add shield as individual instance (will expire in 2 turns)
  const shieldId = `${uniqueId}_shield`;
  addShield(character, shieldId, shieldAmount, 2);

  // Return buff status effect for compatibility, but DON'T add to character.effects
  // The buff is now handled by the CombatBuff stacking system in Battle.tsx
  const buff: StatusEffect = {
    id: uniqueId,
    name: 'For Demacia!',
    type: 'buff',
    duration: 2, // Lasts 2 turns (current + next)
    description: `+5% Attack Damage, Shield: ${shieldAmount}`,
    statModifiers: {
      attackDamage: 5, // +5% AD (5 represents 5% percentage, not 5 AD)
    },
    shieldAmount: shieldAmount,
  };

  // NOTE: No longer adding to character.effects - using CombatBuff system instead
  // This prevents double-display of the buff and ensures proper stacking behavior

  return buff;
}

/**
 * Get the total AD bonus from percentage-based buffs
 * @param character - The character to calculate for
 * @returns Total percentage AD bonus
 */
export function getPercentageADBonus(character: Character): number {
  if (!character.effects) return 0;

  let totalBonus = 0;
  for (const effect of character.effects) {
    if (effect.type === 'buff' && effect.statModifiers?.attackDamage) {
      totalBonus += effect.statModifiers.attackDamage;
    }
  }

  return totalBonus;
}

/**
 * Calculate effective attack damage with percentage bonuses
 * @param baseAD - Base attack damage
 * @param character - The character to calculate for
 * @returns Effective attack damage with bonuses applied
 */
export function calculateEffectiveAD(baseAD: number, character: Character): number {
  const percentBonus = getPercentageADBonus(character);
  return Math.round(baseAD * (1 + percentBonus / 100));
}

/**
 * Decay shield durations at turn boundaries
 * Removes shields that have expired (duration <= 0)
 * @param character - The character whose shields to update
 */
export function decayShieldDurations(character: Character): void {
  if (!character.shields || character.shields.length === 0) return;

  // Decrement all shield durations
  character.shields = character.shields.map(shield => ({
    ...shield,
    duration: shield.duration - 1,
  }));

  // Remove shields with duration <= 0
  character.shields = character.shields.filter(shield => shield.duration > 0);

  // Clean up empty array
  if (character.shields.length === 0) {
    character.shields = undefined;
  }
}

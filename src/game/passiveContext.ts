/**
 * Passive Context System
 * 
 * Provides context and utility functions for passive effect execution
 */

import { Character, StatusEffect } from './types';
import { CharacterStats } from './statsSystem';
import { CombatBuff } from './itemSystem'; // Import from itemSystem for consistency

export type DamageType = 'physical' | 'magic' | 'true';

export type PassiveTrigger = 
  | 'battle_start'
  | 'battle_end'
  | 'turn_start'
  | 'turn_end'
  | 'before_attack'
  | 'on_hit'
  | 'after_damage_dealt'
  | 'after_damage_taken'
  | 'on_kill'
  | 'on_death'
  | 'on_heal'
  | 'on_crit'
  | 'on_spell_cast'
  | 'on_item_use'
  | 'gold_gained'
  | 'exp_gained'
  | 'stat_calculation'; // Special case: runs during stat calculation

/**
 * Context provided to passive effects when they execute
 */
export interface PassiveContext {
  // === Character References ===
  attacker: Character;
  target: Character;
  
  // === Mutable Action Data ===
  // These can be modified by passives
  damage?: number;
  healing?: number;
  goldAmount?: number;
  expAmount?: number;
  
  // === Combat Metadata ===
  isCrit?: boolean;
  damageType?: DamageType;
  isSpell?: boolean;
  isAttack?: boolean;
  weaponId?: string;
  spellId?: string;
  
  // === Passive State ===
  // Track stacks per passive (e.g., Glory stacks, Madness stacks)
  passiveStacks: Record<string, number>;
  
  // === Utility Functions ===
  // These are injected by the PassiveManager
  addBuff?: (targetId: string, buff: CombatBuff) => void;
  addStatusEffect?: (targetId: string, effect: StatusEffect) => void;
  applyDamage?: (targetId: string, amount: number, type: DamageType) => void;
  applyHealing?: (targetId: string, amount: number) => void;
  addLog?: (message: string) => void;
  getStats?: (characterId: string) => CharacterStats;
}

/**
 * Builder class for creating PassiveContext objects
 */
export class PassiveContextBuilder {
  private context: Partial<PassiveContext> = {
    passiveStacks: {},
  };
  
  setAttacker(attacker: Character): this {
    this.context.attacker = attacker;
    return this;
  }
  
  setTarget(target: Character): this {
    this.context.target = target;
    return this;
  }
  
  setDamage(damage: number): this {
    this.context.damage = damage;
    return this;
  }
  
  setHealing(healing: number): this {
    this.context.healing = healing;
    return this;
  }
  
  setGoldAmount(amount: number): this {
    this.context.goldAmount = amount;
    return this;
  }
  
  setExpAmount(amount: number): this {
    this.context.expAmount = amount;
    return this;
  }
  
  setIsCrit(isCrit: boolean): this {
    this.context.isCrit = isCrit;
    return this;
  }
  
  setDamageType(type: DamageType): this {
    this.context.damageType = type;
    return this;
  }
  
  setIsSpell(isSpell: boolean): this {
    this.context.isSpell = isSpell;
    return this;
  }
  
  setIsAttack(isAttack: boolean): this {
    this.context.isAttack = isAttack;
    return this;
  }
  
  setWeaponId(weaponId: string): this {
    this.context.weaponId = weaponId;
    return this;
  }
  
  setSpellId(spellId: string): this {
    this.context.spellId = spellId;
    return this;
  }
  
  setPassiveStacks(stacks: Record<string, number>): this {
    this.context.passiveStacks = stacks;
    return this;
  }
  
  setUtilities(utilities: {
    addBuff?: (targetId: string, buff: CombatBuff) => void;
    addStatusEffect?: (targetId: string, effect: StatusEffect) => void;
    applyDamage?: (targetId: string, amount: number, type: DamageType) => void;
    applyHealing?: (targetId: string, amount: number) => void;
    addLog?: (message: string) => void;
    getStats?: (characterId: string) => CharacterStats;
  }): this {
    Object.assign(this.context, utilities);
    return this;
  }
  
  build(): PassiveContext {
    if (!this.context.attacker || !this.context.target) {
      throw new Error('PassiveContext requires both attacker and target');
    }
    return this.context as PassiveContext;
  }
}

/**
 * Helper function to create a basic context
 */
export function createPassiveContext(
  attacker: Character,
  target: Character
): PassiveContextBuilder {
  return new PassiveContextBuilder()
    .setAttacker(attacker)
    .setTarget(target);
}

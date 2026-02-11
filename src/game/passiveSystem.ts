/**
 * Passive System Core
 * 
 * Centralized system for managing and executing item passive effects
 */

import { InventoryItem } from './types';
import { CharacterStats } from './statsSystem';
import { PassiveTrigger } from './itemPassives';
import { PassiveId, ITEM_PASSIVES, PassiveEffect } from './itemPassives';
import { PassiveContext } from './passiveContext';
import { getItemById } from './items';

/**
 * PassiveManager - Central controller for passive effect system
 */
export class PassiveManager {
  private activePassives: Map<PassiveId, PassiveEffect>;
  private passiveStacks: Partial<Record<PassiveId, number>>;
  private permanentStacks: Partial<Record<PassiveId, number>>; // Persist between battles

  constructor() {
    this.activePassives = new Map();
    this.passiveStacks = {};
    this.permanentStacks = {};
  }

  /**
   * Initialize passive manager with character's inventory
   */
  initialize(inventory: InventoryItem[]): void {
    this.activePassives.clear();
    this.passiveStacks = { ...this.permanentStacks }; // Restore permanent stacks

    // Extract passive IDs from inventory
    const passiveIds = this.getPassiveIdsFromInventory(inventory);

    // Load passive effects
    for (const passiveId of passiveIds) {
      const passive = ITEM_PASSIVES[passiveId];
      if (passive) {
        this.activePassives.set(passiveId, passive);
        
        // Initialize stack count if stackable
        if (passive.stackable && !this.passiveStacks[passiveId]) {
          this.passiveStacks[passiveId] = 0;
        }
      }
    }
  }

  /**
   * Extract passive IDs from inventory items
   */
  private getPassiveIdsFromInventory(inventory: InventoryItem[]): PassiveId[] {
    const passiveIds: PassiveId[] = [];
    
    for (const invItem of inventory) {
      const item = getItemById(invItem.itemId);
      if (item && item.passiveId) {
        // Add passive for each quantity (some passives stack additively)
        for (let i = 0; i < invItem.quantity; i++) {
          passiveIds.push(item.passiveId as PassiveId);
        }
      }
    }
    
    return passiveIds;
  }

  /**
   * Trigger an event and execute all matching passives
   * Returns the modified context
   */
  trigger(event: PassiveTrigger, context: PassiveContext): PassiveContext {
    // Add passive stacks to context
    context.passiveStacks = { ...this.passiveStacks };

    // Get all passives that match this trigger
    const matchingPassives: PassiveEffect[] = [];
    
    for (const passive of this.activePassives.values()) {
      if (passive.triggers.includes(event)) {
        matchingPassives.push(passive);
      }
    }

    // Note: Execute functions have been moved to Battle.tsx
    // This trigger method now mainly serves as a hook point for future expansion
    // Actual passive effects are handled directly in combat logic

    // Update stacks from context (in case consumers modified them)
    this.passiveStacks = { ...context.passiveStacks };

    return context;
  }

  /**
   * Apply stat modifiers from all active passives
   * Called during stat calculation phase
   */
  applyStatModifiers(baseStats: CharacterStats, level: number): CharacterStats {
    let modifiedStats = { ...baseStats };

    for (const passive of this.activePassives.values()) {
      if (passive.statModifier) {
        const stacks = this.passiveStacks[passive.id] || 0;
        const modifications = passive.statModifier(modifiedStats, level, stacks);
        modifiedStats = { ...modifiedStats, ...modifications };
      }
    }

    return modifiedStats;
  }

  /**
   * Add stacks to a passive
   */
  addStack(passiveId: PassiveId, amount: number = 1): void {
    const passive = this.activePassives.get(passiveId);
    if (!passive || !passive.stackable) return;

    this.passiveStacks[passiveId] = (this.passiveStacks[passiveId] || 0) + amount;

    // Cap at max stacks if specified
    if (passive.maxStacks) {
      this.passiveStacks[passiveId] = Math.min(
        this.passiveStacks[passiveId],
        passive.maxStacks
      );
    }

    // Update permanent stacks if it persists
    if (passive.persistsBetweenBattles) {
      this.permanentStacks[passiveId] = this.passiveStacks[passiveId];
    }
  }

  /**
   * Get current stack count for a passive
   */
  getStacks(passiveId: PassiveId): number {
    return this.passiveStacks[passiveId] || 0;
  }

  /**
   * Reset passive stacks
   * @param resetPermanent - If true, also resets permanent stacks (for new run)
   */
  resetStacks(resetPermanent: boolean = false): void {
    if (resetPermanent) {
      this.permanentStacks = {};
      this.passiveStacks = {};
    } else {
      // Keep permanent stacks, reset temporary ones
      this.passiveStacks = { ...this.permanentStacks };
    }
  }

  /**
   * Check if a specific passive is active
   */
  hasPassive(passiveId: PassiveId): boolean {
    return this.activePassives.has(passiveId);
  }

  /**
   * Get all active passive IDs
   */
  getActivePassiveIds(): PassiveId[] {
    return Array.from(this.activePassives.keys());
  }

  /**
   * Get all passives by trigger type
   */
  getPassivesByTrigger(trigger: PassiveTrigger): PassiveEffect[] {
    const passives: PassiveEffect[] = [];
    
    for (const passive of this.activePassives.values()) {
      if (passive.triggers.includes(trigger)) {
        passives.push(passive);
      }
    }
    
    return passives;
  }

  /**
   * Clone the manager (useful for simulations/testing)
   */
  clone(): PassiveManager {
    const cloned = new PassiveManager();
    cloned.activePassives = new Map(this.activePassives);
    cloned.passiveStacks = { ...this.passiveStacks };
    cloned.permanentStacks = { ...this.permanentStacks };
    return cloned;
  }
}

/**
 * Global passive manager instance
 * This can be replaced with a store integration
 */
let globalPassiveManager: PassiveManager | null = null;

/**
 * Get or create the global passive manager
 */
export function getPassiveManager(): PassiveManager {
  if (!globalPassiveManager) {
    globalPassiveManager = new PassiveManager();
  }
  return globalPassiveManager;
}

/**
 * Reset the global passive manager
 */
export function resetPassiveManager(): void {
  globalPassiveManager = new PassiveManager();
}

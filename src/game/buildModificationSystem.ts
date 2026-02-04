import { Character, CharacterClass } from './types';
import { getScaledStats } from './statsSystem';

export interface BuildModification {
  type: 'class_change' | 'stat_adjustment' | 'item_management' | 'curse_removal';
  applied: boolean;
}

// Stat caps for balance
const STAT_CAPS = {
  health: 5000,
  attackDamage: 500,
  abilityPower: 500,
  armor: 300,
  magicResist: 300,
  speed: 3.0,
  movementSpeed: 600,
  criticalChance: 100,
  criticalDamage: 300,
};

/**
 * Build Modification System
 * 
 * This system allows players to:
 * - Change their class/role
 * - Modify base stats
 * - Manage inventory and items
 * - Remove cursed items
 */

export function canModifyBuild(_character: Character): boolean {
  // Can always modify build between regions
  return true;
}

export function getAvailableClasses(): string[] {
  return ['fighter', 'mage', 'marksman', 'assassin', 'juggernaut', 'support'];
}

export function changeCharacterClass(character: Character, newClass: CharacterClass): boolean {
  const availableClasses = getAvailableClasses();
  
  if (!availableClasses.includes(newClass)) {
    console.log(`[BUILD SYSTEM] Invalid class: ${newClass}`);
    return false;
  }

  if (character.class === newClass) {
    console.log(`[BUILD SYSTEM] Already ${newClass}`);
    return false;
  }

  console.log(`[BUILD SYSTEM] Changing class from ${character.class} to ${newClass}`);
  
  // Update character class
  character.class = newClass;
  
  // Recalculate stats with new class bonuses
  const newStats = getScaledStats(character.stats, character.level, newClass, []);
  character.stats = newStats;
  
  console.log(`[BUILD SYSTEM] Class changed successfully! New stats:`, newStats);
  return true;
}

export function modifyStatPoints(character: Character, modifications: {
  health?: number;
  attackDamage?: number;
  abilityPower?: number;
  armor?: number;
  magicResist?: number;
  speed?: number;
  movementSpeed?: number;
}): boolean {
  console.log('[BUILD SYSTEM] Applying stat modifications:', modifications);
  
  let appliedChanges = false;
  
  // Apply each modification with cap validation
  for (const [stat, change] of Object.entries(modifications)) {
    if (change === undefined || change === 0) continue;
    
    const statKey = stat as keyof typeof character.stats;
    const currentValue = character.stats[statKey] as number || 0;
    const newValue = currentValue + change;
    const cap = STAT_CAPS[statKey as keyof typeof STAT_CAPS];
    
    // Validate against cap
    if (cap && newValue > cap) {
      console.log(`[BUILD SYSTEM] ${stat} would exceed cap (${cap}), capping at maximum`);
      (character.stats[statKey] as number) = cap;
    } else if (newValue < 0) {
      console.log(`[BUILD SYSTEM] ${stat} cannot be negative, setting to 0`);
      (character.stats[statKey] as number) = 0;
    } else {
      (character.stats[statKey] as number) = newValue;
      appliedChanges = true;
    }
  }
  
  if (appliedChanges) {
    console.log('[BUILD SYSTEM] Stat modifications applied successfully!');
    return true;
  }
  
  console.log('[BUILD SYSTEM] No stat changes were applied');
  return false;
}

export function discardItem(character: Character, itemIndex: number): boolean {
  if (!character.inventory || itemIndex < 0 || itemIndex >= character.inventory.length) {
    console.log('[BUILD SYSTEM] Invalid item index');
    return false;
  }
  
  const item = character.inventory[itemIndex];
  console.log(`[BUILD SYSTEM] Discarding item: ${item.itemId}`);
  
  character.inventory.splice(itemIndex, 1);
  return true;
}

export function removeCurse(character: Character, itemIndex: number, goldCost: number = 100): boolean {
  if (!character.inventory || itemIndex < 0 || itemIndex >= character.inventory.length) {
    console.log('[BUILD SYSTEM] Invalid item index');
    return false;
  }
  
  // Check if player has enough gold (assuming gold is tracked elsewhere)
  // For now, we'll just apply the curse removal
  console.log(`[BUILD SYSTEM] Removing curse from item (cost: ${goldCost}g)`);
  
  const item = character.inventory[itemIndex];
  // TODO: Mark item as no longer cursed (requires item system update)
  console.log(`[BUILD SYSTEM] Curse removed from ${item.itemId}`);
  
  return true;
}

/**
 * Get synergy bonuses for specific item combinations
 */
export function calculateSynergies(character: Character): { [key: string]: number } {
  const synergies: { [key: string]: number } = {};
  
  if (!character.inventory) return synergies;
  
  const itemIds = character.inventory.map(item => item.itemId);
  
  // Example synergies (can be expanded)
  if (itemIds.includes('dorans_blade') && itemIds.includes('vampiric_scepter')) {
    synergies.lifesteal = 10; // +10% lifesteal synergy
  }
  
  if (itemIds.includes('dorans_ring') && itemIds.includes('amplifying_tome')) {
    synergies.abilityPower = 15; // +15 AP synergy
  }
  
  return synergies;
}

/**
 * Get total stat points available for redistribution
 */
export function getAvailableStatPoints(character: Character): number {
  // Base points + points per level
  const basePoints = 10;
  const pointsPerLevel = 5;
  return basePoints + (character.level * pointsPerLevel);
}

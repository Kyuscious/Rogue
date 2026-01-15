import { ITEM_DATABASE } from './items';

/**
 * Represents a temporary buff applied during combat
 */
export interface CombatBuff {
  id: string;
  name: string;
  stat: keyof CombatBuffStats;
  amount: number;
  duration: number; // number of turns remaining
  type?: 'instant' | 'heal_over_time'; // Type of buff effect
}

/**
 * Temporary stat modifiers applied to the player during combat
 */
export interface CombatBuffStats {
  attackDamage: number;
  abilityPower: number;
  health: number;
  armor: number;
  magicResist: number;
  attackSpeed: number;
  heal_over_time: number; // Special stat for HoT effects
}

/**
 * Get an item from the item database by ID
 */
export function getItemById(itemId: string) {
  return ITEM_DATABASE[itemId];
}

/**
 * Get the primary buff stat from an item's stats
 * Prioritize in order: attackDamage, abilityPower, health, armor, magicResist, attackSpeed
 */
export function getPrimaryStatFromItem(itemId: string): { stat: keyof CombatBuffStats; amount: number } | null {
  const item = getItemById(itemId);
  if (!item) return null;

  // Check stats in priority order
  const statPriority: (keyof CombatBuffStats)[] = [
    'attackDamage',
    'abilityPower',
    'health',
    'armor',
    'magicResist',
    'attackSpeed',
  ];

  for (const stat of statPriority) {
    if (item.stats[stat] && item.stats[stat] > 0) {
      return {
        stat,
        amount: item.stats[stat],
      };
    }
  }

  return null;
}

/**
 * Create a temporary buff from an item
 * Buffs last for 3 turns by default
 */
export function createBuffFromItem(itemId: string, buffId: string): CombatBuff | null {
  const item = getItemById(itemId);
  if (!item) return null;

  const primaryStat = getPrimaryStatFromItem(itemId);
  if (!primaryStat) return null;

  return {
    id: buffId,
    name: `${item.name} Buff`,
    stat: primaryStat.stat,
    amount: primaryStat.amount,
    duration: 3, // Buff lasts 3 turns
  };
}

/**
 * Apply a buff to the player's stats
 */
export function applyBuffToStats(stats: any, buff: CombatBuff): any {
  return {
    ...stats,
    [buff.stat]: stats[buff.stat] + buff.amount,
  };
}

/**
 * Decay all buffs by 1 turn
 */
export function decayBuffs(buffs: CombatBuff[]): CombatBuff[] {
  return buffs
    .map((buff) => ({
      ...buff,
      duration: buff.duration - 1,
    }))
    .filter((buff) => buff.duration > 0);
}

/**
 * Get the combined effect of all active buffs on a stat
 */
export function getBuffModifier(buffs: CombatBuff[], stat: keyof CombatBuffStats): number {
  return buffs.filter((buff) => buff.stat === stat).reduce((total, buff) => total + buff.amount, 0);
}

/**
 * Check if player has a specific item in inventory
 */
export function hasItemInInventory(inventory: Array<{ itemId: string; quantity: number }>, itemId: string): boolean {
  return inventory.some((item) => item.itemId === itemId && item.quantity > 0);
}

/**
 * Get usable items from inventory (items marked as consumable)
 */
export function getUsableItems(
  inventory: Array<{ itemId: string; quantity: number }>
): Array<{ itemId: string; item: any; quantity: number }> {
  return inventory
    .map((invItem) => {
      const item = getItemById(invItem.itemId);
      return item && item.consumable ? { itemId: invItem.itemId, item, quantity: invItem.quantity } : null;
    })
    .filter((item) => item !== null) as Array<{ itemId: string; item: any; quantity: number }>;
}

/**
 * Create a heal-over-time buff from health potion
 */
export function createHealthPotionBuff(buffId: string): CombatBuff {
  return {
    id: buffId,
    name: 'Health Potion',
    stat: 'heal_over_time',
    amount: 10, // 10 HP per turn
    duration: 5, // 5 turns
    type: 'heal_over_time',
  };
}

/**
 * Format buff display for UI
 */
export function formatBuffDisplay(buff: CombatBuff): string {
  return `${buff.name}: +${buff.amount} ${buff.stat} (${buff.duration} turns)`;
}

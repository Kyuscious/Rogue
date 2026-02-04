import { ITEM_DATABASE } from './items';

/**
 * Represents a temporary buff applied during combat
 */
export interface CombatBuff {
  id: string;
  name: string;
  stat: keyof CombatBuffStats;
  amount: number;
  duration: number; // number of turns remaining (for turn-based buffs)
  durationType?: 'turns' | 'encounters'; // How the buff duration is tracked
  encountersRemaining?: number; // For encounter-based buffs (persists across battles)
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
  speed: number;
  tenacity: number; // TODO: Implement - reduces crowd control duration
  movementSpeed: number;
  magicFind: number;
  lifeSteal: number;
  trueDamage: number; // Flat damage that bypasses all resistances
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
 * Prioritize in order: attackDamage, abilityPower, health, armor, magicResist, speed
 */
export function getPrimaryStatFromItem(itemId: string): { stat: keyof CombatBuffStats; amount: number } | null {
  const item = getItemById(itemId);
  if (!item) return null;

  // Check stats in priority order
  const statPriority: Array<keyof CombatBuffStats> = [
    'attackDamage',
    'abilityPower',
    'health',
    'armor',
    'magicResist',
    'speed',
  ];

  for (const stat of statPriority) {
    const statValue = item.stats[stat as keyof typeof item.stats];
    if (statValue && statValue > 0) {
      return {
        stat,
        amount: statValue,
      };
    }
  }

  return null;
}

/**
 * Create a temporary buff from an item
 * TIMING MODEL: Buffs last 3 full turns from next integer turn boundary
 * Example: Applied at T2.34 → Ticks at T3, T4, T5 (duration starts at 4 to account for partial turn)
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
    duration: 4, // 3 full turns + 1 for partial turn = ticks at T+1, T+2, T+3
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
 * TIMING MODEL: HoT ticks 5 times from next integer turn boundary
 * Example: Used at T1.65 → Ticks at T2, T3, T4, T5, T6 (duration=6 to account for partial turn)
 */
export function createHealthPotionBuff(buffId: string): CombatBuff {
  return {
    id: buffId,
    name: 'Health Potion',
    stat: 'heal_over_time',
    amount: 20, // 20 HP per turn
    duration: 6, // 5 full ticks + 1 for partial turn
    type: 'heal_over_time',
  };
}

/**
 * Format buff display for UI
 */
export function formatBuffDisplay(buff: CombatBuff): string {
  return `${buff.name}: +${buff.amount} ${buff.stat} (${buff.duration} turns)`;
}

/**
 * Create or update Life Draining buff (Doran's Blade passive)
 * Adds 1% of base AD per stack, persists for encounter
 */
export function applyLifeDrainingBuff(
  buffs: CombatBuff[],
  baseAttackDamage: number,
  buffIdPrefix: string = 'life_draining'
): CombatBuff[] {
  const existingBuff = buffs.find((b) => b.id.startsWith(buffIdPrefix));
  const adIncrease = baseAttackDamage * 0.01;
  
  if (existingBuff) {
    // Stack the buff
    return buffs.map((b) =>
      b.id.startsWith(buffIdPrefix)
        ? { ...b, amount: b.amount + adIncrease, duration: 999 } // 999 = persists for encounter
        : b
    );
  } else {
    // Create new buff
    return [
      ...buffs,
      {
        id: `${buffIdPrefix}_${Date.now()}`,
        name: 'Life Draining',
        stat: 'attackDamage',
        amount: adIncrease,
        duration: 999, // Persists for entire encounter
      },
    ];
  }
}

/**
 * Create or update Drain buff (Doran's Ring passive)
 * Adds 1% of base AP per stack, persists for encounter
 */
export function applyDrainBuff(
  buffs: CombatBuff[],
  baseAbilityPower: number,
  buffIdPrefix: string = 'drain'
): CombatBuff[] {
  const existingBuff = buffs.find((b) => b.id.startsWith(buffIdPrefix));
  const apIncrease = baseAbilityPower * 0.01;
  
  if (existingBuff) {
    // Stack the buff
    return buffs.map((b) =>
      b.id.startsWith(buffIdPrefix)
        ? { ...b, amount: b.amount + apIncrease, duration: 999 }
        : b
    );
  } else {
    // Create new buff
    return [
      ...buffs,
      {
        id: `${buffIdPrefix}_${Date.now()}`,
        name: 'Drain',
        stat: 'abilityPower',
        amount: apIncrease,
        duration: 999, // Persists for entire encounter
      },
    ];
  }
}

/**
 * Create or update Enduring Focus buff (Doran's Shield passive)
 * Heals 5% of damage taken over 3 turns
 * TIMING MODEL: Each damage instance creates a buff that ticks 3 times from next integer turn
 * Example: Damaged at T1.65 → Ticks at T2, T3, T4 (duration=4 to account for partial turn)
 */
export function applyEnduringFocusBuff(
  buffs: CombatBuff[],
  damageTaken: number,
  buffIdPrefix: string = 'enduring_focus'
): CombatBuff[] {
  const healAmount = (damageTaken * 0.05) / 3; // 5% over 3 turns = 1.67% per turn
  
  // Always create a NEW buff instance - they stack additively
  // Each instance has its own 3-turn duration and will expire independently
  return [
    ...buffs,
    {
      id: `${buffIdPrefix}_${Date.now()}`, // Unique ID for each damage instance
      name: 'Enduring Focus',
      stat: 'heal_over_time',
      amount: healAmount,
      duration: 4, // 3 full ticks + 1 for partial turn
      type: 'heal_over_time',
    },
  ];
}

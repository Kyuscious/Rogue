import { ITEM_DATABASE } from './items';

/**
 * Represents a single stack instance within a buff
 * Each stack has its own duration and effect magnitude
 */
export interface BuffStack {
  addedTime: number; // Turn number when this stack was added
  expiresAtTurn: number; // Turn number when this stack expires (addedTime + duration)
  effectAmount: number; // The magnitude of this specific stack (e.g., 17 heal/turn)
  stackId: string; // Unique identifier for this stack instance
}

/**
 * Represents a temporary buff applied during combat
 * Now supports internal stacking - multiple applications merge into one UI slot
 */
export interface CombatBuff {
  id: string; // Unique identifier for this buff TYPE (e.g., "enduring_focus")
  name: string; // Display name (e.g., "Enduring Focus")
  stat: keyof CombatBuffStats; // Which stat this affects
  stacks: BuffStack[]; // Internal stack tracking - each with own duration/effect
  durationType?: 'turns' | 'encounters'; // How the buff duration is tracked
  encountersRemaining?: number; // For encounter-based buffs (persists across battles)
  type?: 'instant' | 'heal_over_time' | 'stacking_permanent'; // Type of buff effect
  isInfinite?: boolean; // For permanent stacking buffs like Life Draining
  
  // Computed properties (derived from stacks)
  totalAmount?: number; // Sum of all active stack effects (computed)
  maxDuration?: number; // Longest remaining duration among all stacks (computed)
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
  xpGain: number; // XP gain multiplier (for manaflow, etc.)
  goldGain: number; // Gold gain multiplier (for reap, etc.)
}

// Stats that should be displayed as decimals (not rounded)
const DECIMAL_STATS = ['speed', 'lifeSteal', 'spellVamp', 'omnivamp', 'tenacity', 'goldGain', 'xpGain', 'criticalChance', 'criticalDamage', 'haste', 'health_regen', 'heal_shield_power', 'magicFind'];

/**
 * Compute totalAmount and maxDuration from stacks
 */
export function computeBuffDisplayValues(buff: CombatBuff, currentTurn: number): { totalAmount: number; maxDuration: number } {
  // Filter out expired stacks
  const activeStacks = buff.stacks.filter(stack => stack.expiresAtTurn > currentTurn || buff.isInfinite);
  
  const totalAmount = activeStacks.reduce((sum, stack) => sum + stack.effectAmount, 0);
  const maxDuration = buff.isInfinite ? -1 : Math.max(...activeStacks.map(stack => stack.expiresAtTurn - currentTurn), 0);
  
  // Keep decimals for decimal stats, round for others
  const roundedAmount = DECIMAL_STATS.includes(buff.stat) ? parseFloat(totalAmount.toFixed(3)) : Math.round(totalAmount);
  
  return { totalAmount: roundedAmount, maxDuration };
}

/**
 * Add or merge a buff stack into the buff array
 * If a buff with the same id exists, adds a new stack to it
 * Otherwise creates a new buff entry
 */
export function addOrMergeBuffStack(
  buffs: CombatBuff[],
  buffId: string,
  buffName: string,
  stat: keyof CombatBuffStats,
  effectAmount: number,
  duration: number,
  currentTurn: number,
  type?: 'instant' | 'heal_over_time' | 'stacking_permanent',
  isInfinite: boolean = false
): CombatBuff[] {
  const existingBuffIndex = buffs.findIndex(b => b.id === buffId);
  
  // Preserve decimals for decimal stats (xpGain, goldGain, etc.)
  const DECIMAL_STATS = ['speed', 'lifeSteal', 'xpGain', 'goldGain', 'magicFind', 'criticalChance', 'criticalDamage', 'haste', 'health_regen', 'heal_shield_power'];
  const shouldPreserveDecimals = DECIMAL_STATS.includes(stat);
  
  const newStack: BuffStack = {
    addedTime: currentTurn,
    expiresAtTurn: isInfinite ? 9999 : currentTurn + duration,
    effectAmount: shouldPreserveDecimals ? effectAmount : Math.round(effectAmount),
    stackId: `${buffId}_${Date.now()}_${Math.random()}`,
  };
  
  if (existingBuffIndex !== -1) {
    // Buff exists - add new stack to it
    const updatedBuffs = [...buffs];
    updatedBuffs[existingBuffIndex] = {
      ...updatedBuffs[existingBuffIndex],
      stacks: [...updatedBuffs[existingBuffIndex].stacks, newStack],
    };
    return updatedBuffs;
  } else {
    // New buff - create it with first stack
    return [
      ...buffs,
      {
        id: buffId,
        name: buffName,
        stat,
        stacks: [newStack],
        type,
        isInfinite,
      },
    ];
  }
}

/**
 * Decay all buff stacks by removing expired ones
 * Returns updated buff array with expired stacks removed
 */
export function decayBuffStacks(buffs: CombatBuff[], currentTurn: number): CombatBuff[] {
  return buffs
    .map(buff => {
      // Remove expired stacks (unless buff is infinite)
      const activeStacks = buff.isInfinite 
        ? buff.stacks 
        : buff.stacks.filter(stack => stack.expiresAtTurn > currentTurn);
      
      return {
        ...buff,
        stacks: activeStacks,
      };
    })
    .filter(buff => buff.stacks.length > 0); // Remove buffs with no active stacks
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
export function createBuffFromItem(itemId: string, buffId: string, currentTurn: number = 0): CombatBuff | null {
  const item = getItemById(itemId);
  if (!item) return null;

  const primaryStat = getPrimaryStatFromItem(itemId);
  if (!primaryStat) return null;

  return {
    id: buffId,
    name: `${item.name} Buff`,
    stat: primaryStat.stat,
    stacks: [{
      addedTime: currentTurn,
      expiresAtTurn: currentTurn + 4, // 3 full turns + 1 for partial turn
      effectAmount: primaryStat.amount,
      stackId: `${buffId}_${Date.now()}`,
    }],
  };
}

/**
 * Apply a buff to the player's stats
 */
export function applyBuffToStats(stats: any, buff: CombatBuff, currentTurn: number): any {
  const { totalAmount } = computeBuffDisplayValues(buff, currentTurn);
  return {
    ...stats,
    [buff.stat]: stats[buff.stat] + totalAmount,
  };
}

/**
 * Decay all buffs by 1 turn (LEGACY - use decayBuffStacks instead)
 */
export function decayBuffs(buffs: CombatBuff[], currentTurn: number): CombatBuff[] {
  return decayBuffStacks(buffs, currentTurn);
}

/**
 * Get the combined effect of all active buffs on a stat
 */
export function getBuffModifier(buffs: CombatBuff[], stat: keyof CombatBuffStats, currentTurn: number): number {
  return buffs
    .filter((buff) => buff.stat === stat)
    .reduce((total, buff) => {
      const { totalAmount } = computeBuffDisplayValues(buff, currentTurn);
      return total + totalAmount;
    }, 0);
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
export function createHealthPotionBuff(buffId: string, currentTurn: number = 0): CombatBuff {
  return {
    id: buffId,
    name: 'Health Potion',
    stat: 'heal_over_time',
    stacks: [{
      addedTime: currentTurn,
      expiresAtTurn: currentTurn + 6, // 5 full ticks + 1 for partial turn
      effectAmount: 20, // 20 HP per turn
      stackId: `${buffId}_${Date.now()}`,
    }],
    type: 'heal_over_time',
  };
}

/**
 * Format buff display for UI
 */
export function formatBuffDisplay(buff: CombatBuff, currentTurn: number): string {
  const { totalAmount, maxDuration } = computeBuffDisplayValues(buff, currentTurn);
  const durationText = buff.isInfinite ? '∞' : `${maxDuration} turns`;
  return `${buff.name}: +${totalAmount} ${buff.stat} (${durationText})`;
}

/**
 * Create or update Life Draining buff (Doran's Blade passive)
 * Adds 1% of base AD per stack, persists for encounter (infinite stacking)
 * Each attack adds a new stack with the current 1% AD bonus
 */
export function applyLifeDrainingBuff(
  buffs: CombatBuff[],
  baseAttackDamage: number,
  currentTurn: number = 0,
  buffIdPrefix: string = 'life_draining'
): CombatBuff[] {
  const adIncrease = Math.max(1, Math.round(baseAttackDamage * 0.01));
  
  return addOrMergeBuffStack(
    buffs,
    buffIdPrefix,
    'Life Draining',
    'attackDamage',
    adIncrease,
    9999, // Duration doesn't matter - isInfinite=true
    currentTurn,
    'stacking_permanent',
    true // Infinite - persists entire battle
  );
}

/**
 * Create or update Drain buff (Doran's Ring passive)
 * Adds 1% of base AP per stack, persists for encounter (infinite stacking)
 * Each spell cast adds a new stack with the current 1% AP bonus
 */
export function applyDrainBuff(
  buffs: CombatBuff[],
  baseAbilityPower: number,
  currentTurn: number = 0,
  buffIdPrefix: string = 'drain'
): CombatBuff[] {
  const apIncrease = Math.max(1, Math.round(baseAbilityPower * 0.01));
  
  return addOrMergeBuffStack(
    buffs,
    buffIdPrefix,
    'Drain',
    'abilityPower',
    apIncrease,
    9999, // Duration doesn't matter - isInfinite=true
    currentTurn,
    'stacking_permanent',
    true // Infinite - persists entire battle
  );
}

/**
 * Create or update Enduring Focus buff (Doran's Shield passive)
 * Heals 5% of damage taken over 3 turns
 * Each damage instance creates a NEW stack that heals independently
 * Stacks merge into single UI slot but each maintains independent expiration
 */
export function applyEnduringFocusBuff(
  buffs: CombatBuff[],
  damageTaken: number,
  currentTurn: number = 0,
  buffIdPrefix: string = 'enduring_focus'
): CombatBuff[] {
  const healPerTurn = Math.round((damageTaken * 0.05) / 3); // 5% over 3 turns, rounded
  
  return addOrMergeBuffStack(
    buffs,
    buffIdPrefix,
    'Enduring Focus',
    'heal_over_time',
    healPerTurn,
    3, // Lasts 3 turns
    currentTurn,
    'heal_over_time',
    false
  );
}

/**
 * BUFF PERSISTENCE SYSTEM
 * 
 * Three types of buffs with different persistence rules:
 * 
 * 1. COMBAT-ONLY: Expire at end of encounter (cleared by Battle.tsx)
 *    Example: For Demacia spell, Life Draining
 *    Use: createCombatOnlyBuff()
 * 
 * 2. ENCOUNTER-PERSISTENT: Last X encounters then expire
 *    Example: Well-Rested from rest (10 encounters), temporary potions
 *    Use: createEncounterPersistentBuff() + add to persistentBuffs
 *    Decay: Automatic via incrementEncounterCount() after each battle
 * 
 * 3. PERMANENT STACKING: Never expire, last entire run
 *    Example: Dark Seal stacks, permanent bonuses
 *    Use: createPermanentStackingBuff() + add to persistentBuffs
 *    Decay: Never decayed by incrementEncounterCount()
 * 
 * See buffPersistenceGuide.md for complete documentation.
 */

/**
 * Create a buff that expires at end of encounter (not persistent)
 * Use this for buffs that should only last during current battle
 * 
 * Example:
 * const forDemaciaBuff = createCombatOnlyBuff({
 *   id: 'for_demacia',
 *   name: 'For Demacia',
 *   stat: 'attackDamage',
 *   effectAmount: 5,
 *   durationTurns: 2,
 *   currentTurn: battleState.turnCounter
 * });
 * playerBuffs = addOrMergeBuffStack([...playerBuffs], forDemaciaBuff);
 */
export function createCombatOnlyBuff(options: {
  id: string;
  name: string;
  stat: keyof CombatBuffStats;
  effectAmount: number;
  durationTurns: number;
  currentTurn?: number;
}): CombatBuff {
  return {
    id: options.id,
    name: options.name,
    stat: options.stat,
    stacks: [{
      addedTime: options.currentTurn ?? 0,
      expiresAtTurn: (options.currentTurn ?? 0) + options.durationTurns,
      effectAmount: options.effectAmount,
      stackId: `${options.id}_${Date.now()}`,
    }],
    type: 'instant',
  };
}

/**
 * Create a buff that persists for X encounters then expires
 * Use this for temporary persistent buffs (elixirs, rest bonuses, etc)
 * 
 * Example:
 * const wellRestedBuff = createEncounterPersistentBuff({
 *   id: 'well_rested',
 *   name: 'Well-Rested',
 *   stat: 'attackDamage',
 *   effectAmount: 10,
 *   encounterDuration: 10
 * });
 * persistentBuffs = [...persistentBuffs, wellRestedBuff];
 * 
 * Flow:
 * - Buff created with encountersRemaining: 10
 * - After each battle, incrementEncounterCount() decrements to 9, 8, 7...
 * - When encountersRemaining reaches 0, buff is removed
 */
export function createEncounterPersistentBuff(options: {
  id: string;
  name: string;
  stat: keyof CombatBuffStats;
  effectAmount: number;
  encounterDuration: number; // Number of encounters this buff lasts
}): CombatBuff {
  return {
    id: options.id,
    name: options.name,
    stat: options.stat,
    stacks: [{
      addedTime: 0,
      expiresAtTurn: 9999, // Never expires by turn in persistent context
      effectAmount: options.effectAmount,
      stackId: `${options.id}_persistent_${Date.now()}`,
    }],
    durationType: 'encounters', // KEY: Mark as encounter-based duration
    encountersRemaining: options.encounterDuration, // Will last exactly this many encounters
    type: 'stacking_permanent',
  };
}

/**
 * Create a buff that never expires and persists entire run
 * Use this for permanent stacking bonuses that accumulate over time
 * 
 * Example (Dark Seal):
 * const darkSealBuff = createPermanentStackingBuff({
 *   id: 'dark_seal_stacks',
 *   name: 'Dark Seal Stack',
 *   stat: 'abilityPower',
 *   effectAmount: 15
 * });
 * persistentBuffs = [...persistentBuffs, darkSealBuff];
 * 
 * Later when condition triggers, add another stack:
 * existingBuff.stacks.push({
 *   addedTime: 0,
 *   expiresAtTurn: 9999,
 *   effectAmount: 15,
 *   stackId: `dark_seal_stack_${Date.now()}`,
 * });
 * 
 * Flow:
 * - Buff created with NO durationType or encountersRemaining
 * - incrementEncounterCount() filter checks: "if no durationType, keep it forever"
 * - Buff persists across all encounters until run ends
 * - Stacks can accumulate as conditions trigger
 */
export function createPermanentStackingBuff(options: {
  id: string;
  name: string;
  stat: keyof CombatBuffStats;
  effectAmount: number;
}): CombatBuff {
  return {
    id: options.id,
    name: options.name,
    stat: options.stat,
    stacks: [{
      addedTime: 0,
      expiresAtTurn: 9999, // Permanent - never expires
      effectAmount: options.effectAmount,
      stackId: `${options.id}_stack_${Date.now()}`,
    }],
    type: 'stacking_permanent',
    isInfinite: true,
  };
}

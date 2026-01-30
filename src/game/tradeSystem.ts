import { CharacterClass } from './types';
import { ItemTrade, ITEM_TRADES } from './trades';

/**
 * Trade System - Allows players to:
 * 1. Combine items into higher rarity
 * 2. Change their class
 * 3. Discard items
 */

// Re-export ItemTrade for use in components
export type { ItemTrade };
export { ITEM_TRADES };

/**
 * Get all available trades for a player based on their inventory
 */
export function getAvailableTrades(
  inventory: Array<{ itemId: string; quantity: number }>
): ItemTrade[] {
  return ITEM_TRADES.filter(trade => {
    // Check if player has all required items
    return trade.fromItems.every(required => {
      const owned = inventory.find(inv => inv.itemId === required.itemId);
      return owned && owned.quantity >= required.quantity;
    });
  });
}

/**
 * Execute a trade - remove from items and add to items
 */
export function executeTrade(
  inventory: Array<{ itemId: string; quantity: number }>,
  trade: ItemTrade
): Array<{ itemId: string; quantity: number }> {
  let updated = [...inventory];

  // Remove required items
  trade.fromItems.forEach(required => {
    const index = updated.findIndex(inv => inv.itemId === required.itemId);
    if (index !== -1) {
      updated[index] = {
        ...updated[index],
        quantity: updated[index].quantity - required.quantity,
      };
      // Remove if quantity is 0
      if (updated[index].quantity === 0) {
        updated.splice(index, 1);
      }
    }
  });

  // Add resulting item
  const existingIndex = updated.findIndex(inv => inv.itemId === trade.toItem.itemId);
  if (existingIndex !== -1) {
    updated[existingIndex] = {
      ...updated[existingIndex],
      quantity: updated[existingIndex].quantity + trade.toItem.quantity,
    };
  } else {
    updated.push(trade.toItem);
  }

  return updated;
}

/**
 * Get a random subset of available trades to offer the player
 * If more trades are available than maxOffers, randomly select maxOffers
 */
export function getOfferedTrades(
  inventory: Array<{ itemId: string; quantity: number }>,
  maxOffers: number = 3
): ItemTrade[] {
  const available = getAvailableTrades(inventory);

  if (available.length <= maxOffers) {
    return available;
  }

  // Randomly select maxOffers trades
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, maxOffers);
}

/**
 * Get available classes to change to
 * Returns 3 random classes different from the current class
 */
export function getAvailableClassSwaps(
  currentClass: CharacterClass,
  maxOffers: number = 3
): CharacterClass[] {
  const allClasses: CharacterClass[] = [
    'mage',
    'vanguard',
    'warden',
    'juggernaut',
    'skirmisher',
    'assassin',
    'marksman',
    'enchanter',
  ];

  const availableClasses = allClasses.filter(c => c !== currentClass);
  const shuffled = availableClasses.sort(() => Math.random() - 0.5);

  return shuffled.slice(0, Math.min(maxOffers, availableClasses.length));
}

/**
 * Discard an item from inventory
 */
export function discardItem(
  inventory: Array<{ itemId: string; quantity: number }>,
  itemId: string,
  quantity: number = 1
): Array<{ itemId: string; quantity: number }> {
  let updated = [...inventory];
  const index = updated.findIndex(inv => inv.itemId === itemId);

  if (index === -1) return updated;

  const newQuantity = updated[index].quantity - quantity;
  if (newQuantity <= 0) {
    updated.splice(index, 1);
  } else {
    updated[index] = {
      ...updated[index],
      quantity: newQuantity,
    };
  }

  return updated;
}

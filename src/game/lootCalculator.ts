import { 
  ITEM_DATABASE, 
  Item, 
  ItemRarity,
  MINION_RARITY_POOL,
  ELITE_RARITY_POOL,
  CHAMPION_RARITY_POOL,
  BOSS_RARITY_POOL
} from './items';
import { resolveEnemyIdByRegion, getEnemyById } from './regions/enemyResolver';
import { Region } from './types';

export interface LootOdds {
  itemId: string;
  itemName: string;
  rarity: ItemRarity;
  dropChance: number; // Percentage (0-100)
  imagePath?: string;
}

export interface QuestLootInfo {
  allPossibleItems: LootOdds[];
  uniqueItemCount: number;
  averageRarity: string;
}

/**
 * Get the rarity pool for a specific enemy tier
 */
function getRarityPoolForTier(tier: 'minion' | 'elite' | 'champion' | 'boss' | 'legend'): Array<{ rarity: ItemRarity; weight: number }> {
  switch (tier) {
    case 'boss':
      return BOSS_RARITY_POOL as Array<{ rarity: ItemRarity; weight: number }>;
    case 'champion':
      return CHAMPION_RARITY_POOL as Array<{ rarity: ItemRarity; weight: number }>;
    case 'elite':
      return ELITE_RARITY_POOL as Array<{ rarity: ItemRarity; weight: number }>;
    case 'minion':
    default:
      return MINION_RARITY_POOL as Array<{ rarity: ItemRarity; weight: number }>;
  }
}

/**
 * Calculate drop chance for a specific item based on enemy tier and magic find
 * @param item - The item to calculate odds for
 * @param tier - Enemy tier
 * @param magicFind - Player's magic find stat
 * @returns Drop chance as a percentage (0-100)
 */
function calculateItemDropChance(item: Item, tier: 'minion' | 'elite' | 'champion' | 'boss' | 'legend', magicFind: number = 0): number {
  const rarityPool = getRarityPoolForTier(tier);
  
  // Apply magic find modifier to rarity weights
  const modifiedPool = rarityPool.map((entry, index) => {
    const rarityBonus = magicFind * (index / (rarityPool.length - 1));
    const newWeight = Math.max(1, entry.weight + rarityBonus);
    return { ...entry, weight: newWeight };
  });
  
  // Calculate total weight
  const totalWeight = modifiedPool.reduce((sum, entry) => sum + entry.weight, 0);
  
  // Find the weight for this item's rarity
  const rarityEntry = modifiedPool.find(entry => entry.rarity === item.rarity);
  if (!rarityEntry) return 0;
  
  // Get all items of this rarity that have stats
  const itemsOfRarity = Object.values(ITEM_DATABASE).filter(
    (i) => i.rarity === item.rarity && i.stats && Object.keys(i.stats).length > 0
  );
  
  if (itemsOfRarity.length === 0) return 0;
  
  // Chance = (rarity weight / total weight) * (1 / items in rarity pool) * 100
  const rarityChance = (rarityEntry.weight / totalWeight) * 100;
  const itemChance = rarityChance / itemsOfRarity.length;
  
  return itemChance;
}

/**
 * Get all possible loot drops from a list of enemies
 * @param enemyIds - Array of enemy IDs from a quest path
 * @param region - Current region (for resolving random enemy IDs)
 * @param magicFind - Player's magic find stat
 * @returns Aggregated loot information with drop chances
 */
export function calculateQuestLoot(enemyIds: string[], region: Region, magicFind: number = 0): QuestLootInfo {
  const lootMap = new Map<string, LootOdds>();
  
  // Process each enemy
  for (const enemyId of enemyIds) {
    // Resolve the enemy (handles "random:tier:faction" format)
    const resolvedEnemyId = resolveEnemyIdByRegion(enemyId, region);
    const enemy = getEnemyById(resolvedEnemyId);
    if (!enemy) continue;
    
    // Skip legend tier enemies (they don't drop random loot)
    if (enemy.tier === 'legend') continue;
    
    const tier = (enemy.tier || 'minion') as 'minion' | 'elite' | 'champion' | 'boss' | 'legend';
    
    // Get all possible items this enemy can drop
    const possibleItems = Object.values(ITEM_DATABASE).filter(
      (item) => item.stats && Object.keys(item.stats).length > 0
    );
    
    // Calculate drop chance for each item
    for (const item of possibleItems) {
      const dropChance = calculateItemDropChance(item, tier, magicFind);
      
      if (dropChance > 0) {
        const existing = lootMap.get(item.id);
        if (existing) {
          // If item already exists, average the drop chances
          existing.dropChance = (existing.dropChance + dropChance) / 2;
        } else {
          lootMap.set(item.id, {
            itemId: item.id,
            itemName: item.name || item.id,
            rarity: item.rarity,
            dropChance: dropChance,
            imagePath: item.imagePath,
          });
        }
      }
    }
  }
  
  // Convert to array and sort by drop chance (highest first)
  const allPossibleItems = Array.from(lootMap.values())
    .sort((a, b) => b.dropChance - a.dropChance);
  
  // Calculate average rarity
  const rarityWeight = {
    starter: 1,
    common: 2,
    epic: 3,
    legendary: 4,
    mythic: 5,
    ultimate: 6,
    exalted: 7,
    transcendent: 8,
  };
  
  const avgWeight = allPossibleItems.reduce((sum, item) => 
    sum + rarityWeight[item.rarity], 0) / allPossibleItems.length;
  
  let averageRarity = 'common';
  if (avgWeight >= 7) averageRarity = 'exalted';
  else if (avgWeight >= 5.5) averageRarity = 'ultimate';
  else if (avgWeight >= 4.5) averageRarity = 'mythic';
  else if (avgWeight >= 3.5) averageRarity = 'legendary';
  else if (avgWeight >= 2.5) averageRarity = 'epic';
  
  return {
    allPossibleItems,
    uniqueItemCount: allPossibleItems.length,
    averageRarity,
  };
}

/**
 * Generate N unique loot items, excluding already offered items
 * @param enemyIds - Array of enemy IDs from a quest path
 * @param region - Current region
 * @param magicFind - Player's magic find stat
 * @param count - Number of items to generate (default 3)
 * @param excludeIds - Item IDs to exclude
 * @returns Array of item IDs
 */
export function generateUniqueLoot(
  enemyIds: string[], 
  region: Region, 
  magicFind: number = 0, 
  count: number = 3,
  excludeIds: string[] = []
): string[] {
  const lootInfo = calculateQuestLoot(enemyIds, region, magicFind);
  
  // Filter out excluded items
  const availableItems = lootInfo.allPossibleItems.filter(
    item => !excludeIds.includes(item.itemId)
  );
  
  if (availableItems.length === 0) {
    console.warn('No more unique items available for loot generation');
    return [];
  }
  
  // Weighted random selection based on drop chances
  const selectedItems: string[] = [];
  const poolCopy = [...availableItems];
  
  for (let i = 0; i < count && poolCopy.length > 0; i++) {
    // Calculate total weight
    const totalChance = poolCopy.reduce((sum, item) => sum + item.dropChance, 0);
    let randomValue = Math.random() * totalChance;
    
    // Select item based on weighted probability
    let selectedIndex = 0;
    for (let j = 0; j < poolCopy.length; j++) {
      randomValue -= poolCopy[j].dropChance;
      if (randomValue <= 0) {
        selectedIndex = j;
        break;
      }
    }
    
    selectedItems.push(poolCopy[selectedIndex].itemId);
    poolCopy.splice(selectedIndex, 1); // Remove to avoid duplicates
  }
  
  return selectedItems;
}

/**
 * Calculate if there are enough unique items remaining for a re-roll
 * @param enemyIds - Array of enemy IDs from a quest path
 * @param region - Current region
 * @param excludeIds - Item IDs already offered
 * @param requiredCount - Number of unique items needed (default 3)
 * @returns Boolean indicating if re-roll is possible
 */
export function canReroll(
  enemyIds: string[], 
  region: Region, 
  excludeIds: string[],
  requiredCount: number = 3
): boolean {
  const lootInfo = calculateQuestLoot(enemyIds, region, 0);
  const availableItems = lootInfo.allPossibleItems.filter(
    item => !excludeIds.includes(item.itemId)
  );
  
  return availableItems.length >= requiredCount;
}

import { Character, InventoryItem, Region } from './types';
import { getRandomLootByClass } from './items';
import { calculateExpReward } from './experienceSystem';

export interface BattleReward {
  type: 'item' | 'gold' | 'health';
  itemId?: string;
  amount?: number;
}

export interface BattleVictoryResult {
  loot?: BattleReward[];
  shouldShowRewardSelection: boolean;
  hasMoreEnemies: boolean;
  nextEnemies?: Character[];
  goldReward: number;
  expReward: number;
}

/**
 * Handles the logic after defeating an enemy
 * Returns what should happen next (loot, rewards, next enemy, etc.)
 */
export function handleEnemyDefeat(
  defeatedEnemy: Character,
  remainingEnemies: Character[],
  currentFloor: number,
  _currentRegion: Region | null,
  playerLevel: number
): BattleVictoryResult {
  const result: BattleVictoryResult = {
    loot: [],
    shouldShowRewardSelection: false,
    hasMoreEnemies: remainingEnemies.length > 0,
    nextEnemies: remainingEnemies,
    goldReward: calculateGoldReward(defeatedEnemy, currentFloor),
    expReward: calculateExpReward(defeatedEnemy, playerLevel),
  };

  // Generate loot drop based on enemy tier
  // Legend tier enemies don't drop random loot - they have special rewards
  if (defeatedEnemy.tier !== 'legend') {
    const tierForLoot = defeatedEnemy.tier || 'minion';
    const lootItem = getRandomLootByClass(defeatedEnemy.class, tierForLoot as 'minion' | 'elite' | 'champion' | 'boss');
    
    if (lootItem) {
      result.loot!.push({
      type: 'item',
      itemId: lootItem.id,
    });
    
    // If item has HP, add healing reward
    if (lootItem.stats.health) {
      result.loot!.push({
        type: 'health',
        amount: lootItem.stats.health,
      });
    }
    }
  }

  // Check if this is a reward floor (every 5 floors)
  result.shouldShowRewardSelection = currentFloor % 5 === 0 && currentFloor > 0;

  return result;
}

/**
 * Calculate gold reward based on enemy and floor
 */
function calculateGoldReward(enemy: Character, floor: number): number {
  const baseTierGold: Record<string, number> = {
    minion: 10,
    elite: 25,
    champion: 50,
    boss: 100,
  };
  
  const tierGold = baseTierGold[enemy.tier || 'minion'] || 10;
  const floorMultiplier = 1 + (floor * 0.1); // 10% more gold per floor
  
  return Math.floor(tierGold * floorMultiplier);
}

/**
 * Generate reward options for milestone floors (5, 10, 15, etc.)
 * Returns 3 item choices based on region and floor
 */
export function generateRewardOptions(
  region: Region | null,
  floor: number,
  _playerClass: string
): InventoryItem[] {
  // Region-specific reward pools by tier
  const regionRewardPools: Record<Region, { elite: string[], boss: string[] }> = {
    demacia: {
      elite: ['longsword', 'cloth_armor', 'ruby_crystal', 'negatron_cloak', 'pickaxe', 'chain_vest', 'health_potion'],
      boss: ['giants_belt', 'chain_vest', 'negatron_cloak', 'pickaxe', 'bf_sword', 'sunfire_aegis', 'trinity_force'],
    },
    ionia: {
      elite: ['amplifying_tome', 'sapphire_crystal', 'fiendish_codex', 'aether_wisp', 'blasting_wand', 'health_potion'],
      boss: ['needlessly_large_rod', 'rabadons_deathcap', 'zhonyas_hourglass', 'ludens_echo', 'mejais_soulstealer'],
    },
    shurima: {
      elite: ['longsword', 'amplifying_tome', 'ruby_crystal', 'pickaxe', 'blasting_wand', 'recurve_bow'],
      boss: ['health_potion', 'bf_sword', 'giants_belt', 'needlessly_large_rod', 'infinity_edge', 'nashors_tooth'],
    },
    noxus: { elite: ['longsword', 'cloth_armor', 'pickaxe'], boss: ['bf_sword', 'giants_belt'] },
    freljord: { elite: ['longsword', 'cloth_armor', 'pickaxe'], boss: ['bf_sword', 'giants_belt'] },
    zaun: { elite: ['longsword', 'cloth_armor', 'pickaxe'], boss: ['bf_sword', 'giants_belt'] },
    ixtal: { elite: ['longsword', 'cloth_armor', 'pickaxe'], boss: ['bf_sword', 'giants_belt'] },
    bandle_city: { elite: ['longsword', 'cloth_armor', 'pickaxe'], boss: ['bf_sword', 'giants_belt'] },
    bilgewater: { elite: ['longsword', 'cloth_armor', 'pickaxe'], boss: ['bf_sword', 'giants_belt'] },
    piltover: { elite: ['longsword', 'cloth_armor', 'pickaxe'], boss: ['bf_sword', 'giants_belt'] },
    shadow_isles: { elite: ['longsword', 'cloth_armor', 'pickaxe'], boss: ['bf_sword', 'giants_belt'] },
    void: { elite: ['longsword', 'cloth_armor', 'pickaxe'], boss: ['bf_sword', 'giants_belt'] },
    targon: { elite: ['longsword', 'cloth_armor', 'pickaxe'], boss: ['bf_sword', 'giants_belt'] },
  };
  
  // Default pool if no region selected
  const defaultPools = {
    elite: ['longsword', 'cloth_armor', 'ruby_crystal', 'amplifying_tome', 'health_potion'],
    boss: ['bf_sword', 'needlessly_large_rod', 'giants_belt', 'chain_vest', 'negatron_cloak'],
  };
  
  // Determine tier based on floor
  const isBossTier = floor >= 10;
  const poolKey = isBossTier ? 'boss' : 'elite';
  
  // Get appropriate reward pool
  const pools = region ? regionRewardPools[region] : defaultPools;
  const rewardPool = pools[poolKey];
  
  // Generate 3 random rewards (no duplicates)
  const selectedRewards: InventoryItem[] = [];
  const poolCopy = [...rewardPool];
  
  for (let i = 0; i < 3 && poolCopy.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * poolCopy.length);
    const itemId = poolCopy[randomIndex];
    selectedRewards.push({ itemId, quantity: 1 });
    poolCopy.splice(randomIndex, 1);
  }
  
  return selectedRewards;
}

/**
 * Get battle log messages for victory
 */
export function getVictoryMessages(
  enemyName: string,
  result: BattleVictoryResult
): string[] {
  // Build a single comprehensive victory message
  let victoryMessage = `${enemyName} defeated!`;
  
  // Add loot to the same line
  if (result.loot && result.loot.length > 0) {
    result.loot.forEach(reward => {
      if (reward.type === 'item' && reward.itemId) {
        victoryMessage += ` | 🎁 ${reward.itemId}`;
      }
      if (reward.type === 'health' && reward.amount) {
        victoryMessage += ` | 💚 +${reward.amount} HP`;
      }
    });
  }
  
  // Add gold and EXP to the same line
  victoryMessage += ` | +${result.goldReward} Gold | +${result.expReward} EXP`;
  
  const messages: string[] = [victoryMessage];
  
  // Add milestone message on separate line (important)
  if (result.shouldShowRewardSelection) {
    messages.push(`🎉 Milestone reached! Choose your reward!`);
  }
  
  return messages;
}

/**
 * Apply victory rewards to game state
 */
export function applyVictoryRewards(
  result: BattleVictoryResult,
  addInventoryItem: (item: InventoryItem) => void,
  addGold: (amount: number) => void,
  addExperience: (amount: number) => void,
  updatePlayerHp: (hp: number) => void,
  currentPlayerHp: number,
  maxPlayerHp: number
): void {
  // Add loot items
  if (result.loot) {
    result.loot.forEach(reward => {
      if (reward.type === 'item' && reward.itemId) {
        addInventoryItem({ itemId: reward.itemId, quantity: 1 });
      }
      if (reward.type === 'health' && reward.amount) {
        const newHp = Math.min(currentPlayerHp + reward.amount, maxPlayerHp + reward.amount);
        updatePlayerHp(newHp);
      }
    });
  }
  
  // Add gold
  addGold(result.goldReward);
  
  // Add experience
  addExperience(result.expReward);
}

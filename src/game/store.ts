import { create } from 'zustand';
import { Character, InventoryItem, Region } from './types';
import { DEFAULT_STATS, getScaledStats } from './statsSystem';
import { STARTING_ITEMS, ITEM_DATABASE, getRandomShopItemByAct } from './items';
import { checkLevelUp, getLevelUpStatBoosts, calculateEnemyLevel } from './experienceSystem';
import { incrementBattlesWon, incrementRunsFailed, discoverItem, discoverConnection, getActiveProfileId, visitRegion, unlockItem } from './profileSystem';
import { REGION_SHOP_POOLS } from './rewardPool';
import { CombatBuff } from './itemSystem';

// Default player character
const DEFAULT_PLAYER: Character = {
  id: 'summoner',
  name: 'Summoner',
  role: 'player',
  region: 'demacia',
  class: 'juggernaut',
  hp: DEFAULT_STATS.health,
  abilities: [],
  level: 1,
  experience: 0,
  stats: DEFAULT_STATS,
};

export interface ShopSlot {
  itemId: string;
  hasDiscount: boolean;
  discountPercent: number;
  soldOut: boolean;
}

export interface GameStoreState {
  state: {
    playerCharacter: Character;
    enemyCharacters: Character[];
    inventory: InventoryItem[];
    gold: number;
    rerolls: number; // Global reroll currency for the entire run
    selectedRegion: Region | null;
    currentFloor: number;
    selectedStartingItem: string | null;
    selectedQuest: { questId: string; pathId: string } | null;
    username: string;
    // Region traversal state
    originalStartingRegion: Region | null; // The very first region chosen at run start
    currentAct: number; // 1, 2, or 3
    usedPaths: string[]; // Array of "regionA→regionB" paths used in current act
    piltoverVisits: number; // Total Piltover visits across all acts
    completedActEndingRegions: Region[]; // Tracks which ending regions were used (can't revisit)
    // Shop state
    shopInventory: ShopSlot[];
    lastShopFloor: number; // Track when shop was last generated
    // Run stats for unlock tracking
    maxAbilityPowerReached: number; // Highest AP reached in current run
    // Persistent buff system
    persistentBuffs: CombatBuff[]; // Buffs that persist across encounters (e.g., elixirs)
    encountersCompleted: number; // Total encounters completed in current run
  };
  selectRegion: (region: Region) => void;
  selectStartingItem: (itemId: string) => void;
  selectQuest: (questId: string, pathId: string) => void;
  clearQuestSelection: () => void;
  resetFloor: () => void; // Reset floor counter when starting a new quest
  setCurrentFloor: (floor: number) => void;
  startBattle: (enemies: Character[]) => void;
  endBattle: () => void;
  addGold: (amount: number) => void;
  addRerolls: (amount: number) => void;
  useReroll: () => boolean; // Returns true if successful, false if no rerolls left
  addInventoryItem: (item: InventoryItem) => void;
  removeInventoryItem: (itemId: string) => void; // Remove item from inventory
  consumeInventoryItem: (itemId: string) => void;
  addExperience: (amount: number) => void;
  setUsername: (username: string) => void;
  updatePlayerHp: (newHp: number) => void;
  updateEnemyHp: (enemyIndex: number, newHp: number) => void;
  resetRun: () => void;
  saveRun: () => void; // Save current run state to localStorage
  loadRun: () => boolean; // Load saved run state, returns true if successful
  clearSavedRun: () => void; // Clear saved run from localStorage
  // Region traversal methods
  travelToRegion: (fromRegion: Region, toRegion: Region) => void;
  completeAct: (endingRegion: Region) => void;
  // Shop methods
  generateShopInventory: () => void; // Generate shop items (only if needed)
  rerollShop: () => void; // Manually reroll shop
  markShopItemSold: (slotIndex: number) => void;
  // Stat tracking
  updateMaxAbilityPower: (currentAP: number) => void;
  // Persistent buff management
  incrementEncounterCount: () => void; // Call after each battle ends
  applyElixirBuff: (elixirId: string) => void; // Apply encounter-based buff from elixir
  getPersistentBuffs: () => CombatBuff[]; // Get current persistent buffs
}

export const useGameStore = create<GameStoreState>((set) => ({
  state: {
    playerCharacter: DEFAULT_PLAYER,
    enemyCharacters: [],
    inventory: [],
    gold: 0,
    rerolls: 5, // Start with 5 rerolls per run
    selectedRegion: null,
    currentFloor: 0,
    selectedStartingItem: null,
    selectedQuest: null,
    username: 'Summoner',
    // Region traversal initialization
    originalStartingRegion: null,
    currentAct: 1,
    usedPaths: [],
    piltoverVisits: 0,
    completedActEndingRegions: [],
    // Shop initialization
    shopInventory: [],
    lastShopFloor: -1,
    // Run stats
    maxAbilityPowerReached: 0,
    // Persistent buffs
    persistentBuffs: [],
    encountersCompleted: 0,
  },

  setUsername: (username: string) =>
    set((store) => ({
      state: {
        ...store.state,
        username,
        playerCharacter: {
          ...store.state.playerCharacter,
          name: username,
        },
      },
    })),

  selectRegion: (region: Region) =>
    set((store) => {
      // Track region visit for unlock progress
      visitRegion(region);
      
      return {
        state: {
          ...store.state,
          selectedRegion: region,
          // Set originalStartingRegion if this is the first region selection
          originalStartingRegion: store.state.originalStartingRegion || region,
        },
      };
    }),

  selectStartingItem: (itemId: string) =>
    set((store) => {
      const item = STARTING_ITEMS.find((i) => i.id === itemId);
      if (!item) return store;

      // Discover the starting item
      discoverItem(itemId);

      // Determine class based on item
      let characterClass: 'juggernaut' | 'mage' | 'vanguard' = 'juggernaut';
      if (item.id === 'dorans_ring') characterClass = 'mage';
      if (item.id === 'dorans_shield') characterClass = 'vanguard';
      if (item.id === 'dorans_blade') characterClass = 'juggernaut';
      if (item.id === 'world_atlas') characterClass = 'juggernaut'; // Default class for atlas

      // Set rerolls: 10 for world_atlas, 5 for others
      const initialRerolls = item.id === 'world_atlas' ? 10 : 5;

      // Create new stats with item bonuses applied - apply ALL item stats dynamically
      const newStats = { ...store.state.playerCharacter.stats };
      (Object.keys(item.stats) as Array<keyof typeof item.stats>).forEach(stat => {
        const itemValue = item.stats[stat];
        if (itemValue && typeof itemValue === 'number') {
          (newStats[stat] as number) = ((newStats[stat] as number) || 0) + itemValue;
        }
      });

      // Apply item stats to player character
      const updatedCharacter = {
        ...store.state.playerCharacter,
        class: characterClass,
        stats: newStats,
      };
      
      // Set current hp to the new max hp (base + item bonuses + class bonuses)
      const scaledStats = getScaledStats(newStats, 1, characterClass);
      const currentMaxHp = scaledStats.health;

      return {
        state: {
          ...store.state,
          playerCharacter: {
            ...updatedCharacter,
            hp: currentMaxHp,
          },
          selectedStartingItem: itemId,
          inventory: [{ itemId, quantity: 1 }],
          rerolls: initialRerolls,
        },
      };
    }),

  selectQuest: (questId: string, pathId: string) =>
    set((store) => ({
      state: {
        ...store.state,
        selectedQuest: { questId, pathId },
      },
    })),

  clearQuestSelection: () =>
    set((store) => ({
      state: {
        ...store.state,
        selectedQuest: null,
      },
    })),

  resetFloor: () =>
    set((store) => ({
      state: {
        ...store.state,
        currentFloor: 0,
      },
    })),

  setCurrentFloor: (floor: number) =>
    set((store) => ({
      state: {
        ...store.state,
        currentFloor: floor,
      },
    })),

  startBattle: (enemies: Character[]) =>
    set((store) => {
      const newFloor = store.state.currentFloor + 1;
      
      // Track battle won for profile
      if (newFloor > 1) {
        incrementBattlesWon();
      }
      
      return {
        state: {
          ...store.state,
          currentFloor: newFloor,
          playerCharacter: store.state.playerCharacter,
          enemyCharacters: enemies.map((enemy) => {
            // Scale enemy level based on floor progression
            const enemyLevel = calculateEnemyLevel(newFloor, enemy.tier || 'minion');
            const scaledStats = getScaledStats(enemy.stats, enemyLevel, enemy.class);
            
            return {
              ...enemy,
              level: enemyLevel,
              hp: scaledStats.health,
            };
          }),
        },
      };
    }),

  endBattle: () =>
    set((store) => {
      // Increment encounter count for persistent buffs using get()
      const incrementCount = useGameStore.getState().incrementEncounterCount;
      incrementCount();
      
      return {
        state: {
          ...store.state,
          enemyCharacters: [],
        },
      };
    }),

  addGold: (amount: number) =>
    set((store) => ({
      state: {
        ...store.state,
        gold: store.state.gold + amount,
      },
    })),

  addRerolls: (amount: number) =>
    set((store) => ({
      state: {
        ...store.state,
        rerolls: store.state.rerolls + amount,
      },
    })),

  useReroll: () => {
    let success = false;
    set((store) => {
      if (store.state.rerolls <= 0) {
        success = false;
        return store;
      }
      success = true;
      return {
        state: {
          ...store.state,
          rerolls: store.state.rerolls - 1,
        },
      };
    });
    return success;
  },

  addInventoryItem: (item: InventoryItem) =>
    set((store) => {
      const itemData = ITEM_DATABASE[item.itemId];
      if (!itemData) return store;

      const existing = store.state.inventory.find((i) => i.itemId === item.itemId);
      
      // Track item discovery for profile (only if it's a new item)
      if (!existing) {
        discoverItem(item.itemId);
      }
      
      // Apply item stats to player character - apply ALL item stats dynamically
      const updatedStats = { ...store.state.playerCharacter.stats };
      (Object.keys(itemData.stats) as Array<keyof typeof itemData.stats>).forEach(stat => {
        const itemValue = itemData.stats[stat];
        if (itemValue && typeof itemValue === 'number') {
          (updatedStats[stat] as number) = ((updatedStats[stat] as number) || 0) + itemValue;
        }
      });

      const updatedCharacter = {
        ...store.state.playerCharacter,
        stats: updatedStats,
      };

      // Preserve current HP when adding items - don't reset to max
      const newPlayerCharacter = {
        ...updatedCharacter,
        hp: store.state.playerCharacter.hp,
      };

      const updatedInventory = existing
        ? store.state.inventory.map((i) =>
            i.itemId === item.itemId ? { ...i, quantity: i.quantity + item.quantity } : i
          )
        : [...store.state.inventory, item];

      return {
        state: {
          ...store.state,
          playerCharacter: newPlayerCharacter,
          inventory: updatedInventory,
        },
      };
    }),

  removeInventoryItem: (itemId: string) =>
    set((store) => {
      const itemData = ITEM_DATABASE[itemId];
      if (!itemData) return store;

      const existing = store.state.inventory.find((i) => i.itemId === itemId);
      if (!existing) return store; // Item not in inventory

      // Remove item stats from player character
      const updatedStats = { ...store.state.playerCharacter.stats };
      (Object.keys(itemData.stats) as Array<keyof typeof itemData.stats>).forEach(stat => {
        const itemValue = itemData.stats[stat];
        if (itemValue && typeof itemValue === 'number') {
          (updatedStats[stat] as number) = Math.max(0, ((updatedStats[stat] as number) || 0) - itemValue);
        }
      });

      const updatedCharacter = {
        ...store.state.playerCharacter,
        stats: updatedStats,
        hp: store.state.playerCharacter.hp, // Preserve current HP
      };

      // Remove item from inventory
      const updatedInventory = store.state.inventory.filter((i) => i.itemId !== itemId);

      return {
        state: {
          ...store.state,
          inventory: updatedInventory,
          playerCharacter: updatedCharacter,
        },
      };
    }),

  consumeInventoryItem: (itemId: string) =>
    set((store) => {
      // Check if it's an elixir and apply buff before consuming
      if (itemId.startsWith('elixir_of_')) {
        // Apply the elixir buff through get() to avoid circular reference
        const applyBuff = useGameStore.getState().applyElixirBuff;
        applyBuff(itemId);
      }

      return {
        state: {
          ...store.state,
          inventory: store.state.inventory
            .map((item) =>
              item.itemId === itemId ? { ...item, quantity: item.quantity - 1 } : item
            )
            .filter((item) => item.quantity > 0),
        },
      };
    }),

  addExperience: (amount: number) =>
    set((store) => {
      const currentExp = store.state.playerCharacter.experience + amount;
      const currentLevel = store.state.playerCharacter.level;
      
      // Check for level up
      const levelUpResult = checkLevelUp(currentExp, currentLevel);
      
      if (levelUpResult) {
        // Player leveled up!
        const { newLevel, remainingExp } = levelUpResult;
        const levelsGained = newLevel - currentLevel;
        
        // Get stat boosts per level
        const statBoosts = getLevelUpStatBoosts();
        
        // Apply stat increases for each level gained
        const newStats = {
          ...store.state.playerCharacter.stats,
          health: store.state.playerCharacter.stats.health + (statBoosts.health * levelsGained),
          attackDamage: store.state.playerCharacter.stats.attackDamage + (statBoosts.attackDamage * levelsGained),
          abilityPower: store.state.playerCharacter.stats.abilityPower + (statBoosts.abilityPower * levelsGained),
          armor: store.state.playerCharacter.stats.armor + (statBoosts.armor * levelsGained),
          magicResist: store.state.playerCharacter.stats.magicResist + (statBoosts.magicResist * levelsGained),
        };
        
        // Calculate new max HP with class bonuses
        const oldMaxHp = getScaledStats(store.state.playerCharacter.stats, currentLevel, store.state.playerCharacter.class, []).health;
        const scaledStats = getScaledStats(newStats, newLevel, store.state.playerCharacter.class, []);
        const newMaxHp = scaledStats.health;
        
        // Calculate HP difference from stat/level increases
        const hpIncrease = newMaxHp - oldMaxHp;
        const newHp = Math.min(store.state.playerCharacter.hp + hpIncrease, newMaxHp);
        
        return {
          state: {
            ...store.state,
            playerCharacter: {
              ...store.state.playerCharacter,
              level: newLevel,
              experience: remainingExp,
              stats: newStats,
              hp: newHp, // Only heal by the HP increase amount
            },
          },
        };
      } else {
        // No level up, just add experience
        return {
          state: {
            ...store.state,
            playerCharacter: {
              ...store.state.playerCharacter,
              experience: currentExp,
            },
          },
        };
      }
    }),

  updatePlayerHp: (newHp: number) =>
    set((store) => {
      const scaledStats = getScaledStats(store.state.playerCharacter.stats, store.state.playerCharacter.level, store.state.playerCharacter.class);
      const maxHp = scaledStats.health;
      return {
        state: {
          ...store.state,
          playerCharacter: {
            ...store.state.playerCharacter,
            hp: Math.max(0, Math.min(newHp, maxHp)),
          },
        },
      };
    }),

  updateEnemyHp: (enemyIndex: number, newHp: number) =>
    set((store) => ({
      state: {
        ...store.state,
        enemyCharacters: store.state.enemyCharacters.map((enemy, idx) =>
          idx === enemyIndex
            ? { ...enemy, hp: Math.max(0, Math.min(newHp, enemy.stats.health)) }
            : enemy
        ),
      },
    })),

  resetRun: () =>
    set((store) => {
      // Check for Dark Seal unlock before resetting
      const maxAP = store.state.maxAbilityPowerReached;
      if (maxAP >= 150) {
        unlockItem('dark_seal');
      }
      
      // Track failed run for profile
      incrementRunsFailed();
      
      return {
        state: {
          playerCharacter: DEFAULT_PLAYER,
          enemyCharacters: [],
          inventory: [],
          gold: 0,
          rerolls: 5, // Start each run with 5 rerolls
          selectedRegion: null,
          currentFloor: 0,
          selectedStartingItem: null,
          selectedQuest: null,
          username: 'Summoner',
          // Reset region traversal
          originalStartingRegion: null,
          currentAct: 1,
        usedPaths: [],
        piltoverVisits: 0,
        completedActEndingRegions: [],
        // Reset shop state
        shopInventory: [],
        lastShopFloor: -1,
        // Reset run stats
        maxAbilityPowerReached: 0,
        // Reset persistent buffs
        persistentBuffs: [],
        encountersCompleted: 0,
      },
    };
  }),

  // Travel from one region to another
  travelToRegion: (fromRegion: Region, toRegion: Region) =>
    set((store) => {
      const pathKey = `${fromRegion}→${toRegion}`;
      const newUsedPaths = [...store.state.usedPaths, pathKey];
      const newPiltoverVisits = toRegion === 'piltover' ? store.state.piltoverVisits + 1 : store.state.piltoverVisits;
      
      // Track this connection in the profile
      discoverConnection(fromRegion, toRegion);
      
      return {
        state: {
          ...store.state,
          selectedRegion: toRegion,
          usedPaths: newUsedPaths,
          piltoverVisits: newPiltoverVisits,
          // Don't reset currentFloor here - it resets when starting a new battle
        },
      };
    }),

  // Complete an act by reaching an ending region
  completeAct: (endingRegion: Region) =>
    set((store) => ({
      state: {
        ...store.state,
        currentAct: store.state.currentAct + 1,
        usedPaths: [], // Reset used paths for new act
        completedActEndingRegions: [...store.state.completedActEndingRegions, endingRegion],
      },
    })),

  // Generate shop inventory (only if needed)
  generateShopInventory: () =>
    set((store) => {
      // Only generate if we haven't generated for this floor yet
      if (store.state.lastShopFloor === store.state.currentFloor) {
        return store; // Already generated for this floor
      }

      const region = store.state.selectedRegion || 'demacia';
      const currentAct = store.state.currentAct;
      const hasDarkSeal = store.state.inventory.some(i => i.itemId === 'dark_seal');
      
      // Calculate player's total magicFind stat
      const totalMagicFind = store.state.inventory.reduce((total, invItem) => {
        const item = ITEM_DATABASE[invItem.itemId];
        return total + (item?.stats?.magicFind || 0);
      }, 0);
      
      // Get region-specific pools for consumables only
      const shopPool = REGION_SHOP_POOLS[region];
      if (!shopPool) {
        console.error('No shop pool found for region:', region);
        return store;
      }

      // Helper: Generate random discount (10% to 90%, weighted toward lower)
      const generateDiscount = (): number => {
        const roll = Math.random();
        if (roll < 0.4) return Math.random() < 0.5 ? 10 : 20;
        else if (roll < 0.7) return Math.random() < 0.5 ? 30 : 40;
        else if (roll < 0.9) return Math.random() < 0.5 ? 50 : 60;
        else {
          const options = [70, 80, 90];
          return options[Math.floor(Math.random() * options.length)];
        }
      };

      // Helper: Pick random items from pool without duplicates
      const pickRandomItems = (pool: string[], count: number): string[] => {
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
      };

      // Build shop inventory using act-based rarity system
      // Generate 3 items based on act rarity pools + 2 consumables
      const generatedItems: string[] = [];
      const excludedIds: string[] = [];
      
      // Generate 3 main items using act-based rarity + magicFind
      for (let i = 0; i < 3; i++) {
        const item = getRandomShopItemByAct(currentAct, totalMagicFind, excludedIds);
        if (item) {
          generatedItems.push(item.id);
          excludedIds.push(item.id); // Avoid duplicates
        }
      }
      
      // Add consumables from region pool
      const consumables = pickRandomItems(shopPool.consumables, 2);
      
      let allItems = [...generatedItems, ...consumables];

      // Special case: If player has Dark Seal and Mejai's hasn't been generated, add chance for it
      if (hasDarkSeal && !allItems.includes('mejais_soulstealer')) {
        // 30% chance to replace a random non-consumable item with Mejai's
        if (Math.random() < 0.3 && generatedItems.length > 0) {
          const replaceIndex = Math.floor(Math.random() * generatedItems.length);
          allItems[replaceIndex] = 'mejais_soulstealer';
        }
      }

      // Random discount slot
      const discountSlotIndex = Math.floor(Math.random() * allItems.length);
      const discountPercent = generateDiscount();

      const newShopInventory = allItems.map((itemId, index) => ({
        itemId,
        hasDiscount: index === discountSlotIndex,
        discountPercent: index === discountSlotIndex ? discountPercent : 0,
        soldOut: false,
      }));

      return {
        state: {
          ...store.state,
          shopInventory: newShopInventory,
          lastShopFloor: store.state.currentFloor,
        },
      };
    }),

  // Manually reroll shop
  rerollShop: () =>
    set((store) => {
      const region = store.state.selectedRegion || 'demacia';
      const currentAct = store.state.currentAct;
      const hasDarkSeal = store.state.inventory.some(i => i.itemId === 'dark_seal');
      
      // Calculate player's total magicFind stat
      const totalMagicFind = store.state.inventory.reduce((total, invItem) => {
        const item = ITEM_DATABASE[invItem.itemId];
        return total + (item?.stats?.magicFind || 0);
      }, 0);
      
      // Get region-specific pools for consumables only
      const shopPool = REGION_SHOP_POOLS[region];
      if (!shopPool) {
        console.error('No shop pool found for region:', region);
        return store;
      }

      // Helper: Generate random discount
      const generateDiscount = (): number => {
        const roll = Math.random();
        if (roll < 0.4) return Math.random() < 0.5 ? 10 : 20;
        else if (roll < 0.7) return Math.random() < 0.5 ? 30 : 40;
        else if (roll < 0.9) return Math.random() < 0.5 ? 50 : 60;
        else {
          const options = [70, 80, 90];
          return options[Math.floor(Math.random() * options.length)];
        }
      };

      // Helper: Pick random items from pool without duplicates
      const pickRandomItems = (pool: string[], count: number): string[] => {
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
      };

      // Build new shop inventory using act-based rarity system
      const generatedItems: string[] = [];
      const excludedIds: string[] = [];
      
      // Generate 3 main items using act-based rarity + magicFind
      for (let i = 0; i < 3; i++) {
        const item = getRandomShopItemByAct(currentAct, totalMagicFind, excludedIds);
        if (item) {
          generatedItems.push(item.id);
          excludedIds.push(item.id); // Avoid duplicates
        }
      }
      
      // Add consumables from region pool
      const consumables = pickRandomItems(shopPool.consumables, 2);
      
      let allItems = [...generatedItems, ...consumables];

      // Special case: If player has Dark Seal and Mejai's hasn't been generated, add chance for it
      if (hasDarkSeal && !allItems.includes('mejais_soulstealer')) {
        // 30% chance to replace a random non-consumable item with Mejai's
        if (Math.random() < 0.3 && generatedItems.length > 0) {
          const replaceIndex = Math.floor(Math.random() * generatedItems.length);
          allItems[replaceIndex] = 'mejais_soulstealer';
        }
      }

      const discountSlotIndex = Math.floor(Math.random() * allItems.length);
      const discountPercent = generateDiscount();

      const newShopInventory = allItems.map((itemId, index) => ({
        itemId,
        hasDiscount: index === discountSlotIndex,
        discountPercent: index === discountSlotIndex ? discountPercent : 0,
        soldOut: false,
      }));

      return {
        state: {
          ...store.state,
          shopInventory: newShopInventory,
        },
      };
    }),

  // Mark shop item as sold out
  markShopItemSold: (slotIndex: number) =>
    set((store) => {
      const updatedInventory = [...store.state.shopInventory];
      updatedInventory[slotIndex] = { ...updatedInventory[slotIndex], soldOut: true };
      return {
        state: {
          ...store.state,
          shopInventory: updatedInventory,
        },
      };
    }),

  // Update max ability power if current is higher
  updateMaxAbilityPower: (currentAP: number) =>
    set((store) => {
      if (currentAP > store.state.maxAbilityPowerReached) {
        return {
          state: {
            ...store.state,
            maxAbilityPowerReached: currentAP,
          },
        };
      }
      return store;
    }),

  // Save current run state to localStorage
  saveRun: () => {
    const state = useGameStore.getState().state;
    const profileId = getActiveProfileId();
    try {
      const runData = {
        ...state,
        profileId, // Include the active profile ID
      };
      localStorage.setItem('savedRun', JSON.stringify(runData));
      console.log('Run saved successfully for profile', profileId);
    } catch (error) {
      console.error('Failed to save run:', error);
    }
  },

  // Load saved run state from localStorage
  loadRun: () => {
    try {
      const savedRun = localStorage.getItem('savedRun');
      if (savedRun) {
        const loadedState = JSON.parse(savedRun);
        set({ state: loadedState });
        console.log('Run loaded successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load run:', error);
      return false;
    }
  },

  // Clear saved run from localStorage
  clearSavedRun: () => {
    try {
      localStorage.removeItem('savedRun');
      console.log('Saved run cleared');
    } catch (error) {
      console.error('Failed to clear saved run:', error);
    }
  },

  // Increment encounter counter and decay encounter-based buffs
  incrementEncounterCount: () =>
    set((store) => {
      const newCount = store.state.encountersCompleted + 1;
      
      // Decay encounter-based buffs
      const updatedBuffs = store.state.persistentBuffs
        .map(buff => {
          if (buff.durationType === 'encounters' && buff.encountersRemaining !== undefined) {
            return {
              ...buff,
              encountersRemaining: buff.encountersRemaining - 1,
            };
          }
          return buff;
        })
        .filter(buff => {
          // Remove encounter buffs that have expired
          if (buff.durationType === 'encounters') {
            return buff.encountersRemaining && buff.encountersRemaining > 0;
          }
          return true; // Keep all other buffs
        });

      console.log(`🔢 Encounter ${newCount} completed. Active persistent buffs: ${updatedBuffs.length}`);
      
      return {
        state: {
          ...store.state,
          encountersCompleted: newCount,
          persistentBuffs: updatedBuffs,
        },
      };
    }),

  // Apply an elixir buff
  applyElixirBuff: (elixirId: string) =>
    set((store) => {
      const elixir = ITEM_DATABASE[elixirId];
      if (!elixir || !elixir.consumable) {
        console.error(`Invalid elixir: ${elixirId}`);
        return store;
      }

      let newBuffs: CombatBuff[] = [];

      // Apply specific elixir effects
      if (elixirId === 'elixir_of_iron') {
        newBuffs = [
          {
            id: 'elixir_iron_health',
            name: 'Elixir of Iron (Health)',
            stat: 'health',
            amount: 300,
            duration: 999, // Dummy duration for turn-based system
            durationType: 'encounters',
            encountersRemaining: 15,
          },
          {
            id: 'elixir_iron_tenacity',
            name: 'Elixir of Iron (Tenacity)',
            stat: 'tenacity',
            amount: 250,
            duration: 999,
            durationType: 'encounters',
            encountersRemaining: 15,
          },
          {
            id: 'elixir_iron_movespeed',
            name: 'Elixir of Iron (Speed)',
            stat: 'movementSpeed',
            amount: 150,
            duration: 999,
            durationType: 'encounters',
            encountersRemaining: 15,
          },
        ];
      } else if (elixirId === 'elixir_of_sorcery') {
        newBuffs = [
          {
            id: 'elixir_sorcery_ap',
            name: 'Elixir of Sorcery (AP)',
            stat: 'abilityPower',
            amount: 50,
            duration: 999,
            durationType: 'encounters',
            encountersRemaining: 15,
          },
          {
            id: 'elixir_sorcery_mf',
            name: 'Elixir of Sorcery (Magic Find)',
            stat: 'magicFind',
            amount: 10,
            duration: 999,
            durationType: 'encounters',
            encountersRemaining: 15,
          },
          {
            id: 'elixir_sorcery_true',
            name: 'Elixir of Sorcery (True Damage)',
            stat: 'trueDamage',
            amount: 25,
            duration: 999,
            durationType: 'encounters',
            encountersRemaining: 15,
          },
        ];
      } else if (elixirId === 'elixir_of_wrath') {
        newBuffs = [
          {
            id: 'elixir_wrath_ad',
            name: 'Elixir of Wrath (AD)',
            stat: 'attackDamage',
            amount: 30,
            duration: 999,
            durationType: 'encounters',
            encountersRemaining: 15,
          },
          {
            id: 'elixir_wrath_lifesteal',
            name: 'Elixir of Wrath (Lifesteal)',
            stat: 'lifeSteal',
            amount: 12,
            duration: 999,
            durationType: 'encounters',
            encountersRemaining: 15,
          },
        ];
      }

      console.log(`⚗️ Applied ${elixir.name} - ${newBuffs.length} buffs for 15 encounters`);

      return {
        state: {
          ...store.state,
          persistentBuffs: [...store.state.persistentBuffs, ...newBuffs],
        },
      };
    }),

  // Get current persistent buffs
  getPersistentBuffs: (): CombatBuff[] => {
    return useGameStore.getState().state.persistentBuffs;
  },
}));

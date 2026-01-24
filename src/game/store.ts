import { create } from 'zustand';
import { Character, InventoryItem, Region } from './types';
import { DEFAULT_STATS } from './statsSystem';
import { STARTING_ITEMS, ITEM_DATABASE, getRandomShopItemByAct } from './items';
import { checkLevelUp, getLevelUpStatBoosts } from './experienceSystem';
import { incrementBattlesWon, incrementRunsFailed, discoverItem, discoverConnection, getActiveProfileId, visitRegion, unlockItem } from './profileSystem';
import { REGION_SHOP_POOLS } from './rewardPool';
import { CombatBuff } from './itemSystem';
import { spawnEnemies, deepCopyEnemies } from './battle/enemySpawning';
import { calculatePlayerMaxHp, applyItemToPlayer, removeItemFromPlayer, applyLevelUp } from './battle/playerStats';
import { Language } from '../i18n';
import { AudioSettings, audioManager } from './audioManager';

/**
 * TODO: Implement Region Revisit Penalty System
 * 
 * When a region is visited multiple times in a run:
 * - 2nd visit: +2 levels, +1 item, 50% gold, 60% drops, 70% XP
 * - 3rd visit: +4 levels, +2 items, 25% gold, 30% drops, 40% XP
 * - 4+ visits: +6 - 8 - 10 levels, max items, 10% gold/drops, 20% XP
 * 
 * Implementation:
 * 1. Count occurrences of current region in visitedRegionsThisRun
 * 2. Apply stat multipliers in startBattle() based on visit count
 * 3. Apply reward penalties in battle victory handlers
 * 4. Show warning UI in RegionSelection for revisited regions
 * 
 * See DIFFICULTY_SCALING.md for full design document
 */

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
    originalEnemyQueue: Character[]; // Unprocessed original enemies for future encounters
    inventory: InventoryItem[];
    gold: number;
    rerolls: number; // Global reroll currency for the entire run
    selectedRegion: Region | null;
    currentFloor: number;
    selectedStartingItem: string | null;
    selectedQuest: { questId: string; pathId: string } | null;
    username: string;
    // Region traversal state
    visitedRegionsThisRun: Region[]; // Track the path taken during this run (in order)
    originalStartingRegion: Region | null; // The very first region chosen at run start
    // Shop state
    shopInventory: ShopSlot[];
    lastShopFloor: number; // Track when shop was last generated
    // Run stats for unlock tracking
    maxAbilityPowerReached: number; // Highest AP reached in current run
    // Persistent buff system
    persistentBuffs: CombatBuff[]; // Buffs that persist across encounters (e.g., elixirs)
    encountersCompleted: number; // Total encounters completed in current run
    // Weapons & Spells System
    weapons: string[]; // Up to 3 weapon IDs
    spells: string[]; // Up to 5 spell IDs
    equippedWeaponIndex: number; // Index of currently equipped weapon (0-2)
    equippedSpellIndex: number; // Index of currently equipped spell (0-4)
    spellCooldowns: Record<string, number>; // Spell ID -> turns remaining until usable
    // Post-Region Choice System
    showPostRegionChoice: boolean; // Show post-region choice UI after completing region
    completedRegion: Region | null; // Region just completed (for random events)
    postRegionChoiceComplete: boolean; // Flag set to true when user makes a choice, App.tsx watches this
    // Language/Settings
    currentLanguage: Language; // Current selected language
    showSettings: boolean; // Show settings modal
    audioSettings: AudioSettings; // Audio volume settings
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
  // Weapons & Spells management
  equipWeapon: (index: number) => void; // Switch to weapon at index (0-2)
  equipSpell: (index: number) => void; // Switch to spell at index (0-4)
  addWeapon: (weaponId: string) => void; // Add weapon to collection (max 3)
  addSpell: (spellId: string) => void; // Add spell to collection (max 5)
  removeWeapon: (index: number) => void; // Remove weapon from collection
  removeSpell: (index: number) => void; // Remove spell from collection
  // Post-Region Choice methods
  setCompletedRegion: (region: Region) => void; // Set completed region for travel actions
  showPostRegionChoiceScreen: (region: Region) => void; // Show post-region choice UI
  hidePostRegionChoiceScreen: () => void; // Hide post-region choice UI
  applyRestChoice: () => void; // Rest and heal to full HP
  clearPostRegionCompletion: () => void; // Clear completion flag after navigation
  // Language/Settings methods
  setLanguage: (language: Language) => void; // Change language
  toggleSettings: () => void; // Show/hide settings modal
  // Audio methods
  setMasterVolume: (volume: number) => void;
  toggleMasterVolume: () => void;
  setSfxVolume: (volume: number) => void;
  toggleSfxVolume: () => void;
  setMusicVolume: (volume: number) => void;
  toggleMusicVolume: () => void;
  setVoiceVolume: (volume: number) => void;
  toggleVoiceVolume: () => void;
}

export const useGameStore = create<GameStoreState>((set) => ({
  state: {
    playerCharacter: DEFAULT_PLAYER,
    enemyCharacters: [],
    originalEnemyQueue: [],
    inventory: [],
    gold: 0,
    rerolls: 5, // Start with 5 rerolls per run
    selectedRegion: null,
    currentFloor: 0,
    selectedStartingItem: null,
    selectedQuest: null,
    username: 'Summoner',
    // Region traversal initialization
    visitedRegionsThisRun: [],
    originalStartingRegion: null,
    // Shop initialization
    shopInventory: [],
    lastShopFloor: -1,
    // Run stats
    maxAbilityPowerReached: 0,
    // Persistent buffs
    persistentBuffs: [],
    encountersCompleted: 0,
    // Weapons & Spells System
    weapons: ['test_weapon'], // Player starts test weapon
    spells: ['test_spell'], // Start with TestSpell
    equippedWeaponIndex: 0, // First weapon equipped
    equippedSpellIndex: 0, // First spell equipped
    spellCooldowns: {}, // Track spell cooldowns
    // Language/Settings
    currentLanguage: 'en',
    showSettings: false,
    audioSettings: {
      masterVolume: 70,
      masterEnabled: true,
      sfxVolume: 80,
      sfxEnabled: true,
      musicVolume: 60,
      musicEnabled: true,
      voiceVolume: 75,
      voiceEnabled: true,
    },
    // Post-Region Choice System
    showPostRegionChoice: false,
    completedRegion: null,
    postRegionChoiceComplete: false,
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
      
      // Add to visited regions if not first visit
      const newVisitedRegions = store.state.originalStartingRegion 
        ? [...store.state.visitedRegionsThisRun, region]
        : [region];
      
      return {
        state: {
          ...store.state,
          selectedRegion: region,
          visitedRegionsThisRun: newVisitedRegions,
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
      if (item.id === 'world_atlas') characterClass = 'juggernaut';

      // Set rerolls: 10 for world_atlas, 5 for others
      const initialRerolls = item.id === 'world_atlas' ? 10 : 5;

      // Update character class
      let updatedCharacter: Character = {
        ...store.state.playerCharacter,
        class: characterClass,
      };
      
      // Apply starting item stats
      updatedCharacter = applyItemToPlayer(updatedCharacter, itemId);
      
      // Calculate max HP with class bonuses (no level multiplier)
      const currentMaxHp = calculatePlayerMaxHp(updatedCharacter);

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
      
      // Reduce spell cooldowns by 1 turn (time passes between encounters)
      const updatedCooldowns: Record<string, number> = {};
      for (const [spellId, cooldown] of Object.entries(store.state.spellCooldowns)) {
        if (cooldown > 1) {
          updatedCooldowns[spellId] = cooldown - 1;
        }
      }
      
      // Use battle system to spawn and scale enemies
      const currentRegion = store.state.selectedRegion || 'demacia';
      const spawnedEnemies = spawnEnemies(
        enemies,
        newFloor,
        store.state.encountersCompleted,
        currentRegion
      );
      
      return {
        state: {
          ...store.state,
          currentFloor: newFloor,
          spellCooldowns: updatedCooldowns,
          playerCharacter: store.state.playerCharacter,
          originalEnemyQueue: deepCopyEnemies(enemies),
          enemyCharacters: spawnedEnemies,
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
      
      // Apply item using battle system
      const updatedCharacter = applyItemToPlayer(store.state.playerCharacter, item.itemId);

      const updatedInventory = existing
        ? store.state.inventory.map((i) =>
            i.itemId === item.itemId ? { ...i, quantity: i.quantity + item.quantity } : i
          )
        : [...store.state.inventory, item];

      return {
        state: {
          ...store.state,
          playerCharacter: updatedCharacter,
          inventory: updatedInventory,
        },
      };
    }),

  removeInventoryItem: (itemId: string) =>
    set((store) => {
      const itemData = ITEM_DATABASE[itemId];
      if (!itemData) return store;

      const existing = store.state.inventory.find((i) => i.itemId === itemId);
      if (!existing) return store;

      // Remove item using battle system
      const updatedCharacter = removeItemFromPlayer(store.state.playerCharacter, itemId);

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
        const { newLevel, remainingExp } = levelUpResult;
        const statBoosts = getLevelUpStatBoosts();
        
        // Apply level up using battle system (no 5% multiplier, only class bonuses)
        const updatedCharacter = applyLevelUp(
          store.state.playerCharacter,
          newLevel,
          statBoosts
        );
        
        return {
          state: {
            ...store.state,
            playerCharacter: {
              ...updatedCharacter,
              experience: remainingExp,
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
      const maxHp = calculatePlayerMaxHp(store.state.playerCharacter);
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
          originalEnemyQueue: [],
          inventory: [],
          gold: 0,
          rerolls: 5,
          selectedRegion: null,
          currentFloor: 0,
          selectedStartingItem: null,
          selectedQuest: null,
          username: 'Summoner',
          visitedRegionsThisRun: [],
          originalStartingRegion: null,
          shopInventory: [],
          lastShopFloor: -1,
          maxAbilityPowerReached: 0,
          persistentBuffs: [],
          encountersCompleted: 0,
          weapons: ['test_weapon'], // Reset to default starter weapon
          spells: ['test_spell'], // Reset to default starter spells
          equippedWeaponIndex: 0,
          equippedSpellIndex: 0,
          spellCooldowns: {},
          showPostRegionChoice: false,
          postRegionChoiceComplete: false,
          completedRegion: null,
          currentLanguage: store.state.currentLanguage, // Persist language
          showSettings: false,
          audioSettings: store.state.audioSettings, // Persist audio settings
        },
      };
    }),

  // Travel from one region to another
  travelToRegion: (fromRegion: Region, toRegion: Region) =>
    set((store) => {
      // Track this connection in the profile
      discoverConnection(fromRegion, toRegion);
      
      return {
        state: {
          ...store.state,
          selectedRegion: toRegion,
          visitedRegionsThisRun: [...store.state.visitedRegionsThisRun, toRegion],
          // Don't reset currentFloor here - it resets when starting a new battle
        },
      };
    }),

  // Generate shop inventory (only if needed)
  generateShopInventory: () =>
    set((store) => {
      // Only generate if we haven't generated for this floor yet
      if (store.state.lastShopFloor === store.state.currentFloor) {
        return store; // Already generated for this floor
      }

      const region = store.state.selectedRegion || 'demacia';
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

      // Build shop inventory using floor-based rarity system
      // Generate 3 items based on floor rarity pools + 2 consumables
      const generatedItems: string[] = [];
      const excludedIds: string[] = [];
      
      // Use floor as progression indicator (Acts removed)
      const progressionTier = Math.floor(store.state.currentFloor / 10) + 1; // Floor 1-9 = Tier 1, 10-19 = Tier 2, etc.
      
      // Generate 3 main items using floor-based rarity + magicFind
      for (let i = 0; i < 3; i++) {
        const item = getRandomShopItemByAct(progressionTier, totalMagicFind, excludedIds);
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

      // Build new shop inventory using floor-based rarity system
      const generatedItems: string[] = [];
      const excludedIds: string[] = [];
      
      // Use floor as progression indicator (Acts removed)
      const progressionTier = Math.floor(store.state.currentFloor / 10) + 1; // Floor 1-9 = Tier 1, 10-19 = Tier 2, etc.
      
      // Generate 3 main items using floor-based rarity + magicFind
      for (let i = 0; i < 3; i++) {
        const item = getRandomShopItemByAct(progressionTier, totalMagicFind, excludedIds);
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
  // Weapons & Spells Management
  equipWeapon: (index: number) =>
    set((store) => {
      if (index < 0 || index >= store.state.weapons.length) {
        console.warn(`Invalid weapon index: ${index}`);
        return store;
      }
      return {
        state: {
          ...store.state,
          equippedWeaponIndex: index,
        },
      };
    }),

  equipSpell: (index: number) =>
    set((store) => {
      if (index < 0 || index >= store.state.spells.length) {
        console.warn(`Invalid spell index: ${index}`);
        return store;
      }
      return {
        state: {
          ...store.state,
          equippedSpellIndex: index,
        },
      };
    }),

  addWeapon: (weaponId: string) =>
    set((store) => {
      if (store.state.weapons.length >= 3) {
        console.warn('Cannot carry more than 3 weapons');
        return store;
      }
      return {
        state: {
          ...store.state,
          weapons: [...store.state.weapons, weaponId],
        },
      };
    }),

  addSpell: (spellId: string) =>
    set((store) => {
      if (store.state.spells.length >= 5) {
        console.warn('Cannot carry more than 5 spells');
        return store;
      }
      return {
        state: {
          ...store.state,
          spells: [...store.state.spells, spellId],
        },
      };
    }),

  removeWeapon: (index: number) =>
    set((store) => {
      if (index < 0 || index >= store.state.weapons.length) {
        console.warn(`Invalid weapon index: ${index}`);
        return store;
      }
      const newWeapons = store.state.weapons.filter((_, i) => i !== index);
      const newEquippedIndex = store.state.equippedWeaponIndex >= newWeapons.length 
        ? Math.max(0, newWeapons.length - 1)
        : store.state.equippedWeaponIndex;
      
      return {
        state: {
          ...store.state,
          weapons: newWeapons,
          equippedWeaponIndex: newEquippedIndex,
        },
      };
    }),

  removeSpell: (index: number) =>
    set((store) => {
      if (index < 0 || index >= store.state.spells.length) {
        console.warn(`Invalid spell index: ${index}`);
        return store;
      }
      const newSpells = store.state.spells.filter((_, i) => i !== index);
      const newEquippedIndex = store.state.equippedSpellIndex >= newSpells.length 
        ? Math.max(0, newSpells.length - 1)
        : store.state.equippedSpellIndex;
      
      return {
        state: {
          ...store.state,
          spells: newSpells,
          equippedSpellIndex: newEquippedIndex,
        },
      };
    }),

  // Post-Region Choice Methods
  setCompletedRegion: (region: Region) =>
    set((store) => ({
      state: {
        ...store.state,
        completedRegion: region,
      },
    })),

  showPostRegionChoiceScreen: (region: Region) =>
    set((store) => ({
      state: {
        ...store.state,
        showPostRegionChoice: true,
        completedRegion: region,
      },
    })),

  hidePostRegionChoiceScreen: () =>
    set((store) => ({
      state: {
        ...store.state,
        showPostRegionChoice: false,
        postRegionChoiceComplete: true, // Signal that user made a choice
        completedRegion: null,
      },
    })),

  applyRestChoice: () =>
    set((store) => {
      const maxHp = calculatePlayerMaxHp(store.state.playerCharacter);
      return {
        state: {
          ...store.state,
          playerCharacter: {
            ...store.state.playerCharacter,
            hp: maxHp,
          },
          postRegionChoiceComplete: true, // Signal that user made a choice
          showPostRegionChoice: false,
          // Don't clear completedRegion - let it persist until region selection is complete
        },
      };
    }),

  clearPostRegionCompletion: () =>
    set((store) => ({
      state: {
        ...store.state,
        postRegionChoiceComplete: false,
      },
    })),

  // Language/Settings methods
  setLanguage: (language: Language) =>
    set((store) => ({
      state: {
        ...store.state,
        currentLanguage: language,
      },
    })),

  toggleSettings: () =>
    set((store) => ({
      state: {
        ...store.state,
        showSettings: !store.state.showSettings,
      },
    })),

  // Audio methods
  setMasterVolume: (volume: number) =>
    set((store) => {
      const newSettings = { ...store.state.audioSettings, masterVolume: volume };
      audioManager.updateSettings(newSettings);
      return {
        state: {
          ...store.state,
          audioSettings: newSettings,
        },
      };
    }),

  toggleMasterVolume: () =>
    set((store) => {
      const newSettings = { ...store.state.audioSettings, masterEnabled: !store.state.audioSettings.masterEnabled };
      audioManager.updateSettings(newSettings);
      return {
        state: {
          ...store.state,
          audioSettings: newSettings,
        },
      };
    }),

  setSfxVolume: (volume: number) =>
    set((store) => {
      const newSettings = { ...store.state.audioSettings, sfxVolume: volume };
      audioManager.updateSettings(newSettings);
      return {
        state: {
          ...store.state,
          audioSettings: newSettings,
        },
      };
    }),

  toggleSfxVolume: () =>
    set((store) => {
      const newSettings = { ...store.state.audioSettings, sfxEnabled: !store.state.audioSettings.sfxEnabled };
      audioManager.updateSettings(newSettings);
      return {
        state: {
          ...store.state,
          audioSettings: newSettings,
        },
      };
    }),

  setMusicVolume: (volume: number) =>
    set((store) => {
      const newSettings = { ...store.state.audioSettings, musicVolume: volume };
      audioManager.updateSettings(newSettings);
      return {
        state: {
          ...store.state,
          audioSettings: newSettings,
        },
      };
    }),

  toggleMusicVolume: () =>
    set((store) => {
      const newSettings = { ...store.state.audioSettings, musicEnabled: !store.state.audioSettings.musicEnabled };
      audioManager.updateSettings(newSettings);
      return {
        state: {
          ...store.state,
          audioSettings: newSettings,
        },
      };
    }),

  setVoiceVolume: (volume: number) =>
    set((store) => {
      const newSettings = { ...store.state.audioSettings, voiceVolume: volume };
      audioManager.updateSettings(newSettings);
      return {
        state: {
          ...store.state,
          audioSettings: newSettings,
        },
      };
    }),

  toggleVoiceVolume: () =>
    set((store) => {
      const newSettings = { ...store.state.audioSettings, voiceEnabled: !store.state.audioSettings.voiceEnabled };
      audioManager.updateSettings(newSettings);
      return {
        state: {
          ...store.state,
          audioSettings: newSettings,
        },
      };
    }),
}));

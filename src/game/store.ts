import { create } from 'zustand';
import { Character, InventoryItem, Region } from './types';
import { DEFAULT_STATS, getScaledStats } from './statsSystem';
import { STARTING_ITEMS, ITEM_DATABASE } from './items';
import { checkLevelUp, getLevelUpStatBoosts, getExpRequiredForLevel, calculateEnemyLevel } from './experienceSystem';

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
  };
  selectRegion: (region: Region) => void;
  selectStartingItem: (itemId: string) => void;
  selectQuest: (questId: string, pathId: string) => void;
  clearQuestSelection: () => void;
  resetFloor: () => void; // Reset floor counter when starting a new quest
  startBattle: (enemies: Character[]) => void;
  endBattle: () => void;
  addGold: (amount: number) => void;
  addRerolls: (amount: number) => void;
  useReroll: () => boolean; // Returns true if successful, false if no rerolls left
  addInventoryItem: (item: InventoryItem) => void;
  consumeInventoryItem: (itemId: string) => void;
  addExperience: (amount: number) => void;
  setUsername: (username: string) => void;
  updatePlayerHp: (newHp: number) => void;
  updateEnemyHp: (enemyIndex: number, newHp: number) => void;
  resetRun: () => void;
  // Region traversal methods
  travelToRegion: (fromRegion: Region, toRegion: Region) => void;
  completeAct: (endingRegion: Region) => void;
}

export const useGameStore = create<GameStoreState>((set) => ({
  state: {
    playerCharacter: DEFAULT_PLAYER,
    enemyCharacters: [],
    inventory: [],
    gold: 0,
    rerolls: 3, // Start with 3 rerolls per run
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
    set((store) => ({
      state: {
        ...store.state,
        selectedRegion: region,
        // Set originalStartingRegion if this is the first region selection
        originalStartingRegion: store.state.originalStartingRegion || region,
      },
    })),

  selectStartingItem: (itemId: string) =>
    set((store) => {
      const item = STARTING_ITEMS.find((i) => i.id === itemId);
      if (!item) return store;

      // Determine class based on item
      let characterClass: 'juggernaut' | 'mage' | 'vanguard' = 'juggernaut';
      if (item.id === 'dorans_ring') characterClass = 'mage';
      if (item.id === 'dorans_shield') characterClass = 'vanguard';
      if (item.id === 'dorans_blade') characterClass = 'juggernaut';

      // Create new stats with item bonuses applied
      const newStats = {
        ...store.state.playerCharacter.stats,
        health: store.state.playerCharacter.stats.health + (item.stats.health || 0),
        attackDamage: store.state.playerCharacter.stats.attackDamage + (item.stats.attackDamage || 0),
        abilityPower: store.state.playerCharacter.stats.abilityPower + (item.stats.abilityPower || 0),
        armor: store.state.playerCharacter.stats.armor + (item.stats.armor || 0),
        magicResist: store.state.playerCharacter.stats.magicResist + (item.stats.magicResist || 0),
        attackSpeed: store.state.playerCharacter.stats.attackSpeed + (item.stats.attackSpeed || 0),
        lifeSteal: store.state.playerCharacter.stats.lifeSteal + (item.stats.lifeSteal || 0),
      };

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

  startBattle: (enemies: Character[]) =>
    set((store) => {
      const newFloor = store.state.currentFloor + 1;
      
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
    set((store) => ({
      state: {
        ...store.state,
        enemyCharacters: [],
      },
    })),

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
      
      // Apply item stats to player character
      const updatedCharacter = {
        ...store.state.playerCharacter,
        stats: {
          ...store.state.playerCharacter.stats,
          health: store.state.playerCharacter.stats.health + (itemData.stats.health || 0),
          attackDamage: store.state.playerCharacter.stats.attackDamage + (itemData.stats.attackDamage || 0),
          abilityPower: store.state.playerCharacter.stats.abilityPower + (itemData.stats.abilityPower || 0),
          armor: store.state.playerCharacter.stats.armor + (itemData.stats.armor || 0),
          magicResist: store.state.playerCharacter.stats.magicResist + (itemData.stats.magicResist || 0),
          attackSpeed: store.state.playerCharacter.stats.attackSpeed + (itemData.stats.attackSpeed || 0),
          lifeSteal: store.state.playerCharacter.stats.lifeSteal + (itemData.stats.lifeSteal || 0),
        },
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

  consumeInventoryItem: (itemId: string) =>
    set((store) => ({
      state: {
        ...store.state,
        inventory: store.state.inventory
          .map((item) =>
            item.itemId === itemId ? { ...item, quantity: item.quantity - 1 } : item
          )
          .filter((item) => item.quantity > 0),
      },
    })),

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
        const scaledStats = getScaledStats(newStats, newLevel, store.state.playerCharacter.class, []);
        const maxHp = scaledStats.health;
        
        // Heal player to full on level up
        return {
          state: {
            ...store.state,
            playerCharacter: {
              ...store.state.playerCharacter,
              level: newLevel,
              experience: remainingExp,
              stats: newStats,
              hp: maxHp, // Full heal on level up!
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
    set(() => ({
      state: {
        playerCharacter: DEFAULT_PLAYER,
        enemyCharacters: [],
        inventory: [],
        gold: 0,
        rerolls: 3, // Start each run with 3 rerolls
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
      },
    })),

  // Travel from one region to another
  travelToRegion: (fromRegion: Region, toRegion: Region) =>
    set((store) => {
      const pathKey = `${fromRegion}→${toRegion}`;
      const newUsedPaths = [...store.state.usedPaths, pathKey];
      const newPiltoverVisits = toRegion === 'piltover' ? store.state.piltoverVisits + 1 : store.state.piltoverVisits;
      
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
}));

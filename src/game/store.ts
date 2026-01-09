import { create } from 'zustand';
import { Character, InventoryItem, Region } from './types';
import { DEFAULT_STATS, getScaledStats } from './statsSystem';
import { STARTING_ITEMS, ITEM_DATABASE } from './items';

// Default player character
const DEFAULT_PLAYER: Character = {
  id: 'summoner',
  name: 'Summoner',
  role: 'summoner',
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
    selectedRegion: Region | null;
    currentFloor: number;
    selectedStartingItem: string | null;
    selectedQuest: { questId: string; pathId: string } | null;
    username: string;
  };
  selectRegion: (region: Region) => void;
  selectStartingItem: (itemId: string) => void;
  selectQuest: (questId: string, pathId: string) => void;
  clearQuestSelection: () => void;
  startBattle: (enemies: Character[]) => void;
  endBattle: () => void;
  addGold: (amount: number) => void;
  addInventoryItem: (item: InventoryItem) => void;
  setUsername: (username: string) => void;
  updatePlayerHp: (newHp: number) => void;
  updateEnemyHp: (enemyIndex: number, newHp: number) => void;
  resetRun: () => void;
}

export const useGameStore = create<GameStoreState>((set) => ({
  state: {
    playerCharacter: DEFAULT_PLAYER,
    enemyCharacters: [],
    inventory: [],
    gold: 0,
    selectedRegion: null,
    currentFloor: 0,
    selectedStartingItem: null,
    selectedQuest: null,
    username: 'Summoner',
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

  startBattle: (enemies: Character[]) =>
    set((store) => {
      return {
        state: {
          ...store.state,
          currentFloor: store.state.currentFloor + 1,
          playerCharacter: store.state.playerCharacter,
          enemyCharacters: enemies.map((enemy) => {
            const scaledStats = getScaledStats(enemy.stats, enemy.level, enemy.class);
            return {
              ...enemy,
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
        selectedRegion: null,
        currentFloor: 0,
        selectedStartingItem: null,
        selectedQuest: null,
        username: 'Summoner',
      },
    })),
}));

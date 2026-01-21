import { CharacterStats } from './statsSystem';

export type Region = 
  | 'demacia' 
  | 'ionia' 
  | 'shurima' 
  | 'noxus' 
  | 'freljord' 
  | 'zaun' 
  | 'ixtal' 
  | 'bandle_city' 
  | 'bilgewater' 
  | 'piltover' 
  | 'shadow_isles' 
  | 'void' 
  | 'targon'
  | 'camavor'
  | 'ice_sea'
  | 'marai_territory';
export type EnemyTier = 'minion' | 'elite' | 'champion' | 'boss' | 'legend';
export type CharacterClass = 'mage' | 'vanguard' | 'warden' | 'juggernaut' | 'skirmisher' | 'assassin' | 'marksman' | 'enchanter';

export interface Character {
  id: string;
  name: string;
  region?: Region;
  role: 'enemy' | 'player';
  class: CharacterClass;
  tier?: EnemyTier; // Enemy tier for loot determination
  faction?: string; // Optional faction (e.g., 'guard', 'beast' for Demacia enemies)
  hp: number;
  maxHp?: never; // Deprecated: use stats.health instead
  abilities: Ability[];
  level: number;
  experience: number;
  stats: CharacterStats;
  inventory?: InventoryItem[]; // Optional inventory for displaying equipped items
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  cost: number; // resource cost (mana, energy, etc)
  damage?: number;
  healing?: number;
  cooldown: number;
}

export interface ItemData {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  stats: Record<string, number>;
  passive?: string;
  classes?: CharacterClass[]; // Classes that can use this item (empty = all classes)
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

export interface GameState {
  currentFloor: number;
  selectedRegion: Region | null;
  completedRegions: Region[];
  visitedRegionsThisRun: Region[]; // Track path taken during this run (in order)
  currentTier: EnemyTier;
  playerCharacter: Character;
  enemyCharacters: Character[];
  currentBattle: Battle | null;
  inventory: InventoryItem[];
  equippedItems: string[];
  gold: number;
  experiencePoints: number;
  selectedQuestId: string | null;
  selectedQuestPathId: string | null;
  startingItemSelected: boolean;
  // Weapons & Spells System
  weapons: string[]; // Up to 3 weapon IDs
  spells: string[]; // Up to 5 spell IDs
  equippedWeaponIndex: number; // Index of currently equipped weapon (0-2)
  equippedSpellIndex: number; // Index of currently equipped spell (0-4)
  spellCooldowns: Record<string, number>; // Spell ID -> turns remaining until usable
}

export interface Battle {
  playerTeam: Character[];
  enemyTeam: Character[];
  currentTurn: 'player' | 'enemy';
  round: number;
  defeatedEnemy?: any;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'passive';
  effect: Record<string, any>;
}

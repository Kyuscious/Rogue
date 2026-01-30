/**
 * Event Type Definitions
 * Defines the structure for all game events
 */

export type EventType = 'encounter' | 'visual_novel' | 'mini_game' | 'treasure' | 'curse' | 'dialogue';

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  
  // Event-specific data
  // For encounters: enemy info
  // For visual novel: choice options
  // For mini-games: game rules
  // For treasure: reward info
  // For curse: curse details
  data?: Record<string, any>;
  
  // Region restrictions (empty = available everywhere)
  restrictedToRegions?: string[];
  // Regions this event is particularly associated with
  originRegions?: string[];
}

/**
 * Visual Novel Choice - text-based event
 */
export interface VisualNovelEvent extends GameEvent {
  type: 'visual_novel';
  data: {
    narrative: string;
    choices: VisualNovelChoice[];
  };
}

export interface VisualNovelChoice {
  id: string;
  text: string;
  description?: string;
  outcome: 'gold' | 'hp' | 'item' | 'stat' | 'curse' | 'buff';
  value: number | string;
  successRate?: number; // 0-100 for RNG-based choices
}

/**
 * Encounter Event - combat challenge
 */
export interface EncounterEvent extends GameEvent {
  type: 'encounter';
  data: {
    enemyName: string;
    enemyLevel: number;
    goldReward: number;
    experienceReward: number;
  };
}

/**
 * Mini-game Event - interactive gameplay
 */
export interface MiniGameEvent extends GameEvent {
  type: 'mini_game';
  data: {
    gameName: string;
    difficulty: 'easy' | 'medium' | 'hard';
    rewards: {
      success: { gold: number; items?: string[] };
      partial: { gold: number };
      failure: { gold: number };
    };
  };
}

/**
 * Treasure Event - loot discovery
 */
export interface TreasureEvent extends GameEvent {
  type: 'treasure';
  data: {
    treasureType: 'chest' | 'reliquary' | 'cache' | 'hoard';
    items: string[];
    gold: number;
    risk?: 'trap' | 'cursed' | 'none';
  };
}

/**
 * Curse Event - negative effect
 */
export interface CurseEvent extends GameEvent {
  type: 'curse';
  data: {
    curseName: string;
    curseDuration: number;
    statPenalty?: Record<string, number>;
  };
}

/**
 * Dialogue Event - NPC interaction
 */
export interface DialogueEvent extends GameEvent {
  type: 'dialogue';
  data: {
    npcName: string;
    dialogue: string;
    options?: VisualNovelChoice[];
  };
}

/**
 * Combat System - LEGACY CODE (NOT USED)
 * 
 * This file contains legacy combat system types.
 * Current active combat system is in Battle.tsx and combat.ts
 */

export type CombatAction = {
  type: 'ability' | 'summoner' | 'item' | 'potion';
  id: string;
  cooldownTurns: number;
  manaCost: number;
  targetType: 'self' | 'enemy' | 'both';
};

export type Turn = {
  turnNumber: number;
  playerAction: CombatAction | null;
  enemyAction: CombatAction | null;
  playerDamageDealt: number;
  playerDamageReceived: number;
  playerHealReceived: number;
  battleLog: string[];
};

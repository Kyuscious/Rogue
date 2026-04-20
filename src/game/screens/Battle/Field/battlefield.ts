export const BATTLEFIELD_MIN_X = -500;
export const BATTLEFIELD_MAX_X = 500;
export const BATTLEFIELD_WIDTH = BATTLEFIELD_MAX_X - BATTLEFIELD_MIN_X;

export const PLAYER_START_POSITION = 50;
export const ENEMY_START_POSITION = -50;

export type BattleFleeOutcome = 'player_fled' | 'enemy_fled';

export function isOutsideBattlefield(position: number): boolean {
  return position <= BATTLEFIELD_MIN_X || position >= BATTLEFIELD_MAX_X;
}
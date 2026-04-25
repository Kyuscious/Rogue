export type BattleLogEntryType = 'normal' | 'simultaneous' | 'turn-system';

export interface BattleLogEntry {
  message: string;
  type?: BattleLogEntryType;
  tooltip?: string;
}

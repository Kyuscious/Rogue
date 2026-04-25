import { useState } from 'react';
import { BattleLogEntry, BattleLogEntryType } from './types';

export interface UseBattleLogReturn {
  battleLog: BattleLogEntry[];
  /** Append a single message string as a log entry. */
  appendLog: (message: string, type?: BattleLogEntryType) => void;
  /** Append multiple message strings as log entries. */
  appendLogs: (messages: string[], type?: BattleLogEntryType) => void;
  /** Append pre-built BattleLogEntry objects (e.g. from TurnManager or local logMessages arrays). */
  appendEntries: (entries: BattleLogEntry[]) => void;
  /** Reset the log to a single entry (used on new encounter start). */
  resetLog: (message: string) => void;
}

export function useBattleLog(initialMessage: string): UseBattleLogReturn {
  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>(() => [
    { message: initialMessage },
  ]);

  const appendLog = (message: string, type: BattleLogEntryType = 'normal') => {
    setBattleLog((prev) => [...prev, { message, type }]);
  };

  const appendLogs = (messages: string[], type: BattleLogEntryType = 'normal') => {
    if (messages.length === 0) return;
    setBattleLog((prev) => [...prev, ...messages.map((message) => ({ message, type }))]);
  };

  const appendEntries = (entries: BattleLogEntry[]) => {
    if (entries.length === 0) return;
    setBattleLog((prev) => [...prev, ...entries]);
  };

  const resetLog = (message: string) => {
    setBattleLog([{ message }]);
  };

  return { battleLog, appendLog, appendLogs, appendEntries, resetLog };
}

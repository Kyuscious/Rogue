import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { TurnAction } from '../Flow/turnSystemV2';
import { BattleLogEntry } from './types';
import { useTranslation } from '../../../../hooks/useTranslation';

interface BattleLogPanelProps {
  battleLog: BattleLogEntry[];
  isPlayerTurn: boolean;
  playerTurnDone: boolean;
  battleEnded: boolean;
  currentAction?: TurnAction;
  playerName: string;
  tutorialClassName?: string;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export const BattleLogPanel: React.FC<BattleLogPanelProps> = ({
  battleLog,
  isPlayerTurn,
  playerTurnDone,
  battleEnded,
  currentAction,
  playerName,
  tutorialClassName = '',
  expanded = false,
  onToggleExpand,
}) => {
  const logEntriesRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const t = useTranslation();

  const scrollBattleLogToBottom = () => {
    if (!shouldAutoScrollRef.current) return;

    const logContainer = logEntriesRef.current;
    if (!logContainer) return;

    requestAnimationFrame(() => {
      logContainer.scrollTop = logContainer.scrollHeight;
    });
  };

  const handleLogScroll = () => {
    const logContainer = logEntriesRef.current;
    if (!logContainer) return;

    const distanceFromBottom = logContainer.scrollHeight - (logContainer.scrollTop + logContainer.clientHeight);
    shouldAutoScrollRef.current = distanceFromBottom <= 24;
  };

  useLayoutEffect(() => {
    scrollBattleLogToBottom();
  }, [battleLog.length]);

  useEffect(() => {
    if (!playerTurnDone && !battleEnded && currentAction?.entityId === 'player') {
      scrollBattleLogToBottom();
    }
  }, [currentAction, playerTurnDone, battleEnded]);

  const getTokenClass = (token: string): string => {
    if (token.startsWith('P')) return 'player';
    if (token.startsWith('E')) return 'enemy';
    if (token.startsWith('F')) return 'familiar';
    return 'neutral';
  };

  const extractTokens = (message: string) => {
    const matches = Array.from(message.matchAll(/\[([PEF]\d+)\]/g));
    const tokens = matches.map((match) => match[1]);
    const cleanedMessage = message.replace(/\[([PEF]\d+)\]\s*/g, '').trim();
    return { tokens, cleanedMessage };
  };

  return (
    <div className={`battle-log battle-log-panel ${tutorialClassName}`}>
      {onToggleExpand && (
        <button
          className={`log-expand-btn${expanded ? ' log-expand-btn--expanded' : ''}`}
          onClick={onToggleExpand}
          title={expanded ? t.battleLog.collapseLog : t.battleLog.expandLog}
          aria-label={expanded ? t.battleLog.collapseLog : t.battleLog.expandLog}
        >
          {expanded ? '▼' : '▲'}
        </button>
      )}
      <div className="log-entries" ref={logEntriesRef} onScroll={handleLogScroll}>
        {battleLog.map((entry, idx) => {
          const { tokens, cleanedMessage } = extractTokens(entry.message);
          return (
            <div key={idx} className={`log-entry ${entry.type || ''}`} title={entry.tooltip || entry.message}>
              {tokens.length > 0 && (
                <span className="log-entry-token-row">
                  {tokens.slice(0, 2).map((token) => (
                    <span key={`${idx}-${token}`} className={`log-entry-token ${getTokenClass(token)}`}>
                      {token}
                    </span>
                  ))}
                </span>
              )}
              <span className="log-entry-text">{cleanedMessage}</span>
            </div>
          );
        })}
        {isPlayerTurn && !playerTurnDone && !battleEnded && currentAction && (
          <div className="log-entry turn-indicator">
            {currentAction.actionType === 'attack' || currentAction.actionType === 'move'
              ? `It's ${playerName || 'your'} turn to Attack or Move`
              : `It's ${playerName || 'your'} turn to use a Spell or Item`}
          </div>
        )}
      </div>
    </div>
  );
};

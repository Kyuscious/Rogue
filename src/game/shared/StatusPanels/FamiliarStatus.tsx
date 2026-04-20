import React from 'react';
import { useGameStore } from '@game/store';
import { getFamiliarById, getFamiliarMaxHp } from '@entities/Player/familiars';
import './FamiliarStatus.css';

interface FamiliarStatusProps {
  familiarId: string;
  compact?: boolean;
  currentTurn?: number;
  nextActionTurn?: number;
}

export const FamiliarStatus: React.FC<FamiliarStatusProps> = ({
  familiarId,
  compact = false,
  currentTurn = 0,
  nextActionTurn,
}) => {
  const familiar = getFamiliarById(familiarId);
  const familiarState = useGameStore((store) => store.state.familiarStates[familiarId]);

  if (!familiar) return null;

  const maxHp = getFamiliarMaxHp(familiarId);
  const currentHp = Math.max(0, Math.min(familiarState?.currentHp ?? maxHp, maxHp));
  const hpPercent = Math.max(0, Math.min(100, (currentHp / Math.max(1, maxHp)) * 100));
  const turnsUntilAction = typeof nextActionTurn === 'number'
    ? Math.max(0, Math.ceil(nextActionTurn - currentTurn))
    : null;

  return (
    <div className={`familiar-status-card rarity-${familiar.rarity} ${compact ? 'compact' : ''} ${currentHp <= 0 ? 'defeated' : ''}`}>
      <div className="familiar-status-header">
        <div className="familiar-status-icon">{familiar.icon}</div>
        <div className="familiar-status-titles">
          <div className="familiar-status-name">{familiar.name}</div>
          <div className="familiar-status-title">{familiar.title}</div>
        </div>
      </div>

      <div className="familiar-status-health-row">
        <span className="familiar-health-label">HP</span>
        <div className="familiar-healthbar">
          <div className="familiar-healthbar-fill" style={{ width: `${hpPercent}%` }} />
        </div>
        <span className="familiar-health-value">{currentHp}/{maxHp}</span>
      </div>

      <div className="familiar-status-effect">{familiar.attackPattern} • {familiar.effect.description}</div>

      <div className="familiar-status-stats">
        <span>⚔️ {Math.round(familiar.stats.attackDamage)}</span>
        <span>✨ {Math.round(familiar.stats.abilityPower)}</span>
        <span>🛡️ {Math.round(familiar.stats.armor)}</span>
        <span>⚡ {familiar.stats.speed.toFixed(2)}</span>
      </div>

      {turnsUntilAction !== null && (
        <div className={`familiar-status-timer ${turnsUntilAction === 0 ? 'ready' : ''}`}>
          {turnsUntilAction === 0 ? 'Ready this turn' : `Acts in ${turnsUntilAction} turn${turnsUntilAction === 1 ? '' : 's'}`}
        </div>
      )}
    </div>
  );
};

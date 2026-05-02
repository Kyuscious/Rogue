import React from 'react';
import { useGameStore } from '@game/store';
import { getFamiliarById, getFamiliarMaxHp } from '@entities/Player/familiars';
import { BuffsDisplay } from './BuffsDisplay';
import type { CombatBuff } from '@utils/itemSystem';
import { computeBuffDisplayValues } from '@utils/itemSystem';
import { useTranslation } from '../../../hooks/useTranslation';
import './FamiliarStatus.css';

interface FamiliarStatusProps {
  familiarId: string;
  compact?: boolean;
  currentTurn?: number;
  nextActionTurn?: number;
  combatBuffs?: CombatBuff[];
  combatDebuffs?: CombatBuff[];
}

export const FamiliarStatus: React.FC<FamiliarStatusProps> = ({
  familiarId,
  compact = false,
  currentTurn = 0,
  nextActionTurn,
  combatBuffs = [],
  combatDebuffs = [],
}) => {
  const familiar = getFamiliarById(familiarId);
  const familiarState = useGameStore((store) => store.state.familiarStates[familiarId]);
  const t = useTranslation();

  if (!familiar) return null;

  const maxHp = getFamiliarMaxHp(familiarId);
  const currentHp = Math.max(0, Math.min(familiarState?.currentHp ?? maxHp, maxHp));
  const hpPercent = Math.max(0, Math.min(100, (currentHp / Math.max(1, maxHp)) * 100));
  const familiarArt = familiar.imagePath;
  const familiarItemCount = 0;
  const turnsUntilAction = typeof nextActionTurn === 'number'
    ? Math.max(0, Math.ceil(nextActionTurn - currentTurn))
    : null;

  const temporaryBuffs = combatBuffs.map((buff) => {
    const { totalAmount, maxDuration } = computeBuffDisplayValues(buff, currentTurn);
    const decimalStats = ['speed', 'lifeSteal', 'spellVamp', 'omnivamp', 'tenacity', 'goldGain', 'xpGain', 'criticalChance', 'criticalDamage', 'haste', 'health_regen', 'heal_shield_power', 'magicFind'];
    const isDecimalStat = decimalStats.includes(buff.stat);

    return {
      statName: buff.stat,
      value: isDecimalStat ? totalAmount : Math.max(1, Math.round(totalAmount)),
      source: buff.name,
      duration: buff.isInfinite ? -1 : maxDuration,
      isDebuff: false,
      stackCount: buff.stacks.length,
    };
  });

  const temporaryDebuffs = combatDebuffs.map((debuff) => {
    const { totalAmount, maxDuration } = computeBuffDisplayValues(debuff, currentTurn);
    return {
      statName: debuff.stat,
      value: Math.round(totalAmount),
      source: debuff.name,
      duration: debuff.isInfinite ? -1 : maxDuration,
      isDebuff: true,
      stackCount: debuff.stacks.length,
    };
  });

  const allTemporaryStats = [...temporaryBuffs, ...temporaryDebuffs];
  const compactFamiliarArtStyle = familiarArt
    ? {
        backgroundImage: `url(${familiarArt})`,
        backgroundSize: 'auto 100%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
      }
    : undefined;

  if (compact) {
    return (
      <div
        className={`familiar-status-card rarity-${familiar.rarity} compact ${familiarArt ? 'has-familiar-art' : ''} ${currentHp <= 0 ? 'defeated' : ''}`}
        style={compactFamiliarArtStyle}
      >
        {/* ─── Top section: name row + buffs ─── */}
        <div className="familiar-compact-header-row">
          <div className="familiar-status-name familiar-compact-name">{familiar.name}</div>
          <div className="familiar-compact-item-count-badge" aria-label={`Items: ${familiarItemCount}`}>
            <span className="familiar-compact-item-count-icon">I</span>
            <span className="familiar-compact-item-count-value">{familiarItemCount}</span>
          </div>
        </div>
        <div className="familiar-buffs-container">
          <BuffsDisplay temporaryStats={allTemporaryStats} />
        </div>

        {/* ─── Bottom section: anchored to card bottom ─── */}
        <div className="familiar-compact-bottom">
          <div className="familiar-compact-stats-row">
            <span title="Attack Damage">⚔️ {Math.round(familiar.stats.attackDamage)}</span>
            <span title="Ability Power">✨ {Math.round(familiar.stats.abilityPower)}</span>
          </div>
          <div className="familiar-compact-stats-row">
            <span title="Armor">🛡️ {Math.round(familiar.stats.armor)}</span>
            <span title="Magic Resist">🔷 {Math.round(familiar.stats.magicResist ?? 0)}</span>
          </div>
          {turnsUntilAction !== null && familiar.trigger === 'turn' && (
            <div className={`familiar-compact-timer ${turnsUntilAction === 0 ? 'ready' : ''}`}>
              {turnsUntilAction === 0 ? t.familiar.ready : t.familiar.actsIn.replace('{{count}}', String(turnsUntilAction))}
            </div>
          )}
          {familiar.trigger === 'fight_start' && (
            <div className="familiar-compact-timer">{t.familiar.atFightStart}</div>
          )}
          {familiar.trigger === 'fight_end' && (
            <div className="familiar-compact-timer">{t.familiar.atFightEnd}</div>
          )}
          <div className="familiar-compact-hp">
            <span className="familiar-health-value">{currentHp}/{maxHp}</span>
            <div className="familiar-healthbar">
              <div className="familiar-healthbar-fill" style={{ width: `${hpPercent}%` }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`familiar-status-card rarity-${familiar.rarity} ${currentHp <= 0 ? 'defeated' : ''}`}>
      <div className="familiar-status-header">
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
      </div>

      {turnsUntilAction !== null && familiar.trigger === 'turn' && (
        <div className={`familiar-status-timer ${turnsUntilAction === 0 ? 'ready' : ''}`}>
          {turnsUntilAction === 0
            ? t.familiar.readyThisTurn
            : (turnsUntilAction === 1 ? t.familiar.actsInTurns : t.familiar.actsInTurnsPlural).replace('{{count}}', String(turnsUntilAction))}
        </div>
      )}
      {familiar.trigger === 'fight_start' && (
        <div className="familiar-status-timer">{t.familiar.activatesAtFightStart}</div>
      )}
      {familiar.trigger === 'fight_end' && (
        <div className="familiar-status-timer">{t.familiar.activatesAtFightEnd}</div>
      )}
    </div>
  );
};

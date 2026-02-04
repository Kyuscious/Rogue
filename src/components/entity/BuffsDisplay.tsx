import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface TemporaryStatModifier {
  statName: string;
  value: number;
  source: string; // buff name or debuff name
  duration?: number;
  isDebuff?: boolean; // true for debuffs, false/undefined for buffs
}

interface BuffsDisplayProps {
  temporaryStats?: TemporaryStatModifier[];
}

export const BuffsDisplay: React.FC<BuffsDisplayProps> = ({ temporaryStats = [] }) => {
  const t = useTranslation();
  const [hoveredBuffIndex, setHoveredBuffIndex] = useState<number | null>(null);
  const [showTotalTooltip, setShowTotalTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [totalTooltipPosition, setTotalTooltipPosition] = useState({ x: 0, y: 0 });

  // Map stat names to translated names
  const getStatDisplayName = (statName: string): string => {
    const statMap: Record<string, keyof typeof t.common> = {
      health: 'health',
      attackDamage: 'attackDamage',
      abilityPower: 'abilityPower',
      armor: 'armor',
      magicResist: 'magicResist',
      speed: 'speed',
      attackRange: 'attackRange',
      criticalChance: 'criticalChance',
      criticalDamage: 'criticalDamage',
      haste: 'haste',
      lifeSteal: 'lifeSteal',
      spellVamp: 'spellVamp',
      omnivamp: 'omnivamp',
      movementSpeed: 'movementSpeed',
      tenacity: 'tenacity',
      goldGain: 'goldGain',
      xpGain: 'xpGain',
      lethality: 'lethality',
      magicPenetration: 'magicPenetration',
      heal_over_time: 'healOverTime',
      health_regen: 'healthRegen',
    };
    return t.common[statMap[statName]] || statName;
  };

  // Calculate total stats from all temporary buffs only (no class bonuses)
  const calculateTotalStats = () => {
    const totals: any = {};
    temporaryStats.forEach((mod) => {
      const statKey = mod.statName;
      totals[statKey] = (totals[statKey] || 0) + mod.value;
    });
    return totals;
  };

  const totalStats = calculateTotalStats();
  
  return (
    <div className="buffs-display">
      <div className="buffs-grid">
        {/* Total Icon */}
        <div
          className="buff-icon total-slot"
          onMouseEnter={(e) => {
            setShowTotalTooltip(true);
            const rect = e.currentTarget.getBoundingClientRect();
            setTotalTooltipPosition({
              x: rect.left,
              y: rect.bottom + 5,
            });
          }}
          onMouseLeave={() => setShowTotalTooltip(false)}
        >
          <span className="total-icon">Σ</span>
        </div>

        {/* Temporary buffs/debuffs as individual slots */}
        {temporaryStats.map((mod, idx) => {
          const isDebuff = mod.isDebuff === true;
          const icon = isDebuff ? '🩸' : '✨'; // 🩸 for debuffs, ✨ for buffs
          const slotClass = isDebuff ? 'debuff-slot' : 'buff-slot';
          
          return (
            <div
              key={idx}
              className={`buff-icon ${slotClass}`}
              onMouseEnter={(e) => {
                setHoveredBuffIndex(idx);
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltipPosition({
                  x: rect.left,
                  y: rect.bottom + 5,
                });
              }}
              onMouseLeave={() => setHoveredBuffIndex(null)}
            >
              <span className="buff-emoji">{icon}</span>
              {mod.duration && <span className="duration-badge">{mod.duration}</span>}
            </div>
          );
        })}
      </div>

      {/* Total Stats Tooltip */}
      {showTotalTooltip && (
        <div className="stat-bonus-tooltip total-tooltip" style={{ left: `${totalTooltipPosition.x}px`, top: `${totalTooltipPosition.y}px` }}>
          <div className="tooltip-title">{t.common.totalStats}</div>
          <div className="tooltip-level">All bonuses combined</div>
          {Object.entries(totalStats)
            .filter(([_, value]) => value && value !== 0)
            .map(([stat, value]) => (
              <div key={stat} className="tooltip-stat">
                {(value as number) > 0 ? '+' : ''}{Math.round(value as number)} {getStatDisplayName(stat)}
              </div>
            ))}
        </div>
      )}

      {/* Individual Buff Tooltip */}
      {hoveredBuffIndex !== null && temporaryStats[hoveredBuffIndex] && (
        <div className="stat-bonus-tooltip" style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }}>
          <div className="tooltip-title">
            {temporaryStats[hoveredBuffIndex].isDebuff ? '🩸 ' : ''}
            {temporaryStats[hoveredBuffIndex].source}
          </div>
          <div className="tooltip-level">
            {temporaryStats[hoveredBuffIndex].duration && temporaryStats[hoveredBuffIndex].duration < 999 ? `${temporaryStats[hoveredBuffIndex].duration} turns remaining` : 'Permanent'}
          </div>
          {temporaryStats[hoveredBuffIndex].value !== 0 && (
            <div className="tooltip-stat">
              {temporaryStats[hoveredBuffIndex].value > 0 ? '+' : ''}{Math.round(temporaryStats[hoveredBuffIndex].value)}{' '}
              {getStatDisplayName(temporaryStats[hoveredBuffIndex].statName)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

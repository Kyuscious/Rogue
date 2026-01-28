import React, { useState } from 'react';

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

const STAT_DISPLAY_NAMES: Record<string, string> = {
  health: 'HP',
  attackDamage: 'Attack Damage',
  abilityPower: 'Ability Power',
  armor: 'Armor',
  magicResist: 'Magic Resist',
  attackSpeed: 'Attack Speed',
  attackRange: 'Attack Range',
  criticalChance: 'Crit Chance',
  criticalDamage: 'Crit Damage',
  abilityHaste: 'Ability Haste',
  lifeSteal: 'Life Steal',
  spellVamp: 'Spell Vamp',
  omnivamp: 'Omnivamp',
  movementSpeed: 'Movement Speed',
  tenacity: 'Tenacity',
  goldGain: 'Gold Gain',
  xpGain: 'XP Gain',
  lethality: 'Lethality',
  magicPenetration: 'Magic Penetration',
  heal_over_time: 'Heal/Turn',
};

export const BuffsDisplay: React.FC<BuffsDisplayProps> = ({ temporaryStats = [] }) => {
  const [hoveredBuffIndex, setHoveredBuffIndex] = useState<number | null>(null);
  const [showTotalTooltip, setShowTotalTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [totalTooltipPosition, setTotalTooltipPosition] = useState({ x: 0, y: 0 });

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
          <div className="tooltip-title">Total Buffs</div>
          <div className="tooltip-level">All bonuses combined</div>
          {Object.entries(totalStats)
            .filter(([_, value]) => value && value !== 0)
            .map(([stat, value]) => (
              <div key={stat} className="tooltip-stat">
                {(value as number) > 0 ? '+' : ''}{Math.round(value as number)} {STAT_DISPLAY_NAMES[stat] || stat}
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
              {STAT_DISPLAY_NAMES[temporaryStats[hoveredBuffIndex].statName] || temporaryStats[hoveredBuffIndex].statName}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

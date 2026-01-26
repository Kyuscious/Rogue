import React, { useState } from 'react';
import { Character } from '../../game/types';
import { getClassStatBonuses } from '../../game/statsSystem';

interface TemporaryStatModifier {
  statName: string;
  value: number;
  source: string; // buff name or debuff name
  duration?: number;
  isDebuff?: boolean; // true for debuffs, false/undefined for buffs
}

interface BuffsDisplayProps {
  character: Character;
  temporaryStats?: TemporaryStatModifier[];
}

const CLASS_ICONS: Record<string, string> = {
  mage: '✨',
  vanguard: '🛡️',
  warden: '🧙',
  juggernaut: '⚔️',
  skirmisher: '💨',
  assassin: '🗡️',
  marksman: '🏹',
  enchanter: '✨',
};

const CLASS_NAMES: Record<string, string> = {
  mage: 'Mage',
  vanguard: 'Vanguard',
  warden: 'Warden',
  juggernaut: 'Juggernaut',
  skirmisher: 'Skirmisher',
  assassin: 'Assassin',
  marksman: 'Marksman',
  enchanter: 'Enchanter',
};

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

export const BuffsDisplay: React.FC<BuffsDisplayProps> = ({ character, temporaryStats = [] }) => {
  const [hoveredClass, setHoveredClass] = useState(false);
  const [hoveredBuffIndex, setHoveredBuffIndex] = useState<number | null>(null);
  const [showTotalTooltip, setShowTotalTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [totalTooltipPosition, setTotalTooltipPosition] = useState({ x: 0, y: 0 });
  
  const classBonuses = getClassStatBonuses(character.class, character.level);

  // Calculate total stats from class bonuses + all temporary buffs
  const calculateTotalStats = () => {
    const totals: any = { ...classBonuses };
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

        {/* Class buff as first buff slot */}
        <div
          className="buff-icon class-buff"
          onMouseEnter={(e) => {
            setHoveredClass(true);
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltipPosition({
              x: rect.left,
              y: rect.bottom + 5,
            });
          }}
          onMouseLeave={() => setHoveredClass(false)}
        >
          <span>{CLASS_ICONS[character.class]}</span>
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
                {(value as number) > 0 ? '+' : ''}{value as number} {STAT_DISPLAY_NAMES[stat] || stat}
              </div>
            ))}
        </div>
      )}

      {/* Class Buff Tooltip */}
      {hoveredClass && (
        <div className="stat-bonus-tooltip" style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }}>
          <div className="tooltip-title">{CLASS_NAMES[character.class]}</div>
          <div className="tooltip-level">Level {character.level}</div>
          {Object.entries(classBonuses)
            .filter(([_, value]) => value && value !== 0)
            .map(([stat, value]) => (
              <div key={stat} className="tooltip-stat">
                +{value} {STAT_DISPLAY_NAMES[stat]}
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
              {temporaryStats[hoveredBuffIndex].value > 0 ? '+' : ''}{temporaryStats[hoveredBuffIndex].value}{' '}
              {STAT_DISPLAY_NAMES[temporaryStats[hoveredBuffIndex].statName] || temporaryStats[hoveredBuffIndex].statName}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

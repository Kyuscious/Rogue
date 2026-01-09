import React, { useState } from 'react';
import { Character } from '../game/types';
import { getClassStatBonuses } from '../game/statsSystem';

interface TemporaryStatModifier {
  statName: string;
  value: number;
  source: string; // 'buff', 'debuff', 'item', etc
  duration?: number;
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
};

export const BuffsDisplay: React.FC<BuffsDisplayProps> = ({ character, temporaryStats = [] }) => {
  const [hoveredClass, setHoveredClass] = useState(false);
  const classBonuses = getClassStatBonuses(character.class, character.level);
  
  const classTooltipContent = Object.entries(classBonuses)
    .filter(([_, value]) => value && value !== 0)
    .map(([stat, value]) => `${STAT_DISPLAY_NAMES[stat]}: +${value}`)
    .join('\n');

  return (
    <div className="buffs-display">
      <div className="buffs-grid">
        {/* Class buff as first buff with stat bonuses */}
        <div
          className="buff-icon class-buff"
          onMouseEnter={() => setHoveredClass(true)}
          onMouseLeave={() => setHoveredClass(false)}
          title={`${CLASS_NAMES[character.class]} - Level ${character.level}\n\n${classTooltipContent}`}
        >
          <span>{CLASS_ICONS[character.class]}</span>
          {hoveredClass && classTooltipContent && (
            <div className="stat-bonus-tooltip">
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
        </div>

        {/* Temporary buffs/debuffs */}
        {temporaryStats.map((mod, idx) => (
          <div
            key={idx}
            className={`buff-icon ${mod.source}`}
            title={`${mod.statName}: ${mod.value >= 0 ? '+' : ''}${mod.value}`}
          >
            <span className="duration-badge">{mod.duration || '∞'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Character } from '../game/types';
import { CharacterStats, getScaledStats } from '../game/statsSystem';

interface StatsPanelProps {
  character: Character;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ character }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get scaled stats with class bonuses applied
  const scaledStats = getScaledStats(character.stats, character.level, character.class);
  const stats = scaledStats as Partial<CharacterStats> | undefined;

  const primaryStats = [
    { label: 'Attack Damage', value: stats?.attackDamage || 0 },
    { label: 'Ability Power', value: stats?.abilityPower || 0 },
    { label: 'Attack Speed', value: stats?.attackSpeed || 0 },
  ];

  const attackStats = [
    { label: 'Critical Chance', value: `${stats?.criticalChance || 0}%` },
    { label: 'Critical Damage', value: `${stats?.criticalDamage || 0}%` },
    { label: 'Attack Range', value: stats?.attackRange || 0 },
  ];

  const survivalStats = [
    { label: 'Armor', value: stats?.armor || 0 },
    { label: 'Magic Resist', value: stats?.magicResist || 0 },
    { label: 'Lifesteal', value: `${stats?.lifeSteal || 0}%` },
  ];

  const mobilityStats = [
    { label: 'Movement Speed', value: stats?.movementSpeed || 0 },
    { label: 'Ability Haste', value: `${stats?.abilityHaste || 0}%` },
    { label: 'Lethality', value: stats?.lethality || 0 },
  ];

  const miscStats = [
    { label: 'Gold Gain', value: `${stats?.goldGain || 1}x` },
    { label: 'Experience Gain', value: `${stats?.xpGain || 1}x` },
    { label: 'Omnivamp', value: `${stats?.omnivamp || 0}%` },
  ];

  const renderStatCategory = (title: string, statsList: any[]) => (
    <div className="stat-category">
      <h4>{title}</h4>
      <div className="stat-row">
        {statsList.map((stat, idx) => (
          <div key={idx} className="stat-item">
            <span className="stat-label">{stat.label}:</span>
            <span className="stat-value">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="stats-panel">
      <button 
        className="stats-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        Stats {isOpen ? '▼' : '▶'}
      </button>

      {isOpen && (
        <div className="stats-content">
          {renderStatCategory('Primary Stats', primaryStats)}
          {renderStatCategory('Attack Stats', attackStats)}
          {renderStatCategory('Survivability', survivalStats)}
          {renderStatCategory('Mobility & Utility', mobilityStats)}
          {renderStatCategory('Miscellaneous', miscStats)}
        </div>
      )}
    </div>
  );
};

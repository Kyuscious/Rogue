import React, { useState } from 'react';
import { Character } from '../../game/types';
import { CharacterStats, getScaledStats } from '../../game/statsSystem';
import { getPassiveIdsFromInventory } from '../../game/items';
import { useGameStore } from '../../game/store';
import { CombatBuff } from '../../game/itemSystem';
import './StatsPanel.css';

interface StatsPanelProps {
  character: Character;
  combatBuffs?: CombatBuff[];
  combatDebuffs?: CombatBuff[];
  isRevealed?: boolean; // Whether to show stats or hide them
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ character, combatBuffs, combatDebuffs, isRevealed = true }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const { state } = useGameStore();

  // Get passive IDs from inventory (only for player)
  const passiveIds = character.role === 'player' 
    ? getPassiveIdsFromInventory(state.inventory)
    : [];

  // For enemies, stats are already fully scaled at spawn (includes items + class bonuses)
  // For players, we need to calculate scaled stats with class bonuses and passives
  const scaledStats = character.role === 'enemy'
    ? character.stats
    : getScaledStats(character.stats, character.level, character.class, passiveIds);
  
  // Apply combat buffs and debuffs to the stats
  const statsWithModifiers = { ...scaledStats };
  
  // Apply buffs
  combatBuffs?.forEach(buff => {
    const statKey = buff.stat as keyof CharacterStats;
    if (statsWithModifiers[statKey] !== undefined) {
      (statsWithModifiers[statKey] as number) += buff.amount;
    }
  });
  
  // Apply debuffs
  combatDebuffs?.forEach(debuff => {
    const statKey = debuff.stat as keyof CharacterStats;
    if (statsWithModifiers[statKey] !== undefined) {
      (statsWithModifiers[statKey] as number) += debuff.amount; // amount is already negative for debuffs
    }
  });
  
  const stats = statsWithModifiers as Partial<CharacterStats> | undefined;

  // Survivability stats
  const survivalStats = [
    { label: 'Health', value: Math.round(stats?.health || 0) },
    { label: 'Health Regen', value: Math.round(stats?.health_regen || 0) },
    { label: 'Armor', value: Math.round(stats?.armor || 0) },
    { label: 'Magic Resist', value: Math.round(stats?.magicResist || 0) },
    { label: 'Tenacity', value: `${Math.round(stats?.tenacity || 0)}%` },
  ];

  // Attack stats
  const attackStats = [
    { label: 'Attack Range', value: Math.round(stats?.attackRange || 0) },
    { label: 'Attack Damage', value: Math.round(stats?.attackDamage || 0) },
    { label: 'Attack Speed', value: (stats?.attackSpeed || 0).toFixed(2) },
    { label: 'Critical Chance', value: `${Math.round(stats?.criticalChance || 0)}%` },
    { label: 'Critical Damage', value: `${Math.round(stats?.criticalDamage || 0)}%` },
    { label: 'Lethality', value: Math.round(stats?.lethality || 0) },
    { label: 'Lifesteal', value: `${Math.round(stats?.lifeSteal || 0)}%` },
  ];

  // Spell stats
  const spellStats = [
    { label: 'Ability Power', value: Math.round(stats?.abilityPower || 0) },
    { label: 'Ability Haste', value: `${Math.round(stats?.abilityHaste || 0)}%` },
    { label: 'Magic Penetration', value: Math.round(stats?.magicPenetration || 0) },
    { label: 'Heal & Shield Power', value: `${Math.round(stats?.heal_shield_power || 0)}%` },
    { label: 'Omnivamp', value: `${Math.round(stats?.omnivamp || 0)}%` },
  ];

  // Mobility stats
  const mobilityStats = [
    { label: 'Movement Speed', value: Math.round(stats?.movementSpeed || 0) },
  ];

  // Misc stats
  const miscStats = [
    { label: 'Gold Gain', value: `${(stats?.goldGain || 1).toFixed(1)}x` },
    { label: 'XP Gain', value: `${(stats?.xpGain || 1).toFixed(1)}x` },
    { label: 'Magic Find', value: `${Math.round(stats?.magicFind || 0)}%` },
  ];

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Set position and visibility at the same time to prevent flicker
    const x = rect.left;
    const y = rect.bottom + 5;
    
    setTooltipPosition({ x, y });
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  const renderStatCategory = (title: string, statsList: any[]) => (
    <div className="stats-category">
      <h4 className="stats-category-title">{title}</h4>
      <div className="stats-list">
        {statsList.map((stat, idx) => (
          <div key={idx} className="stats-item">
            <span className="stats-label">{stat.label}:</span>
            <span className="stats-value">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="stats-panel">
      <div className={`stats-panel-container ${character.role === 'enemy' ? 'enemy-stats' : 'player-stats'}`}>
        {character.role === 'enemy' && (
          <div className={`quick-stats enemy-quick-stats ${!isRevealed ? 'hidden-stats' : ''}`}>
            {isRevealed ? (
              <>
                <div className="quick-stat" title="Attack Damage">
                  <span className="quick-stat-icon">⚔️</span>
                  <span className="quick-stat-value">{Math.round(stats?.attackDamage || 0)}</span>
                </div>
                <div className="quick-stat" title="Attack Speed">
                  <span className="quick-stat-icon">⚡</span>
                  <span className="quick-stat-value">{(stats?.attackSpeed || 0).toFixed(1)}</span>
                </div>
                <div className="quick-stat" title="Ability Power">
                  <span className="quick-stat-icon">✨</span>
                  <span className="quick-stat-value">{Math.round(stats?.abilityPower || 0)}</span>
                </div>
                <div className="quick-stat" title="Ability Haste">
                  <span className="quick-stat-icon">⏱️</span>
                  <span className="quick-stat-value">{Math.round(stats?.abilityHaste || 0)}</span>
                </div>
              </>
            ) : (
              <span className="invisible-icon">👁️‍🗨️</span>
            )}
          </div>
        )}
        
        <button 
          className={`stats-button ${!isRevealed ? 'invisible-button' : ''}`}
          onMouseEnter={isRevealed ? handleMouseEnter : undefined}
          onMouseLeave={isRevealed ? handleMouseLeave : undefined}
        >
          {isRevealed ? '📊 Stats' : '👁️‍🗨️'}
        </button>
        
        {character.role === 'player' && (
          <div className="quick-stats player-quick-stats">
            <div className="quick-stat" title="Attack Damage">
              <span className="quick-stat-icon">⚔️</span>
              <span className="quick-stat-value">{Math.round(stats?.attackDamage || 0)}</span>
            </div>
            <div className="quick-stat" title="Attack Speed">
              <span className="quick-stat-icon">⚡</span>
              <span className="quick-stat-value">{(stats?.attackSpeed || 0).toFixed(1)}</span>
            </div>
            <div className="quick-stat" title="Ability Power">
              <span className="quick-stat-icon">✨</span>
              <span className="quick-stat-value">{Math.round(stats?.abilityPower || 0)}</span>
            </div>
            <div className="quick-stat" title="Ability Haste">
              <span className="quick-stat-icon">⏱️</span>
              <span className="quick-stat-value">{Math.round(stats?.abilityHaste || 0)}</span>
            </div>
          </div>
        )}
      </div>

      {tooltipVisible && isRevealed && (
        <div 
          className={`stats-tooltip ${character.role === 'enemy' ? 'tooltip-left' : 'tooltip-right'}`}
          style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }}
        >
          <h3 className="stats-tooltip-header">{character.name}'s Stats</h3>
          <div className="stats-columns">
            <div className="stats-column stats-column-left">
              {renderStatCategory('Mobility', mobilityStats)}
              {renderStatCategory('Miscellaneous', miscStats)}
              {renderStatCategory('Attack', attackStats)}
            </div>
            <div className="stats-column stats-column-right">
              {renderStatCategory('Survivability', survivalStats)}
              {renderStatCategory('Spell', spellStats)}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

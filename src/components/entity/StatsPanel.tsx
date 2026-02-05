import React, { useState, useEffect, useRef } from 'react';
import { Character } from '../../game/types';
import { CharacterStats, getScaledStats } from '../../game/statsSystem';
import { getPassiveIdsFromInventory } from '../../game/items';
import { useGameStore } from '../../game/store';
import { useTranslation } from '../../hooks/useTranslation';
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
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { state } = useGameStore();
  const t = useTranslation();

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

  // Viewport detection: adjust tooltip position if it extends beyond window bounds
  useEffect(() => {
    if (tooltipVisible && tooltipRef.current) {
      const tooltip = tooltipRef.current;
      const rect = tooltip.getBoundingClientRect();
      let { x, y } = tooltipPosition;

      // Check if tooltip extends beyond right edge
      if (rect.right > window.innerWidth) {
        x = window.innerWidth - rect.width - 10;
      }

      // Check if tooltip extends beyond left edge
      if (rect.left < 0) {
        x = 10;
      }

      // Check if tooltip extends beyond bottom edge
      if (rect.bottom > window.innerHeight) {
        y = window.innerHeight - rect.height - 10;
      }

      // Check if tooltip extends beyond top edge
      if (rect.top < 0) {
        y = 10;
      }

      // Update position if needed
      if (x !== tooltipPosition.x || y !== tooltipPosition.y) {
        setTooltipPosition({ x, y });
      }
    }
  }, [tooltipVisible, tooltipPosition]);

  // Survivability stats
  const survivalStats = [
    { label: t.common.health, value: Math.round(stats?.health || 0) },
    { label: t.common.healthRegen, value: Math.round(stats?.health_regen || 0) },
    { label: t.common.armor, value: Math.round(stats?.armor || 0) },
    { label: t.common.magicResist, value: Math.round(stats?.magicResist || 0) },
    { label: t.common.tenacity, value: `${Math.round(stats?.tenacity || 0)}%` },
  ];

  // Attack stats
  const attackStats = [
    { label: t.common.attackRange, value: Math.round(stats?.attackRange || 0) },
    { label: t.common.attackDamage, value: Math.round(stats?.attackDamage || 0) },
    { label: t.common.speed, value: (stats?.speed || 0).toFixed(2) },
    { label: t.common.criticalChance, value: `${Math.round(stats?.criticalChance || 0)}%` },
    { label: t.common.criticalDamage, value: `${Math.round(stats?.criticalDamage || 0)}%` },
    { label: t.common.lethality, value: Math.round(stats?.lethality || 0) },
    { label: t.common.lifeSteal, value: `${Math.round(stats?.lifeSteal || 0)}%` },
  ];

  // Spell stats
  const spellStats = [
    { label: t.common.abilityPower, value: Math.round(stats?.abilityPower || 0) },
    { label: t.common.haste, value: `${Math.round(stats?.haste || 0)}%` },
    { label: t.common.magicPenetration, value: Math.round(stats?.magicPenetration || 0) },
    { label: t.common.healShieldPower, value: `${Math.round(stats?.heal_shield_power || 0)}%` },
    { label: t.common.omnivamp, value: `${Math.round(stats?.omnivamp || 0)}%` },
  ];

  // Mobility stats
  const mobilityStats = [
    { label: t.common.movementSpeed, value: Math.round(stats?.movementSpeed || 0) },
  ];

  // Misc stats
  const miscStats = [
    { label: t.common.goldGain, value: `${(stats?.goldGain || 1).toFixed(1)}x` },
    { label: t.common.xpGain, value: `${(stats?.xpGain || 1).toFixed(1)}x` },
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
        <button 
          className={`stats-button ${!isRevealed ? 'invisible-button' : ''}`}
          onMouseEnter={isRevealed ? handleMouseEnter : undefined}
          onMouseLeave={isRevealed ? handleMouseLeave : undefined}
        >
          {isRevealed ? '📊 Stats' : '👁️‍🗨️'}
        </button>
        
        {(character.role === 'player' || isRevealed) ? (

          
          <div className={`quick-stats ${character.role === 'player' ? 'player-quick-stats' : 'enemy-quick-stats'}`}>
            <div className="quick-stat" title={t.common.attackDamage}>
              <span className="quick-stat-icon">⚔️</span>
              <span className="quick-stat-value">{Math.round(stats?.attackDamage || 0)}</span>
            </div>
            <div className="quick-stat" title={t.common.speed}>
              <span className="quick-stat-icon">⚡</span>
              <span className="quick-stat-value">{(stats?.speed || 0).toFixed(1)}</span>
            </div>
            <div className="quick-stat" title={t.common.armor}>
              <span className="quick-stat-icon">🛡️</span>
              <span className="quick-stat-value">{Math.round(stats?.armor || 0)}</span>
            </div>
            <div className="quick-stat-separator"></div>
            <div className="quick-stat" title={t.common.abilityPower}>
              <span className="quick-stat-icon">✨</span>
              <span className="quick-stat-value">{Math.round(stats?.abilityPower || 0)}</span>
            </div>
            <div className="quick-stat" title={t.common.haste}>
              <span className="quick-stat-icon">⏱️</span>
              <span className="quick-stat-value">{Math.round(stats?.haste || 0)}</span>
            </div>
            <div className="quick-stat" title={t.common.magicResist}>
              <span className="quick-stat-icon">🔷</span>
              <span className="quick-stat-value">{Math.round(stats?.magicResist || 0)}</span>
            </div>
          </div>
        ) : (
          <div className="quick-stats hidden-stats">
            <span className="invisible-icon">👁️‍🗨️</span>
          </div>
        )}
      </div>

      {tooltipVisible && isRevealed && (
        <div 
          ref={tooltipRef}
          className={`stats-tooltip ${character.role === 'enemy' ? 'tooltip-left' : 'tooltip-right'}`}
          style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }}
        >
          <h3 className="stats-tooltip-header">{character.name}'s Stats</h3>
          <div className="stats-columns">
            <div className="stats-column stats-column-left">
              {renderStatCategory(t.common.mobilityStats, mobilityStats)}
              {renderStatCategory(t.common.miscStats, miscStats)}
              {renderStatCategory(t.common.attackStats, attackStats)}
            </div>
            <div className="stats-column stats-column-right">
              {renderStatCategory(t.common.survivalStats, survivalStats)}
              {renderStatCategory(t.common.spellStats, spellStats)}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

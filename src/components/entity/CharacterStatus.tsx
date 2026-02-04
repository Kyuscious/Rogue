import React, { useState } from 'react';
import { useGameStore } from '../../game/store';
import { useTranslation } from '../../hooks/useTranslation';
import { HealthDisplay } from './HealthDisplay';
import { LevelDisplay } from './LevelDisplay';
import { BuffsDisplay } from './BuffsDisplay';
import { ItemsBar } from './ItemsBar';
import { StatsPanel } from './StatsPanel';
import { getClassStatBonuses } from '../../game/statsSystem';
import { CombatBuff } from '../../game/itemSystem';
import './CharacterStatus.css';

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

export const CharacterStatus: React.FC<{ 
  characterId?: string; 
  combatBuffs?: CombatBuff[];
  combatDebuffs?: CombatBuff[];
  isRevealed?: boolean; // For stealth/control ward mechanic - enemy visibility
}> = ({ characterId, combatBuffs, combatDebuffs, isRevealed = true }) => {
  const { state } = useGameStore();
  const t = useTranslation();
  const [hoveredClass, setHoveredClass] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Map class names to translations
  const getClassName = (classType: string): string => {
    const classMap: Record<string, keyof typeof t.common> = {
      mage: 'mage',
      vanguard: 'vanguard',
      warden: 'warden',
      juggernaut: 'juggernaut',
      skirmisher: 'skirmisher',
      assassin: 'assassin',
      marksman: 'marksman',
      enchanter: 'enchanter',
    };
    return t.common[classMap[classType]] || classType;
  };

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
      omnivamp: 'omnivamp',
      movementSpeed: 'movementSpeed',
      tenacity: 'tenacity',
    };
    return t.common[statMap[statName]] || statName;
  };
  
  const character = characterId
    ? state.enemyCharacters.find((c) => c.id === characterId)
    : state.playerCharacter;

  if (!character) return null;

  // Convert CombatBuffs to TemporaryStatModifiers for BuffsDisplay
  const temporaryStats = combatBuffs?.map(buff => ({
    statName: buff.stat,
    value: Math.max(1, Math.round(buff.amount)), // Round to integer, minimum 1
    source: buff.name,
    duration: buff.duration,
    isDebuff: false,
  })) || [];

  // Convert CombatDebuffs to TemporaryStatModifiers for BuffsDisplay
  const temporaryDebuffs = combatDebuffs?.map(debuff => ({
    statName: debuff.stat,
    value: Math.round(debuff.amount), // Keep negative values for debuffs
    source: debuff.name,
    duration: debuff.duration,
    isDebuff: true,
  })) || [];

  // Convert character.effects (StatusEffect) to TemporaryStatModifiers
  const statusEffectBuffs = character.effects
    ?.filter(effect => effect.type === 'buff')
    .map(effect => ({
      statName: effect.statModifiers?.attackDamage ? 'attackDamage' : 
                 effect.statModifiers?.abilityPower ? 'abilityPower' :
                 effect.statModifiers?.health ? 'health' : 'health',
      value: effect.statModifiers?.attackDamage || effect.statModifiers?.abilityPower || effect.statModifiers?.health || 0,
      source: effect.name,
      duration: effect.duration,
      isDebuff: false,
    })) || [];

  // Convert character.effects debuffs to TemporaryStatModifiers
  const statusEffectDebuffs = character.effects
    ?.filter(effect => effect.type === 'debuff')
    .map(effect => ({
      statName: 'debuff',
      value: 0,
      source: effect.name,
      duration: effect.duration,
      isDebuff: true,
    })) || [];

  // Combine all buffs and debuffs
  const allTemporaryStats = [...temporaryStats, ...temporaryDebuffs, ...statusEffectBuffs, ...statusEffectDebuffs];

  return (
    <div className="character-status">
      <div className="character-header">
        <h2>{character.name}</h2>
        {/* Class display next to name */}
        <div 
          className={`class-badge ${!isRevealed ? 'blurred-class-badge' : ''}`}
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
          <span className="class-icon">{CLASS_ICONS[character.class]}</span>
          {isRevealed && <span className="class-name">{getClassName(character.class)}</span>}
        </div>
        
        {/* Class tooltip */}
        {hoveredClass && isRevealed && (
          <div className="class-tooltip" style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }}>
            <div className="tooltip-title">{getClassName(character.class)} (Lvl {character.level})</div>
            {(() => {
              const classBonuses = getClassStatBonuses(character.class, character.level);
              return (
                <div className="tooltip-stats">
                  {Object.entries(classBonuses)
                    .filter(([_, value]) => value && value !== 0)
                    .map(([stat, value]) => (
                      <div key={stat} className="tooltip-stat">
                        +{Math.round(value as number)} {getStatDisplayName(stat)}
                      </div>
                    ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Always Visible: Items Bar (shows equipment for both player and enemy) */}
      <ItemsBar inventory={characterId ? character.inventory : state.inventory} isRevealed={isRevealed} />

      {/* Always Visible: Health & Level */}
      <HealthDisplay character={character} />
      <LevelDisplay character={character} />

      {/* Always Visible: Active Effects (Buffs/Debuffs) */}
      <BuffsDisplay temporaryStats={allTemporaryStats} />

      {/* Toggleable: Stats Panel */}
      <StatsPanel character={character} combatBuffs={combatBuffs} combatDebuffs={combatDebuffs} isRevealed={isRevealed} />
    </div>
  );
};

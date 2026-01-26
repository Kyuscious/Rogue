import React from 'react';
import { useGameStore } from '../../game/store';
import { HealthDisplay } from './HealthDisplay';
import { LevelDisplay } from './LevelDisplay';
import { BuffsDisplay } from './BuffsDisplay';
import { ItemsBar } from './ItemsBar';
import { StatsPanel } from './StatsPanel';
import { CombatBuff } from '../../game/itemSystem';
import './CharacterStatus.css';

export const CharacterStatus: React.FC<{ 
  characterId?: string; 
  combatBuffs?: CombatBuff[];
  combatDebuffs?: CombatBuff[];
}> = ({ characterId, combatBuffs, combatDebuffs }) => {
  const { state } = useGameStore();
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

  // Combine buffs and debuffs
  const allTemporaryStats = [...temporaryStats, ...temporaryDebuffs];

  return (
    <div className="character-status">
      <div className="character-header">
        <h2>{character.name}</h2>
      </div>

      {/* Always Visible: Items Bar (shows equipment for both player and enemy) */}
      <ItemsBar inventory={characterId ? character.inventory : state.inventory} />

      {/* Always Visible: Health & Level */}
      <HealthDisplay character={character} />
      <LevelDisplay character={character} />

      {/* Always Visible: Active Effects (Buffs/Debuffs) */}
      <BuffsDisplay character={character} temporaryStats={allTemporaryStats} />

      {/* Toggleable: Stats Panel */}
      <StatsPanel character={character} combatBuffs={combatBuffs} combatDebuffs={combatDebuffs} />
    </div>
  );
};

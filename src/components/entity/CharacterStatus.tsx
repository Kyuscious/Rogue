import React from 'react';
import { useGameStore } from '../../game/store';
import { HealthDisplay } from './HealthDisplay';
import { LevelDisplay } from './LevelDisplay';
import { BuffsDisplay } from './BuffsDisplay';
import { ItemsBar } from './ItemsBar';
import { StatsPanel } from './StatsPanel';
import { CombatBuff } from '../../game/itemSystem';
import './CharacterStatus.css';

export const CharacterStatus: React.FC<{ characterId?: string; combatBuffs?: CombatBuff[] }> = ({ characterId, combatBuffs }) => {
  const { state } = useGameStore();
  const character = characterId
    ? state.enemyCharacters.find((c) => c.id === characterId)
    : state.playerCharacter;

  if (!character) return null;

  // Convert CombatBuffs to TemporaryStatModifiers for BuffsDisplay
  const temporaryStats = combatBuffs?.map(buff => ({
    statName: buff.stat,
    value: buff.amount,
    source: buff.name,
    duration: buff.duration,
  })) || [];

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
      <BuffsDisplay character={character} temporaryStats={temporaryStats} />

      {/* Toggleable: Stats Panel */}
      <StatsPanel character={character} />
    </div>
  );
};

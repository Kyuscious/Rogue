import React from 'react';
import { useGameStore } from '../game/store';
import { HealthDisplay } from './HealthDisplay';
import { LevelDisplay } from './LevelDisplay';
import { BuffsDisplay } from './BuffsDisplay';
import { ItemsBar } from './ItemsBar';
import { StatsPanel } from './StatsPanel';
import './CharacterStatus.css';

export const CharacterStatus: React.FC<{ characterId?: string }> = ({ characterId }) => {
  const { state } = useGameStore();
  const character = characterId
    ? state.enemyCharacters.find((c) => c.id === characterId)
    : state.playerCharacter;

  if (!character) return null;

  return (
    <div className="character-status">
      <div className="character-header">
        <h2>{character.name}</h2>
      </div>

      {/* Always Visible: Items Bar (only for player) */}
      {!characterId && <ItemsBar />}

      {/* Always Visible: Health & Level */}
      <HealthDisplay character={character} />
      <LevelDisplay character={character} />

      {/* Always Visible: Active Effects (Buffs/Debuffs) */}
      <BuffsDisplay character={character} />

      {/* Toggleable: Stats Panel */}
      <StatsPanel character={character} />
    </div>
  );
};

import React from 'react';
import { Character } from '../../game/types';

interface LevelDisplayProps {
  character: Character;
}

export const LevelDisplay: React.FC<LevelDisplayProps> = ({ character }) => {
  const expPercentage = 0; // TODO: Add proper experience calculation

  return (
    <div className="level-display">
      <div className="level-exp-container">
        <span className="level">Lvl {character.level}</span>
        <div className="exp-bar">
          <div className="exp-fill" style={{ width: `${expPercentage}%` }}></div>
          <span className="exp-text">{0}/100</span>
        </div>
      </div>
    </div>
  );
};

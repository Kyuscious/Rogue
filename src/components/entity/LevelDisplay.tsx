import React from 'react';
import { Character } from '../../game/types';
import { formatExpDisplay } from '../../game/experienceSystem';

interface LevelDisplayProps {
  character: Character;
}

export const LevelDisplay: React.FC<LevelDisplayProps> = ({ character }) => {
  const { currentLevelExp, expForNextLevel, percentage } = formatExpDisplay(
    character.experience,
    character.level
  );

  return (
    <div className="level-display">
      <div className="level-exp-container">
        <span className="level">Lvl {character.level}</span>
        <div className="exp-bar">
          <div className="exp-fill" style={{ width: `${percentage}%` }}></div>
          <span className="exp-text">{currentLevelExp}/{expForNextLevel}</span>
        </div>
      </div>
    </div>
  );
};

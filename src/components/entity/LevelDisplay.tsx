import React from 'react';
import { Character } from '../../game/types';
import { formatExpDisplay } from '../../game/experienceSystem';
import { useTranslation } from '../../hooks/useTranslation';

interface LevelDisplayProps {
  character: Character;
}

export const LevelDisplay: React.FC<LevelDisplayProps> = ({ character }) => {
  const t = useTranslation();
  const { currentLevelExp, expForNextLevel, percentage } = formatExpDisplay(
    character.experience,
    character.level
  );

  // Only show exp bar for player characters
  const showExpBar = character.role === 'player';

  return (
    <div className="level-display">
      <div className="level-exp-container">
        <span className="level">{t.common.level} {character.level}</span>
        {showExpBar && (
          <div className="exp-bar">
            <div className="exp-fill" style={{ width: `${percentage}%` }}></div>
            <span className="exp-text">{currentLevelExp}/{expForNextLevel}</span>
          </div>
        )}
      </div>
    </div>
  );
};

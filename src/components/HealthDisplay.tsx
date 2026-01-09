import React from 'react';
import { Character } from '../game/types';
import { getScaledStats } from '../game/statsSystem';

interface HealthDisplayProps {
  character: Character;
}

export const HealthDisplay: React.FC<HealthDisplayProps> = ({ character }) => {
  // Get scaled stats with class bonuses applied
  const scaledStats = getScaledStats(character.stats, character.level, character.class);
  const maxHp = scaledStats.health;
  const hpPercentage = character.hp > 0 ? (character.hp / maxHp) * 100 : 0;

  return (
    <div className="health-display">
      <div className="hp-bar-container">
        <div className="hp-bar">
          <div
            className="hp-fill"
            style={{
              width: `${hpPercentage}%`,
              background: `linear-gradient(90deg, rgb(255, 0, 0) 0%, rgb(255, 100, 0) 25%, rgb(255, 200, 0) 50%, rgb(0, 255, 0) 100%)`,
            }}
          ></div>
        </div>
        <span className="hp-text">
          {character.hp}/{maxHp} HP
        </span>
      </div>
    </div>
  );
};

import React from 'react';
import { Character } from '../../game/types';
import { getScaledStats } from '../../game/statsSystem';
import { getTotalShield } from '../../game/shieldSystem';

interface HealthDisplayProps {
  character: Character;
}

export const HealthDisplay: React.FC<HealthDisplayProps> = ({ character }) => {
  // For enemies, stats are already fully scaled at spawn (includes items + class bonuses)
  // For players, we need to calculate scaled stats with class bonuses and passives
  const maxHp = character.role === 'enemy' 
    ? character.stats.health 
    : getScaledStats(character.stats, character.level, character.class).health;
  const hpPercentage = character.hp > 0 ? (character.hp / maxHp) * 100 : 0;
  const shield = getTotalShield(character);
  const shieldPercentage = shield > 0 ? (shield / maxHp) * 100 : 0;

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
          {shield > 0 && (
            <div
              className="shield-fill"
              style={{
                width: `${shieldPercentage}%`,
                left: `${hpPercentage}%`,
              }}
            ></div>
          )}
        </div>
        <span className="hp-text">
          {character.hp}/{maxHp} HP
          {shield > 0 && <span className="shield-text"> +{Math.round(shield)}</span>}
        </span>
      </div>
    </div>
  );
};

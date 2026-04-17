import React from 'react';
import { Character } from '../../game/types';
import { getScaledStats } from '../../game/statsSystem';
import { getTotalShield } from '../../game/shieldSystem';
import { useTranslation } from '../../hooks/useTranslation';

interface HealthDisplayProps {
  character: Character;
}

export const HealthDisplay: React.FC<HealthDisplayProps> = ({ character }) => {
  const t = useTranslation();
  const isEnemy = character.role === 'enemy';

  // For enemies, stats are already fully scaled at spawn (includes items + class bonuses)
  // For players, we need to calculate scaled stats with class bonuses and passives
  const maxHp = isEnemy
    ? character.stats.health
    : getScaledStats(character.stats, character.level, character.class).health;
  const hpPercentage = character.hp > 0 ? (character.hp / maxHp) * 100 : 0;
  const shield = getTotalShield(character);
  const shieldPercentage = shield > 0 ? (shield / maxHp) * 100 : 0;

  const gradientSpan = hpPercentage > 0 ? 10000 / hpPercentage : 100;

  const hpFillStyle: React.CSSProperties = {
    width: `${hpPercentage}%`,
    background: isEnemy
      ? 'linear-gradient(270deg, rgb(255, 0, 0) 0%, rgb(255, 100, 0) 25%, rgb(255, 200, 0) 50%, rgb(0, 255, 0) 100%)'
      : 'linear-gradient(90deg, rgb(255, 0, 0) 0%, rgb(255, 100, 0) 25%, rgb(255, 200, 0) 50%, rgb(0, 255, 0) 100%)',
    backgroundSize: `${gradientSpan}% 100%`,
    backgroundPosition: isEnemy ? 'right center' : 'left center',
    backgroundRepeat: 'no-repeat',
    left: isEnemy ? 'auto' : '0',
    right: isEnemy ? '0' : 'auto',
  };

  const shieldFillStyle: React.CSSProperties = isEnemy
    ? {
        width: `${shieldPercentage}%`,
        right: `${hpPercentage}%`,
        left: 'auto',
        borderLeft: 'none',
        borderRight: '2px solid rgba(100, 200, 255, 1)',
      }
    : {
        width: `${shieldPercentage}%`,
        left: `${hpPercentage}%`,
      };

  return (
    <div className={`health-display ${isEnemy ? 'enemy-health-display' : 'player-health-display'}`}>
      <div className="hp-bar-container">
        <div className="hp-bar">
          <div className="hp-fill" style={hpFillStyle}></div>
          {shield > 0 && <div className="shield-fill" style={shieldFillStyle}></div>}
        </div>
        <span className="hp-text">
          {Math.round(character.hp)}/{Math.round(maxHp)} {t.common.hp}
          {shield > 0 && <span className="shield-text"> +{Math.round(shield)}</span>}
        </span>
      </div>
    </div>
  );
};

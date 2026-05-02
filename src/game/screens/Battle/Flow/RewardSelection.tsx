import React from 'react';
import { InventoryItem } from '@game/types';
import { getItemById } from '@data/items';
import { useTranslation } from '../../../../hooks/useTranslation';
import './RewardSelection.css';

interface RewardSelectionProps {
  rewardOptions: InventoryItem[];
  onSelectReward: (selectedItem: InventoryItem) => void;
  onSkip: () => void;
  onReroll: () => void;
  rerollsRemaining: number;
  floor: number;
}

export const RewardSelection: React.FC<RewardSelectionProps> = ({
  rewardOptions,
  onSelectReward,
  onSkip,
  onReroll,
  rerollsRemaining,
  floor,
}) => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const t = useTranslation();

  const handleSelect = (option: InventoryItem) => {
    onSelectReward(option);
  };

  return (
    <div className="reward-selection-overlay">
      <div className="reward-selection-container">
        <div className="reward-header">
          <h2>{t.reward.floorMilestone.replace('{{floor}}', String(floor))}</h2>
          <p>{t.reward.chooseReward}</p>
        </div>

        <div className="reward-cards">
          {rewardOptions.map((option, index) => {
            const item = getItemById(option.itemId);
            if (!item) return null;

            const isHovered = hoveredIndex === index;

            return (
              <div
                key={`${option.itemId}-${index}`}
                className={`reward-card ${isHovered ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleSelect(option)}
              >
                <div className="reward-card-inner">
                  <div className="reward-card-header">
                    <h3>{item.name}</h3>
                  </div>

                  <div className="reward-card-icon">
                    {item.imagePath ? (
                      <img src={item.imagePath} alt={item.name} className="reward-card-image" />
                    ) : (
                      <span>{item.consumable ? '🧪' : '⚔️'}</span>
                    )}
                  </div>

                  <div className="reward-card-stats">
                    {item.stats.health && item.stats.health > 0 && (
                      <div className="stat-line">
                        <span className="stat-label">{t.reward.statLabels.health}</span>
                        <span className="stat-value">+{item.stats.health}</span>
                      </div>
                    )}
                    {item.stats.attackDamage && item.stats.attackDamage > 0 && (
                      <div className="stat-line">
                        <span className="stat-label">{t.reward.statLabels.attackDamage}</span>
                        <span className="stat-value">+{item.stats.attackDamage}</span>
                      </div>
                    )}
                    {item.stats.abilityPower && item.stats.abilityPower > 0 && (
                      <div className="stat-line">
                        <span className="stat-label">{t.reward.statLabels.abilityPower}</span>
                        <span className="stat-value">+{item.stats.abilityPower}</span>
                      </div>
                    )}
                    {item.stats.armor && item.stats.armor > 0 && (
                      <div className="stat-line">
                        <span className="stat-label">{t.reward.statLabels.armor}</span>
                        <span className="stat-value">+{item.stats.armor}</span>
                      </div>
                    )}
                    {item.stats.magicResist && item.stats.magicResist > 0 && (
                      <div className="stat-line">
                        <span className="stat-label">{t.reward.statLabels.magicResist}</span>
                        <span className="stat-value">+{item.stats.magicResist}</span>
                      </div>
                    )}
                    {item.stats.speed && item.stats.speed > 0 && (
                      <div className="stat-line">
                        <span className="stat-label">{t.reward.statLabels.speed}</span>
                        <span className="stat-value">+{item.stats.speed}</span>
                      </div>
                    )}
                    {item.stats.haste && item.stats.haste > 0 && (
                      <div className="stat-line">
                        <span className="stat-label">{t.reward.statLabels.haste}</span>
                        <span className="stat-value">+{item.stats.haste}</span>
                      </div>
                    )}
                    {item.stats.criticalChance && item.stats.criticalChance > 0 && (
                      <div className="stat-line">
                        <span className="stat-label">{t.reward.statLabels.critChance}</span>
                        <span className="stat-value">+{item.stats.criticalChance}%</span>
                      </div>
                    )}
                    {item.stats.lifeSteal && item.stats.lifeSteal > 0 && (
                      <div className="stat-line">
                        <span className="stat-label">{t.reward.statLabels.lifeSteal}</span>
                        <span className="stat-value">+{item.stats.lifeSteal}%</span>
                      </div>
                    )}
                  </div>

                  <div className="reward-card-footer">
                    <button className="select-btn">{t.reward.select}</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="reward-actions">
          <button 
            className="skip-btn"
            onClick={onSkip}
            title="Skip this reward and continue"
          >
            {t.reward.skip}
          </button>
          <button 
            className="reroll-btn"
            onClick={onReroll}
            disabled={rerollsRemaining <= 0}
            title={rerollsRemaining > 0 ? `Reroll options (${rerollsRemaining} left)` : t.questSelect.noRerollsRemaining}
          >
            {t.reward.reroll.replace('{{count}}', String(rerollsRemaining))}
          </button>
        </div>
      </div>
    </div>
  );
};

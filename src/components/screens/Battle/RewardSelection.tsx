import React from 'react';
import { InventoryItem } from '../../../game/types';
import { getItemById } from '../../../game/items';
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

  const handleSelect = (option: InventoryItem) => {
    onSelectReward(option);
  };

  return (
    <div className="reward-selection-overlay">
      <div className="reward-selection-container">
        <div className="reward-header">
          <h2>🎉 Floor {floor} Milestone!</h2>
          <p>Choose your reward</p>
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
                        <span className="stat-label">❤️ Health:</span>
                        <span className="stat-value">+{item.stats.health}</span>
                      </div>
                    )}
                    {item.stats.attackDamage && item.stats.attackDamage > 0 && (
                      <div className="stat-line">
                        <span className="stat-label">⚔️ Attack Damage:</span>
                        <span className="stat-value">+{item.stats.attackDamage}</span>
                      </div>
                    )}
                    {item.stats.abilityPower && item.stats.abilityPower > 0 && (
                      <div className="stat-line">
                        <span className="stat-label">✨ Ability Power:</span>
                        <span className="stat-value">+{item.stats.abilityPower}</span>
                      </div>
                    )}
                    {item.stats.armor && item.stats.armor > 0 && (
                      <div className="stat-line">
                        <span className="stat-label">🛡️ Armor:</span>
                        <span className="stat-value">+{item.stats.armor}</span>
                      </div>
                    )}
                    {item.stats.magicResist && item.stats.magicResist > 0 && (
                      <div className="stat-line">
                        <span className="stat-label">🔮 Magic Resist:</span>
                        <span className="stat-value">+{item.stats.magicResist}</span>
                      </div>
                    )}
                    {item.stats.attackSpeed && item.stats.attackSpeed > 0 && (
                      <div className="stat-line">
                        <span className="stat-label">⚡ Attack Speed:</span>
                        <span className="stat-value">+{item.stats.attackSpeed}</span>
                      </div>
                    )}
                    {item.stats.abilityHaste && item.stats.abilityHaste > 0 && (
                      <div className="stat-line">
                        <span className="stat-label">💫 Ability Haste:</span>
                        <span className="stat-value">+{item.stats.abilityHaste}</span>
                      </div>
                    )}
                    {item.stats.criticalChance && item.stats.criticalChance > 0 && (
                      <div className="stat-line">
                        <span className="stat-label">💥 Crit Chance:</span>
                        <span className="stat-value">+{item.stats.criticalChance}%</span>
                      </div>
                    )}
                    {item.stats.lifeSteal && item.stats.lifeSteal > 0 && (
                      <div className="stat-line">
                        <span className="stat-label">💚 Lifesteal:</span>
                        <span className="stat-value">+{item.stats.lifeSteal}%</span>
                      </div>
                    )}
                  </div>

                  <div className="reward-card-footer">
                    <button className="select-btn">Select</button>
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
            ⏭️ Skip
          </button>
          <button 
            className="reroll-btn"
            onClick={onReroll}
            disabled={rerollsRemaining <= 0}
            title={rerollsRemaining > 0 ? `Reroll options (${rerollsRemaining} left)` : 'No rerolls remaining'}
          >
            🎲 Reroll ({rerollsRemaining})
          </button>
        </div>
      </div>
    </div>
  );
};

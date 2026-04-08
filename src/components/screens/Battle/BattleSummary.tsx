import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { InventoryItem, Region } from '../../../game/types';
import { getItemById, getPassiveDescription } from '../../../game/items';
import { getItemName, getItemDescription } from '../../../i18n/helpers';
import { LootPreviewModal } from '../../shared/LootPreviewModal';
import { calculateQuestLoot, QuestLootInfo } from '../../../game/lootCalculator';
import './BattleSummary.css';

interface CombatStats {
  highestDamageDealt: number;
  highestDamageSource: 'attack' | 'spell';
  highestDamageTaken: number;
  highestDamageTakenSource: 'attack' | 'spell';
}

interface BattleSummaryProps {
  isVictory: boolean;
  combatStats: CombatStats;
  rewards?: {
    gold: number;
    exp: number;
    items: InventoryItem[];
  };
  rewardSelection?: {
    options: InventoryItem[];
    onSelect: (item: InventoryItem) => void;
    onSkip: () => void;
    onReroll: () => void;
    rerollsRemaining: number;
    region?: Region; // For loot preview
    enemyIds?: string[]; // For loot preview
    playerMagicFind?: number; // For loot preview calculations
  };
  runStats?: {
    itemsOwned: number;
    encountersFaced: number;
    unlocksEarned: string[];
  };
  onContinue: () => void;
}

export const BattleSummary: React.FC<BattleSummaryProps> = ({
  isVictory,
  combatStats,
  rewards,
  rewardSelection,
  runStats,
  onContinue,
}) => {
  const [showRewards, setShowRewards] = useState(false);
  const [hoveredRewardIndex, setHoveredRewardIndex] = useState<number | null>(null);
  const [autoSkipTimer, setAutoSkipTimer] = useState(5.0);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [lootPreviewOpen, setLootPreviewOpen] = useState(false);
  const [selectedLootInfo, setSelectedLootInfo] = useState<QuestLootInfo | null>(null);

  useEffect(() => {
    // Show rewards instantly
    setShowRewards(true);
  }, []);

  // Auto-skip timer for continue button (only on victory, not reward selection or defeat)
  useEffect(() => {
    if (isVictory && !rewardSelection && showRewards) {
      const interval = setInterval(() => {
        setAutoSkipTimer((prev) => {
          const newTime = prev - 0.1;
          if (newTime <= 0) {
            clearInterval(interval);
            onContinue();
            return 0;
          }
          return newTime;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isVictory, rewardSelection, showRewards, onContinue]);

  return (
    <div className={`battle-summary ${isVictory ? 'victory' : 'defeat'}`}>
      <div className="summary-container">
        {/* Header */}
        <div className="summary-header">
          <h2>{isVictory ? '⚔️ Victory!' : '💀 Defeated'}</h2>
        </div>

        {/* Combat Statistics */}
        <div className="combat-stats">
          <div className="stat-row">
            <span className="stat-label">Highest Damage Dealt:</span>
            <span className="stat-value damage-dealt">
              {combatStats.highestDamageDealt} 
              {combatStats.highestDamageSource === 'spell' ? ' ✨' : ' ⚔️'}
              <span className="stat-source">
                ({combatStats.highestDamageSource})
              </span>
            </span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Highest Damage Taken:</span>
            <span className="stat-value damage-taken">
              {combatStats.highestDamageTaken}
              {combatStats.highestDamageTakenSource === 'spell' ? ' ✨' : ' ⚔️'}
              <span className="stat-source">
                ({combatStats.highestDamageTakenSource})
              </span>
            </span>
          </div>
        </div>

        {/* Victory Rewards or Defeat Stats */}
        {showRewards && (
          <div className="summary-rewards">
            {isVictory && rewardSelection ? (
              // REWARD SELECTION MODE (Floors 5, 10, etc.)
              <>
                <div className="rewards-header">Choose Your Reward</div>
                <div className="reward-selection-grid">
                  {rewardSelection.options.map((option, index) => {
                    const item = getItemById(option.itemId);
                    if (!item) return null;

                    const isHovered = hoveredRewardIndex === index;

                    return (
                      <div
                        key={`${option.itemId}-${index}`}
                        className={`reward-selection-card ${isHovered ? 'hovered' : ''}`}
                        onMouseEnter={() => setHoveredRewardIndex(index)}
                        onMouseLeave={() => setHoveredRewardIndex(null)}
                        onClick={() => rewardSelection.onSelect(option)}
                      >
                        <div className="reward-card-header">
                          <h4>{getItemName(item)}</h4>
                        </div>

                        <div className="reward-card-icon">
                          {item.imagePath ? (
                            <img src={item.imagePath} alt={getItemName(item)} />
                          ) : (
                            <span className="icon-placeholder">{item.consumable ? '🧪' : '⚔️'}</span>
                          )}
                        </div>

                        <div className="reward-card-stats">
                          {item.stats.health && item.stats.health > 0 && (
                            <div className="stat-line">
                              <span className="stat-label">❤️ HP:</span>
                              <span className="stat-value">+{item.stats.health}</span>
                            </div>
                          )}
                          {item.stats.attackDamage && item.stats.attackDamage > 0 && (
                            <div className="stat-line">
                              <span className="stat-label">⚔️ AD:</span>
                              <span className="stat-value">+{item.stats.attackDamage}</span>
                            </div>
                          )}
                          {item.stats.abilityPower && item.stats.abilityPower > 0 && (
                            <div className="stat-line">
                              <span className="stat-label">✨ AP:</span>
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
                              <span className="stat-label">🔮 MR:</span>
                              <span className="stat-value">+{item.stats.magicResist}</span>
                            </div>
                          )}
                          {item.stats.criticalChance && item.stats.criticalChance > 0 && (
                            <div className="stat-line">
                              <span className="stat-label">💥 Crit:</span>
                              <span className="stat-value">+{item.stats.criticalChance}%</span>
                            </div>
                          )}
                        </div>

                        <button className="select-reward-btn">Select</button>
                      </div>
                    );
                  })}
                </div>
                
                <div className="reward-selection-actions">
                  {rewardSelection.region && rewardSelection.enemyIds && rewardSelection.enemyIds.length > 0 && (
                    <button 
                      className="preview-loot-btn" 
                      onClick={() => {
                        const magicFind = rewardSelection.playerMagicFind || 0;
                        const lootInfo = calculateQuestLoot(rewardSelection.enemyIds!, rewardSelection.region!, magicFind);
                        setSelectedLootInfo(lootInfo);
                        setLootPreviewOpen(true);
                      }}
                      title="View all possible loot and drop rates"
                    >
                      👁️ View All Possible Loot
                    </button>
                  )}
                  <button className="skip-reward-btn" onClick={rewardSelection.onSkip}>
                    ⏭️ Skip
                  </button>
                  <button 
                    className="reroll-reward-btn" 
                    onClick={rewardSelection.onReroll}
                    disabled={rewardSelection.rerollsRemaining <= 0}
                  >
                    🎲 Reroll ({rewardSelection.rerollsRemaining})
                  </button>
                </div>
              </>
            ) : isVictory && rewards ? (
              // SIMPLE REWARDS MODE (Regular encounters)
              <>
                <div className="rewards-header">Rewards Earned</div>
                <div className="rewards-grid">
                  {rewards.gold > 0 && (
                    <div className="reward-item gold">
                      <span className="reward-icon">💰</span>
                      <span className="reward-amount">+{rewards.gold} Gold</span>
                    </div>
                  )}
                  {rewards.exp > 0 && (
                    <div className="reward-item exp">
                      <span className="reward-icon">⭐</span>
                      <span className="reward-amount">+{rewards.exp} EXP</span>
                    </div>
                  )}
                  {rewards.items.length > 0 && (
                    <div className="rewards-items-container">
                      <div className="rewards-items-label">Items Earned:</div>
                      <div className="rewards-items-grid">
                        {rewards.items.map((item, idx) => {
                          const itemData = getItemById(item.itemId);
                          if (!itemData) return null;
                          
                          return (
                            <div
                              key={`${item.itemId}-${idx}`}
                              className="reward-item-card"
                              onMouseEnter={() => setHoveredItemId(item.itemId)}
                              onMouseLeave={() => setHoveredItemId(null)}
                            >
                              <div className="reward-item-icon">
                                {itemData.imagePath ? (
                                  <img src={itemData.imagePath} alt={itemData.name} />
                                ) : (
                                  <span className="reward-item-emoji">{itemData.consumable ? '🧪' : '⚔️'}</span>
                                )}
                              </div>
                              <div className="reward-item-name">{itemData.name}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // DEFEAT MODE
              runStats && (
                <>
                  <div className="rewards-header">Run Statistics</div>
                  <div className="run-stats-grid">
                    <div className="run-stat">
                      <span className="stat-icon">🎒</span>
                      <span className="stat-text">{runStats.itemsOwned} Items Owned</span>
                    </div>
                    <div className="run-stat">
                      <span className="stat-icon">⚔️</span>
                      <span className="stat-text">{runStats.encountersFaced} Encounters Faced</span>
                    </div>
                    {runStats.unlocksEarned.length > 0 && (
                      <div className="run-stat unlocks">
                        <span className="stat-icon">🔓</span>
                        <span className="stat-text">
                          Unlocked: {runStats.unlocksEarned.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )
            )}
          </div>
        )}

        {/* Continue Button - Only show if NOT in reward selection mode */}
        {showRewards && !rewardSelection && (
          <div className="continue-section">
            <button className="continue-btn" onClick={onContinue}>
              {isVictory ? 'Continue ⟶' : 'Return to Menu'}
            </button>
            {isVictory && (
              <div className="auto-skip-timer">
                Auto-continue in {autoSkipTimer.toFixed(1)}s
              </div>
            )}
          </div>
        )}
      </div>

      {/* Item Tooltip Portal */}
      {hoveredItemId && (() => {
        const item = getItemById(hoveredItemId);
        if (!item) return null;

        return createPortal(
          <div className="item-tooltip-portal">
            <div className="item-rarity">{item.rarity.toUpperCase()}</div>
            <div className="item-description">{getItemDescription(item)}</div>
            <div className="item-stats">
              {Object.entries(item.stats)
                .filter(([_, value]) => value && value > 0)
                .map(([stat, value]) => (
                  <div key={stat} className="item-stat">
                    <span className="stat-name">{stat.replace(/_/g, ' ')}:</span>
                    <span className="stat-value">+{value}</span>
                  </div>
                ))
              }
            </div>
            {item.passiveId && getPassiveDescription(item.passiveId) && (
              <div className="item-passive">
                <strong>Passive:</strong> {getPassiveDescription(item.passiveId)}
              </div>
            )}
          </div>,
          document.body
        );
      })()}

      {/* Loot Preview Modal */}
      <LootPreviewModal 
        isOpen={lootPreviewOpen}
        onClose={() => setLootPreviewOpen(false)}
        lootInfo={selectedLootInfo}
        title="All Possible Boss Loot"
      />
    </div>
  );
};

import React from 'react';
import { LootOdds, QuestLootInfo } from '../../game/lootCalculator';
import './LootPreviewModal.css';

interface LootPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lootInfo: QuestLootInfo | null;
  title?: string;
}

export const LootPreviewModal: React.FC<LootPreviewModalProps> = ({
  isOpen,
  onClose,
  lootInfo,
  title = 'Possible Loot Drops',
}) => {
  if (!isOpen || !lootInfo) return null;

  // Group items by rarity
  const itemsByRarity: Record<string, LootOdds[]> = {};
  lootInfo.allPossibleItems.forEach(item => {
    if (!itemsByRarity[item.rarity]) {
      itemsByRarity[item.rarity] = [];
    }
    itemsByRarity[item.rarity].push(item);
  });

  // Sort rarities from highest to lowest
  const rarityOrder: string[] = ['transcendent', 'exalted', 'ultimate', 'mythic', 'legendary', 'epic', 'common', 'starter'];
  const sortedRarities = rarityOrder.filter(rarity => itemsByRarity[rarity]);

  // Rarity colors for visual distinction
  const rarityColors: Record<string, string> = {
    starter: '#a0a0a0',
    common: '#ffffff',
    epic: '#9d4dff',
    legendary: '#ff8c00',
    mythic: '#ff0080',
    ultimate: '#00ffff',
    exalted: '#ffd700',
    transcendent: '#ff00ff',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="loot-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="loot-preview-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="loot-preview-stats">
          <div className="loot-preview-stat-card">
            <span className="loot-preview-stat-label">Total Unique Items</span>
            <span className="loot-preview-stat-value">{lootInfo.uniqueItemCount}</span>
          </div>
          <div className="loot-preview-stat-card">
            <span className="loot-preview-stat-label">Average Rarity</span>
            <span className="loot-preview-stat-value" style={{ color: rarityColors[lootInfo.averageRarity] }}>
              {lootInfo.averageRarity.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="loot-preview-content">
          {sortedRarities.map(rarity => {
            const items = itemsByRarity[rarity];
            return (
              <div key={rarity} className="rarity-section">
                <div 
                  className="rarity-header" 
                  style={{ borderColor: rarityColors[rarity] }}
                >
                  <span style={{ color: rarityColors[rarity] }}>
                    {rarity.toUpperCase()}
                  </span>
                  <span className="loot-preview-item-count">({items.length} items)</span>
                </div>
                <div className="items-grid">
                  {items.map(item => (
                    <div 
                      key={item.itemId} 
                      className="loot-item-card"
                      style={{ borderColor: rarityColors[rarity] }}
                    >
                      {item.imagePath && (
                        <div className="loot-preview-item-image-container">
                          <img 
                            src={item.imagePath} 
                            alt={item.itemName}
                            className="loot-preview-item-image"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="loot-preview-item-info">
                        <div className="loot-preview-item-name" title={item.itemName}>{item.itemName}</div>
                        <div className="item-drop-chance">
                          {item.dropChance.toFixed(2)}% drop
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="loot-preview-footer">
          <p className="info-text">
            ✨ Drop rates shown are base rates. Your Magic Find stat will increase chances of higher rarity items.
          </p>
        </div>
      </div>
    </div>
  );
};

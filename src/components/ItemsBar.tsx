import React, { useState } from 'react';
import { useGameStore } from '../game/store';
import { getItemById } from '../game/items';
import './ItemsBar.css';

export const ItemsBar: React.FC = () => {
  const { state } = useGameStore();
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  if (state.inventory.length === 0) return null;

  return (
    <div className="items-bar">
      <div className="items-bar-container">
        {state.inventory.map((item, idx) => {
          const itemData = getItemById(item.itemId);
          if (!itemData) return null;

          // Simple emoji-based icons for items
          const getItemIcon = (name: string) => {
            if (name.includes('Blade')) return '⚔️';
            if (name.includes('Shield')) return '🛡️';
            if (name.includes('Ring')) return '💍';
            return '📦';
          };

          return (
            <div
              key={idx}
              className={`item-icon-slot rarity-${itemData.rarity}`}
              onMouseEnter={(e) => {
                setHoveredItemId(item.itemId);
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltipPosition({
                  x: rect.left + rect.width / 2,
                  y: rect.bottom + 5,
                });
              }}
              onMouseLeave={() => setHoveredItemId(null)}
              title={itemData.name}
            >
              <span className="item-icon">{getItemIcon(itemData.name)}</span>
              {item.quantity > 1 && <span className="item-qty">{item.quantity}</span>}
            </div>
          );
        })}
      </div>

      {hoveredItemId && getItemById(hoveredItemId) && (
        <div className="item-tooltip-bar" style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }}>
          <h4 className="tooltip-item-name">{getItemById(hoveredItemId)?.name}</h4>
          <p className="tooltip-item-description">{getItemById(hoveredItemId)?.description}</p>
          <div className="tooltip-item-stats">
            {getItemById(hoveredItemId)?.stats.attackDamage && (
              <div className="tooltip-stat">⚔️ AD: +{getItemById(hoveredItemId)?.stats.attackDamage}</div>
            )}
            {getItemById(hoveredItemId)?.stats.abilityPower && (
              <div className="tooltip-stat">✨ AP: +{getItemById(hoveredItemId)?.stats.abilityPower}</div>
            )}
            {getItemById(hoveredItemId)?.stats.armor && (
              <div className="tooltip-stat">🛡️ Armor: +{getItemById(hoveredItemId)?.stats.armor}</div>
            )}
            {getItemById(hoveredItemId)?.stats.magicResist && (
              <div className="tooltip-stat">🔮 MR: +{getItemById(hoveredItemId)?.stats.magicResist}</div>
            )}
            {getItemById(hoveredItemId)?.stats.health && (
              <div className="tooltip-stat">❤️ HP: +{getItemById(hoveredItemId)?.stats.health}</div>
            )}
          </div>
          {getItemById(hoveredItemId)?.passive && (
            <div className="tooltip-item-passive">
              <strong>Passive:</strong> {getItemById(hoveredItemId)?.passive}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

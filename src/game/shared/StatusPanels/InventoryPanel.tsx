import React, { useState } from 'react';
import { useGameStore } from '@game/store';
import { getItemById, getPassiveDescription } from '@data/items';

export const InventoryPanel: React.FC = () => {
  const { state } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  return (
    <div className="inventory-panel">
      <button 
        className="inventory-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        Inventory ({state.inventory.length})
      </button>

      {isOpen && (
        <div className="inventory-dropdown">
          {state.inventory.length > 0 ? (
            <div className="inventory-items">
              {state.inventory.map((item: { itemId: string; quantity: number }, idx: number) => {
                const itemData = getItemById(item.itemId);
                return (
                  <div
                    key={idx}
                    className="inventory-item-slot"
                    onMouseEnter={(e) => {
                      setHoveredItemId(item.itemId);
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipPosition({
                        x: rect.right + 10,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => setHoveredItemId(null)}
                  >
                    <span className="item-qty">{item.quantity}x</span>
                    <span className="item-name">{itemData?.name || item.itemId}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-items">No items yet</p>
          )}

          {hoveredItemId && getItemById(hoveredItemId) && (
            <div className="item-hover-tooltip" style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }}>
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
                {getItemById(hoveredItemId)?.stats.speed && (
                  <div className="tooltip-stat">⚡ AS: +{getItemById(hoveredItemId)?.stats.speed}</div>
                )}
                {getItemById(hoveredItemId)?.stats.lifeSteal && (
                  <div className="tooltip-stat">💉 Lifesteal: +{getItemById(hoveredItemId)?.stats.lifeSteal}</div>
                )}
              </div>
              {getItemById(hoveredItemId)?.passiveId && getPassiveDescription(getItemById(hoveredItemId)!.passiveId!) && (
                <div className="tooltip-item-passive">
                  <strong>Passive:</strong> {getPassiveDescription(getItemById(hoveredItemId)!.passiveId!)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

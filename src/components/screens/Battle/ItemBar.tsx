import React, { useState, useRef } from 'react';
import './ItemBar.css';

interface ItemBarProps {
  usableItems: Array<{ itemId: string; item: any; quantity: number }>;
  onSelectItem: (itemId: string) => void;
  selectedItemId: string | null;
  canUse: boolean;
}

interface TooltipState {
  itemId: string;
  position: { x: number; y: number };
}

export const ItemBar: React.FC<ItemBarProps> = ({ usableItems, onSelectItem, selectedItemId, canUse }) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Filter to only show consumable items (safety check)
  const consumableItems = usableItems.filter(item => item.item?.consumable === true);

  const showTooltip = (e: React.MouseEvent, itemId: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({
      itemId,
      position: { x: rect.left + rect.width / 2, y: rect.top - 10 },
    });
  };

  const hideTooltip = () => {
    setTooltip(null);
    setHoveredItem(null);
  };

  // Always show 6 item slots (max inventory)
  const MAX_ITEM_SLOTS = 6;
  const itemSlots = Array.from({ length: MAX_ITEM_SLOTS }, (_, index) => {
    return consumableItems[index] || null;
  });

  return (
    <div className="item-bar">
      <div className="item-bar-title">Usable Items</div>
      <div className="item-bar-items">
        {itemSlots.map((usableItem, index) => {
          if (!usableItem) {
            // Empty slot
            return (
              <div key={`empty-${index}`} className="item-bar-slot">
                <button className="item-bar-btn empty-slot" disabled>
                  <div className="item-icon">
                    <span>-</span>
                  </div>
                </button>
              </div>
            );
          }

          const item = usableItem.item;
          const isSelected = selectedItemId === item.id;

          return (
            <div
              key={item.id}
              className="item-bar-slot"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={hideTooltip}
              onMouseMove={(e) => showTooltip(e, item.id)}
            >
              <button
                className={`item-bar-btn ${!canUse ? 'disabled' : ''} ${isSelected ? 'selected' : ''} rarity-${item.rarity}`}
                onClick={() => onSelectItem(item.id)}
              >
                <div className="item-icon">
                  {item.imagePath ? (
                    <img src={item.imagePath} alt={item.name} />
                  ) : (
                    <span>🧪</span>
                  )}
                </div>
                <div className="item-quantity">{usableItem.quantity}</div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Fixed Position Tooltip */}
      {tooltip && hoveredItem && (
        (() => {
          const item = consumableItems.find(i => i.item.id === tooltip.itemId)?.item;
          return item ? (
            <div
              ref={tooltipRef}
              className="item-tooltip-container"
              style={{
                left: `${tooltip.position.x}px`,
                top: `${tooltip.position.y}px`,
              }}
            >
              <div className="item-tooltip-header">
                <span className={`item-name rarity-${item.rarity}`}>{item.name}</span>
                <span className="item-rarity">{item.rarity}</span>
              </div>
              <div className="item-tooltip-description">
                {item.description}
              </div>
              {item.onUseEffect && (
                <div className="item-tooltip-effect">
                  <strong>On Use:</strong> {item.onUseEffect}
                </div>
              )}
              <div className="item-tooltip-hint">
                Click to select
              </div>
            </div>
          ) : null;
        })()
      )}
    </div>
  );
};

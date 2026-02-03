import React, { useState } from 'react';
import { Tooltip } from '../../shared/Tooltip';
import './ItemBar.css';

interface ItemBarProps {
  usableItems: Array<{ itemId: string; item: any; quantity: number }>;
  onSelectItem: (itemId: string) => void;
  selectedItemId: string | null;
  canUse: boolean;
}

export const ItemBar: React.FC<ItemBarProps> = ({ usableItems, onSelectItem, selectedItemId, canUse }) => {
  const [tooltipData, setTooltipData] = useState<{ itemId: string; position: { x: number; y: number } } | null>(null);

  const handleItemMouseEnter = (itemId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipData({
      itemId,
      position: { x: rect.left + rect.width / 2, y: rect.bottom }
    });
  };

  const handleItemMouseLeave = () => {
    setTooltipData(null);
  };

  // Filter to only show consumable items (safety check)
  const consumableItems = usableItems.filter(item => item.item?.consumable === true);

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
            >
              <button
                className={`item-bar-btn ${!canUse ? 'disabled' : ''} ${isSelected ? 'selected' : ''} rarity-${item.rarity}`}
                onClick={() => onSelectItem(item.id)}
                onMouseEnter={(e) => handleItemMouseEnter(item.id, e)}
                onMouseLeave={handleItemMouseLeave}
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
      
      {tooltipData && (
        <Tooltip
          content={{ type: 'item', itemId: tooltipData.itemId }}
          position={tooltipData.position}
        />
      )}
    </div>
  );
};

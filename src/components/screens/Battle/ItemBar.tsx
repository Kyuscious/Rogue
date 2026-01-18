import React, { useState, useRef, useEffect } from 'react';
import './ItemBar.css';

interface ItemBarProps {
  usableItems: Array<{ itemId: string; item: any; quantity: number }>;
  onUseItem: (itemId: string) => void;
  canUse: boolean;
}

export const ItemBar: React.FC<ItemBarProps> = ({ usableItems, onUseItem, canUse }) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('top');
  const tooltipRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Adjust tooltip position to keep it within viewport
  useEffect(() => {
    if (hoveredItem && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      // Check if tooltip goes off the top of the viewport
      if (tooltipRect.top < 10) {
        setTooltipPosition('bottom');
      }
      // Check if tooltip goes off the left or right
      else if (tooltipRect.left < 10 || tooltipRect.right > window.innerWidth - 10) {
        // Keep it top but it will be clamped by max-width
        setTooltipPosition('top');
      }
      else {
        setTooltipPosition('top');
      }
    }
  }, [hoveredItem]);

  if (usableItems.length === 0) {
    return null;
  }

  return (
    <div className="item-bar">
      <div className="item-bar-title">Usable Items</div>
      <div className="item-bar-items">
        {usableItems.map((usableItem) => {
          const item = usableItem.item;
          const isHovered = hoveredItem === item.id;

          return (
            <div
              key={item.id}
              ref={(el) => {
                if (el) {
                  slotRefs.current.set(item.id, el);
                } else {
                  slotRefs.current.delete(item.id);
                }
              }}
              className="item-bar-slot"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <button
                className={`item-bar-btn ${!canUse ? 'disabled' : ''} rarity-${item.rarity}`}
                onClick={() => canUse && onUseItem(item.id)}
                disabled={!canUse}
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

              {/* Tooltip */}
              {isHovered && (
                <div 
                  ref={tooltipRef}
                  className={`item-tooltip ${tooltipPosition}`}
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
                    Click to use (consumes 1)
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useGameStore } from '../../game/store';
import { getItemById } from '../../game/items';
import './ItemsBar.css';

export const ItemsBar: React.FC = () => {
  const { state } = useGameStore();
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTotalTooltip, setShowTotalTooltip] = useState(false);
  const [totalTooltipPosition, setTotalTooltipPosition] = useState({ x: 0, y: 0 });

  if (state.inventory.length === 0) return null;

  // Calculate total stats from all items
  const calculateTotalStats = () => {
    const totals: any = {};
    state.inventory.forEach((item) => {
      const itemData = getItemById(item.itemId);
      if (itemData) {
        Object.entries(itemData.stats).forEach(([stat, value]) => {
          if (value && value > 0) {
            totals[stat] = (totals[stat] || 0) + (value * item.quantity);
          }
        });
      }
    });
    return totals;
  };

  const totalStats = calculateTotalStats();

  // Get item icon
  const getItemIcon = (name: string) => {
    if (name.includes('Blade')) return '⚔️';
    if (name.includes('Shield')) return '🛡️';
    if (name.includes('Ring')) return '💍';
    return '📦';
  };

  return (
    <div className="items-bar">
      <div className="items-bar-container">
        {/* Total Icon */}
        <div
          className="item-icon-slot total-slot"
          onMouseEnter={(e) => {
            setShowTotalTooltip(true);
            const rect = e.currentTarget.getBoundingClientRect();
            setTotalTooltipPosition({
              x: rect.left,
              y: rect.bottom + 5,
            });
          }}
          onMouseLeave={() => setShowTotalTooltip(false)}
        >
          <span className="total-icon">Σ</span>
        </div>

        {/* Item Slots */}
        {state.inventory.map((item, idx) => {
          const itemData = getItemById(item.itemId);
          if (!itemData) return null;

          return (
            <div
              key={idx}
              className={`item-icon-slot rarity-${itemData.rarity}`}
              onMouseEnter={(e) => {
                setHoveredItemId(item.itemId);
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltipPosition({
                  x: rect.left,
                  y: rect.bottom + 5,
                });
              }}
              onMouseLeave={() => setHoveredItemId(null)}
            >
              <span className="item-icon">{getItemIcon(itemData.name)}</span>
              {item.quantity > 1 && <span className="item-qty">x{item.quantity}</span>}
            </div>
          );
        })}
      </div>

      {/* Total Stats Tooltip */}
      {showTotalTooltip && Object.keys(totalStats).length > 0 && (
        <div className="item-tooltip-bar total-tooltip" style={{ left: `${totalTooltipPosition.x}px`, top: `${totalTooltipPosition.y}px` }}>
          <h4 className="tooltip-item-name">Total Stats</h4>
          <p className="tooltip-item-description">Combined stats from all items</p>
          <div className="tooltip-item-stats">
            {totalStats.attackDamage && (
              <div className="tooltip-stat">⚔️ AD: +{totalStats.attackDamage}</div>
            )}
            {totalStats.abilityPower && (
              <div className="tooltip-stat">✨ AP: +{totalStats.abilityPower}</div>
            )}
            {totalStats.armor && (
              <div className="tooltip-stat">🛡️ Armor: +{totalStats.armor}</div>
            )}
            {totalStats.magicResist && (
              <div className="tooltip-stat">🔮 MR: +{totalStats.magicResist}</div>
            )}
            {totalStats.health && (
              <div className="tooltip-stat">❤️ HP: +{totalStats.health}</div>
            )}
            {totalStats.attackSpeed && (
              <div className="tooltip-stat">⚡ AS: +{totalStats.attackSpeed}</div>
            )}
            {totalStats.lifeSteal && (
              <div className="tooltip-stat">💉 Lifesteal: +{totalStats.lifeSteal}</div>
            )}
          </div>
        </div>
      )}

      {/* Single Item Tooltip */}
      {hoveredItemId && getItemById(hoveredItemId) && (() => {
        const itemData = getItemById(hoveredItemId);
        const inventoryItem = state.inventory.find(i => i.itemId === hoveredItemId);
        const quantity = inventoryItem?.quantity || 1;
        const isStacked = quantity > 1;

        return (
          <>
            {/* Single Item Stats */}
            <div className="item-tooltip-bar" style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }}>
              <h4 className="tooltip-item-name">{itemData?.name} {isStacked && '(×1)'}</h4>
              <p className="tooltip-item-description">{itemData?.description}</p>
              <div className="tooltip-item-stats">
                {itemData?.stats.attackDamage && (
                  <div className="tooltip-stat">⚔️ AD: +{itemData.stats.attackDamage}</div>
                )}
                {itemData?.stats.abilityPower && (
                  <div className="tooltip-stat">✨ AP: +{itemData.stats.abilityPower}</div>
                )}
                {itemData?.stats.armor && (
                  <div className="tooltip-stat">🛡️ Armor: +{itemData.stats.armor}</div>
                )}
                {itemData?.stats.magicResist && (
                  <div className="tooltip-stat">🔮 MR: +{itemData.stats.magicResist}</div>
                )}
                {itemData?.stats.health && (
                  <div className="tooltip-stat">❤️ HP: +{itemData.stats.health}</div>
                )}
                {itemData?.stats.attackSpeed && (
                  <div className="tooltip-stat">⚡ AS: +{itemData.stats.attackSpeed}</div>
                )}
                {itemData?.stats.lifeSteal && (
                  <div className="tooltip-stat">💉 Lifesteal: +{itemData.stats.lifeSteal}</div>
                )}
              </div>
              {itemData?.passive && (
                <div className="tooltip-item-passive">
                  <strong>Passive:</strong> {itemData.passive}
                </div>
              )}
            </div>

            {/* Stacked Total Tooltip (only if quantity > 1) */}
            {isStacked && (
              <div className="item-tooltip-bar stack-tooltip" style={{ left: `${tooltipPosition.x + 260}px`, top: `${tooltipPosition.y}px` }}>
                <h4 className="tooltip-item-name">{itemData?.name} (×{quantity})</h4>
                <p className="tooltip-item-description">Total from stack</p>
                <div className="tooltip-item-stats">
                  {itemData?.stats.attackDamage && (
                    <div className="tooltip-stat">⚔️ AD: +{itemData.stats.attackDamage * quantity}</div>
                  )}
                  {itemData?.stats.abilityPower && (
                    <div className="tooltip-stat">✨ AP: +{itemData.stats.abilityPower * quantity}</div>
                  )}
                  {itemData?.stats.armor && (
                    <div className="tooltip-stat">🛡️ Armor: +{itemData.stats.armor * quantity}</div>
                  )}
                  {itemData?.stats.magicResist && (
                    <div className="tooltip-stat">🔮 MR: +{itemData.stats.magicResist * quantity}</div>
                  )}
                  {itemData?.stats.health && (
                    <div className="tooltip-stat">❤️ HP: +{itemData.stats.health * quantity}</div>
                  )}
                  {itemData?.stats.attackSpeed && (
                    <div className="tooltip-stat">⚡ AS: +{itemData.stats.attackSpeed * quantity}</div>
                  )}
                  {itemData?.stats.lifeSteal && (
                    <div className="tooltip-stat">💉 Lifesteal: +{itemData.stats.lifeSteal * quantity}</div>
                  )}
                </div>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
};

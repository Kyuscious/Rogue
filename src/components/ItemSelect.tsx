import React, { useState } from 'react';
import { STARTING_ITEMS } from '../game/items';
import './ItemSelect.css';

interface ItemSelectProps {
  onItemSelected: (itemId: string) => void;
}

export const ItemSelect: React.FC<ItemSelectProps> = ({ onItemSelected }) => {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const handleItemSelect = (itemId: string) => {
    onItemSelected(itemId);
  };

  const getHoveredItem = () => {
    if (!hoveredItemId) return null;
    return STARTING_ITEMS.find((item) => item.id === hoveredItemId);
  };

  const hoveredItem = getHoveredItem();

  return (
    <div className="item-select-screen">
      <div className="item-select-header">
        <h2>Choose Your Starting Item</h2>
        <p>Pick ONE item to begin your journey</p>
      </div>

      <div className="items-grid">
        {STARTING_ITEMS.map((item) => (
          <div 
            key={item.id} 
            className="item-card"
            onMouseEnter={() => setHoveredItemId(item.id)}
            onMouseLeave={() => setHoveredItemId(null)}
          >
            <div className="item-icon">{item.name === "Doran's Blade" ? '⚔️' : item.name === "Doran's Shield" ? '🛡️' : '💍'}</div>
            
            <div className="item-content">
              <h3 className="item-name">{item.name}</h3>
              <p className="item-description">{item.description}</p>

              <div className="item-stats">
                {item.stats.attackDamage && <div className="stat">+{item.stats.attackDamage} AD</div>}
                {item.stats.abilityPower && <div className="stat">+{item.stats.abilityPower} AP</div>}
                {item.stats.armor && <div className="stat">+{item.stats.armor} Armor</div>}
                {item.stats.magicResist && <div className="stat">+{item.stats.magicResist} MR</div>}
                {item.stats.health && <div className="stat">+{item.stats.health} HP</div>}
              </div>

              <div className="item-passive">
                <strong>Passive:</strong> {item.passive}
              </div>
            </div>

            <button 
              className="btn-select-item"
              onClick={() => handleItemSelect(item.id)}
            >
              Select
            </button>
          </div>
        ))}
      </div>

      {hoveredItem && (
        <div className="item-tooltip">
          <h3 className="tooltip-title">{hoveredItem.name}</h3>
          <div className="tooltip-stats">
            {hoveredItem.stats.attackDamage && <div className="tooltip-stat">⚔️ Attack Damage: +{hoveredItem.stats.attackDamage}</div>}
            {hoveredItem.stats.abilityPower && <div className="tooltip-stat">✨ Ability Power: +{hoveredItem.stats.abilityPower}</div>}
            {hoveredItem.stats.armor && <div className="tooltip-stat">🛡️ Armor: +{hoveredItem.stats.armor}</div>}
            {hoveredItem.stats.magicResist && <div className="tooltip-stat">🔮 Magic Resist: +{hoveredItem.stats.magicResist}</div>}
            {hoveredItem.stats.health && <div className="tooltip-stat">❤️ Health: +{hoveredItem.stats.health}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

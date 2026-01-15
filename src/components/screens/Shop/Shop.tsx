import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../../game/store';
import { getItemById } from '../../../game/items';
import './Shop.css';

interface ShopProps {
  onBack: () => void;
  region: string;
}

interface ShopSlot {
  itemId: string;
  hasDiscount: boolean;
  discountPercent: number;
  soldOut: boolean;
}

// Generate random discount (10% to 90%, multiple of 10, weighted toward lower discounts)
const generateDiscount = (): number => {
  const roll = Math.random();
  
  // Weighted distribution:
  // 10-20%: 40% chance
  // 30-40%: 30% chance
  // 50-60%: 20% chance
  // 70-90%: 10% chance
  
  if (roll < 0.4) {
    return Math.random() < 0.5 ? 10 : 20;
  } else if (roll < 0.7) {
    return Math.random() < 0.5 ? 30 : 40;
  } else if (roll < 0.9) {
    return Math.random() < 0.5 ? 50 : 60;
  } else {
    const options = [70, 80, 90];
    return options[Math.floor(Math.random() * options.length)];
  }
};

// Generate initial shop inventory
const generateShopInventory = (): ShopSlot[] => {
  // 3 stat items (equipment)
  const statItems = ['cloth_armor', 'cloth_armor', 'cloth_armor'];
  
  // 2 usable items (consumables)
  const usableItems = ['health_potion', 'health_potion'];
  
  // Combine in alternating pattern: equipment, consumable, equipment, consumable, equipment
  const allItems = [statItems[0], usableItems[0], statItems[1], usableItems[1], statItems[2]];
  
  // Randomly select one slot for discount
  const discountSlotIndex = Math.floor(Math.random() * allItems.length);
  const discountPercent = generateDiscount();
  
  return allItems.map((itemId, index) => ({
    itemId,
    hasDiscount: index === discountSlotIndex,
    discountPercent: index === discountSlotIndex ? discountPercent : 0,
    soldOut: false,
  }));
};

export const Shop: React.FC<ShopProps> = ({ onBack, region }) => {
  const { state, addInventoryItem, addGold, useReroll } = useGameStore();
  
  // Capitalize region name
  const regionName = region.charAt(0).toUpperCase() + region.slice(1);
  const [shopInventory, setShopInventory] = useState<ShopSlot[]>([]);
  
  // Initialize shop on mount
  useEffect(() => {
    setShopInventory(generateShopInventory());
  }, []);
  
  const handleRerollShop = () => {
    if (!useReroll()) {
      // No rerolls available
      return;
    }
    
    // Regenerate shop inventory
    setShopInventory(generateShopInventory());
  };
  
  const handlePurchase = (slotIndex: number) => {
    const slot = shopInventory[slotIndex];
    if (slot.soldOut) return;
    
    const item = getItemById(slot.itemId);
    if (!item) return;
    
    // Calculate final price with discount
    const basePrice = item.price;
    const discount = slot.hasDiscount ? slot.discountPercent : 0;
    const finalPrice = Math.floor(basePrice * (1 - discount / 100));
    
    // Check if player has enough gold
    if (state.gold < finalPrice) {
      return;
    }
    
    // Purchase item
    addGold(-finalPrice);
    addInventoryItem({ itemId: item.id, quantity: 1 });
    
    // Mark item as sold out
    const newInventory = [...shopInventory];
    newInventory[slotIndex] = { ...slot, soldOut: true };
    setShopInventory(newInventory);
  };
  
  const renderShopSlot = (slot: ShopSlot, index: number) => {
    const item = getItemById(slot.itemId);
    if (!item) return null;
    
    const basePrice = item.price;
    const discount = slot.hasDiscount ? slot.discountPercent : 0;
    const finalPrice = Math.floor(basePrice * (1 - discount / 100));
    const canAfford = state.gold >= finalPrice && !slot.soldOut;
    // Positions 2 and 4 (indices 1 and 3) are consumables
    const isUsable = index === 1 || index === 3;
    
    return (
      <div
        key={`${slot.itemId}-${index}`}
        className={`shop-slot ${isUsable ? 'usable-slot' : 'stat-slot'} ${!canAfford ? 'unaffordable' : ''} ${slot.soldOut ? 'sold-out' : ''}`}
      >
        {slot.hasDiscount && !slot.soldOut && (
          <div className="discount-badge">
            -{discount}% OFF
          </div>
        )}
        
        {slot.soldOut && (
          <div className="sold-out-overlay">
            <span className="sold-out-text">SOLD OUT</span>
          </div>
        )}
        
        <div className="shop-item-icon">
          {item.consumable ? '🧪' : '⚔️'}
        </div>
        
        <div className="shop-item-name">{item.name}</div>
        <div className="shop-item-description">{item.description}</div>
        
        {/* Display stats if not consumable */}
        {!item.consumable && Object.keys(item.stats).length > 0 && (
          <div className="shop-item-stats">
            {item.stats.attackDamage && <span>+{item.stats.attackDamage} AD</span>}
            {item.stats.abilityPower && <span>+{item.stats.abilityPower} AP</span>}
            {item.stats.armor && <span>+{item.stats.armor} Armor</span>}
            {item.stats.magicResist && <span>+{item.stats.magicResist} MR</span>}
            {item.stats.health && <span>+{item.stats.health} HP</span>}
            {item.stats.attackSpeed && <span>+{(item.stats.attackSpeed * 100).toFixed(0)}% AS</span>}
            {item.stats.lifeSteal && <span>+{item.stats.lifeSteal}% LS</span>}
            {item.stats.omnivamp && <span>+{item.stats.omnivamp}% Omnivamp</span>}
          </div>
        )}
        
        {/* Display effect if consumable */}
        {item.consumable && item.onUseEffect && (
          <div className="shop-item-effect">{item.onUseEffect}</div>
        )}
        
        {!slot.soldOut && (
          <div className="shop-item-price">
            {slot.hasDiscount && (
              <span className="original-price">{basePrice}g</span>
            )}
            <span className={`final-price ${slot.hasDiscount ? 'discounted' : ''}`}>
              {finalPrice}g
            </span>
          </div>
        )}
        
        <button
          className="shop-buy-button"
          onClick={() => handlePurchase(index)}
          disabled={!canAfford || slot.soldOut}
        >
          {slot.soldOut ? 'Sold Out' : canAfford ? 'Buy' : 'Not enough gold'}
        </button>
      </div>
    );
  };
  
  return (
    <div className="shop-container">
      <div className="shop-header">
        <h2>🏪 {regionName}'s Shop</h2>
        <div className="shop-info">
          <span className="shop-gold">💰 {state.gold}g</span>
          <span className="shop-rerolls">🎲 {state.rerolls} Rerolls</span>
        </div>
      </div>
      
      <div className="shop-grid">
        <h3 className="shop-title">Merchant's Wares</h3>
        <div className="shop-slots-merged">
          {shopInventory.map((slot, index) => renderShopSlot(slot, index))}
        </div>
      </div>
      
      <div className="shop-actions">
        <button
          className="shop-reroll-button"
          onClick={handleRerollShop}
          disabled={state.rerolls <= 0}
        >
          🎲 Reroll Shop ({state.rerolls} left)
        </button>
        
        <button className="shop-back-button" onClick={onBack}>
          ← Back to Path Selection
        </button>
      </div>
    </div>
  );
};

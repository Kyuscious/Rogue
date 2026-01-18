import React, { useEffect } from 'react';
import { useGameStore } from '../../../game/store';
import { getItemById } from '../../../game/items';
import './Shop.css';

interface ShopProps {
  onBack: () => void;
  region: string;
}

export const Shop: React.FC<ShopProps> = ({ onBack, region }) => {
  const { state, addInventoryItem, removeInventoryItem, addGold, useReroll, generateShopInventory, rerollShop, markShopItemSold } = useGameStore();
  
  // Capitalize region name
  const regionName = region.charAt(0).toUpperCase() + region.slice(1);
  
  // Generate shop inventory on mount (only if needed)
  useEffect(() => {
    generateShopInventory();
  }, [generateShopInventory]);
  
  const handleRerollShop = () => {
    if (!useReroll()) {
      // No rerolls available
      return;
    }
    
    // Regenerate shop inventory
    rerollShop();
  };
  
  const handlePurchase = (slotIndex: number) => {
    const slot = state.shopInventory[slotIndex];
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
    
    // Special case: Buying Mejai's Soulstealer with Dark Seal in inventory
    // Swap Dark Seal for Mejai's, preserving Glory stacks
    if (item.id === 'mejais_soulstealer') {
      const hasDarkSeal = state.inventory.some((i: any) => i.itemId === 'dark_seal');
      if (hasDarkSeal) {
        console.log('🔄 Upgrading Dark Seal to Mejai\'s Soulstealer - Glory stacks preserved!');
        // Remove Dark Seal from inventory
        removeInventoryItem('dark_seal');
        // Add Mejai's (the glory_stacks buff in Battle.tsx will automatically use glory_upgraded)
        addInventoryItem({ itemId: item.id, quantity: 1 });
        // Purchase complete
        addGold(-finalPrice);
        markShopItemSold(slotIndex);
        return;
      }
    }
    
    // Normal purchase
    addGold(-finalPrice);
    addInventoryItem({ itemId: item.id, quantity: 1 });
    
    // Mark item as sold out
    markShopItemSold(slotIndex);
  };
  
  const renderShopSlot = (slot: any, index: number) => {
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
          {item.imagePath ? (
            <img src={item.imagePath} alt={item.name} className="shop-item-image" />
          ) : (
            <span>{item.consumable ? '🧪' : '⚔️'}</span>
          )}
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
          {state.shopInventory.map((slot: any, index: number) => renderShopSlot(slot, index))}
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

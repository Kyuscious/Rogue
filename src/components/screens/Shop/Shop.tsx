import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../../game/store';
import { getItemById } from '../../../game/items';
import { getItemName, getItemDescription } from '../../../i18n/helpers';
import { REGION_STARTER_EQUIPMENT } from '../../../game/starterEquipment';
import './Shop.css';

interface ShopProps {
  onBack: () => void;
  region: string;
}

export const Shop: React.FC<ShopProps> = ({ onBack, region }) => {
  const { state, addInventoryItem, removeInventoryItem, addGold, useReroll, generateShopInventory, rerollShop, markShopItemSold, updatePlayerHp } = useGameStore();
  
  // Capitalize region name
  const regionName = region.charAt(0).toUpperCase() + region.slice(1);
  
  // Multi-select state for selling
  const [selectedToSell, setSelectedToSell] = useState<Set<string>>(new Set());
  const [hoveredSellItemId, setHoveredSellItemId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
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
  
  // Get sellable inventory (filter out starter items)
  const getSellableInventory = () => {
    const starterEquip = REGION_STARTER_EQUIPMENT[region as keyof typeof REGION_STARTER_EQUIPMENT];
    const starterWeapon = starterEquip?.weapon;
    const starterSpell = starterEquip?.spell;
    
    return state.inventory.filter(invItem => {
      const item = getItemById(invItem.itemId);
      
      // Exclude starter weapon and spell
      if (starterWeapon && invItem.itemId === starterWeapon) return false;
      if (starterSpell && invItem.itemId === starterSpell) return false;
      
      // Exclude all STARTER rarity items
      if (item?.rarity === 'starter') return false;
      
      return true;
    });
  };
  
  const sellableInventory = getSellableInventory();
  
  const handleToggleSellItem = (itemId: string) => {
    const newSelected = new Set(selectedToSell);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedToSell(newSelected);
  };
  
  const handleSellSelected = () => {
    let totalGold = 0;
    const itemsToRemove: string[] = [];
    
    selectedToSell.forEach(itemId => {
      const item = getItemById(itemId);
      if (item) {
        const sellPrice = Math.floor(item.price * 0.7);
        totalGold += sellPrice;
        itemsToRemove.push(itemId);
      }
    });
    
    // Remove items one by one
    itemsToRemove.forEach(itemId => {
      removeInventoryItem(itemId, 1);
    });
    
    if (totalGold > 0) {
      addGold(totalGold);
      setSelectedToSell(new Set()); // Clear selection after selling
    }
  };
  
  const handleQuickSellItem = (itemId: string) => {
    const item = getItemById(itemId);
    if (item) {
      const sellPrice = Math.floor(item.price * 0.7);
      removeInventoryItem(itemId, 1);
      addGold(sellPrice);
    }
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
        
        // If item has HP stats, heal the player (same as dropping from enemies)
        if (item.stats.health && item.stats.health > 0) {
          const newHp = state.playerCharacter.hp + item.stats.health;
          updatePlayerHp(newHp);
        }
        
        // Purchase complete
        addGold(-finalPrice);
        markShopItemSold(slotIndex);
        return;
      }
    }
    
    // Normal purchase
    addGold(-finalPrice);
    addInventoryItem({ itemId: item.id, quantity: 1 });
    
    // If item has HP stats, heal the player to the new max HP (same as dropping from enemies)
    if (item.stats.health && item.stats.health > 0) {
      // Heal by the item's HP amount so current HP gets the full bonus
      const newHp = state.playerCharacter.hp + item.stats.health;
      updatePlayerHp(newHp);
    }
    
    // Mark item as sold out
    markShopItemSold(slotIndex);
  };
  
  const renderBuySlot = (slot: any, index: number) => {
    const item = getItemById(slot.itemId);
    if (!item) return null;
    
    const basePrice = item.price;
    const discount = slot.hasDiscount ? slot.discountPercent : 0;
    const finalPrice = Math.floor(basePrice * (1 - discount / 100));
    const canAfford = state.gold >= finalPrice && !slot.soldOut;
    const isUseItem = item.consumable;
    const rarityClass = `rarity-${item.rarity}`;
    
    return (
      <div
        key={`buy-${slot.itemId}-${index}`}
        className={`shop-slot buy-slot ${rarityClass} ${isUseItem ? 'usable-slot' : 'stat-slot'} ${!canAfford ? 'unaffordable' : ''} ${slot.soldOut ? 'sold-out' : ''}`}
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
            <img src={item.imagePath} alt={getItemName(item)} className="shop-item-image" />
          ) : (
            <span>{isUseItem ? '🧪' : '⚔️'}</span>
          )}
        </div>
        
        <div className="shop-item-name">{getItemName(item)}</div>
        <div className="shop-item-description">{getItemDescription(item)}</div>
        
        {/* Display stats if not consumable */}
        {!isUseItem && Object.keys(item.stats).length > 0 && (
          <div className="shop-item-stats">
            {item.stats.attackDamage && <span>+{item.stats.attackDamage} AD</span>}
            {item.stats.abilityPower && <span>+{item.stats.abilityPower} AP</span>}
            {item.stats.armor && <span>+{item.stats.armor} Armor</span>}
            {item.stats.magicResist && <span>+{item.stats.magicResist} MR</span>}
            {item.stats.health && <span>+{item.stats.health} HP</span>}
            {item.stats.speed && <span>+{(item.stats.speed * 100).toFixed(0)}% AS</span>}
            {item.stats.lifeSteal && <span>+{item.stats.lifeSteal}% LS</span>}
            {item.stats.omnivamp && <span>+{item.stats.omnivamp}% Omnivamp</span>}
          </div>
        )}
        
        {/* Display effect if consumable */}
        {isUseItem && item.onUseEffect && (
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

  const renderSellIcon = (inventoryItem: any) => {
    const item = getItemById(inventoryItem.itemId);
    if (!item) return null;
    
    const isSelected = selectedToSell.has(inventoryItem.itemId);
    const rarityClass = `rarity-${item.rarity}`;
    const sellPrice = Math.floor(item.price * 0.7);
    
    return (
      <div
        key={`sell-icon-${inventoryItem.itemId}`}
        className={`sell-item-icon ${rarityClass} ${isSelected ? 'selected' : ''}`}
        onClick={() => handleToggleSellItem(inventoryItem.itemId)}
        onMouseEnter={(e) => {
          setHoveredSellItemId(inventoryItem.itemId);
          const rect = e.currentTarget.getBoundingClientRect();
          setTooltipPosition({
            x: rect.left,
            y: rect.bottom + 5,
          });
        }}
        onMouseLeave={() => setHoveredSellItemId(null)}
        title={`Click to select / Right-click to quick sell (${sellPrice}g)`}
        onContextMenu={(e) => {
          e.preventDefault();
          handleQuickSellItem(inventoryItem.itemId);
        }}
      >
        {item.imagePath ? (
          <img src={item.imagePath} alt={getItemName(item)} className="sell-item-image" />
        ) : (
          <span className="sell-item-emoji">{item.consumable ? '🧪' : '⚔️'}</span>
        )}
        {inventoryItem.quantity > 0 && <span className="sell-qty-badge">{inventoryItem.quantity}x</span>}
        {isSelected && <div className="sell-item-checkmark">✓</div>}
      </div>
    );
  };
  
  // Separate shop items into use-items (consumables) and normal items, excluding STARTER rarity
  const useItems = state.shopInventory.filter((slot: any) => {
    const item = getItemById(slot.itemId);
    if (item?.rarity === 'starter') return false; // Exclude STARTER items
    return item?.consumable;
  });
  
  const normalItems = state.shopInventory.filter((slot: any) => {
    const item = getItemById(slot.itemId);
    if (item?.rarity === 'starter') return false; // Exclude STARTER items
    return !item?.consumable;
  });

  return (
    <div className="shop-container">
      <div className="shop-header">
        <h2>🏪 {regionName}'s Shop</h2>
        <div className="shop-info">
          <span className="shop-gold">💰 {state.gold}g</span>
          <span className="shop-rerolls">🎲 {state.rerolls} Rerolls</span>
        </div>
      </div>
      
      {/* BUY SECTION */}
      <div className="shop-buy-section">
        <h3 className="shop-section-title">🛍️ Buy Items</h3>
        
        <div className="shop-buy-grid">
          {/* Use-Items Subsection */}
          <div className="shop-subsection">
            <h4 className="shop-subsection-title">Use Items </h4>
            <div className="shop-use-items-container">
              {useItems.length === 0 ? (
                <div className="shop-empty-message">No use items available</div>
              ) : (
                useItems.map((slot: any) => renderBuySlot(slot, state.shopInventory.indexOf(slot)))
              )}
            </div>
          </div>
          
          {/* Normal Items Subsection */}
          <div className="shop-subsection">
            <h4 className="shop-subsection-title">Normal Items </h4>
            <div className="shop-normal-items-container">
              {normalItems.length === 0 ? (
                <div className="shop-empty-message">No items available</div>
              ) : (
                normalItems.map((slot: any) => renderBuySlot(slot, state.shopInventory.indexOf(slot)))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* SELL SECTION */}
      <div className="shop-sell-section">
        <h3 className="shop-section-title">💵 Sell Items</h3>
        {sellableInventory.length === 0 ? (
          <div className="shop-empty-message">Your inventory is empty</div>
        ) : (
          <>
            <div className="shop-sell-icons-container">
              {sellableInventory.map((inventoryItem: any) => renderSellIcon(inventoryItem))}
            </div>
            
            {/* Sell Tooltip */}
            {hoveredSellItemId && getItemById(hoveredSellItemId) && (() => {
              const itemData = getItemById(hoveredSellItemId);
              const sellPrice = Math.floor((itemData?.price || 0) * 0.7);
              
              return (
                <div className="sell-tooltip" style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }}>
                  <h4 className="tooltip-item-name">{itemData?.name}</h4>
                  <p className="tooltip-item-description">{itemData?.description}</p>
                  <div className="tooltip-sell-price">{sellPrice}g per item (70%)</div>
                </div>
              );
            })()}
            
            {/* Sell Button */}
            <div className="shop-sell-actions">
              <button
                className="shop-multi-sell-button"
                onClick={handleSellSelected}
                disabled={selectedToSell.size === 0}
              >
                💰 Sell Selected ({selectedToSell.size}) 
              </button>
            </div>
          </>
        )}
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

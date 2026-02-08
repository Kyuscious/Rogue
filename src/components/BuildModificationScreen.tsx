import React, { useState } from 'react';
import { Character } from '../game/types';
import { getAvailableClasses, canModifyBuild, discardItem } from '../game/buildModificationSystem';
import { getItemById } from '../game/items';
import { ITEM_TRADES } from '../game/trades';
import '../styles/BuildModificationScreen.css';

interface BuildModificationScreenProps {
  character: Character;
  onConfirm: () => void;
  onCancel: () => void;
}

export const BuildModificationScreen: React.FC<BuildModificationScreenProps> = ({
  character,
  onConfirm,
  onCancel,
}) => {
  const [tab, setTab] = useState<'class' | 'items' | 'stats'>('class');
  const [selectedClass, setSelectedClass] = useState(character.class);
  const [showTrades, setShowTrades] = useState(false);

  if (!canModifyBuild(character)) {
    return (
      <div className="build-modification-screen">
        <div className="error-message">
          <p>You cannot modify your build right now.</p>
          <button onClick={onCancel}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="build-modification-screen">
      <div className="build-mod-container">
        <h1>Modify Your Build</h1>

        <div className="tabs">
          <button 
            className={`tab ${tab === 'class' ? 'active' : ''}`}
            onClick={() => setTab('class')}
          >
            Class
          </button>
          <button 
            className={`tab ${tab === 'items' ? 'active' : ''}`}
            onClick={() => setTab('items')}
          >
            Items
          </button>
          <button 
            className={`tab ${tab === 'stats' ? 'active' : ''}`}
            onClick={() => setTab('stats')}
          >
            Stats
          </button>
        </div>

        {/* Class Tab */}
        {tab === 'class' && (
          <div className="tab-content class-content">
            <h2>Change Your Class</h2>
            <p className="description">
              WARNING: Changing your class will recalculate your stats. This cannot be undone immediately.
            </p>
            
            <div className="class-grid">
              {getAvailableClasses().map((cls) => (
                <div
                  key={cls}
                  className={`class-option ${selectedClass === cls ? 'selected' : ''}`}
                  onClick={() => setSelectedClass(cls as any)}
                >
                  <div className="class-name">{cls.charAt(0).toUpperCase() + cls.slice(1)}</div>
                  <div className="class-description">
                    {/* Placeholder descriptions */}
                    {cls === 'fighter' && 'Balanced offense and defense'}
                    {cls === 'mage' && 'High ability power, lower HP'}
                    {cls === 'marksman' && 'High attack damage, mobile'}
                    {cls === 'assassin' && 'Burst damage, glass cannon'}
                    {cls === 'juggernaut' && 'High HP and armor'}
                    {cls === 'support' && 'Utility and ally buffs'}
                  </div>
                </div>
              ))}
            </div>

            {selectedClass !== character.class && (
              <div className="warning">
                <p>⚠️ You will be changed from <strong>{character.class}</strong> to <strong>{selectedClass}</strong></p>
              </div>
            )}
          </div>
        )}

        {/* Items Tab */}
        {tab === 'items' && (
          <div className="tab-content items-content">
            <h2>Manage Your Items</h2>
            <p className="description">
              Discard items you don't need or remove cursed equipment.
            </p>

            {/* Combine Items Section */}
            <div className="combine-items-section">
              <div className="combine-header">
                <h3>Combine Items</h3>
                <button 
                  className="trade-list-button"
                  onClick={() => setShowTrades(!showTrades)}
                  title="View all possible trades"
                >
                  Trade List
                </button>
              </div>
              <p className="trade-description">
                Common → Rare → Epic → Legendary → Mythic
              </p>
            </div>

            {/* Trade List Modal */}
            {showTrades && (
              <div className="trade-modal-overlay" onClick={() => setShowTrades(false)}>
                <div className="trade-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>All Available Trades</h2>
                    <button 
                      className="modal-close"
                      onClick={() => setShowTrades(false)}
                      title="Close"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="trades-grid">
                    {ITEM_TRADES.map((trade) => {
                      const toItem = getItemById(trade.toItem.itemId);
                      
                      return (
                        <div key={trade.id} className="trade-card">
                          <div className="trade-formula">
                            {trade.fromItems.map((from, idx) => {
                              const item = getItemById(from.itemId);
                              const showQuantity = from.quantity > 1;
                              
                              return (
                                <div key={idx} className="trade-component">
                                  {item?.imagePath && (
                                    <img 
                                      className="item-icon" 
                                      src={item.imagePath} 
                                      alt={item.name || from.itemId}
                                      title={item.name || from.itemId}
                                    />
                                  )}
                                  {(!item?.imagePath || showQuantity) && (
                                    <span className="item-name-small">
                                      {showQuantity && <span className="quantity">{from.quantity}×</span>}
                                      {item?.name || from.itemId}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                            
                            <div className="trade-arrow">→</div>
                            
                            <div className="trade-component result">
                              {toItem?.imagePath && (
                                <img 
                                  className="item-icon" 
                                  src={toItem.imagePath} 
                                  alt={toItem.name || trade.toItem.itemId}
                                  title={toItem.name || trade.toItem.itemId}
                                />
                              )}
                              {(!toItem?.imagePath || trade.toItem.quantity > 1) && (
                                <span className="item-name-small">
                                  {trade.toItem.quantity > 1 && <span className="quantity">{trade.toItem.quantity}×</span>}
                                  {toItem?.name || trade.toItem.itemId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Inventory List */}
            <h3 className="inventory-header">Your Inventory</h3>

            {character.inventory && character.inventory.length > 0 ? (
              <div className="inventory-list">
                {character.inventory.map((item, index) => (
                  <div key={index} className="inventory-item">
                    <div className="item-info">
                      <span className="item-name">{item.itemId}</span>
                      <span className="item-qty">x{item.quantity}</span>
                    </div>
                    <button 
                      className="discard-button"
                      onClick={() => discardItem(character, index)}
                      title="Discard this item"
                    >
                      Discard
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-inventory">No items in inventory</p>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {tab === 'stats' && (
          <div className="tab-content stats-content">
            <h2>Modify Your Stats</h2>
            <p className="description placeholder">
              📋 <strong>Stat modification system - PLACEHOLDER</strong><br/>
              This feature will allow you to redistribute stat points and customize your character's abilities.
            </p>

            <div className="placeholder-stats">
              <div className="stat-row">
                <span>Health:</span>
                <span>{character.stats.health}</span>
              </div>
              <div className="stat-row">
                <span>Attack Damage:</span>
                <span>{character.stats.attackDamage}</span>
              </div>
              <div className="stat-row">
                <span>Ability Power:</span>
                <span>{character.stats.abilityPower}</span>
              </div>
              <div className="stat-row">
                <span>Armor:</span>
                <span>{character.stats.armor}</span>
              </div>
              <div className="stat-row">
                <span>Magic Resist:</span>
                <span>{character.stats.magicResist}</span>
              </div>
            </div>

            <p className="coming-soon">Coming soon: Custom stat respec and point allocation</p>
          </div>
        )}

        <div className="action-buttons">
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm-button" onClick={onConfirm}>
            Confirm Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuildModificationScreen;

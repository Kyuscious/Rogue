import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../../game/store';
import { CharacterClass } from '../../../game/types';
import { getItemById } from '../../../game/items';
import { getClassDescription } from '../../../game/statsSystem';
import { ITEM_TRADES } from '../../../game/trades';
import {
  getOfferedTrades,
  getAvailableClassSwaps,
  executeTrade,
  discardItem,
  ItemTrade,
} from '../../../game/tradeSystem';
import './TradeScreen.css';

interface TradeScreenProps {
  completedRegion: string;
  nextRegion?: string;
  onContinue: () => void;
}

export const TradeScreen: React.FC<TradeScreenProps> = ({ completedRegion, nextRegion, onContinue }) => {
  const state = useGameStore((store) => store.state);
  const setPlayerClass = useGameStore((store) => store.setPlayerClass);
  const [activeTab, setActiveTab] = useState<'trades' | 'class' | 'discard'>('trades');
  const [offeredTrades, setOfferedTrades] = useState<ItemTrade[]>([]);
  const [offeredClasses, setOfferedClasses] = useState<CharacterClass[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<ItemTrade | null>(null);
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [selectedItemToDiscard, setSelectedItemToDiscard] = useState<string | null>(null);
  const [classChanged, setClassChanged] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [showAllTrades, setShowAllTrades] = useState(false);

  // Initialize offered trades and classes on mount
  useEffect(() => {
    const trades = getOfferedTrades(state.inventory, 3);
    const classes = getAvailableClassSwaps(state.playerCharacter.class, 3);
    setOfferedTrades(trades);
    setOfferedClasses(classes);
  }, [state.inventory, state.playerCharacter.class]);

  const handleRerollTrades = () => {
    if (state.rerolls <= 0) return;
    useGameStore.getState().useReroll();
    const trades = getOfferedTrades(state.inventory, 3);
    setOfferedTrades(trades);
    setSelectedTrade(null);
  };

  const handleRerollClasses = () => {
    if (state.rerolls <= 0) return;
    useGameStore.getState().useReroll();
    const classes = getAvailableClassSwaps(state.playerCharacter.class, 3);
    setOfferedClasses(classes);
    setSelectedClass(null);
  };

  const handleExecuteTrade = () => {
    if (!selectedTrade) return;
    const newInventory = executeTrade(state.inventory, selectedTrade);
    useGameStore.getState().state.inventory = newInventory;
    setSelectedTrade(null);
    setActionFeedback(`✓ Traded: ${selectedTrade.description}`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleSwapClass = () => {
    if (!selectedClass || classChanged) return;
    setPlayerClass(selectedClass);
    setClassChanged(true);
    setActionFeedback(`✓ Class changed to ${selectedClass.toUpperCase()}`);
    setSelectedClass(null);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleDiscardItem = () => {
    if (!selectedItemToDiscard) return;
    const newInventory = discardItem(state.inventory, selectedItemToDiscard);
    useGameStore.getState().state.inventory = newInventory;
    setSelectedItemToDiscard(null);
    setActionFeedback(`✓ Item discarded!`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const getItemName = (itemId: string) => {
    const item = getItemById(itemId);
    return item?.name || itemId;
  };

  return (
    <div className="trade-screen">
      <div className="trade-container">
        <h1 className="trade-title">🛍️ Trading Outpost</h1>
        <p className="trade-subtitle">
          Welcome to the trading outpost in {completedRegion}!
        </p>

        {/* Feedback Message */}
        {actionFeedback && (
          <div className="action-feedback">
            {actionFeedback}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="trade-tabs">
          <button
            className={`tab-btn ${activeTab === 'trades' ? 'active' : ''}`}
            onClick={() => setActiveTab('trades')}
          >
            💱 Item Trades
          </button>
          <button
            className={`tab-btn ${activeTab === 'class' ? 'active' : ''}`}
            onClick={() => setActiveTab('class')}
          >
            🔄 Change Class
          </button>
          <button
            className={`tab-btn ${activeTab === 'discard' ? 'active' : ''}`}
            onClick={() => setActiveTab('discard')}
          >
            🗑️ Discard Items
          </button>
        </div>

        {/* Item Trades Tab */}
        {activeTab === 'trades' && (
          <div className="trade-tab-content">
            <div className="trade-header">
              <div className="trade-header-top">
                <h2>Combine Items</h2>
                <button
                  className="trade-list-btn"
                  onClick={() => setShowAllTrades(!showAllTrades)}
                  title="View all possible trades"
                >
                  📋 View All Trades
                </button>
              </div>
              <p className="trade-description">
                Combine common items into rarer ones. Common → Rare → Epic → Legendary → Mythic
              </p>
              <button
                className="reroll-btn"
                onClick={handleRerollTrades}
                disabled={state.rerolls <= 0}
                title={`Rerolls: ${state.rerolls}`}
              >
                🔄 Reroll Trades ({state.rerolls})
              </button>
            </div>

            {/* All Trades Modal */}
            {showAllTrades && (
              <div className="all-trades-modal-overlay" onClick={() => setShowAllTrades(false)}>
                <div className="all-trades-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>All Available Trades</h2>
                    <button 
                      className="modal-close"
                      onClick={() => setShowAllTrades(false)}
                      title="Close"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="all-trades-grid">
                    {ITEM_TRADES.map((trade) => {
                      const toItem = getItemById(trade.toItem.itemId);
                      return (
                        <div key={trade.id} className="all-trade-card">
                          <div className="all-trade-formula">
                            {trade.fromItems.map((from, idx) => {
                              const item = getItemById(from.itemId);
                              const showQuantity = from.quantity > 1;
                              return (
                                <div key={idx} className="all-trade-component">
                                  {item?.imagePath && (
                                    <img
                                      className="all-trade-icon"
                                      src={item.imagePath}
                                      alt={item.name || from.itemId}
                                      title={item.name || from.itemId}
                                    />
                                  )}
                                  {(!item?.imagePath || showQuantity) && (
                                    <span className="all-trade-label">
                                      {showQuantity && <span className="trade-qty">{from.quantity}×</span>}
                                      {item?.name || from.itemId}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                            <div className="all-trade-arrow">→</div>
                            <div className="all-trade-component result">
                              {toItem?.imagePath && (
                                <img
                                  className="all-trade-icon"
                                  src={toItem.imagePath}
                                  alt={toItem.name || trade.toItem.itemId}
                                  title={toItem.name || trade.toItem.itemId}
                                />
                              )}
                              {(!toItem?.imagePath || trade.toItem.quantity > 1) && (
                                <span className="all-trade-label">
                                  {trade.toItem.quantity > 1 && <span className="trade-qty">{trade.toItem.quantity}×</span>}
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

            <div className="trades-list">
              {offeredTrades.length > 0 ? (
                offeredTrades.map(trade => (
                  <div
                    key={trade.id}
                    className={`trade-card ${selectedTrade?.id === trade.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTrade(trade)}
                  >
                    <div className="trade-from">
                      {trade.fromItems.map((item: { itemId: string; quantity: number }, idx: number) => (
                        <div key={idx} className="trade-item">
                          <span className="item-quantity">×{item.quantity}</span>
                          <span className="item-name">{getItemName(item.itemId)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="trade-arrow">→</div>
                    <div className="trade-to">
                      {trade.toItem && (
                        <div className="trade-item">
                          <span className="item-quantity">×{trade.toItem.quantity}</span>
                          <span className="item-name">{getItemName(trade.toItem.itemId)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-trades">No trades available with your current items</p>
              )}
            </div>

            {selectedTrade && (
              <button className="execute-btn" onClick={handleExecuteTrade}>
                ✓ Execute Trade
              </button>
            )}
          </div>
        )}

        {/* Class Swap Tab */}
        {activeTab === 'class' && (
          <div className="trade-tab-content">
            <div className="trade-header">
              <h2>Change Class</h2>
              <p className="trade-description">
                Current Class: <strong>{state.playerCharacter.class}</strong>
                {classChanged && <span style={{ marginLeft: '10px', color: '#4ade80' }}>✓ Changed</span>}
              </p>
              <button
                className="reroll-btn"
                onClick={handleRerollClasses}
                disabled={state.rerolls <= 0 || classChanged}
                title={classChanged ? 'You can only change class once' : `Rerolls: ${state.rerolls}`}
              >
                🔄 Reroll Classes ({state.rerolls})
              </button>
            </div>

            <div className="classes-list">
              {offeredClasses.map(classOption => (
                <div
                  key={classOption}
                  className={`class-card ${selectedClass === classOption ? 'selected' : ''} ${classChanged ? 'disabled' : ''}`}
                  onClick={() => !classChanged && setSelectedClass(classOption)}
                  style={classChanged ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                >
                  <h3>{classOption.toUpperCase()}</h3>
                  <p>{getClassDescription(classOption)}</p>
                </div>
              ))}
            </div>

            {selectedClass && !classChanged && (
              <button 
                className="execute-btn" 
                onClick={handleSwapClass}
              >
                ✓ Change to {selectedClass.toUpperCase()}
              </button>
            )}
            
            {classChanged && (
              <button className="execute-btn" style={{ backgroundColor: '#4ade80', cursor: 'default' }} disabled>
                ✓ Class Changed to {state.playerCharacter.class.toUpperCase()}
              </button>
            )}
          </div>
        )}

        {/* Discard Items Tab */}
        {activeTab === 'discard' && (
          <div className="trade-tab-content">
            <div className="trade-header">
              <h2>Discard Items</h2>
              <p className="trade-description">
                Remove unwanted items from your inventory. This is the only way to unequip items!
              </p>
            </div>

            {state.inventory.length > 0 ? (
              <div className="items-to-discard">
                {state.inventory.map(invItem => {
                  const item = getItemById(invItem.itemId);
                  return (
                    <div
                      key={invItem.itemId}
                      className={`discard-card ${selectedItemToDiscard === invItem.itemId ? 'selected' : ''}`}
                      onClick={() => setSelectedItemToDiscard(invItem.itemId)}
                    >
                      <div className="discard-info">
                        <span className="item-name">{item?.name || invItem.itemId}</span>
                        <span className="item-quantity">×{invItem.quantity}</span>
                      </div>
                      {item && <span className="item-rarity">{item.rarity}</span>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-trades">Your inventory is empty</p>
            )}

            {selectedItemToDiscard && (
              <button className="execute-btn discard-btn" onClick={handleDiscardItem}>
                🗑️ Discard Item
              </button>
            )}
          </div>
        )}

        {/* Continue Button */}
        <button className="continue-btn" onClick={onContinue}>
          Continue to {nextRegion || completedRegion} →
        </button>
      </div>
    </div>
  );
};

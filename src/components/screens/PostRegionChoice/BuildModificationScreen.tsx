import React, { useState } from 'react';
import { useGameStore } from '../../../game/store';
import { 
  getAvailableClasses, 
  changeCharacterClass, 
  modifyStatPoints,
  discardItem,
  removeCurse 
} from '../../../game/buildModificationSystem';
import { getItemById } from '../../../game/itemSystem';
import { getItemName, getItemDescription } from '../../../i18n/helpers';
import './BuildModificationScreen.css';

interface BuildModificationScreenProps {
  onContinue: () => void;
}

type TabType = 'class' | 'stats' | 'items';

export const BuildModificationScreen: React.FC<BuildModificationScreenProps> = ({ onContinue }) => {
  const { state, setPlayerClass } = useGameStore();
  const [activeTab, setActiveTab] = useState<TabType>('class');
  const [selectedClass, setSelectedClass] = useState<string>(state.playerCharacter?.class || '');
  const [statAdjustments, setStatAdjustments] = useState({
    health: 0,
    attackDamage: 0,
    abilityPower: 0,
    armor: 0,
    magicResist: 0,
  });
  const [hasChanges, setHasChanges] = useState(false);

  const availableClasses = getAvailableClasses();
  const playerChar = state.playerCharacter;

  if (!playerChar) {
    return <div>Loading...</div>;
  }

  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    setHasChanges(newClass !== playerChar.class);
  };

  const handleStatAdjustment = (stat: keyof typeof statAdjustments, change: number) => {
    setStatAdjustments(prev => ({
      ...prev,
      [stat]: Math.max(-50, Math.min(50, prev[stat] + change))
    }));
    setHasChanges(true);
  };

  const handleApplyChanges = () => {
    if (selectedClass !== playerChar.class) {
      changeCharacterClass(playerChar, selectedClass as import('../../../game/types').CharacterClass);
      setPlayerClass(selectedClass as import('../../../game/types').CharacterClass);
    }

    const hasStatChanges = Object.values(statAdjustments).some(v => v !== 0);
    if (hasStatChanges) {
      modifyStatPoints(playerChar, {
        health: statAdjustments.health,
        attackDamage: statAdjustments.attackDamage,
        abilityPower: statAdjustments.abilityPower,
        armor: statAdjustments.armor,
        magicResist: statAdjustments.magicResist,
      });
    }

    setHasChanges(false);
    onContinue();
  };

  const handleDiscardItem = (index: number) => {
    if (discardItem(playerChar, index)) {
      setHasChanges(true);
    }
  };

  const handleRemoveCurse = (index: number) => {
    if (removeCurse(playerChar, index, 100)) {
      setHasChanges(true);
    }
  };

  return (
    <div className="build-mod-screen">
      <div className="build-mod-container">
        <h1 className="build-mod-title">🔧 Build Modification</h1>
        <p className="build-mod-subtitle">
          Customize your character before entering the next region
        </p>

        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'class' ? 'active' : ''}`}
            onClick={() => setActiveTab('class')}
          >
            🎭 Class
          </button>
          <button 
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Stats
          </button>
          <button 
            className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            🎒 Items
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'class' && (
            <div className="class-tab">
              <h2>Select Your Class</h2>
              <div className="class-grid">
                {availableClasses.map((className) => (
                  <button
                    key={className}
                    className={`class-card ${selectedClass === className ? 'selected' : ''}`}
                    onClick={() => handleClassChange(className)}
                  >
                    <div className="class-icon">
                      {className === 'fighter' && '⚔️'}
                      {className === 'mage' && '🔮'}
                      {className === 'marksman' && '🏹'}
                      {className === 'assassin' && '🗡️'}
                      {className === 'juggernaut' && '🛡️'}
                      {className === 'support' && '✨'}
                    </div>
                    <div className="class-name">{className.toUpperCase()}</div>
                    {selectedClass === className && <div className="current-badge">CURRENT</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="stats-tab">
              <h2>Adjust Base Stats</h2>
              <p className="stats-info">Redistribute your stat points (±50 per stat)</p>
              
              <div className="stat-adjustments">
                {Object.entries(statAdjustments).map(([stat, value]) => (
                  <div key={stat} className="stat-row">
                    <div className="stat-label">{stat.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div className="stat-controls">
                      <button onClick={() => handleStatAdjustment(stat as keyof typeof statAdjustments, -5)}>-5</button>
                      <button onClick={() => handleStatAdjustment(stat as keyof typeof statAdjustments, -1)}>-1</button>
                      <div className={`stat-value ${value > 0 ? 'positive' : value < 0 ? 'negative' : ''}`}>
                        {value > 0 ? '+' : ''}{value}
                      </div>
                      <button onClick={() => handleStatAdjustment(stat as keyof typeof statAdjustments, 1)}>+1</button>
                      <button onClick={() => handleStatAdjustment(stat as keyof typeof statAdjustments, 5)}>+5</button>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                className="reset-stats-btn"
                onClick={() => {
                  setStatAdjustments({
                    health: 0,
                    attackDamage: 0,
                    abilityPower: 0,
                    armor: 0,
                    magicResist: 0,
                  });
                  setHasChanges(false);
                }}
              >
                Reset All Stats
              </button>
            </div>
          )}

          {activeTab === 'items' && (
            <div className="items-tab">
              <h2>Manage Inventory</h2>
              <div className="inventory-grid">
                {state.inventory.length === 0 ? (
                  <p className="no-items">No items in inventory</p>
                ) : (
                  state.inventory.map((invItem, index) => {
                    const item = getItemById(invItem.itemId);
                    if (!item) return null;

                    return (
                      <div key={index} className="inventory-item">
                        <div className="item-info">
                          <div className="item-name">{getItemName(item)}</div>
                          <div className="item-description">{getItemDescription(item)}</div>
                        </div>
                        <div className="item-actions">
                          {item.cursed && (
                            <button 
                              className="remove-curse-btn"
                              onClick={() => handleRemoveCurse(index)}
                              title="Remove curse (100g)"
                            >
                              ✨ Remove Curse (100g)
                            </button>
                          )}
                          <button 
                            className="discard-btn"
                            onClick={() => handleDiscardItem(index)}
                            title="Discard item"
                          >
                            🗑️ Discard
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button 
            className="apply-btn"
            onClick={handleApplyChanges}
            disabled={!hasChanges}
          >
            {hasChanges ? 'Apply Changes & Continue →' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
};

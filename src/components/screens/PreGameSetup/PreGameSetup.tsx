import React, { useState } from 'react';
import { Region } from '../../../game/types';
import { ITEM_DATABASE } from '../../../game/items';
import { useGameStore } from '../../../game/store';
import './PreGameSetup.css';

interface PreGameSetupProps {
  onStartRun: (region: Region, itemId: string) => void;
  onTestMode: () => void;
  onLogout?: () => void;
  onGoToDisclaimer?: () => void;
}

const REGIONS = [
  { id: 'demacia', name: 'Demacia', unlocked: true, description: 'A strong, lawful kingdom with a prestigious military. Known for its justice and honor.' },
  { id: 'ionia', name: 'Ionia', unlocked: true, description: 'A land of natural magic and spirituality. Home to ancient traditions and martial arts.' },
  { id: 'shurima', name: 'Shurima', unlocked: true, description: 'A vast desert empire of ancient power. Ascended warriors and buried treasures await.' },
];

const STARTER_ITEMS = [
  { id: 'dorans_blade', name: "Doran's Blade", unlocked: true },
  { id: 'dorans_shield', name: "Doran's Shield", unlocked: true },
  { id: 'dorans_ring', name: "Doran's Ring", unlocked: true },
  { id: 'locked_1', name: 'Locked', unlocked: false },
  { id: 'locked_2', name: 'Locked', unlocked: false },
  { id: 'locked_3', name: 'Locked', unlocked: false },
  { id: 'locked_4', name: 'Locked', unlocked: false },
  { id: 'locked_5', name: 'Locked', unlocked: false },
  { id: 'locked_6', name: 'Locked', unlocked: false },
  { id: 'locked_7', name: 'Locked', unlocked: false },
  { id: 'locked_8', name: 'Locked', unlocked: false },
  { id: 'locked_9', name: 'Locked', unlocked: false },
  { id: 'locked_10', name: 'Locked', unlocked: false },
  { id: 'locked_11', name: 'Locked', unlocked: false },
  { id: 'locked_12', name: 'Locked', unlocked: false },
  { id: 'locked_13', name: 'Locked', unlocked: false },
  { id: 'locked_14', name: 'Locked', unlocked: false },
  { id: 'locked_15', name: 'Locked', unlocked: false },
  { id: 'locked_16', name: 'Locked', unlocked: false },
  { id: 'locked_17', name: 'Locked', unlocked: false },
];

export const PreGameSetup: React.FC<PreGameSetupProps> = ({ onStartRun, onTestMode, onLogout, onGoToDisclaimer }) => {
  const { state } = useGameStore();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleRegionClick = (regionId: string, unlocked: boolean) => {
    if (unlocked) {
      setSelectedRegion(regionId);
      setError('');
    }
  };

  const handleItemClick = (itemId: string, unlocked: boolean) => {
    if (unlocked) {
      setSelectedItem(itemId);
      setError('');
    }
  };

  const handleStartRun = () => {
    if (!selectedRegion || !selectedItem) {
      setError('Select a region and an item first!');
      return;
    }
    onStartRun(selectedRegion as Region, selectedItem);
  };

  // Build dynamic title
  let title = 'Start your adventure';
  if (selectedRegion) {
    const region = REGIONS.find(r => r.id === selectedRegion);
    title += ` at ${region?.name}`;
  }
  if (selectedItem) {
    const item = ITEM_DATABASE[selectedItem];
    title += ` with ${item?.name || selectedItem}`;
  }

  return (
    <div className="pregame-setup">
      {/* Header with Disclaimer, Username, and Logout */}
      <div className="setup-header">
        <div className="header-left">
          <button 
            className="disclaimer-link" 
            onClick={onGoToDisclaimer}
            title="View Disclaimer"
          >
            ⓘ Disclaimer
          </button>
          <h2 className="game-title">Runeterrogue</h2>
        </div>
        
        <div className="user-info">
          <span className="username">{state.username}</span>
          <button 
            className="logout-btn" 
            onClick={onLogout}
            title="Logout"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="pregame-header">
        <h1>{title}</h1>
      </div>

      <div className="selection-container">
        {/* Region Selection */}
        <div className="selection-section">
          <h2 className="section-title">Select Your Region</h2>
          <div className="selection-grid regions">
            {REGIONS.map((region) => (
              <div
                key={region.id}
                className={`selection-item ${selectedRegion === region.id ? 'selected' : ''} ${!region.unlocked ? 'locked' : ''}`}
                onClick={() => handleRegionClick(region.id, region.unlocked)}
                title={region.unlocked ? region.description : 'Locked - Complete runs to unlock more regions'}
              >
                {!region.unlocked && <div className="lock-icon">🔒</div>}
                <div className="item-name">{region.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Item Selection */}
        <div className="selection-section">
          <h2 className="section-title">Select Your Starting Item</h2>
          <div className="selection-grid items">
            {STARTER_ITEMS.map((item) => {
              return (
                <div
                  key={item.id}
                  className={`selection-item ${selectedItem === item.id ? 'selected' : ''} ${!item.unlocked ? 'locked' : ''}`}
                  onClick={() => handleItemClick(item.id, item.unlocked)}
                  onMouseEnter={(e) => {
                    if (item.unlocked) {
                      setHoveredItemId(item.id);
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipPosition({
                        x: rect.right + 10,
                        y: rect.top,
                      });
                    }
                  }}
                  onMouseLeave={() => setHoveredItemId(null)}
                  title={!item.unlocked ? 'Locked - Complete runs to unlock more starting items' : undefined}
                >
                {!item.unlocked && <div className="lock-icon">🔒</div>}
                <div className="item-name">{item.name}</div>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Item Tooltip */}
      {hoveredItemId && ITEM_DATABASE[hoveredItemId] && (
        <div className="item-hover-tooltip" style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }}>
          <h4 className="tooltip-item-name">{ITEM_DATABASE[hoveredItemId]?.name}</h4>
          <p className="tooltip-item-description">{ITEM_DATABASE[hoveredItemId]?.description}</p>
          <div className="tooltip-item-stats">
            {ITEM_DATABASE[hoveredItemId]?.stats.attackDamage && (
              <div className="tooltip-stat">⚔️ AD: +{ITEM_DATABASE[hoveredItemId]?.stats.attackDamage}</div>
            )}
            {ITEM_DATABASE[hoveredItemId]?.stats.abilityPower && (
              <div className="tooltip-stat">✨ AP: +{ITEM_DATABASE[hoveredItemId]?.stats.abilityPower}</div>
            )}
            {ITEM_DATABASE[hoveredItemId]?.stats.armor && (
              <div className="tooltip-stat">🛡️ Armor: +{ITEM_DATABASE[hoveredItemId]?.stats.armor}</div>
            )}
            {ITEM_DATABASE[hoveredItemId]?.stats.magicResist && (
              <div className="tooltip-stat">🔮 MR: +{ITEM_DATABASE[hoveredItemId]?.stats.magicResist}</div>
            )}
            {ITEM_DATABASE[hoveredItemId]?.stats.health && (
              <div className="tooltip-stat">❤️ HP: +{ITEM_DATABASE[hoveredItemId]?.stats.health}</div>
            )}
            {ITEM_DATABASE[hoveredItemId]?.stats.attackSpeed && (
              <div className="tooltip-stat">⚡ AS: +{ITEM_DATABASE[hoveredItemId]?.stats.attackSpeed}</div>
            )}
            {ITEM_DATABASE[hoveredItemId]?.stats.lifeSteal && (
              <div className="tooltip-stat">💉 Lifesteal: +{ITEM_DATABASE[hoveredItemId]?.stats.lifeSteal}</div>
            )}
          </div>
          {ITEM_DATABASE[hoveredItemId]?.passive && (
            <div className="tooltip-item-passive">
              <strong>Passive:</strong> {ITEM_DATABASE[hoveredItemId]?.passive}
            </div>
          )}
        </div>
      )}

      {/* Start Button */}
      <div className="start-button-container">
        {error && <div className="error-message">{error}</div>}
        <button className="start-run-btn" onClick={handleStartRun}>
          Start Your Run
        </button>
        <button className="test-mode-btn" onClick={onTestMode}>
          🔬 Test Combat
        </button>
      </div>
    </div>
  );
};

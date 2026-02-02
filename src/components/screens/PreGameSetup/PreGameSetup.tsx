import React, { useState, useEffect } from 'react';
import { Region } from '../../../game/types';
import { ITEM_DATABASE } from '../../../game/items';
import { getStarterItemsWithUnlockStatus } from '../../../game/profileUnlocks';
import './PreGameSetup.css';

interface PreGameSetupProps {
  onStartRun: (region: Region, itemId: string) => void;
  onTestMode: () => void;
  onBack: () => void;
}

const REGIONS = [
  { id: 'demacia', name: 'Demacia', unlocked: true, description: 'A strong, lawful kingdom with a prestigious military. Known for its justice and honor.' },
  { id: 'ionia', name: 'Ionia', unlocked: true, description: 'A land of natural magic and spirituality. Home to ancient traditions and martial arts.' },
  { id: 'shurima', name: 'Shurima', unlocked: true, description: 'A vast desert empire of ancient power. Ascended warriors and buried treasures await.' },
];

export const PreGameSetup: React.FC<PreGameSetupProps> = ({ onStartRun, onTestMode, onBack }) => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [starterItems, setStarterItems] = useState<any[]>([]);

  // Load starter items with unlock status
  useEffect(() => {
    const items = getStarterItemsWithUnlockStatus();
    setStarterItems(items);
  }, []);

  const STARTER_ITEMS = starterItems;

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
      {/* Back to Menu Button */}
      <button className="back-to-menu-btn" onClick={onBack}>
        ← Back to Menu
      </button>

      {/* Dev Test Button - Hidden in corner */}
      <button className="dev-test-btn" onClick={onTestMode} title="Test Combat">
        🔬
      </button>

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
              const itemData = ITEM_DATABASE[item.id];
              return (
                <div
                  key={item.id}
                  className={`selection-item ${selectedItem === item.id ? 'selected' : ''} ${!item.unlocked ? 'locked' : ''}`}
                  onClick={() => handleItemClick(item.id, item.unlocked)}
                >
                {!item.unlocked && <div className="lock-icon">🔒</div>}
                {itemData?.imagePath && (
                  <div className="item-image">
                    <img src={itemData.imagePath} alt={itemData.name} />
                  </div>
                )}
                <div className="item-name">{item.unlocked ? (itemData?.name || item.name) : item.name}</div>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="start-button-container">
        {error && <div className="error-message">{error}</div>}
        <button className="start-run-btn" onClick={handleStartRun}>
          Start Your Run
        </button>
      </div>
    </div>
  );
};

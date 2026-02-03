import React, { useState, useEffect } from 'react';
import { Region } from '../../../game/types';
import { ITEM_DATABASE } from '../../../game/items';
import { getStarterItemsWithUnlockStatus, getUnlockProgress } from '../../../game/profileUnlocks';
import { getRegionDisplayName } from '../../../game/regionGraph';
import { useTranslation } from '../../../hooks/useTranslation';
import { getItemName } from '../../../i18n/helpers';
import { getStarterEquipment } from '../../../game/starterEquipment';
import { Tooltip } from '../../shared/Tooltip';
import './PreGameSetup.css';

interface PreGameSetupProps {
  onStartRun: (region: Region, itemId: string) => void;
  onTestMode: () => void;
  onBack: () => void;
}

const REGIONS: Array<{ id: string; unlocked: boolean; descKey: 'demacia' | 'ionia' | 'shurima' }> = [
  { id: 'demacia', unlocked: true, descKey: 'demacia' },
  { id: 'ionia', unlocked: true, descKey: 'ionia' },
  { id: 'shurima', unlocked: true, descKey: 'shurima' },
];

export const PreGameSetup: React.FC<PreGameSetupProps> = ({ onStartRun, onTestMode, onBack }) => {
  const t = useTranslation();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [starterItems, setStarterItems] = useState<any[]>([]);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

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

  const handleRegionMouseEnter = (regionId: string, unlocked: boolean, e: React.MouseEvent) => {
    if (unlocked) {
      setHoveredRegion(regionId);
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom,
      });
    }
  };

  const handleRegionMouseLeave = () => {
    setHoveredRegion(null);
  };

  const handleItemClick = (itemId: string, unlocked: boolean) => {
    if (unlocked) {
      setSelectedItem(itemId);
      setError('');
    }
  };

  const handleItemMouseEnter = (itemId: string, _unlocked: boolean, e: React.MouseEvent) => {
    setHoveredItem(itemId);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom,
    });
  };

  const handleItemMouseLeave = () => {
    setHoveredItem(null);
  };

  const handleStartRun = () => {
    if (!selectedRegion || !selectedItem) {
      setError(t.preGameSetup.selectRegionAndItem);
      return;
    }
    onStartRun(selectedRegion as Region, selectedItem);
  };

  // Build dynamic title
  let title = t.preGameSetup.startAdventureAt;
  if (selectedRegion) {
    const regionName = getRegionDisplayName(selectedRegion as Region);
    title += ` ${regionName}`;
  }
  if (selectedItem) {
    const item = ITEM_DATABASE[selectedItem];
    title += ` ${t.preGameSetup.startAdventureWith} ${item ? getItemName(item) : selectedItem}`;
  }

  return (
    <div className="pregame-setup">
      {/* Back to Menu Button */}
      <button className="back-to-menu-btn" onClick={onBack}>
        {t.preGameSetup.backToMenu}
      </button>

      {/* Dev Test Button - Hidden in corner */}
      <button className="dev-test-btn" onClick={onTestMode} title={t.preGameSetup.testCombat}>
        🔬
      </button>

      <div className="selection-container">
        {/* Region Selection */}
        <div className="selection-section">
          <h2 className="section-title">{t.preGameSetup.selectRegion}</h2>
          <div className="selection-grid regions">
            {REGIONS.map((region) => (
              <div
                key={region.id}
                className={`selection-item ${selectedRegion === region.id ? 'selected' : ''} ${!region.unlocked ? 'locked' : ''}`}
                onClick={() => handleRegionClick(region.id, region.unlocked)}
                onMouseEnter={(e) => handleRegionMouseEnter(region.id, region.unlocked, e)}
                onMouseLeave={handleRegionMouseLeave}
              >
                {!region.unlocked && <div className="lock-icon">🔒</div>}
                <div className="item-name">{getRegionDisplayName(region.id as Region)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Item Selection */}
        <div className="selection-section">
          <h2 className="section-title">{t.preGameSetup.selectStartingItem}</h2>
          <div className="selection-grid items">
            {STARTER_ITEMS.map((item) => {
              const itemData = ITEM_DATABASE[item.id];
              return (
                <div
                  key={item.id}
                  className={`selection-item ${selectedItem === item.id ? 'selected' : ''} ${!item.unlocked ? 'locked' : ''}`}
                  onClick={() => handleItemClick(item.id, item.unlocked)}
                  onMouseEnter={(e) => handleItemMouseEnter(item.id, item.unlocked, e)}
                  onMouseLeave={handleItemMouseLeave}
                >
                {!item.unlocked && <div className="lock-icon">🔒</div>}
                {itemData?.imagePath && (
                  <div className="item-image">
                    <img src={itemData.imagePath} alt={itemData ? getItemName(itemData) : item.name} />
                  </div>
                )}
                <div className="item-name">{itemData ? getItemName(itemData) : item.name}</div>
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
          {t.preGameSetup.startYourRun}
        </button>
      </div>

      {/* Tooltips */}
      {hoveredRegion && (() => {
        const equipment = getStarterEquipment(hoveredRegion as Region);
        return (
          <Tooltip
            position={tooltipPosition}
            content={{
              type: 'region',
              regionWeaponId: equipment.weapon,
              regionSpellId: equipment.spell,
            }}
          />
        );
      })()}

      {hoveredItem && (() => {
        const item = STARTER_ITEMS.find(i => i.id === hoveredItem);
        if (!item) return null;
        
        if (item.unlocked) {
          return (
            <Tooltip
              position={tooltipPosition}
              content={{
                type: 'item',
                itemId: hoveredItem,
              }}
            />
          );
        } else {
          const progress = getUnlockProgress(hoveredItem);
          return (
            <Tooltip
              position={tooltipPosition}
              content={{
                type: 'locked-item',
                lockedItemId: hoveredItem,
                unlockRequirement: item.requirement.description,
                unlockProgress: progress || undefined,
              }}
            />
          );
        }
      })()}
    </div>
  );
};

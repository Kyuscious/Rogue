import React, { useState, useEffect } from 'react';
import { Region } from '../../../game/types';
import { ITEM_DATABASE, getPassiveDescription } from '../../../game/items';
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
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
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
              const itemData = ITEM_DATABASE[item.id];
              return (
                <div
                  key={item.id}
                  className={`selection-item ${selectedItem === item.id ? 'selected' : ''} ${!item.unlocked ? 'locked' : ''}`}
                  onClick={() => handleItemClick(item.id, item.unlocked)}
                  onMouseEnter={(e) => {
                    setHoveredItemId(item.id);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipPosition({
                      x: rect.right + 10,
                      y: rect.top,
                    });
                  }}
                  onMouseLeave={() => setHoveredItemId(null)}
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

      {/* Item Tooltip - Show for both unlocked items and locked items with progress */}
      {hoveredItemId && (
        <div className="item-hover-tooltip" style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }}>
          {(() => {
            const starterItem = starterItems.find(item => item.id === hoveredItemId);
            const isLocked = starterItem && !starterItem.unlocked;
            
            if (isLocked && starterItem) {
              // Show unlock progress for locked items
              return (
                <>
                  <h4 className="tooltip-item-name">{starterItem.name}</h4>
                  <p className="tooltip-unlock-requirement">
                    🔒 Locked: {starterItem.requirement.description} ({starterItem.unlockProgress})
                  </p>
                  <p className="tooltip-item-description">
                    {ITEM_DATABASE[hoveredItemId]?.description}
                  </p>
                </>
              );
            }
            
            // Show normal item tooltip for unlocked items
            return ITEM_DATABASE[hoveredItemId] ? (
            <>
              <h4 className="tooltip-item-name">{ITEM_DATABASE[hoveredItemId]?.name}</h4>
              <p className="tooltip-item-description">{ITEM_DATABASE[hoveredItemId]?.description}</p>
              <div className="tooltip-item-stats">
                {ITEM_DATABASE[hoveredItemId]?.stats.attackDamage && (
                  <div className="tooltip-stat">⚔️ AD: +{ITEM_DATABASE[hoveredItemId]?.stats.attackDamage}</div>
                )}
                {ITEM_DATABASE[hoveredItemId]?.stats.abilityPower && (
                  <div className="tooltip-stat">✨ AP: +{ITEM_DATABASE[hoveredItemId]?.stats.abilityPower}</div>
                )}
                {ITEM_DATABASE[hoveredItemId]?.stats.health && (
                  <div className="tooltip-stat">❤️ HP: +{ITEM_DATABASE[hoveredItemId]?.stats.health}</div>
                )}
                {ITEM_DATABASE[hoveredItemId]?.stats.health_regen && (
                  <div className="tooltip-stat">💚 HP Regen: +{ITEM_DATABASE[hoveredItemId]?.stats.health_regen}</div>
                )}
                {ITEM_DATABASE[hoveredItemId]?.stats.armor && (
                  <div className="tooltip-stat">🛡️ Armor: +{ITEM_DATABASE[hoveredItemId]?.stats.armor}</div>
                )}
                {ITEM_DATABASE[hoveredItemId]?.stats.magicResist && (
                  <div className="tooltip-stat">🔮 MR: +{ITEM_DATABASE[hoveredItemId]?.stats.magicResist}</div>
                )}
                {ITEM_DATABASE[hoveredItemId]?.stats.attackSpeed && (
                  <div className="tooltip-stat">⚡ AS: +{ITEM_DATABASE[hoveredItemId]?.stats.attackSpeed}</div>
                )}
                {ITEM_DATABASE[hoveredItemId]?.stats.criticalChance && (
                  <div className="tooltip-stat">🎯 Crit: +{ITEM_DATABASE[hoveredItemId]?.stats.criticalChance}%</div>
                )}
                {ITEM_DATABASE[hoveredItemId]?.stats.criticalDamage && (
                  <div className="tooltip-stat">💥 Crit Dmg: +{ITEM_DATABASE[hoveredItemId]?.stats.criticalDamage}%</div>
                )}
                {ITEM_DATABASE[hoveredItemId]?.stats.lifeSteal && (
                  <div className="tooltip-stat">💉 Lifesteal: +{ITEM_DATABASE[hoveredItemId]?.stats.lifeSteal}%</div>
                )}
                {ITEM_DATABASE[hoveredItemId]?.stats.omnivamp && (
                  <div className="tooltip-stat">🩸 Omnivamp: +{ITEM_DATABASE[hoveredItemId]?.stats.omnivamp}%</div>
                )}
                {ITEM_DATABASE[hoveredItemId]?.stats.lethality && (
                  <div className="tooltip-stat">🗡️ Lethality: +{ITEM_DATABASE[hoveredItemId]?.stats.lethality}</div>
                )}
                {ITEM_DATABASE[hoveredItemId]?.stats.abilityHaste && (
                  <div className="tooltip-stat">⏱️ Ability Haste: +{ITEM_DATABASE[hoveredItemId]?.stats.abilityHaste}</div>
                )}
                {ITEM_DATABASE[hoveredItemId]?.stats.magicPenetration && (
                  <div className="tooltip-stat">🌟 Magic Pen: +{ITEM_DATABASE[hoveredItemId]?.stats.magicPenetration}</div>
                )}
                {ITEM_DATABASE[hoveredItemId]?.stats.movementSpeed && (
                  <div className="tooltip-stat">👟 Move Speed: +{ITEM_DATABASE[hoveredItemId]?.stats.movementSpeed}</div>
                )}
                {ITEM_DATABASE[hoveredItemId]?.stats.tenacity && (
                  <div className="tooltip-stat">💪 Tenacity: +{ITEM_DATABASE[hoveredItemId]?.stats.tenacity}%</div>
                )}
                {ITEM_DATABASE[hoveredItemId]?.stats.goldGain && (
                  <div className="tooltip-stat">💰 Gold Gain: +{ITEM_DATABASE[hoveredItemId]?.stats.goldGain}%</div>
                )}
                {ITEM_DATABASE[hoveredItemId]?.stats.xpGain && (
                  <div className="tooltip-stat">📚 XP Gain: +{ITEM_DATABASE[hoveredItemId]?.stats.xpGain}%</div>
                )}
                {ITEM_DATABASE[hoveredItemId]?.stats.magicFind && (
                  <div className="tooltip-stat">🔍 Magic Find: +{ITEM_DATABASE[hoveredItemId]?.stats.magicFind}%</div>
                )}
              </div>
              {ITEM_DATABASE[hoveredItemId]?.passiveId && getPassiveDescription(ITEM_DATABASE[hoveredItemId].passiveId!) && (
                <div className="tooltip-item-passive">
                  <strong>Passive:</strong> {getPassiveDescription(ITEM_DATABASE[hoveredItemId].passiveId!)}
                </div>
              )}
            </>
            ) : null;
          })()}
        </div>
      )}

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

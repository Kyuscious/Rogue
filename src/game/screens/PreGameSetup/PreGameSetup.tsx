import React, { useState, useEffect } from 'react';
import { Region } from '@game/types';
import { ITEM_DATABASE } from '@data/items';
import { getStarterItemsWithUnlockStatus, getUnlockProgress } from '../MainMenu/Profiles/profileUnlocks';
import { getRegionDisplayName } from '../PostRegionChoice/regionGraph';
import { useTranslation } from '../../../hooks/useTranslation';
import { getItemName } from '../../../i18n/helpers';
import { getStarterEquipment } from './starterEquipment';
import { Tooltip } from '../../shared/Tooltip';
import './PreGameSetup.css';

interface PreGameSetupProps {
  onStartRun: (region: Region, itemId: string) => void;
  onTestMode: () => void;
  onBack: () => void;
  onTutorial?: () => void;
  tutorialEnabled?: boolean;
  onTutorialComplete?: () => void;
  onTutorialSkip?: () => void;
}

type PreGameTutorialStep = 'intro' | 'region' | 'regionConfirm' | 'startingitem' | 'itemConfirm' | 'start' | 'done';

const REGIONS: Array<{ id: string; unlocked: boolean; descKey: 'demacia' | 'ionia' | 'shurima' }> = [
  { id: 'demacia', unlocked: true, descKey: 'demacia' },
  { id: 'ionia', unlocked: true, descKey: 'ionia' },
  { id: 'shurima', unlocked: true, descKey: 'shurima' },
];

export const PreGameSetup: React.FC<PreGameSetupProps> = ({
  onStartRun,
  onTestMode,
  onBack,
  onTutorial,
  tutorialEnabled = false,
  onTutorialComplete,
  onTutorialSkip,
}) => {
  const t = useTranslation();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [starterItems, setStarterItems] = useState<any[]>([]);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tutorialStep, setTutorialStep] = useState<PreGameTutorialStep>(tutorialEnabled ? 'intro' : 'done');

  const isTutorialActive = tutorialEnabled && tutorialStep !== 'done';
  const isIntroStep = tutorialStep === 'intro';
  const isStartStep = tutorialStep === 'start';
  const isBlockingTutorialStep = isTutorialActive && !isStartStep;
  const isRegionStep = tutorialStep === 'region' || tutorialStep === 'regionConfirm';
  const isItemStep = tutorialStep === 'startingitem' || tutorialStep === 'itemConfirm';
  const canInteractRegion = !isBlockingTutorialStep || isRegionStep;
  const canInteractItem = !isBlockingTutorialStep || isItemStep;

  useEffect(() => {
    if (tutorialEnabled) {
      setTutorialStep('intro');
      return;
    }
    setTutorialStep('done');
  }, [tutorialEnabled]);

  // Load starter items with unlock status
  useEffect(() => {
    const items = getStarterItemsWithUnlockStatus();
    setStarterItems(items);
  }, []);

  const STARTER_ITEMS = starterItems;

  const handleRegionClick = (regionId: string, unlocked: boolean) => {
    if (unlocked && canInteractRegion) {
      setSelectedRegion(regionId);
      setError('');
      if (isTutorialActive && tutorialStep === 'region') {
        setTutorialStep('regionConfirm');
      }
    }
  };

  const handleRegionMouseEnter = (regionId: string, unlocked: boolean, e: React.MouseEvent) => {
    if (unlocked && canInteractRegion) {
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
    if (unlocked && canInteractItem) {
      setSelectedItem(itemId);
      setError('');
      if (isTutorialActive && tutorialStep === 'startingitem') {
        setTutorialStep('itemConfirm');
      }
    }
  };

  const handleItemMouseEnter = (itemId: string, _unlocked: boolean, e: React.MouseEvent) => {
    if (!canInteractItem) return;
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
    if (isBlockingTutorialStep) {
      setError(t.tutorial.preGameSetup.finishTutorial);
      return;
    }

    if (!selectedRegion || !selectedItem) {
      setError(t.preGameSetup.selectRegionAndItem);
      return;
    }

    if (isTutorialActive && tutorialStep === 'start') {
      setTutorialStep('done');
      onTutorialComplete?.();
    }

    onStartRun(selectedRegion as Region, selectedItem);
  };

  const handleTutorialConfirm = () => {
    if (!isTutorialActive) return;

    if (tutorialStep === 'regionConfirm') {
      if (!selectedRegion) {
        setError(t.tutorial.preGameSetup.regionNeedSelection);
        return;
      }
      setTutorialStep('startingitem');
      setError('');
      return;
    }

    if (tutorialStep === 'itemConfirm') {
      if (!selectedItem) {
        setError(t.tutorial.preGameSetup.itemNeedSelection);
        return;
      }
      setTutorialStep('start');
      setError('');
    }
  };

  const handleTutorialContinue = () => {
    if (!isTutorialActive) return;

    if (tutorialStep === 'intro') {
      setTutorialStep('region');
    }
  };

  const getTutorialText = () => {
    if (tutorialStep === 'intro') {
      return t.tutorial.preGameSetup.intro;
    }

    if (tutorialStep === 'region') {
      return t.tutorial.preGameSetup.region;
    }

    if (tutorialStep === 'regionConfirm') {
      if (!selectedRegion) return t.tutorial.preGameSetup.regionNeedSelection;
      return t.tutorial.preGameSetup.regionSelected.replace(
        '{{region}}',
        getRegionDisplayName(selectedRegion as Region)
      );
    }

    if (tutorialStep === 'startingitem') {
      return t.tutorial.preGameSetup.startingitem;
    }

    if (tutorialStep === 'itemConfirm') {
      if (!selectedItem) return t.tutorial.preGameSetup.itemNeedSelection;
      const item = ITEM_DATABASE[selectedItem];
      const itemName = item ? getItemName(item) : selectedItem;
      return t.tutorial.preGameSetup.itemSelected.replace('{{item}}', itemName);
    }

    if (tutorialStep === 'start') {
      return t.tutorial.preGameSetup.start;
    }

    return '';
  };

  const tutorialText = getTutorialText();

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
    <div className={`pregame-setup ${isTutorialActive ? 'tutorial-active' : ''}`}>
      {/* Back to Menu Button */}
      <button className="back-to-menu-btn" onClick={onBack} disabled={isBlockingTutorialStep}>
        {t.preGameSetup.backToMenu}
      </button>

      {/* Dev Test Button - Hidden in corner */}
      <button className="dev-test-btn" onClick={onTestMode} title={t.preGameSetup.testCombat} disabled={isBlockingTutorialStep}>
        🔬
      </button>

      <button className="tutorial-reenable-btn" onClick={onTutorial} title={t.tutorial.reenable}>
        <span>Start tutorial</span>
        <span className="tutorial-reenable-icon">❔</span>
      </button>

      {isTutorialActive && <div className="tutorial-overlay" />}

      <div className="selection-container">
        {/* Region Selection */}
        <div className={`selection-section ${isTutorialActive ? (isRegionStep ? 'tutorial-highlight' : isIntroStep || isItemStep ? 'tutorial-muted' : '') : ''}`}>
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
        <div className={`selection-section ${isTutorialActive ? (isItemStep ? 'tutorial-highlight' : isIntroStep || isRegionStep ? 'tutorial-muted' : '') : ''}`}>
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
      <div className={`start-button-container ${isTutorialActive ? (isStartStep ? 'tutorial-highlight' : 'tutorial-muted') : ''}`}>
        {error && <div className="error-message">{error}</div>}
        <button className="start-run-btn" onClick={handleStartRun} disabled={isBlockingTutorialStep}>
          {t.preGameSetup.startYourRun}
        </button>
      </div>

      {isTutorialActive && (
        <div className="tutorial-dialogue-box">
          <button className="tutorial-skip-top-btn" onClick={onTutorialSkip}>
            {t.tutorial.skip}
          </button>
          <div className="tutorial-character">🧙</div>
          <div className="tutorial-dialogue-content">
            <p className="tutorial-speaker-name">{t.tutorial.npcName}</p>
            <p className="tutorial-dialogue-text">{tutorialText}</p>
            <div className="tutorial-dialogue-actions">
              {tutorialStep === 'intro' && (
                <button className="tutorial-action-btn" onClick={handleTutorialContinue}>
                  {t.common.continue}
                </button>
              )}
              {(tutorialStep === 'regionConfirm' || tutorialStep === 'itemConfirm') && (
                <button className="tutorial-action-btn" onClick={handleTutorialConfirm}>
                  {t.common.confirm}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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

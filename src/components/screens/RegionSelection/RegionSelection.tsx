import React, { useEffect, useState } from 'react';
import { Region } from '../../../game/types';
import { useGameStore } from '../../../game/store';
import { useTranslation } from '../../../hooks/useTranslation';
import { 
  getAvailableDestinations, 
  getRegionDisplayName,
  isEndGameRegion,
  isTravellingRegion,
  hasVisitedRegion
} from '../../../game/regionGraph';
import { discoverConnection } from '../../../game/profileSystem';
import { POST_REGION_CHOICES, PostRegionChoice, hasRegionEvents } from '../../../game/postRegionChoice';
import './RegionSelection.css';

interface RegionSelectionProps {
  onSelectRegion: (region: Region) => void;
  tutorialEnabled?: boolean;
  onTutorialComplete?: () => void;
  onTutorialSkip?: () => void;
}

type RegionSelectionTutorialStep = 'action' | 'actionConfirm' | 'region' | 'regionConfirm' | 'done';

export const RegionSelection: React.FC<RegionSelectionProps> = ({
  onSelectRegion,
  tutorialEnabled = false,
  onTutorialComplete,
  onTutorialSkip,
}) => {
  const t = useTranslation();
  const store = useGameStore();
  const { state } = store;
  const [selectedDestination, setSelectedDestination] = useState<Region | null>(null);
  const [selectedAction, setSelectedAction] = useState<PostRegionChoice | null>(null);
  const [tutorialStep, setTutorialStep] = useState<RegionSelectionTutorialStep>(tutorialEnabled ? 'action' : 'done');

  useEffect(() => {
    if (tutorialEnabled) {
      setTutorialStep('action');
      return;
    }

    setTutorialStep('done');
  }, [tutorialEnabled]);

  const isTutorialActive = tutorialEnabled && tutorialStep !== 'done';
  const isActionTutorialStep = tutorialStep === 'action' || tutorialStep === 'actionConfirm';
  const isRegionTutorialStep = tutorialStep === 'region' || tutorialStep === 'regionConfirm';
  const canInteractActions = !isTutorialActive || isActionTutorialStep;
  const canInteractRegions = !isTutorialActive || isRegionTutorialStep;
  
  if (!state.selectedRegion) {
    return <div>{t.regionSelection.errorNoRegion}</div>;
  }
  
  const availableRegions = getAvailableDestinations(
    state.selectedRegion,
    state.visitedRegionsThisRun
  );

  // Discover connections when they become available
  useEffect(() => {
    if (state.selectedRegion) {
      availableRegions.forEach(destination => {
        discoverConnection(state.selectedRegion!, destination);
      });
    }
  }, [state.selectedRegion, availableRegions]);
  
  const handleRegionClick = (region: Region) => {
    if (!canInteractRegions) return;
    setSelectedDestination(region);

    if (isTutorialActive && tutorialStep === 'region') {
      setTutorialStep('regionConfirm');
    }
  };

  const handleActionClick = (action: PostRegionChoice) => {
    if (!canInteractActions) return;
    setSelectedAction(action);

    if (isTutorialActive && tutorialStep === 'action') {
      setTutorialStep('actionConfirm');
    }
  };

  const handleProceed = () => {
    // If no destination selected, can't proceed
    if (!selectedDestination) {
      return;
    }

    // If this is a post-region selection (completedRegion exists), action must be selected
    if (state.completedRegion && !selectedAction) {
      return;
    }

    // Store selected action FIRST, using getState() to ensure immediate update
    if (state.completedRegion && selectedAction) {
      useGameStore.getState().setPostRegionAction(selectedAction);
    }

    // Then navigate to selected destination
    // NOTE: Do NOT clear completedRegion - the postRegionAction scene needs it
    onSelectRegion(selectedDestination);
  };

  const getActionTitle = (action: PostRegionChoice) => {
    if (action === 'rest') return t.postRegion.restTitle;
    if (action === 'trade') return t.postRegion.modifyBuildTitle;
    if (action === 'event') return t.postRegion.exploreTitle;
    return '';
  };

  const getActionDescription = (action: PostRegionChoice) => {
    if (action === 'rest') return t.postRegion.restDescription;
    if (action === 'trade') return t.postRegion.modifyBuildDescription;
    if (action === 'event') return t.postRegion.exploreDescription;
    return '';
  };

  const handleTutorialContinue = () => {
    if (!isTutorialActive) return;

    if (tutorialStep === 'actionConfirm') {
      if (!selectedAction) return;
      setTutorialStep('region');
      return;
    }

    if (tutorialStep === 'regionConfirm') {
      if (!selectedDestination) return;
      onTutorialComplete?.();
      handleProceed();
    }
  };

  const getTutorialText = () => {
    if (tutorialStep === 'action') {
      return t.tutorial.regionTravel.actions;
    }

    if (tutorialStep === 'actionConfirm') {
      if (!selectedAction) return t.tutorial.regionTravel.actionNeedSelection;
      return t.tutorial.regionTravel.actionSelected
        .replace('{{action}}', getActionTitle(selectedAction))
        .replace('{{description}}', getActionDescription(selectedAction));
    }

    if (tutorialStep === 'region') {
      return t.tutorial.regionTravel.region;
    }

    if (tutorialStep === 'regionConfirm') {
      if (!selectedDestination) return t.tutorial.regionTravel.regionNeedSelection;
      const regionDescription = t.regionSelection.regionDescriptions[selectedDestination] || '';
      return t.tutorial.regionTravel.regionSelected
        .replace('{{region}}', getRegionDisplayName(selectedDestination))
        .replace('{{description}}', regionDescription);
    }

    return '';
  };

  // Don't show rest screen here - just select the action
  // The action will be processed after region selection
  
  const getRegionCategory = (region: Region): string => {
    const hardRegions: Region[] = ['void', 'targon', 'shadow_isles'];
    const advancedRegions: Region[] = ['bilgewater', 'bandle_city', 'freljord'];
    const startingRegions: Region[] = ['demacia', 'ionia', 'shurima'];
    
    if (isTravellingRegion(region)) return t.regionSelection.categories.travelling;
    if (hardRegions.includes(region)) return t.regionSelection.categories.hard;
    if (advancedRegions.includes(region)) return t.regionSelection.categories.advanced;
    if (region === 'piltover') return t.regionSelection.categories.hub;
    if (startingRegions.includes(region)) return t.regionSelection.categories.starting;
    return t.regionSelection.categories.standard;
  };
  
  const getRegionBadge = (region: Region) => {
    const visited = hasVisitedRegion(region, state.visitedRegionsThisRun);
    const category = getRegionCategory(region);
    
    if (isTravellingRegion(region)) {
      return (
        <span className="region-badge travelling">
          🌍 {category} {visited && '✓'}
        </span>
      );
    }
    if (isEndGameRegion(region)) {
      return (
        <span className="region-badge endgame">
          ⚔️ {t.regionSelection.categories.endgame} {visited && '✓'}
        </span>
      );
    }
    if (visited) {
      return <span className="region-badge visited">✓ {category}</span>;
    }
    return <span className="region-badge">{category}</span>;
  };
  
  const tutorialText = getTutorialText();

  return (
    <div className={`region-selection ${isTutorialActive ? 'tutorial-active' : ''}`}>
      {isTutorialActive && state.completedRegion && <div className="scene-tutorial-overlay" />}

      {isTutorialActive && state.completedRegion && (
        <div className="scene-tutorial-dialogue-box">
          <button className="scene-tutorial-skip-top-btn" onClick={onTutorialSkip}>
            {t.tutorial.skip}
          </button>
          <div className="scene-tutorial-character">🧙</div>
          <div className="scene-tutorial-content">
            <p className="scene-tutorial-speaker-name">{t.tutorial.npcName}</p>
            <p className="scene-tutorial-text">{tutorialText}</p>
            <div className="scene-tutorial-actions">
              {(tutorialStep === 'actionConfirm' || tutorialStep === 'regionConfirm') && (
                <button className="scene-tutorial-action-btn" onClick={handleTutorialContinue}>
                  {tutorialStep === 'regionConfirm' ? t.common.confirm : t.common.continue}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="region-selection-header">
        <h2>{t.regionSelection.chooseDestination}</h2>
        <div className="region-selection-info">
          <span>
            {t.regionSelection.currentRegion} <strong>{getRegionDisplayName(state.selectedRegion)}</strong>
          </span>
        </div>
      </div>

      {/* Travel Actions Section */}
      {state.completedRegion && (
        <div className={`travel-actions-section ${isTutorialActive ? (isActionTutorialStep ? 'region-selection-tutorial-highlight' : 'region-selection-tutorial-muted') : ''}`}>
          <h3>{t.regionSelection.chooseTravelAction}</h3>
          <p className="travel-actions-subtitle">{t.regionSelection.travelActionSubtitle}</p>
          <div className="travel-actions-grid">
            {POST_REGION_CHOICES.map((option) => {
              const isDisabled = option.type === 'event' && 
                (!state.completedRegion || !hasRegionEvents(state.completedRegion));
              const isSelected = selectedAction === option.type;

              return (
                <button
                  key={option.type}
                  className={`travel-action-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => !isDisabled && handleActionClick(option.type)}
                  disabled={isDisabled || !canInteractActions}
                >
                  <div className="action-icon">{option.icon}</div>
                  <h4>{getActionTitle(option.type)}</h4>
                  <p>{getActionDescription(option.type)}</p>
                  {isDisabled && <span className="disabled-badge">{t.regionSelection.unavailable}</span>}
                  {isSelected && <div className="selected-indicator">{t.regionSelection.selected}</div>}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      <div className={`regions-container ${isTutorialActive ? (isRegionTutorialStep ? 'region-selection-tutorial-highlight' : state.completedRegion ? 'region-selection-tutorial-muted' : '') : ''}`}>
        <h3>{t.regionSelection.selectDestination}</h3>
        {availableRegions.length === 0 ? (
          <div className="no-regions">
            <p>{t.regionSelection.noRegionsAvailable}</p>
          </div>
        ) : (
          availableRegions.map((region) => {
            const visited = hasVisitedRegion(region, state.visitedRegionsThisRun);
            const isSelected = selectedDestination === region;
            const cardClass = `region-card ${
              isTravellingRegion(region) ? 'travelling-region' : ''
            } ${isEndGameRegion(region) ? 'endgame-region' : ''} ${
              visited ? 'visited-region' : ''
            } ${isSelected ? 'selected' : ''}`;
            
            // Get translated region description
            const getRegionDescription = (): string => {
              const descriptions = t.regionSelection.regionDescriptions;
              return descriptions[region] || '';
            };
            
            return (
              <button
                key={region}
                className={cardClass}
                onClick={() => handleRegionClick(region)}
              >
                <div className="region-card-header">
                  <h3>{getRegionDisplayName(region)}</h3>
                  {getRegionBadge(region)}
                </div>
                <p className="region-description">{getRegionDescription()}</p>
                {isTravellingRegion(region) && (
                  <div className="region-hint">{t.regionSelection.longRangeTravelAvailable}</div>
                )}
                {isSelected && <div className="selected-indicator">{t.regionSelection.selected}</div>}
              </button>
            );
          })
        )}
      </div>

      {/* Proceed Button */}
      {(selectedDestination || !state.completedRegion) && (
        <div className="proceed-section">
          <button
            className="proceed-button"
            onClick={handleProceed}
            disabled={selectedDestination === null || (!!state.completedRegion && selectedAction === null) || isTutorialActive}
          >
            {state.completedRegion 
              ? `${t.regionSelection.proceedTo} ${selectedDestination ? getRegionDisplayName(selectedDestination) : '...'}`
              : t.regionSelection.beginJourney
            }
          </button>
          {selectedDestination && state.completedRegion && !selectedAction && (
            <p className="proceed-hint">{t.regionSelection.selectActionToProceed}</p>
          )}
        </div>
      )}
    </div>
  );
};

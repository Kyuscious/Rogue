import React, { useEffect, useState } from 'react';
import { Region } from '../../../game/types';
import { useGameStore } from '../../../game/store';
import { useTranslation } from '../../../hooks/useTranslation';
import { 
  getAvailableDestinations, 
  getRegionDisplayName, 
  getRegionDescription,
  isEndGameRegion,
  isTravellingRegion,
  hasVisitedRegion
} from '../../../game/regionGraph';
import { discoverConnection } from '../../../game/profileSystem';
import { POST_REGION_CHOICES, PostRegionChoice, hasRegionEvents } from '../../../game/postRegionChoice';
import './RegionSelection.css';

interface RegionSelectionProps {
  onSelectRegion: (region: Region) => void;
}

export const RegionSelection: React.FC<RegionSelectionProps> = ({ onSelectRegion }) => {
  const t = useTranslation();
  const store = useGameStore();
  const { state } = store;
  const [selectedDestination, setSelectedDestination] = useState<Region | null>(null);
  const [selectedAction, setSelectedAction] = useState<PostRegionChoice | null>(null);
  
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
    setSelectedDestination(region);
  };

  const handleActionClick = (action: PostRegionChoice) => {
    setSelectedAction(action);
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
  
  return (
    <div className="region-selection">
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
        <div className="travel-actions-section">
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
                  disabled={isDisabled}
                >
                  <div className="action-icon">{option.icon}</div>
                  <h4>{option.title}</h4>
                  <p>{option.description}</p>
                  {isDisabled && <span className="disabled-badge">{t.regionSelection.unavailable}</span>}
                  {isSelected && <div className="selected-indicator">{t.regionSelection.selected}</div>}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="regions-container">
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
                <p className="region-description">{getRegionDescription(region)}</p>
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
            disabled={selectedDestination === null || (!!state.completedRegion && selectedAction === null)}
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

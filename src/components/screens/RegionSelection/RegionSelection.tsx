import React, { useEffect } from 'react';
import { Region } from '../../../game/types';
import { useGameStore } from '../../../game/store';
import { 
  getAvailableDestinations, 
  getRegionDisplayName, 
  getRegionDescription,
  isEndingRegion,
  isPiltover
} from '../../../game/regionGraph';
import { discoverConnection } from '../../../game/profileSystem';
import './RegionSelection.css';

interface RegionSelectionProps {
  onSelectRegion: (region: Region) => void;
}

export const RegionSelection: React.FC<RegionSelectionProps> = ({ onSelectRegion }) => {
  const { state } = useGameStore();
  
  if (!state.selectedRegion || !state.originalStartingRegion) {
    return <div>Error: No current region</div>;
  }
  
  const availableRegions = getAvailableDestinations(
    state.selectedRegion,
    state.usedPaths,
    state.originalStartingRegion,
    state.piltoverVisits
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
    onSelectRegion(region);
  };
  
  const getRegionBadge = (region: Region) => {
    if (isEndingRegion(region)) {
      return <span className="region-badge ending">⚔️ ACT FINALE</span>;
    }
    if (isPiltover(region)) {
      return <span className="region-badge special">🔮 TELEPORTER</span>;
    }
    return null;
  };
  
  return (
    <div className="region-selection">
      <div className="region-selection-header">
        <h2>Choose Your Next Destination</h2>
        <div className="region-selection-info">
          <span>Current Region: <strong>{getRegionDisplayName(state.selectedRegion)}</strong></span>
          <span>Act {state.currentAct}/3</span>
          {isPiltover(state.selectedRegion) && (
            <span className="piltover-warning">
              🔮 Piltover Visit #{state.piltoverVisits}
            </span>
          )}
        </div>
      </div>
      
      <div className="regions-container">
        {availableRegions.length === 0 ? (
          <div className="no-regions">
            <p>No available destinations. This shouldn't happen!</p>
          </div>
        ) : (
          availableRegions.map((region) => (
            <button
              key={region}
              className={`region-card ${isEndingRegion(region) ? 'ending-region' : ''} ${isPiltover(region) ? 'special-region' : ''}`}
              onClick={() => handleRegionClick(region)}
            >
              <div className="region-card-header">
                <h3>{getRegionDisplayName(region)}</h3>
                {getRegionBadge(region)}
              </div>
              <p className="region-description">{getRegionDescription(region)}</p>
              
              {isEndingRegion(region) && (
                <div className="region-warning">
                  Completing this region will end Act {state.currentAct}
                </div>
              )}
              
              {isPiltover(region) && state.piltoverVisits >= 2 && state.originalStartingRegion && (
                <div className="region-warning special">
                  ⚠️ Final Piltover visit - returns to {getRegionDisplayName(state.originalStartingRegion)}
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

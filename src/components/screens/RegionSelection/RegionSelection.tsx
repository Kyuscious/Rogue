import React, { useEffect, useState } from 'react';
import { Region } from '../../../game/types';
import { useGameStore } from '../../../game/store';
import { 
  getAvailableDestinations, 
  getRegionDisplayName, 
  getRegionDescription,
  isEndGameRegion,
  isTravellingRegion,
  hasVisitedRegion
} from '../../../game/regionGraph';
import { discoverConnection } from '../../../game/profileSystem';
import './RegionSelection.css';

interface RegionSelectionProps {
  onSelectRegion: (region: Region) => void;
}

export const RegionSelection: React.FC<RegionSelectionProps> = ({ onSelectRegion }) => {
  const { state } = useGameStore();
  const [showPathTooltip, setShowPathTooltip] = useState(false);
  
  if (!state.selectedRegion) {
    return <div>Error: No current region</div>;
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
    onSelectRegion(region);
  };
  
  const getRegionCategory = (region: Region): string => {
    const hardRegions: Region[] = ['void', 'targon', 'shadow_isles'];
    const advancedRegions: Region[] = ['bilgewater', 'bandle_city', 'freljord'];
    const startingRegions: Region[] = ['demacia', 'ionia', 'shurima'];
    
    if (isTravellingRegion(region)) return 'TRAVELLING';
    if (hardRegions.includes(region)) return 'HARD';
    if (advancedRegions.includes(region)) return 'ADVANCED';
    if (region === 'piltover') return 'HUB';
    if (startingRegions.includes(region)) return 'STARTING';
    return 'STANDARD';
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
          ⚔️ {category} {visited && '✓'}
        </span>
      );
    }
    if (visited) {
      return <span className="region-badge visited">✓ {category}</span>;
    }
    return <span className="region-badge">{category}</span>;
  };
  
  // Format the path taken
  const formatPath = () => {
    return state.visitedRegionsThisRun
      .map(r => getRegionDisplayName(r))
      .join(' > ');
  };
  
  return (
    <div className="region-selection">
      <div className="region-selection-header">
        <h2>Choose Your Next Destination</h2>
        <div className="region-selection-info">
          <span 
            onMouseEnter={() => setShowPathTooltip(true)}
            onMouseLeave={() => setShowPathTooltip(false)}
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            Current Region: <strong>{getRegionDisplayName(state.selectedRegion)}</strong>
            {showPathTooltip && state.visitedRegionsThisRun.length > 1 && (
              <div className="path-tooltip">
                <div className="path-title">Your Journey:</div>
                <div className="path-content">{formatPath()}</div>
              </div>
            )}
          </span>
        </div>
      </div>
      
      <div className="regions-container">
        {availableRegions.length === 0 ? (
          <div className="no-regions">
            <p>No available destinations. This shouldn't happen!</p>
          </div>
        ) : (
          availableRegions.map((region) => {
            const visited = hasVisitedRegion(region, state.visitedRegionsThisRun);
            const cardClass = `region-card ${
              isTravellingRegion(region) ? 'travelling-region' : ''
            } ${isEndGameRegion(region) ? 'endgame-region' : ''} ${
              visited ? 'visited-region' : ''
            }`;
            
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
                  <div className="region-hint">✈️ Long-range travel available</div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

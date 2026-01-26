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
import { POST_REGION_CHOICES, PostRegionChoice, hasRegionEvents } from '../../../game/postRegionChoice';
import { getRandomEventForRegion } from '../../../game/eventSystem';
import { getStarterEquipment, hasStarterEquipment } from '../../../game/starterEquipment';
import { getWeaponById } from '../../../game/weapons';
import { getSpellById } from '../../../game/spells';
import './RegionSelection.css';

interface RegionSelectionProps {
  onSelectRegion: (region: Region) => void;
}

export const RegionSelection: React.FC<RegionSelectionProps> = ({ onSelectRegion }) => {
  const store = useGameStore();
  const { state, applyRestChoice } = store;
  const [showPathTooltip, setShowPathTooltip] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Region | null>(null);
  const [selectedAction, setSelectedAction] = useState<PostRegionChoice | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<Region | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Debug logging
  console.log('🔍 RegionSelection - completedRegion:', state.completedRegion);
  
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

    // Apply the chosen action first (if any)
    if (selectedAction) {
      if (selectedAction === 'rest') {
        applyRestChoice();
      } else if (selectedAction === 'modify_build') {
        // TODO: Show build modification screen before proceeding
        console.log('Build modification not yet implemented');
      } else if (selectedAction === 'random_event') {
        // TODO: Trigger random event from completed region
        if (state.completedRegion && hasRegionEvents(state.completedRegion)) {
          const randomEvent = getRandomEventForRegion(state.completedRegion);
          if (randomEvent) {
            console.log('Triggering event:', randomEvent);
            // TODO: Show event UI before proceeding
          }
        }
        console.log('Random event not yet fully implemented');
      }
    }

    // Clear completedRegion flag now that we're proceeding
    if (state.completedRegion) {
      store.setCompletedRegion(null);
    }

    // Then navigate to selected destination
    onSelectRegion(selectedDestination);
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

      {/* Travel Actions Section */}
      {state.completedRegion && (
        <div className="travel-actions-section">
          <h3>Choose Travel Action</h3>
          <p className="travel-actions-subtitle">What will you do while traveling?</p>
          <div className="travel-actions-grid">
            {POST_REGION_CHOICES.map((option) => {
              const isDisabled = option.type === 'random_event' && 
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
                  {isDisabled && <span className="disabled-badge">Unavailable</span>}
                  {isSelected && <div className="selected-indicator">✓ Selected</div>}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="regions-container">
        <h3>Select Destination</h3>
        {availableRegions.length === 0 ? (
          <div className="no-regions">
            <p>No available destinations. This shouldn't happen!</p>
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
                onMouseEnter={(e) => {
                  setHoveredRegion(region);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltipPosition({
                    x: rect.left + rect.width / 2,
                    y: rect.top - 10,
                  });
                }}
                onMouseLeave={() => setHoveredRegion(null)}
              >
                <div className="region-card-header">
                  <h3>{getRegionDisplayName(region)}</h3>
                  {getRegionBadge(region)}
                </div>
                <p className="region-description">{getRegionDescription(region)}</p>
                {isTravellingRegion(region) && (
                  <div className="region-hint">✈️ Long-range travel available</div>
                )}
                {isSelected && <div className="selected-indicator">✓ Selected</div>}
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
              ? `Proceed to ${selectedDestination ? getRegionDisplayName(selectedDestination) : '...'}`
              : 'Begin Journey'
            }
          </button>
          {selectedDestination && state.completedRegion && !selectedAction && (
            <p className="proceed-hint">⚠️ Select a travel action to proceed</p>
          )}
        </div>
      )}
      
      {/* Starter Equipment Tooltip */}
      {hoveredRegion && hasStarterEquipment(hoveredRegion) && (
        <div 
          className="starter-equipment-tooltip"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          <h4>Starter Equipment</h4>
          {(() => {
            const equipment = getStarterEquipment(hoveredRegion);
            const weapon = equipment.weapon ? getWeaponById(equipment.weapon) : null;
            const spell = equipment.spell ? getSpellById(equipment.spell) : null;
            
            return (
              <>
                {weapon && (
                  <div className="equipment-item">
                    <div className="equipment-name">⚔️ {weapon.name}</div>
                    <div className="equipment-description">{weapon.description}</div>
                    {weapon.stats && Object.keys(weapon.stats).length > 0 && (
                      <div className="equipment-stats">
                        {weapon.stats.attackDamage && <span>+{weapon.stats.attackDamage} AD</span>}
                        {weapon.stats.abilityPower && <span>+{weapon.stats.abilityPower} AP</span>}
                        {weapon.stats.attackSpeed && <span>+{weapon.stats.attackSpeed} AS</span>}
                        {weapon.stats.attackRange && <span>+{weapon.stats.attackRange} Range</span>}
                        {weapon.stats.movementSpeed && <span>+{weapon.stats.movementSpeed} MS</span>}
                        {weapon.stats.armor && <span>+{weapon.stats.armor} Armor</span>}
                        {weapon.stats.magicResist && <span>+{weapon.stats.magicResist} MR</span>}
                        {weapon.stats.health && <span>+{weapon.stats.health} HP</span>}
                      </div>
                    )}
                    <div className="equipment-effects">
                      {weapon.effects.map((effect, idx) => (
                        <div key={idx} className="effect-line">{effect.description}</div>
                      ))}
                    </div>
                  </div>
                )}
                {spell && (
                  <div className="equipment-item">
                    <div className="equipment-name">✨ {spell.name}</div>
                    <div className="equipment-description">{spell.description}</div>
                    <div className="equipment-effects">
                      {spell.effects.map((effect, idx) => (
                        <div key={idx} className="effect-line">{effect.description}</div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

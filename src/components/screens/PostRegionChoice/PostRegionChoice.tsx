import React from 'react';
import { useGameStore } from '../../../game/store';
import { POST_REGION_CHOICES, PostRegionChoice, hasRegionEvents } from '../../../game/postRegionChoice';
import { getRandomEventForRegion } from '../../../game/eventSystem';
import './PostRegionChoice.css';

export const PostRegionChoiceScreen: React.FC = () => {
  const state = useGameStore((store) => store.state);
  const hidePostRegionChoiceScreen = useGameStore((store) => store.hidePostRegionChoiceScreen);
  const applyRestChoice = useGameStore((store) => store.applyRestChoice);

  if (!state.showPostRegionChoice || !state.completedRegion) {
    return null;
  }

  const handleChoice = (choice: PostRegionChoice) => {
    if (choice === 'rest') {
      applyRestChoice();
    } else if (choice === 'modify_build') {
      // TODO: Show build modification screen
      hidePostRegionChoiceScreen();
      console.log('Build modification not yet implemented');
    } else if (choice === 'random_event') {
      // TODO: Trigger random region event
      if (state.completedRegion && hasRegionEvents(state.completedRegion)) {
        const randomEvent = getRandomEventForRegion(state.completedRegion);
        if (randomEvent) {
          console.log('Triggering event:', randomEvent);
          // TODO: Show event UI
        }
      }
      hidePostRegionChoiceScreen();
      console.log('Random event not yet fully implemented');
    }
  };

  return (
    <div className="post-region-overlay">
      <div className="post-region-container">
        <div className="post-region-header">
          <h2>Region Completed!</h2>
          <p className="region-name">{state.completedRegion}</p>
          <p className="post-region-subtitle">Choose your next action before traveling to a new region</p>
        </div>

        <div className="post-region-choices">
          {POST_REGION_CHOICES.map((option) => {
            // Disable random event if region has no events
            const isDisabled = option.type === 'random_event' && 
              (!state.completedRegion || !hasRegionEvents(state.completedRegion));

            return (
              <button
                key={option.type}
                className={`post-region-choice-btn ${isDisabled ? 'disabled' : ''}`}
                onClick={() => !isDisabled && handleChoice(option.type)}
                disabled={isDisabled}
              >
                <div className="choice-icon">{option.icon}</div>
                <div className="choice-content">
                  <h3>{option.title}</h3>
                  <p>{option.description}</p>
                  {isDisabled && <span className="disabled-text">No events available</span>}
                </div>
              </button>
            );
          })}
        </div>

        <div className="post-region-stats">
          <div className="stat-item">
            <span className="stat-label">Current HP:</span>
            <span className="stat-value">{state.playerCharacter.hp}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Gold:</span>
            <span className="stat-value">{state.gold}g</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Floor:</span>
            <span className="stat-value">{state.currentFloor}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

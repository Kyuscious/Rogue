import React, { useState } from 'react';
import { useGameStore } from '../../../game/store';
import { POST_REGION_CHOICES, PostRegionChoice, hasRegionEvents } from '../../../game/postRegionChoice';
import { RestScreen } from './RestScreen';
import { useTranslation } from '../../../hooks/useTranslation';
import './PostRegionChoice.css';

export const PostRegionChoiceScreen: React.FC = () => {
  const t = useTranslation();
  const state = useGameStore((store) => store.state);
  const hidePostRegionChoiceScreen = useGameStore((store) => store.hidePostRegionChoiceScreen);
  const [showRest, setShowRest] = useState(false);

  if (!state.showPostRegionChoice || !state.completedRegion) {
    return null;
  }

  // Show rest screen if user selected rest
  if (showRest) {
    return (
      <RestScreen 
        completedRegion={state.completedRegion}
        onContinue={() => {
          setShowRest(false);
          hidePostRegionChoiceScreen();
        }}
      />
    );
  }

  const handleChoice = (choice: PostRegionChoice) => {
    if (choice === 'rest') {
      setShowRest(true);
    } else if (choice === 'trade') {
      // Set pending action in store - App.tsx will handle routing to TradeScreen
      useGameStore.getState().state.pendingPostRegionAction = 'trade';
      hidePostRegionChoiceScreen();
    } else if (choice === 'event') {
      // Set pending action in store - App.tsx will handle routing to EventScreen
      if (state.completedRegion && hasRegionEvents(state.completedRegion)) {
        useGameStore.getState().state.pendingPostRegionAction = 'event';
        hidePostRegionChoiceScreen();
      }
    }
  };

  return (
    <div className="post-region-overlay">
      <div className="post-region-container">
        <div className="post-region-header">
          <h2>{t.postRegion.regionCompleted}</h2>
          <p className="region-name">{state.completedRegion}</p>
          <p className="post-region-subtitle">{t.postRegion.chooseNextAction}</p>
        </div>

        <div className="post-region-choices">
          {POST_REGION_CHOICES.map((option) => {
            // Disable event if region has no events
            const isDisabled = option.type === 'event' && 
              (!state.completedRegion || !hasRegionEvents(state.completedRegion));

            // Get translated text based on option type
            const getTitle = () => {
              if (option.type === 'rest') return t.postRegion.restTitle;
              if (option.type === 'trade') return t.postRegion.modifyBuildTitle;
              if (option.type === 'event') return t.postRegion.exploreTitle;
              return '';
            };

            const getDescription = () => {
              if (option.type === 'rest') return t.postRegion.restDescription;
              if (option.type === 'trade') return t.postRegion.modifyBuildDescription;
              if (option.type === 'event') return t.postRegion.exploreDescription;
              return '';
            };

            return (
              <button
                key={option.type}
                className={`post-region-choice-btn ${isDisabled ? 'disabled' : ''}`}
                onClick={() => !isDisabled && handleChoice(option.type)}
                disabled={isDisabled}
              >
                <div className="choice-icon">{option.icon}</div>
                <div className="choice-content">
                  <h3>{getTitle()}</h3>
                  <p>{getDescription()}</p>
                  {isDisabled && <span className="disabled-text">{t.postRegion.noEventsAvailable}</span>}
                </div>
              </button>
            );
          })}
        </div>

        <div className="post-region-stats">
          <div className="stat-item">
            <span className="stat-label">{t.postRegion.currentHp}:</span>
            <span className="stat-value">{state.playerCharacter.hp}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{t.uiHeader.gold}:</span>
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

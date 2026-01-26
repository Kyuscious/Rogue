import React from 'react';
import './EventScreen.css';

interface EventScreenProps {
  region: string;
  onContinue: () => void;
}

export const EventScreen: React.FC<EventScreenProps> = ({ region, onContinue }) => {
  // TODO: Load event based on region
  // Events will be loaded from region-specific event files

  return (
    <div className="event-screen">
      <div className="event-container">
        <h1 className="event-title">🎲 Random Event</h1>
        <p className="event-subtitle">
          Something interesting happens in {region}...
        </p>

        <div className="event-content">
          <div className="event-placeholder">
            <div className="placeholder-icon">❓</div>
            <p className="placeholder-text">
              Events system coming soon!
            </p>
            <p className="placeholder-description">
              Random encounters, special NPCs, treasure chests, and more will appear here.
            </p>
          </div>
        </div>

        <button className="continue-btn" onClick={onContinue}>
          Continue Journey →
        </button>
      </div>
    </div>
  );
};

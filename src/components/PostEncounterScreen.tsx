import React from 'react';
import { Character } from '../game/types';
import { GameEvent } from '../game/events/eventTypes';
import '../styles/PostEncounterScreen.css';

type PostEncounterChoice = 'loot' | 'rest' | 'modify_build' | 'random_event';

interface PostEncounterScreenProps {
  character: Character;
  regionName: string;
  questPathName: string;
  selectedEvent?: GameEvent;
  onChoice: (choice: PostEncounterChoice) => void;
  canRest: boolean;
}

export const PostEncounterScreen: React.FC<PostEncounterScreenProps> = ({
  character,
  regionName,
  questPathName,
  selectedEvent,
  onChoice,
  canRest,
}) => {
  return (
    <div className="post-encounter-screen">
      <div className="encounter-summary">
        <h1>Encounter Complete</h1>
        <p className="location">{questPathName} • {regionName}</p>
        
        <div className="character-status">
          <div className="status-item">
            <span>HP:</span>
            <div className="hp-bar">
              <div 
                className="hp-fill" 
                style={{ width: `${(character.hp / character.stats.health) * 100}%` }}
              ></div>
            </div>
            <span>{character.hp}/{character.stats.health}</span>
          </div>
          <div className="status-item">
            <span>Gold:</span>
            <span className="gold-amount">{character.gold || 0}</span>
          </div>
        </div>
      </div>

      <div className="choices-container">
        <h2>What will you do?</h2>
        
        <div className="choice-grid">
          {/* Rest Option */}
          <button 
            className={`choice-button rest-choice ${!canRest ? 'disabled' : ''}`}
            onClick={() => onChoice('rest')}
            disabled={!canRest}
            title={!canRest ? 'You are at full health' : 'Rest to recover HP and remove debuffs'}
          >
            <div className="choice-icon">🛌</div>
            <div className="choice-title">Rest</div>
            <div className="choice-description">
              Recover 50% HP<br/>
              Remove debuffs<br/>
              Refill items
            </div>
          </button>

          {/* Modify Build Option */}
          <button 
            className="choice-button build-choice"
            onClick={() => onChoice('modify_build')}
            title="Change your class, manage items, modify stats"
          >
            <div className="choice-icon">⚙️</div>
            <div className="choice-title">Modify Build</div>
            <div className="choice-description">
              Change class<br/>
              Manage items<br/>
              Modify stats
            </div>
          </button>

          {/* Random Event Option */}
          <button 
            className="choice-button event-choice"
            onClick={() => onChoice('random_event')}
            title={selectedEvent ? `${selectedEvent.title}: ${selectedEvent.description}` : 'Encounter a random event'}
          >
            <div className="choice-icon">🎲</div>
            <div className="choice-title">Random Event</div>
            <div className="choice-description">
              {selectedEvent ? (
                <>
                  {selectedEvent.title}<br/>
                  <em>{selectedEvent.type}</em>
                </>
              ) : (
                'Discover what fate awaits...'
              )}
            </div>
          </button>
        </div>
      </div>

      <div className="continue-hint">
        <p>Choose wisely. Your next challenge awaits...</p>
      </div>
    </div>
  );
};

export default PostEncounterScreen;

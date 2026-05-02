import React from 'react';
import { Character } from '@game/types';
import { GameEvent } from '@screens/PostRegionChoice/events/eventTypes';
import { useTranslation } from '../../../hooks/useTranslation';

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
  const t = useTranslation();
  return (
    <div className="post-encounter-screen">
      <div className="encounter-summary">
        <h1>{t.postRegion.encounterComplete}</h1>
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
        <h2>{t.postRegion.whatWillYouDo}</h2>
        
        <div className="choice-grid">
          {/* Rest Option */}
          <button 
            className={`choice-button rest-choice ${!canRest ? 'disabled' : ''}`}
            onClick={() => onChoice('rest')}
            disabled={!canRest}
            title={!canRest ? 'You are at full health' : 'Rest to recover HP and remove debuffs'}
          >
            <div className="choice-icon">🛌</div>
            <div className="choice-title">{t.postRegion.restTitle}</div>
            <div className="choice-description">
              {t.postRegion.restHint.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i < t.postRegion.restHint.split('\n').length - 1 && <br/>}</React.Fragment>)}
            </div>
          </button>

          {/* Modify Build Option */}
          <button 
            className="choice-button build-choice"
            onClick={() => onChoice('modify_build')}
            title="Change your class, manage items, modify stats"
          >
            <div className="choice-icon">⚙️</div>
            <div className="choice-title">{t.postRegion.modifyBuildTitle}</div>
            <div className="choice-description">
              {t.postRegion.buildHint.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i < t.postRegion.buildHint.split('\n').length - 1 && <br/>}</React.Fragment>)}
            </div>
          </button>

          {/* Random Event Option */}
          <button 
            className="choice-button event-choice"
            onClick={() => onChoice('random_event')}
            title={selectedEvent ? `${selectedEvent.title}: ${selectedEvent.description}` : 'Encounter a random event'}
          >
            <div className="choice-icon">🎲</div>
            <div className="choice-title">{t.postRegion.randomEvent}</div>
            <div className="choice-description">
              {selectedEvent ? (
                <>
                  {selectedEvent.title}<br/>
                  <em>{selectedEvent.type}</em>
                </>
              ) : (
                t.postRegion.eventHint
              )}
            </div>
          </button>
        </div>
      </div>

      <div className="continue-hint">
        <p>{t.postRegion.continueHint}</p>
      </div>
    </div>
  );
};

export default PostEncounterScreen;

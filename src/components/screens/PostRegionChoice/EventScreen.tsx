import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../../game/store';
import { GameEvent } from '../../../game/events/eventTypes';
import {
  getOfferedEvents,
  getEventTypeLabel,
  getRarityColor,
  getRarityBadge,
} from '../../../game/eventSystem';
import './EventScreen.css';

interface EventScreenProps {
  completedRegion: string;
  onContinue: () => void;
}

export const EventScreen: React.FC<EventScreenProps> = ({ completedRegion, onContinue }) => {
  const state = useGameStore((store) => store.state);
  const [offeredEvents, setOfferedEvents] = useState<GameEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [showNotImplementedModal, setShowNotImplementedModal] = useState(false);

  // Initialize offered events on mount
  useEffect(() => {
    const events = getOfferedEvents(completedRegion, 3);
    setOfferedEvents(events);
  }, [completedRegion]);

  const handleRerollEvents = () => {
    if (state.rerolls <= 0) return;
    useGameStore.getState().useReroll();
    const events = getOfferedEvents(completedRegion, 3);
    setOfferedEvents(events);
    setSelectedEvent(null);
    setActionFeedback(`🔄 Rerolled! ${state.rerolls - 1} rerolls left`);
    setTimeout(() => setActionFeedback(null), 2000);
  };

  const handleSelectEvent = () => {
    if (!selectedEvent) return;
    // Show "Not Implemented Yet" modal
    setShowNotImplementedModal(true);
  };

  const handleSkipEvent = () => {
    setShowNotImplementedModal(false);
    onContinue();
  };

  return (
    <div className="event-screen">
      <div className="event-container">
        <h1 className="event-title">✨ Mysterious Event</h1>
        <p className="event-subtitle">
          An event awaits you in {completedRegion.toUpperCase()}...
        </p>

        {/* Feedback Message */}
        {actionFeedback && (
          <div className="action-feedback">
            {actionFeedback}
          </div>
        )}

        {/* Event Header */}
        <div className="event-header">
          <h2>Choose Your Fate</h2>
          <p className="event-description">
            Select an event to experience. Each event offers different challenges and rewards.
          </p>
          <button
            className="reroll-btn"
            onClick={handleRerollEvents}
            disabled={state.rerolls <= 0}
            title={state.rerolls <= 0 ? 'No rerolls left' : `Rerolls: ${state.rerolls}`}
          >
            🔄 Reroll Events ({state.rerolls})
          </button>
        </div>

        {/* Events List */}
        <div className="events-grid">
          {offeredEvents.length > 0 ? (
            offeredEvents.map(event => (
              <div
                key={event.id}
                className={`event-card ${selectedEvent?.id === event.id ? 'selected' : ''}`}
                onClick={() => setSelectedEvent(event)}
                style={{
                  borderColor: selectedEvent?.id === event.id ? '#4ade80' : 'rgba(233, 69, 96, 0.3)',
                }}
              >
                <div className="event-card-header">
                  <span className="event-icon">{event.icon}</span>
                  <span 
                    className="event-rarity" 
                    style={{ color: getRarityColor(event.rarity) }}
                  >
                    {getRarityBadge(event.rarity)}
                  </span>
                </div>

                <h3 className="event-card-title">{event.title}</h3>
                <p className="event-card-description">{event.description}</p>

                <div className="event-card-footer">
                  <span className="event-type">{getEventTypeLabel(event.type)}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-events">No events available for this region</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="event-actions">
          {selectedEvent && (
            <button 
              className="execute-btn event-execute-btn"
              onClick={handleSelectEvent}
            >
              ✓ Enter Event: {selectedEvent.title}
            </button>
          )}
        </div>
      </div>

      {/* Not Implemented Modal */}
      {showNotImplementedModal && (
        <div className="modal-overlay">
          <div className="event-modal">
            <h2>⏳ Event System</h2>
            <p className="modal-message">
              This event is not yet fully implemented in the game. We're still building out event interactions and effects!
            </p>
            <p className="modal-event-name">
              📌 Selected Event: <strong>{selectedEvent?.title}</strong>
            </p>
            <div className="modal-actions">
              <button 
                className="modal-btn modal-skip-btn"
                onClick={handleSkipEvent}
              >
                ✓ Skip & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

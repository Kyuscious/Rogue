import React, { useState, useEffect } from 'react';
import { useGameStore } from '@game/store';
import { GameEvent, VisualNovelChoice } from './eventTypes';
import {
  getOfferedEvents,
  getEventTypeLabel,
  getRarityColor,
  getRarityBadge,
} from './eventSystem';
import { getItemById } from '@data/items';
import { getFamiliarById } from '../../../entity/Player/familiars';
import { discoverFamiliar } from '../../MainMenu/Profiles/profileSystem';
import './EventScreen.css';

interface EventScreenProps {
  completedRegion: string;
  onContinue: () => void;
}

export const EventScreen: React.FC<EventScreenProps> = ({ completedRegion, onContinue }) => {
  const { state, addGold, addInventoryItem, addFamiliar, updatePlayerHp, addRerolls } = useGameStore();
  const [offeredEvents, setOfferedEvents] = useState<GameEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [resolutionLines, setResolutionLines] = useState<string[]>([]);
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

  const resolveChoice = (choice: VisualNovelChoice): string[] => {
    const messages: string[] = [];

    switch (choice.outcome) {
      case 'gold': {
        const goldAmount = typeof choice.value === 'number' ? choice.value : 100;
        addGold(goldAmount);
        messages.push(`💰 +${goldAmount} Gold`);
        break;
      }
      case 'hp': {
        const healAmount = typeof choice.value === 'number' ? choice.value : 25;
        const maxHp = state.playerCharacter.stats.health;
        const newHp = Math.min(state.playerCharacter.hp + healAmount, maxHp);
        const actualHealing = newHp - state.playerCharacter.hp;
        updatePlayerHp(newHp);
        messages.push(`💚 +${actualHealing} HP`);
        break;
      }
      case 'item': {
        const itemId = String(choice.value);
        if (getItemById(itemId)) {
          addInventoryItem({ itemId, quantity: 1 });
          messages.push(`🎁 ${getItemById(itemId)?.name || itemId}`);
        }
        break;
      }
      case 'familiar': {
        const familiarId = String(choice.value);
        addFamiliar(familiarId);
        discoverFamiliar(familiarId);
        messages.push(`🐾 ${getFamiliarById(familiarId)?.name || familiarId} joined your team`);
        break;
      }
      case 'buff':
        addRerolls(1);
        messages.push('✨ +1 Reroll');
        break;
      case 'stat':
        addGold(75);
        messages.push('📈 Insight reward: +75 Gold');
        break;
      case 'curse':
        messages.push('🔮 A strange curse lingers...');
        break;
      default:
        break;
    }

    return messages;
  };

  const handleSelectEvent = () => {
    if (!selectedEvent) return;

    const messages: string[] = [`${selectedEvent.title} resolved.`];

    if (selectedEvent.type === 'encounter') {
      const goldReward = selectedEvent.data?.goldReward || 0;
      if (goldReward > 0) {
        addGold(goldReward);
        messages.push(`💰 +${goldReward} Gold`);
      }
    }

    if (selectedEvent.type === 'treasure') {
      const goldReward = selectedEvent.data?.gold || 0;
      if (goldReward > 0) {
        addGold(goldReward);
        messages.push(`💰 +${goldReward} Gold`);
      }

      const treasureItems = Array.isArray(selectedEvent.data?.items) ? selectedEvent.data.items : [];
      treasureItems.forEach((itemId: string) => {
        if (getItemById(itemId)) {
          addInventoryItem({ itemId, quantity: 1 });
          messages.push(`🎁 ${getItemById(itemId)?.name || itemId}`);
        }
      });
    }

    const scriptedChoice = selectedEvent.data?.options?.[0] || selectedEvent.data?.choices?.[0];

    const directFamiliarId = selectedEvent.data?.familiarId as string | undefined;
    if (directFamiliarId && scriptedChoice?.outcome !== 'familiar') {
      addFamiliar(directFamiliarId);
      discoverFamiliar(directFamiliarId);
      messages.push(`🐾 ${getFamiliarById(directFamiliarId)?.name || directFamiliarId} joined your team`);
    }

    if (scriptedChoice) {
      messages.push(...resolveChoice(scriptedChoice));
    }

    setResolutionLines(messages);
    setActionFeedback(`✅ ${selectedEvent.title} completed`);
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
            <h2>✨ Event Resolved</h2>
            <p className="modal-message">
              The event has been applied to your run.
            </p>
            <p className="modal-event-name">
              📌 Selected Event: <strong>{selectedEvent?.title}</strong>
            </p>
            <div className="modal-message">
              {resolutionLines.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn modal-skip-btn"
                onClick={handleSkipEvent}
              >
                ✓ Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

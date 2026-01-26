import React, { useState } from 'react';
import { useGameStore } from '../../../game/store';
import './RestScreen.css';

interface RestScreenProps {
  onContinue: () => void;
}

export const RestScreen: React.FC<RestScreenProps> = ({ onContinue }) => {
  const { state } = useGameStore();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const restActions = [
    {
      id: 'meditate',
      name: '🧘 Meditate',
      description: 'Clear your mind and focus. Gain temporary mental fortitude.',
      benefit: '+20% Ability Power for next 3 encounters',
      available: true,
    },
    {
      id: 'train',
      name: '⚔️ Train',
      description: 'Practice your combat techniques.',
      benefit: '+15% Attack Damage for next 3 encounters',
      available: true,
    },
    {
      id: 'scout',
      name: '🔍 Scout Ahead',
      description: 'Survey the area and plan your approach.',
      benefit: 'Reveal next enemy type and stats',
      available: true,
    },
    {
      id: 'pray',
      name: '🙏 Pray',
      description: 'Seek divine guidance.',
      benefit: 'Random blessing: Gold, Item, or Stat bonus',
      available: true,
    },
  ];

  const handleActionSelect = (actionId: string) => {
    setSelectedAction(actionId);
    // TODO: Implement action effects
    console.log(`[REST] Selected action: ${actionId}`);
  };

  return (
    <div className="rest-screen">
      <div className="rest-container">
        <h1 className="rest-title">🏕️ Rest & Recovery</h1>
        <p className="rest-subtitle">
          You've completed {state.selectedRegion}! Take a moment to rest and prepare.
        </p>

        <div className="rest-status">
          <div className="status-item">
            <span className="status-label">Health:</span>
            <span className="status-value">✅ Fully Restored</span>
          </div>
          <div className="status-item">
            <span className="status-label">Level:</span>
            <span className="status-value">{state.playerCharacter?.level}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Gold:</span>
            <span className="status-value">{state.gold}g</span>
          </div>
        </div>

        <div className="rest-actions">
          <h2>Choose a Rest Activity:</h2>
          <div className="action-grid">
            {restActions.map((action) => (
              <button
                key={action.id}
                className={`action-card ${selectedAction === action.id ? 'selected' : ''} ${!action.available ? 'disabled' : ''}`}
                onClick={() => handleActionSelect(action.id)}
                disabled={!action.available}
              >
                <div className="action-name">{action.name}</div>
                <div className="action-description">{action.description}</div>
                <div className="action-benefit">{action.benefit}</div>
              </button>
            ))}
          </div>
        </div>

        <button 
          className="continue-btn"
          onClick={onContinue}
          disabled={!selectedAction}
        >
          {selectedAction ? 'Continue Journey →' : 'Select an activity to continue'}
        </button>
      </div>
    </div>
  );
};

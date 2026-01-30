import React, { useState } from 'react';
import { useGameStore } from '../../../game/store';
import './RestScreen.css';

interface RestScreenProps {
  completedRegion: string;
  onContinue: () => void;
}

export const RestScreen: React.FC<RestScreenProps> = ({ completedRegion, onContinue }) => {
  const state = useGameStore((store) => store.state);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const applyRestAction = useGameStore((store) => store.applyRestAction);

  const restActions = [
    {
      id: 'meditate',
      name: '🧘 Meditate',
      description: 'Clear your mind and focus. Gain temporary mental fortitude.',
      benefit: '+10% Ability Power buff for next 10 encounters',
      available: true,
    },
    {
      id: 'train',
      name: '⚔️ Train',
      description: 'Practice your combat techniques.',
      benefit: '+10% Attack Damage buff for next 10 encounters',
      available: true,
    },
    {
      id: 'scout',
      name: '🔍 Scout',
      description: 'Survey the area and plan your approach.',
      benefit: '+5 Rerolls',
      available: true,
    },
  ];

  const handleContinue = () => {
    if (selectedAction) {
      applyRestAction(selectedAction as 'meditate' | 'train' | 'scout');
      onContinue();
    }
  };

  return (
    <div className="rest-screen">
      <div className="rest-container">
        <h1 className="rest-title">🏕️ Rest</h1>
        <p className="rest-subtitle">
          You've completed {completedRegion}! Prepare yourself for the next region.
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
          <h2>Choose an action to prepare:</h2>
          <div className="action-grid">
            {restActions.map((action) => (
              <button
                key={action.id}
                className={`action-card ${selectedAction === action.id ? 'selected' : ''} ${!action.available ? 'disabled' : ''}`}
                onClick={() => action.available && setSelectedAction(action.id)}
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
          onClick={handleContinue}
          disabled={!selectedAction}
        >
          {selectedAction ? `Continue to ${completedRegion} →` : 'Select an action to continue'}
        </button>
      </div>
    </div>
  );
};

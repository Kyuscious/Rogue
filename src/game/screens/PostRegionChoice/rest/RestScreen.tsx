import React, { useState } from 'react';
import { useGameStore } from '@game/store';
import { useTranslation } from '../../../../hooks/useTranslation';
import './RestScreen.css';

interface RestScreenProps {
  completedRegion: string;
  onContinue: () => void;
}

export const RestScreen: React.FC<RestScreenProps> = ({ completedRegion, onContinue }) => {
  const state = useGameStore((store) => store.state);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const applyRestAction = useGameStore((store) => store.applyRestAction);
  const t = useTranslation();

  const restActions = [
    {
      id: 'meditate',
      name: t.rest.actions.meditate.name,
      description: t.rest.actions.meditate.description,
      benefit: t.rest.actions.meditate.benefit,
      available: true,
    },
    {
      id: 'train',
      name: t.rest.actions.train.name,
      description: t.rest.actions.train.description,
      benefit: t.rest.actions.train.benefit,
      available: true,
    },
    {
      id: 'scout',
      name: t.rest.actions.scout.name,
      description: t.rest.actions.scout.description,
      benefit: t.rest.actions.scout.benefit,
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
        <h1 className="rest-title">{t.rest.title}</h1>
        <p className="rest-subtitle">
          {t.rest.subtitle.replace('{{region}}', completedRegion)}
        </p>

        <div className="rest-status">
          <div className="status-item">
            <span className="status-label">{t.rest.healthLabel}</span>
            <span className="status-value">{t.rest.fullyRestored}</span>
          </div>
          <div className="status-item">
            <span className="status-label">{t.rest.levelLabel}</span>
            <span className="status-value">{state.playerCharacter?.level}</span>
          </div>
          <div className="status-item">
            <span className="status-label">{t.rest.goldLabel}</span>
            <span className="status-value">{state.gold}g</span>
          </div>
        </div>

        <div className="rest-actions">
          <h2>{t.rest.chooseAction}</h2>
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
          {selectedAction ? t.rest.continueButton.replace('{{region}}', completedRegion) : t.rest.selectActionPrompt}
        </button>
      </div>
    </div>
  );
};

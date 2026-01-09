import React, { useState } from 'react';
import { useGameStore } from '../game/store';
import { CharacterStatus } from './CharacterStatus';
import { Battle } from './Battle';
import { Disclaimer } from './Disclaimer';
import { Login } from './Login';
import { PreGameSetup } from './PreGameSetup';
import { QuestSelect } from './QuestSelect';
import { getQuestById } from '../game/questDatabase';
import { getDemaciaEnemyById, resolveDemaciaEnemyId } from '../game/regions/demacia';
import './App.css';

type GameScene = 'disclaimer' | 'login' | 'pregame' | 'quest' | 'battle';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Reset Run?</h2>
        <p>Are you sure you want to reset your current run? You will return to region selection.</p>
        <div className="modal-buttons">
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            Reset Run
          </button>
        </div>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const { state, selectRegion, startBattle, selectQuest, selectStartingItem, resetRun } = useGameStore();
  const [scene, setScene] = useState<GameScene>('disclaimer');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleDisclaimerAccept = () => {
    setScene('login');
  };

  const handleLoginSuccess = () => {
    setScene('pregame');
  };

  const handlePreGameSetup = (region: string, itemId: string) => {
    selectRegion(region as any);
    selectStartingItem(itemId);
    setScene('quest');
  };

  const handleQuestPathSelect = (questId: string, pathId: string) => {
    selectQuest(questId, pathId);
    
    // Get the quest and path details
    const quest = getQuestById(questId);
    if (!quest) return;
    
    const path = quest.paths.find(p => p.id === pathId);
    if (!path) return;
    
    // Load enemies for this path from Demacia (for now)
    // Resolve random enemy markers (e.g., 'random:minion:guard') to actual enemy IDs
    const enemies = path.enemyIds
      .map(id => resolveDemaciaEnemyId(id))
      .map(id => getDemaciaEnemyById(id))
      .filter((enemy): enemy is typeof enemy & {} => enemy !== undefined);
    
    startBattle(enemies);
    setScene('battle');
  };

  const handleResetConfirm = () => {
    resetRun();
    setShowResetConfirm(false);
    setScene('pregame');
  };

  const handleResetCancel = () => {
    setShowResetConfirm(false);
  };

  if (scene === 'disclaimer') {
    return <Disclaimer onAccept={handleDisclaimerAccept} />;
  }

  if (scene === 'login') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (scene === 'pregame') {
    return (
      <div className="game-wrapper">
        <PreGameSetup onStartRun={handlePreGameSetup} />
      </div>
    );
  }

  if (scene === 'quest' && state.selectedRegion) {
    return (
      <div className="game-wrapper">
        <div className="ui-header">
          <div className="header-left">
            <h1>Riot Roguelike</h1>
          </div>
          <div className="ui-stats">
            <span className="region-badge">{state.selectedRegion?.toUpperCase()}</span>
            <span>Encounter: {state.currentFloor}</span>
            <span>Gold: {state.gold}</span>
          </div>
          <button className="btn-reset" onClick={() => setShowResetConfirm(true)}>
            🔄 Reset
          </button>
        </div>

        <div className="explore-screen quest-screen">
          <div className="character-info">
            <CharacterStatus />
          </div>

          <div className="quest-panel">
            <QuestSelect region={state.selectedRegion} onSelectPath={handleQuestPathSelect} />
          </div>
        </div>

        <ResetConfirmModal 
          isOpen={showResetConfirm} 
          onConfirm={handleResetConfirm} 
          onCancel={handleResetCancel} 
        />
      </div>
    );
  }

  if (scene === 'battle') {
    return (
      <div className="game-wrapper">
        <div className="ui-header">
          <div className="header-left">
            <h1>Riot Roguelike</h1>
          </div>
          <div className="ui-stats">
            <span className="region-badge">{state.selectedRegion?.toUpperCase()}</span>
            <span>Encounter: {state.currentFloor}</span>
            <span>Gold: {state.gold}</span>
          </div>
          <button className="btn-reset" onClick={() => setShowResetConfirm(true)}>
            🔄 Reset
          </button>
        </div>
        <Battle />
        <ResetConfirmModal 
          isOpen={showResetConfirm} 
          onConfirm={handleResetConfirm} 
          onCancel={handleResetCancel} 
        />
      </div>
    );
  }

  // Explore scene (fallback - shouldn't normally reach here)
  return (
    <div className="game-wrapper">
      <div className="ui-header">
        <div className="header-left">
          <h1>Riot Roguelike</h1>
        </div>
        <div className="ui-stats">
          <span className="region-badge">{state.selectedRegion?.toUpperCase()}</span>
          <span>Encounter: {state.currentFloor}</span>
          <span>Gold: {state.gold}</span>
        </div>
        <button className="btn-reset" onClick={() => setShowResetConfirm(true)}>
          🔄 Reset
        </button>
      </div>

      <div className="explore-screen">
        <div className="character-info">
          <CharacterStatus />
        </div>
      </div>

      <ResetConfirmModal 
        isOpen={showResetConfirm} 
        onConfirm={handleResetConfirm} 
        onCancel={handleResetCancel} 
      />
    </div>
  );
};

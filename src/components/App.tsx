import React, { useState } from 'react';
import { useGameStore } from '../game/store';
import { CharacterStatus } from './entity/CharacterStatus';
import { Battle } from './screens/Battle/Battle';
import { Disclaimer } from './screens/Disclaimer/Disclaimer';
import { Login } from './screens/Login/Login';
import { PreGameSetup } from './screens/PreGameSetup/PreGameSetup';
import { PreTestSetup } from './screens/PreTestSetup/PreTestSetup';
import { QuestSelect } from './screens/QuestSelect/QuestSelect';
import { getQuestById } from '../game/questDatabase';
import { getDemaciaEnemyById, resolveDemaciaEnemyId } from '../game/regions/demacia';
import { getItemById } from '../game/items';
import { CharacterStats } from '../game/statsSystem';
import './App.css';

type GameScene = 'disclaimer' | 'login' | 'pregame' | 'preTestSetup' | 'quest' | 'battle' | 'testBattle';

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

  const handleTestMode = () => {
    setScene('preTestSetup');
  };

  const handleStartTestBattle = (player: any, enemy: any, playerItems: string[], enemyItems: string[]) => {
    // Create inventory items from selected items
    const inventoryItems = playerItems.map(itemId => ({ itemId, quantity: 1 }));
    
    // Apply enemy items' stats to enemy character
    const enemyWithItems = { ...enemy };
    if (enemyItems.length > 0) {
      const itemStats: Partial<CharacterStats> = {};
      enemyItems.forEach(itemId => {
        const item = getItemById(itemId);
        if (item && item.stats) {
          // Add each stat from the item to the enemy's stats
          (Object.keys(item.stats) as Array<keyof CharacterStats>).forEach(stat => {
            const currentValue = (itemStats[stat] as number) || 0;
            const itemValue = (item.stats[stat] as number) || 0;
            (itemStats[stat] as number) = currentValue + itemValue;
          });
        }
      });
      
      // Apply the accumulated item stats to enemy's base stats
      enemyWithItems.stats = { ...enemy.stats };
      (Object.keys(itemStats) as Array<keyof CharacterStats>).forEach(stat => {
        const currentValue = (enemyWithItems.stats[stat] as number) || 0;
        const bonusValue = (itemStats[stat] as number) || 0;
        (enemyWithItems.stats[stat] as number) = currentValue + bonusValue;
      });
    }
    
    // Update store with test characters and inventory
    useGameStore.setState(prev => ({
      state: {
        ...prev.state,
        playerCharacter: player,
        enemyCharacters: [enemyWithItems],
        currentFloor: 1,
        inventory: inventoryItems,
      }
    }));
    setScene('testBattle');
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
        <PreGameSetup onStartRun={handlePreGameSetup} onTestMode={handleTestMode} />
      </div>
    );
  }

  if (scene === 'preTestSetup') {
    return <PreTestSetup onStartTestBattle={handleStartTestBattle} onBack={() => setScene('pregame')} />;
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
          <div className="character-section">
            <h2 className="quest-title">Choose Your Path</h2>
            <div className="character-info">
              <CharacterStatus />
            </div>
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

  if (scene === 'battle' || scene === 'testBattle') {
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
        <Battle onBack={() => setScene('pregame')} />
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

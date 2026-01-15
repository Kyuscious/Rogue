import React, { useState } from 'react';
import { useGameStore } from '../game/store';
import { CharacterStatus } from './entity/CharacterStatus';
import { Battle } from './screens/Battle/Battle';
import { Disclaimer } from './screens/Disclaimer/Disclaimer';
import { Login } from './screens/Login/Login';
import { PreGameSetup } from './screens/PreGameSetup/PreGameSetup';
import { PreTestSetup } from './screens/PreTestSetup/PreTestSetup';
import { QuestSelect } from './screens/QuestSelect/QuestSelect';
import { Shop } from './screens/Shop/Shop';
import { RegionSelection } from './screens/RegionSelection/RegionSelection';
import { getQuestById } from '../game/questDatabase';
import { resolveDemaciaEnemyId } from '../game/regions/demacia';
import { getEnemyById } from '../game/regions/enemyResolver';
import { getItemById } from '../game/items';
import { CharacterStats } from '../game/statsSystem';
import { Region } from '../game/types';
import { isEndingRegion } from '../game/regionGraph';
import './App.css';
import './ActComplete.css';

type GameScene = 'disclaimer' | 'login' | 'pregame' | 'preTestSetup' | 'quest' | 'shop' | 'battle' | 'testBattle' | 'regionSelection' | 'actComplete';

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
  const { state, selectRegion, startBattle, selectQuest, selectStartingItem, resetRun, addInventoryItem, travelToRegion, completeAct } = useGameStore();
  
  // Check localStorage on mount to see if we should skip disclaimer
  const shouldSkipDisclaimer = typeof window !== 'undefined' && localStorage.getItem('skipDisclaimer') === 'true';
  const [scene, setScene] = useState<GameScene>(shouldSkipDisclaimer ? 'login' : 'disclaimer');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [skipClickCount, setSkipClickCount] = useState(0);

  const handleDisclaimerAccept = () => {
    setScene('login');
  };

  const handleLoginSuccess = () => {
    setScene('pregame');
  };

  const handleLogout = () => {
    // Clear remembered credentials
    localStorage.removeItem('rememberedUsername');
    localStorage.removeItem('rememberedPassword');
    setScene('login');
  };

  const handleGoToDisclaimer = () => {
    setScene('disclaimer');
  };

  const handlePreGameSetup = (region: string, itemId: string) => {
    selectRegion(region as any);
    selectStartingItem(itemId);
    // Add 3 health potions to help start the run
    addInventoryItem({ itemId: 'health_potion', quantity: 3 });
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
    
    // Load enemies for this path
    // Resolve random enemy markers (e.g., 'random:minion:guard') to actual enemy IDs
    const enemies = path.enemyIds
      .map(id => resolveDemaciaEnemyId(id))
      .map(id => getEnemyById(id))
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

  // Handle completing a quest (10 fights) and moving to region selection
  const handleQuestComplete = () => {
    if (!state.selectedRegion) return;
    
    // Check if current region is an ending region
    if (isEndingRegion(state.selectedRegion)) {
      // Complete the current act
      completeAct(state.selectedRegion);
      setScene('actComplete');
    } else {
      // Go to region selection to choose next destination
      setScene('regionSelection');
    }
  };

  // Handle selecting a new region to travel to
  const handleSelectRegion = (newRegion: Region) => {
    if (!state.selectedRegion) return;
    
    // Travel from current region to new region
    travelToRegion(state.selectedRegion, newRegion);
    
    // Reset skip counter
    setSkipClickCount(0);
    
    // Check if the new region is an ending region
    if (isEndingRegion(newRegion)) {
      // Will complete act after finishing this region's quest
      setScene('quest');
    } else {
      setScene('quest');
    }
  };

  // Handle skip click for testing (hidden feature)
  const handleSkipClick = () => {
    setSkipClickCount(prev => prev + 1);
    if (skipClickCount + 1 >= 3) {
      // Skip the current quest and go to region selection
      setSkipClickCount(0);
      handleQuestComplete();
    }
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
        <PreGameSetup 
          onStartRun={handlePreGameSetup} 
          onTestMode={handleTestMode}
          onLogout={handleLogout}
          onGoToDisclaimer={handleGoToDisclaimer}
        />
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
            <h1>Runeterrogue</h1>
          </div>
          <div className="ui-stats">
            <span 
              className="region-badge" 
              onClick={handleSkipClick}
              style={{ cursor: 'pointer' }}
              title={skipClickCount > 0 ? `Skip: ${skipClickCount}/3` : ''}
            >
              {state.selectedRegion?.toUpperCase()}
            </span>
            <span>Encounter: {state.currentFloor}</span>
            <span>Gold: {state.gold}</span>
            <span>🎲 Rerolls: {state.rerolls}</span>
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
            
            {/* Shop Button */}
            <button 
              className="btn-shop"
              onClick={() => setScene('shop')}
            >
              🏪 Visit Shop
            </button>
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

  if (scene === 'shop' && state.selectedRegion) {
    return (
      <div className="game-wrapper">
        <div className="ui-header">
          <div className="header-left">
            <h1>Runeterrogue</h1>
          </div>
          <div className="ui-stats">
            <span className="region-badge">{state.selectedRegion?.toUpperCase()}</span>
            <span>Encounter: {state.currentFloor}</span>
            <span>Gold: {state.gold}</span>
            <span>🎲 Rerolls: {state.rerolls}</span>
          </div>
          <button className="btn-reset" onClick={() => setShowResetConfirm(true)}>
            🔄 Reset
          </button>
        </div>

        <Shop onBack={() => setScene('quest')} region={state.selectedRegion} />

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
            <h1>Runeterrogue</h1>
          </div>
          <div className="ui-stats">
            <span className="region-badge">{state.selectedRegion?.toUpperCase()}</span>
            <span>Encounter: {state.currentFloor}</span>
            <span>Gold: {state.gold}</span>
            <span>🎲 Rerolls: {state.rerolls}</span>
          </div>
          <button className="btn-reset" onClick={() => setShowResetConfirm(true)}>
            🔄 Reset
          </button>
        </div>
        <Battle onBack={() => setScene('pregame')} onQuestComplete={handleQuestComplete} />
        <ResetConfirmModal 
          isOpen={showResetConfirm} 
          onConfirm={handleResetConfirm} 
          onCancel={handleResetCancel} 
        />
      </div>
    );
  }

  if (scene === 'regionSelection') {
    return (
      <div className="game-wrapper">
        <div className="ui-header">
          <div className="header-left">
            <h1>Runeterrogue</h1>
          </div>
          <div className="ui-stats">
            <span className="region-badge">{state.selectedRegion?.toUpperCase()}</span>
            <span>Encounter: {state.currentFloor}</span>
            <span>Gold: {state.gold}</span>
            <span>🎲 Rerolls: {state.rerolls}</span>
          </div>
          <button className="btn-reset" onClick={() => setShowResetConfirm(true)}>
            🔄 Reset
          </button>
        </div>
        <RegionSelection onSelectRegion={handleSelectRegion} />
        <ResetConfirmModal 
          isOpen={showResetConfirm} 
          onConfirm={handleResetConfirm} 
          onCancel={handleResetCancel} 
        />
      </div>
    );
  }

  if (scene === 'actComplete') {
    return (
      <div className="game-wrapper">
        <div className="act-complete-screen">
          <h1>Act {state.currentAct - 1} Complete!</h1>
          <p>You have conquered {state.selectedRegion}!</p>
          <p>Prepare for Act {state.currentAct}...</p>
          <button 
            className="btn-continue"
            onClick={() => setScene('regionSelection')}
          >
            Choose Next Region
          </button>
        </div>
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
          <h1>Runeterrogue</h1>
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

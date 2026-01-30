import React, { useState, useEffect } from 'react';
import { useGameStore } from '../game/store';
import { CharacterStatus } from './entity/CharacterStatus';
import { Battle } from './screens/Battle/Battle';
import { Disclaimer } from './screens/Disclaimer/Disclaimer';
import { Login } from './screens/Login/Login';
import { MainMenu } from './screens/MainMenu/MainMenu';
import { Profiles } from './screens/Profiles/Profiles';
import { Index } from './screens/Index/Index';
import { PreGameSetup } from './screens/PreGameSetup/PreGameSetup';
import { PreTestSetup } from './screens/PreTestSetup/PreTestSetup';
import { QuestSelect } from './screens/QuestSelect/QuestSelect';
import { Shop } from './screens/Shop/Shop';
import { RegionSelection } from './screens/RegionSelection/RegionSelection';
import { LoadingScreen } from './screens/LoadingScreen/LoadingScreen';
import { RestScreen } from './screens/PostRegionChoice/RestScreen';
import { TradeScreen } from './screens/PostRegionChoice/TradeScreen';
import { EventScreen } from './screens/PostRegionChoice/EventScreen';
import { SettingsScreen } from './screens/Settings/Settings';
import { getQuestById } from '../game/questDatabase';
import { resolveEnemyIdByRegion, getEnemyById } from '../game/regions/enemyResolver';
import { getItemById } from '../game/items';
import { CharacterStats } from '../game/statsSystem';
import { Region } from '../game/types';
import { updatePlayTime, incrementBattlesWon, visitRegion } from '../game/profileSystem';
import { loadRegionAssets, unloadRegionAssets } from '../game/assetLoader';
import './App.css';
import './ActComplete.css';

type GameScene = 'disclaimer' | 'login' | 'mainMenu' | 'profiles' | 'index' | 'pregame' | 'preTestSetup' | 'quest' | 'shop' | 'battle' | 'testBattle' | 'regionSelection' | 'postRegionAction' | 'loading';

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

interface ContinueRunModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onNewRun: () => void;
  savedRunData: {
    regionName: string;
    floor: number;
    gold: number;
    rerolls: number;
    level: number;
  } | null;
}

const ContinueRunModal: React.FC<ContinueRunModalProps> = ({ isOpen, onContinue, onNewRun, savedRunData }) => {
  const [showAbortConfirm, setShowAbortConfirm] = React.useState(false);
  const [dontShowAgain, setDontShowAgain] = React.useState(false);

  if (!isOpen || !savedRunData) return null;

  const handleAbortClick = () => {
    setShowAbortConfirm(true);
  };

  const handleAbortConfirm = () => {
    if (dontShowAgain) {
      localStorage.setItem('skipAbortConfirmation', 'true');
    }
    setShowAbortConfirm(false);
    onNewRun();
  };

  const handleAbortCancel = () => {
    setShowAbortConfirm(false);
    setDontShowAgain(false);
  };

  if (showAbortConfirm) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>⚠️ Abort Run?</h2>
          <p>This will erase the save and start a new run from zero. Are you sure?</p>
          <div className="abort-confirm-checkbox">
            <label>
              <input 
                type="checkbox" 
                checked={dontShowAgain} 
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              <span>Do not show this again</span>
            </label>
          </div>
          <div className="modal-buttons">
            <button className="btn-cancel" onClick={handleAbortCancel}>
              Cancel
            </button>
            <button className="btn-danger" onClick={handleAbortConfirm}>
              Erase & Start New
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>💾 Run in Progress...</h2>
        <p>You have a saved run in progress!</p>
        <div className="saved-run-info">
          <p><strong>Region:</strong> {savedRunData.regionName}</p>
          <p><strong>Level:</strong> {savedRunData.level}</p>
          <p><strong>Encounters Completed:</strong> {savedRunData.floor}</p>
          <p><strong>Resources:</strong> {savedRunData.gold} Gold • {savedRunData.rerolls} Rerolls</p>
        </div>
        <div className="modal-buttons-continue">
          <button className="btn-continue-large" onClick={onContinue}>
            Continue Run
          </button>
          <button className="btn-abort-small" onClick={handleAbortClick}>
            Abort Run
          </button>
        </div>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const { state, selectRegion, startBattle, selectQuest, selectStartingItem, resetRun, addInventoryItem, travelToRegion, saveRun, clearSavedRun, loadRun } = useGameStore();
  
  // Check localStorage on mount to see if we should skip disclaimer
  const shouldSkipDisclaimer = typeof window !== 'undefined' && localStorage.getItem('skipDisclaimer') === 'true';
  const [scene, setScene] = useState<GameScene>(shouldSkipDisclaimer ? 'login' : 'disclaimer');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [skipClickCount, setSkipClickCount] = useState(0);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [showContinueRunModal, setShowContinueRunModal] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingRegion, setLoadingRegion] = useState<Region | null>(null);
  const [savedRunData, setSavedRunData] = useState<{ regionName: string; floor: number; gold: number; rerolls: number; level: number } | null>(null);
  const [nextRegionToTravel, setNextRegionToTravel] = useState<Region | null>(null);

  // Check for saved run on mount (after login)
  useEffect(() => {
    if (scene === 'mainMenu' && typeof window !== 'undefined') {
      const savedRun = localStorage.getItem('savedRun');
      if (savedRun) {
        try {
          const parsedRun = JSON.parse(savedRun);
          // Check if it's a valid saved run
          if (parsedRun.selectedRegion && parsedRun.currentFloor >= 0) {
            const regionName = parsedRun.selectedRegion.charAt(0).toUpperCase() + parsedRun.selectedRegion.slice(1);
            setSavedRunData({
              regionName,
              floor: parsedRun.currentFloor,
              gold: parsedRun.gold || 0,
              rerolls: parsedRun.rerolls || 0,
              level: parsedRun.playerCharacter?.level || 1,
            });
            setShowContinueRunModal(true);
          }
        } catch (error) {
          console.error('Failed to parse saved run:', error);
        }
      }
    }
  }, [scene]);

  // Track play time every 5 minutes
  useEffect(() => {
    const playTimeInterval = setInterval(() => {
      // Add 5 minutes (converted to hours: 5/60)
      updatePlayTime(5 / 60);
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    return () => clearInterval(playTimeInterval);
  }, []);

  const handleContinueRun = () => {
    const success = loadRun();
    if (success) {
      setShowContinueRunModal(false);
      setScene('quest'); // Go to quest selection where they left off
    }
  };

  const handleStartNewRun = () => {
    clearSavedRun();
    setShowContinueRunModal(false);
  };

  const handleDisclaimerAccept = () => {
    setScene('login');
  };

  const handleLoginSuccess = () => {
    setScene('mainMenu');
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

  const handleMainMenuStart = () => {
    setScene('pregame');
  };

  const handleMainMenuProfiles = () => {
    setScene('profiles');
  };

  const handleMainMenuIndex = () => {
    setScene('index');
  };

  const handleMainMenuOptions = () => {
    useGameStore.getState().toggleSettings();
  };

  const handlePreGameSetup = (region: string, itemId: string) => {
    selectRegion(region as any);
    selectStartingItem(itemId);
    // Track that we've visited this region for unlock progress
    visitRegion(region);
    // Add 3 health potions to help start the run
    addInventoryItem({ itemId: 'health_potion', quantity: 3 });
    // Add 1 stealth ward for vision control
    addInventoryItem({ itemId: 'stealth_ward', quantity: 1 });
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
    useGameStore.setState((prev: any) => ({
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
    // Use the quest's region to resolve region-specific random markers
    const enemies = path.enemyIds
      .map(id => resolveEnemyIdByRegion(id, quest.region))
      .map(id => getEnemyById(id))
      .filter((enemy): enemy is typeof enemy & {} => enemy !== undefined);
    
    startBattle(enemies);
    setScene('battle');
  };

  const handleResetConfirm = () => {
    resetRun();
    clearSavedRun(); // Clear saved run from localStorage
    setShowResetConfirm(false);
    setScene('pregame');
  };

  const handleResetCancel = () => {
    setShowResetConfirm(false);
  };

  // Handle completing a quest (10 fights) and moving to region selection
  const handleQuestComplete = () => {
    if (!state.selectedRegion) return;
    
    // Go to region selection to choose next destination
    setScene('regionSelection');
  };

  // Handle selecting a new region to travel to
  const handleSelectRegion = async (newRegion: Region) => {
    
    // Use getState() to get the CURRENT store state, not the stale component state
    const currentState = useGameStore.getState().state;
    
    if (!currentState.selectedRegion) return;
    
    // Check if there's a pending post-region action to perform
    if (currentState.pendingPostRegionAction) {
      // Store the next region and show the action screen
      setNextRegionToTravel(newRegion);
      setScene('postRegionAction');
      return;
    }
    
    // Show loading screen
    setLoadingRegion(newRegion);
    setLoadingProgress(0);
    setLoadingMessage('Preparing journey...');
    setScene('loading');
    
    // Unload previous region's assets
    unloadRegionAssets();
    
    // Load new region's assets
    await loadRegionAssets(newRegion, (progress, message) => {
      setLoadingProgress(progress);
      setLoadingMessage(message);
    });
    
    // Ensure we stay on loading screen for at least 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Travel from current region to new region
    travelToRegion(currentState.selectedRegion, newRegion);
    
    // Track that we've visited this new region for unlock progress
    visitRegion(newRegion);
    
    // Reset skip counter
    setSkipClickCount(0);
    
    // Go to quest scene and save progress
    setScene('quest');
    
    // Save run progress after a short delay (to ensure state is updated)
    setTimeout(() => {
      saveRun();
      setShowSavedIndicator(true);
      setTimeout(() => setShowSavedIndicator(false), 3000); // Hide after 3 seconds
    }, 100);
  };

  const handlePostRegionActionComplete = async () => {
    // Action has been applied by RestScreen or other action screen
    // Clear the pending action and completed region
    useGameStore.getState().setPostRegionAction(null);
    useGameStore.getState().setCompletedRegion(null);
    
    // Now proceed to travel to the next region
    if (!nextRegionToTravel || !state.selectedRegion) return;
    
    // Show loading screen
    setLoadingRegion(nextRegionToTravel);
    setLoadingProgress(0);
    setLoadingMessage('Preparing journey...');
    setScene('loading');
    
    // Unload previous region's assets
    unloadRegionAssets();
    
    // Load new region's assets
    await loadRegionAssets(nextRegionToTravel, (progress, message) => {
      setLoadingProgress(progress);
      setLoadingMessage(message);
    });
    
    // Ensure we stay on loading screen for at least 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Travel from current region to new region
    travelToRegion(state.selectedRegion, nextRegionToTravel);
    
    // Track that we've visited this new region for unlock progress
    visitRegion(nextRegionToTravel);
    
    // Reset skip counter
    setSkipClickCount(0);
    
    // Go to quest scene and save progress
    setScene('quest');
    
    // Save run progress after a short delay (to ensure state is updated)
    setTimeout(() => {
      saveRun();
      setShowSavedIndicator(true);
      setTimeout(() => setShowSavedIndicator(false), 3000); // Hide after 3 seconds
    }, 100);
    
    // Clear the next region
    setNextRegionToTravel(null);
  };

  // Handle skip click for testing (hidden feature)
  const handleSkipClick = () => {
    setSkipClickCount(prev => prev + 1);
    if (skipClickCount + 1 >= 3) {
      // Skip the current quest and go to region selection with action choices
      setSkipClickCount(0);
      
      // Award 10 battles won for skipping the region
      for (let i = 0; i < 10; i++) {
        incrementBattlesWon();
      }
      
      // Increment floor counter by 10 for difficulty scaling
      useGameStore.getState().setCurrentFloor(state.currentFloor + 10);
      
      // Set completed region so RegionSelection shows action options (Rest, Build, Event)
      useGameStore.getState().setCompletedRegion(state.selectedRegion);
      
      // Go to region selection
      setScene('regionSelection');
    }
  };

  if (scene === 'disclaimer') {
    return <Disclaimer onAccept={handleDisclaimerAccept} />;
  }

  if (scene === 'login') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (scene === 'mainMenu') {
    return (
      <div className="game-wrapper">
        <MainMenu 
          username={state.username}
          onStart={handleMainMenuStart}
          onProfiles={handleMainMenuProfiles}
          onIndex={handleMainMenuIndex}
          onOptions={handleMainMenuOptions}
          onLogout={handleLogout}
          onDisclaimer={handleGoToDisclaimer}
        />
        
        <ContinueRunModal 
          isOpen={showContinueRunModal}
          onContinue={handleContinueRun}
          onNewRun={handleStartNewRun}
          savedRunData={savedRunData}
        />
        
        {/* Settings Modal */}
        <SettingsScreen />
      </div>
    );
  }

  if (scene === 'profiles') {
    return (
      <div className="game-wrapper">
        <Profiles onBack={() => setScene('mainMenu')} />
        <SettingsScreen />
      </div>
    );
  }
  if (scene === 'index') {
    return (
      <div className="game-wrapper">
        <Index onBack={() => setScene('mainMenu')} />
        <SettingsScreen />
      </div>
    );
  }
  if (scene === 'pregame') {
    return (
      <div className="game-wrapper">
        <PreGameSetup 
          onStartRun={handlePreGameSetup} 
          onTestMode={handleTestMode}
          onBack={() => setScene('mainMenu')}
        />
        <SettingsScreen />
      </div>
    );
  }

  if (scene === 'preTestSetup') {
    return (
      <>
        <PreTestSetup onStartTestBattle={handleStartTestBattle} onBack={() => setScene('pregame')} />
        <SettingsScreen />
      </>
    );
  }

  if (scene === 'quest' && state.selectedRegion) {
    return (
      <div className="game-wrapper">
        <div className="ui-header">
          <div className="header-left">
            <h1>Runeterrogue</h1>
            {showSavedIndicator && (
              <span className="saved-indicator">💾 Progress Saved</span>
            )}
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
          <div className="header-actions">
            <button className="btn-settings" onClick={() => useGameStore.getState().toggleSettings()} title="Settings">
              ⚙️
            </button>
            <button className="btn-reset" onClick={() => setShowResetConfirm(true)}>
              🔄 Reset
            </button>
          </div>
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
              onClick={() => {
                setScene('shop');
                // Save progress when entering shop
                setTimeout(() => {
                  saveRun();
                  setShowSavedIndicator(true);
                  setTimeout(() => setShowSavedIndicator(false), 3000);
                }, 100);
              }}
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
        
        {/* Settings Modal */}
        <SettingsScreen />
      </div>
    );
  }

  if (scene === 'shop' && state.selectedRegion) {
    return (
      <div className="game-wrapper">
        <div className="ui-header">
          <div className="header-left">
            <h1>Runeterrogue</h1>
            {showSavedIndicator && (
              <span className="saved-indicator">💾 Progress Saved</span>
            )}
          </div>
          <div className="ui-stats">
            <span className="region-badge">{state.selectedRegion?.toUpperCase()}</span>
            <span>Encounter: {state.currentFloor}</span>
            <span>Gold: {state.gold}</span>
            <span>🎲 Rerolls: {state.rerolls}</span>
          </div>
          <div className="header-actions">
            <button className="btn-settings" onClick={() => useGameStore.getState().toggleSettings()} title="Settings">
              ⚙️
            </button>
            <button className="btn-reset" onClick={() => setShowResetConfirm(true)}>
              🔄 Reset
            </button>
          </div>
        </div>

        <Shop onBack={() => setScene('quest')} region={state.selectedRegion} />

        <ResetConfirmModal 
          isOpen={showResetConfirm} 
          onConfirm={handleResetConfirm} 
          onCancel={handleResetCancel} 
        />
        
        {/* Settings Modal */}
        <SettingsScreen />
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
          <div className="header-actions">
            <button className="btn-settings" onClick={() => useGameStore.getState().toggleSettings()} title="Settings">
              ⚙️
            </button>
            <button className="btn-reset" onClick={() => setShowResetConfirm(true)}>
              🔄 Reset
            </button>
          </div>
        </div>
        <Battle onBack={() => setScene('pregame')} onQuestComplete={handleQuestComplete} />
        <ResetConfirmModal 
          isOpen={showResetConfirm} 
          onConfirm={handleResetConfirm} 
          onCancel={handleResetCancel} 
        />
        
        {/* Settings Modal */}
        <SettingsScreen />
      </div>
    );
  }

  if (scene === 'postRegionAction') {
    const completedRegion = state.completedRegion || state.selectedRegion;
    
    if (state.pendingPostRegionAction === 'rest') {
      if (completedRegion) {
        return (
          <RestScreen 
            completedRegion={completedRegion}
            onContinue={handlePostRegionActionComplete}
          />
        );
      }
    } else if (state.pendingPostRegionAction === 'trade') {
      if (completedRegion) {
        return (
          <TradeScreen 
            completedRegion={completedRegion}
            onContinue={handlePostRegionActionComplete}
          />
        );
      }
    } else if (state.pendingPostRegionAction === 'event') {
      if (completedRegion) {
        return (
          <EventScreen 
            completedRegion={completedRegion}
            onContinue={handlePostRegionActionComplete}
          />
        );
      }
    }
    // Other post-region actions can be added here
    handlePostRegionActionComplete();
    return null;
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
          <div className="header-actions">
            <button className="btn-settings" onClick={() => useGameStore.getState().toggleSettings()} title="Settings">
              ⚙️
            </button>
            <button className="btn-reset" onClick={() => setShowResetConfirm(true)}>
              🔄 Reset
            </button>
          </div>
        </div>
        <RegionSelection onSelectRegion={handleSelectRegion} />
        <ResetConfirmModal 
          isOpen={showResetConfirm} 
          onConfirm={handleResetConfirm} 
          onCancel={handleResetCancel} 
        />
        
        {/* Settings Modal */}
        <SettingsScreen />
      </div>
    );
  }

  if (scene === 'loading' && loadingRegion) {
    return (
      <>
        <LoadingScreen 
          regionName={loadingRegion.charAt(0).toUpperCase() + loadingRegion.slice(1)}
          progress={loadingProgress}
          message={loadingMessage}
        />
        <SettingsScreen />
      </>
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
        <div className="header-actions">
          <button className="btn-settings" onClick={() => useGameStore.getState().toggleSettings()} title="Settings">
            ⚙️
          </button>
          <button className="btn-reset" onClick={() => setShowResetConfirm(true)}>
            🔄 Reset
          </button>
        </div>
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

      <ContinueRunModal 
        isOpen={showContinueRunModal}
        onContinue={handleContinueRun}
        onNewRun={handleStartNewRun}
        savedRunData={savedRunData}
      />
      
      {/* Post-Region Choice Overlay - DISABLED: Logic is now in RegionSelection */}
      {/* <PostRegionChoiceScreen /> */}
      
      {/* Settings Modal */}
      <SettingsScreen />
    </div>
  );
};

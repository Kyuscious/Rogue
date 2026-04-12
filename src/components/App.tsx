import React, { useState, useEffect } from 'react';
import { useGameStore } from '../game/store';
import { useTranslation } from '../hooks/useTranslation';
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
import { ScreenTitle } from './shared/ScreenTitle';
import { getQuestById } from '../game/questDatabase';
import { resolveEnemyIdByRegion, getEnemyById } from '../game/regions/enemyResolver';
import { getItemById } from '../game/items';
import { CharacterStats } from '../game/statsSystem';
import { Region } from '../game/types';
import { updatePlayTime, incrementBattlesWon, visitRegion, getActiveProfile } from '../game/profileSystem';
import { loadRegionAssets, unloadRegionAssets } from '../game/assetLoader';
import './App.css';
import './ActComplete.css';

type GameScene = 'disclaimer' | 'login' | 'mainMenu' | 'profiles' | 'index' | 'pregame' | 'preTestSetup' | 'quest' | 'shop' | 'battle' | 'testBattle' | 'regionSelection' | 'postRegionAction' | 'loading';
type TutorialStage = 'none' | 'pregame' | 'quest' | 'battle' | 'battleLoot' | 'battleElite' | 'shop';
type QuestTutorialFocus = 'header' | 'path' | 'mechanics' | 'stats' | null;

interface ResetConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  const t = useTranslation();
  
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{t.resetConfirm.title}</h2>
        <p>{t.resetConfirm.message}</p>
        <div className="modal-buttons">
          <button className="btn-cancel" onClick={onCancel}>
            {t.resetConfirm.cancel}
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            {t.resetConfirm.confirm}
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
  const t = useTranslation();
  
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
  const [tutorialStage, setTutorialStage] = useState<TutorialStage>('none');
  const [sceneTutorialStep, setSceneTutorialStep] = useState(0);
  const [showSadSkip, setShowSadSkip] = useState(false);
  const [showBattleActionPrompt, setShowBattleActionPrompt] = useState(false);
  const [questTutorialFocus, setQuestTutorialFocus] = useState<QuestTutorialFocus>(null);

  const getTutorialStorageKey = (profileId: number) => `tutorialCompleted_profile_${profileId}`;
  const getEliteTutorialStorageKey = (profileId: number) => `eliteTutorialSeen_profile_${profileId}`;

  const shouldStartFirstTimeTutorial = () => {
    const profile = getActiveProfile();
    const hasCompletedTutorial = localStorage.getItem(getTutorialStorageKey(profile.id)) === 'true';
    const hasNeverPlayed = profile.stats.hoursPlayed <= 0;
    return hasNeverPlayed && !hasCompletedTutorial;
  };

  const markTutorialCompleted = (completed: boolean) => {
    const profile = getActiveProfile();
    localStorage.setItem(getTutorialStorageKey(profile.id), completed ? 'true' : 'false');
  };

  const hasSeenEliteTutorial = () => {
    const profile = getActiveProfile();
    return localStorage.getItem(getEliteTutorialStorageKey(profile.id)) === 'true';
  };

  const markEliteTutorialSeen = (seen: boolean) => {
    const profile = getActiveProfile();
    localStorage.setItem(getEliteTutorialStorageKey(profile.id), seen ? 'true' : 'false');
  };

  const startTutorialFromStage = (stage: Exclude<TutorialStage, 'none'>) => {
    markTutorialCompleted(false);
    markEliteTutorialSeen(false);
    setSceneTutorialStep(0);
    setTutorialStage(stage);
    if (stage === 'pregame') {
      setScene('pregame');
    }
  };

  const handleTutorialSkipAnytime = () => {
    markTutorialCompleted(true);
    markEliteTutorialSeen(true);
    setSceneTutorialStep(0);
    setShowBattleActionPrompt(false);
    setTutorialStage('none');
    setQuestTutorialFocus(null);
    setShowSadSkip(true);
    setTimeout(() => setShowSadSkip(false), 5000);
  };

  const handleReenableTutorial = () => {
    if (scene === 'quest') {
      startTutorialFromStage('quest');
      return;
    }
    if (scene === 'battle') {
      startTutorialFromStage('battle');
      return;
    }
    if (scene === 'shop') {
      startTutorialFromStage('shop');
      return;
    }
    startTutorialFromStage('pregame');
  };

  // Apply theme settings on mount to prevent extension interference
  useEffect(() => {
    const applyTheme = () => {
      document.documentElement.style.setProperty('--theme-brightness', state.themeSettings.brightness.toString());
      document.documentElement.style.setProperty('--theme-saturation', state.themeSettings.saturation.toString());
      document.documentElement.style.setProperty('--theme-contrast', state.themeSettings.contrast.toString());
      // Mark root as game-controlled
      document.documentElement.setAttribute('data-game-theme', 'true');
    };
    
    // Apply on mount and whenever theme settings change
    applyTheme();
  }, [state.themeSettings]);

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
    if (shouldStartFirstTimeTutorial()) {
      setTutorialStage('pregame');
      setSceneTutorialStep(0);
    } else {
      setTutorialStage('none');
    }
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
    setTutorialStage('none');
    setSceneTutorialStep(0);
    setScene('preTestSetup');
  };

  const handlePreGameTutorialComplete = () => {
    setTutorialStage('quest');
    setSceneTutorialStep(0);
  };

  const handleQuestTutorialComplete = () => {
    setTutorialStage('battle');
    setSceneTutorialStep(0);
    setQuestTutorialFocus(null);
  };

  const getSceneTutorialSteps = () => {
    if (scene === 'battle' && tutorialStage === 'battle') {
      return [
        t.tutorial.battle.battle,
        t.tutorial.battle.enemy,
        t.tutorial.battle.battlefield,
        t.tutorial.battle.timeline,
        t.tutorial.battle.log,
        t.tutorial.battle.actions,
        t.tutorial.battle.speed,
        t.tutorial.battle.move,
        t.tutorial.battle.attack,
        t.tutorial.battle.haste,
        t.tutorial.battle.items,
        t.tutorial.battle.cast,
      ];
    }

    if (scene === 'battle' && tutorialStage === 'battleElite') {
      return [t.tutorial.battle.elite];
    }

    if (scene === 'shop' && tutorialStage === 'shop') {
      return [
        t.tutorial.shop.intro,
        t.tutorial.shop.buy,
        t.tutorial.shop.sell,
      ];
    }

    return [];
  };

  const handleSceneTutorialNext = () => {
    const steps = getSceneTutorialSteps();
    if (steps.length === 0) return;

    if (scene === 'battle' && tutorialStage === 'battle' && sceneTutorialStep === 11) {
      setShowBattleActionPrompt(true);
      return;
    }

    if (sceneTutorialStep >= steps.length - 1) {
      if (tutorialStage === 'battle') {
        setTutorialStage('shop');
      } else if (tutorialStage === 'battleElite') {
        markEliteTutorialSeen(true);
        setTutorialStage('none');
      } else if (tutorialStage === 'shop') {
        markTutorialCompleted(true);
        setTutorialStage('none');
      }
      setSceneTutorialStep(0);
      return;
    }

    setSceneTutorialStep(prev => prev + 1);
  };

  const handleBattleTutorialActionUsed = () => {
    if (scene !== 'battle' || tutorialStage !== 'battle') return;

    if (sceneTutorialStep >= 11) {
      setShowBattleActionPrompt(false);
      setTutorialStage('battleLoot');
      setSceneTutorialStep(0);
    }
  };

  const handleBattleLootTutorialComplete = () => {
    if (tutorialStage === 'battleLoot') {
      setTutorialStage('shop');
    }
  };

  useEffect(() => {
    if ((scene === 'battle' && tutorialStage === 'battle') || (scene === 'shop' && tutorialStage === 'shop')) {
      setSceneTutorialStep(0);
    }
  }, [scene, tutorialStage]);

  useEffect(() => {
    if (scene !== 'battle' || tutorialStage !== 'battle') {
      setShowBattleActionPrompt(false);
    }
  }, [scene, tutorialStage]);

  useEffect(() => {
    if (scene !== 'battle') return;
    if (tutorialStage !== 'none') return;
    if (state.currentFloor !== 5) return;
    if (hasSeenEliteTutorial()) return;

    setTutorialStage('battleElite');
    setSceneTutorialStep(0);
  }, [scene, tutorialStage, state.currentFloor]);

  const renderSceneTutorialOverlay = () => {
    const steps = getSceneTutorialSteps();
    if (steps.length === 0) return null;

    if (scene === 'battle' && tutorialStage === 'battle' && sceneTutorialStep === 11 && showBattleActionPrompt) {
      return null;
    }

    const text = steps[Math.min(sceneTutorialStep, steps.length - 1)];
    const isBattleActionStep = scene === 'battle' && tutorialStage === 'battle' && sceneTutorialStep >= 5;

    return (
      <>
        <div className="scene-tutorial-overlay" />
        <div className={`scene-tutorial-dialogue-box ${isBattleActionStep ? 'scene-tutorial-dialogue-box-top' : ''}`}>
          <button className="scene-tutorial-skip-top-btn" onClick={handleTutorialSkipAnytime}>
            {t.tutorial.skip}
          </button>
          <div className="scene-tutorial-character">🧙</div>
          <div className="scene-tutorial-content">
            <p className="scene-tutorial-speaker-name">{t.tutorial.npcName}</p>
            <p className="scene-tutorial-text">{text}</p>
            <div className="scene-tutorial-actions">
              <button className="scene-tutorial-action-btn" onClick={handleSceneTutorialNext}>
                {sceneTutorialStep >= steps.length - 1 ? t.common.confirm : t.common.continue}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  const handleStartTestBattle = (
    player: any,
    enemy: any,
    playerItems: Array<{ itemId: string; quantity: number }>,
    enemyItems: Array<{ itemId: string; quantity: number }>,
    playerUseItems: Array<{ itemId: string; quantity: number }>,
    _enemyUseItems: Array<{ itemId: string; quantity: number }>,
    _playerWeapons: string[],
    _enemyWeapons: string[],
    _playerSpells: string[],
    _enemySpells: string[]
  ) => {
    // Create inventory items from selected items (with quantities)
    const inventoryItems = [...playerItems];
    
    // Add use-items to inventory
    inventoryItems.push(...playerUseItems);
    
    // Apply enemy items' stats to enemy character
    const enemyWithItems = { ...enemy };
    if (enemyItems.length > 0) {
      const itemStats: Partial<CharacterStats> = {};
      enemyItems.forEach(({ itemId, quantity }) => {
        const item = getItemById(itemId);
        if (item && item.stats) {
          // Add each stat from the item to the enemy's stats (multiplied by quantity)
          (Object.keys(item.stats) as Array<keyof CharacterStats>).forEach(stat => {
            const currentValue = (itemStats[stat] as number) || 0;
            const itemValue = (item.stats[stat] as number) || 0;
            (itemStats[stat] as number) = currentValue + (itemValue * quantity);
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
      
      // Set enemy's inventory to the items they were given
      enemyWithItems.inventory = enemyItems;
    } else {
      // Enemy has no items - initialize with empty inventory
      enemyWithItems.inventory = [];
    }
    
    // Update store with test characters, inventory, weapons and spells
    useGameStore.setState((prev: any) => ({
      state: {
        ...prev.state,
        playerCharacter: player,
        enemyCharacters: [enemyWithItems],
        currentFloor: 1,
        inventory: inventoryItems,
        weapons: _playerWeapons,
        spells: _playerSpells,
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
    
    // Mark the completed quest path
    if (state.selectedQuest) {
      useGameStore.getState().markQuestPathCompleted(state.selectedQuest.questId, state.selectedQuest.pathId);
    }
    
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
          onTutorial={handleReenableTutorial}
          tutorialEnabled={tutorialStage === 'pregame'}
          onTutorialComplete={handlePreGameTutorialComplete}
          onTutorialSkip={handleTutorialSkipAnytime}
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
    const isQuestTutorial = tutorialStage === 'quest';
    const isQuestHeaderFocus = isQuestTutorial && questTutorialFocus === 'header';

    return (
      <div className="game-wrapper">
        <div className="ui-header">
          <div className="header-left">
            <ScreenTitle scene={scene} />
            {showSavedIndicator && (
              <span className="saved-indicator">{t.uiHeader.progressSaved}</span>
            )}
          </div>
          <div className={`ui-stats ${isQuestHeaderFocus ? 'quest-tutorial-highlight-global' : isQuestTutorial ? 'quest-tutorial-muted-global' : ''}`}>
            <span 
              className="region-badge" 
              onClick={handleSkipClick}
              style={{ cursor: 'pointer' }}
              title={skipClickCount > 0 ? `Skip: ${skipClickCount}/3` : ''}
            >
              {state.selectedRegion?.toUpperCase()}
            </span>
            <span>{t.uiHeader.encounter}: {state.currentFloor}</span>
            <span>{t.uiHeader.gold}: {state.gold}</span>
            <span>🎲 Rerolls: {state.rerolls}</span>
          </div>
          <div className="header-actions">
            <button className="btn-settings" onClick={handleReenableTutorial} title={t.tutorial.reenable}>
              ❔
            </button>
            <button className="btn-settings" onClick={() => useGameStore.getState().toggleSettings()} title="Settings">
              ⚙️
            </button>
            <button className="btn-reset" onClick={() => setShowResetConfirm(true)}>
              🔄 Reset
            </button>
          </div>
        </div>

        <div className="explore-screen quest-screen">
          <div className={`character-section ${isQuestHeaderFocus ? 'quest-tutorial-muted-global' : ''}`}>
            <h2 className="quest-title">Choose Your Path</h2>
            <div className={`character-info ${tutorialStage === 'quest' && questTutorialFocus === 'stats' ? 'quest-tutorial-highlight-global' : tutorialStage === 'quest' && (questTutorialFocus === 'header' || questTutorialFocus === 'path' || questTutorialFocus === 'mechanics') ? 'quest-tutorial-muted-global' : ''}`}>
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
            <QuestSelect
              region={state.selectedRegion}
              onSelectPath={handleQuestPathSelect}
              tutorialEnabled={tutorialStage === 'quest'}
              onTutorialComplete={handleQuestTutorialComplete}
              onTutorialSkip={handleTutorialSkipAnytime}
              onTutorialFocusChange={setQuestTutorialFocus}
            />
          </div>
        </div>

        {showSadSkip && (
          <div className="sad-skip-toast">{t.tutorial.sadskip}</div>
        )}

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
            <ScreenTitle scene={scene} />
            {showSavedIndicator && (
              <span className="saved-indicator">{t.uiHeader.progressSaved}</span>
            )}
          </div>
          <div className="ui-stats">
            <span className="region-badge">{state.selectedRegion?.toUpperCase()}</span>
            <span>{t.uiHeader.encounter}: {state.currentFloor}</span>
            <span>{t.uiHeader.gold}: {state.gold}</span>
            <span>🎲 Rerolls: {state.rerolls}</span>
          </div>
          <div className="header-actions">
            <button className="btn-settings" onClick={handleReenableTutorial} title={t.tutorial.reenable}>
              ❔
            </button>
            <button className="btn-settings" onClick={() => useGameStore.getState().toggleSettings()} title={t.uiHeader.settings}>
              ⚙️
            </button>
            <button className="btn-reset" onClick={() => setShowResetConfirm(true)}>
              🔄 {t.uiHeader.reset}
            </button>
          </div>
        </div>

        <Shop onBack={() => setScene('quest')} region={state.selectedRegion} />

        {renderSceneTutorialOverlay()}

        {showSadSkip && (
          <div className="sad-skip-toast">{t.tutorial.sadskip}</div>
        )}

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
    const isBattleActionPromptActive =
      tutorialStage === 'battle' && scene === 'battle' && sceneTutorialStep === 11 && showBattleActionPrompt;

    const battleTutorialFocus = tutorialStage === 'battle' && scene === 'battle'
      ? (isBattleActionPromptActive
          ? null
          : sceneTutorialStep === 0
          ? 'battle'
          : sceneTutorialStep === 1
            ? 'enemy'
            : sceneTutorialStep === 2
              ? 'turns-battlefield'
              : sceneTutorialStep === 3
                ? 'turns-timeline'
                : sceneTutorialStep === 4
                  ? 'turns-log'
                  : sceneTutorialStep === 5
                    ? 'actions'
                    : sceneTutorialStep === 6
                      ? 'speed'
                      : sceneTutorialStep === 7
                        ? 'speed-move'
                        : sceneTutorialStep === 8
                          ? 'speed-attack'
                          : sceneTutorialStep === 9
                            ? 'haste'
                            : sceneTutorialStep === 10
                              ? 'haste-item'
                              : 'cast')
      : null;

    return (
      <div className="game-wrapper">
        <div className="ui-header">
          <div className="header-left">
            <ScreenTitle scene={scene} />
          </div>
          <div className="ui-stats">
            <span className="region-badge">{state.selectedRegion?.toUpperCase()}</span>
            <span>{t.uiHeader.encounter}: {state.currentFloor}</span>
            <span>{t.uiHeader.gold}: {state.gold}</span>
            <span>🎲 Rerolls: {state.rerolls}</span>
          </div>
          <div className="header-actions">
            <button className="btn-settings" onClick={handleReenableTutorial} title={t.tutorial.reenable}>
              ❔
            </button>
            <button className="btn-settings" onClick={() => useGameStore.getState().toggleSettings()} title={t.uiHeader.settings}>
              ⚙️
            </button>
            <button className="btn-reset" onClick={() => setShowResetConfirm(true)}>
              🔄 {t.uiHeader.reset}
            </button>
          </div>
        </div>
        <Battle
          onBack={() => setScene('pregame')}
          onQuestComplete={handleQuestComplete}
          tutorialFocus={battleTutorialFocus}
          tutorialActionPromptActive={isBattleActionPromptActive}
          onTutorialActionUsed={handleBattleTutorialActionUsed}
          lootTutorialEnabled={tutorialStage === 'battleLoot'}
          onLootTutorialComplete={handleBattleLootTutorialComplete}
        />

        {renderSceneTutorialOverlay()}

        {isBattleActionPromptActive && (
          <div className="sad-skip-toast">{t.tutorial.battle.useSpellOrItem}</div>
        )}

        {showSadSkip && (
          <div className="sad-skip-toast">{t.tutorial.sadskip}</div>
        )}

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
            nextRegion={nextRegionToTravel || undefined}
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
            <ScreenTitle scene={scene} />
          </div>
          <div className="ui-stats">
            <span className="region-badge">{state.selectedRegion?.toUpperCase()}</span>
            <span>{t.uiHeader.encounter}: {state.currentFloor}</span>
            <span>{t.uiHeader.gold}: {state.gold}</span>
            <span>🎲 Rerolls: {state.rerolls}</span>
          </div>
          <div className="header-actions">
            <button className="btn-settings" onClick={() => useGameStore.getState().toggleSettings()} title={t.uiHeader.settings}>
              ⚙️
            </button>
            <button className="btn-reset" onClick={() => setShowResetConfirm(true)}>
              🔄 {t.uiHeader.reset}
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
          <ScreenTitle scene={scene} />
        </div>
        <div className="ui-stats">
          <span className="region-badge">{state.selectedRegion?.toUpperCase()}</span>
          <span>{t.uiHeader.encounter}: {state.currentFloor}</span>
          <span>{t.uiHeader.gold}: {state.gold}</span>
        </div>
        <div className="header-actions">
          <button className="btn-settings" onClick={() => useGameStore.getState().toggleSettings()} title={t.uiHeader.settings}>
            ⚙️
          </button>
          <button className="btn-reset" onClick={() => setShowResetConfirm(true)}>
            🔄 {t.uiHeader.reset}
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

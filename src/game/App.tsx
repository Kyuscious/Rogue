import React, { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '@game/store';
import { useTranslation } from '../hooks/useTranslation';
import { CharacterStatus } from './shared/StatusPanels/CharacterStatus';
import { FamiliarStatus } from './shared/StatusPanels/FamiliarStatus';
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
import { RestScreen } from './screens/PostRegionChoice/rest/RestScreen';
import { TradeScreen } from './screens/PostRegionChoice/modify/TradeScreen';
import { EventScreen } from './screens/PostRegionChoice/events/EventScreen';
import { SettingsScreen } from './screens/Settings/Settings';
import { ScreenTitle } from './shared/ScreenTitle';
import { getQuestById, normalizeEncounterEnemyIds } from './screens/QuestSelect/logic';
import { resolveEnemyIdByRegion, getEnemyById } from './shared/regions';
import { Character, Region } from '@game/types';
import { updatePlayTime, incrementBattlesWon, visitRegion, getActiveProfile, markHardRegionCompleted } from './screens/MainMenu/Profiles/profileSystem';
import { loadRegionAssets, unloadRegionAssets } from '@utils/assetLoader';
import { getActiveFamiliarIds, initializeFamiliarState } from './entity/Player/familiars';
import { EntityInspectPanel, EntityInspectTarget } from '@entities/shared';
import { getAvailableDestinations, getRegionTier } from './screens/PostRegionChoice/regionGraph';
import { ARTIFACT_DATABASE } from '@data/artifacts';
import {
  hasSeenEliteRewardTutorial,
  hasSeenEliteTutorial,
  hasSeenRegionTravelTutorial,
  markEliteRewardTutorialSeen,
  markEliteTutorialSeen,
  markRegionTravelTutorialSeen,
  markTutorialCompleted,
  markTutorialFullySkipped,
  markTutorialIntroSeen,
  resetTutorialReplayFlags,
  resolveTutorialStageForScene,
  shouldStartFirstTimeTutorial,
  type TutorialStage,
} from './tutorial/tutorialProgress';
import { CUSTOM_TUTORIAL_RUN_CONFIG, shouldStartCustomTutorialRun } from './tutorial/tutorialRunConfig';
import './App.css';

type GameScene = 'disclaimer' | 'login' | 'mainMenu' | 'profiles' | 'index' | 'pregame' | 'preTestSetup' | 'quest' | 'shop' | 'battle' | 'testBattle' | 'regionSelection' | 'postRegionAction' | 'loading';
type QuestTutorialFocus = 'header' | 'path' | 'mechanics' | 'stats' | null;
type TutorialCheckpointStatus = 'complete' | 'current' | 'pending';

interface TutorialCheckpointItem {
  id: string;
  label: string;
  status: TutorialCheckpointStatus;
}

type TutorialBattleAction = {
  type: 'spell' | 'attack' | 'item' | 'move' | 'inspect';
  spellId?: string;
  weaponId?: string;
  itemId?: string;
  distance?: number;
  targetId?: string;
  attackTurn?: boolean;
  viaBuffHover?: boolean;
};

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
  const [showEliteRewardPrompt, setShowEliteRewardPrompt] = useState(false);
  const [questTutorialFocus, setQuestTutorialFocus] = useState<QuestTutorialFocus>(null);
  const [isCustomTutorialRunActive, setIsCustomTutorialRunActive] = useState(false);
  const [tutorialFightStep, setTutorialFightStep] = useState<'spell' | 'attack' | 'finish' | null>(null);
  const [tutorialFightIntroStep, setTutorialFightIntroStep] = useState<0 | 1 | 2 | null>(null);
  const [tutorialSecondFightStep, setTutorialSecondFightStep] = useState<'potion' | 'inspect' | 'move' | 'melee' | 'finish' | null>(null);
  const [tutorialSecondFightPrepared, setTutorialSecondFightPrepared] = useState(false);
  const [tutorialThirdFightStep, setTutorialThirdFightStep] = useState<'inspect-first' | 'ward' | 'inspect-reveal' | 'purify' | 'finish' | null>(null);
  const [tutorialThirdFightPrepared, setTutorialThirdFightPrepared] = useState(false);
  const [tutorialRewardBriefingDone, setTutorialRewardBriefingDone] = useState(false);
  const [appInspectOpen, setAppInspectOpen] = useState(false);
  const [appInspectTargetId, setAppInspectTargetId] = useState<string | null>(null);

  const activeFamiliarIds = useMemo(() => getActiveFamiliarIds(state.familiars), [state.familiars]);
  const activeArtifactIds = state.activeArtifacts ?? [];
  const activeArtifactDetails = useMemo(
    () =>
      activeArtifactIds
        .map((artifactId) => ARTIFACT_DATABASE[artifactId])
        .filter((artifact): artifact is NonNullable<typeof artifact> => Boolean(artifact)),
    [activeArtifactIds]
  );

  const appInspectContext = scene === 'quest' ? 'quest' : scene === 'regionSelection' ? 'region' : 'generic';
  const appInspectTargets = useMemo<EntityInspectTarget[]>(() => {
    const targets: EntityInspectTarget[] = [
      {
        id: 'player-main',
        kind: 'character',
        context: appInspectContext,
        isRevealed: true,
        character: state.playerCharacter,
      },
    ];

    activeFamiliarIds.forEach((familiarId) => {
      targets.push({
        id: `familiar-${familiarId}`,
        kind: 'familiar',
        context: appInspectContext,
        isRevealed: true,
        familiarId,
        familiarCurrentHp: state.familiarStates[familiarId]?.currentHp,
      });
    });

    return targets;
  }, [activeFamiliarIds, appInspectContext, state.familiarStates, state.playerCharacter]);

  const openAppInspect = (targetId: string) => {
    setAppInspectTargetId(targetId);
    setAppInspectOpen(true);
  };

  const startTutorialFromStage = (stage: Exclude<TutorialStage, 'none'>) => {
    const profile = getActiveProfile();
    resetTutorialReplayFlags(profile.id);
    setSceneTutorialStep(0);
    setTutorialStage(stage);
    if (stage === 'pregame') {
      markTutorialIntroSeen(profile.id, true);
      setScene('pregame');
    }
  };

  const handleTutorialSkipAnytime = () => {
    const profile = getActiveProfile();
    markTutorialFullySkipped(profile.id);
    setSceneTutorialStep(0);
    setShowBattleActionPrompt(false);
    setShowEliteRewardPrompt(false);
    setTutorialStage('none');
    setQuestTutorialFocus(null);
    setShowSadSkip(true);
    setTimeout(() => setShowSadSkip(false), 5000);
  };

  const handleReenableTutorial = () => {
    if (scene === 'pregame') {
      const profile = getActiveProfile();
      resetTutorialReplayFlags(profile.id);
      markTutorialIntroSeen(profile.id, true);
      startCustomTutorialRun('dorans_blade');
      return;
    }
    startTutorialFromStage(resolveTutorialStageForScene(scene));
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
    const profile = getActiveProfile();

    if (shouldStartFirstTimeTutorial(profile)) {
      markTutorialIntroSeen(profile.id, true);
      if (startCustomTutorialRun('dorans_blade')) {
        return;
      }
    }

    setTutorialStage('none');
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

  const startCustomTutorialRun = (startingItemId: string) => {
    const tutorialEncounterQueue = CUSTOM_TUTORIAL_RUN_CONFIG.encounterEnemyIds
      .map((encounterEnemyIds) => encounterEnemyIds
        .map((enemyId) => getEnemyById(enemyId))
        .filter((enemy): enemy is typeof enemy & {} => enemy !== undefined)
      )
      .filter((encounter) => encounter.length > 0);

    if (tutorialEncounterQueue.length === 0) {
      return false;
    }

    selectRegion(CUSTOM_TUTORIAL_RUN_CONFIG.region);
    selectStartingItem(startingItemId);
    visitRegion(CUSTOM_TUTORIAL_RUN_CONFIG.region);

    useGameStore.setState((prev) => ({
      state: {
        ...prev.state,
        inventory: [{ itemId: startingItemId, quantity: 1 }],
        spells: ['for_demacia', 'rejuvenation', 'purify'],
        weapons: ['demacian_steel_blade', 'spirit_tree_bow'],
      },
    }));

    setIsCustomTutorialRunActive(true);
    setTutorialFightIntroStep(0);
    setTutorialFightStep('spell');
    setTutorialSecondFightStep(null);
    setTutorialSecondFightPrepared(false);
    setTutorialThirdFightStep(null);
    setTutorialThirdFightPrepared(false);
    setTutorialRewardBriefingDone(false);
    setTutorialStage('battle');
    setSceneTutorialStep(0);
    startBattle(tutorialEncounterQueue);
    setScene('battle');
    return true;
  };

  const handlePreGameSetup = (region: string, itemId: string) => {
    const customTutorialStart = shouldStartCustomTutorialRun(tutorialStage);

    if (customTutorialStart && startCustomTutorialRun(itemId)) {
      return;
    }

    const startingRegion = customTutorialStart ? CUSTOM_TUTORIAL_RUN_CONFIG.region : (region as Region);

    selectRegion(startingRegion);
    selectStartingItem(itemId);
    // Track that we've visited this region for unlock progress
    visitRegion(startingRegion);

    // Normal run: add starting consumables
    addInventoryItem({ itemId: 'health_potion', quantity: 3 });
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

  const isCustomTutorialFirstFight = isCustomTutorialRunActive && scene === 'battle' && state.currentFloor <= 1;
  const isCustomTutorialSecondFight = isCustomTutorialRunActive && scene === 'battle' && state.currentFloor === 2;
  const isCustomTutorialThirdFight = isCustomTutorialRunActive && scene === 'battle' && state.currentFloor === 3;
  const isCustomTutorialRewardBriefingPending = isCustomTutorialRunActive && scene === 'battle' && state.currentFloor === 1 && !tutorialRewardBriefingDone;

  const tutorialCheckpointItems = useMemo<TutorialCheckpointItem[]>(() => {
    if (tutorialStage === 'none') return [];

    if (tutorialStage === 'battleElite') {
      return [{ id: 'elite-intro', label: 'Elite encounter intro', status: 'current' }];
    }

    if (tutorialStage === 'eliteReward') {
      return [{ id: 'elite-reward', label: 'Elite reward tutorial', status: 'current' }];
    }

    if (tutorialStage === 'regionTravel') {
      return [{ id: 'region-travel', label: 'Region travel tutorial', status: 'current' }];
    }

    const stageOrder: Array<Exclude<TutorialStage, 'none' | 'battleElite' | 'eliteReward' | 'regionTravel'>> = [
      'pregame',
      'quest',
      'battle',
      'battleLoot',
      'shop',
    ];

    const currentStageIndex = stageOrder.indexOf(tutorialStage as (typeof stageOrder)[number]);

    const getStageStatus = (
      targetStage: (typeof stageOrder)[number],
      targetIndex: number
    ): TutorialCheckpointStatus => {
      if (currentStageIndex > targetIndex) return 'complete';
      if (tutorialStage === targetStage) return 'current';
      return 'pending';
    };

    const battleActionStatus: TutorialCheckpointStatus =
      tutorialStage === 'battleLoot' || tutorialStage === 'shop'
        ? 'complete'
        : tutorialStage === 'battle' && sceneTutorialStep >= 11 && showBattleActionPrompt
          ? 'current'
          : tutorialStage === 'battle' && sceneTutorialStep >= 11
            ? 'complete'
            : 'pending';

    return [
      { id: 'setup', label: 'Setup basics', status: getStageStatus('pregame', 0) },
      { id: 'quest', label: 'Quest screen basics', status: getStageStatus('quest', 1) },
      { id: 'battle', label: 'Battle basics', status: getStageStatus('battle', 2) },
      { id: 'forced-action', label: 'Use a spell or item', status: battleActionStatus },
      {
        id: 'loot',
        label: 'Loot and reward summary',
        status: tutorialStage === 'shop' ? 'complete' : tutorialStage === 'battleLoot' ? 'current' : 'pending',
      },
      { id: 'shop', label: 'Shop basics', status: tutorialStage === 'shop' ? 'current' : 'pending' },
    ];
  }, [tutorialStage, sceneTutorialStep, showBattleActionPrompt]);

  const renderTutorialCheckpointBadge = () => {
    if (tutorialStage === 'none') return null;

    if (isCustomTutorialRunActive || tutorialStage === 'battleLoot') {
      let label: string;
      if (scene === 'battle') {
        if (isCustomTutorialFirstFight && tutorialFightIntroStep !== null) label = 'Listen to Ryze';
        else if (tutorialFightStep === 'spell') label = 'Cast for_demacia 0/1';
        else if (tutorialFightStep === 'attack') label = 'Attack with spirit_tree_bow 0/1';
        else if (tutorialFightStep === 'finish') label = 'Finish the fight';
        else if (isCustomTutorialRewardBriefingPending) label = 'Listen to Ryze: Rewards';
        else if (isCustomTutorialSecondFight && tutorialSecondFightStep === 'potion') label = 'Use health_potion 0/1';
        else if (isCustomTutorialSecondFight && tutorialSecondFightStep === 'inspect') label = 'Hover enemy buff to inspect it';
        else if (isCustomTutorialSecondFight && tutorialSecondFightStep === 'move') label = 'Move closer to the enemy';
        else if (isCustomTutorialSecondFight && tutorialSecondFightStep === 'melee') label = 'Melee attack with demacian_steel_blade 0/1';
        else if (isCustomTutorialThirdFight && tutorialThirdFightStep === null) label = 'Inspect Teemo: Guerilla Warfare + Blowgun + Blinding Dart';
        else if (isCustomTutorialThirdFight && tutorialThirdFightStep === 'inspect-first') label = 'Inspect Teemo: Guerilla Warfare + Blowgun + Blinding Dart';
        else if (isCustomTutorialThirdFight && tutorialThirdFightStep === 'ward') label = 'Use stealth_ward 0/1';
        else if (isCustomTutorialThirdFight && tutorialThirdFightStep === 'inspect-reveal') label = 'Inspect again to verify reveal';
        else if (isCustomTutorialThirdFight && tutorialThirdFightStep === 'purify') label = 'Use Purify to cleanse Poison';
        else label = 'Finish the fight';
      } else if (tutorialStage === 'battleLoot') {
        label = 'Review your loot';
      } else if (tutorialStage === 'shop') {
        label = 'Visit the shop';
      } else {
        label = 'Continue';
      }
      return (
        <span className="tutorial-checkpoint-badge" title="Tutorial task">
          🎓 {label}
        </span>
      );
    }

    if (tutorialCheckpointItems.length === 0) return null;
    const current = tutorialCheckpointItems.find((c) => c.status === 'current') ?? tutorialCheckpointItems[0];
    const doneCount = tutorialCheckpointItems.filter((c) => c.status === 'complete').length;
    const total = tutorialCheckpointItems.length;
    return (
      <span className="tutorial-checkpoint-badge" title={`Tutorial progress: ${doneCount}/${total} steps done`}>
        🎓 {current.label}
      </span>
    );
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

    if (scene === 'battle' && tutorialStage === 'eliteReward') {
      return [t.tutorial.battle.eliteReward];
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

    if (scene === 'battle' && tutorialStage === 'eliteReward') {
      setShowEliteRewardPrompt(true);
      return;
    }

    if (sceneTutorialStep >= steps.length - 1) {
      if (tutorialStage === 'battle') {
        setTutorialStage('shop');
      } else if (tutorialStage === 'battleElite') {
        markEliteTutorialSeen(getActiveProfile().id, true);
        setTutorialStage('none');
      } else if (tutorialStage === 'shop') {
        markTutorialCompleted(getActiveProfile().id, true);
        setTutorialStage('none');
      }
      setSceneTutorialStep(0);
      return;
    }

    setSceneTutorialStep(prev => prev + 1);
  };

  const handleBattleTutorialActionUsed = (action: TutorialBattleAction) => {
    if (scene !== 'battle') return;

    if (isCustomTutorialRunActive) {
      const resolvedSpellId = action.spellId ?? state.spells[state.equippedSpellIndex];

      // Be resilient to stale intro state: if the required first cast happened, advance anyway.
      if (isCustomTutorialFirstFight && tutorialFightStep === 'spell' && action.type === 'spell' && resolvedSpellId === 'for_demacia') {
        if (tutorialFightIntroStep !== null) {
          setTutorialFightIntroStep(null);
        }
        setTutorialFightStep('attack');
        return;
      }

      if (tutorialFightIntroStep !== null) return;

      if (isCustomTutorialFirstFight && tutorialFightStep === 'attack' && action.type === 'attack' && action.weaponId === 'spirit_tree_bow') {
        setTutorialFightStep('finish');
      } else if (isCustomTutorialSecondFight && tutorialSecondFightStep === 'potion') {
        if (action.type === 'item' && action.itemId === 'health_potion') {
          setTutorialSecondFightStep('inspect');
        }
      } else if (isCustomTutorialSecondFight && tutorialSecondFightStep === 'inspect' && action.type === 'inspect') {
        const isEnemyTarget = Boolean(action.targetId && action.targetId !== 'player-main' && !action.targetId.startsWith('familiar-'));
        // Accept enemy inspect interactions from either buff hover or opening inspect panel.
        if (isEnemyTarget) {
          setTutorialSecondFightStep('move');
        }
      } else if (isCustomTutorialSecondFight && tutorialSecondFightStep === 'move' && action.type === 'move') {
        setTutorialSecondFightStep('melee');
      } else if (
        isCustomTutorialSecondFight &&
        tutorialSecondFightStep === 'melee' &&
        action.type === 'attack' &&
        action.weaponId === 'demacian_steel_blade'
      ) {
        setTutorialSecondFightStep('finish');
      } else if (isCustomTutorialThirdFight && tutorialThirdFightStep === 'inspect-first' && action.type === 'inspect') {
        const isEnemyTarget = Boolean(action.targetId && action.targetId !== 'player-main' && !action.targetId.startsWith('familiar-'));
        if (isEnemyTarget) {
          setTutorialThirdFightStep('ward');
        }
      } else if (isCustomTutorialThirdFight && tutorialThirdFightStep === 'ward' && action.type === 'item' && action.itemId === 'stealth_ward') {
        setTutorialThirdFightStep('inspect-reveal');
      } else if (isCustomTutorialThirdFight && tutorialThirdFightStep === 'inspect-reveal' && action.type === 'inspect') {
        const isEnemyTarget = Boolean(action.targetId && action.targetId !== 'player-main' && !action.targetId.startsWith('familiar-'));
        if (isEnemyTarget) {
          setTutorialThirdFightStep('purify');
        }
      } else if (isCustomTutorialThirdFight && tutorialThirdFightStep === 'purify' && action.type === 'spell' && resolvedSpellId === 'purify') {
        setTutorialThirdFightStep('finish');
      }
      return;
    }

    if (tutorialStage !== 'battle') return;
    if (sceneTutorialStep >= 11) {
      setShowBattleActionPrompt(false);
      setTutorialStage('battleLoot');
      setSceneTutorialStep(0);
    }
  };

  const handleBattleLootTutorialComplete = () => {
    if (isCustomTutorialRunActive && state.currentFloor === 1 && !tutorialRewardBriefingDone) {
      setTutorialRewardBriefingDone(true);
      setTutorialSecondFightStep('potion');
      setTutorialSecondFightPrepared(false);
      return;
    }

    if (isCustomTutorialRunActive && state.currentFloor === 2) {
      setTutorialThirdFightStep('inspect-first');
      setTutorialThirdFightPrepared(false);
      return;
    }

    if (tutorialStage === 'battleLoot') {
      setTutorialStage('shop');
    }
  };

  const handleEliteRewardTutorialTrigger = () => {
    if (scene !== 'battle') return;
    if (tutorialStage !== 'none') return;
    if (hasSeenEliteRewardTutorial(getActiveProfile().id)) return;

    setTutorialStage('eliteReward');
    setSceneTutorialStep(0);
  };

  const handleEliteRewardTutorialComplete = () => {
    setShowEliteRewardPrompt(false);

    if (tutorialStage === 'eliteReward') {
      markEliteRewardTutorialSeen(getActiveProfile().id, true);
      setTutorialStage('none');
      setSceneTutorialStep(0);
    }
  };

  const handleRegionTravelTutorialComplete = () => {
    if (tutorialStage === 'regionTravel') {
      markRegionTravelTutorialSeen(getActiveProfile().id, true);
      setTutorialStage('none');
      setSceneTutorialStep(0);
    }
  };

  useEffect(() => {
    if ((scene === 'battle' && tutorialStage === 'battle') || (scene === 'shop' && tutorialStage === 'shop')) {
      setSceneTutorialStep(0);
    }
  }, [scene, tutorialStage]);

  useEffect(() => {
    if (!isCustomTutorialFirstFight) {
      setTutorialFightIntroStep(null);
      if (tutorialFightStep === 'finish') {
        setTutorialFightStep(null);
      }
    }
  }, [isCustomTutorialFirstFight, tutorialFightStep]);

  useEffect(() => {
    if (!isCustomTutorialSecondFight) return;
    if (tutorialSecondFightPrepared) return;

    useGameStore.setState((prev) => {
      const maxHealth = Math.max(1, Math.round(prev.state.playerCharacter.stats.health));
      const targetHp = Math.max(1, Math.floor(maxHealth * 0.5));
      return {
        state: {
          ...prev.state,
          inventory: [{ itemId: 'health_potion', quantity: 2 }],
          spellCooldowns: {},
          playerCharacter: {
            ...prev.state.playerCharacter,
            hp: targetHp,
          },
        },
      };
    });

    setTutorialSecondFightPrepared(true);
  }, [isCustomTutorialSecondFight, tutorialSecondFightPrepared]);

  useEffect(() => {
    if (!isCustomTutorialThirdFight) return;
    if (tutorialThirdFightPrepared) return;

    useGameStore.setState((prev) => {
      const maxHealth = Math.max(1, Math.round(prev.state.playerCharacter.stats.health));
      return {
        state: {
          ...prev.state,
          inventory: [
            { itemId: 'health_potion', quantity: 3 },
            { itemId: 'stealth_ward', quantity: 1 },
            { itemId: 'oracle_lens', quantity: 1 },
          ],
          spellCooldowns: {},
          playerCharacter: {
            ...prev.state.playerCharacter,
            hp: maxHealth,
          },
          enemyCharacters: prev.state.enemyCharacters.map((enemy) => ({
            ...enemy,
            inventory: [],
            enemyLoadout: enemy.enemyLoadout
              ? {
                  ...enemy.enemyLoadout,
                  items: [],
                }
              : enemy.enemyLoadout,
          })),
        },
      };
    });

    setTutorialThirdFightPrepared(true);
  }, [isCustomTutorialThirdFight, tutorialThirdFightPrepared]);

  useEffect(() => {
    if (!isCustomTutorialThirdFight) return;
    if (tutorialThirdFightStep !== null) return;
    setTutorialThirdFightStep('inspect-first');
  }, [isCustomTutorialThirdFight, tutorialThirdFightStep]);

  useEffect(() => {
    if (scene !== 'battle' || tutorialStage !== 'battle') {
      setShowBattleActionPrompt(false);
    }

    if (scene !== 'battle' || tutorialStage !== 'eliteReward') {
      setShowEliteRewardPrompt(false);
    }
  }, [scene, tutorialStage]);

  useEffect(() => {
    if (scene !== 'battle') return;
    if (tutorialStage !== 'none') return;
    if (state.currentFloor !== 5) return;
    if (hasSeenEliteTutorial(getActiveProfile().id)) return;

    setTutorialStage('battleElite');
    setSceneTutorialStep(0);
  }, [scene, tutorialStage, state.currentFloor]);

  useEffect(() => {
    if (scene !== 'regionSelection') return;
    if (tutorialStage !== 'none') return;
    if (!state.completedRegion) return;
    if (hasSeenRegionTravelTutorial(getActiveProfile().id)) return;

    setTutorialStage('regionTravel');
    setSceneTutorialStep(0);
  }, [scene, tutorialStage, state.completedRegion]);

  const renderSceneTutorialOverlay = () => {
    if (isCustomTutorialFirstFight && tutorialFightIntroStep !== null) {
      const introText =
        tutorialFightIntroStep === 0
          ? 'Ryze: This side is your team. You can see your health, your stats, and what abilities are ready.'
          : tutorialFightIntroStep === 1
            ? 'Ryze: And this is the enemy you have encountered. Watch their health — reduce it to zero to win.'
            : 'Ryze: This timeline shows whose turn it is. When it\'s your turn, you can attack or cast a spell. Then the enemy gets their turn. Repeat until one side falls.';

      return (
        <>
          <div className="scene-tutorial-overlay" />
          <div className="scene-tutorial-dialogue-box">
            <button className="scene-tutorial-skip-top-btn" onClick={handleTutorialSkipAnytime}>
              {t.tutorial.skip}
            </button>
            <div className="scene-tutorial-character">🧙</div>
            <div className="scene-tutorial-content">
              <p className="scene-tutorial-speaker-name">Ryze</p>
              <p className="scene-tutorial-text">{introText}</p>
              <div className="scene-tutorial-actions">
                <button
                  className="scene-tutorial-action-btn"
                  onClick={() => setTutorialFightIntroStep((prev) => (prev === 0 ? 1 : prev === 1 ? 2 : null))}
                >
                  {tutorialFightIntroStep === 2 ? t.common.confirm : t.common.continue}
                </button>
              </div>
            </div>
          </div>
        </>
      );
    }

    // Keep custom run narration handled by objective-based tutorial, not generic step-through.
    if (isCustomTutorialRunActive) return null;

    const steps = getSceneTutorialSteps();
    if (steps.length === 0) return null;

    if (scene === 'battle' && tutorialStage === 'battle' && sceneTutorialStep === 11 && showBattleActionPrompt) {
      return null;
    }

    if (scene === 'battle' && tutorialStage === 'eliteReward' && showEliteRewardPrompt) {
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
    player: Character,
    enemies: Character[],
    playerItems: Array<{ itemId: string; quantity: number }>,
    playerUseItems: Array<{ itemId: string; quantity: number }>,
    playerWeapons: string[],
    playerSpells: string[],
    playerFamiliars: string[]
  ) => {
    // Create inventory items from selected items (with quantities)
    const inventoryItems = [...playerItems];
    
    // Add use-items to inventory
    inventoryItems.push(...playerUseItems);

    // Build familiarStates for each familiar
    const familiarStates: Record<string, { currentHp: number }> = {};
    playerFamiliars.forEach((id) => {
      familiarStates[id] = initializeFamiliarState(id);
    });
    
    // Update store with test characters, inventory, weapons, spells and familiars
    useGameStore.setState((prev) => ({
      state: {
        ...prev.state,
        playerCharacter: player,
        enemyCharacters: enemies,
        currentFloor: 1,
        inventory: inventoryItems,
        weapons: playerWeapons,
        spells: playerSpells,
        familiars: playerFamiliars,
        familiarStates,
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
    
    // Load encounter queue for this path.
    // Each entry is one encounter by default, while explicit arrays create multi-enemy fights.
    const encounterQueue = normalizeEncounterEnemyIds(path.enemyIds)
      .map((encounterIds) => encounterIds
        .map((id) => resolveEnemyIdByRegion(id, quest.region))
        .map((id) => getEnemyById(id))
        .filter((enemy): enemy is typeof enemy & {} => enemy !== undefined)
      )
      .filter((encounter) => encounter.length > 0);

    if (encounterQueue.length === 0) {
      return;
    }

    startBattle(encounterQueue);
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
    if (isCustomTutorialRunActive) {
      setIsCustomTutorialRunActive(false);
      setTutorialStage('shop');
      setSceneTutorialStep(0);
      setScene('shop');
      return;
    }

    if (!state.selectedRegion) return;

    if (getRegionTier(state.selectedRegion) === 'hard') {
      markHardRegionCompleted(state.selectedRegion);
    }
    
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

    const allowedDestinations = getAvailableDestinations(
      currentState.selectedRegion,
      currentState.visitedRegionsThisRun
    );
    if (!allowedDestinations.includes(newRegion)) {
      return;
    }
    
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
        {tutorialStage !== 'none' && (
          <div className="tutorial-checkpoint-badge-fixed">
            {renderTutorialCheckpointBadge()}
          </div>
        )}
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
            <div className="artifact-header-button-wrap">
              <button
                className="btn-artifacts"
                title="Active artifacts"
                type="button"
              >
                ◈ {activeArtifactDetails.length}
              </button>
              {activeArtifactDetails.length > 0 && (
                <div className="artifact-header-tooltip" role="tooltip">
                  <p className="artifact-tooltip-title">Active Modificators</p>
                  {activeArtifactDetails.map((artifact) => (
                    <div key={artifact.id} className="artifact-tooltip-entry">
                      <div className="artifact-tooltip-name">{artifact.name}</div>
                      <div className="artifact-tooltip-effect">{artifact.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {renderTutorialCheckpointBadge()}
            <button className={`btn-settings btn-tutorial-toggle ${tutorialStage !== 'none' ? 'active' : ''}`} onClick={handleReenableTutorial} title={t.tutorial.reenable}>
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
              <div
                className="entity-inspect-trigger"
                role="button"
                tabIndex={0}
                onClick={() => openAppInspect('player-main')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openAppInspect('player-main');
                  }
                }}
              >
                <CharacterStatus />
              </div>
              {activeFamiliarIds.length > 0 && (
                <div className="quest-character-familiars">
                  <div className="quest-character-familiars-title">Active Familiars</div>
                  <div className="quest-character-familiars-list">
                    {activeFamiliarIds.map((familiarId) => (
                      <div
                        key={familiarId}
                        className="entity-inspect-trigger"
                        role="button"
                        tabIndex={0}
                        onClick={() => openAppInspect(`familiar-${familiarId}`)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openAppInspect(`familiar-${familiarId}`);
                          }
                        }}
                      >
                        <FamiliarStatus familiarId={familiarId} compact />
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

        <EntityInspectPanel
          isOpen={appInspectOpen}
          targets={appInspectTargets}
          activeTargetId={appInspectTargetId}
          onSelectTarget={setAppInspectTargetId}
          onClose={() => setAppInspectOpen(false)}
        />
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
            {renderTutorialCheckpointBadge()}
            <button className={`btn-settings btn-tutorial-toggle ${tutorialStage !== 'none' ? 'active' : ''}`} onClick={handleReenableTutorial} title={t.tutorial.reenable}>
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

    const battleTutorialFocus = !isCustomTutorialRunActive && tutorialStage === 'battle' && scene === 'battle'
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

    const tutorialBattleGate: 'locked' | 'spell-only' | 'attack-only' | 'inspect-only' | 'item-only' | 'move-only' | 'heal-only' | 'finish-no-move-item' | null =
      isCustomTutorialRunActive && scene === 'battle'
        ? isCustomTutorialFirstFight && tutorialFightIntroStep !== null
          ? 'locked'
          : tutorialFightStep === 'spell'
            ? 'spell-only'
            : tutorialFightStep === 'attack'
              ? 'attack-only'
              : tutorialFightStep === 'finish'
                ? 'finish-no-move-item'
                : null
        : null;

    const tutorialLaneHighlight: 'player-lane' | 'enemy-lane' | 'timeline' | null =
      isCustomTutorialFirstFight && tutorialFightIntroStep !== null
        ? tutorialFightIntroStep === 0
          ? 'player-lane'
          : tutorialFightIntroStep === 1
            ? 'enemy-lane'
            : 'timeline'
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
            {renderTutorialCheckpointBadge()}
            <button className={`btn-settings btn-tutorial-toggle ${tutorialStage !== 'none' ? 'active' : ''}`} onClick={handleReenableTutorial} title={t.tutorial.reenable}>
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
          tutorialGate={tutorialBattleGate}
          tutorialLaneHighlight={tutorialLaneHighlight}
          playerStartPosition={isCustomTutorialSecondFight ? 90 : undefined}
          enemyStartPosition={isCustomTutorialFirstFight || isCustomTutorialSecondFight ? -90 : undefined}
          eliteRewardTutorialEnabled={tutorialStage === 'eliteReward'}
          onEliteRewardTutorialTrigger={handleEliteRewardTutorialTrigger}
          onEliteRewardTutorialComplete={handleEliteRewardTutorialComplete}
          onTutorialActionUsed={handleBattleTutorialActionUsed}
          tutorialSecondFightStep={isCustomTutorialSecondFight ? tutorialSecondFightStep : null}
          tutorialThirdFightStep={isCustomTutorialThirdFight ? tutorialThirdFightStep : null}
          lootTutorialEnabled={tutorialStage === 'battleLoot' || isCustomTutorialRewardBriefingPending}
          lootTutorialTextOverride={isCustomTutorialRewardBriefingPending ? 'Ryze: Rewards are your power spikes. Pick what helps the next fight most, then we continue.' : undefined}
          onLootTutorialComplete={handleBattleLootTutorialComplete}
          disableEnemyFlee={isCustomTutorialRunActive}
          tutorialRewardItems={undefined}
          forcedLootItem={
            isCustomTutorialRunActive && state.currentFloor === 1
              ? { itemId: 'glowing_mote', quantity: 1 }
              : isCustomTutorialRunActive && state.currentFloor === 2
              ? { itemId: 'heartbound_axe', quantity: 1 }
              : isCustomTutorialRunActive && state.currentFloor === 3
              ? null
              : undefined
          }
        />

        {renderSceneTutorialOverlay()}

        {isBattleActionPromptActive && (
          <div className="sad-skip-toast">{t.tutorial.battle.useSpellOrItem}</div>
        )}

        {scene === 'battle' && tutorialStage === 'eliteReward' && showEliteRewardPrompt && (
          <div className="sad-skip-toast">{t.tutorial.battle.eliteRewardPrompt}</div>
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
            {renderTutorialCheckpointBadge()}
            <button className={`btn-settings btn-tutorial-toggle ${tutorialStage !== 'none' ? 'active' : ''}`} onClick={handleReenableTutorial} title={t.tutorial.reenable}>
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
        <RegionSelection
          onSelectRegion={handleSelectRegion}
          tutorialEnabled={tutorialStage === 'regionTravel'}
          onTutorialComplete={handleRegionTravelTutorialComplete}
          onTutorialSkip={handleTutorialSkipAnytime}
        />
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
          <div
            className="entity-inspect-trigger"
            role="button"
            tabIndex={0}
            onClick={() => openAppInspect('player-main')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openAppInspect('player-main');
              }
            }}
          >
            <CharacterStatus />
          </div>
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
      
      {/* Settings Modal */}
      <SettingsScreen />

      <EntityInspectPanel
        isOpen={appInspectOpen}
        targets={appInspectTargets}
        activeTargetId={appInspectTargetId}
        onSelectTarget={setAppInspectTargetId}
        onClose={() => setAppInspectOpen(false)}
      />
    </div>
  );
};

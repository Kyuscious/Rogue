import React, { useState, useMemo } from 'react';
import { flattenEncounterEnemyIds, getQuestsByRegion, isPathCompleted, Quest, QuestPath } from './logic';
import { Region } from '@game/types';
import { useGameStore } from '@game/store';
import { useTranslation } from '../../../hooks/useTranslation';
import { GearChange } from './GearChange';
import { LootPreviewModal } from '../../shared/LootPreviewModal';
import { calculateQuestLoot, QuestLootInfo } from '@utils/lootCalculator';
import { getPathVisualDifficulty } from '@data/rewardPool';
import './QuestSelect.css';

interface QuestSelectProps {
  region: Region;
  onSelectPath: (questId: string, pathId: string) => void;
  tutorialEnabled?: boolean;
  onTutorialComplete?: () => void;
  onTutorialSkip?: () => void;
  onTutorialFocusChange?: (focus: 'header' | 'path' | 'mechanics' | 'stats' | null) => void;
}

export const QuestSelect: React.FC<QuestSelectProps> = ({
  region,
  onSelectPath,
  tutorialEnabled = false,
  onTutorialComplete,
  onTutorialSkip,
  onTutorialFocusChange,
}) => {
  const { state, useReroll } = useGameStore();
  const t = useTranslation();
  const [tutorialStepIndex, setTutorialStepIndex] = useState(tutorialEnabled ? 0 : -1);

  const tutorialSteps = [
    t.tutorial.questSelect.header,
    t.tutorial.questSelect.stats,
    t.tutorial.questSelect.mechanics,
    t.tutorial.questSelect.path,
  ];

  const isTutorialActive = tutorialEnabled && tutorialStepIndex >= 0 && tutorialStepIndex < tutorialSteps.length;
  const isHeaderStep = isTutorialActive && tutorialStepIndex === 0;
  const isStatsStep = isTutorialActive && tutorialStepIndex === 1;
  const isMechanicsStep = isTutorialActive && tutorialStepIndex === 2;
  const isPathStep = isTutorialActive && tutorialStepIndex === 3;
  
  // Get all available quests for this region
  const allQuests = useMemo(() => getQuestsByRegion(region), [region]);

  React.useEffect(() => {
    if (tutorialEnabled) {
      setTutorialStepIndex(0);
      return;
    }
    setTutorialStepIndex(-1);
  }, [tutorialEnabled]);

  React.useEffect(() => {
    if (!isTutorialActive) {
      onTutorialFocusChange?.(null);
      return;
    }

    if (isHeaderStep) {
      onTutorialFocusChange?.('header');
      return;
    }

    if (isPathStep) {
      onTutorialFocusChange?.('path');
      return;
    }

    if (isMechanicsStep) {
      onTutorialFocusChange?.('mechanics');
      return;
    }

    if (isStatsStep) {
      onTutorialFocusChange?.('stats');
      return;
    }

    onTutorialFocusChange?.(null);
  }, [isTutorialActive, isHeaderStep, isPathStep, isMechanicsStep, isStatsStep, onTutorialFocusChange]);
  
  // Filter out paths that have already been completed
  const availableQuests = useMemo(() => {
    return allQuests.map(quest => ({
      ...quest,
      paths: quest.paths.filter(path => !isPathCompleted(state.completedQuestPaths, quest.id, path.id)),
    })).filter(quest => quest.paths.length > 0);
  }, [allQuests, state.completedQuestPaths]);
  
  // Initialize with 3 random quests from the available pool
  const [displayedQuests, setDisplayedQuests] = useState<Quest[]>(() => {
    const shuffled = [...availableQuests].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  });

  // Loot preview modal state
  const [lootPreviewOpen, setLootPreviewOpen] = useState(false);
  const [selectedLootInfo, setSelectedLootInfo] = useState<QuestLootInfo | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');

  const handleReroll = (questIndex: number) => {
    if (isTutorialActive) return;

    // Check if we have rerolls
    if (state.rerolls <= 0) return;
    
    // Use a reroll from the store
    const success = useReroll();
    if (!success) return;
    
    // Get IDs of currently displayed quests
    const displayedIds = displayedQuests.map(q => q.id);
    
    // Find quests that aren't currently displayed (from available quests)
    const alternativeQuests = availableQuests.filter(q => !displayedIds.includes(q.id));
    
    // If no alternatives available, don't reroll
    if (alternativeQuests.length === 0) return;
    
    // Pick a random alternative
    const newQuest = alternativeQuests[Math.floor(Math.random() * alternativeQuests.length)];
    
    // Replace the quest at the specified index
    const newDisplayedQuests = [...displayedQuests];
    newDisplayedQuests[questIndex] = newQuest;
    setDisplayedQuests(newDisplayedQuests);
  };

  const getPathContext = (path: QuestPath) => ({
    difficulty: path.difficulty,
    lootType: path.lootType,
    pathName: path.name,
    pathDescription: path.description,
  });

  const renderRewardIcon = (lootType: string) => {
    const iconMap: Record<string, string> = {
      damage: '⚔️',
      attackDamage: '⚔️',
      defense: '🛡️',
      tankDefense: '🛡️',
      mixed: '⚗️',
      hybrid: '⚗️',
      abilityPower: '✨',
      mobility: '💨',
      utility: '🎯',
      critical: '💥',
    };
    return iconMap[lootType] || '❔';
  };

  const handleShowLootPreview = (path: QuestPath, pathName: string, e: React.MouseEvent) => {
    if (isTutorialActive) return;

    e.stopPropagation(); // Prevent path selection
    const playerMagicFind = state.playerCharacter?.stats.magicFind || 0;
    const lootInfo = calculateQuestLoot(flattenEncounterEnemyIds(path.enemyIds), region, playerMagicFind, getPathContext(path));
    setSelectedLootInfo(lootInfo);
    setPreviewTitle(`${pathName} Loot Pool`);
    setLootPreviewOpen(true);
  };

  const handleTutorialNext = () => {
    if (!isTutorialActive) return;

    if (tutorialStepIndex >= tutorialSteps.length - 1) {
      setTutorialStepIndex(-1);
      onTutorialComplete?.();
      return;
    }

    setTutorialStepIndex(prev => prev + 1);
  };

  return (
    <div className={`quest-select ${isTutorialActive ? 'quest-tutorial-active' : ''}`}>
      {isTutorialActive && <div className="quest-tutorial-overlay" />}

      {/* Left: Gear Management */}
      <div className={`inventory-panel ${isTutorialActive ? (isMechanicsStep ? 'quest-tutorial-highlight' : 'quest-tutorial-muted') : ''}`}>
        <GearChange />
      </div>

      {/* Right: Quests */}
      <div className={`quests-container ${isTutorialActive ? (isPathStep ? 'quest-tutorial-highlight' : 'quest-tutorial-muted') : ''}`}>
        {displayedQuests.map((quest: Quest, index: number) => (
          <div key={quest.id} className="quest-card">
            <div className="quest-title-row">
              <div className="quest-title">
                <h3>{quest.name}</h3>
              </div>
              <button
                className="reroll-quest-button"
                onClick={() => handleReroll(index)}
                disabled={state.rerolls <= 0 || availableQuests.length <= 3}
                title={
                  state.rerolls <= 0
                    ? t.questSelect.noRerollsRemaining
                    : availableQuests.length <= 3
                    ? t.questSelect.noAlternativePaths
                    : `${t.questSelect.rerollThisPath} (${state.rerolls} ${t.questSelect.rerollsLeft})`
                }
              >
                🔄
              </button>
            </div>

            <div className="quest-paths">
              {quest.paths.map((path: QuestPath) => (
                <button
                  key={path.id}
                  className={`quest-path ${getPathVisualDifficulty(getPathContext(path))}`}
                  onClick={() => {
                    if (isTutorialActive && !isPathStep) return;
                    if (isTutorialActive && isPathStep) {
                      setTutorialStepIndex(-1);
                      onTutorialComplete?.();
                    }
                    onSelectPath(quest.id, path.id);
                  }}
                >
                  <div className="path-content">
                    <div className="path-info">
                      <span className="path-name">{path.name}</span>
                      <p className="path-description">{path.description}</p>
                    </div>
                    <div className="path-icons">
                      <span
                        className={`path-trait-icon ${getPathVisualDifficulty(getPathContext(path))}`}
                        title={`${path.lootType} loot`}
                        aria-label={`${path.lootType} loot`}
                      >
                        {renderRewardIcon(path.lootType)}
                      </span>
                      <button 
                        className="loot-preview-btn" 
                        title="Preview possible loot"
                        onClick={(e) => handleShowLootPreview(path, path.name, e)}
                      >
                        👁️
                      </button>
                      <div className="boss-icon">
                        {path.finalBossId ? '👑' : '?'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Loot Preview Modal */}
      <LootPreviewModal 
        isOpen={lootPreviewOpen}
        onClose={() => setLootPreviewOpen(false)}
        lootInfo={selectedLootInfo}
        title={previewTitle}
      />

      {isTutorialActive && (
        <div className="quest-tutorial-dialogue-box">
          <button className="quest-tutorial-skip-top-btn" onClick={onTutorialSkip}>
            {t.tutorial.skip}
          </button>
          <div className="quest-tutorial-character">🧭</div>
          <div className="quest-tutorial-content">
            <p className="quest-tutorial-speaker-name">{t.tutorial.npcName}</p>
            <p className="quest-tutorial-text">{tutorialSteps[tutorialStepIndex]}</p>
            <div className="quest-tutorial-actions">
              {!isPathStep && (
                <button className="quest-tutorial-action-btn" onClick={handleTutorialNext}>
                  {t.common.continue}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

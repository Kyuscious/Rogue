import React, { useState, useMemo } from 'react';
import { getQuestsByRegion, Quest, QuestPath } from '../../../game/questDatabase';
import { Region } from '../../../game/types';
import { useGameStore } from '../../../game/store';
import { useTranslation } from '../../../hooks/useTranslation';
import { isPathCompleted } from '../../../game/questPathSystem';
import { GearChange } from './GearChange';
import './QuestSelect.css';

interface QuestSelectProps {
  region: Region;
  onSelectPath: (questId: string, pathId: string) => void;
}

export const QuestSelect: React.FC<QuestSelectProps> = ({ region, onSelectPath }) => {
  const { state, useReroll } = useGameStore();
  const t = useTranslation();
  
  // Get all available quests for this region
  const allQuests = useMemo(() => getQuestsByRegion(region), [region]);
  
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

  const handleReroll = (questIndex: number) => {
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

  const renderDifficultyBadge = (difficulty: 'safe' | 'risky') => {
    if (difficulty === 'risky') {
      return <span className="difficulty-badge risky">{t.questSelect.risky}</span>;
    }
    return <span className="difficulty-badge safe">{t.questSelect.safe}</span>;
  };

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
    return iconMap[lootType] || '?';
  };

  return (
    <div className="quest-select">
      {/* Left: Gear Management */}
      <div className="inventory-panel">
        <GearChange />
      </div>

      {/* Right: Quests */}
      <div className="quests-container">
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
                  className={`quest-path ${path.difficulty}`}
                  onClick={() => onSelectPath(quest.id, path.id)}
                >
                  <div className="path-content">
                    <div className="path-info">
                      <span className="path-name">{path.name}</span>
                      <p className="path-description">{path.description}</p>
                    </div>
                    <div className="path-icons">
                      {renderDifficultyBadge(path.difficulty)}
                      <span className="reward-icon" title={`${t.questSelect.reward}: ${path.lootType}`}>{renderRewardIcon(path.lootType)}</span>
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
    </div>
  );
};

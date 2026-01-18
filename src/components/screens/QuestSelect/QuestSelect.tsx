import React, { useState, useMemo } from 'react';
import { getQuestsByRegion, Quest, QuestPath } from '../../../game/questDatabase';
import { Region } from '../../../game/types';
import { useGameStore } from '../../../game/store';
import './QuestSelect.css';

interface QuestSelectProps {
  region: Region;
  onSelectPath: (questId: string, pathId: string) => void;
}

export const QuestSelect: React.FC<QuestSelectProps> = ({ region, onSelectPath }) => {
  const { state, useReroll } = useGameStore();
  
  // Get all available quests for this region
  const allQuests = useMemo(() => getQuestsByRegion(region), [region]);
  
  // Initialize with 3 random quests from the available pool
  const [displayedQuests, setDisplayedQuests] = useState<Quest[]>(() => {
    const shuffled = [...allQuests].sort(() => Math.random() - 0.5);
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
    
    // Find quests that aren't currently displayed
    const availableQuests = allQuests.filter(q => !displayedIds.includes(q.id));
    
    // If no alternatives available, don't reroll
    if (availableQuests.length === 0) return;
    
    // Pick a random alternative
    const newQuest = availableQuests[Math.floor(Math.random() * availableQuests.length)];
    
    // Replace the quest at the specified index
    const newDisplayedQuests = [...displayedQuests];
    newDisplayedQuests[questIndex] = newQuest;
    setDisplayedQuests(newDisplayedQuests);
  };

  const renderDifficultyBadge = (difficulty: 'safe' | 'risky') => {
    if (difficulty === 'risky') {
      return <span className="difficulty-badge risky">⚠️ RISKY</span>;
    }
    return <span className="difficulty-badge safe">✓ SAFE</span>;
  };

  const renderFinalReward = (lootType: string) => {
    const lootLabels: Record<string, string> = {
      damage: 'Atk',
      defense: 'Def',
      mixed: 'Mixed',
    };
    return `Final Reward: ${lootLabels[lootType]}`;
  };

  return (
    <div className="quest-select">
      <div className="quests-container">
        {displayedQuests.map((quest: Quest, index: number) => (
          <div key={quest.id} className="quest-card">
            <div className="quest-title-row">
              <div className="quest-title">
                <h3>{quest.name}</h3>
                <p className="quest-flavor-text">{quest.flavor}</p>
              </div>
              <button
                className="reroll-quest-button"
                onClick={() => handleReroll(index)}
                disabled={state.rerolls <= 0 || allQuests.length <= 3}
                title={
                  state.rerolls <= 0
                    ? 'No rerolls remaining'
                    : allQuests.length <= 3
                    ? 'No alternative paths available'
                    : `Reroll this path (${state.rerolls} rerolls left)`
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
                  <div className="path-header">
                    <div className="header-left">
                      <span className="path-name">{path.name}</span>
                      {renderDifficultyBadge(path.difficulty)}
                    </div>
                    {path.finalBossId && (
                      <div className="boss-preview-small">
                        <div className="boss-image-small">👑</div>
                      </div>
                    )}
                  </div>
                  <p className="path-description">{path.description}</p>
                  
                  <div className={`path-rewards ${path.difficulty}`}>
                    <span className="final-reward">{renderFinalReward(path.lootType)}</span>
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

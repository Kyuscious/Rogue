import React, { useMemo } from 'react';
import { getRandomQuests, Quest, QuestPath } from '../game/questDatabase';
import { Region } from '../game/types';
import './QuestSelect.css';

interface QuestSelectProps {
  region: Region;
  onSelectPath: (questId: string, pathId: string) => void;
}

export const QuestSelect: React.FC<QuestSelectProps> = ({ region, onSelectPath }) => {
  const quests = useMemo(() => getRandomQuests(region, 3), [region]);

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
      <div className="quest-header">
        <h2>Choose Your Path</h2>
        <p className="quest-flavor">Select a questline to begin your adventure...</p>
      </div>

      <div className="quests-container">
        {quests.map((quest: Quest) => (
          <div key={quest.id} className="quest-card">
            <div className="quest-title">
              <h3>{quest.name}</h3>
              <p className="quest-flavor-text">{quest.flavor}</p>
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

      <div className="quest-tips">
        <p>💡 Safe paths offer guaranteed rewards. Risky paths yield greater treasure but tougher foes!</p>
      </div>
    </div>
  );
};

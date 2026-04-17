import React, { useState, useEffect } from 'react';
import { Character } from '../game/types';
import { LootPreviewModal } from './shared/LootPreviewModal';
import { calculateQuestLoot, canReroll, QuestLootInfo } from '../game/lootCalculator';
import { Region } from '../game/types';
import '../styles/LootSelectionScreen.css';

interface LootSelectionScreenProps {
  availableLoot: string[];
  onSelectLoot: (itemId: string) => void;
  character: Character;
  region?: Region | null;
  enemyIds?: string[]; // Enemy IDs from current quest path for loot calculation
  onReroll?: () => void; // Callback to request re-roll from parent
  rerollsRemaining?: number;
  pathLootType?: string;
  pathDifficulty?: 'safe' | 'fair' | 'risky';
  pathName?: string;
}

export const LootSelectionScreen: React.FC<LootSelectionScreenProps> = ({
  availableLoot,
  onSelectLoot,
  character,
  region,
  enemyIds = [],
  onReroll,
  rerollsRemaining = 0,
  pathLootType,
  pathDifficulty,
  pathName,
}) => {
  const [lootPreviewOpen, setLootPreviewOpen] = useState(false);
  const [selectedLootInfo, setSelectedLootInfo] = useState<QuestLootInfo | null>(null);
  const [offeredItems, setOfferedItems] = useState<Set<string>>(new Set(availableLoot));
  const [canRerollMore, setCanRerollMore] = useState(false);

  // Update offered items when availableLoot changes
  useEffect(() => {
    setOfferedItems(prev => new Set([...prev, ...availableLoot]));
  }, [availableLoot]);

  // Check if re-roll is possible
  useEffect(() => {
    if (region && enemyIds.length > 0) {
      const canRerollCheck = canReroll(enemyIds, region, Array.from(offeredItems), 3, {
        lootType: pathLootType,
        difficulty: pathDifficulty,
        pathName,
      });
      setCanRerollMore(canRerollCheck);
    }
  }, [region, enemyIds, offeredItems]);

  const handleShowLootPreview = () => {
    if (!region || enemyIds.length === 0) {
      console.warn('Cannot show loot preview: missing region or enemy IDs');
      return;
    }
    
    const playerMagicFind = character.stats.magicFind || 0;
    const lootInfo = calculateQuestLoot(enemyIds, region, playerMagicFind, {
      lootType: pathLootType,
      difficulty: pathDifficulty,
      pathName,
    });
    setSelectedLootInfo(lootInfo);
    setLootPreviewOpen(true);
  };

  const handleReroll = () => {
    if (onReroll && rerollsRemaining > 0 && canRerollMore) {
      onReroll();
    }
  };

  return (
    <div className="loot-selection-screen">
      <div className="loot-container">
        <h2>Boss Defeated!</h2>
        <p className="loot-flavor">Choose your reward from the fallen foe...</p>
        
        <div className="loot-actions">
          {region && enemyIds.length > 0 && (
            <button 
              className="loot-preview-button"
              onClick={handleShowLootPreview}
              title="View all possible loot and drop rates"
            >
              👁️ View All Possible Loot
            </button>
          )}
          {onReroll && (
            <button 
              className="loot-reroll-button"
              onClick={handleReroll}
              disabled={rerollsRemaining <= 0 || !canRerollMore}
              title={
                rerollsRemaining <= 0 
                  ? 'No rerolls remaining' 
                  : !canRerollMore 
                  ? 'No more unique items available'
                  : `Reroll for different items (${rerollsRemaining} rerolls left)`
              }
            >
              🔄 Reroll ({rerollsRemaining} left)
            </button>
          )}
        </div>
        
        <div className="loot-grid">
          {availableLoot.map((itemId, index) => (
            <div
              key={`${itemId}-${index}`}
              className="loot-item"
              onClick={() => onSelectLoot(itemId)}
            >
              <div className="loot-item-name">{itemId}</div>
              <button className="loot-item-button">Select</button>
            </div>
          ))}
        </div>

        <div className="character-preview">
          <h3>{character.name}</h3>
          <p>HP: {character.hp}/{character.stats.health}</p>
          <p>Gold: {character.gold || 0}</p>
        </div>
      </div>

      {/* Loot Preview Modal */}
      <LootPreviewModal 
        isOpen={lootPreviewOpen}
        onClose={() => setLootPreviewOpen(false)}
        lootInfo={selectedLootInfo}
        title="All Possible Boss Loot"
      />
    </div>
  );
};

export default LootSelectionScreen;

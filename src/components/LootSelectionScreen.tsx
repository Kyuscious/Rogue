import React from 'react';
import { Character } from '../game/types';
import '../styles/LootSelectionScreen.css';

interface LootSelectionScreenProps {
  availableLoot: string[];
  onSelectLoot: (itemId: string) => void;
  character: Character;
}

export const LootSelectionScreen: React.FC<LootSelectionScreenProps> = ({
  availableLoot,
  onSelectLoot,
  character,
}) => {
  return (
    <div className="loot-selection-screen">
      <div className="loot-container">
        <h2>Boss Defeated!</h2>
        <p className="loot-flavor">Choose your reward from the fallen foe...</p>
        
        <div className="loot-grid">
          {availableLoot.map((itemId, index) => (
            <div
              key={index}
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
    </div>
  );
};

export default LootSelectionScreen;

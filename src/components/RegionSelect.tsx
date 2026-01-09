import React from 'react';
import { Region } from '../game/types';
import './RegionSelect.css';

interface RegionSelectProps {
  onSelect: (region: Region) => void;
}

const REGIONS = [
  {
    id: 'shurima' as Region,
    name: 'Shurima',
    description: 'The golden desert empire',
    emoji: '🏜️',
    color: '#d4af37',
  },
  {
    id: 'ionia' as Region,
    name: 'Ionia',
    description: 'The spiritual heart of Runeterra',
    emoji: '🍃',
    color: '#7cb342',
  },
  {
    id: 'demacia' as Region,
    name: 'Demacia',
    description: 'The righteous kingdom',
    emoji: '🏰',
    color: '#4a90e2',
  },
];

export const RegionSelect: React.FC<RegionSelectProps> = ({ onSelect }) => {
  return (
    <div className="region-select">
      <div className="region-container">
        <div className="region-header">
          <h1>Choose Your Path</h1>
          <p className="subtitle">Select a region to begin your adventure</p>
        </div>

        <div className="regions-grid">
          {REGIONS.map((region) => (
            <button
              key={region.id}
              className="region-card"
              onClick={() => onSelect(region.id)}
              style={{
                '--accent-color': region.color,
              } as React.CSSProperties}
            >
              <div className="region-emoji">{region.emoji}</div>
              <div className="region-name">{region.name}</div>
              <div className="region-description">{region.description}</div>
            </button>
          ))}
        </div>

        <div className="region-info">
          <h3>Your Role</h3>
          <p>
            Explore Runeterra by selecting a region to embark on quests, face formidable foes, and gather powerful loot.
          </p>
          <p>
            Each region hosts legendary champions. Defeat them to grow stronger and prove your mastery.
          </p>
        </div>
      </div>
    </div>
  );
};

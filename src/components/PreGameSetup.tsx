import React, { useState } from 'react';
import { Region } from '../game/types';
import { RegionSelect } from './RegionSelect';
import { ItemSelect } from './ItemSelect';
import './PreGameSetup.css';

interface PreGameSetupProps {
  onStartRun: (region: Region, itemId: string) => void;
}

export const PreGameSetup: React.FC<PreGameSetupProps> = ({ onStartRun }) => {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region as Region);
  };

  const handleItemSelect = (itemId: string) => {
    if (selectedRegion) {
      onStartRun(selectedRegion, itemId);
    }
  };

  return (
    <div className="pregame-setup">
      <div className="pregame-header">
        <h1>Riot Roguelike</h1>
        <p className="pregame-subtitle">Configure your run</p>
      </div>

      <div className="pregame-container">
        {!selectedRegion ? (
          <div className="setup-step region-step">
            <div className="step-label">
              <span className="step-number">1</span>
              <span className="step-title">Select Region</span>
            </div>
            <RegionSelect onSelect={handleRegionSelect} />
          </div>
        ) : (
          <div className="setup-step configured">
            <div className="step-label">
              <span className="step-number">✓</span>
              <span className="step-title">Region Selected</span>
            </div>
            <div className="selected-value">
              <span className="region-badge">{selectedRegion.toUpperCase()}</span>
            </div>
            <button className="btn-change" onClick={() => setSelectedRegion(null)}>
              Change Region
            </button>
          </div>
        )}

        {selectedRegion && (
          <div className="setup-step item-step">
            <div className="step-label">
              <span className="step-number">2</span>
              <span className="step-title">Select Starting Item</span>
            </div>
            <ItemSelect onItemSelected={handleItemSelect} />
          </div>
        )}
      </div>

      {selectedRegion && (
        <div className="pregame-tip">
          <p>⚡ Your choices are locked in. Complete the run to unlock permanent upgrades!</p>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '@game/store';
import type { Region } from '@game/types';
import {
  POST_REGION_CHOICES,
  hasRegionEvents,
  type PostRegionChoice,
} from '../PostRegionChoice/postRegionChoice';

const ALL_REGIONS: Region[] = [
  'demacia',
  'ionia',
  'shurima',
  'noxus',
  'freljord',
  'zaun',
  'ixtal',
  'bandle_city',
  'bilgewater',
  'piltover',
  'shadow_isles',
  'void',
  'targon',
  'camavor',
  'ice_sea',
  'marai_territory',
  'runeterra',
];

interface RegionSelectionProps {
  onSelectRegion: (region: Region) => void | Promise<void>;
  tutorialEnabled?: boolean;
  onTutorialComplete?: () => void;
  onTutorialSkip?: () => void;
}

const formatRegionName = (region: Region): string =>
  region
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const RegionSelection: React.FC<RegionSelectionProps> = ({
  onSelectRegion,
  tutorialEnabled = false,
  onTutorialComplete,
  onTutorialSkip,
}) => {
  const currentRegion = useGameStore((store) => store.state.selectedRegion);
  const completedRegion = useGameStore((store) => store.state.completedRegion);
  const setPostRegionAction = useGameStore((store) => store.setPostRegionAction);

  const regionForEvents = completedRegion || currentRegion || 'demacia';

  const availableActions = useMemo(
    () =>
      POST_REGION_CHOICES.filter(
        (choice) => choice.type !== 'event' || hasRegionEvents(regionForEvents)
      ),
    [regionForEvents]
  );

  const [selectedAction, setSelectedAction] = useState<PostRegionChoice>(availableActions[0]?.type ?? 'rest');

  useEffect(() => {
    if (!availableActions.some((choice) => choice.type === selectedAction)) {
      setSelectedAction(availableActions[0]?.type ?? 'rest');
    }
  }, [availableActions, selectedAction]);

  const travelTargets = ALL_REGIONS.filter((region) => region !== currentRegion);

  const handleTravel = (region: Region) => {
    setPostRegionAction(selectedAction);
    if (tutorialEnabled) {
      onTutorialComplete?.();
    }
    void onSelectRegion(region);
  };

  return (
    <div className="screen-container" style={{ padding: '1rem' }}>
      {tutorialEnabled && (
        <div className="tutorial-banner" style={{ marginBottom: '1rem' }}>
          <p style={{ marginBottom: '0.5rem' }}>
            Choose a post-region action, then pick your next destination.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="action-btn" onClick={() => onTutorialComplete?.()}>
              Continue
            </button>
            <button className="action-btn secondary" onClick={() => onTutorialSkip?.()}>
              Skip
            </button>
          </div>
        </div>
      )}

      <section style={{ marginBottom: '1.5rem' }}>
        <h2>Post-region action</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {availableActions.map((choice) => (
            <button
              key={choice.type}
              className="action-btn"
              style={{
                border: selectedAction === choice.type ? '2px solid #f5c542' : undefined,
                fontWeight: selectedAction === choice.type ? 700 : undefined,
              }}
              onClick={() => setSelectedAction(choice.type)}
            >
              <span style={{ marginRight: '0.5rem' }}>{choice.icon}</span>
              {formatRegionName(choice.type as Region).replace('Trade', 'Trade').replace('Event', 'Event').replace('Rest', 'Rest')}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>Choose your next region</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {travelTargets.map((region) => (
            <button
              key={region}
              className="action-btn"
              onClick={() => handleTravel(region)}
            >
              {formatRegionName(region)}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

import React, { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '@game/store';
import type { Region } from '@game/types';
import { useTranslation } from '../../../hooks/useTranslation';
import {
  POST_REGION_CHOICES,
  hasRegionEvents,
  type PostRegionChoice,
} from '../PostRegionChoice/postRegionChoice';
import {
  getAvailableDestinations,
  getRegionDescription,
  getRegionVisitCount,
  getRegionTier,
} from '../PostRegionChoice/regionGraph';
import { Map } from './Map';
import './RegionSelection.css';

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

const MAX_ALERT_VISUAL_LEVEL = 5;
const ALERT_LABELS: string[] = ['low', 'moderate', 'substential', 'severe', 'critical', 'maximal'];

export const RegionSelection: React.FC<RegionSelectionProps> = ({
  onSelectRegion,
  tutorialEnabled = false,
  onTutorialComplete,
  onTutorialSkip,
}) => {
  const t = useTranslation();
  const currentRegion = useGameStore((store) => store.state.selectedRegion);
  const completedRegion = useGameStore((store) => store.state.completedRegion);
  const visitedRegionsThisRun = useGameStore((store) => store.state.visitedRegionsThisRun);
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
  const [selectedDestination, setSelectedDestination] = useState<Region | null>(null);

  const travelTargets = useMemo(() => {
    if (!currentRegion) return [];
    return getAvailableDestinations(currentRegion, visitedRegionsThisRun);
  }, [currentRegion, visitedRegionsThisRun]);

  const previousRegion = useMemo<Region | null>(() => {
    if (visitedRegionsThisRun.length < 2) return null;
    return visitedRegionsThisRun[visitedRegionsThisRun.length - 2] || null;
  }, [visitedRegionsThisRun]);

  useEffect(() => {
    if (!availableActions.some((choice) => choice.type === selectedAction)) {
      setSelectedAction(availableActions[0]?.type ?? 'rest');
    }
  }, [availableActions, selectedAction]);

  useEffect(() => {
    if (selectedDestination && !travelTargets.includes(selectedDestination)) {
      setSelectedDestination(travelTargets[0] ?? null);
      return;
    }
    if (!selectedDestination && travelTargets.length > 0) {
      setSelectedDestination(travelTargets[0]);
    }
  }, [selectedDestination, travelTargets]);

  const actionLabelByType: Record<PostRegionChoice, string> = {
    rest: t.postRegion.restTitle,
    trade: t.postRegion.modifyBuildTitle,
    event: t.postRegion.exploreTitle,
  };

  const actionDescriptionByType: Record<PostRegionChoice, string> = {
    rest: t.postRegion.restDescription,
    trade: t.postRegion.modifyBuildDescription,
    event: t.postRegion.exploreDescription,
  };

  const tierLabelByType = {
    starting: t.regionSelection.categories.starting,
    standard: t.regionSelection.categories.standard,
    advanced: t.regionSelection.categories.advanced,
    hard: t.regionSelection.categories.hard,
    travelling: t.regionSelection.categories.travelling,
  };

  const handleTravel = (region: Region) => {
    setPostRegionAction(selectedAction);
    if (tutorialEnabled) {
      onTutorialComplete?.();
    }
    void onSelectRegion(region);
  };

  const renderRegionDescription = (region: Region): string => {
    const localizedDescription = t.regionSelection.regionDescriptions[region];
    return localizedDescription || getRegionDescription(region);
  };

  return (
    <div className="region-selection-screen">
      {tutorialEnabled && (
        <div className="tutorial-banner region-selection-tutorial-banner">
          <p>
            {selectedDestination
              ? t.tutorial.regionTravel.region
              : t.tutorial.regionTravel.actions}
          </p>
          <div className="region-selection-tutorial-actions">
            <button className="action-btn region-selection-btn" onClick={() => onTutorialComplete?.()}>
              {t.common.continue}
            </button>
            <button className="action-btn secondary region-selection-btn" onClick={() => onTutorialSkip?.()}>
              {t.tutorial.skip}
            </button>
          </div>
        </div>
      )}

      <section className="region-selection-panel">
        <h2>{t.regionSelection.chooseTravelAction}</h2>
        <p className="region-selection-subtitle">{t.regionSelection.travelActionSubtitle}</p>
        <div className="region-selection-action-grid">
          {availableActions.map((choice) => (
            <button
              key={choice.type}
              className={`region-selection-choice ${selectedAction === choice.type ? 'selected' : ''}`}
              onClick={() => setSelectedAction(choice.type)}
            >
              <span className="region-selection-choice-icon">{choice.icon}</span>
              <span className="region-selection-choice-title">{actionLabelByType[choice.type]}</span>
              <span className="region-selection-choice-description">{actionDescriptionByType[choice.type]}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="region-selection-panel">
        <h2>{t.regionSelection.selectDestination}</h2>

        {currentRegion && travelTargets.length > 0 && (
          <div className="region-selection-map-wrap">
            <Map
              currentRegion={currentRegion}
              previousRegion={previousRegion}
              travelTargets={travelTargets}
              selectedDestination={selectedDestination}
              onSelectDestination={setSelectedDestination}
            />
          </div>
        )}

        <div className="region-selection-travel-grid">
          {travelTargets.length === 0 && (
            <div className="region-selection-empty-state">{t.regionSelection.noRegionsAvailable}</div>
          )}

          {travelTargets.map((region) => {
            const tierLabel = tierLabelByType[getRegionTier(region)];
            const isSelected = selectedDestination === region;
            const visitCount = getRegionVisitCount(region, visitedRegionsThisRun);
            const visualAlertLevel = Math.min(visitCount, MAX_ALERT_VISUAL_LEVEL);
            const alertLabel = ALERT_LABELS[visualAlertLevel] ?? ALERT_LABELS[MAX_ALERT_VISUAL_LEVEL];
            const alertHue = 120 - (visualAlertLevel / MAX_ALERT_VISUAL_LEVEL) * 120;
            const alertSaturation = 58 + visualAlertLevel * 6;
            const alertLightness = 42 - visualAlertLevel * 2;

            return (
              <button
                key={region}
                className={`region-selection-destination ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDestination(region)}
                style={
                  {
                    '--alert-hue': `${alertHue}`,
                    '--alert-saturation': `${alertSaturation}%`,
                    '--alert-lightness': `${alertLightness}%`,
                  } as React.CSSProperties
                }
              >
                <div className="region-selection-destination-title-row">
                  <span className="region-selection-destination-title">{formatRegionName(region)}</span>
                  <span className="region-selection-destination-tier">{tierLabel}</span>
                </div>
                <span className="region-selection-destination-alert">
                  Alert level : {visualAlertLevel} - {alertLabel}
                </span>
                <p className="region-selection-destination-description">{renderRegionDescription(region)}</p>
              </button>
            );
          })}
        </div>

        <div className="region-selection-cta-row">
          <button
            className="action-btn region-selection-btn region-selection-travel-btn"
            onClick={() => selectedDestination && handleTravel(selectedDestination)}
            disabled={!selectedDestination}
          >
            {selectedDestination
              ? `${t.regionSelection.proceedTo} ${formatRegionName(selectedDestination)}`
              : t.regionSelection.selectDestination}
          </button>
        </div>
      </section>
    </div>
  );
};

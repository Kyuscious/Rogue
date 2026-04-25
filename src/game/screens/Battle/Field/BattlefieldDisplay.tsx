import React from 'react';
import './BattlefieldDisplay.css';
import {
  BATTLEFIELD_MIN_X,
  BATTLEFIELD_WIDTH,
} from '@battle/Field/battlefield';

export interface AoEIndicator {
  type: 'rectangle' | 'circle';
  position: number;
  size: number;
  color: string;
  label?: string; // Display name shown on battlefield
  id?: string; // Unique identifier for tracking/removal
  targetPosition?: number; // For rectangle, the target position to extend towards
}

export interface BattlefieldMarker {
  id: string;
  label: string;
  position: number;
  team: 'player' | 'enemy';
  accentColor?: string;
  shape?: 'circle' | 'square' | 'diamond';
  pulsing?: boolean;
  imageSrc?: string;
  fallbackLabel?: string;
}

export interface BattlefieldRangePreview {
  sourcePosition: number;
  targetPosition: number;
  range: number;
  color?: string;
}

interface BattlefieldDisplayProps {
  playerPosition: number;
  enemyPosition: number;
  playerName: string;
  enemyName: string;
  playerAttackRange: number;
  enemyAttackRange: number;
  distance: number;
  vertical?: boolean;
  aoeIndicators?: AoEIndicator[];
  markers?: BattlefieldMarker[];
  highlightedMarkerIds?: string[];
  rangePreview?: BattlefieldRangePreview | null;
}

export const BattlefieldDisplay: React.FC<BattlefieldDisplayProps> = ({
  playerPosition,
  enemyPosition,
  vertical = false,
  aoeIndicators = [],
  markers = [],
  highlightedMarkerIds = [],
  rangePreview = null,
}) => {
  const HORIZONTAL_VIEWBOX_WIDTH = BATTLEFIELD_WIDTH;
  const HORIZONTAL_VIEWBOX_HEIGHT = 88;
  const HORIZONTAL_TRACK_Y = 48;
  const VERTICAL_CANVAS_SIZE = 280;
  const VERTICAL_CANVAS_WIDTH = 80;
  
  // Convert position to canvas coordinate
  const posToCanvasCoord = (pos: number) => {
    const normalized = (pos - BATTLEFIELD_MIN_X) / BATTLEFIELD_WIDTH;
    if (vertical) {
      return normalized * VERTICAL_CANVAS_SIZE;
    }

    // Mirror horizontal battlefield so player-side space appears on the left lane and enemy-side on the right.
    return (1 - normalized) * HORIZONTAL_VIEWBOX_WIDTH;
  };
  
  // Convert range (units) to canvas pixels
  const rangeToPixels = (range: number) => {
    return (range / BATTLEFIELD_WIDTH) * (vertical ? VERTICAL_CANVAS_SIZE : HORIZONTAL_VIEWBOX_WIDTH);
  };

  const fallbackMarkers: BattlefieldMarker[] = markers.length > 0
    ? markers
    : [
        { id: 'player', label: 'P1', position: playerPosition, team: 'player', shape: 'circle' },
        { id: 'enemy', label: 'E1', position: enemyPosition, team: 'enemy', shape: 'circle' },
      ];

  const renderMarker = (
    marker: BattlefieldMarker,
    x: number,
    y: number,
    isHighlighted: boolean,
    key: string,
  ) => {
    const formatBattlefieldPosition = (position: number) =>
      Number.isInteger(position) ? String(position) : position.toFixed(1);

    const stroke = isHighlighted ? '#ffd166' : marker.team === 'player' ? '#0f6a91' : '#8a2c1a';
    const className = `battlefield-marker ${marker.pulsing || isHighlighted ? 'pulsing' : ''}`;
    const portraitWidth = vertical ? 20 : 34;
    const portraitHeight = vertical ? 28 : 42;
    const portraitX = x - portraitWidth / 2;
    const portraitY = y - portraitHeight;
    const positionText = `Pos ${formatBattlefieldPosition(marker.position)}`;
    const positionChipWidth = Math.max(66, positionText.length * 7 + 14);
    const positionChipX = x - positionChipWidth / 2;
    const chipHeight = 18;
    const canvasHeight = vertical ? VERTICAL_CANVAS_SIZE : HORIZONTAL_VIEWBOX_HEIGHT;
    const preferredChipY = y - portraitHeight - 18;
    const fallbackChipY = y + 8;
    const unclampedChipY = preferredChipY < 2 ? fallbackChipY : preferredChipY;
    const positionChipY = Math.max(2, Math.min(unclampedChipY, canvasHeight - chipHeight - 2));

    if (marker.imageSrc) {
      const clipPathId = `${key}-clip`;
      return (
        <g key={key} className={className}>
          <defs>
            <clipPath id={clipPathId}>
              <rect x={portraitX} y={portraitY} width={portraitWidth} height={portraitHeight} rx="10" ry="10" />
            </clipPath>
          </defs>
          <rect
            x={portraitX}
            y={portraitY}
            width={portraitWidth}
            height={portraitHeight}
            rx="10"
            ry="10"
            fill="rgba(8, 12, 24, 0.38)"
            stroke={stroke}
            strokeWidth="2"
          />
          <image
            href={marker.imageSrc}
            x={portraitX}
            y={portraitY}
            width={portraitWidth}
            height={portraitHeight}
            preserveAspectRatio="xMidYMin slice"
            clipPath={`url(#${clipPathId})`}
          />
          <g className="battlefield-marker-position-chip" aria-hidden="true">
            <rect
              x={positionChipX}
              y={positionChipY}
              width={positionChipWidth}
              height={chipHeight}
              rx="9"
              fill="rgba(2, 6, 23, 0.95)"
              stroke="rgba(125, 211, 252, 0.9)"
              strokeWidth="1"
            />
            <text
              x={x}
              y={positionChipY + 12}
              className="battlefield-marker-position-text"
              textAnchor="middle"
            >
              {positionText}
            </text>
          </g>
        </g>
      );
    }

    if (marker.fallbackLabel) {
      return (
        <g key={key} className={className}>
          <rect
            x={x - 14}
            y={y - 18}
            width="28"
            height="22"
            rx="11"
            fill="rgba(8, 12, 24, 0.82)"
            stroke={stroke}
            strokeWidth="2"
          />
          <text
            x={x}
            y={y - 4}
            className="battlefield-marker-fallback"
            textAnchor="middle"
          >
            {marker.fallbackLabel}
          </text>
          <g className="battlefield-marker-position-chip" aria-hidden="true">
            <rect
              x={positionChipX}
              y={positionChipY}
              width={positionChipWidth}
              height={chipHeight}
              rx="9"
              fill="rgba(2, 6, 23, 0.95)"
              stroke="rgba(125, 211, 252, 0.9)"
              strokeWidth="1"
            />
            <text
              x={x}
              y={positionChipY + 12}
              className="battlefield-marker-position-text"
              textAnchor="middle"
            >
              {positionText}
            </text>
          </g>
        </g>
      );
    }

    return (
      <g key={key} className={className}>
        <circle cx={x} cy={y - 8} r="8" fill="rgba(8, 12, 24, 0.72)" stroke={stroke} strokeWidth="2" />
        <text x={x} y={y - 4} className="battlefield-marker-fallback" textAnchor="middle">{marker.label}</text>
        <g className="battlefield-marker-position-chip" aria-hidden="true">
          <rect
            x={positionChipX}
            y={positionChipY}
            width={positionChipWidth}
            height={chipHeight}
            rx="9"
            fill="rgba(2, 6, 23, 0.95)"
            stroke="rgba(125, 211, 252, 0.9)"
            strokeWidth="1"
          />
          <text
            x={x}
            y={positionChipY + 12}
            className="battlefield-marker-position-text"
            textAnchor="middle"
          >
            {positionText}
          </text>
        </g>
      </g>
    );
  };

  const renderRangePreview = () => {
    if (!rangePreview || vertical) {
      return null;
    }

    const sourceCoord = posToCanvasCoord(rangePreview.sourcePosition);
    const targetCoord = posToCanvasCoord(rangePreview.targetPosition);
    const rangePixels = rangeToPixels(rangePreview.range);
    const isTowardsPositive = targetCoord >= sourceCoord;
    const previewStart = sourceCoord;
    const previewEnd = isTowardsPositive ? sourceCoord + rangePixels : sourceCoord - rangePixels;
    const rectX = Math.min(previewStart, previewEnd);
    const rectWidth = Math.abs(previewEnd - previewStart);

    return (
      <g className="battlefield-range-preview">
        <rect
          x={rectX}
          y={HORIZONTAL_TRACK_Y - 8}
          width={rectWidth}
          height="16"
          rx="8"
          fill={`${rangePreview.color || '#7dd3fc'}22`}
          stroke={rangePreview.color || '#7dd3fc'}
          strokeWidth="1.5"
        />
      </g>
    );
  };

  const renderMarkers = (isVertical: boolean, axisCenter: number) => {
    const grouped = new Map<number, BattlefieldMarker[]>();

    fallbackMarkers.forEach((marker) => {
      const key = Math.round(marker.position);
      const group = grouped.get(key) || [];
      group.push(marker);
      grouped.set(key, group);
    });

    const nodes: React.ReactNode[] = [];
    const spread = 16;

    Array.from(grouped.entries()).forEach(([positionKey, group]) => {
      const baseCoord = posToCanvasCoord(positionKey);
      group.forEach((marker, index) => {
        const offset = (index - (group.length - 1) / 2) * spread;
        const x = isVertical ? axisCenter + offset : baseCoord;
        const y = isVertical ? baseCoord : HORIZONTAL_TRACK_Y + offset;
        const isHighlighted = highlightedMarkerIds.includes(marker.id);
        const shapeKey = `${marker.id}-shape-${positionKey}-${index}`;

        nodes.push(renderMarker(marker, x, y, isHighlighted, shapeKey));
      });
    });

    return nodes;
  };
  
  if (vertical) {
    const centerX = VERTICAL_CANVAS_WIDTH / 2;
    
    return (
      <div className="battlefield-display vertical">
        <svg className="battlefield-canvas" width={`${VERTICAL_CANVAS_WIDTH}px`} height={`${VERTICAL_CANVAS_SIZE}px`} viewBox={`0 0 ${VERTICAL_CANVAS_WIDTH} ${VERTICAL_CANVAS_SIZE}`}>
          <line x1={centerX} y1="10" x2={centerX} y2={VERTICAL_CANVAS_SIZE - 10} stroke="rgba(148, 163, 184, 0.55)" strokeWidth="2" />
          {/* AoE indicators */}
          {aoeIndicators.map((aoe, index) => {
            const aoeCoord = posToCanvasCoord(aoe.position);
            const aoePixels = rangeToPixels(aoe.size);
            
            if (aoe.type === 'circle') {
              return (
                <g key={index}>
                  <circle
                    cx={centerX}
                    cy={aoeCoord}
                    r={aoePixels}
                    fill={`${aoe.color}20`}
                    stroke={aoe.color}
                    strokeWidth="2"
                  />
                  {aoe.label && (
                    <text
                      x={centerX}
                      y={aoeCoord - aoePixels - 8}
                      fill={aoe.color}
                      fontSize="10"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      {aoe.label}
                    </text>
                  )}
                </g>
              );
            } else {
              // Rectangle: draw from position toward targetPosition (vertical)
              const targetCoord = aoe.targetPosition !== undefined ? posToCanvasCoord(aoe.targetPosition) : aoeCoord;
              const rectHeight = aoePixels;
              const rectWidth = 30;
              
              // Determine direction and calculate rectangle bounds
              const isTowardsPositive = targetCoord > aoeCoord;
              const rectY = isTowardsPositive ? aoeCoord : Math.max(aoeCoord - rectHeight, 0);
              
              return (
                <g key={index}>
                  <rect
                    x={centerX - rectWidth / 2}
                    y={rectY}
                    width={rectWidth}
                    height={rectHeight}
                    fill={`${aoe.color}20`}
                    stroke={aoe.color}
                    strokeWidth="2"
                  />
                  {aoe.label && (
                    <text
                      x={centerX + 20}
                      y={rectY + 15}
                      fill={aoe.color}
                      fontSize="10"
                      textAnchor="start"
                      fontWeight="600"
                    >
                      {aoe.label}
                    </text>
                  )}
                </g>
              );
            }
          })}

          {renderMarkers(true, centerX)}
        </svg>
      </div>
    );
  }
  
  // Horizontal layout (fallback)
  return (
    <div className="battlefield-display horizontal">
      <svg className="battlefield-canvas" width="100%" height="88" viewBox={`0 0 ${HORIZONTAL_VIEWBOX_WIDTH} ${HORIZONTAL_VIEWBOX_HEIGHT}`} preserveAspectRatio="none">
        <line x1="0" y1={HORIZONTAL_TRACK_Y} x2={HORIZONTAL_VIEWBOX_WIDTH} y2={HORIZONTAL_TRACK_Y} stroke="rgba(148, 163, 184, 0.5)" strokeWidth="2" />
        <g className="battlefield-escape-chip left">
          <rect x="8" y={HORIZONTAL_TRACK_Y - 20} width="64" height="14" rx="7" fill="rgba(2, 6, 23, 0.9)" stroke="rgba(100, 116, 139, 0.78)" strokeWidth="1" />
          <text x="40" y={HORIZONTAL_TRACK_Y - 10} className="battlefield-escape-label" textAnchor="middle">← Escape</text>
        </g>
        <g className="battlefield-escape-chip right">
          <rect x={HORIZONTAL_VIEWBOX_WIDTH - 72} y={HORIZONTAL_TRACK_Y - 20} width="64" height="14" rx="7" fill="rgba(2, 6, 23, 0.9)" stroke="rgba(100, 116, 139, 0.78)" strokeWidth="1" />
          <text x={HORIZONTAL_VIEWBOX_WIDTH - 40} y={HORIZONTAL_TRACK_Y - 10} className="battlefield-escape-label" textAnchor="middle">Escape →</text>
        </g>
        {renderRangePreview()}
        
        {/* AoE indicators */}
        {aoeIndicators.map((aoe, index) => {
          const aoeCoord = posToCanvasCoord(aoe.position);
          const aoePixels = rangeToPixels(aoe.size);
          
          if (aoe.type === 'circle') {
            return (
              <g key={index}>
                <circle
                  cx={aoeCoord}
                  cy={HORIZONTAL_TRACK_Y}
                  r={aoePixels}
                  fill={`${aoe.color}20`}
                  stroke={aoe.color}
                  strokeWidth="2"
                />
                {aoe.label && (
                  <text
                    x={aoeCoord}
                    y={HORIZONTAL_TRACK_Y - aoePixels - 4}
                    fill={aoe.color}
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {aoe.label}
                  </text>
                )}
              </g>
            );
          } else {
            // Rectangle: draw from position toward targetPosition
            const targetCoord = aoe.targetPosition !== undefined ? posToCanvasCoord(aoe.targetPosition) : aoeCoord;
            const rectWidth = aoePixels;
            const rectHeight = 30;
            
            // Determine direction and calculate rectangle bounds
            const isTowardsPositive = targetCoord > aoeCoord;
            const rectX = isTowardsPositive ? aoeCoord : Math.max(aoeCoord - rectWidth, 0);
            
            return (
              <g key={index}>
                <rect
                  x={rectX}
                  y={HORIZONTAL_TRACK_Y - rectHeight / 2}
                  width={rectWidth}
                  height={rectHeight}
                  fill={`${aoe.color}20`}
                  stroke={aoe.color}
                  strokeWidth="2"
                />
                {aoe.label && (
                  <text
                    x={rectX + 5}
                    y={HORIZONTAL_TRACK_Y - rectHeight / 2 - 4}
                    fill={aoe.color}
                    fontSize="10"
                    textAnchor="start"
                    fontWeight="600"
                  >
                    {aoe.label}
                  </text>
                )}
              </g>
            );
          }
        })}

        {renderMarkers(false, 60)}
      </svg>
    </div>
  );
};

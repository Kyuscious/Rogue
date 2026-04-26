import React, { useMemo } from 'react';
import type { Region } from '@game/types';
import { REGION_GRAPH } from '../PostRegionChoice/regionGraph';

interface MapProps {
  currentRegion: Region;
  previousRegion: Region | null;
  travelTargets: Region[];
  selectedDestination: Region | null;
  onSelectDestination: (region: Region) => void;
}

const formatRegionName = (region: Region): string =>
  region
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const REGION_POSITIONS: Record<Region, { x: number; y: number }> = {
  demacia: { x: 300, y: 260 },
  ionia: { x: 610, y: 255 },
  shurima: { x: 490, y: 500 },
  noxus: { x: 500, y: 220 },
  freljord: { x: 520, y: 120 },
  zaun: { x: 300, y: 430 },
  ixtal: { x: 635, y: 420 },
  bandle_city: { x: 210, y: 540 },
  bilgewater: { x: 760, y: 530 },
  piltover: { x: 500, y: 340 },
  shadow_isles: { x: 875, y: 610 },
  void: { x: 500, y: 35 },
  targon: { x: 95, y: 605 },
  camavor: { x: 955, y: 650 },
  ice_sea: { x: 500, y: 8 },
  marai_territory: { x: 25, y: 650 },
  runeterra: { x: 500, y: 680 },
};

// Padding (in world-space units) around the tight bounding box of visible nodes.
const NODE_PADDING = 90;

export const Map: React.FC<MapProps> = ({
  currentRegion,
  previousRegion,
  travelTargets,
  selectedDestination,
  onSelectDestination,
}) => {
  // Only the regions the player can actually interact with right now.
  const visibleRegions = useMemo<Region[]>(() => {
    const set = new Set<Region>([currentRegion, ...travelTargets]);
    if (previousRegion) set.add(previousRegion);
    return [...set];
  }, [currentRegion, previousRegion, travelTargets]);

  const visibleSet = useMemo(() => new Set(visibleRegions), [visibleRegions]);
  const destinationSet = useMemo(() => new Set(travelTargets), [travelTargets]);

  // Only edges where BOTH endpoints are visible.
  const visibleEdges = useMemo(() => {
    const result: Array<{ from: Region; to: Region }> = [];
    (Object.entries(REGION_GRAPH) as Array<[Region, Region[]]>).forEach(([from, targets]) => {
      targets.forEach((to) => {
        if (visibleSet.has(from as Region) && visibleSet.has(to)) {
          result.push({ from: from as Region, to });
        }
      });
    });
    return result;
  }, [visibleSet]);

  // Compute a tight viewBox that crops to just the visible nodes.
  const viewBoxObj = useMemo(() => {
    const positions = visibleRegions.map((r) => REGION_POSITIONS[r]);
    const minX = Math.min(...positions.map((p) => p.x)) - NODE_PADDING;
    const minY = Math.min(...positions.map((p) => p.y)) - NODE_PADDING;
    const maxX = Math.max(...positions.map((p) => p.x)) + NODE_PADDING;
    const maxY = Math.max(...positions.map((p) => p.y)) + NODE_PADDING;
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }, [visibleRegions]);

  const viewBoxStr = `${viewBoxObj.x} ${viewBoxObj.y} ${viewBoxObj.w} ${viewBoxObj.h}`;

  return (
    <div className="travel-map" role="region" aria-label="Travel map">
      <svg
        className="travel-map-svg"
        viewBox={viewBoxStr}
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
      >
        <defs>
          <radialGradient id="travelOceanGradient" cx="50%" cy="50%" r="60%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="rgba(36, 60, 99, 0.95)" />
            <stop offset="60%" stopColor="rgba(17, 31, 56, 0.98)" />
            <stop offset="100%" stopColor="rgba(9, 18, 36, 1)" />
          </radialGradient>
          <marker id="travelArrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L10,4 L0,8 Z" fill="rgba(136, 204, 255, 0.75)" />
          </marker>
        </defs>

        {/* Background fills exactly the visible viewport */}
        <rect
          x={viewBoxObj.x}
          y={viewBoxObj.y}
          width={viewBoxObj.w}
          height={viewBoxObj.h}
          className="travel-map-bg"
        />

        {/* Edges — only between visible nodes */}
        {visibleEdges.map(({ from, to }) => {
          const fromPos = REGION_POSITIONS[from];
          const toPos = REGION_POSITIONS[to];
          const isPrimary =
            (from === currentRegion && destinationSet.has(to)) ||
            (previousRegion !== null && from === previousRegion && to === currentRegion);

          return (
            <line
              key={`${from}-${to}`}
              x1={fromPos.x}
              y1={fromPos.y}
              x2={toPos.x}
              y2={toPos.y}
              markerEnd="url(#travelArrow)"
              className={`travel-map-edge ${isPrimary ? 'primary' : ''}`}
            />
          );
        })}

        {/* Nodes — only visible regions */}
        {visibleRegions.map((region) => {
          const position = REGION_POSITIONS[region];
          const isCurrent = region === currentRegion;
          const isPrevious = previousRegion === region;
          const isDestination = destinationSet.has(region);
          const isSelected = selectedDestination === region;

          return (
            <g
              key={region}
              className={`travel-map-node-group ${isCurrent ? 'current' : ''} ${isPrevious ? 'previous' : ''} ${isDestination ? 'destination' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                if (isDestination) onSelectDestination(region);
              }}
            >
              <circle cx={position.x} cy={position.y} r={isCurrent ? 18 : 15} className="travel-map-node-circle" />
              <text x={position.x} y={position.y + 4} textAnchor="middle" className="travel-map-node-label">
                {formatRegionName(region)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

import React from 'react';
import './BattlefieldDisplay.css';

interface BattlefieldDisplayProps {
  playerPosition: number;
  enemyPosition: number;
  playerName: string;
  enemyName: string;
  playerAttackRange: number;
  enemyAttackRange: number;
  distance: number;
  vertical?: boolean;
}

export const BattlefieldDisplay: React.FC<BattlefieldDisplayProps> = ({
  playerPosition,
  enemyPosition,
  playerAttackRange,
  enemyAttackRange,
  distance,
  vertical = false,
}) => {
  // Battlefield is 1000 units (-500 to 500)
  const BATTLEFIELD_MIN = -500;
  const BATTLEFIELD_WIDTH = 1000;
  const CANVAS_SIZE = vertical ? 280 : 600;
  const CANVAS_WIDTH = vertical ? 80 : 600;
  
  // Convert position to canvas coordinate
  const posToCanvasCoord = (pos: number) => {
    const normalized = (pos - BATTLEFIELD_MIN) / BATTLEFIELD_WIDTH;
    return normalized * CANVAS_SIZE;
  };
  
  const playerCoord = posToCanvasCoord(playerPosition);
  const enemyCoord = posToCanvasCoord(enemyPosition);
  
  // Convert range (units) to canvas pixels
  // Full battlefield is CANVAS_SIZE pixels for 1000 units
  const rangeToPixels = (range: number) => {
    return (range / BATTLEFIELD_WIDTH) * CANVAS_SIZE;
  };
  
  const playerRangePixels = rangeToPixels(playerAttackRange);
  const enemyRangePixels = rangeToPixels(enemyAttackRange);
  
  if (vertical) {
    // Vertical layout for centered battlefield (player at top, enemy at bottom)
    const centerX = CANVAS_WIDTH / 2;
    const enemyCanvasY = CANVAS_SIZE - (CANVAS_SIZE - enemyCoord); // Convert to bottom-based positioning
    
    return (
      <div className="battlefield-display vertical">
        <div className="battlefield-info">
          <span className="distance-label">gap: {distance}</span>
        </div>
        
        <svg className="battlefield-canvas" width={`${CANVAS_WIDTH}px`} height={`${CANVAS_SIZE}px`} viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_SIZE}`}>
          {/* Battlefield center line */}
          <line x1={centerX} y1="10" x2={centerX} y2={CANVAS_SIZE - 10} stroke="#444" strokeWidth="2" />
          
          {/* FLEE markers above and below the line */}
          {/* Top FLEE (red - enemy retreat) */}
          <text x={centerX} y="18" className="flee-marker" fontSize="10" fill="#FF6B6B" textAnchor="middle" fontWeight="600">FLEE</text>
          {/* Bottom FLEE (green - player retreat) */}
          <text x={centerX} y={CANVAS_SIZE - 8} className="flee-marker" fontSize="10" fill="#4CAF50" textAnchor="middle" fontWeight="600">FLEE</text>
          
          {/* Player attack range circle (shaded) */}
          <circle
            cx={centerX}
            cy={playerCoord}
            r={playerRangePixels}
            fill="rgba(76, 175, 80, 0.1)"
            stroke="rgba(76, 175, 80, 0.3)"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          
          {/* Enemy attack range circle (shaded) */}
          <circle
            cx={centerX}
            cy={enemyCanvasY}
            r={enemyRangePixels}
            fill="rgba(255, 107, 107, 0.1)"
            stroke="rgba(255, 107, 107, 0.3)"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          
          {/* Player position (top of line) */}
          <circle
            cx={centerX}
            cy={playerCoord}
            r="6"
            fill="#4CAF50"
            stroke="#2E7D32"
            strokeWidth="2"
          />
          
          {/* Enemy position (bottom of line) */}
          <circle
            cx={centerX}
            cy={enemyCanvasY}
            r="6"
            fill="#FF6B6B"
            stroke="#C92A2A"
            strokeWidth="2"
          />
        </svg>
      </div>
    );
  }
  
  // Horizontal layout (fallback)
  return (
    <div className="battlefield-display horizontal">
      <div className="battlefield-info">
        <span className="distance-label">gap: {distance}</span>
      </div>
      
      <svg className="battlefield-canvas" width={CANVAS_SIZE} height="120">
        {/* Battlefield center line */}
        <line x1="5" y1="60" x2={CANVAS_SIZE - 5} y2="60" stroke="#444" strokeWidth="2" />
        
        {/* FLEE markers above and below the line */}
        {/* Left FLEE (red - enemy retreat) */}
        <text x="15" y="48" className="flee-marker" fontSize="10" fill="#FF6B6B" textAnchor="middle" fontWeight="600">FLEE</text>
        {/* Right FLEE (green - player retreat) */}
        <text x={CANVAS_SIZE - 15} y="72" className="flee-marker" fontSize="10" fill="#4CAF50" textAnchor="middle" fontWeight="600">FLEE</text>
        
        {/* Player attack range circle (shaded) */}
        <circle
          cx={playerCoord}
          cy="60"
          r={playerRangePixels}
          fill="rgba(76, 175, 80, 0.1)"
          stroke="rgba(76, 175, 80, 0.3)"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
        
        {/* Enemy attack range circle (shaded) */}
        <circle
          cx={enemyCoord}
          cy="60"
          r={enemyRangePixels}
          fill="rgba(255, 107, 107, 0.1)"
          stroke="rgba(255, 107, 107, 0.3)"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
        
        {/* Player position */}
        <circle cx={playerCoord} cy="60" r="6" fill="#4CAF50" stroke="#2E7D32" strokeWidth="2" />
        
        {/* Enemy position */}
        <circle cx={enemyCoord} cy="60" r="6" fill="#FF6B6B" stroke="#C92A2A" strokeWidth="2" />
      </svg>
    </div>
  );
};

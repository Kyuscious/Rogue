import React from 'react';
import './TurnTimeline.css';

interface TurnAction {
  entityId: string;
  entityName?: string;
  actionType: 'attack' | 'spell' | 'move';
  time: number;
  turnNumber: number;
}

interface TimelineEntityVisual {
  imageSrc?: string;
  fallbackLabel: string;
  team: 'player' | 'enemy' | 'familiar';
}

interface FamiliarTimelineAction {
  entityId: string;
  entityName: string;
  time: number;
  turnNumber: number;
  actionType: 'attack' | 'spell' | 'move';
}

interface StunPeriod {
  entityId: string;
  entityName: string;
  startTime: number;
  endTime: number;
}

interface TurnTimelineProps {
  turnSequence: TurnAction[];
  currentIndex: number;
  playerName: string;
  enemyName: string;
  isPlayerTurn: boolean;
  stunPeriods?: StunPeriod[];
  entityVisuals?: Record<string, TimelineEntityVisual>;
  familiarTimelineActions?: FamiliarTimelineAction[];
  onSimultaneousAction?: (playerAction: string, enemyAction: string, time: number) => void;
}

export const TurnTimeline: React.FC<TurnTimelineProps> = ({
  turnSequence,
  currentIndex,
  playerName,
  enemyName,
  isPlayerTurn,
  stunPeriods = [],
  entityVisuals = {},
  familiarTimelineActions = [],
  onSimultaneousAction,
}) => {
  // Get next 30 actions starting from current
  const visibleActions = turnSequence.slice(currentIndex, currentIndex + 30);
  
  // Track previous action time for smooth transitions
  const prevActionTimeRef = React.useRef<number>(visibleActions[0]?.time || 1);
  const currentActionTime = visibleActions[0]?.time || 1;
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Trigger transition when action time changes
  React.useEffect(() => {
    if (currentActionTime !== prevActionTimeRef.current) {
      setIsTransitioning(true);
      prevActionTimeRef.current = currentActionTime;
      const timer = setTimeout(() => setIsTransitioning(false), 400); // Match CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [currentActionTime]);

  // Group actions by exact time to detect simultaneous actions
  const actionGroups = visibleActions.reduce((groups, action, idx) => {
    const time = action.time.toFixed(3); // Use 3 decimals for precise grouping
    if (!groups[time]) {
      groups[time] = [];
    }
    groups[time].push({ action, originalIndex: idx });
    return groups;
  }, {} as Record<string, Array<{ action: TurnAction; originalIndex: number }>>);

  // Track last logged simultaneous action to prevent duplicates
  const lastLoggedSimultaneous = React.useRef<string | null>(null);

  // Check for simultaneous active action and call callback
  React.useEffect(() => {
    if (visibleActions.length === 0) return;
    
    const firstTimeKey = visibleActions[0].time.toFixed(3);
    const firstGroup = actionGroups[firstTimeKey];
    
    if (firstGroup && firstGroup.length > 1 && firstGroup[0].originalIndex === 0) {
      const hasPlayer = firstGroup.some(g => g.action.entityId === 'player');
      const hasEnemy = firstGroup.some(g => g.action.entityId !== 'player');
      
      if (hasPlayer && hasEnemy && onSimultaneousAction) {
        const playerAction = firstGroup.find(g => g.action.entityId === 'player')!.action;
        const enemyAction = firstGroup.find(g => g.action.entityId !== 'player')!.action;
        const simultaneousKey = `${playerAction.time}-${currentIndex}`;
        
        // Only log if we haven't logged this exact simultaneous action yet
        if (lastLoggedSimultaneous.current !== simultaneousKey) {
          lastLoggedSimultaneous.current = simultaneousKey;
          onSimultaneousAction(playerAction.actionType, enemyAction.actionType, playerAction.time);
        }
      }
    }
  }, [currentIndex, turnSequence.length]); // Trigger when sequence advances

  // Fixed window with padding to prevent icon cutoff (2.10 turn range)
  const startTurn = currentActionTime - 0.05; // Start slightly before current action to show full icon
  const endTurn = currentActionTime + 2.05; // Show next 2.05 turns (full icon at 2.00)
  const turnRange = 2.1; // Fixed range (2.05 + 0.05)

  // Generate turn markers at MIDPOINTS (.5) that fall within the visible window
  const turnMarkers = [];
  const firstMarker = Math.ceil(currentActionTime); // First whole turn visible
  const lastMarker = Math.floor(endTurn); // Last whole turn visible
  for (let i = firstMarker; i <= lastMarker; i++) {
    turnMarkers.push(i);
  }
  
  // Generate turn background sections (from turn N to turn N+1)
  const turnBackgrounds = [];
  for (let i = firstMarker; i <= lastMarker; i++) {
    turnBackgrounds.push(i);
  }

  // Calculate position percentage on timeline (works with decimal turn numbers)
  const getPositionPercent = (turnNumber: number) => {
    return ((turnNumber - startTurn) / turnRange) * 100;
  };

  const getEntityVisual = (entityId: string, fallbackName: string, isPlayer: boolean): TimelineEntityVisual => {
    const existing = entityVisuals[entityId];
    if (existing) return existing;

    if (isPlayer) {
      return {
        fallbackLabel: 'P1',
        team: 'player',
      };
    }

    const short = fallbackName ? fallbackName.slice(0, 2).toUpperCase() : 'E1';
    return {
      fallbackLabel: short,
      team: 'enemy',
    };
  };

  const renderEntityChip = (
    visual: TimelineEntityVisual,
    name: string,
    className = 'entity-chip'
  ) => {
    return (
      <div className={`${className} ${visual.team}`} title={name}>
        {visual.imageSrc ? (
          <img src={visual.imageSrc} alt={name} />
        ) : (
          <span>{visual.fallbackLabel}</span>
        )}
      </div>
    );
  };

  // Return null AFTER all hooks have been called
  if (visibleActions.length === 0) return null;

  return (
    <div className="turn-timeline">
      <div className="timeline-header">Encounter Timeline</div>
      <div 
        className={`timeline-container ${isPlayerTurn ? 'paused' : ''} ${isTransitioning ? 'transitioning' : ''}`}
        style={{
          '--current-time': currentActionTime,
        } as React.CSSProperties}
      >
        {/* Current action marker (leftmost) */}
        <div className="current-action-marker" title="Current Action">
          <div className="marker-line" />
          <div className="marker-arrow">▶</div>
        </div>
        
        {/* Turn background sections - alternating colors */}
        {turnBackgrounds.map((turn) => {
          const turnStart = getPositionPercent(turn);
          const turnEnd = getPositionPercent(turn + 1);
          const width = turnEnd - turnStart;
          // Alternating colors based on turn number
          const colors = [
            'rgba(74, 158, 255, 0.08)', // Blue
            'rgba(124, 58, 237, 0.08)', // Purple
            'rgba(255, 107, 107, 0.08)', // Red
          ];
          const bgColor = colors[turn % colors.length];
          
          return (
            <div
              key={`bg-${turn}`}
              className="turn-background"
              style={{ 
                left: `${turnStart}%`,
                width: `${width}%`,
                background: bgColor,
              }}
            />
          );
        })}
        
        {/* Timeline bar */}
        <div className="timeline-bar" />
        
        {/* Stun period indicators */}
        {stunPeriods.map((stun, idx) => {
          // Only show stuns that overlap with visible window
          if (stun.endTime < startTurn || stun.startTime > endTurn) {
            return null;
          }
          
          const stunStart = Math.max(stun.startTime, startTurn);
          const stunEnd = Math.min(stun.endTime, endTurn);
          const startPos = getPositionPercent(stunStart);
          const endPos = getPositionPercent(stunEnd);
          const width = endPos - startPos;
          
          const isPlayer = stun.entityId === 'player';
          const barColor = isPlayer ? 'rgba(76, 175, 80, 0.7)' : 'rgba(255, 107, 107, 0.7)';
          
          return (
            <div
              key={`stun-${idx}`}
              className="stun-period"
              style={{
                left: `${startPos}%`,
                width: `${width}%`,
                background: barColor,
                borderColor: isPlayer ? '#4CAF50' : '#FF6B6B',
              }}
              title={`${stun.entityName} stunned (${stun.startTime.toFixed(2)} - ${stun.endTime.toFixed(2)})`}
            >
              <span className="stun-label">💫 Stunned</span>
            </div>
          );
        })}
        
        {/* Turn number markers - positioned at MIDPOINTS */}
        {turnMarkers.map((turn) => {
          const midpoint = turn + 0.5; // Position at T1.5, T2.5, T3.5, etc.
          const position = getPositionPercent(midpoint);
          // Match label color to background color
          const colors = [
            '#4a9eff', // Blue
            '#7c3aed', // Purple
            '#ff6b6b', // Red
          ];
          const labelColor = colors[turn % colors.length];
          
          return (
            <div
              key={turn}
              className="turn-marker"
              style={{ 
                left: `${position}%`,
                '--label-color': labelColor,
              } as React.CSSProperties}
            >
              <div className="turn-marker-label">T{turn}</div>
            </div>
          );
        })}

        {/* Action indicators - grouped by time to handle simultaneous actions */}
        {Object.entries(actionGroups).map(([timeKey, group]) => {
          const firstAction = group[0].action;
          const isActive = group[0].originalIndex === 0;
          
          // Only show actions within the visible window
          if (firstAction.time < startTurn || firstAction.time > endTurn) {
            return null;
          }
          
          const position = getPositionPercent(firstAction.time);
          
          // Check if this is a simultaneous action (player and any enemy)
          const hasPlayer = group.some(g => g.action.entityId === 'player');
          const hasEnemy = group.some(g => g.action.entityId !== 'player');
          const isSimultaneous = hasPlayer && hasEnemy;
          
          if (isSimultaneous) {
            const playerAction = group.find(g => g.action.entityId === 'player')!.action;
            const enemyAction = group.find(g => g.action.entityId !== 'player')!.action;
            const playerIcon = playerAction.actionType === 'spell' ? '✨' : playerAction.actionType === 'move' ? '↔' : '⚔️';
            const enemyIcon = enemyAction.actionType === 'spell' ? '✨' : enemyAction.actionType === 'move' ? '↔' : '⚔️';
            const playerVisual = getEntityVisual('player', playerName, true);
            const enemyVisual = getEntityVisual(enemyAction.entityId, enemyAction.entityName || enemyName, false);
            
            return (
              <div
                key={timeKey}
                className={`action-indicator simultaneous ${isActive ? 'active' : ''}`}
                style={{ left: `${position}%` }}
                title={`SIMULTANEOUS at ${firstAction.time.toFixed(2)}\n${playerName}: ${playerAction.actionType}\n${enemyAction.entityName || enemyName}: ${enemyAction.actionType}`}
              >
                <div className="action-icon-merged">
                  <span className="player-icon">{playerIcon}</span>
                  <span className="enemy-icon">{enemyIcon}</span>
                </div>
                <div className="simultaneous-entity-chips">
                  {renderEntityChip(playerVisual, playerName, 'entity-chip simultaneous-chip')}
                  {renderEntityChip(enemyVisual, enemyAction.entityName || enemyName, 'entity-chip simultaneous-chip')}
                </div>
              </div>
            );
          }
          
          // Single action (normal case)
          const action = firstAction;
          const isPlayer = action.entityId === 'player';
          const name = isPlayer ? playerName : (action.entityName || enemyName);
          const entityVisual = getEntityVisual(action.entityId, name, isPlayer);
          
          return (
            <div
              key={timeKey}
              className={`action-indicator ${isActive ? 'active' : ''} ${entityVisual.team}`}
              style={{ left: `${position}%` }}
              title={`${name} - ${action.actionType} at ${action.time.toFixed(2)}`}
            >
              <div className="action-icon">
                {action.actionType === 'spell' ? '✨' : action.actionType === 'move' ? '↔' : '⚔️'}
              </div>
              {renderEntityChip(entityVisual, name)}
            </div>
          );
        })}

        {/* Familiar action indicators - projected from familiar turn timers */}
        {familiarTimelineActions.map((action) => {
          if (action.time < startTurn || action.time > endTurn) {
            return null;
          }

          const position = getPositionPercent(action.time);
          const entityVisual = getEntityVisual(action.entityId, action.entityName, false);
          const isActive = Math.abs(action.time - currentActionTime) < 0.0001;

          return (
            <div
              key={`familiar-${action.entityId}-${action.time.toFixed(3)}`}
              className={`action-indicator familiar familiar-projected ${isActive ? 'active' : ''}`}
              style={{ left: `${position}%` }}
              title={`${action.entityName} - ${action.actionType} at ${action.time.toFixed(2)}`}
            >
              <div className="action-icon familiar-action">✦</div>
              {renderEntityChip(entityVisual, action.entityName)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

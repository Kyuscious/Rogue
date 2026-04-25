import React, { useEffect, useRef, useState } from 'react';
import { audioManager } from '@screens/Settings/audioManager';
import './EnemySpawn.css';

interface EnemySpawnProps {
  /** Unique key / ID of the enemy — changing it re-triggers the spawn animation */
  enemyId: string;
  /** Path to the character art image */
  characterArt: string;
  /** Edge alignment for the portrait within its slot */
  align?: 'left' | 'right';
  /** Alt text for the art image */
  altText?: string;
  /** Optional SFX path played once when the enemy first appears */
  spawnSfx?: string;
  /** Extra CSS class forwarded to the root element */
  className?: string;
}

/**
 * EnemySpawn
 *
 * Renders the enemy character-art portrait inside a fixed-size frame.
 * Plays a short entrance animation (slide-in + fade) whenever `enemyId`
 * changes, and optionally fires a one-shot SFX via the AudioManager.
 *
 * Lives in src/game/entity/Spawn/ so it stays framework-agnostic from the
 * game-logic layer, while still being a reusable UI component.
 */
export const EnemySpawn: React.FC<EnemySpawnProps> = ({
  enemyId,
  characterArt,
  align = 'left',
  altText = 'Enemy',
  spawnSfx,
  className = '',
}) => {
  const [animating, setAnimating] = useState(true);
  const prevIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevIdRef.current === enemyId) return;
    prevIdRef.current = enemyId;

    // Restart spawn animation
    setAnimating(false);
    const raf = requestAnimationFrame(() => {
      setAnimating(true);
    });

    // Play spawn SFX if provided and AudioManager is available
    if (spawnSfx) {
      try {
        audioManager.playSfx(spawnSfx);
      } catch {
        // AudioManager may not be initialised yet; fail silently
      }
    }

    return () => cancelAnimationFrame(raf);
  }, [enemyId, spawnSfx]);

  return (
    <div className={`enemy-spawn-frame ${animating ? 'enemy-spawn-enter' : ''} ${className}`}>
      <img
        src={characterArt}
        alt={altText}
        className={`enemy-spawn-art ${align === 'right' ? 'align-right' : 'align-left'}`}
        draggable={false}
      />
    </div>
  );
};

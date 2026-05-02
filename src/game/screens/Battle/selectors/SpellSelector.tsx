import React, { useState } from 'react';
import { useGameStore } from '@game/store';
import { getSpellById } from '@data/spells';
import { Tooltip } from '../../../shared/Tooltip';
import './SpellSelector.css';

interface SpellSelectorProps {
  onCast: (index: number) => void;
  canCast: boolean;
  blocked?: boolean;
  allowTutorialOverride?: boolean;
  attackRange?: number;
  onHoverChange?: (spellId: string | null) => void;
}

export const SpellSelector: React.FC<SpellSelectorProps> = ({ onCast, canCast, blocked, allowTutorialOverride, onHoverChange }) => {
  const { state, equipSpell } = useGameStore();
  const { spells, equippedSpellIndex, spellCooldowns } = state;
  const [tooltipData, setTooltipData] = useState<{ spellId: string; position: { x: number; y: number } } | null>(null);
  const handleSelectSpell = (index: number) => {
    if (index < spells.length) {
      equipSpell(index);
      onCast(index);
    }
  };

  const handleSpellMouseEnter = (spellId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipData({
      spellId,
      position: { x: rect.left + rect.width / 2, y: rect.bottom }
    });
    onHoverChange?.(spellId);
  };

  const handleSpellMouseLeave = () => {
    setTooltipData(null);
    onHoverChange?.(null);
  };

  // Always show 5 slots
  const slots = Array.from({ length: 5 }, (_, i) => {
    const spellId = spells[i];
    const spell = spellId ? getSpellById(spellId) : null;
    const isEquipped = i === equippedSpellIndex;
    const isAvailable = i < spells.length;
    const cooldown = spellId ? (spellCooldowns[spellId] || 0) : 0;
    const isOnCooldown = cooldown > 0;

    const isDisabled = !isAvailable || ((!canCast && !allowTutorialOverride) || !!blocked || (isOnCooldown && !allowTutorialOverride));

    return (
      <button
        key={i}
        className={`spell-slot ${spell ? `rarity-${spell.rarity}` : ''} ${isEquipped ? 'equipped' : ''} ${!isAvailable ? 'disabled' : ''} ${isOnCooldown ? 'on-cooldown' : ''}`}
        onClick={() => handleSelectSpell(i)}
        disabled={isDisabled}
        onMouseEnter={(e) => spell && handleSpellMouseEnter(spell.id, e)}
        onMouseLeave={handleSpellMouseLeave}
      >
        {spell ? (
          <>
            {spell.imagePath ? (
              <img src={spell.imagePath} alt={spell.name} className="spell-icon" />
            ) : (
              <span className="spell-icon-text">✨</span>
            )}
            <span className="spell-name">{spell.name}</span>
            {isOnCooldown && <span className="cooldown-indicator">{cooldown}</span>}
          </>
        ) : (
          <span className="spell-empty">-</span>
        )}
      </button>
    );
  });

  return (
    <div className="spell-selector">
      <div className="spell-selector-label">Spells:</div>
      <div className="spell-slots">{slots}</div>
      
      {tooltipData && (
        <Tooltip
          content={{ type: 'spell', spellId: tooltipData.spellId }}
          position={tooltipData.position}
        />
      )}
    </div>
  );
};

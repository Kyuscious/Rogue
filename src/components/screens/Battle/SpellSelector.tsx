import React, { useState } from 'react';
import { useGameStore } from '../../../game/store';
import { getSpellById } from '../../../game/spells';
import { AbilityTooltip } from './AbilityTooltip';
import './SpellSelector.css';

interface SpellSelectorProps {
  onSelect?: () => void; // Called after switching spell
  attackRange?: number; // For tooltip display
}

export const SpellSelector: React.FC<SpellSelectorProps> = ({ onSelect, attackRange }) => {
  const { state, equipSpell } = useGameStore();
  const { spells, equippedSpellIndex, spellCooldowns } = state;  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    spellId: string | null;
    position: { x: number; y: number };
  }>({ visible: false, spellId: null, position: { x: 0, y: 0 } });
  const handleSelectSpell = (index: number) => {
    if (index < spells.length) {
      equipSpell(index);
      onSelect?.();
    }
  };

  // Always show 5 slots
  const slots = Array.from({ length: 5 }, (_, i) => {
    const spellId = spells[i];
    const spell = spellId ? getSpellById(spellId) : null;
    const isEquipped = i === equippedSpellIndex;
    const isAvailable = i < spells.length;
    const cooldown = spellId ? (spellCooldowns[spellId] || 0) : 0;
    const isOnCooldown = cooldown > 0;

    return (
      <button
        key={i}
        className={`spell-slot ${isEquipped ? 'equipped' : ''} ${!isAvailable ? 'disabled' : ''} ${isOnCooldown ? 'on-cooldown' : ''}`}
        onClick={() => handleSelectSpell(i)}
        disabled={!isAvailable}
        title={spell ? `${spell.name}${isOnCooldown ? ` (Cooldown: ${cooldown} turn${cooldown > 1 ? 's' : ''})` : ''}` : 'Empty Slot'}
        onMouseEnter={(e) => {
          if (spell) {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltipState({
              visible: true,
              spellId: spellId || null,
              position: { x: rect.left - 300, y: rect.top }
            });
          }
        }}
        onMouseLeave={() => setTooltipState({ visible: false, spellId: null, position: { x: 0, y: 0 } })}
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
    <>
      <div className="spell-selector">
        <div className="spell-selector-label">Spells:</div>
        <div className="spell-slots">{slots}</div>
      </div>
      {tooltipState.visible && tooltipState.spellId && (
        <AbilityTooltip
          spell={getSpellById(tooltipState.spellId)}
          attackRange={attackRange}
          position={tooltipState.position}
          visible={tooltipState.visible}
        />
      )}
    </>
  );
};

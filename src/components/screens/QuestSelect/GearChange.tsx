import React, { useState } from 'react';
import { useGameStore } from '../../../game/store';
import { getWeaponById } from '../../../game/weapons';
import { getSpellById } from '../../../game/spells';
import { getItemById } from '../../../game/items';
import './GearChange.css';

type EquipmentType = 'weapon' | 'spell' | 'item';

interface DragData {
  type: EquipmentType;
  id: string;
  sourceIndex?: number;
  sourceType: 'equipped' | 'inventory';
}

export const GearChange: React.FC = () => {
  const { state, equipWeapon, equipSpell, removeWeapon, removeSpell } = useGameStore();
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<DragData | null>(null);

  const overflowWeapons = state.weapons.slice(3);
  const overflowSpells = state.spells.slice(5);

  const consumableItems = state.inventory.filter(item => {
    const itemData = getItemById(item.itemId);
    return itemData?.consumable === true;
  });

  const equippedUsableItems = consumableItems.slice(0, 6);
  const overflowUsableItems = consumableItems.slice(6);

  const overflowInventory: Array<{ id: string; type: EquipmentType; quantity?: number; index?: number }> = [
    ...overflowWeapons.map((id, idx) => ({ id, type: 'weapon' as const, index: 3 + idx })),
    ...overflowSpells.map((id, idx) => ({ id, type: 'spell' as const, index: 5 + idx })),
    ...overflowUsableItems.map(item => ({ id: item.itemId, type: 'item' as const, quantity: item.quantity })),
  ];

  const handleDragStart = (e: React.DragEvent, data: DragData) => {
    setDraggedItem(data);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnEquipped = (e: React.DragEvent, slotIndex: number, equipType: EquipmentType) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.type !== equipType) return;

    if (draggedItem.sourceType === 'inventory') {
      if (equipType === 'weapon') equipWeapon(slotIndex);
      else if (equipType === 'spell') equipSpell(slotIndex);
    } else if (draggedItem.sourceType === 'equipped' && draggedItem.sourceIndex !== undefined) {
      if (equipType === 'weapon' && draggedItem.sourceIndex !== slotIndex) equipWeapon(slotIndex);
      else if (equipType === 'spell' && draggedItem.sourceIndex !== slotIndex) equipSpell(slotIndex);
    }

    setDraggedItem(null);
  };

  const handleDropOnInventory = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem) return;

    if (draggedItem.sourceType === 'equipped' && draggedItem.sourceIndex !== undefined) {
      if (draggedItem.type === 'weapon') removeWeapon(draggedItem.sourceIndex);
      else if (draggedItem.type === 'spell') removeSpell(draggedItem.sourceIndex);
    }

    setDraggedItem(null);
  };

  const renderEquippedWeapon = (index: number) => {
    const weaponId = state.weapons[index];
    const weapon = weaponId ? getWeaponById(weaponId) : null;

    return (
      <div
        key={`weapon-${index}`}
        className={`gear-slot weapon-slot ${hoveredSlot === `w-${index}` ? 'hovered' : ''}`}
        onMouseEnter={() => setHoveredSlot(`w-${index}`)}
        onMouseLeave={() => setHoveredSlot(null)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDropOnEquipped(e, index, 'weapon')}
      >
        {weapon ? (
          <>
            <img
              src={weapon.imagePath || ''}
              alt={weapon.name}
              draggable
              onDragStart={(e) => handleDragStart(e, { type: 'weapon', id: weaponId, sourceType: 'equipped', sourceIndex: index })}
            />
            <div className="slot-label">W{index + 1}</div>
          </>
        ) : (
          <div className="empty-slot">-</div>
        )}
      </div>
    );
  };

  const renderEquippedSpell = (index: number) => {
    const spellId = state.spells[index];
    const spell = spellId ? getSpellById(spellId) : null;

    return (
      <div
        key={`spell-${index}`}
        className={`gear-slot spell-slot ${hoveredSlot === `s-${index}` ? 'hovered' : ''}`}
        onMouseEnter={() => setHoveredSlot(`s-${index}`)}
        onMouseLeave={() => setHoveredSlot(null)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDropOnEquipped(e, index, 'spell')}
      >
        {spell ? (
          <>
            <img
              src={spell.imagePath || ''}
              alt={spell.name}
              draggable
              onDragStart={(e) => handleDragStart(e, { type: 'spell', id: spellId, sourceType: 'equipped', sourceIndex: index })}
            />
            <div className="slot-label">S{index + 1}</div>
          </>
        ) : (
          <div className="empty-slot">-</div>
        )}
      </div>
    );
  };

  const renderEquippedItem = (index: number) => {
    const item = equippedUsableItems[index];
    const itemData = item ? getItemById(item.itemId) : null;

    return (
      <div
        key={`item-${index}`}
        className={`gear-slot item-slot ${hoveredSlot === `i-${index}` ? 'hovered' : ''}`}
        onMouseEnter={() => setHoveredSlot(`i-${index}`)}
        onMouseLeave={() => setHoveredSlot(null)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDropOnEquipped(e, index, 'item')}
      >
        {itemData ? (
          <>
            <img
              src={itemData.imagePath || ''}
              alt={itemData.name}
              draggable
              onDragStart={(e) => handleDragStart(e, { type: 'item', id: item.itemId, sourceType: 'equipped', sourceIndex: index })}
            />
            {item.quantity > 1 && <div className="item-quantity">{item.quantity}</div>}
            <div className="slot-label">I{index + 1}</div>
          </>
        ) : (
          <div className="empty-slot">-</div>
        )}
      </div>
    );
  };

  const renderInventoryItem = (invItem: (typeof overflowInventory)[0]) => {
    let displayData: any = null;
    let icon = '?';

    if (invItem.type === 'weapon') {
      displayData = getWeaponById(invItem.id);
      icon = '⚔️';
    } else if (invItem.type === 'spell') {
      displayData = getSpellById(invItem.id);
      icon = '✨';
    } else if (invItem.type === 'item') {
      displayData = getItemById(invItem.id);
      icon = '🧪';
    }

    return (
      <div
        key={`inv-${invItem.type}-${invItem.id}`}
        className="inventory-item"
        draggable
        onDragStart={(e) => handleDragStart(e, { type: invItem.type, id: invItem.id, sourceType: 'inventory', sourceIndex: invItem.index })}
      >
        {displayData?.imagePath ? (
          <img src={displayData.imagePath} alt={displayData.name} />
        ) : (
          <span>{icon}</span>
        )}
        {invItem.quantity && invItem.quantity > 1 && (
          <div className="item-quantity">{invItem.quantity}</div>
        )}
      </div>
    );
  };

  return (
    <div className="gear-change">
      <div className="equipped-section">
        <div className="section-title">Equipped Weapons</div>
        <div className="gear-row">
          {Array.from({ length: 3 }).map((_, i) => renderEquippedWeapon(i))}
        </div>
      </div>

      <div className="equipped-section">
        <div className="section-title">Equipped Spells</div>
        <div className="gear-row">
          {Array.from({ length: 5 }).map((_, i) => renderEquippedSpell(i))}
        </div>
      </div>

      <div className="equipped-section">
        <div className="section-title">Equipped Items</div>
        <div className="gear-row">
          {Array.from({ length: 6 }).map((_, i) => renderEquippedItem(i))}
        </div>
      </div>

      <div className="inventory-section">
        <div className="section-title">Inventory</div>
        <div className="inventory-grid" onDragOver={handleDragOver} onDrop={handleDropOnInventory}>
          {overflowInventory.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666', padding: '20px', fontSize: '12px' }}>
              Drop items here
            </div>
          )}
          {overflowInventory.map(item => renderInventoryItem(item))}
        </div>
      </div>
    </div>
  );
};

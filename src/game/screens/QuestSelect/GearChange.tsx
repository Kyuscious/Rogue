import React, { useMemo, useState } from 'react';
import { useGameStore } from '@game/store';
import { getWeaponById } from '@data/weapons';
import { getSpellById } from '@data/spells';
import { getItemById } from '@data/items';
import { useTranslation } from '../../../hooks/useTranslation';
import { getWeaponName, getSpellName, getItemName } from '../../../i18n/helpers';
import { Tooltip } from '../../shared/Tooltip';
import './GearChange.css';

const MAX_WEAPON_SLOTS = 3;
const MAX_SPELL_SLOTS = 5;
const MAX_ITEM_SLOTS = 6;
const RARITY_ORDER = ['starter', 'common', 'epic', 'legendary', 'mythic', 'ultimate', 'exalted', 'transcendent'] as const;

type EquipmentType = 'weapon' | 'spell' | 'item';
type EquipmentData =
  | NonNullable<ReturnType<typeof getWeaponById>>
  | NonNullable<ReturnType<typeof getSpellById>>
  | NonNullable<ReturnType<typeof getItemById>>
  | null;

interface DragData {
  type: EquipmentType;
  sourceIndex: number;
}

interface GearEntry {
  id: string;
  sourceIndex: number;
  quantity?: number;
  data: EquipmentData;
}

const getRarityScore = (rarity?: string) => {
  const index = RARITY_ORDER.indexOf((rarity as (typeof RARITY_ORDER)[number]) || 'common');
  return index === -1 ? -1 : index;
};

const compareReserveEntries = (a: GearEntry, b: GearEntry) => {
  const rarityDifference = getRarityScore(b.data?.rarity) - getRarityScore(a.data?.rarity);
  if (rarityDifference !== 0) return rarityDifference;

  const nameA = (a.data?.name || a.id).toLowerCase();
  const nameB = (b.data?.name || b.id).toLowerCase();
  return nameA.localeCompare(nameB);
};

export const GearChange: React.FC = () => {
  const {
    state,
    reorderWeapons,
    reorderSpells,
    reorderConsumableItems,
  } = useGameStore();
  const t = useTranslation();

  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<DragData | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    type: 'weapon' | 'spell' | 'item' | null;
    id: string | null;
    position: { x: number; y: number };
  }>({ type: null, id: null, position: { x: 0, y: 0 } });

  const weaponEntries = useMemo<GearEntry[]>(
    () => state.weapons.map((id, index) => ({ id, sourceIndex: index, data: getWeaponById(id) ?? null })),
    [state.weapons]
  );

  const spellEntries = useMemo<GearEntry[]>(
    () => state.spells.map((id, index) => ({ id, sourceIndex: index, data: getSpellById(id) ?? null })),
    [state.spells]
  );

  const consumableEntries = useMemo<GearEntry[]>(
    () => {
      let consumableIndex = 0;

      return state.inventory.flatMap((entry) => {
        const itemData = getItemById(entry.itemId);
        if (!itemData?.consumable) return [];

        const nextEntry: GearEntry = {
          id: entry.itemId,
          sourceIndex: consumableIndex,
          quantity: entry.quantity,
          data: itemData,
        };

        consumableIndex += 1;
        return [nextEntry];
      });
    },
    [state.inventory]
  );

  const reserveWeapons = useMemo(() => [...weaponEntries.slice(MAX_WEAPON_SLOTS)].sort(compareReserveEntries), [weaponEntries]);
  const reserveSpells = useMemo(() => [...spellEntries.slice(MAX_SPELL_SLOTS)].sort(compareReserveEntries), [spellEntries]);
  const reserveItems = useMemo(() => [...consumableEntries.slice(MAX_ITEM_SLOTS)].sort(compareReserveEntries), [consumableEntries]);

  const handleItemMouseEnter = (e: React.MouseEvent<HTMLElement>, type: 'weapon' | 'spell' | 'item', id: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipData({
      type,
      id,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.bottom,
      },
    });
  };

  const handleItemMouseLeave = () => {
    setTooltipData({ type: null, id: null, position: { x: 0, y: 0 } });
  };

  const handleDragStart = (e: React.DragEvent<HTMLElement>, data: DragData) => {
    setDraggedItem(data);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(data));
  };

  const readDragData = (e: React.DragEvent<HTMLElement>): DragData | null => {
    if (draggedItem) return draggedItem;

    const rawData = e.dataTransfer.getData('text/plain');
    if (!rawData) return null;

    try {
      const parsed = JSON.parse(rawData) as Partial<DragData>;
      if (
        (parsed.type === 'weapon' || parsed.type === 'spell' || parsed.type === 'item') &&
        typeof parsed.sourceIndex === 'number'
      ) {
        return { type: parsed.type, sourceIndex: parsed.sourceIndex };
      }
    } catch {
      return null;
    }

    return null;
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const getMaxSlots = (type: EquipmentType) => {
    if (type === 'weapon') return MAX_WEAPON_SLOTS;
    if (type === 'spell') return MAX_SPELL_SLOTS;
    return MAX_ITEM_SLOTS;
  };

  const getTotalCount = (type: EquipmentType) => {
    if (type === 'weapon') return state.weapons.length;
    if (type === 'spell') return state.spells.length;
    return consumableEntries.length;
  };

  const moveEntry = (type: EquipmentType, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    if (type === 'weapon') {
      reorderWeapons(fromIndex, toIndex);
      return;
    }

    if (type === 'spell') {
      reorderSpells(fromIndex, toIndex);
      return;
    }

    reorderConsumableItems(fromIndex, toIndex);
  };

  const handleDropOnSlot = (e: React.DragEvent<HTMLElement>, slotIndex: number, type: EquipmentType) => {
    e.preventDefault();
    const dragData = readDragData(e);
    if (!dragData || dragData.type !== type) return;

    moveEntry(type, dragData.sourceIndex, slotIndex);
    setDraggedItem(null);
  };

  const handleDropOnReserve = (e: React.DragEvent<HTMLElement>, type: EquipmentType) => {
    e.preventDefault();
    const dragData = readDragData(e);
    if (!dragData || dragData.type !== type) return;

    const totalCount = getTotalCount(type);
    const maxSlots = getMaxSlots(type);

    if (dragData.sourceIndex < maxSlots && totalCount > maxSlots) {
      moveEntry(type, dragData.sourceIndex, totalCount - 1);
    }

    setDraggedItem(null);
  };

  const handleQuickMove = (type: EquipmentType, sourceIndex: number) => {
    const totalCount = getTotalCount(type);
    const maxSlots = getMaxSlots(type);

    if (sourceIndex < maxSlots) {
      if (totalCount > maxSlots) {
        moveEntry(type, sourceIndex, totalCount - 1);
      }
      return;
    }

    moveEntry(type, sourceIndex, maxSlots - 1);
  };

  const handleQuickMouseDown = (e: React.MouseEvent<HTMLElement>, type: EquipmentType, sourceIndex: number) => {
    if (e.button !== 2) return;

    e.preventDefault();
    e.stopPropagation();
    handleQuickMove(type, sourceIndex);
  };

  const getFallbackIcon = (type: EquipmentType) => {
    if (type === 'weapon') return '⚔️';
    if (type === 'spell') return '✨';
    return '🧪';
  };

  const getDisplayName = (type: EquipmentType, data: EquipmentData, id: string) => {
    if (!data) return id;
    if (type === 'weapon') return getWeaponName(data as NonNullable<ReturnType<typeof getWeaponById>>);
    if (type === 'spell') return getSpellName(data as NonNullable<ReturnType<typeof getSpellById>>);
    return getItemName(data as NonNullable<ReturnType<typeof getItemById>>);
  };

  const renderSlot = (type: EquipmentType, slotIndex: number, entry?: GearEntry) => {
    const slotKey = `${type}-${slotIndex}`;
    const rarityClass = entry?.data?.rarity ? `rarity-${entry.data.rarity}` : '';
    const slotPrefix = type === 'weapon' ? 'W' : type === 'spell' ? 'S' : 'I';
    const isActive = type === 'weapon'
      ? slotIndex === state.equippedWeaponIndex
      : type === 'spell'
      ? slotIndex === state.equippedSpellIndex
      : false;

    return (
      <div
        key={slotKey}
        className={`gear-slot ${type}-slot ${rarityClass} ${hoveredSlot === slotKey ? 'hovered' : ''} ${isActive ? 'active-loadout' : ''}`}
        draggable={Boolean(entry)}
        onDragStart={entry ? (e) => handleDragStart(e, { type, sourceIndex: entry.sourceIndex }) : undefined}
        onDragEnd={entry ? handleDragEnd : undefined}
        onMouseDown={entry ? (e) => handleQuickMouseDown(e, type, entry.sourceIndex) : undefined}
        onMouseEnter={(e) => {
          setHoveredSlot(slotKey);
          if (entry) {
            handleItemMouseEnter(e, type, entry.id);
          }
        }}
        onMouseLeave={() => {
          setHoveredSlot(null);
          handleItemMouseLeave();
        }}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDropOnSlot(e, slotIndex, type)}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
        title={entry ? 'Right-click to send to reserve' : 'Drag matching gear here'}
      >
        {entry ? (
          <>
            {entry.data?.imagePath ? (
              <img
                src={entry.data.imagePath}
                alt={getDisplayName(type, entry.data, entry.id)}
              />
            ) : (
              <span className="fallback-icon">{getFallbackIcon(type)}</span>
            )}
            {entry.quantity && entry.quantity > 1 && <div className="item-quantity">{entry.quantity}</div>}
            {isActive && <div className="active-indicator">Active</div>}
          </>
        ) : (
          <div className="empty-slot">-</div>
        )}
        <div className="slot-label">{slotPrefix}{slotIndex + 1}</div>
      </div>
    );
  };

  const renderReserveItem = (type: EquipmentType, entry: GearEntry) => {
    const displayName = getDisplayName(type, entry.data, entry.id);
    const isDragging = draggedItem?.type === type && draggedItem.sourceIndex === entry.sourceIndex;

    return (
      <button
        key={`${type}-${entry.id}-${entry.sourceIndex}`}
        type="button"
        className={`inventory-item ${entry.data?.rarity ? `rarity-${entry.data.rarity}` : ''} ${isDragging ? 'dragging' : ''}`}
        draggable
        onDragStart={(e) => handleDragStart(e, { type, sourceIndex: entry.sourceIndex })}
        onDragEnd={handleDragEnd}
        onMouseDown={(e) => handleQuickMouseDown(e, type, entry.sourceIndex)}
        onMouseEnter={(e) => handleItemMouseEnter(e, type, entry.id)}
        onMouseLeave={handleItemMouseLeave}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
        title="Right-click to equip instantly"
      >
        {entry.data?.imagePath ? <img src={entry.data.imagePath} alt={displayName} /> : <span>{getFallbackIcon(type)}</span>}
        {entry.quantity && entry.quantity > 1 && <div className="item-quantity">{entry.quantity}</div>}
        <span className="inventory-type-badge">{type === 'weapon' ? 'W' : type === 'spell' ? 'S' : 'I'}</span>
      </button>
    );
  };

  return (
    <div className="gear-change">
      <div className="equipped-section">
        <div className="section-title-row"><div className="section-title">Weapons</div></div>
        <div className="gear-row">
          {Array.from({ length: MAX_WEAPON_SLOTS }, (_, index) => renderSlot('weapon', index, weaponEntries[index]))}
        </div>
      </div>

      <div className="equipped-section">
        <div className="section-title-row"><div className="section-title">Spells</div></div>
        <div className="gear-row spells-row">
          {Array.from({ length: MAX_SPELL_SLOTS }, (_, index) => renderSlot('spell', index, spellEntries[index]))}
        </div>
      </div>

      <div className="equipped-section">
        <div className="section-title-row"><div className="section-title">Consumables</div></div>
        <div className="gear-row items-row">
          {Array.from({ length: MAX_ITEM_SLOTS }, (_, index) => renderSlot('item', index, consumableEntries[index]))}
        </div>
      </div>

      <div className="inventory-section">
        <div className="section-title-row inventory-header-minimal">
          <div className="section-title">{t.gearChange.inventory}</div>
        </div>

        <div className="inventory-subsection">
          <div className="section-title">Reserve Weapons</div>
          <div className="inventory-grid" onDragOver={handleDragOver} onDrop={(e) => handleDropOnReserve(e, 'weapon')}>
            {reserveWeapons.length === 0 ? <div className="inventory-empty">—</div> : reserveWeapons.map((entry) => renderReserveItem('weapon', entry))}
          </div>
        </div>

        <div className="inventory-subsection">
          <div className="section-title">Reserve Spells</div>
          <div className="inventory-grid" onDragOver={handleDragOver} onDrop={(e) => handleDropOnReserve(e, 'spell')}>
            {reserveSpells.length === 0 ? <div className="inventory-empty">—</div> : reserveSpells.map((entry) => renderReserveItem('spell', entry))}
          </div>
        </div>

        <div className="inventory-subsection">
          <div className="section-title">Reserve Consumables</div>
          <div className="inventory-grid" onDragOver={handleDragOver} onDrop={(e) => handleDropOnReserve(e, 'item')}>
            {reserveItems.length === 0 ? <div className="inventory-empty">—</div> : reserveItems.map((entry) => renderReserveItem('item', entry))}
          </div>
        </div>
      </div>

      {tooltipData.type && tooltipData.id && (
        <Tooltip
          position={tooltipData.position}
          content={{
            type: tooltipData.type,
            weaponId: tooltipData.type === 'weapon' ? tooltipData.id : undefined,
            spellId: tooltipData.type === 'spell' ? tooltipData.id : undefined,
            itemId: tooltipData.type === 'item' ? tooltipData.id : undefined,
          }}
        />
      )}
    </div>
  );
};

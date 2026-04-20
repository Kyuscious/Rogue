# Loadout And Drops System

**Status:** ✅ Implemented for enemy spell drops and enemy spell loadouts
**Last Updated:** April 18, 2026

---

## Overview

Enemies can now carry their own combat equipment and reward the player with usable run equipment after defeat.

This system is shared across:
- **Weapons**
- **Spells**
- **Future enemy-specific loot tables**

The long-term goal is that equipment can come from several sources:
- enemy drops
- starter loadouts
- events
- achievements/unlocks
- special rewards

Not every weapon or spell has to belong to an enemy.

---

## Enemy Loadouts

Each enemy can define an optional loadout on its character data.

Current shape:

```ts
enemyLoadout: {
  weapons: string[];
  spells: string[];
  items: string[];
  equippedWeaponIndex: number;
  equippedSpellIndex: number;
}
```

### Current behavior
- Enemies may carry up to **2 weapons**
- Enemies may carry up to **3 spells**
- Enemies may carry up to **1 consumable item**
- If an enemy has no custom loadout, the fallback is the default test loadout

---

## Enemy Drops

Enemies can now define guaranteed or chance-based drop metadata directly on the character.

```ts
lootDrops: {
  weapons?: Array<{ weaponId: string; chance: number }>;
  spells?: Array<{ spellId: string; chance: number }>;
  items?: Array<{ itemId: string; chance: number; quantity?: number }>;
}
```

### Rules
- A chance of **1** means a guaranteed drop
- Dropped **weapons** are added to the player's run weapon collection
- Dropped **spells** are added to the player's run spell collection
- Standard item loot still works alongside this system

---

## Player Run Equipment Flow

### Spells
Dropped spells are added to the player's current run spell list.

That means the player can:
- equip them during the run
- swap between them in battle
- keep their starter spell while adding new ones
- later support selling/merging/build modification flows

### Weapons
Weapons are intended to follow the exact same pattern:
- drop from enemies or other sources
- enter the player's run weapon pool
- become equippable in combat
- later support sell / merge / modification systems

---

## First Implemented Example

### Garen
Garen now demonstrates the system with:
- a custom enemy spell loadout
- access to **Test Spell** as a generic damaging placeholder
- access to **For Demacia!** as a self-buff
- access to **Demacian Justice** as his legendary execute spell
- a **100% Demacian Justice drop** on defeat

This makes Garen the first enemy using the lootable-spell pipeline.

---

## Notes For Future Content

When adding a new enemy with unique gear:

1. Define the enemy's combat loadout
2. Add guaranteed or chance-based weapon/spell drops
3. Ensure the dropped equipment exists in the relevant database
4. Verify the player can see and equip the reward during the run
5. Document any special acquisition rules if the equipment does **not** come from an enemy

---

## Related Files

- src/game/types.ts
- src/game/enemyAI.ts
- src/game/battleFlow.ts
- src/game/regions/demacia/enemies.ts
- src/components/screens/Battle/Battle.tsx

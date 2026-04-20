# Index Guide

**STATUS:** ✅ DONE  
**LAST UPDATED:** April 17, 2026

## Purpose

The Game Index is the player-facing codex for long-term profile knowledge. It is intentionally **profile-based**, meaning entries are revealed as the active profile discovers or uses content over time.

---

## Current Tabs

| Tab | Purpose | Reveal Rule |
|---|---|---|
| Achievements | Show profile achievement progress | Always visible, but may be disabled on unlock-all profiles |
| Enemies | Show enemy roster and stats | Reveal after the enemy has been defeated on that profile; supports search and grouping by faction, region, class, or tier |
| Items | Show item compendium | Reveal after the item has been discovered on that profile; supports search and grouping by rarity or loot type |
| Weapons | Show all weapon entries | Reveal only after the player has successfully used that weapon in battle on that profile; supports search and grouping by rarity, region of origin, or effect type |
| Spells | Show all spell entries | Reveal only after the player has successfully cast that spell in battle on that profile; supports search and grouping by rarity, region of origin, or effect type |
| Regions | Show travel, quests, and shop knowledge | Reveal through normal profile exploration data |
| Miscellaneous | Reserved for future systems | Currently empty by design |

---

## Discovery Rules

### 1. Profile-first visibility
All index progress is tied to the **active profile**. Unlocking or discovering something on one profile should not automatically reveal it for another profile.

### 2. Hidden-by-default entries
Undiscovered entries should still appear in the index structure, but their identity/details remain hidden as:
- `???`
- muted/obscured card styling
- a short hint explaining how to reveal the entry

This keeps the codex complete without spoiling details too early.

### 3. Weapons
A weapon becomes visible in the index only after the player **uses it in battle** on that profile.

Tracked in profile stats:
- `discoveredWeapons: string[]`

### 4. Spells
A spell becomes visible in the index only after the player **casts it in battle** on that profile.

Tracked in profile stats:
- `discoveredSpells: string[]`

### 5. Items
Items are tracked through the existing discovery flow when they are obtained/revealed by gameplay.

Tracked in profile stats:
- `itemsDiscovered: string[]`

### 6. Enemies
Enemies are revealed after the active profile defeats them in battle and remain hidden otherwise.

Tracked in profile stats:
- `discoveredEnemies: string[]`

### 7. Enemy browsing controls
The enemy tab supports the following browsing tools:
- text search for already-discovered enemies
- grouping by faction
- grouping by region
- grouping by class, including future multi-class enemies
- grouping by tier

### 8. Item browsing controls
The item tab supports the following browsing tools:
- text search for already-discovered items
- grouping by rarity
- grouping by loot type such as Mixed, Physical, Tank, Magical, Mobility, Utility, and Consumable

### 9. Weapon and spell browsing controls
The weapon and spell tabs support the following browsing tools:
- text search for already-discovered entries
- grouping by rarity
- grouping by region of origin
- grouping by effect type, using the `effects[].type` values defined on each weapon or spell

Weapon and spell entries may expose an origin line in the index once discovered.
The type-based groups are data-driven, so if a new effect type is added later it should automatically appear in the Index grouping.

---

## Implementation Notes

Primary files involved:
- [src/components/screens/Index/Index.tsx](../src/components/screens/Index/Index.tsx)
- [src/game/profileSystem.ts](../src/game/profileSystem.ts)
- [src/components/screens/Battle/Battle.tsx](../src/components/screens/Battle/Battle.tsx)
- [RARITY_VISUAL_GUIDE.md](RARITY_VISUAL_GUIDE.md)

### Source of truth
- The UI should read discovery state from `profileSystem.ts`
- Battle usage is responsible for revealing weapons/spells
- New categories added to the index must define their reveal rule before being exposed in the UI
- Weapons and spells should define an optional `originRegion` metadata field in their database entries so the index can group them by regional origin
- Weapon/spell type grouping should read directly from each entry's `effects[].type` values rather than from a hardcoded list whenever possible

---

## Rules for Future Additions

When adding a new index category:

1. Decide which tab it belongs in
2. Define exactly **what gameplay action reveals it**
3. Store that reveal state on the profile
4. Hide undiscovered details until the reveal condition is met
5. Update this guide if the discovery rules change

If a new category does not fit existing tabs, place it in **Miscellaneous** until a dedicated section is justified.

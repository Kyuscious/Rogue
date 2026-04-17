# Rarity Visual Guide

**STATUS:** ✅ DONE  
**LAST UPDATED:** April 17, 2026

## Purpose

This guide defines the visual language for rarity across the game UI so items, weapons, and spells remain instantly readable wherever their icons or cards are shown.

---

## Core Rule

If a UI element displays an item, weapon, or spell icon or card, it should also display:
- a rarity-colored border
- a lightly tinted rarity-colored background
- the same palette used everywhere else in the project

This applies to:
- inventory slots
- item bars
- action bars
- gear/loadout selectors
- shop and build screens
- index/codex entries
- tooltips and rarity badges

---

## Approved Palette

| Rarity | Hex |
|---|---|
| Starter | #0f4c81 |
| Common | #22c55e |
| Epic | #7dd3fc |
| Legendary | #ef4444 |
| Mythic | #a855f7 |
| Ultimate | #f97316 |
| Exalted | #fbbf24 |
| Transcendent | #f8fafc |

---

## Styling Convention

Preferred pattern:
- add a class in the format `rarity-<rarity>`
- style that class with the approved border/background palette
- keep hover states consistent by slightly increasing brightness instead of changing to unrelated colors

Avoid:
- neutral grey borders on rarity-bearing content
- screen-specific custom rarity palettes
- hiding rarity color in one UI while showing it in another

---

## Weapons and Spells: Region of Origin

Weapons and spells may define an optional metadata field:
- `originRegion?: Region`

Use this to:
- show an origin line in the Index
- group weapons/spells by region of origin
- support future content browsing and regional flavor

When adding new weapon or spell content, set `originRegion` whenever the regional source is known.

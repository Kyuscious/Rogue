# Familiar System

**Status:** ✅ Initial implementation live
**Last Updated:** April 19, 2026

---

## Overview

Familiars are passive companion units that join the player's run and act automatically in battle.

They are designed to sit between gear and team systems:

- **Not manually cast or selected** like spells and weapons
- **Managed from the path / quest selection loadout screen**
- **Displayed as separate ally status cards** in battle
- **Triggered automatically on their own cadence** every few turns

---

## Core Rules

### Active slots
- The first **4 familiars** in the player's familiar roster are considered **active**.
- Additional familiars stay in **reserve** and can be reordered from the loadout panel.

### Battle behavior
Each active familiar:
- has its own stats
- has its own health pool and health bar
- automatically triggers one signature action
- acts on its own interval, modified by its speed and haste

### Current action types
- **Physical strike**
- **Magic bolt**
- **Healing pulse**
- **Protective ward / shielding**

---

## Current Familiars

| Familiar | Role | Action |
|----------|------|--------|
| Star Guardian Dango | Physical harasser | Deals recurring physical damage |
| Nixie | Heals the player every few turns |
| Cosmic Squink | Magic striker | Deals recurring magic damage |
| Paddlemar | Defender | Grants shield-style sustain and armor support |

---

## Obtaining Familiars

Familiars are intended to be obtained from multiple sources, with a strong emphasis on **events**.

### Currently supported
- **Event rewards**
- **Battle/drop infrastructure support** for future familiar rewards
- **Roster persistence in the run state**

---

## UI Integration

### Quest / Path Selection
- Team panel on the left now shows the player and any active familiars.
- Familiar loadout slots are managed alongside gear.

### Battle
- Familiar status cards appear in the player team area.
- Each familiar shows:
  - name
  - title
  - health bar
  - signature effect
  - core combat stats
  - next activation timing

---

## Extension Notes

Future expansion points:
- enemy attacks directly targeting familiars
- more familiar rarities and regions
- dedicated familiar event chains
- familiar-only upgrade and evolution systems
- codex / index discovery pages for familiars

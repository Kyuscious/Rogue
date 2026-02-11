# Post-Encounter System - Quick Reference

**STATUS:** ✅ DONE - Quick reference guide  
**LAST UPDATED:** February 10, 2026  
**NOTE:** This doc may be consolidated into POST_ENCOUNTER_SYSTEM.md. See DOCS_INDEX.md.

## What Was Added

### Game Logic Files (4)
1. **eventSystem.ts** - Region-based event registry and types
2. **restSystem.ts** - Recovery/rest mechanics
3. **postEncounterRewards.ts** - Loot and encounter state management
4. **buildModificationSystem.ts** - Class/stat/item modification (mostly placeholders for expansion)

### Event Files (3)
1. **regions/demacia/events.ts** - 6 Demacia-specific events
2. **regions/marai_territory/events.ts** - 6 Marai-specific events
3. **regions/ice_sea/events.ts** - 6 Ice Sea-specific events

### UI Components (3)
1. **LootSelectionScreen.tsx** - Choose 1 item from boss loot
2. **PostEncounterScreen.tsx** - Choose between Rest / Modify Build / Random Event
3. **BuildModificationScreen.tsx** - Change class, manage items, modify stats

### Styles (3)
1. **LootSelectionScreen.css** - Golden theme with grid layout
2. **PostEncounterScreen.css** - Color-coded choices (green/orange/yellow)
3. **BuildModificationScreen.css** - Tabbed interface with responsive design

### Documentation (1)
1. **POST_ENCOUNTER_SYSTEM.md** - Complete system documentation

---

## The Flow

```
┌─────────────────────────────────────────┐
│  Player defeats boss/final encounter    │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  Loot Selection Screen                  │
│  • Choose 1 item from boss loot         │
│  • View character preview               │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────────────────────┐
│  Post-Encounter Choice Screen (3 options)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🛌 REST                  ⚙️ MODIFY BUILD    🎲 RANDOM EVENT    │
│  • Restore 50% HP         • Change class      • Region event    │
│  • Remove debuffs         • Manage items      • Treasure        │
│  • Refill items           • Modify stats      • Encounter       │
│                                              • Relic/Buff       │
│                                              • Mystery          │
│                                                                  │
└──────────┬───────────────────────┬─────────────────────────┬────┘
           │                       │                         │
           ↓                       ↓                         ↓
    ┌────────────────┐     ┌──────────────┐         ┌──────────────┐
    │ Apply rest:    │     │ Build mod UI:│         │ Event outcome│
    │ • HP restored  │     │ • Class tab  │         │ • Apply      │
    │ • Debuffs gone │     │ • Items tab  │         │   rewards    │
    │ • Continue →   │     │ • Stats tab  │         │ • Add items  │
    │                │     │ • Confirm/   │         │ • Gold gain  │
    │                │     │   cancel     │         │ • Stat buff  │
    └────────────────┘     └──────────────┘         │ • Curse?     │
           │                       │                 └──────────────┘
           └───────────┬───────────┘                       │
                       │                                   │
                       ↓                                   │
                ┌─────────────────┐                       │
                │  Continue →     │◄──────────────────────┘
                │  • Next quest   │
                │  • Region select│
                │  • Floor prog   │
                └─────────────────┘
```

---

## Region Events (18 total)

### Demacia (6)
- Petricite Crystal Discovery
- Royal Emissary
- Garen's Challenge
- Ancient Vault Uncovered
- Divine Boon
- Cursed Plate Armor

### Marai (6)
- Coral Treasure Cache
- Siren's Blessing
- Deep Guardian's Trial
- Leviathan's Whisper
- Pearl of Wisdom
- Cursed Shell Armor

### Ice Sea (6)
- Frozen Treasure Vault
- Eternal Winter's Blessing
- Frostborn Champion's Trial
- Glacial Artifacts Discovery
- Blizzard Spirits' Gift
- Cursed Frostbite Weapon

---

## Key Features

✅ **Loot Selection** - Choose items from defeated bosses
✅ **Rest System** - Recover HP, remove debuffs
✅ **Region Events** - 18 unique events across 3 regions
✅ **Build Modification** - Framework for class changes and stat management
✅ **Color-Coded UI** - Green (rest), Orange (build), Yellow (events)
✅ **Placeholder Structure** - Ready for stat respec, curse removal, and more

---

## Remaining TODO Items

| Priority | Task | Location |
|----------|------|----------|
| 🔴 High | Integrate with battle system | Game flow |
| 🔴 High | Implement class change logic | buildModificationSystem.ts |
| 🔴 High | Add event outcome screen | New component |
| 🟡 Medium | Stat respec system | BuildModificationScreen |
| 🟡 Medium | Curse removal mechanics | buildModificationSystem.ts |
| 🟢 Low | More region events | regions/*/events.ts |
| 🟢 Low | Event animations | Components |

---

## Quick Integration Checklist

When integrating into game flow:
- [ ] Import LootSelectionScreen in battle/quest component
- [ ] Import PostEncounterScreen in battle/quest component
- [ ] Import BuildModificationScreen in post-encounter component
- [ ] Call `performRest()` when player chooses rest
- [ ] Call `getRandomEventForRegion()` for event selection
- [ ] Hook up Build UI to actually modify character stats
- [ ] Add event outcome feedback to player
- [ ] Test all three paths with actual gameplay


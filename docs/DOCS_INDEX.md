# Documentation Index

**Last Updated:** February 10, 2026

## Status Legend
- ✅ **DONE** - Feature fully implemented and documented
- 🚧 **WIP** - Work in progress, actively being developed
- 📋 **PH** - Placeholder, planned for future implementation
- 🗃️ **ARCH** - Archived, replaced or obsolete

---

## Core Game Systems

### Combat & Mechanics
| Document | Status | Description |
|----------|--------|-------------|
| [combat-formulas.md](combat-formulas.md) | ✅ DONE | Damage calculation, armor reduction, lifesteal, crit formulas |
| [TIMING_SYSTEM.md](TIMING_SYSTEM.md) | ✅ DONE | Hybrid timing model - instant effects vs duration effects |
| [DIFFICULTY_SCALING.md](DIFFICULTY_SCALING.md) | 🚧 WIP | Enemy scaling, region tiers, revisit penalty (planned) |
| [STUN_IMPLEMENTATION_GUIDE.md](STUN_IMPLEMENTATION_GUIDE.md) | 📋 PH | Stun mechanics, Shield of Daybreak, Dazzle spell (next priority) |

### Passive System (Currently Being Refactored)
| Document | Status | Description |
|----------|--------|-------------|
| [PASSIVE_SYSTEM_REFACTOR.md](PASSIVE_SYSTEM_REFACTOR.md) | 🚧 WIP | Architecture plan for event-driven passive system |
| [PASSIVE_INTEGRATION_GUIDE.md](PASSIVE_INTEGRATION_GUIDE.md) | 🚧 WIP | Step-by-step integration guide for Battle.tsx |
| [PASSIVE_REFACTOR_SUMMARY.md](PASSIVE_REFACTOR_SUMMARY.md) | 🚧 WIP | Quick reference for new passive system |
| **Note:** Hardcoded passives still in Battle.tsx (lines 802, 1149, 1540+). Refactor in progress. |

### Items & Equipment
| Document | Status | Description |
|----------|--------|-------------|
| [DARK_SEAL_IMPLEMENTATION.md](DARK_SEAL_IMPLEMENTATION.md) | ✅ DONE | Dark Seal + Mejai's upgrade system, Glory passive |
| [IMMOLATE_PASSIVE_GUIDE.md](IMMOLATE_PASSIVE_GUIDE.md) | ✅ DONE | Bami's Cinder burn mechanics |
| [IMMOLATE_IMPLEMENTATION_SUMMARY.md](IMMOLATE_IMPLEMENTATION_SUMMARY.md) | ✅ DONE | Immolate integration summary |
| [DELVERHOLD_GREATEAXE.md](DELVERHOLD_GREATEAXE.md) | ✅ DONE | Example: Hemorrhage stacking DoT weapon |
| [UNLOCKABLES.md](UNLOCKABLES.md) | ✅ DONE | Profile unlock system for starter items |

### Post-Encounter System
| Document | Status | Description |
|----------|--------|-------------|
| [POST_ENCOUNTER_SYSTEM.md](POST_ENCOUNTER_SYSTEM.md) | ✅ DONE | Comprehensive system documentation (unified) |

**Note:** Previously had 3 separate docs (SYSTEM, IMPLEMENTATION, QUICK_REF). Consider unifying into single doc.

### Events & Rewards
| Document | Status | Description |
|----------|--------|-------------|
| [EVENT_WEIGHT_SYSTEM.md](EVENT_WEIGHT_SYSTEM.md) | ✅ DONE | Weighted random event selection, Runeterra universal events |

### Asset Management
| Document | Status | Description |
|----------|--------|-------------|
| [ASSET_LOADING.md](ASSET_LOADING.md) | ✅ DONE | Region-based asset loading system |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | ✅ DONE | Asset loading implementation details |

### UI/UX
| Document | Status | Description |
|----------|--------|-------------|
| [VIEWPORT_SCROLLING_FIX.md](VIEWPORT_SCROLLING_FIX.md) | ✅ DONE | Global CSS reset, viewport height fixes |

### Content Creation
| Document | Status | Description |
|----------|--------|-------------|
| [CONTENT_INTEGRATION_GUIDE.md](CONTENT_INTEGRATION_GUIDE.md) | ✅ DONE | Step-by-step guide for adding items, characters, regions |

---

## Proposed Reorganization

Consider creating subfolders for better organization as documentation grows:

```
docs/
├── DOCS_INDEX.md (this file)
├── systems/
│   ├── combat/
│   │   ├── combat-formulas.md
│   │   ├── TIMING_SYSTEM.md
│   │   ├── DIFFICULTY_SCALING.md
│   │   └── STUN_IMPLEMENTATION_GUIDE.md
│   ├── passive/
│   │   ├── PASSIVE_SYSTEM_REFACTOR.md
│   │   ├── PASSIVE_INTEGRATION_GUIDE.md
│   │   └── PASSIVE_REFACTOR_SUMMARY.md
│   └── events/
│       └── EVENT_WEIGHT_SYSTEM.md
├── items/
│   ├── DARK_SEAL_IMPLEMENTATION.md
│   ├── IMMOLATE_PASSIVE_GUIDE.md
│   ├── DELVERHOLD_GREATEAXE.md
│   └── UNLOCKABLES.md
├── features/
│   ├── POST_ENCOUNTER_SYSTEM.md
│   ├── ASSET_LOADING.md
│   └── VIEWPORT_SCROLLING_FIX.md
└── guides/
    └── CONTENT_INTEGRATION_GUIDE.md
```

---

## Quick Access by Task

### I want to add...
- **New item** → [CONTENT_INTEGRATION_GUIDE.md](CONTENT_INTEGRATION_GUIDE.md) (Section 1)
- **New character** → [CONTENT_INTEGRATION_GUIDE.md](CONTENT_INTEGRATION_GUIDE.md) (Section 2)
- **New passive** → [PASSIVE_INTEGRATION_GUIDE.md](PASSIVE_INTEGRATION_GUIDE.md) (WIP - check after refactor)
- **New region** → [CONTENT_INTEGRATION_GUIDE.md](CONTENT_INTEGRATION_GUIDE.md) (Section 4)

### I need to understand...
- **Combat damage** → [combat-formulas.md](combat-formulas.md)
- **Turn timing** → [TIMING_SYSTEM.md](TIMING_SYSTEM.md)
- **How buffs work** → [TIMING_SYSTEM.md](TIMING_SYSTEM.md) + [PASSIVE_SYSTEM_REFACTOR.md](PASSIVE_SYSTEM_REFACTOR.md)
- **Item unlocks** → [UNLOCKABLES.md](UNLOCKABLES.md)

### I'm fixing a bug in...
- **Battle system** → Check [combat-formulas.md](combat-formulas.md) + [TIMING_SYSTEM.md](TIMING_SYSTEM.md)
- **Passive effects** → [PASSIVE_INTEGRATION_GUIDE.md](PASSIVE_INTEGRATION_GUIDE.md) (note: refactor in progress)
- **Post-battle rewards** → [POST_ENCOUNTER_SYSTEM.md](POST_ENCOUNTER_SYSTEM.md)

---

## Active Development

**Current Focus:** Passive system refactor
- New event-driven system designed ✅
- Integration into Battle.tsx pending 🚧
- Hardcoded passives still present (to be removed)

**Next Priority:** Stun mechanics implementation

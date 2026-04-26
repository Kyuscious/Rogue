# Documentation Index

**Last Updated:** April 24, 2026

This index reflects the new category-first documentation structure. The docs root now stays intentionally minimal: the index, the reorganization proposal, and the main subfolders.

## Status Legend
- ✅ **DONE** - Feature fully implemented and documented
- 🚧 **WIP** - Work in progress, actively being developed
- 📋 **PH** - Placeholder, planned for future implementation
- 🗃️ **ARCH** - Archived, replaced, or superseded

---

## Core Documentation

### Systems - Combat & Mechanics
| Document | Status | Description |
|----------|--------|-------------|
| [systems/combat/formulas.md](systems/combat/formulas.md) | ✅ DONE | Damage calculation, armor reduction, lifesteal, and crit formulas |
| [systems/combat/timing-system.md](systems/combat/timing-system.md) | ✅ DONE | Hybrid timing model for instant vs duration effects |
| [systems/combat/difficulty-scaling.md](systems/combat/difficulty-scaling.md) | 🚧 WIP | Enemy scaling, region tiers, and revisit penalty notes |
| [systems/combat/stun-mechanics.md](systems/combat/stun-mechanics.md) | 📋 PH | Stun behavior, Shield of Daybreak, and Dazzle notes |
| [systems/combat/TARGETING_SYSTEM.md](systems/combat/TARGETING_SYSTEM.md) | ✅ DONE | Target selection rules for multi-enemy fights, familiars, and summons |
| [systems/combat/position-based-targeting.md](systems/combat/position-based-targeting.md) | 🚧 WIP | Slot-based frontline/backline targeting and action-hover preview rules |
| [systems/combat/enemy-ai-system.md](systems/combat/enemy-ai-system.md) | ✅ DONE | Behavior profiles, action legality, and enemy decision logic |

### Systems - Passive, Loot, Events & Unlocks
| Document | Status | Description |
|----------|--------|-------------|
| [systems/passive/architecture.md](systems/passive/architecture.md) | 🚧 WIP | Event-driven passive-system architecture plan |
| [systems/passive/integration-guide.md](systems/passive/integration-guide.md) | 🚧 WIP | Step-by-step migration guide for battle integration |
| [systems/events/event-weight-system.md](systems/events/event-weight-system.md) | ✅ DONE | Weighted random event selection and universal event rules |
| [systems/unlocks/profile-unlocks.md](systems/unlocks/profile-unlocks.md) | ✅ DONE | Profile unlock system for starters and progression items |
| [systems/loot/loadout-and-drops-system.md](systems/loot/loadout-and-drops-system.md) | ✅ DONE | Equipment loadouts, drop flow, and run reward handling |
| [systems/loot/loot-system-reference.md](systems/loot/loot-system-reference.md) | ✅ DONE | Rarity pools, path filtering, and loot rules |
| [systems/loot/loot-fixes-summary.md](systems/loot/loot-fixes-summary.md) | ✅ DONE | Known fixes and follow-up notes for the loot pipeline |
| [systems/familiars/FAMILIAR_SYSTEM.md](systems/familiars/FAMILIAR_SYSTEM.md) | ✅ DONE | Companion roster, active slots, battle cadence, and acquisition |

### Items & Equipment
| Document | Status | Description |
|----------|--------|-------------|
| [items/dark-seal.md](items/dark-seal.md) | ✅ DONE | Unified Dark Seal and Mejai's upgrade-path reference |
| [items/bamis-cinder.md](items/bamis-cinder.md) | ✅ DONE | Unified Immolate / burn stacking reference |
| [items/delverhold-greateaxe.md](items/delverhold-greateaxe.md) | ✅ DONE | Example bleed/stacking weapon reference |

### Player-Facing Features
| Document | Status | Description |
|----------|--------|-------------|
| [features/post-encounter.md](features/post-encounter.md) | ✅ DONE | Unified post-encounter reward and choice flow reference |
| [features/travelling.md](features/travelling.md) | ✅ DONE | Region-to-region travel flow, adjacency rules, and revisit scaling |
| [features/asset-loading.md](features/asset-loading.md) | ✅ DONE | Region-based asset loading and loading-screen flow |
| [features/loot-preview.md](features/loot-preview.md) | ✅ DONE | Loot preview and smart reroll feature overview |
| [features/battle-flee.md](features/battle-flee.md) | ✅ DONE | Battlefield bounds, flee flow, and no-reward handling |
| [features/battle-log.md](features/battle-log.md) | ✅ DONE | Battle log behavior, display guidance, and event messaging |
| [features/battle-visuals.md](features/battle-visuals.md) | 🚧 WIP | Centered battlefield plus 10-slot formation visuals and entity card hierarchy |
| [features/viewport-scrolling.md](features/viewport-scrolling.md) | ✅ DONE | Viewport and CSS scrolling fixes |

### Guides & Visual References
| Document | Status | Description |
|----------|--------|-------------|
| [guides/content-integration.md](guides/content-integration.md) | ✅ DONE | Step-by-step guide for adding items, characters, and regions |
| [guides/index-guide.md](guides/index-guide.md) | ✅ DONE | Index tabs, discovery rules, and codex visibility behavior |
| [guides/rarity-visual-guide.md](guides/rarity-visual-guide.md) | ✅ DONE | Rarity palette, borders, and origin metadata conventions |
| [guides/project-structure.md](guides/project-structure.md) | ✅ DONE | Feature-first folder ownership and refactor conventions |

---

## Documentation Layout

```text
docs/
├── DOCS_INDEX.md
├── DOCS_REORGANIZATION_PROPOSAL.md
├── features/
├── guides/
├── items/
└── systems/
    ├── combat/
    ├── events/
    ├── familiars/
    ├── loot/
    ├── passive/
    └── unlocks/
```

---

## Quick Access by Task

### I want to add...
- **New item** → [guides/content-integration.md](guides/content-integration.md)
- **New familiar** → [systems/familiars/FAMILIAR_SYSTEM.md](systems/familiars/FAMILIAR_SYSTEM.md)
- **New character** → [guides/content-integration.md](guides/content-integration.md)
- **New passive** → [systems/passive/integration-guide.md](systems/passive/integration-guide.md)
- **New region** → [guides/content-integration.md](guides/content-integration.md)

### I need to understand...
- **Combat damage** → [systems/combat/formulas.md](systems/combat/formulas.md)
- **Turn timing** → [systems/combat/timing-system.md](systems/combat/timing-system.md)
- **How targeting works** → [systems/combat/TARGETING_SYSTEM.md](systems/combat/TARGETING_SYSTEM.md)
- **How buffs work** → [systems/combat/timing-system.md](systems/combat/timing-system.md) + [systems/passive/architecture.md](systems/passive/architecture.md)
- **How loot works** → [systems/loot/loot-system-reference.md](systems/loot/loot-system-reference.md)
- **Item unlocks** → [systems/unlocks/profile-unlocks.md](systems/unlocks/profile-unlocks.md)
- **Index / codex rules** → [guides/index-guide.md](guides/index-guide.md)

### I'm fixing a bug in...
- **Battle system** → [systems/combat/formulas.md](systems/combat/formulas.md) + [systems/combat/timing-system.md](systems/combat/timing-system.md)
- **Passive effects** → [systems/passive/integration-guide.md](systems/passive/integration-guide.md)
- **Post-battle rewards** → [features/post-encounter.md](features/post-encounter.md)
- **Reward previews** → [features/loot-preview.md](features/loot-preview.md)

---

## Active Development

**Current Focus:** Multi-enemy combat polish, familiars, and passive cleanup
- Familiar roster, team slots, event rewards, and battle cadence implemented ✅
- Multi-enemy targeting foundation is in place ✅
- Hardcoded passive cleanup is still ongoing 🚧
- Documentation has now been reorganized and deduplicated ✅

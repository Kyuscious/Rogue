# Documentation Reorganization Proposal

**STATUS:** 📋 PH - Proposed structure for future reorganization  
**LAST UPDATED:** February 10, 2026

## Current Status Summary

✅ **DONE:**
- All docs now have status headers (✅ DONE, 🚧 WIP, 📋 PH)
- Created master DOCS_INDEX.md with quick navigation
- Clarified fractional duration behavior in TIMING_SYSTEM.md
- Identified hardcoded passives still in Battle.tsx (lines 802, 1149, 1540+)
- Marked STUN_IMPLEMENTATION_GUIDE.md as 📋 PLANNED (next priority)

## Issues Found

### 1. Documentation Redundancy
Some features have multiple docs:
- **Post-Encounter:** 3 files (SYSTEM, IMPLEMENTATION, QUICK_REF)
- **Asset Loading:** 2 files (ASSET_LOADING, IMPLEMENTATION_SUMMARY)
- **Dark Seal:** 2 files (DARK_SEAL_IMPLEMENTATION, IMPLEMENTATION_COMPLETE)
- **Immolate:** 2 files (IMMOLATE_PASSIVE_GUIDE, IMMOLATE_IMPLEMENTATION_SUMMARY)
- **Passive System:** 3 files (REFACTOR, INTEGRATION_GUIDE, REFACTOR_SUMMARY)

### 2. Flat Structure Getting Crowded
Currently 22 markdown files in single `docs/` folder. Will scale poorly.

## Proposed Structure

```
docs/
├── DOCS_INDEX.md                    # Master index (keep at root)
├── DOCS_REORGANIZATION_PROPOSAL.md  # This file
│
├── systems/                         # Core game systems
│   ├── combat/
│   │   ├── README.md                # Combat system overview
│   │   ├── formulas.md              # (renamed from combat-formulas.md)
│   │   ├── timing-system.md         # (renamed, lowercase)
│   │   ├── difficulty-scaling.md    # (renamed, lowercase)
│   │   └── stun-mechanics.md        # (📋 PH - from STUN_IMPLEMENTATION_GUIDE)
│   │
│   ├── passive/
│   │   ├── README.md                # Passive system overview + status
│   │   ├── architecture.md          # Design (from PASSIVE_SYSTEM_REFACTOR)
│   │   └── integration-guide.md     # How to integrate (from PASSIVE_INTEGRATION_GUIDE)
│   │
│   ├── events/
│   │   └── event-weight-system.md   # (renamed, lowercase)
│   │
│   └── unlocks/
│       └── profile-unlocks.md       # (from UNLOCKABLES.md)
│
├── items/                           # Item-specific documentation
│   ├── README.md                    # Item system overview
│   ├── dark-seal.md                 # UNIFIED doc (merge DARK_SEAL_IMPLEMENTATION + IMPLEMENTATION_COMPLETE)
│   ├── bamis-cinder.md              # UNIFIED doc (merge IMMOLATE_PASSIVE_GUIDE + IMMOLATE_IMPLEMENTATION_SUMMARY)
│   └── delverhold-greateaxe.md      # Example weapon (from DELVERHOLD_GREATEAXE)
│
├── features/                        # Complete game features
│   ├── post-encounter.md            # UNIFIED doc (merge all 3 POST_ENCOUNTER files)
│   ├── asset-loading.md             # UNIFIED doc (merge ASSET_LOADING + IMPLEMENTATION_SUMMARY)
│   └── viewport-scrolling.md        # UI fixes
│
└── guides/                          # How-to guides
    └── content-integration.md       # Adding new content

```

## File Consolidation Plan

### High Priority (Prevent Sync Issues)

**1. Post-Encounter System** (3 → 1 file)
- Merge: POST_ENCOUNTER_SYSTEM + POST_ENCOUNTER_IMPLEMENTATION + POST_ENCOUNTER_QUICK_REF
- New file: `features/post-encounter.md`
- Keep: System flow, event list, integration checklist, quick reference table

**2. Passive System** (3 → 2 files)
- Keep: PASSIVE_SYSTEM_REFACTOR → `systems/passive/architecture.md` (design doc)
- Keep: PASSIVE_INTEGRATION_GUIDE → `systems/passive/integration-guide.md`
- Remove: PASSIVE_REFACTOR_SUMMARY (info already in other two)

**3. Dark Seal** (2 → 1 file)
- Merge: DARK_SEAL_IMPLEMENTATION + IMPLEMENTATION_COMPLETE
- New file: `items/dark-seal.md`
- Keep: Technical implementation + testing checklist

**4. Immolate** (2 → 1 file)
- Merge: IMMOLATE_PASSIVE_GUIDE + IMMOLATE_IMPLEMENTATION_SUMMARY
- New file: `items/bamis-cinder.md`
- Keep: Mechanics + integration examples

**5. Asset Loading** (2 → 1 file)
- Merge: ASSET_LOADING + IMPLEMENTATION_SUMMARY
- New file: `features/asset-loading.md`

### Low Priority (Nice to Have)

**Standardize filenames to lowercase-with-hyphens:**
- `TIMING_SYSTEM.md` → `timing-system.md`
- `combat-formulas.md` → `formulas.md` (already lowercase)
- etc.

**Add README.md files to each subfolder** for quick orientation.

## Migration Strategy

### Option A: Gradual (Recommended)
1. Create new folder structure
2. Copy (don't move) files to new locations with new names
3. Update content in new locations
4. Test all references work
5. Add deprecation notices to old files
6. Remove old files after 1 week

### Option B: All at Once (Risky)
1. Create structure and move everything in one commit
2. Update all internal references
3. Risk: Breaks any external links or references

### Option C: Hybrid (Safe)
1. Start with empty new structure
2. Move files as you update/improve them naturally
3. Eventually old folder empties out organically
4. Less disruptive, more gradual

## Benefits

✅ **Scalability:** Room for hundreds more docs without clutter  
✅ **Discoverability:** Related docs grouped together  
✅ **Consistency:** No more duplicate/redundant files  
✅ **Clarity:** README files provide context for each system  
✅ **Professional:** Industry-standard documentation structure

## Potential Issues

⚠️ **Breaking changes:** Any hardcoded paths to docs will break  
⚠️ **Learning curve:** Contributors need to know new structure  
⚠️ **Work required:** ~2-3 hours to consolidate and reorganize

## Decision Points

Before implementing, decide:

1. **When?** Now vs. after passive system refactor complete?
2. **How?** Gradual (Option A), All-at-once (Option B), or Hybrid (Option C)?
3. **Naming?** Keep UPPERCASE or switch to lowercase-with-hyphens?
4. **Consolidation?** Which files to merge first?

## Recommendation

**Start small:**
1. ✅ DONE - Add status headers (completed)
2. ✅ DONE - Create DOCS_INDEX.md (completed)
3. 🚧 NEXT - Consolidate post-encounter docs (easiest merge)
4. 🚧 NEXT - Create `systems/passive/` folder (you're working on this now)
5. 📋 LATER - Full reorganization after passive system complete

This keeps momentum while improving organization incrementally.

---

**What do you think?** Want to consolidate post-encounter docs first as a test case?

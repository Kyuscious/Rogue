# Post-Encounter Reward System

**STATUS:** ✅ DONE - Unified feature reference  
**LAST UPDATED:** April 19, 2026

## Overview
After defeating a final encounter in a quest path, the player enters a post-encounter flow that gives a loot pick and then a strategic follow-up choice before progressing.

## Flow

```text
Boss Defeated
  ↓
Loot Selection Screen
  ↓
Post-Encounter Choice
  ├─ Rest
  ├─ Modify Build
  └─ Random Event
  ↓
Continue run progression
```

## Main Components

### 1. Loot Selection
- Lets the player choose one reward from the boss loot table
- Shows current HP / gold context
- Adds the selected item to inventory

### 2. Post-Encounter Choice Screen
Three choices are available:
- **Rest** - recover 50% max HP, clear debuffs, refill future refillable systems
- **Modify Build** - class changes, item management, stat adjustments, curse removal hooks
- **Random Event** - region-specific reward or risk event

### 3. Build Modification Screen
- **Class tab** for role/class swaps
- **Items tab** for inventory cleanup and future curse interactions
- **Stats tab** reserved for stat respec work

## Supporting Game Systems
- `eventSystem.ts` for region event selection
- `restSystem.ts` for HP recovery and debuff cleanup
- `postEncounterRewards.ts` for final-encounter detection and boss loot generation
- `buildModificationSystem.ts` for build-change actions and placeholders

## Key Features
- Boss loot selection before continuation
- Three-path post-encounter decision making
- Region-aware event rewards
- Framework for class/item/stat changes
- Responsive UI flow with dedicated screens

## Integration Checklist
- [ ] Trigger the flow after the qualifying boss/final encounter
- [ ] Show loot selection before the choice screen
- [ ] Wire rest choice to `performRest()`
- [ ] Wire event choice to `getRandomEventForRegion()`
- [ ] Finish stat respec / curse removal placeholders when ready

## Remaining Follow-Up
### High priority
- Integrate the full flow into the active battle/quest loop everywhere it should appear
- Complete class-change stat recalculation
- Add event-outcome feedback screens

### Medium priority
- Add stat respec interactions
- Expand event pools by region
- Improve animations and outcome presentation

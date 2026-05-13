# Tutorial Guide

**STATUS:** 🚧 WIP  
**LAST UPDATED:** May 3, 2026

## Purpose

Define one clear source of truth for tutorial behavior across the run lifecycle:
- when the tutorial auto-starts
- how it is skipped or re-enabled
- how contextual tutorial prompts appear for unfamiliar mechanics
- what visual state confirms tutorial mode is active
- what the custom tutorial-start segment must do before a normal run begins

---

## Product Goals

1. First-time players should be guided automatically without manual setup.
2. Experienced players should be able to skip quickly and continue normally.
3. Tutorial help should stay available from major run screens through the header ❔ button.
4. Tutorial should reappear contextually when unfamiliar mechanics are reached.
5. The onboarding sequence should begin in a dedicated tutorial segment (custom region/loadout/enemies), then transition into the real run.

---

## Current Behavior (As Implemented)

The current implementation is split between orchestration in [src/game/App.tsx](../../src/game/App.tsx) and tutorial-progress lifecycle helpers in [src/game/tutorial/tutorialProgress.ts](../../src/game/tutorial/tutorialProgress.ts).

### Auto-start condition
- Tutorial auto-start is profile-scoped and now uses a dedicated intro flag:
  - `tutorialIntroSeen_profile_<id>`
  - with migration fallback to `hoursPlayed <= 0` when intro flag is missing
  - and `tutorialCompleted_profile_<id> !== true`
- Entry point is `shouldStartFirstTimeTutorial(profile)` from tutorial-progress helpers.

### Skip and re-enable
- Skip is available from tutorial overlays and marks all tutorial flags as seen/completed for the active profile.
- Re-enable is available from the header ❔ button on quest/shop/battle/region selection and from pregame.
- Re-enable resets tutorial flags and restarts from a scene-relevant stage (`quest`, `battle`, `shop`, `regionTravel`, or fallback `pregame`).

### Scene/tutorial stages currently used
- `pregame`
- `quest`
- `battle`
- `battleLoot`
- `battleElite`
- `eliteReward`
- `regionTravel`
- `shop`

### Contextual first-time prompts currently supported
- Elite encounter tutorial (`battleElite`)
- Elite reward tutorial (`eliteReward`)
- Region travel tutorial (`regionTravel`)

### Known gaps vs intended direction
- Header ❔ button does not currently have a distinct "tutorial active" visual state.
- Custom onboarding now starts from pregame when tutorial stage is active and boots a dedicated encounter queue before standard quest flow.

### Custom tutorial start switch (implemented)
- Decision point: pregame `Start Your Run` action.
- Trigger: `shouldStartCustomTutorialRun(tutorialStage)` returns true (currently when stage is `pregame`).
- Runtime behavior:
  - launch custom tutorial region/config from `src/game/tutorial/tutorialRunConfig.ts`
  - start battle directly with controlled encounter queue
  - skip normal quest-board entry for this start
  - after tutorial queue completion, route into shop tutorial stage

### Custom tutorial loadout (implemented)
Applied via `useGameStore.setState` in `startCustomTutorialRun` when the custom run starts.
- **Inventory**: starting item ×1 (from pregame selection), `health_potion` ×2, `stealth_ward` ×1, `oracle_lens` ×1, `rejuvenation` ×1
- **Weapons**: `demacian_steel_blade` ×1, `spirit_tree_bow` ×1
- **Spells**: `for_demacia`, `purify`

### Tutorial gate system (implemented)
Controlled via `tutorialGate` prop on `<Battle>` (type: `'locked' | 'spell-only' | 'attack-only' | 'inspect-only' | 'item-only' | 'move-only' | 'heal-only' | 'finish-no-move-item' | null`).
- When active, all sections except the required one are visually grayed out (`tutorial-gate-blocked` CSS) and non-interactive.
- App-level state `tutorialFightStep: 'spell' | 'attack' | 'finish' | null` drives the gate.
- `onTutorialActionUsed` advances `tutorialFightStep`:
  - `'spell'` → `'attack'` (fired from `handleSpell` when exact `spellId === 'for_demacia'`)
  - `'attack'` → `'finish'` (fired from `handleAttack` when exact `weaponId === 'spirit_tree_bow'`)
  - `'finish'` → `null` on battle end
- **Timing and anti-softlock behavior (implemented):**
  - `spell-only` and `attack-only` enforce on their matching turn type only (skip is allowed on other turn types so players can wait).
  - Fight A progression is strict again: only `for_demacia` advances spell step; only `spirit_tree_bow` advances attack step.
  - Fight B uses strict ordered objectives with exact validators (wrong actions do not advance objectives).
- The 12-step NPC overlay (`renderSceneTutorialOverlay`) is suppressed during a custom run.
- The checkpoint badge shows task-specific text instead of stage names.

### Checkpoint badge (implemented)
Inline pill rendered in the header next to ❔.  
During custom run shows one of:
- `🎓 Listen to Ryze` (Ryze intro overlay active)
- `🎓 Cast for_demacia 0/1` (spell gate active)
- `🎓 Attack with spirit_tree_bow 0/1` (attack gate active)
- `🎓 Use health_potion 0/1` (Fight B opener)
- `🎓 Inspect enemy buff (attack turn)` (Fight B second objective)
- `🎓 Finish the fight` (finish gate active)
- `🎓 Review your loot` (loot stage)
- `🎓 Visit the shop` (shop stage)

Outside custom run shows the current stage label from `tutorialCheckpointItems`.

### Ryze intro overlay (implemented)
`tutorialFightIntroStep: 0 | 1 | 2 | null` drives the 3-beat intro before Fight A begins.
Gate is `'locked'` (all actions blocked) while intro step is non-null.

Beats:
1. **Step 0** → `tutorialLaneHighlight = 'player-lane'`  
   Text: *"This side is your team. You can see your health, your stats, and what abilities are ready."*  
   Highlights: `.team-player.formation-lane.team-player-theme`

2. **Step 1** → `tutorialLaneHighlight = 'enemy-lane'`  
   Text: *"And this is the enemy you have encountered. Watch their health — reduce it to zero to win."*  
   Highlights: `.team-enemy.formation-lane.team-enemy-theme`

3. **Step 2** → `tutorialLaneHighlight = 'timeline'`  
   Text: *"This timeline shows whose turn it is. When it's your turn, you can attack or cast a spell. Then the enemy gets their turn. Repeat until one side falls."*  
   Highlights: the `<TurnTimeline>` wrapper div

Implementation: `tutorialLaneHighlight` prop on `<Battle>` drives `getLaneHighlightClass(lane)` helper.
Highlighted element gets `battle-tutorial-highlight`; others get `battle-tutorial-muted`.

### Tutorial enemy items (implemented)
`spawnEnemies` in `src/game/screens/Battle/Field/enemySpawning.ts` skips `getRandomItemsForEnemy` for any enemy whose `id` contains `'tutorial'`.
This prevents random stat inflation and keeps tutorial enemy stats exactly as defined in the data file.

---

## Target Behavior (Spec)

### 1) First playthrough auto-start

Tutorial should auto-start for first playthrough on a profile.

Recommended trigger model:
- Prefer a dedicated profile flag (example: `tutorialIntroSeen_profile_<id>`), rather than inferring from playtime alone.
- Keep a migration fallback for old profiles:
  - if no `tutorialIntroSeen` key exists, treat `hoursPlayed <= 0` as first-time.
- Set intro-seen as soon as tutorial onboarding actually starts.

Rationale:
- `hoursPlayed` is coarse and can drift from true onboarding state.
- explicit tutorial lifecycle flags are easier to reason about and debug.

### 2) Skippable + always re-openable in run

Tutorial must remain:
- skippable at any tutorial prompt/overlay
- re-openable from a header ❔ button on major run screens

Expected screens with header access:
- Quest
- Battle
- Shop
- Region Selection

### 3) Contextual reappearance for unfamiliar content

When tutorial mode is not fully disabled/skipped for the profile, tutorial should surface exactly once for newly encountered mechanics/content during a run.

Rule:
- each unfamiliar mechanic has its own `seen` key per profile
- first encounter triggers tutorial
- completion marks it seen
- manual re-enable can clear/replay by design

Initial unfamiliar-content set:
- First elite encounter
- First elite reward selection
- First region travel decision

Future candidates:
- First summon/familiar acquisition
- First event node
- First revisit-penalty encounter

### 4) Header ❔ active-state visual feedback

When tutorial is currently active (any stage other than `none`), the header ❔ button must switch to a distinct active style.

Design intent:
- default state: existing neutral/help style
- active state: high-contrast variant (different border/fill/glow)
- accessibility: keep adequate contrast and preserve hover/focus indicators

### 5) Dedicated tutorial-start segment before normal run

First-time onboarding should begin in a custom tutorial segment before entering the standard region flow.

Requirements:
- custom tutorial region context
- controlled starter loadout
- controlled enemy sequence : minion > elite > champion > run start
- clear transition point into normal run flow

Guardrails:
- tutorial-only enemies/gear should not pollute normal loot pools
- tutorial segment should not break profile discovery/unlock tracking

---

## Tutorial Step Structure (Initial Draft)

This is the baseline sequence to implement and iterate on.

### Step 1: Core roguelike introduction
- explain run loop: setup -> encounters -> rewards -> travel -> scaling
- explain failure/progression philosophy (runs are expected to end; profiles persist)

### Step 2: Screen element orientation
- top header resources/status
- character/build panel
- quest/path selection panel
- inventory/build management touchpoints

### Step 3: Controlled first combat
- battlefield and positioning
- timeline and turn cadence
- attack/move lane vs spell/item lane basics

### Step 4: Post-battle rewards and shop
- reward selection intent
- reroll/skip behavior
- shop buy/sell and build refinement

### Step 5: Region travel and strategic route choice
- travel action choice (rest/modify/event)
- destination risk profile
- how region choice shapes future fights and rewards

### Step 6: Contextual milestone tutorials
- elite encounter intro
- elite reward intro
- future unfamiliar-content tutorials as added

---

## State Model

Suggested profile-scoped keys (active profile id suffix):
- `tutorialCompleted_profile_<id>`
- `tutorialIntroSeen_profile_<id>`
- `eliteTutorialSeen_profile_<id>`
- `eliteRewardTutorialSeen_profile_<id>`
- `regionTravelTutorialSeen_profile_<id>`

Behavior summary:
- Skip all tutorial: mark all seen/completed true.
- Re-enable tutorial: reset seen/completed flags relevant to replay behavior.
- Full completion of core flow: mark `tutorialCompleted` true.

---

## Acceptance Criteria

1. New profile, first run: tutorial starts automatically.
2. Player can skip at any point and continue run without tutorial interruption.
3. Player can re-open tutorial from header ❔ on supported run screens.
4. ❔ button clearly indicates active tutorial mode visually.
5. First onboarding starts in a tutorial-specific segment with custom gear/enemies.
6. Contextual first-time tutorials trigger once per profile per mechanic.
7. Existing non-tutorial run flow remains stable.

---

## Achievement Mapping

- Achievement ID: `complete_tutorial`
- Display name: `Tutorial Graduate`
- Unlock condition: clear at least one hard-tier region
- Technical source: profile stat `completedHardRegions`

---

## Tutorial Scenario Pack (Doc-Only Spec)

This section defines the tutorial combat scenario content that will be added later in implementation.
It is intentionally documentation-only for now and must not be wired into runtime yet.

### Scope

- Add tutorial-specific content definitions in this same folder (`docs/guides/`) first.
- Define a controlled 3-fight onboarding flow:
  1. Minion: `Creep`
  2. Elite: `Poro`
  3. Champion: `Teemo`
- Use a tutorial-only player setup (character profile + controlled starter gear/stats).
- Add forced-action checkpoints to ensure key battle interactions are learned.

### Planned Files (Same Folder)

- `src/game/tutorial/tutorial-content-paths.md`
  - tutorial route/path schema
  - encounter sequence definition and transition rules
- `src/game/tutorial/tutorial-content-enemies.md`
  - Creep/Poro/Teemo tutorial stat blocks and behavioral teaching intent
- `src/game/tutorial/tutorial-content-player.md`
  - tutorial player baseline stats, equipment, consumables, and spell/weapon kit
- `src/game/tutorial/tutorial-forced-actions.md`
  - forced-action gates, pass conditions, fail/timeout behavior, and UX messaging

Note: these files are specification inputs for future game integration, not gameplay content assets yet.

### Tutorial Combat Flow (Agreed Spec - May 3, 2026)

This section is the agreed source of truth for upcoming implementation.

#### Global Rules Across Tutorial Fights

- Ryze narration is required and should appear as objective-driven beats.
- Checkpoint badge must show the current objective only.
- Objectives only complete when the exact required action is performed.
- For Fight A and Fight C, movement and item usage are blocked unless explicitly enabled by a checkpoint.
- Soft-lock prevention is mandatory: tutorial skip remains available.

#### Fight A: Creep (`runeterra_tutorial_creep`)

##### Spawn / Setup

- Enemy spawn position: `-90`.
- Player starts with 3 spells: `for_demacia`, `rejuvenation`, `purify`.
- Player has `spirit_tree_bow` for ranged attack teaching.
- Player cannot move.
- Player cannot use items.

##### Ryze Explanation Beats (implemented)

All 3 beats run before the gate opens. Gate is `'locked'` during the entire intro sequence.

1. **Beat 0 — Player lane** (`tutorialLaneHighlight = 'player-lane'`)  
   *"This side is your team. You can see your health, your stats, and what abilities are ready."*

2. **Beat 1 — Enemy lane** (`tutorialLaneHighlight = 'enemy-lane'`)  
   *"And this is the enemy you have encountered. Watch their health — reduce it to zero to win."*

3. **Beat 2 — Timeline** (`tutorialLaneHighlight = 'timeline'`)  
   *"This timeline shows whose turn it is. When it's your turn, you can attack or cast a spell. Then the enemy gets their turn. Repeat until one side falls."*

Intro advancement: Continue button steps 0 → 1 → 2 → null (sets gate to `'spell-only'`).

##### Checkpoints

1. `Cast for_demacia 0/1`
- Player may cast other spells, but only `for_demacia` validates objective.
- Why: teach meaningful spell choice (not just any cast).

2. `Attack with spirit_tree_bow 0/1`
- Must use `spirit_tree_bow`.
- Reason: `demacian_steel_blade` should not have enough range from starting positions.

3. `Finish the fight`
- Keep movement and items blocked.
- Victory transitions to loot/reward review.

#### Fight B: Poro (`runeterra_tutorial_poro`)

##### Spawn / Setup

- Start positions: player `90`, enemy `-90`.
- Player starts at exactly 50% HP (independent of previous fight outcome).
- Available items in this fight: health potions only.

##### New Enemy Rule

- Poro faction passively gains `Small Target` (long-range direct damage misses).
- Effect: any single-target ranged weapon attack misses.
- Battle log on miss: `The attack missed!`
- Melee attacks and AoE attacks are unaffected.
- Ranged/melee split uses weapon-definition threshold (`> 150` is ranged).

##### Checkpoints

1. `Use health_potion 0/1`
- First required action when Fight B starts.
- Objective advances only on exact item use (`itemId === 'health_potion'`).

2. `Inspect enemy buff (attack turn)`
- Second required action.
- Objective advances only if the player inspects an enemy target during a player attack turn.
- Purpose: explicitly teach why ranged attacks fail against Poro.

3. `Finish the fight`
- Objective remains active until encounter victory.
- Off-objective actions do not advance checkpoints.

#### Fight C: Teemo (`bandle_boss`)

##### Core Teaching Goal

Teemo stat-checks the player and forces correct utility usage at the right time.

##### Phase 1: Poison Check

- Teemo uses `Toxic Shot` and applies poison debuff.
- Checkpoint requires using `purify` to remove poison.
- Optional guidance can recommend `stealth_ward` to inspect and understand the threat.

##### Phase 2: Invisibility Check

- At 35% Teemo HP, Teemo uses `Guerrilla Warfare` and gains invisibility.
- Invisible units cannot be targeted by single-target weapons/spells.
- Invisible units can only be damaged by AoE until revealed.
- Checkpoint requires using `oracle_lens` to reveal Teemo.

##### Final Checkpoint

- `Finish the fight` after reveal.

### Tutorial Player Baseline (Target)

- Use a tutorial-only player preset, independent from normal starter randomness.
- Controlled setup includes:
  - fixed base stats tuned for learning pace
  - fixed weapon set supporting both ranged and melee teaching steps
  - fixed spell set: `for_demacia`, `rejuvenation`, `purify`
  - per-fight item provisioning (not one static inventory for all 3 fights)
  - deterministic setup (no run-killing RNG spikes during teaching moments)

### Item Availability And Checkpoint Gating Strategy

This is the recommended implementation model to prevent early or out-of-order item usage.

1. Fight-scoped inventory snapshots
- Rebuild inventory at the start of each tutorial fight.
- Fight A: no usable items.
- Fight B: health potions only.
- Fight C: health potions + `stealth_ward` + `oracle_lens`.

2. Objective-aware action locks
- Add objective-level action locks for `move`, `item`, `spell`, `attack`, and `inspect`.
- Keep blocked sections grayed out and non-interactive.

3. Exact-action validators
- Objective completion should be tied to exact IDs and conditions, not action category only.
- Examples:
  - `castSpellId === 'for_demacia'`
  - `attackWeaponId === 'spirit_tree_bow'`
  - `useItemId === 'oracle_lens'` and target has invisibility

4. Ordered objective graph
- Maintain explicit objective order per fight.
- Ignore or log off-objective actions without progressing checkpoints.

5. Recovery and safety
- Keep tutorial skip available.
- If player cannot proceed, surface a clear hint tied to current objective.

### Separation Rules

- Tutorial enemies, paths, and player presets must be isolated from normal progression content.
- Tutorial-only entries must not leak into:
  - normal quest pools
  - index discovery unless intentionally desired
  - normal loot/drop generation

### Exit Criteria For Tutorial Segment

Tutorial segment is considered complete when all of the following are true:
- Creep encounter completed
- Poro encounter completed
- Teemo encounter completed
- mandatory forced-action checkpoints satisfied (or tutorial explicitly skipped)

Then transition into normal run flow.

---

## Implementation References

- Core state orchestration: [src/game/App.tsx](../../src/game/App.tsx)
- Tutorial lifecycle helpers and storage keys: [src/game/tutorial/tutorialProgress.ts](../../src/game/tutorial/tutorialProgress.ts)
- Profile progression stat for hard-region completion: [src/game/screens/MainMenu/Profiles/profileSystem.ts](../../src/game/screens/MainMenu/Profiles/profileSystem.ts)
- Achievement definitions and unlock checks: [src/game/screens/Index/Index.tsx](../../src/game/screens/Index/Index.tsx)
- Pregame tutorial UI: [src/game/screens/PreGameSetup/PreGameSetup.tsx](../../src/game/screens/PreGameSetup/PreGameSetup.tsx)
- Quest tutorial UI: [src/game/screens/QuestSelect/QuestSelect.tsx](../../src/game/screens/QuestSelect/QuestSelect.tsx)
- Region travel tutorial UI: [src/game/screens/RegionSelection/RegionSelection.tsx](../../src/game/screens/RegionSelection/RegionSelection.tsx)
- Tutorial copy keys: [src/i18n/translations/en/ui.ts](../../src/i18n/translations/en/ui.ts)
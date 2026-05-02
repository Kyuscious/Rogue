# Battle Visuals

Status: WIP
Last updated: April 25, 2026

## Scope

This document defines the visual composition of entities in battle for desktop browsers (16:9 and wider).

Goal: the battle arena must show both relative battlefield position and readable entity cards without splitting attention across competing vertical panels.

## Arena Composition (Desktop)

- The arena is split into 2 stacked layers:
	- compact horizontal battlefield track (top)
	- formation lanes (bottom)
- The battlefield track is a thin, full-width position bar that shows:
	- relative positions
	- movement spacing
	- attack ranges
	- area-of-effect previews
	- tokenized markers (`P1`, `E2`, `F1`, ...)
- The formation lanes remain the main card layer:
	- player lane (left)
	- enemy lane (right)
- Formation model uses 10 logical slots total:
	- player side: 5 slots
	- enemy side: 5 slots
- Empty slots are valid placeholders when a unit is missing, but the arena structure itself remains fully occupied.

## Slot And Card Model

- Slots are logical positions, not strict equal-size grid cells.
- A unit card can be visually larger or smaller than another card.
- Some units may span two or more logical slots.
- Positioning changes independently of card style:
	- player card can be larger and more prominent
	- familiar cards should be smaller and less visually dominant
	- weaker enemies can be smaller than elite or boss enemies

### Card Size Tiers

Cards use fixed height and width presets relative to the full formation lane card footprint.

- Height rule: shorter units anchor to the bottom of the lane so bases stay aligned.
- Width rule: smaller units free horizontal space, and larger units expand to cover the released width.
- Cinematic guardrail (single-unit lanes): card width remains capped to avoid oversized panels on 16:9+ displays (max 25vw, with a stricter practical cap in CSS).

| Entity type             | Height | Width | Height class | Width class |
|-------------------------|--------|-------|--------------|-------------|
| Player                  | 100%   | 100%  | `h-full`     | `w-100`     |
| Boss / Legend enemy     | 100%   | 100%  | `h-full`     | `w-100`     |
| Elite / Champion enemy  | 90%    | 90%   | `h-90`       | `w-90`      |
| Minion enemy            | 75%    | 75%   | `h-75`       | `w-75`      |
| Familiar                | 70%    | 70%   | `h-70`       | `w-70`      |

## Orientation

- Entity status cards are vertically oriented.
- Card stacks should use the full battle-arena height, with controlled exceptions for intentionally smaller units (for example familiars).

## Canonical Placement Examples

The following examples are authoritative for initial placement behavior:

- One player entity: place in player Slot 3.
- One enemy entity: place in enemy Slot 7 (enemy-side middle slot).
- Two player entities: place in player Slots 3 and 4.
- Two enemy entities: place in enemy Slots 6 and 7.

These examples define center-biased placement and should be treated as the baseline formation contract.

## Battlefield-Linked Reordering

Formation position is linked to battlefield distance.

- Units closer to center/front should occupy more frontward logical slots.
- If unit battlefield positions change, slot order updates accordingly.
- If a unit dies, survivors collapse/recenter based on current battlefield order and alive count.

Example behaviors:

- Player at 50 and familiar at 60: familiar is behind player in team layout.
- If player moves to 70, relative order swaps when distance ordering swaps.
- If familiar dies, player recenters to the correct alive-count slot.
- If two summons appear at 20 and 25, slot assignment updates so ordering reflects proximity/formation rules.

Same ordering logic applies to enemy teams.

## Position Collision And Spawn Rules

Battlefield positions must keep combatants separated.

- Minimum gap rule:
	- Two units cannot end within less than 9 units of each other.
	- If a move or spawn would violate this, resolve to a valid nearby position using 10-unit spacing.
- Movement collision resolution:
	- If a mover lands exactly on another unit, push it 10 units to the side it approached from.
	- If a mover lands within 9 units on one side of another unit, snap it to the nearest valid 10-unit slot on that same side.
- Spawn collision resolution:
	- Spawn requests use a desired anchor position.
	- If occupied (or too close), shift by +10 repeatedly until a valid position is found.

### Team Spawn Anchors

- Player anchor remains at 50.
- Enemy units use per-entity spawn points (not one shared enemy position).
- Encounter enemy ordering uses load order:
	- First enemy at the enemy anchor.
	- Next enemies spawn behind at +10 steps.

### Summon Spawn Ordering

- Multi-unit summons use ordered placement from the summon anchor:
	- First summon at anchor.
	- Second at anchor + 10.
	- Later summon waves continue shifting if positions are occupied (for example +20, +30, etc.).
- This keeps repeated summons from stacking on the same coordinate.

## UX Notes

- The old enemy team title is not required for readability.
- Position indicators on cards are preferred over bulky section headers.
- Visual hierarchy should emphasize primary combatants while still exposing formation order.

## Visual Identity System

### Team Identity First, Entity Identity Second

- Team identity must be recognizable first:
	- Player team uses cool hues (cyan/blue family).
	- Enemy team uses warm hues (orange/red family).
- Entity identity is secondary and compact:
	- Use small accent chips/badges.
	- Keep card bodies mostly neutral/dark for readability.

### One Token Contract Across Track, Arena, And Log

Every combatant should resolve to a shared token object containing:

- team color family
- accent color
- glyph shape (circle/square/diamond)
- short label (`P1`, `E2`, `F1`, ...)

Render usage by surface:

- Arena card: left border/accent + token chip + label.
- Battlefield track: same label/shape/color token on the position bar.
- Log entry: token chip before message text.

### Shape + Position + Label Over Color Noise

Identification priority order:

1. Formation position
2. Team color family
3. Token label
4. Token shape (accessibility backup)

Avoid high-saturation rainbow palettes; highlight active previews/states with intensity, not new persistent colors.

## Log Readability Pattern

Each action-oriented log entry should start with:

1. Actor token
2. Action verb
3. Target token

Example:

`[E2] Sand Priest casts Burn on [P1]`

This improves scan speed versus repeatedly parsing long names.

## Track And Formation Must Agree

- The battlefield track is the source of truth for exact relative position.
- Formation order is the readable card projection of that state.
- If movement changes order, track markers and formation slot occupancy must update together.
- Never allow the track and formation lanes to imply different frontliners/backliners.

## Hover Target Preview And Feedback

Targeting feedback is hover-driven, not auto-target-driven.

- On hover of an actionable button (weapon attack, spell, item):
	- Show the effective range on the battlefield track.
	- Show area-of-effect footprint on the battlefield track.
	- Pulse only entities that would be affected by that action from the current state.
- If no valid target is in range:
	- Keep range/AoE visualization visible.
	- Do not pulse any entity.
	- Action button is visually disabled and not clickable.
- Pulse visuals should communicate "would be hit now" (preview), not "currently selected target".

### Visual Priority For Previews

- Range/AoE overlays are the primary preview layer on the battlefield track.
- Pulsing affected entities is secondary confirmation.
- Avoid introducing extra permanent highlight states that compete with hover previews.

## Battle Card Information Hierarchy

This section defines what should be visible by default on battle cards, ordered from most important to least important.

Reference baseline for compact cards:

- Minimum footprint target: about 80px width x 340px height.
- Wider cards are allowed, but this baseline is the readability stress test.

### Player Card (Compact Battle View)

Canonical compact layout — top to bottom:

**Top section:**
1. Name row: name on left (colored by tier/class), token chip on left, item-count badge on right.
2. Buff/debuff strip below the name row.

**Bottom section (anchored to bottom of card, ordered top-to-bottom):**
3. Core stats grid (offensive row: AD / AP; defensive row: Armor / MR).
4. HP count.
5. HP bar.

Art treatment:
- Portrait art rendered as background image, height-bound (`auto 100%`), centered.
- No overlay; art sits behind all UI elements.

Core stats in compact view:
- Offensive row: Attack Damage & Ability Power.
- Defensive row: Armor & Magic Resist.
- Optional (only if space allows): Speed and Haste.

Inventory on compact player card:
- Always show a tiny item-count badge only (symbol + number). Full detail in inspect view.

### Familiar Card (Compact Battle View)

Canonical compact layout — top to bottom:

**Top section:**
1. Name row: name on left, item-count badge on right.
2. Buff/debuff strip below the name row.

**Bottom section (anchored to bottom of card, ordered top-to-bottom):**
3. Offensive stats row: Attack Damage & Ability Power.
4. Defensive stats row: Armor & Magic Resist.
5. Timing badge (descriptive text: `Acts in Nt`, `✓ Ready`, `At fight start`, `At fight end`).
6. HP count.
7. HP bar.

Art treatment:
- Portrait art as background image at `auto 60%` (60% of card height), centered.
- Smaller than player/enemy art to avoid overflowing compact card edges.
- Art sits behind all UI elements with no overlay.

Timing rule:
- Timer uses descriptive full text, not abbreviated single-character labels.

### Enemy Card (Compact Battle View)

Canonical compact layout — top to bottom:

**Top section:**
1. Name row: name (tier-aware color) on left, token chip on left, item-count badge on right.
2. Buff/debuff strip below the name row.

**Bottom section (anchored to bottom of card, ordered top-to-bottom):**
3. Core stats grid (offensive row: AD / AP; defensive row: Armor / MR) — subject to reveal rules.
4. HP count.
5. HP bar.

Art treatment:
- Portrait art rendered as background image, height-bound (`auto 100%`), no overlay.
- Enemy art anchors left-of-center for face composition.

Enemy strategy note:

- Enemy weapon/spell/item visibility is high-value tactical information and should be prioritized when available.

## Compact Vs Inspect Model

### Compact Battle View (Default During Combat)

The compact card must optimize fast decisions in active combat.

Show by default:

- Name
- HP
- Art
- Buffs/debuffs (vertical rails with overflow counters)
- Core stats only
- Enemy loadout hints only when revealed
- Item-count badge

Do not show by default:

- Full inventory lists
- Full derived stat table
- Long descriptions
- Exhaustive loadout details for every slot/state

### Inspect View (On Card Click)

Clicking any entity card should open full detail for that entity as a pop-up that takes most of the viewport.

Inspect view should include:

- Full stats
- Full buff/debuff breakdown (battle context only; not shown in index)
- Weapons, spells, consumables (in right loadout column)
- Item/equipment grid (in full-width footer)
- Class token and details (in center column, gives stats)
- Faction token and details (enemies only; hidden until revealed; player has no faction)
- Passive and special effect detail
- Reveal/intel state indicators (especially for enemies)

Design intent:

- Start fights with reduced information density.
- Provide complete details on demand through inspect.

## Full Extended Inspect Panel (Shared Entity Surface)

This section defines the expanded inspect panel as a reusable, shared component for all entity contexts, not battle-only.

### Panel Purpose

- Present complete entity information in one place.
- Support deep decision-making without overloading compact cards.
- Use one canonical inspect surface across screens to avoid duplicated UI logic.

### Global Availability

The same inspect panel pattern should be accessible from:

- Battle (click any compact entity card).
- Index surface.
- Quest Select (player build review before fights).
- Region Select.
- Reward Selection.
- Build Modification.
- Any future in-between-fight surface where build/intel review is useful.

### Viewport And Layout Contract

- The extended inspect panel should occupy most of the viewport.
- Recommended footprint target: about 80-92% viewport width and 80-92% viewport height.
- Keep background context dimmed but still recognizable.
- Content should scroll inside panel sections, not the entire page.

### Three-Column Layout With Full-Width Footer

The inspect panel uses a three-column body with a full-width items footer beneath it.

#### LEFT COLUMN — Identity (same across all contexts)

- Portrait art (large).
- Name, tier, role markers.
- Faction token and details.
  - Player does not have a faction token; this slot is empty or omitted for the player.
  - Enemy faction is hidden until revealed.
- Lore / combat style / index notes if available.

The left column should not change between battle and index contexts. It is always the stable identity anchor.

#### CENTER COLUMN — Stats And Class

This column is powered by the existing `StatsPanel` component (`src/game/shared/StatusPanels/StatsPanel.tsx`).
StatsPanel already provides full stat categories with quick-stat rail and expandable tooltip; the inspect panel reuses it with minimal tweaks.

- Class token and details (placed here because class gives stats; aligned with name/tier/role identity).
- HP block (current / max).
	- There is no Mana resource. HP is the only primary resource.
	- In battle context: shows actual current HP.
	- In index context: shows base max HP only — no current/actual combat values.
- Full stat table via StatsPanel. Real stat categories are:
	- **Survival**: HP, HP Regen, Armor, Magic Resist, Tenacity
	- **Attack**: Attack Range, Attack Damage, Speed, Crit Chance, Crit Damage, Lethality, Lifesteal
	- **Spell**: Ability Power, Haste, Magic Penetration, Heal/Shield Power, Omnivamp
	- **Mobility**: Movement Speed
	- **Misc**: Gold Gain, XP Gain, Magic Find
	- In battle context: actual values including all active combat buffs/debuffs.
	- In index context: base stat values only; no modifier layer applied.
- Full buff/debuff list with full text, stacks, and durations.
	- In battle context: shown in full.
	- In index context: not shown (no live buff/debuff state exists outside combat).
- Passive effects and special mechanics.
- Familiars only: their attack/buff rates.

#### RIGHT COLUMN — Loadout

- Weapons.
- Spells.
- Consumables / use-items.
- Cooldowns and notes per slot.
- Player loadout has more weapon, spell, and consumable slots than enemy loadout.
- Items (equipment) are NOT in this column. They belong in the footer (see below).
  - For enemies: this section may instead list the pool of possible items that could spawn on the class, visible after reveal.

#### FULL-WIDTH FOOTER — Items (Equipment)

This section is powered by the existing `InventoryPanel` component (`src/game/shared/StatusPanels/InventoryPanel.tsx`).
InventoryPanel already renders item name, quantity, and a hover tooltip with full stat breakdown and passive description; it will be adapted to render as a grid rather than a dropdown.

- Items are the most space-demanding section, especially for the player, and require a dedicated footer that spans the full panel width.
- The footer displays the entity's full equipment / item list in a grid.
- Each item entry should show: icon, name, rarity, key stat summary, passive name/effect.
	- Stat fields already covered by InventoryPanel tooltip: AD, AP, Armor, MR, HP, Speed, Lifesteal, Passive.
- Player footer will have many item slots; enemy footer will show revealed or possible items.
- This footer scrolls independently if the item list is long.
- The footer is the lowest section of the panel body, below the three columns.

#### PANEL NAVIGATION STRIP

- A narrow strip below the footer for: close action, pin/compare/track helpers, and prev/next entity navigation.

### Enemy Reveal Behavior In Inspect

- Enemy inspect panel follows reveal rules.
- Before reveal: hidden fields remain hidden/unknown in inspect as well.
- After reveal: inspect panel exposes the unlocked enemy information set.
- Compact cards should remain reduced even when inspect has full detail.

### Player vs Enemy Inspect Differences

| Feature              | Player Inspect         | Enemy Inspect                     |
|----------------------|------------------------|-----------------------------------|
| Faction token        | Not shown              | Shown (hidden until revealed)     |
| Class token          | Center column          | Center column (hidden until revealed) |
| Loadout slots        | More (full build)      | Fewer (encounter loadout)         |
| Item footer          | Full item grid         | Revealed or possible-item pool    |
| Index center column  | Base resources only    | Base resources only               |
| Index buffs/debuffs  | Not shown              | Not shown                         |

### Interaction Rules

- Open: click entity card (or dedicated inspect trigger where no card exists).
- Close: explicit close action and overlay click/escape support.
- Switching target while panel is open should swap content without closing panel.

### Shared Component Placement (Implementation Target)

When implementation begins, this inspect panel should live under the shared entity surface path:

- `src/game/entity/shared/`

Design goal:

- one shared inspect component, context-driven data inputs, no per-screen UI forks.

### ASCII Sketch (Extended Inspect Panel — Battle Context, Enemy)

```text
+-------------------------------------------------------------------------------------------+
| [Close] Entity Inspect: Teemo                                          [Reveal: 2/3]      |
+-------------------------------------------------------------------------------------------+
| LEFT (identity)        | CENTER (StatsPanel)                 | RIGHT (loadout)            |
|------------------------|-------------------------------------|----------------------------|
| Portrait (large)       | [Class Token] Assassin              | Weapon: Blowgun            |
| Name / Tier / Role     | HP  ??  / ??                        | Spell: Noxious Trap        |
| Faction: Bandle City   |  — Survival —                       | Consumable: Venom Vial     |
| (hidden until reveal)  | HP ?? | HPRegen ?? | Tenacity ??%   | (+ more slots)             |
| Lore / combat style    | Armor ?? | MR ??                    | Cooldowns / slot notes     |
|                        |  — Attack —                         |                            |
|                        | AD ?? | Spd ?? | Crit ??%           |                            |
|                        | Lethality ?? | Lifesteal ??%        |                            |
|                        |  — Spell —                          |                            |
|                        | AP ?? | Haste ?? | MagPen ??        |                            |
|                        | HSP ??% | Omnivamp ??%              |                            |
|                        |  — Mobility / Misc —                |                            |
|                        | MoveSpd ?? | Gold ??x | MagFind ??% |                            |
|                        |  — Buffs/Debuffs —                  |                            |
|                        | [Invisible x1 — 2t]                 |                            |
|                        | [Poison x3 — 4t]                    |                            |
|                        | Passive: Move Then Sting            |                            |
+-------------------------------------------------------------------------------------------+
| ITEMS FOOTER (InventoryPanel — full panel width)                                          |
| [Dart of Agony  ★★★] [Shadowcloak  ★★] [Hextech Shard  ★] [ ? ] [ ? ]                  |
| Each item: icon + name + rarity + key stat line + passive effect                          |
+-------------------------------------------------------------------------------------------+
| [Prev Entity]  [Pin]  [Compare]  [Track]                         [Next Entity]  [Close]   |
+-------------------------------------------------------------------------------------------+
```

### ASCII Sketch (Extended Inspect Panel — Index Context, Enemy)

```text
+-------------------------------------------------------------------------------------------+
+| [Close] Entity Index: Teemo                                                               |
+-------------------------------------------------------------------------------------------+
| LEFT (identity)        | CENTER (StatsPanel — base only)     | RIGHT (loadout)            |
|------------------------|-------------------------------------|----------------------------|
| Portrait (large)       | [Class Token] Assassin              | Weapon: Blowgun            |
| Name / Tier / Role     | Base HP: ??                         | Spell: Noxious Trap        |
| Faction: Bandle City   |  — Survival (base) —                | Consumable: Venom Vial     |
| (hidden until reveal)  | HP ?? | Armor ?? | MR ??            | Possible consumables:[pool]|
| Lore / combat style    |  — Attack (base) —                  |                            |
|                        | AD ?? | Spd ?? | Crit ??%           |                            |
|                        |  — Spell (base) —                   |                            |
|                        | AP ?? | Haste ?? | MagPen ??        |                            |
|                        |  — Mobility (base) —                |                            |
|                        | MoveSpd ??                          |                            |
|                        | (No buffs/debuffs — index context)  |                            |
|                        | Passive: Move Then Sting            |                            |
+-------------------------------------------------------------------------------------------+
| ITEMS FOOTER (InventoryPanel — possible items pool, class-based)                          |
| [Dart of Agony  ★★★] [Shadowcloak  ★★] [Hextech Shard  ★] [ ? ] [ ? ]                  |
+-------------------------------------------------------------------------------------------+
| [Prev Entity]  [Pin]  [Compare]                                  [Next Entity]  [Close]   |
+-------------------------------------------------------------------------------------------+
```

### ASCII Sketch (Extended Inspect Panel — Player)

```text
+-------------------------------------------------------------------------------------------+
| [Close] Player Inspect: Miko                                                              |
+-------------------------------------------------------------------------------------------+
| LEFT (identity)        | CENTER (StatsPanel)                 | RIGHT (loadout)            |
|------------------------|-------------------------------------|----------------------------|
| Portrait (large)       | [Class Token] Duelist               | Weapon 1: Longsword        |
| Name / Tier / Role     | HP 1240 / 1600                      | Weapon 2: Offhand Blade    |
| (no faction token)     |  — Survival —                       | Spell 1: Riposte           |
|                        | HP 1600 | HPReg 12 | Ten 15%         | Spell 2: Lunge             |
|                        | Armor 41 | MR 38                    | Consumable 1: Health Flask |
|                        |  — Attack —                         | Consumable 2: Smoke Bomb   |
|                        | AD 95 | Spd 1.2 | Crit 18%          | (+ more slots for player)  |
|                        | Lethality 12 | Lifesteal 8%         | Cooldowns / slot notes     |
|                        |  — Spell —                          |                            |
|                        | AP 60 | Haste 20% | MagPen 15       |                            |
|                        | HSP 0% | Omnivamp 5%                |                            |
|                        |  — Mobility / Misc —                |                            |
|                        | MoveSpd 340 | Gold 1.2x | MF 25%   |                            |
|                        |  — Buffs/Debuffs —                  |                            |
|                        | [Duelist Stance x1 — 3t]            |                            |
|                        | [Slowed x1 — 1t]                    |                            |
|                        | Passive: Riposte Ready              |                            |
+-------------------------------------------------------------------------------------------+
| ITEMS FOOTER (InventoryPanel — full item grid, player has many)                           |
| [Infinity Edge ★★★★] [Bramble Vest ★★★] [Sorcerer's Shoes ★★] [Chain Vest ★] [+many more] |
| Each item: icon + name + rarity + key stat line + passive effect                         |
+-------------------------------------------------------------------------------------------+
| [Prev Entity]  [Pin]  [Compare]  [Track]                         [Next Entity]  [Close]  |
+-------------------------------------------------------------------------------------------+
```

## Enemy Information Visibility Rules

Enemy information should be intentionally incomplete until revealed.

Hidden-by-default before reveal (baseline):

- Most enemy stats
- Enemy loadout specifics (weapon/spell/item details)
- Deep effect detail and long-form numbers
- Enemy faction and class token/details
- If we have space a small Index-entry that described the enemy's Lore/Combat style/Miscellanous facts.

Visible-before-reveal baseline:

- Enemy name
- Enemy HP
- Enemy art
- Observable combat state (for example active debuffs/buffs that are externally visible)
- Enemy item-count badge

Reveal behavior:

- Reveal tools should unlock hidden enemy card details for a limited duration or encounter count.
- Once revealed, enemy compact card should surface prioritized tactical intelligence (especially weapons/spells/items).
- Enemy faction/class information should appear in inspect view when revealed, not on compact cards.

## Wards And Intel Direction (Design Note)

This is a design-direction note, not an implementation requirement for this document pass.

- Wards are primarily information tools.
- Consider evolving wards toward an always-available intel action/category instead of competing with normal combat use-item turn economy.
- Keep final mechanical redesign out of current card visual implementation scope.

## ASCII Layout Sketches (Approximate)

The following sketches are rough visual targets for the compact card baseline around 80x340.

Player compact card sketch:

```text
	+------------------------------+
	| [TIER COLOR] Miko      [x3]  |  <- Name + item count badge
	+------------------------------+
	|                              |
	|                              |
	|          PORTRAIT            |  <- Full-height art layer
	|           (FULL)             |     with UI overlaid above/below
	|                              |
	|                              |
	+------------------------------+
	| B:[A][B][C][+2] D:[S][R]     |  <- Vertical rails represented compactly
	+------------------------------+
	| HP 1240 / 1600               |  <- HP count + bar kept together
	| [##########------]           |
	+------------------------------+
	| AD 95 | AP 60                |
	| AR 41 | MR 38                |  <- Core stats strip
	| (SPD/HASTE optional)         |
	+------------------------------+
```

Familiar compact card sketch:

```text
	+------------------------------+
	| [RARITY] Sentinel Fox  [x1]  |
	+------------------------------+
	|                              |
	|          PORTRAIT            |
	|                              |
	+------------------------------+
	| B:[A][C] D:[-]               |
	+------------------------------+
	| HP 520 / 700                 |
	| [########------]             |
	+------------------------------+
	| AD 42 | AP 18                |
	| AR 25 | MR 20                |
	+------------------------------+
    
```

Enemy compact card sketch (hidden vs revealed):

```text
	HIDDEN / UNREVEALED
	+------------------------------+
	| [TIER COLOR] Teemo     [x2]  |
	+------------------------------+
	|          PORTRAIT            |
	+------------------------------+
	| B:[V] D:[P]                  |
	+------------------------------+
	| HP 980 / 980                 |
	| [##############]             |
	+------------------------------+
	| AD ?? | AP ??                |
	| AR ?? | MR ??                |
	| WPN ? | SPL ? | ITM ?        |
	+------------------------------+

	REVEALED
	+------------------------------+
	| [TIER COLOR] Teemo     [x2]  |
	+------------------------------+
	|          PORTRAIT            |
	+------------------------------+
	| B:[V] D:[P]                  |
	+------------------------------+
	| HP 980 / 980                 |
	| [##############]             |
	+------------------------------+
	| AD 88 | AP 44                |
	| AR 29 | MR 31                |
	| WPN Dart | SPL Blind | ITM X |
	+------------------------------+
```

Inspect view relationship sketch:

```text
	[COMPACT CARD] --click--> [INSPECT PANEL]

	Compact: fast combat essentials only
	Inspect: full stats + full loadout + full items + full effects
```

## Out Of Scope For This Doc Pass

- No component implementation changes yet.
- No final pixel-perfect card art direction sheet yet.
- No final ward system mechanical redesign yet.
- No reveal-balance tuning pass yet.

## Implementation Notes

- Keep slot assignment logic data-driven and reusable.
- Avoid hardcoding fixed card dimensions per slot index.
- Resolve order first from combat positions, then apply role/class-specific visual scaling.
- Hover range preview should resolve per action source:
	- attack: use current scaled attack range from equipped weapon/stats
	- spell: use equipped spell range
	- item: use selected consumable active range when present
- If an action has no range value, skip range overlay but keep normal hover target highlighting behavior.
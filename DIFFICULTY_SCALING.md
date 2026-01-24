# Difficulty Scaling System

## Design Notes

- **Reward Scaling:** Rewards (including shop offerings) should scale up with the encounter counter, so that progressing further always feels rewarding and the shop remains relevant throughout a run.
- **Revisit Penalty Tuning:** The revisit penalty should ramp up slowly—occasional backtracking is expected and should not overly punish the player. The penalty should only become significant if a player repeatedly farms the same region.
- **Run Duration Target:** The system should be tuned for an ideal run duration of about 1 hour, which means players will sometimes need to revisit regions. The penalty system should allow for this without making the game unwinnable.

These principles should guide the implementation and tuning of all scaling and penalty systems.

## Current Implementation

### Multi-Factor Scaling
The game's difficulty scales based on multiple interconnected systems:

1. **Region Tier System**
   - Starting (Demacia, Ionia, Shurima): Common items, easier enemies
   - Standard (Piltover, Noxus, Zaun, Ixtal): Common to Epic items
   - Advanced (Bilgewater, Bandle City, Freljord): Epic to Legendary items
   - Hard (Void, Targon, Shadow Isles): Legendary to Ultimate items
   - Travelling (Ice Sea, Marai, Camavor): Scales with progression

2. **Encounter Progression**
   - Encounter count tracks total battles in the run
   - Item count increases: 1 → 2 → 3 → 4 items based on region and encounters (or floors)
   - Item rarities unlock progressively based on encounters + region tier

3. **Enemy Level Scaling**
   - Enemies scale with floor progression
   - Base stats increase ~5% per level
   - Class bonuses apply on top of scaling

4. **Item Stats Application**
   - Enemy base stats + item stats → then level scaling
   - Creates compound scaling effect

## Planned Features (Not Yet Implemented)

### Region Revisit Penalty System

**Goal:** Discourage excessive backtracking while allowing strategic revisits

**Mechanics:**

#### Enemy Strength Scaling on Revisits
- **First Visit:** Normal difficulty (baseline)
- **Second Visit:** 
  - Enemy level increased by **+2**
  - Item count increased by **+1**
  - Item rarity pool shifted up one tier (Common → Epic, Epic → Legendary, etc.)
  
- **Third Visit:**
  - Enemy level increased by **+4**
  - Item count increased by **+2**
  - Item rarity pool shifted up two tiers
  
- **Fourth+ Visits:**
  - Enemy level increased by **+6**
  - Item count maximized
  - Only highest tier items spawn

#### Reward Reduction on Revisits
- **First Visit:** 100% rewards (baseline)
- **Second Visit:**
  - Gold rewards reduced to **50%**
  - Item drop rates reduced to **60%**
  - Experience reduced to **90%**
  
- **Third Visit:**
  - Gold rewards reduced to **25%**
  - Item drop rates reduced to **30%**
  - Experience reduced to **80%**
  
- **Fourth+ Visits:**
  - Gold rewards reduced to **10%**
  - Item drop rates reduced to **10%**
  - Experience reduced to **70%**

#### Implementation Notes
- Track region visit count in `visitedRegionsThisRun` array (count occurrences)
- Apply multipliers in `startBattle()` function based on visit count
- Apply reward penalties in battle victory handler
- Display warning in RegionSelection UI for previously visited regions
- Consider adding visual indicator (icon/badge) showing visit count

#### Balance Considerations
- Revisiting should be viable for:
  - Farming specific items (high risk, diminishing returns)
  - Avoiding difficult region paths (penalty makes it harder anyway)
  - Strategic backtracking in emergencies
  
- Should NOT be viable for:
  - Infinite gold farming
  - Risk-free progression
  - Avoiding all difficult content

#### Future Enhancements
- Optional: Add achievement for completing run without revisiting any region
- Optional: Add blessing/curse system that triggers on 3rd+ revisit
- Optional: Special "Phantom" enemies that only spawn on revisits (harder variants)

## Scaling Philosophy

### Core Principles
1. **Progressive Challenge:** Difficulty increases naturally through the run
2. **Multiple Vectors:** Scale through levels, items, counts, and rarities simultaneously
3. **Regional Identity:** Each region tier feels distinctly different
4. **Player Choice:** Allow revisiting but make it a meaningful trade-off
5. **Anti-Farming:** Discourage grinding through diminishing returns

### Balance Goals
- First 3 encounters: Learning phase, forgiving
- Encounters 4-7: Ramp up, player should feel pressure
- Encounters 8+: Full difficulty, tight execution required
- Revisits: Risk vs. reward, generally discouraged but not impossible

## Testing Checklist
- [ ] Starting region enemies use only Common items
- [ ] Standard region enemies progress Common → Epic → Legendary
- [ ] Hard region enemies use Legendary+ items
- [ ] Item counts scale appropriately per region tier
- [ ] Revisit penalties apply correctly (when implemented)
- [ ] Reward reductions feel meaningful (when implemented)
- [ ] Players understand the revisit penalty through UI feedback

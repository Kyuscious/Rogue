# Dark Seal and Mejai's Soulstealer

**STATUS:** ✅ DONE - Unified item reference  
**LAST UPDATED:** April 19, 2026

## Overview
This item path introduces an AP-scaling starter unlock that can upgrade into a stronger late-game legendary.

## Dark Seal
- **Unlock requirement:** reach 150 total AP during a run
- **Stats:** +50 HP, +15 AP
- **Passive:** Glory - gain permanent AP when defeating Champion or Legend enemies
- **Role:** early scaling starter for AP-focused runs

## Mejai's Soulstealer
- **Availability:** later shop upgrade path when Dark Seal is present
- **Stats:** +50 HP, +20 AP, +100 movement speed
- **Passive:** upgraded Glory with stronger AP gains per qualifying kill
- **Special behavior:** purchasing it swaps out Dark Seal while preserving the existing Glory stack state

## System Notes
Implementation touches:
- item database and unlock metadata
- profile unlock tracking
- battle victory handling for Glory stack gain
- shop logic for Mejai's availability and item swap behavior

## Gameplay Flow
1. Reach the AP threshold in a run to unlock Dark Seal.
2. Start a future run with Dark Seal.
3. Defeat Champion/Legend enemies to stack Glory.
4. Upgrade into Mejai's later for improved scaling.

## Verification Checklist
- [ ] Dark Seal appears locked before the unlock requirement is met
- [ ] AP milestone unlocks the item for future runs
- [ ] Champion/Legend kills add Glory stacks correctly
- [ ] Mejai's can upgrade the item path without losing prior stacks

## Balance Intent
- Dark Seal offers a low-cost AP snowball path
- Mejai's is the higher-risk, higher-reward late scaling version
- The upgrade should feel meaningful without discarding prior progress

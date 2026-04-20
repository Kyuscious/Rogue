# Bami's Cinder - Immolate

**STATUS:** ✅ DONE - Unified item reference  
**LAST UPDATED:** April 19, 2026

## Overview
Bami's Cinder uses the Immolate passive to apply stacking burn damage through physical combat interactions.

## Core Mechanics
- **Trigger:** qualifying physical hits
- **Effect:** applies burn stacks to the target
- **Damage:** 15 per stack per turn
- **Duration:** 2 turns
- **Refresh rule:** new stacks reset duration instead of extending it indefinitely
- **Stacking:** multiple sources can increase the number of burn stacks applied

## Expected Turn Flow
1. Physical hit applies one or more burn stacks.
2. Burn damage is dealt at turn start.
3. If another qualifying hit happens, stacks increase and duration refreshes.
4. If the timer expires with no refresh, the burn ends.

## Integration Points
- passive definition in the passive/item systems
- burn helpers in the status effect layer
- battle flow hooks for applying and resolving burn damage
- optional UI indicators for stack count and remaining duration

## Testing Checklist
- [ ] No burn is applied without the item/passive
- [ ] One source applies one stack correctly
- [ ] Multiple sources stack additively
- [ ] Burn damage ticks each turn as expected
- [ ] Duration refreshes on re-application and expires cleanly when not refreshed

## Notes
This doc replaces the older split between the mechanics explanation and the implementation summary.

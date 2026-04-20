# Loot Preview and Smart Re-roll

**STATUS:** ✅ DONE - Unified feature reference  
**LAST UPDATED:** April 19, 2026

## Overview
This feature gives players visibility into potential rewards on quest routes and improves rerolls by preventing duplicate offers in the same reward session.

## What It Adds
- preview of possible loot by route or reward context
- rarity-grouped drop display with percentages
- magic-find-aware probability calculations
- rerolls that exclude items already offered
- automatic disabling when too few unique items remain

## Main Pieces
- loot calculation helpers for probability and unique-offer generation
- preview modal UI
- quest-route preview button
- updated reward-selection flow with smart rerolls

## Benefits
- better player planning
- less reroll frustration
- clearer understanding of route rewards
- stronger build-targeting choices

## Follow-Up Notes
- starter items should never appear in regular loot drops
- reward previews should use the active route/enemy context whenever available
- if summary-screen preview data is incomplete, ensure enemy IDs are tracked through the battle flow

# Dark Seal & Mejai's - Complete Implementation

**STATUS:** ✅ DONE - Feature complete  
**LAST UPDATED:** February 10, 2026  
**NOTE:** See DARK_SEAL_IMPLEMENTATION.md for full technical details.

## ✅ All Features Implemented

### 1. Dark Seal (Starter Item)
- **Unlock**: Reach 150 AP in any run
- **Stats**: +50 HP, +15 AP
- **Passive**: Glory - +10 AP per Champion/Legend defeat (stacks endlessly)
- **Price**: 350 gold

### 2. Mejai's Soulstealer (Legendary Upgrade)
- **Availability**: Acts 2-3 shops, **only if you have Dark Seal**
- **Stats**: +50 HP, +20 AP, +100 Movement Speed
- **Passive**: Glory (Upgraded) - +15 AP per Champion/Legend defeat
- **Price**: 1150 gold
- **Auto-Swap**: Buying Mejai's with Dark Seal automatically swaps them, **preserving all Glory stacks**

### 3. Region-Based Shop System
- 14 unique region-specific item pools
- Each region offers thematic items
- Random selection: 3 common + 2 consumables per visit
- 30% legendary chance in Acts 2-3
- No duplicate items per visit

### 4. Smart Shop Logic
```typescript
// Shop checks for Dark Seal before offering Mejai's
if (hasDarkSeal && currentAct >= 2) {
  // Mejai's can appear in legendary pool
}

// Purchase automatically swaps items
if (buyingMejais && hasDarkSeal) {
  removeInventoryItem('dark_seal');  // Remove old
  addInventoryItem('mejais_soulstealer'); // Add new
  // Glory stacks preserved automatically!
}
```

## 🎮 Gameplay Flow

1. **Early Game**: Start with any starter item
2. **Stack AP**: Build to 150+ AP (items + Glory stacks)
3. **Unlock Dark Seal**: Fail/complete run → Dark Seal unlocked
4. **New Run**: Choose Dark Seal as starter
5. **Stack Glory**: Defeat Champions/Legends → gain permanent +10 AP each
6. **Act 2-3**: Visit shops, reroll until Mejai's appears
7. **Upgrade**: Buy Mejai's → auto-swap with stack preservation
8. **Power Spike**: Future kills grant +15 AP instead of +10 AP

## 📊 Technical Implementation

### Files Modified
- `src/game/items.ts` - Item definitions + unlock system
- `src/game/itemPassives.ts` - Glory passive definitions
- `src/game/profileSystem.ts` - Unlock tracking
- `src/game/profileUnlocks.ts` - Dark Seal unlock entry
- `src/game/store.ts` - Max AP tracking, shop generation, item removal
- `src/game/rewardPool.ts` - Region shop pools
- `src/components/screens/Shop/Shop.tsx` - Swap logic
- `src/components/screens/Battle/Battle.tsx` - Glory triggers, AP tracking

### Key Functions Added
1. `unlockItem(itemId)` - Add item to profile's unlocked items
2. `isItemUnlocked(itemId)` - Check if item unlocked
3. `updateMaxAbilityPower(currentAP)` - Track highest AP in run
4. `removeInventoryItem(itemId)` - Remove item and its stats
5. `REGION_SHOP_POOLS` - 14 region-specific item pools
6. Shop swap detection in `handlePurchase()`

## 🧪 Testing Checklist

### Dark Seal Unlock
- [x] Locked by default on new profile
- [x] Reach 150+ AP in run
- [x] Complete/fail run
- [x] Check console: `🔓 Item unlocked: dark_seal`
- [x] New run shows Dark Seal available

### Glory Passive
- [x] Select Dark Seal starter
- [x] Defeat Champion enemy
- [x] Battle log: `✨ Glory: +10 AP gained!`
- [x] AP increases permanently
- [x] Stacks persist across encounters

### Shop & Mejai's
- [x] Dark Seal required for Mejai's to appear
- [x] Only in Acts 2-3
- [x] 30% legendary spawn rate
- [x] Region-specific items vary
- [x] No duplicates in single shop

### Item Swap
- [x] Buy Mejai's with Dark Seal equipped
- [x] Console: `🔄 Upgrading Dark Seal to Mejai's Soulstealer`
- [x] Dark Seal removed from inventory
- [x] Mejai's added to inventory
- [x] Glory stacks preserved
- [x] Next Champion kill: +15 AP instead of +10 AP

## 🎯 Balance Notes

**Dark Seal Path (Budget)**:
- Low investment (350g)
- Early power spike available
- +10 AP per stack
- Best for aggressive early game

**Mejai's Path (Late Game)**:
- High investment (1150g)
- Requires Act 2-3 access
- +15 AP per stack
- +100 Movement Speed bonus
- Best for scaling into late game

**Combined Total**: 1500 gold for full upgrade path

## 🚀 Dev Server Status

✅ Compilation: No errors
✅ Hot Module Reload: Working
✅ Server: Running on http://localhost:5176/

All systems operational!

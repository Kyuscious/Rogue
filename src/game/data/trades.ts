/**
 * Trade Database
 * Centralized dictionary of all item trades
 * Common → Rare → Epic → Legendary → Mythic
 */

export interface ItemTrade {
  id: string;
  fromItems: Array<{ itemId: string; quantity: number }>;
  toItem: { itemId: string; quantity: number };
  description: string;
}

/**
 * Hardcoded item trades - centralized trade database
 * Easy to expand with new trades as we implement more items
 */
export const ITEM_TRADES: ItemTrade[] = [
  // Common to Rare (Tier 1 → Tier 2)
  {
    id: 'trade_2_longswords_to_pickaxe',
    fromItems: [{ itemId: 'long_sword', quantity: 2 }],
    toItem: { itemId: 'pickaxe', quantity: 1 },
    description: '2× Long Sword → 1× Pickaxe',
  },
  {
    id: 'trade_3_daggers_to_shortsword',
    fromItems: [{ itemId: 'dagger', quantity: 3 }],
    toItem: { itemId: 'short_sword', quantity: 1 },
    description: '3× Dagger → 1× Short Sword',
  },
  {
    id: 'trade_2_staves_to_wand',
    fromItems: [{ itemId: 'staff', quantity: 2 }],
    toItem: { itemId: 'wand', quantity: 1 },
    description: '2× Staff → 1× Wand',
  },

  // Rare to Epic (Tier 2 → Tier 3)
  {
    id: 'trade_pickaxe_shortsword_to_broadsword',
    fromItems: [
      { itemId: 'pickaxe', quantity: 1 },
      { itemId: 'short_sword', quantity: 1 },
    ],
    toItem: { itemId: 'broadsword', quantity: 1 },
    description: 'Pickaxe + Short Sword → 1× Broadsword',
  },
  {
    id: 'trade_2_wands_to_staff_of_power',
    fromItems: [{ itemId: 'wand', quantity: 2 }],
    toItem: { itemId: 'staff_of_power', quantity: 1 },
    description: '2× Wand → 1× Staff of Power',
  },

  // Epic to Legendary (Tier 3 → Tier 4)
  {
    id: 'trade_broadsword_to_legendary',
    fromItems: [{ itemId: 'broadsword', quantity: 1 }],
    toItem: { itemId: 'legendary_sword', quantity: 1 },
    description: 'Broadsword → 1× Legendary Sword',
  },

  // Add more trades here as we expand the item system
  // Template:
  // {
  //   id: 'trade_unique_id',
  //   fromItems: [{ itemId: 'item_1', quantity: 1 }, ...],
  //   toItem: { itemId: 'result_item', quantity: 1 },
  //   description: 'Human readable description',
  // },
];

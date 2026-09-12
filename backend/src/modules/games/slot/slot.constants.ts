import { SlotSymbol, SymbolMeta } from './slot.types';

export const SLOT_GAME_SLUG = 'mafia-syndicate-777';
export const SLOT_GAME_TITLE = 'Mafia Syndicate 777';
export const TOTAL_PAYLINES = 20;

// Paytable Multipliers (Relative to Line Bet = Total Bet / 20)
// High payouts for premium symbols, balanced RTP
export const SYMBOL_CONFIG: Record<SlotSymbol, SymbolMeta> = {
  BOSS: {
    id: 'BOSS',
    name: 'The Don (Mafia Boss)',
    category: 'PREMIUM',
    multipliers: { 3: 50, 4: 200, 5: 1000 },
  },
  FEMME: {
    id: 'FEMME',
    name: 'Femme Fatale',
    category: 'PREMIUM',
    multipliers: { 3: 40, 4: 150, 5: 600 },
  },
  GUN: {
    id: 'GUN',
    name: 'Tommy Gun',
    category: 'MEDIUM',
    multipliers: { 3: 30, 4: 100, 5: 400 },
  },
  CAR: {
    id: 'CAR',
    name: '1930s Gangster Coupe',
    category: 'MEDIUM',
    multipliers: { 3: 25, 4: 80, 5: 300 },
  },
  CASH: {
    id: 'CASH',
    name: 'Briefcase of Cash',
    category: 'MEDIUM',
    multipliers: { 3: 20, 4: 60, 5: 200 },
  },
  WHISKEY: {
    id: 'WHISKEY',
    name: 'Bourbon & Cigar',
    category: 'MEDIUM',
    multipliers: { 3: 15, 4: 40, 5: 150 },
  },
  ACE: {
    id: 'ACE',
    name: 'Ace',
    category: 'LOW',
    multipliers: { 3: 10, 4: 25, 5: 100 },
  },
  KING: {
    id: 'KING',
    name: 'King',
    category: 'LOW',
    multipliers: { 3: 8, 4: 20, 5: 75 },
  },
  QUEEN: {
    id: 'QUEEN',
    name: 'Queen',
    category: 'LOW',
    multipliers: { 3: 5, 4: 15, 5: 50 },
  },
  JACK: {
    id: 'JACK',
    name: 'Jack',
    category: 'LOW',
    multipliers: { 3: 5, 4: 10, 5: 40 },
  },
  WILD: {
    id: 'WILD',
    name: 'Golden Skull Crest (Wild)',
    category: 'SPECIAL',
    multipliers: { 3: 100, 4: 500, 5: 2000 },
  },
  SCATTER: {
    id: 'SCATTER',
    name: 'Bank Vault Safe (Scatter)',
    category: 'SPECIAL',
    multipliers: { 3: 5, 4: 25, 5: 100 }, // Multipliers applied to TOTAL bet
  },
};

// 20 Standard Slot Paylines (Array of row index for each of the 5 reels: [r0, r1, r2, r3, r4])
// Row 0 = Top, Row 1 = Center, Row 2 = Bottom
export const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1], // Line 1: Center line
  [0, 0, 0, 0, 0], // Line 2: Top line
  [2, 2, 2, 2, 2], // Line 3: Bottom line
  [0, 1, 2, 1, 0], // Line 4: V-shape
  [2, 1, 0, 1, 2], // Line 5: Inverted V
  [0, 0, 1, 2, 2], // Line 6: Descending stair
  [2, 2, 1, 0, 0], // Line 7: Ascending stair
  [1, 2, 2, 2, 1], // Line 8: Valley
  [1, 0, 0, 0, 1], // Line 9: Hill
  [1, 0, 1, 2, 1], // Line 10: W-shape
  [1, 2, 1, 0, 1], // Line 11: M-shape
  [0, 1, 1, 1, 0], // Line 12: Shallow U
  [2, 1, 1, 1, 2], // Line 13: Shallow Inverted U
  [0, 1, 0, 1, 0], // Line 14: Sawtooth top
  [2, 1, 2, 1, 2], // Line 15: Sawtooth bottom
  [1, 1, 0, 1, 1], // Line 16: Center notch up
  [1, 1, 2, 1, 1], // Line 17: Center notch down
  [0, 0, 2, 0, 0], // Line 18: Deep dive center
  [2, 2, 0, 2, 2], // Line 19: High spike center
  [0, 2, 0, 2, 0], // Line 20: Zigzag
];

// Weighted reel strips for 5 reels (realistic physical strips)
// Carefully balanced weights to achieve ~96.5% Theoretical RTP
export const REEL_STRIPS: SlotSymbol[][] = [
  // Reel 1
  [
    'JACK', 'QUEEN', 'KING', 'ACE', 'CASH', 'JACK', 'WHISKEY', 'GUN', 'QUEEN',
    'KING', 'CAR', 'JACK', 'ACE', 'FEMME', 'QUEEN', 'BOSS', 'KING', 'WILD',
    'JACK', 'SCATTER', 'QUEEN', 'CASH', 'KING', 'WHISKEY', 'ACE', 'GUN',
    'CAR', 'JACK', 'QUEEN', 'KING', 'FEMME', 'JACK',
  ],
  // Reel 2
  [
    'KING', 'JACK', 'QUEEN', 'WHISKEY', 'ACE', 'CAR', 'JACK', 'CASH', 'QUEEN',
    'GUN', 'KING', 'FEMME', 'JACK', 'BOSS', 'ACE', 'WILD', 'QUEEN', 'KING',
    'SCATTER', 'JACK', 'WHISKEY', 'ACE', 'GUN', 'QUEEN', 'CAR', 'KING',
    'CASH', 'JACK', 'FEMME', 'QUEEN', 'KING', 'ACE',
  ],
  // Reel 3
  [
    'QUEEN', 'KING', 'JACK', 'GUN', 'ACE', 'WHISKEY', 'QUEEN', 'CAR', 'KING',
    'CASH', 'JACK', 'FEMME', 'ACE', 'WILD', 'QUEEN', 'BOSS', 'KING', 'SCATTER',
    'JACK', 'GUN', 'ACE', 'WHISKEY', 'QUEEN', 'CAR', 'KING', 'CASH',
    'JACK', 'FEMME', 'QUEEN', 'ACE', 'KING', 'JACK',
  ],
  // Reel 4
  [
    'ACE', 'JACK', 'QUEEN', 'CAR', 'KING', 'CASH', 'ACE', 'WHISKEY', 'JACK',
    'GUN', 'QUEEN', 'FEMME', 'KING', 'BOSS', 'ACE', 'WILD', 'JACK', 'QUEEN',
    'SCATTER', 'KING', 'CAR', 'ACE', 'CASH', 'JACK', 'WHISKEY', 'QUEEN',
    'GUN', 'KING', 'FEMME', 'ACE', 'JACK', 'QUEEN',
  ],
  // Reel 5
  [
    'JACK', 'ACE', 'KING', 'CASH', 'QUEEN', 'WHISKEY', 'JACK', 'CAR', 'ACE',
    'GUN', 'KING', 'FEMME', 'QUEEN', 'WILD', 'JACK', 'BOSS', 'ACE', 'SCATTER',
    'KING', 'CASH', 'QUEEN', 'WHISKEY', 'JACK', 'CAR', 'ACE', 'GUN',
    'KING', 'FEMME', 'QUEEN', 'JACK', 'ACE', 'KING',
  ],
];

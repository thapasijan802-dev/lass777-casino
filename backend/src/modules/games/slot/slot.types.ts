export type SlotSymbol =
  | 'BOSS'     // The Don (Top High Symbol)
  | 'FEMME'    // Underboss / Femme Fatale (High Symbol)
  | 'GUN'      // Tommy Gun (Medium-High Symbol)
  | 'CAR'      // Vintage Gangster Coupe (Medium Symbol)
  | 'CASH'     // Cash Suitcase & Gold (Medium Symbol)
  | 'WHISKEY'  // Bourbon & Cuban Cigar (Low-Med Symbol)
  | 'ACE'      // Card Royal A (Low Symbol)
  | 'KING'     // Card Royal K (Low Symbol)
  | 'QUEEN'    // Card Royal Q (Low Symbol)
  | 'JACK'     // Card Royal J (Low Symbol)
  | 'WILD'     // Golden Skull Crest (Substitutes all except Scatter)
  | 'SCATTER'; // Bank Safe Vault (Scatter anywhere on reels)

export interface SymbolMeta {
  id: SlotSymbol;
  name: string;
  category: 'PREMIUM' | 'MEDIUM' | 'LOW' | 'SPECIAL';
  multipliers: {
    3: number;
    4: number;
    5: number;
  };
}

export interface WinningLine {
  lineIndex: number;
  symbol: SlotSymbol;
  count: number;
  lineMultiplier: number;
  winAmount: number;
  positions: Array<[number, number]>; // [colIndex, rowIndex] coordinates
}

export interface ScatterWin {
  count: number;
  multiplier: number;
  winAmount: number;
  positions: Array<[number, number]>;
}

export interface SlotSpinResult {
  roundId: string;
  reelMatrix: SlotSymbol[][]; // 5 columns x 3 rows
  paylinesWon: WinningLine[];
  scatterWin: ScatterWin | null;
  betAmount: number;
  lineWinsTotal: number;
  scatterWinsTotal: number;
  totalWin: number;
  multiplier: number;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
}

export interface SpinPayload {
  sessionToken?: string;
  userId?: string;
  betAmount: number;
  clientSeed?: string;
}

export interface GameInfoResponse {
  gameTitle: string;
  theme: string;
  reels: number;
  rows: number;
  paylinesCount: number;
  symbols: Record<SlotSymbol, { name: string; multipliers: Record<number, number> }>;
  minBet: number;
  maxBet: number;
  defaultBet: number;
}

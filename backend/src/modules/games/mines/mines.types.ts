export type MinesSessionStatus = 'ACTIVE' | 'CASHED_OUT' | 'EXPLODED';

export interface StartMinesDto {
  betAmount: number;
  mineCount: number; // 1 to 24
  clientSeed?: string;
  mode?: 'REAL' | 'DEMO';
}

export interface RevealTileDto {
  sessionId: string;
  tileIndex: number; // 0 to 24
  mode?: 'REAL' | 'DEMO';
}

export interface CashoutMinesDto {
  sessionId: string;
  mode?: 'REAL' | 'DEMO';
}

export interface MinesSessionView {
  sessionId: string;
  betAmount: number;
  mineCount: number;
  revealedTiles: number[];
  currentMultiplier: number;
  nextMultiplier?: number;
  cashoutValue: number;
  status: MinesSessionStatus;
  minePositions?: number[]; // Only populated when EXPLODED or CASHED_OUT
  payout?: number;
  newBalance?: {
    realBalance: number;
    bonusBalance: number;
    totalBalance: number;
  };
}

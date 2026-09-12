export type CrashGameState = 'BETTING' | 'RUNNING' | 'CRASHED';

export interface CrashPlayerBet {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  betAmount: number;
  autoCashoutMultiplier?: number;
  cashedOut: boolean;
  cashoutMultiplier?: number;
  payout?: number;
  betIndex: number; // 0 or 1 for dual bet panels
  isBot?: boolean;
}

export interface CrashRoundState {
  roundId: string;
  status: CrashGameState;
  crashPoint: number;
  currentMultiplier: number;
  startTime: number;
  bettingCountdown: number;
  bets: CrashPlayerBet[];
  recentCrashes: number[];
  serverSeedHash: string;
}

export interface PlaceBetDto {
  betAmount: number;
  autoCashoutMultiplier?: number;
  mode?: 'REAL' | 'DEMO';
  betIndex?: number;
  token?: string;
}

export interface CashoutDto {
  betId?: string;
  betIndex?: number;
  token?: string;
}

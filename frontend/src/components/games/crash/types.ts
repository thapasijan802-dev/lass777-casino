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
  betIndex: number;
  isBot?: boolean;
}

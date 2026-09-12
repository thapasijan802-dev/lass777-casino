export interface CreateSessionParams {
  userId: string;
  gameId: string;
  gameSlug: string;
  mode: 'REAL' | 'DEMO';
  currency: string;
  returnUrl?: string;
  ipAddress?: string;
}

export interface GameLaunchResult {
  launchUrl: string;
  sessionToken: string;
  provider: string;
  expiresAt: Date;
}

export interface BetParams {
  userId: string;
  sessionToken: string;
  gameSlug: string;
  roundId: string;
  transactionId: string;
  amount: number;
  currency: string;
}

export interface WinParams {
  userId: string;
  sessionToken: string;
  gameSlug: string;
  roundId: string;
  transactionId: string;
  amount: number;
  currency: string;
}

export interface RollbackParams {
  userId: string;
  roundId: string;
  originalTransactionId: string;
}

export interface IGameAggregatorAdapter {
  readonly name: string;
  createGameSession(params: CreateSessionParams): Promise<GameLaunchResult>;
  verifyWebhookSignature(payload: any, signature: string): boolean;
  processBet?(params: BetParams): Promise<any>;
  processWin?(params: WinParams): Promise<any>;
  processRollback?(params: RollbackParams): Promise<any>;
}

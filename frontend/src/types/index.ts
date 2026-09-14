export type GameCategory = 'SLOTS' | 'CRASH' | 'FISH' | 'LIVE' | 'TABLE' | 'ORIGINALS';

export type GameProviderType =
  | 'PG_SOFT'
  | 'PRAGMATIC'
  | 'JILI'
  | 'SPRIBE'
  | 'BIGSIX'
  | 'EVOLUTION'
  | 'NETENT';

export type Volatility = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export interface Game {
  id: string;
  slug: string;
  title: string;
  description?: string;
  category: GameCategory;
  provider: GameProviderType;
  rtp: number;
  volatility: Volatility;
  thumbnail: string;
  bannerUrl?: string;
  active: boolean;
  isHot: boolean;
  isFeatured: boolean;
  playCount: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  vipLevel: number;
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface Wallet {
  id: string;
  userId: string;
  realBalance: number;
  bonusBalance: number;
  lockedBalance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  userId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'BET' | 'WIN' | 'BONUS' | 'CASHBACK';
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  paymentMethod?: string;
  txHash?: string;
  providerRef?: string;
  metadata?: string;
  createdAt: string;
}

export interface Bonus {
  id: string;
  userId: string;
  code?: string;
  type: string;
  amount: number;
  wageringRequired: number;
  wageringProgress: number;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  expiresAt: string;
}

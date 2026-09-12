import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../../common/prisma.service';
import { CrashBetStatus, CrashRoundStatus, TransactionStatus, TransactionType } from '@prisma/client';
import { CrashPlayerBet } from './crash.types';

@Injectable()
export class CrashService {
  private readonly logger = new Logger(CrashService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a 64-character hex cryptographically secure server seed.
   */
  generateServerSeed(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * SHA-256 seed hash for provably fair verification commitment.
   */
  hashSeed(seed: string): string {
    return crypto.createHash('sha256').update(seed).digest('hex');
  }

  /**
   * Provably fair Crash Point determination using standard industry algorithm.
   * Generates a realistic distribution with 3% house edge:
   * r = float in [0, 1)
   * crashPoint = max(1.00, floor(97 / (1 - r)) / 100)
   */
  generateCrashPoint(serverSeed: string, clientSeed: string, nonce: number): number {
    const hmac = crypto.createHmac('sha256', serverSeed);
    hmac.update(`${clientSeed}:${nonce}`);
    const hash = hmac.digest('hex');

    // 52-bit integer conversion (13 hex characters)
    const subHash = hash.substring(0, 13);
    const intVal = parseInt(subHash, 16);
    const maxVal = Math.pow(2, 52);

    const r = intVal / maxVal;

    // 3% instant crash at 1.00x house edge
    if (r < 0.03) {
      return 1.0;
    }

    const crash = (100 * 0.97) / (1 - r);
    const rounded = Math.floor(crash) / 100;
    return Math.max(1.0, Number(Math.min(rounded, 1000.0).toFixed(2)));
  }

  /**
   * Exponential Growth Multiplier:
   * M(t) = 1.01 * e^(0.06 * t)
   */
  calculateMultiplier(elapsedSeconds: number): number {
    if (elapsedSeconds <= 0) return 1.0;
    const mult = 1.01 * Math.exp(0.06 * elapsedSeconds);
    return Math.max(1.0, Number(mult.toFixed(2)));
  }

  /**
   * Atomically debit user balance and record pending bet in database.
   */
  async placeBetReal(userId: string, roundId: string, betAmount: number): Promise<{ success: boolean; betId: string; newBalance: any }> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const wallet = await tx.wallet.findUnique({ where: { userId } });
        if (!wallet) throw new Error('WALLET_NOT_FOUND');

        const totalFunds = wallet.realBalance + wallet.bonusBalance;
        if (totalFunds < betAmount) throw new Error('INSUFFICIENT_FUNDS');

        let deductReal = Math.min(wallet.realBalance, betAmount);
        let deductBonus = Number((betAmount - deductReal).toFixed(2));

        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            realBalance: { decrement: deductReal },
            bonusBalance: { decrement: deductBonus },
          },
        });

        const txHash = 'bet_crash_' + Math.random().toString(36).substring(2, 12);
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            userId,
            type: TransactionType.BET,
            amount: betAmount,
            currency: wallet.currency,
            status: TransactionStatus.COMPLETED,
            txHash,
            metadata: JSON.stringify({ game: 'aviator-crash', roundId }),
          },
        });

        const crashBet = await tx.crashBet.create({
          data: {
            userId,
            roundId,
            betAmount,
            status: CrashBetStatus.PENDING,
          },
        });

        return {
          success: true,
          betId: crashBet.id,
          newBalance: {
            realBalance: updatedWallet.realBalance,
            bonusBalance: updatedWallet.bonusBalance,
            totalBalance: updatedWallet.realBalance + updatedWallet.bonusBalance,
          },
        };
      });
    } catch (err: any) {
      this.logger.error(`Failed to place real crash bet: ${err.message}`);
      throw err;
    }
  }

  /**
   * Atomically cash out a player bet and credit win to wallet.
   */
  async cashoutBetReal(betId: string, userId: string, multiplier: number): Promise<{ success: boolean; payout: number; newBalance: any }> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const bet = await tx.crashBet.findUnique({ where: { id: betId } });
        if (!bet || bet.userId !== userId) throw new Error('BET_NOT_FOUND');
        if (bet.status !== CrashBetStatus.PENDING) throw new Error('ALREADY_SETTLED');

        const payout = Number((bet.betAmount * multiplier).toFixed(2));

        const wallet = await tx.wallet.findUnique({ where: { userId } });
        if (!wallet) throw new Error('WALLET_NOT_FOUND');

        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            realBalance: { increment: payout },
          },
        });

        const txHash = 'win_crash_' + Math.random().toString(36).substring(2, 12);
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            userId,
            type: TransactionType.WIN,
            amount: payout,
            currency: wallet.currency,
            status: TransactionStatus.COMPLETED,
            txHash,
            metadata: JSON.stringify({ game: 'aviator-crash', multiplier }),
          },
        });

        await tx.crashBet.update({
          where: { id: betId },
          data: {
            cashoutMultiplier: multiplier,
            payout,
            status: CrashBetStatus.CASHED_OUT,
          },
        });

        return {
          success: true,
          payout,
          newBalance: {
            realBalance: updatedWallet.realBalance,
            bonusBalance: updatedWallet.bonusBalance,
            totalBalance: updatedWallet.realBalance + updatedWallet.bonusBalance,
          },
        };
      });
    } catch (err: any) {
      this.logger.error(`Failed to cash out crash bet ${betId}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Records completed round and updates busted bets in database.
   */
  async settleRoundReal(roundId: string, crashPoint: number, serverSeed: string, serverSeedHash: string, nonce: number) {
    try {
      await this.prisma.$transaction(async (tx) => {
        // Create or update CrashRound
        await tx.crashRound.upsert({
          where: { id: roundId },
          create: {
            id: roundId,
            crashPoint,
            serverSeed,
            serverSeedHash,
            nonce,
            status: CrashRoundStatus.CRASHED,
            crashedAt: new Date(),
          },
          update: {
            crashPoint,
            status: CrashRoundStatus.CRASHED,
            crashedAt: new Date(),
          },
        });

        // Mark remaining pending bets as BUSTED
        await tx.crashBet.updateMany({
          where: {
            roundId,
            status: CrashBetStatus.PENDING,
          },
          data: {
            status: CrashBetStatus.BUSTED,
          },
        });
      });
    } catch (err: any) {
      this.logger.warn(`Could not settle crash round in DB (likely offline/mock): ${err.message}`);
    }
  }
}

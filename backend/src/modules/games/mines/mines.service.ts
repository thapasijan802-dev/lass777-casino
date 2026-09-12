import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../../common/prisma.service';
import { MinesSessionStatus, TransactionStatus, TransactionType } from '@prisma/client';
import { MinesSessionView, StartMinesDto } from './mines.types';

interface DemoSession {
  sessionId: string;
  betAmount: number;
  mineCount: number;
  minePositions: number[];
  revealedTiles: number[];
  currentMultiplier: number;
  status: MinesSessionStatus;
  demoBalance: number;
}

@Injectable()
export class MinesService {
  private readonly logger = new Logger(MinesService.name);
  private demoSessions = new Map<string, DemoSession>();

  constructor(private readonly prisma: PrismaService) {}

  generateServerSeed(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  hashSeed(seed: string): string {
    return crypto.createHash('sha256').update(seed).digest('hex');
  }

  /**
   * Deterministically generates `mineCount` unique positions (0-24) using Fisher-Yates with HMAC-SHA256.
   */
  generateMinePositions(serverSeed: string, clientSeed: string, nonce: number, mineCount: number): number[] {
    const tiles = Array.from({ length: 25 }, (_, i) => i);
    const hmac = crypto.createHmac('sha256', serverSeed);
    hmac.update(`${clientSeed}:${nonce}`);
    const hash = hmac.digest('hex');

    // Deterministic shuffle
    for (let i = 24; i > 0; i--) {
      const sub = hash.substring((24 - i) * 2, (24 - i) * 2 + 4) || '1a2b';
      const intVal = parseInt(sub, 16);
      const j = intVal % (i + 1);
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }

    return tiles.slice(0, mineCount).sort((a, b) => a - b);
  }

  /**
   * Stake-standard Multiplier Formula with 97% RTP:
   * M_k = 0.97 * Product_{i=0}^{k-1} ((25 - i) / (25 - mineCount - i))
   */
  calculateMultiplier(revealedCount: number, mineCount: number): number {
    if (revealedCount <= 0) return 1.0;
    let mult = 0.97;
    for (let i = 0; i < revealedCount; i++) {
      mult *= (25 - i) / (25 - mineCount - i);
    }
    return Number(Math.max(1.01, mult).toFixed(2));
  }

  getNextMultiplier(revealedCount: number, mineCount: number): number {
    const safeTilesTotal = 25 - mineCount;
    if (revealedCount >= safeTilesTotal) return this.calculateMultiplier(revealedCount, mineCount);
    return this.calculateMultiplier(revealedCount + 1, mineCount);
  }

  /**
   * Start Game Session (Real or Demo)
   */
  async startGame(userId: string | null, dto: StartMinesDto): Promise<MinesSessionView> {
    const betAmount = Number(dto.betAmount);
    const mineCount = Number(dto.mineCount);

    if (isNaN(betAmount) || betAmount < 1 || betAmount > 500) {
      throw new BadRequestException('Bet amount must be between $1.00 and $500.00');
    }

    if (isNaN(mineCount) || mineCount < 1 || mineCount > 24) {
      throw new BadRequestException('Mine count must be between 1 and 24');
    }

    const serverSeed = this.generateServerSeed();
    const clientSeed = dto.clientSeed || 'client_mines_' + Math.random().toString(36).substring(2, 8);
    const nonce = 1;
    const minePositions = this.generateMinePositions(serverSeed, clientSeed, nonce, mineCount);

    // REAL MONEY MODE
    if (dto.mode === 'REAL' && userId) {
      try {
        const result = await this.prisma.$transaction(async (tx) => {
          const wallet = await tx.wallet.findUnique({ where: { userId } });
          if (!wallet) throw new NotFoundException('Wallet not found');

          const totalFunds = wallet.realBalance + wallet.bonusBalance;
          if (totalFunds < betAmount) throw new BadRequestException('Insufficient balance');

          let deductReal = Math.min(wallet.realBalance, betAmount);
          let deductBonus = Number((betAmount - deductReal).toFixed(2));

          const updatedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              realBalance: { decrement: deductReal },
              bonusBalance: { decrement: deductBonus },
            },
          });

          const txHash = 'bet_mines_' + Math.random().toString(36).substring(2, 12);
          await tx.transaction.create({
            data: {
              walletId: wallet.id,
              userId,
              type: TransactionType.BET,
              amount: betAmount,
              currency: wallet.currency,
              status: TransactionStatus.COMPLETED,
              txHash,
              metadata: JSON.stringify({ game: 'mines', mineCount }),
            },
          });

          const session = await tx.minesSession.create({
            data: {
              userId,
              betAmount,
              mineCount,
              minePositions,
              revealedTiles: [],
              currentMultiplier: 1.0,
              status: MinesSessionStatus.ACTIVE,
              serverSeed,
              clientSeed,
              nonce,
            },
          });

          return {
            session,
            newBalance: {
              realBalance: updatedWallet.realBalance,
              bonusBalance: updatedWallet.bonusBalance,
              totalBalance: updatedWallet.realBalance + updatedWallet.bonusBalance,
            },
          };
        });

        return {
          sessionId: result.session.id,
          betAmount,
          mineCount,
          revealedTiles: [],
          currentMultiplier: 1.0,
          nextMultiplier: this.getNextMultiplier(0, mineCount),
          cashoutValue: betAmount,
          status: 'ACTIVE',
          newBalance: result.newBalance,
        };
      } catch (err: any) {
        if (err.status) throw err;
        this.logger.warn(`Fallback to demo mode due to DB warning: ${err.message}`);
      }
    }

    // DEMO MODE
    const demoSessionId = 'dmines_' + Math.random().toString(36).substring(2, 10);
    this.demoSessions.set(demoSessionId, {
      sessionId: demoSessionId,
      betAmount,
      mineCount,
      minePositions,
      revealedTiles: [],
      currentMultiplier: 1.0,
      status: 'ACTIVE',
      demoBalance: 1000.0 - betAmount,
    });

    return {
      sessionId: demoSessionId,
      betAmount,
      mineCount,
      revealedTiles: [],
      currentMultiplier: 1.0,
      nextMultiplier: this.getNextMultiplier(0, mineCount),
      cashoutValue: betAmount,
      status: 'ACTIVE',
      newBalance: {
        realBalance: 0,
        bonusBalance: 0,
        totalBalance: 1000.0 - betAmount,
      },
    };
  }

  /**
   * Reveal a tile on the 5x5 grid (0 to 24)
   */
  async revealTile(userId: string | null, sessionId: string, tileIndex: number): Promise<MinesSessionView> {
    if (tileIndex < 0 || tileIndex > 24) {
      throw new BadRequestException('Invalid tile index (0-24)');
    }

    // Check if DEMO session
    if (sessionId.startsWith('dmines_')) {
      const session = this.demoSessions.get(sessionId);
      if (!session) throw new NotFoundException('Session not found');
      if (session.status !== 'ACTIVE') throw new BadRequestException('Session is no longer active');
      if (session.revealedTiles.includes(tileIndex)) throw new BadRequestException('Tile already revealed');

      const isMine = session.minePositions.includes(tileIndex);

      if (isMine) {
        session.status = 'EXPLODED';
        session.revealedTiles.push(tileIndex);
        return {
          sessionId,
          betAmount: session.betAmount,
          mineCount: session.mineCount,
          revealedTiles: session.revealedTiles,
          currentMultiplier: 0,
          cashoutValue: 0,
          status: 'EXPLODED',
          minePositions: session.minePositions,
        };
      }

      session.revealedTiles.push(tileIndex);
      const newMultiplier = this.calculateMultiplier(session.revealedTiles.length, session.mineCount);
      session.currentMultiplier = newMultiplier;
      const cashoutValue = Number((session.betAmount * newMultiplier).toFixed(2));

      // Check auto cashout if all safe gems cleared
      const safeTilesTotal = 25 - session.mineCount;
      if (session.revealedTiles.length >= safeTilesTotal) {
        session.status = 'CASHED_OUT';
        session.demoBalance += cashoutValue;
        return {
          sessionId,
          betAmount: session.betAmount,
          mineCount: session.mineCount,
          revealedTiles: session.revealedTiles,
          currentMultiplier: newMultiplier,
          cashoutValue,
          payout: cashoutValue,
          status: 'CASHED_OUT',
          minePositions: session.minePositions,
          newBalance: {
            realBalance: 0,
            bonusBalance: 0,
            totalBalance: session.demoBalance,
          },
        };
      }

      return {
        sessionId,
        betAmount: session.betAmount,
        mineCount: session.mineCount,
        revealedTiles: session.revealedTiles,
        currentMultiplier: newMultiplier,
        nextMultiplier: this.getNextMultiplier(session.revealedTiles.length, session.mineCount),
        cashoutValue,
        status: 'ACTIVE',
      };
    }

    // REAL MONEY MODE (Database-driven)
    const session = await this.prisma.minesSession.findUnique({ where: { id: sessionId } });
    if (!session || (userId && session.userId !== userId)) {
      throw new NotFoundException('Session not found');
    }
    if (session.status !== MinesSessionStatus.ACTIVE) {
      throw new BadRequestException('Session is no longer active');
    }
    if (session.revealedTiles.includes(tileIndex)) {
      throw new BadRequestException('Tile already revealed');
    }

    const isMine = session.minePositions.includes(tileIndex);

    if (isMine) {
      await this.prisma.minesSession.update({
        where: { id: sessionId },
        data: {
          status: MinesSessionStatus.EXPLODED,
          revealedTiles: { push: tileIndex },
        },
      });

      return {
        sessionId,
        betAmount: session.betAmount,
        mineCount: session.mineCount,
        revealedTiles: [...session.revealedTiles, tileIndex],
        currentMultiplier: 0,
        cashoutValue: 0,
        status: 'EXPLODED',
        minePositions: session.minePositions,
      };
    }

    // Safe Tile
    const newRevealed = [...session.revealedTiles, tileIndex];
    const newMultiplier = this.calculateMultiplier(newRevealed.length, session.mineCount);
    const cashoutValue = Number((session.betAmount * newMultiplier).toFixed(2));
    const safeTilesTotal = 25 - session.mineCount;

    if (newRevealed.length >= safeTilesTotal) {
      // Auto cashout on perfect clear
      return this.cashout(userId, sessionId);
    }

    await this.prisma.minesSession.update({
      where: { id: sessionId },
      data: {
        revealedTiles: { push: tileIndex },
        currentMultiplier: newMultiplier,
      },
    });

    return {
      sessionId,
      betAmount: session.betAmount,
      mineCount: session.mineCount,
      revealedTiles: newRevealed,
      currentMultiplier: newMultiplier,
      nextMultiplier: this.getNextMultiplier(newRevealed.length, session.mineCount),
      cashoutValue,
      status: 'ACTIVE',
    };
  }

  /**
   * Cash Out Accumulated Win
   */
  async cashout(userId: string | null, sessionId: string): Promise<MinesSessionView> {
    if (sessionId.startsWith('dmines_')) {
      const session = this.demoSessions.get(sessionId);
      if (!session) throw new NotFoundException('Session not found');
      if (session.status !== 'ACTIVE') throw new BadRequestException('Session is no longer active');

      const payout = Number((session.betAmount * session.currentMultiplier).toFixed(2));
      session.status = 'CASHED_OUT';
      session.demoBalance = Number((session.demoBalance + payout).toFixed(2));

      return {
        sessionId,
        betAmount: session.betAmount,
        mineCount: session.mineCount,
        revealedTiles: session.revealedTiles,
        currentMultiplier: session.currentMultiplier,
        cashoutValue: payout,
        payout,
        status: 'CASHED_OUT',
        minePositions: session.minePositions,
        newBalance: {
          realBalance: 0,
          bonusBalance: 0,
          totalBalance: session.demoBalance,
        },
      };
    }

    // REAL MONEY CASHOUT
    return await this.prisma.$transaction(async (tx) => {
      const session = await tx.minesSession.findUnique({ where: { id: sessionId } });
      if (!session || (userId && session.userId !== userId)) throw new NotFoundException('Session not found');
      if (session.status !== MinesSessionStatus.ACTIVE) throw new BadRequestException('Session is not active');

      const payout = Number((session.betAmount * session.currentMultiplier).toFixed(2));

      const wallet = await tx.wallet.findUnique({ where: { userId: session.userId } });
      if (!wallet) throw new NotFoundException('Wallet not found');

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          realBalance: { increment: payout },
        },
      });

      const txHash = 'win_mines_' + Math.random().toString(36).substring(2, 12);
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          userId: session.userId,
          type: TransactionType.WIN,
          amount: payout,
          currency: wallet.currency,
          status: TransactionStatus.COMPLETED,
          txHash,
          metadata: JSON.stringify({ game: 'mines', multiplier: session.currentMultiplier }),
        },
      });

      await tx.minesSession.update({
        where: { id: sessionId },
        data: {
          status: MinesSessionStatus.CASHED_OUT,
        },
      });

      return {
        sessionId,
        betAmount: session.betAmount,
        mineCount: session.mineCount,
        revealedTiles: session.revealedTiles,
        currentMultiplier: session.currentMultiplier,
        cashoutValue: payout,
        payout,
        status: 'CASHED_OUT' as const,
        minePositions: session.minePositions,
        newBalance: {
          realBalance: updatedWallet.realBalance,
          bonusBalance: updatedWallet.bonusBalance,
          totalBalance: updatedWallet.realBalance + updatedWallet.bonusBalance,
        },
      };
    });
  }
}

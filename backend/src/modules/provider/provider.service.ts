import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { RedisService } from '../../common/redis.service';
import { MockAggregatorAdapter } from './adapters/mock-aggregator.adapter';
import { SoftSwissAdapter } from './adapters/softswiss.adapter';
import { SlotegratorAdapter } from './adapters/slotegrator.adapter';
import { IGameAggregatorAdapter } from './interfaces/aggregator-adapter.interface';
import { BonusStatus, GameMode, SessionStatus, TransactionStatus, TransactionType } from '@prisma/client';

export interface LaunchGameDto {
  gameSlug: string;
  mode?: 'REAL' | 'DEMO';
  returnUrl?: string;
}

export interface GameActionCallbackDto {
  sessionToken: string;
  roundId: string;
  transactionId: string;
  amount: number;
  gameSlug: string;
}

@Injectable()
export class ProviderService {
  private readonly logger = new Logger(ProviderService.name);
  private adapters = new Map<string, IGameAggregatorAdapter>();

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private mockAdapter: MockAggregatorAdapter,
    private softswissAdapter: SoftSwissAdapter,
    private slotegratorAdapter: SlotegratorAdapter,
  ) {
    this.adapters.set('MOCK', this.mockAdapter);
    this.adapters.set('SOFTSWISS', this.softswissAdapter);
    this.adapters.set('SLOTEGRATOR', this.slotegratorAdapter);
  }

  getAdapter(): IGameAggregatorAdapter {
    const active = (process.env.ACTIVE_AGGREGATOR || 'MOCK').toUpperCase();
    return this.adapters.get(active) || this.mockAdapter;
  }

  async launchGame(userId: string | null, dto: LaunchGameDto) {
    const mode = dto.mode || 'REAL';

    // 1. Validate Game exists
    const game = await this.prisma.game.findUnique({
      where: { slug: dto.gameSlug },
    });

    if (!game || !game.active) {
      throw new NotFoundException('Game not found or inactive');
    }

    // 2. If Real mode, check user balance
    let currency = 'USD';
    let userWallet: any = null;

    if (mode === 'REAL') {
      if (!userId) {
        throw new BadRequestException('Authentication required for real-money play');
      }

      userWallet = await this.prisma.wallet.findUnique({
        where: { userId },
      });

      if (!userWallet) {
        throw new NotFoundException('User wallet not found');
      }

      currency = userWallet.currency;
    }

    // 3. Delegate to selected Aggregator Adapter
    const adapter = this.getAdapter();
    const effectiveUserId = userId || 'guest_' + Math.random().toString(36).substring(2, 8);

    const result = await adapter.createGameSession({
      userId: effectiveUserId,
      gameId: game.id,
      gameSlug: game.slug,
      mode,
      currency,
      returnUrl: dto.returnUrl,
    });

    // 4. Record session in database and cache
    if (userId) {
      await this.prisma.gameSession.create({
        data: {
          userId,
          gameId: game.id,
          sessionToken: result.sessionToken,
          currency,
          mode: mode === 'REAL' ? GameMode.REAL : GameMode.DEMO,
          status: SessionStatus.ACTIVE,
        },
      });

      // Increment game popularity counter
      await this.prisma.game.update({
        where: { id: game.id },
        data: { playCount: { increment: 1 } },
      });
    }

    await this.redis.set(
      `game_session:${result.sessionToken}`,
      JSON.stringify({
        userId: effectiveUserId,
        gameId: game.id,
        gameSlug: game.slug,
        mode,
        currency,
      }),
      4 * 3600, // 4 hours
    );

    return {
      launchUrl: result.launchUrl,
      sessionToken: result.sessionToken,
      mode,
      game: {
        id: game.id,
        slug: game.slug,
        title: game.title,
        provider: game.provider,
        rtp: game.rtp,
        thumbnail: game.thumbnail,
      },
      currentBalance: userWallet ? userWallet.realBalance + userWallet.bonusBalance : 1000.0,
    };
  }

  async processBet(dto: GameActionCallbackDto) {
    const sessionData = await this.redis.get(`game_session:${dto.sessionToken}`);
    let session: any = null;
    if (sessionData) {
      session = JSON.parse(sessionData);
    }

    const userId = session?.userId;
    if (!userId || userId.startsWith('guest_') || session?.mode === 'DEMO') {
      return {
        success: true,
        mode: 'DEMO',
        newBalance: 1000.0,
      };
    }

    return await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException('Wallet not found');

      const totalAvail = wallet.realBalance + wallet.bonusBalance;
      if (totalAvail < dto.amount) {
        throw new BadRequestException('Insufficient balance to place bet');
      }

      // Deduct from real balance first, then bonus balance
      let realDeduct = Math.min(wallet.realBalance, dto.amount);
      let bonusDeduct = dto.amount - realDeduct;

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          realBalance: { decrement: realDeduct },
          bonusBalance: { decrement: bonusDeduct },
        },
      });

      // Record BET transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          userId,
          type: TransactionType.BET,
          amount: dto.amount,
          currency: wallet.currency,
          status: TransactionStatus.COMPLETED,
          providerRef: dto.gameSlug,
          metadata: JSON.stringify({
            roundId: dto.roundId,
            sessionToken: dto.sessionToken,
            txId: dto.transactionId,
          }),
        },
      });

      // Update active bonus wagering progress
      const activeBonus = await tx.bonus.findFirst({
        where: { userId, status: BonusStatus.ACTIVE },
      });

      if (activeBonus) {
        const newProgress = activeBonus.wageringProgress + dto.amount;
        const isCompleted = newProgress >= activeBonus.wageringRequired;
        await tx.bonus.update({
          where: { id: activeBonus.id },
          data: {
            wageringProgress: newProgress,
            status: isCompleted ? BonusStatus.COMPLETED : BonusStatus.ACTIVE,
          },
        });
      }

      return {
        success: true,
        transactionId: dto.transactionId,
        newBalance: {
          realBalance: updatedWallet.realBalance,
          bonusBalance: updatedWallet.bonusBalance,
          totalBalance: updatedWallet.realBalance + updatedWallet.bonusBalance,
        },
      };
    });
  }

  async processWin(dto: GameActionCallbackDto) {
    const sessionData = await this.redis.get(`game_session:${dto.sessionToken}`);
    let session: any = null;
    if (sessionData) {
      session = JSON.parse(sessionData);
    }

    const userId = session?.userId;
    if (!userId || userId.startsWith('guest_') || session?.mode === 'DEMO') {
      return {
        success: true,
        mode: 'DEMO',
        newBalance: 1000.0 + dto.amount,
      };
    }

    return await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException('Wallet not found');

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          realBalance: { increment: dto.amount },
        },
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          userId,
          type: TransactionType.WIN,
          amount: dto.amount,
          currency: wallet.currency,
          status: TransactionStatus.COMPLETED,
          providerRef: dto.gameSlug,
          metadata: JSON.stringify({
            roundId: dto.roundId,
            sessionToken: dto.sessionToken,
            txId: dto.transactionId,
          }),
        },
      });

      return {
        success: true,
        transactionId: dto.transactionId,
        newBalance: {
          realBalance: updatedWallet.realBalance,
          bonusBalance: updatedWallet.bonusBalance,
          totalBalance: updatedWallet.realBalance + updatedWallet.bonusBalance,
        },
      };
    });
  }

  async verifySession(token: string) {
    const sessionData = await this.redis.get(`game_session:${token}`);
    if (!sessionData) {
      const dbSession = await this.prisma.gameSession.findUnique({
        where: { sessionToken: token },
        include: { user: { include: { wallet: true } }, game: true },
      });
      if (!dbSession) throw new NotFoundException('Session expired or not found');
      return {
        valid: true,
        userId: dbSession.userId,
        game: dbSession.game,
        mode: dbSession.mode,
        balance: dbSession.user?.wallet?.realBalance || 0,
      };
    }

    return {
      valid: true,
      ...JSON.parse(sessionData),
    };
  }
}

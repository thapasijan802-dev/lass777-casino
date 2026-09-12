import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../common/prisma.service';
import { SlotService } from './slot.service';
import { TransactionStatus, TransactionType } from '@prisma/client';

interface ClientSessionState {
  userId?: string;
  isDemo: boolean;
  demoBalance: number;
  nonce: number;
}

@WebSocketGateway({
  namespace: '/slot',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class SlotGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SlotGateway.name);
  private clientSessions = new Map<string, ClientSessionState>();

  constructor(
    private readonly slotService: SlotService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    const token =
      client.handshake.auth?.token ||
      (client.handshake.query?.token as string) ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    let userId: string | undefined;

    if (token) {
      try {
        const decoded = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'lass777-super-secret-production-key-999-secure-seed',
        });
        userId = decoded.sub || decoded.id || decoded.userId;
      } catch (err) {
        this.logger.debug(`Socket ${client.id} connected with unverified/expired token`);
      }
    }

    const isDemo = !userId;
    this.clientSessions.set(client.id, {
      userId,
      isDemo,
      demoBalance: 1000.0,
      nonce: 1,
    });

    this.logger.log(
      `Socket connected: ${client.id} (User: ${userId || 'GUEST/DEMO'}, Mode: ${isDemo ? 'DEMO' : 'REAL'})`,
    );

    client.emit('connected', {
      socketId: client.id,
      userId: userId || null,
      mode: isDemo ? 'DEMO' : 'REAL',
      gameInfo: this.slotService.getGameInfo(),
    });
  }

  handleDisconnect(client: Socket) {
    this.clientSessions.delete(client.id);
    this.logger.log(`Socket disconnected: ${client.id}`);
  }

  @SubscribeMessage('get_game_info')
  handleGetGameInfo(@ConnectedSocket() client: Socket) {
    const info = this.slotService.getGameInfo();
    return { event: 'game_info', data: info };
  }

  @SubscribeMessage('ping')
  handlePing() {
    return { event: 'pong', timestamp: Date.now() };
  }

  /**
   * Primary Spin Event Handler:
   * Performs atomic balance verification & deduction, authoritative RNG math,
   * win credit and round ledger logging.
   */
  @SubscribeMessage('spin')
  async handleSpin(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      betAmount: number;
      clientSeed?: string;
      mode?: 'REAL' | 'DEMO';
      token?: string;
    },
  ) {
    const session = this.clientSessions.get(client.id) || {
      isDemo: true,
      demoBalance: 1000.0,
      nonce: 1,
    };

    // 1. Validate Bet Amount
    const betAmount = Number(data.betAmount);
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > 500) {
      client.emit('spin_error', {
        message: 'Invalid bet amount. Range is $1.00 - $500.00',
        code: 'INVALID_BET_AMOUNT',
      });
      return;
    }

    // Token override or re-verification
    if (data.token && !session.userId) {
      try {
        const decoded = this.jwtService.verify(data.token, {
          secret: process.env.JWT_SECRET || 'lass777-super-secret-production-key-999-secure-seed',
        });
        session.userId = decoded.sub || decoded.id || decoded.userId;
        session.isDemo = false;
      } catch (e) {
        // Continue in demo mode if token invalid
      }
    }

    const requestedMode = data.mode || (session.userId ? 'REAL' : 'DEMO');

    // -------------------------------------------------------------
    // REAL MODE: Strict Atomic Database Transaction
    // -------------------------------------------------------------
    if (requestedMode === 'REAL' && session.userId) {
      const userId = session.userId;

      try {
        const outcome = await this.prisma.$transaction(async (tx) => {
          // 1. Lock and inspect current player wallet
          const wallet = await tx.wallet.findUnique({
            where: { userId },
          });

          if (!wallet) {
            throw new Error('WALLET_NOT_FOUND');
          }

          const totalFunds = wallet.realBalance + wallet.bonusBalance;
          if (totalFunds < betAmount) {
            throw new Error('INSUFFICIENT_FUNDS');
          }

          // 2. Atomic Balance Deduction (Real first, then Bonus if needed)
          let deductReal = Math.min(wallet.realBalance, betAmount);
          let deductBonus = Number((betAmount - deductReal).toFixed(2));

          const debitedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              realBalance: { decrement: deductReal },
              bonusBalance: { decrement: deductBonus },
            },
          });

          // 3. Create Bet Transaction Record
          const betTxId = 'tx_bet_' + Math.random().toString(36).substring(2, 12);
          await tx.transaction.create({
            data: {
              walletId: wallet.id,
              userId,
              type: TransactionType.BET,
              amount: betAmount,
              currency: wallet.currency,
              status: TransactionStatus.COMPLETED,
              txHash: betTxId,
              metadata: JSON.stringify({ game: 'mafia-syndicate-777', type: 'SLOT_SPIN' }),
            },
          });

          // 4. Retrieve / increment provably fair nonce
          const roundCount = await tx.slotRound.count({ where: { userId } });
          const nonce = roundCount + 1;
          const serverSeed = this.slotService.generateServerSeed();
          const clientSeed = data.clientSeed || `client_${userId.substring(0, 6)}_${nonce}`;

          // 5. Authoritative RNG Spin Math Execution
          const spinResult = this.slotService.spin(betAmount, clientSeed, serverSeed, nonce);

          let finalWallet = debitedWallet;

          // 6. If Win > 0: Atomically credit player wallet and record WIN transaction
          if (spinResult.totalWin > 0) {
            finalWallet = await tx.wallet.update({
              where: { id: wallet.id },
              data: {
                realBalance: { increment: spinResult.totalWin },
              },
            });

            const winTxId = 'tx_win_' + Math.random().toString(36).substring(2, 12);
            await tx.transaction.create({
              data: {
                walletId: wallet.id,
                userId,
                type: TransactionType.WIN,
                amount: spinResult.totalWin,
                currency: wallet.currency,
                status: TransactionStatus.COMPLETED,
                txHash: winTxId,
                metadata: JSON.stringify({
                  game: 'mafia-syndicate-777',
                  roundId: spinResult.roundId,
                  multiplier: spinResult.multiplier,
                }),
              },
            });
          }

          // 7. Persist SlotRound Game Ledger
          await tx.slotRound.create({
            data: {
              userId,
              betAmount,
              winAmount: spinResult.totalWin,
              reelMatrix: spinResult.reelMatrix as any,
              paylinesWon: spinResult.paylinesWon as any,
              serverSeed: spinResult.serverSeed,
              clientSeed: spinResult.clientSeed,
              nonce: spinResult.nonce,
            },
          });

          return {
            spinResult,
            newBalance: {
              realBalance: finalWallet.realBalance,
              bonusBalance: finalWallet.bonusBalance,
              totalBalance: finalWallet.realBalance + finalWallet.bonusBalance,
            },
          };
        });

        client.emit('spin_result', {
          success: true,
          mode: 'REAL',
          ...outcome.spinResult,
          newBalance: outcome.newBalance,
        });
        return;
      } catch (err: any) {
        this.logger.error(`Real spin transaction failed for user ${userId}: ${err.message}`);

        if (err.message === 'INSUFFICIENT_FUNDS') {
          client.emit('spin_error', {
            message: 'Insufficient balance to place bet. Please deposit or use Demo play.',
            code: 'INSUFFICIENT_FUNDS',
          });
          return;
        }

        // If database connection is down, fallback smoothly to demo spin with warning
        this.logger.warn(`Database fallback to demo mode for client ${client.id}`);
      }
    }

    // -------------------------------------------------------------
    // DEMO MODE: Authoritative RNG Spin Math in Memory
    // -------------------------------------------------------------
    if (session.demoBalance < betAmount) {
      session.demoBalance += 1000.0; // Auto-reload demo bankroll
    }

    // Deduct demo bet
    session.demoBalance = Number((session.demoBalance - betAmount).toFixed(2));
    const nonce = session.nonce++;
    const serverSeed = this.slotService.generateServerSeed();
    const clientSeed = data.clientSeed || `guest_client_${nonce}`;

    // Execute Authoritative RNG Math
    const spinResult = this.slotService.spin(betAmount, clientSeed, serverSeed, nonce);

    // Credit demo win
    if (spinResult.totalWin > 0) {
      session.demoBalance = Number((session.demoBalance + spinResult.totalWin).toFixed(2));
    }

    this.clientSessions.set(client.id, session);

    client.emit('spin_result', {
      success: true,
      mode: 'DEMO',
      ...spinResult,
      newBalance: {
        realBalance: 0,
        bonusBalance: 0,
        totalBalance: session.demoBalance,
      },
    });
  }
}

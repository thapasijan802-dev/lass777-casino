import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { CrashService } from './crash.service';
import { CashoutDto, CrashGameState, CrashPlayerBet, PlaceBetDto } from './crash.types';

const BOT_NAMES = [
  'Viper_VIP', 'GoldenDragon88', 'CryptoKing99', 'StakeMaster', 'AcesHigh',
  'LuckyLady7', 'RedBaron', 'ZeusOrb', 'HighRoller77', 'ShadowBet',
  'NeoMatrix', 'DiamondHands', 'SkyWalker', 'ApexPredator', 'MoonRider',
];

@WebSocketGateway({
  namespace: '/crash',
  cors: { origin: '*', credentials: true },
})
export class CrashGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CrashGateway.name);

  // Centralized Game State
  private roundId: string = 'crash_init';
  private status: CrashGameState = 'BETTING';
  private crashPoint: number = 1.0;
  private currentMultiplier: number = 1.0;
  private startTime: number = 0;
  private bettingCountdown: number = 5;
  private activeBets: Map<string, CrashPlayerBet> = new Map(); // key = socketId_betIndex
  private recentCrashes: number[] = [1.84, 1.12, 4.25, 2.05, 1.03, 7.82, 1.45, 12.6, 2.31, 1.95];
  private currentServerSeed: string = '';
  private currentServerSeedHash: string = '';
  private roundNonce: number = 1;

  // Timers
  private loopInterval: NodeJS.Timeout | null = null;
  private countdownInterval: NodeJS.Timeout | null = null;

  // Player session cache (socketId -> { userId, isDemo, demoBalance, username })
  private socketSessions: Map<string, { userId?: string; isDemo: boolean; demoBalance: number; username: string }> = new Map();

  constructor(
    private readonly crashService: CrashService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit() {
    this.logger.log('Aviator/Crash WebSocket Gateway Initialized. Starting Central Game Loop...');
    this.startNewBettingRound();
  }

  handleConnection(client: Socket) {
    const token =
      client.handshake.auth?.token ||
      (client.handshake.query?.token as string) ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    let userId: string | undefined;
    let username = 'Player_' + client.id.substring(0, 5);

    if (token) {
      try {
        const decoded = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'lass777-super-secret-production-key-999-secure-seed',
        });
        userId = decoded.sub || decoded.id || decoded.userId;
        if (decoded.username) username = decoded.username;
      } catch (err) {
        // Continue as demo guest
      }
    }

    this.socketSessions.set(client.id, {
      userId,
      isDemo: !userId,
      demoBalance: 1000.0,
      username,
    });

    // Send full current game snapshot to connected client
    client.emit('game_snapshot', {
      roundId: this.roundId,
      status: this.status,
      currentMultiplier: this.currentMultiplier,
      bettingCountdown: this.bettingCountdown,
      bets: Array.from(this.activeBets.values()),
      recentCrashes: this.recentCrashes.slice(-12),
      serverSeedHash: this.currentServerSeedHash,
    });
  }

  handleDisconnect(client: Socket) {
    this.socketSessions.delete(client.id);
  }

  @SubscribeMessage('ping')
  handlePing() {
    return { event: 'pong', timestamp: Date.now() };
  }

  @SubscribeMessage('get_state')
  handleGetState() {
    return {
      roundId: this.roundId,
      status: this.status,
      currentMultiplier: this.currentMultiplier,
      bettingCountdown: this.bettingCountdown,
      bets: Array.from(this.activeBets.values()),
      recentCrashes: this.recentCrashes.slice(-12),
    };
  }

  /**
   * State 1: 5-Second Betting Window Countdown
   */
  private startNewBettingRound() {
    this.status = 'BETTING';
    this.currentMultiplier = 1.0;
    this.bettingCountdown = 5;
    this.activeBets.clear();
    this.roundId = 'cr_' + Math.random().toString(36).substring(2, 10);
    this.roundNonce++;

    // Prepare provably fair seed and crash point
    this.currentServerSeed = this.crashService.generateServerSeed();
    this.currentServerSeedHash = this.crashService.hashSeed(this.currentServerSeed);
    this.crashPoint = this.crashService.generateCrashPoint(
      this.currentServerSeed,
      'lass777_crash_client_seed',
      this.roundNonce,
    );

    // Spawn 4-8 simulated social bot bets
    this.generateSimulatedBotBets();

    this.server.emit('betting_started', {
      roundId: this.roundId,
      countdown: this.bettingCountdown,
      serverSeedHash: this.currentServerSeedHash,
      bets: Array.from(this.activeBets.values()),
      recentCrashes: this.recentCrashes.slice(-12),
    });

    if (this.countdownInterval) clearInterval(this.countdownInterval);

    this.countdownInterval = setInterval(() => {
      this.bettingCountdown -= 1;
      this.server.emit('betting_countdown', { countdown: this.bettingCountdown });

      if (this.bettingCountdown <= 0) {
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.startFlyingRound();
      }
    }, 1000);
  }

  /**
   * State 2: Flight Growth Phase (Ticks every 50ms)
   */
  private startFlyingRound() {
    this.status = 'RUNNING';
    this.startTime = Date.now();
    this.currentMultiplier = 1.0;

    this.server.emit('flight_started', {
      roundId: this.roundId,
      startTime: this.startTime,
      bets: Array.from(this.activeBets.values()),
    });

    if (this.loopInterval) clearInterval(this.loopInterval);

    this.loopInterval = setInterval(() => {
      const elapsedSeconds = (Date.now() - this.startTime) / 1000;
      this.currentMultiplier = this.crashService.calculateMultiplier(elapsedSeconds);

      // Check auto-cashouts for real and bot bets
      this.checkAutoCashouts(this.currentMultiplier);

      // Broadcast high-frequency multiplier update
      this.server.emit('multiplier_update', {
        multiplier: this.currentMultiplier,
        elapsed: elapsedSeconds,
      });

      // Crash Trigger
      if (this.currentMultiplier >= this.crashPoint) {
        this.triggerCrash();
      }
    }, 50);
  }

  /**
   * Checks auto-cashout conditions for bets with configured multipliers
   */
  private checkAutoCashouts(multiplier: number) {
    this.activeBets.forEach(async (bet, key) => {
      if (!bet.cashedOut && bet.autoCashoutMultiplier && multiplier >= bet.autoCashoutMultiplier) {
        this.executeCashout(key, bet.autoCashoutMultiplier);
      } else if (bet.isBot && !bet.cashedOut && bet.autoCashoutMultiplier && multiplier >= bet.autoCashoutMultiplier) {
        bet.cashedOut = true;
        bet.cashoutMultiplier = bet.autoCashoutMultiplier;
        bet.payout = Number((bet.betAmount * bet.cashoutMultiplier).toFixed(2));
        this.server.emit('player_cashed_out', {
          id: bet.id,
          username: bet.username,
          multiplier: bet.cashoutMultiplier,
          payout: bet.payout,
          betIndex: bet.betIndex,
        });
      }
    });
  }

  /**
   * State 3: Crash Trigger & Settlement
   */
  private triggerCrash() {
    if (this.loopInterval) clearInterval(this.loopInterval);
    this.status = 'CRASHED';

    const finalCrash = this.crashPoint;
    this.recentCrashes.push(finalCrash);
    if (this.recentCrashes.length > 20) this.recentCrashes.shift();

    // Settle database rounds
    this.crashService.settleRoundReal(
      this.roundId,
      finalCrash,
      this.currentServerSeed,
      this.currentServerSeedHash,
      this.roundNonce,
    );

    this.server.emit('game_crashed', {
      roundId: this.roundId,
      crashPoint: finalCrash,
      recentCrashes: this.recentCrashes.slice(-12),
    });

    // Wait 3.5s before opening the next betting round
    setTimeout(() => {
      this.startNewBettingRound();
    }, 3500);
  }

  /**
   * Handles user bet placement (Supports dual bets: betIndex 0 or 1)
   */
  @SubscribeMessage('place_bet')
  async handlePlaceBet(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: PlaceBetDto,
  ) {
    if (this.status !== 'BETTING') {
      client.emit('bet_error', { message: 'Betting is closed for current round. Wait for next round.', betIndex: data.betIndex });
      return;
    }

    const betAmount = Number(data.betAmount);
    if (isNaN(betAmount) || betAmount < 1 || betAmount > 1000) {
      client.emit('bet_error', { message: 'Invalid bet amount ($1.00 - $1,000.00)', betIndex: data.betIndex });
      return;
    }

    const betIndex = data.betIndex ?? 0;
    const betKey = `${client.id}_${betIndex}`;

    if (this.activeBets.has(betKey)) {
      client.emit('bet_error', { message: 'Bet already placed on this panel', betIndex });
      return;
    }

    const session = this.socketSessions.get(client.id) || {
      isDemo: true,
      demoBalance: 1000.0,
      username: 'Guest',
    };

    const autoCashout = data.autoCashoutMultiplier && data.autoCashoutMultiplier >= 1.01
      ? Number(data.autoCashoutMultiplier.toFixed(2))
      : undefined;

    // REAL MONEY TRANSACTION
    if (!session.isDemo && session.userId && data.mode === 'REAL') {
      try {
        const res = await this.crashService.placeBetReal(session.userId, this.roundId, betAmount);
        const playerBet: CrashPlayerBet = {
          id: res.betId,
          userId: session.userId,
          username: session.username,
          betAmount,
          autoCashoutMultiplier: autoCashout,
          cashedOut: false,
          betIndex,
        };

        this.activeBets.set(betKey, playerBet);

        client.emit('bet_placed', {
          success: true,
          betIndex,
          betId: res.betId,
          newBalance: res.newBalance,
        });

        this.server.emit('bet_broadcast', playerBet);
        return;
      } catch (err: any) {
        client.emit('bet_error', { message: err.message === 'INSUFFICIENT_FUNDS' ? 'Insufficient balance' : 'Bet error', betIndex });
        return;
      }
    }

    // DEMO MODE TRANSACTION
    if (session.demoBalance < betAmount) session.demoBalance += 1000;
    session.demoBalance = Number((session.demoBalance - betAmount).toFixed(2));
    this.socketSessions.set(client.id, session);

    const demoBetId = 'dbet_' + Math.random().toString(36).substring(2, 9);
    const playerBet: CrashPlayerBet = {
      id: demoBetId,
      userId: client.id,
      username: session.username,
      betAmount,
      autoCashoutMultiplier: autoCashout,
      cashedOut: false,
      betIndex,
    };

    this.activeBets.set(betKey, playerBet);

    client.emit('bet_placed', {
      success: true,
      betIndex,
      betId: demoBetId,
      newBalance: {
        realBalance: 0,
        bonusBalance: 0,
        totalBalance: session.demoBalance,
      },
    });

    this.server.emit('bet_broadcast', playerBet);
  }

  /**
   * Handles user cashout
   */
  @SubscribeMessage('cashout')
  async handleCashout(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CashoutDto,
  ) {
    if (this.status !== 'RUNNING') {
      client.emit('cashout_error', { message: 'Cannot cash out: Round is not in flight', betIndex: data.betIndex });
      return;
    }

    const betIndex = data.betIndex ?? 0;
    const betKey = `${client.id}_${betIndex}`;
    await this.executeCashout(betKey, this.currentMultiplier, client);
  }

  private async executeCashout(betKey: string, multiplier: number, clientSocket?: Socket) {
    const bet = this.activeBets.get(betKey);
    if (!bet || bet.cashedOut) return;

    const payout = Number((bet.betAmount * multiplier).toFixed(2));
    bet.cashedOut = true;
    bet.cashoutMultiplier = multiplier;
    bet.payout = payout;

    const [clientId] = betKey.split('_');
    const session = this.socketSessions.get(clientId);

    if (session && !session.isDemo && session.userId) {
      try {
        const res = await this.crashService.cashoutBetReal(bet.id, session.userId, multiplier);
        if (clientSocket) {
          clientSocket.emit('cashout_success', {
            betIndex: bet.betIndex,
            payout: res.payout,
            multiplier,
            newBalance: res.newBalance,
          });
        }
      } catch (err: any) {
        this.logger.error(`Real cashout error: ${err.message}`);
      }
    } else if (session) {
      // Demo credit
      session.demoBalance = Number((session.demoBalance + payout).toFixed(2));
      this.socketSessions.set(clientId, session);
      if (clientSocket) {
        clientSocket.emit('cashout_success', {
          betIndex: bet.betIndex,
          payout,
          multiplier,
          newBalance: {
            realBalance: 0,
            bonusBalance: 0,
            totalBalance: session.demoBalance,
          },
        });
      }
    }

    this.server.emit('player_cashed_out', {
      id: bet.id,
      username: bet.username,
      multiplier,
      payout,
      betIndex: bet.betIndex,
    });
  }

  /**
   * Generates simulated multiplayer bets each round to give authentic active social feel
   */
  private generateSimulatedBotBets() {
    const count = 4 + Math.floor(Math.random() * 5);
    const shuffled = [...BOT_NAMES].sort(() => 0.5 - Math.random());

    for (let i = 0; i < count; i++) {
      const username = shuffled[i];
      const betAmount = [5, 10, 20, 25, 50, 100, 200][Math.floor(Math.random() * 7)];
      // Randomized target cashout between 1.15x and 12x
      const targetMult = Number((1.15 + Math.random() * 4.5 * (Math.random() > 0.7 ? 2 : 1)).toFixed(2));

      const botBet: CrashPlayerBet = {
        id: 'bot_' + Math.random().toString(36).substring(2, 9),
        userId: 'bot_user_' + i,
        username,
        betAmount,
        autoCashoutMultiplier: targetMult,
        cashedOut: false,
        betIndex: 0,
        isBot: true,
      };

      this.activeBets.set(`bot_${i}`, botBet);
    }
  }
}

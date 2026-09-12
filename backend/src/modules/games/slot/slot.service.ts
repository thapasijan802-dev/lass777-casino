import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  PAYLINES,
  REEL_STRIPS,
  SLOT_GAME_TITLE,
  SYMBOL_CONFIG,
  TOTAL_PAYLINES,
} from './slot.constants';
import {
  GameInfoResponse,
  ScatterWin,
  SlotSpinResult,
  SlotSymbol,
  WinningLine,
} from './slot.types';

@Injectable()
export class SlotService {
  /**
   * Generates a cryptographically secure server seed.
   */
  generateServerSeed(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hashes a seed with SHA-256 for provably fair verification.
   */
  hashSeed(seed: string): string {
    return crypto.createHash('sha256').update(seed).digest('hex');
  }

  /**
   * Computes a deterministic pseudo-random float [0, 1) using HMAC-SHA256.
   */
  getDeterministicRng(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    reelIndex: number,
  ): number {
    const hmac = crypto.createHmac('sha256', serverSeed);
    hmac.update(`${clientSeed}:${nonce}:${reelIndex}`);
    const hash = hmac.digest('hex');
    // Take first 8 characters (32 bits) and divide by 0xFFFFFFFF
    const intVal = parseInt(hash.substring(0, 8), 16);
    return intVal / 0x100000000;
  }

  /**
   * Authoritative matrix generator: maps deterministic RNG to reel strip stops.
   * Returns a 5x3 matrix: 5 columns (reels), each containing 3 rows [top, center, bottom].
   */
  generateReelMatrix(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
  ): SlotSymbol[][] {
    const matrix: SlotSymbol[][] = [];

    for (let reelIdx = 0; reelIdx < 5; reelIdx++) {
      const strip = REEL_STRIPS[reelIdx];
      const stripLength = strip.length;
      const rng = this.getDeterministicRng(serverSeed, clientSeed, nonce, reelIdx);
      const stopIndex = Math.floor(rng * stripLength);

      const colSymbols: SlotSymbol[] = [
        strip[stopIndex % stripLength],
        strip[(stopIndex + 1) % stripLength],
        strip[(stopIndex + 2) % stripLength],
      ];

      matrix.push(colSymbols);
    }

    return matrix;
  }

  /**
   * Evaluates paylines from left-to-right on a 5x3 reel matrix.
   */
  evaluatePaylines(matrix: SlotSymbol[][], betAmount: number): WinningLine[] {
    const lineBet = betAmount / TOTAL_PAYLINES;
    const winningLines: WinningLine[] = [];

    PAYLINES.forEach((pattern, lineIndex) => {
      // Extract symbols along the line: [col0[row], col1[row], col2[row], col3[row], col4[row]]
      const lineSymbols: SlotSymbol[] = [];
      const positions: Array<[number, number]> = [];

      for (let col = 0; col < 5; col++) {
        const row = pattern[col];
        lineSymbols.push(matrix[col][row]);
        positions.push([col, row]);
      }

      // Ignore if leading symbol is SCATTER (Scatters are evaluated separately)
      if (lineSymbols[0] === 'SCATTER') {
        return;
      }

      // Determine the target matching symbol
      let targetSymbol: SlotSymbol | null = null;
      let matchCount = 0;

      // Find first non-wild symbol, or wild if entire sequence is wild
      for (let i = 0; i < 5; i++) {
        const sym = lineSymbols[i];
        if (sym === 'SCATTER') break;

        if (targetSymbol === null) {
          if (sym !== 'WILD') {
            targetSymbol = sym;
          }
        } else if (sym !== targetSymbol && sym !== 'WILD') {
          break;
        }
        matchCount++;
      }

      // If all matched symbols were WILD
      if (targetSymbol === null && matchCount >= 3) {
        targetSymbol = 'WILD';
      }

      if (targetSymbol && matchCount >= 3) {
        const multipliers = SYMBOL_CONFIG[targetSymbol]?.multipliers;
        const lineMultiplier = multipliers?.[matchCount as 3 | 4 | 5] || 0;

        if (lineMultiplier > 0) {
          const winAmount = Number((lineBet * lineMultiplier).toFixed(2));
          winningLines.push({
            lineIndex,
            symbol: targetSymbol,
            count: matchCount,
            lineMultiplier,
            winAmount,
            positions: positions.slice(0, matchCount),
          });
        }
      }
    });

    return winningLines;
  }

  /**
   * Evaluates Scatters appearing anywhere on the 5x3 matrix.
   */
  evaluateScatters(matrix: SlotSymbol[][], betAmount: number): ScatterWin | null {
    const scatterPositions: Array<[number, number]> = [];

    for (let col = 0; col < 5; col++) {
      for (let row = 0; row < 3; row++) {
        if (matrix[col][row] === 'SCATTER') {
          scatterPositions.push([col, row]);
        }
      }
    }

    const count = scatterPositions.length;
    if (count >= 3) {
      const scatterMultiplier = SYMBOL_CONFIG.SCATTER.multipliers[Math.min(5, count) as 3 | 4 | 5] || 0;
      const winAmount = Number((betAmount * scatterMultiplier).toFixed(2));

      return {
        count,
        multiplier: scatterMultiplier,
        winAmount,
        positions: scatterPositions,
      };
    }

    return null;
  }

  /**
   * Executes a complete authoritative spin round with provably fair RNG.
   */
  spin(
    betAmount: number,
    clientSeed: string = 'client_default_' + Math.random().toString(36).substring(2, 8),
    serverSeed: string = this.generateServerSeed(),
    nonce: number = 1,
  ): SlotSpinResult {
    const roundId = 'rnd_' + crypto.randomUUID().replace(/-/g, '').substring(0, 16);

    // 1. Authoritative matrix generation
    const reelMatrix = this.generateReelMatrix(serverSeed, clientSeed, nonce);

    // 2. Line win evaluation
    const paylinesWon = this.evaluatePaylines(reelMatrix, betAmount);
    const lineWinsTotal = Number(
      paylinesWon.reduce((sum, line) => sum + line.winAmount, 0).toFixed(2),
    );

    // 3. Scatter win evaluation
    const scatterWin = this.evaluateScatters(reelMatrix, betAmount);
    const scatterWinsTotal = scatterWin ? scatterWin.winAmount : 0;

    // 4. Total payout
    const totalWin = Number((lineWinsTotal + scatterWinsTotal).toFixed(2));
    const multiplier = Number((totalWin / betAmount).toFixed(2));

    return {
      roundId,
      reelMatrix,
      paylinesWon,
      scatterWin,
      betAmount,
      lineWinsTotal,
      scatterWinsTotal,
      totalWin,
      multiplier,
      serverSeed,
      clientSeed,
      nonce,
    };
  }

  /**
   * Returns game metadata, paytable, and rules for client init.
   */
  getGameInfo(): GameInfoResponse {
    const symbolsMeta: Record<SlotSymbol, { name: string; multipliers: Record<number, number> }> = {} as any;

    for (const key of Object.keys(SYMBOL_CONFIG) as SlotSymbol[]) {
      symbolsMeta[key] = {
        name: SYMBOL_CONFIG[key].name,
        multipliers: SYMBOL_CONFIG[key].multipliers,
      };
    }

    return {
      gameTitle: SLOT_GAME_TITLE,
      theme: 'Mafia Syndicate 1930s Underworld',
      reels: 5,
      rows: 3,
      paylinesCount: TOTAL_PAYLINES,
      symbols: symbolsMeta,
      minBet: 1,
      maxBet: 500,
      defaultBet: 10,
    };
  }
}

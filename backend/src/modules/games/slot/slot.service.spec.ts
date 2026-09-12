import { SlotService } from './slot.service';
import { SlotSymbol } from './slot.types';
import { SYMBOL_CONFIG } from './slot.constants';

describe('SlotService Unit Tests', () => {
  let slotService: SlotService;

  beforeEach(() => {
    slotService = new SlotService();
  });

  describe('Provably Fair RNG & Determinism', () => {
    it('should produce identical matrix for identical seed and nonce', () => {
      const serverSeed = 'b1a2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';
      const clientSeed = 'client_test_seed_777';
      const nonce = 42;

      const matrixA = slotService.generateReelMatrix(serverSeed, clientSeed, nonce);
      const matrixB = slotService.generateReelMatrix(serverSeed, clientSeed, nonce);

      expect(matrixA).toEqual(matrixB);
      expect(matrixA.length).toBe(5);
      matrixA.forEach((col) => expect(col.length).toBe(3));
    });

    it('should produce different matrix when nonce increments', () => {
      const serverSeed = 'b1a2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';
      const clientSeed = 'client_test_seed_777';

      const matrix1 = slotService.generateReelMatrix(serverSeed, clientSeed, 1);
      const matrix2 = slotService.generateReelMatrix(serverSeed, clientSeed, 2);

      expect(matrix1).not.toEqual(matrix2);
    });

    it('should correctly hash seed using SHA256', () => {
      const seed = 'test_seed_123';
      const hash = slotService.hashSeed(seed);
      expect(hash).toHaveLength(64);
    });
  });

  describe('Payline Evaluations & Wild Substitution', () => {
    it('should detect a 3-of-a-kind BOSS on Line 1 (middle row)', () => {
      // Line 1 pattern is [1, 1, 1, 1, 1] (row index 1 for all cols)
      const matrix: SlotSymbol[][] = [
        ['JACK', 'BOSS', 'ACE'], // Col 0: row 1 is BOSS
        ['QUEEN', 'BOSS', 'CAR'], // Col 1: row 1 is BOSS
        ['KING', 'BOSS', 'CASH'], // Col 2: row 1 is BOSS
        ['ACE', 'JACK', 'GUN'],   // Col 3: row 1 is JACK (breaks chain)
        ['CAR', 'WHISKEY', 'BOSS'], // Col 4
      ];

      const betAmount = 20; // lineBet = 20 / 20 = $1.00
      const winningLines = slotService.evaluatePaylines(matrix, betAmount);

      const line1Win = winningLines.find((w) => w.lineIndex === 0);
      expect(line1Win).toBeDefined();
      expect(line1Win?.symbol).toBe('BOSS');
      expect(line1Win?.count).toBe(3);
      expect(line1Win?.winAmount).toBe(SYMBOL_CONFIG.BOSS.multipliers[3] * 1.0);
    });

    it('should substitute WILD for adjacent symbol to complete 3-of-a-kind', () => {
      // Line 2 is top row [0, 0, 0, 0, 0]
      const matrix: SlotSymbol[][] = [
        ['GUN', 'JACK', 'ACE'],
        ['WILD', 'QUEEN', 'CAR'],
        ['GUN', 'KING', 'CASH'],
        ['ACE', 'JACK', 'GUN'],
        ['CAR', 'WHISKEY', 'BOSS'],
      ];

      const betAmount = 20; // lineBet = $1.00
      const winningLines = slotService.evaluatePaylines(matrix, betAmount);

      const line2Win = winningLines.find((w) => w.lineIndex === 1);
      expect(line2Win).toBeDefined();
      expect(line2Win?.symbol).toBe('GUN');
      expect(line2Win?.count).toBe(3);
    });

    it('should handle pure 5-of-a-kind WILD line', () => {
      // Line 1 is middle row [1, 1, 1, 1, 1]
      const matrix: SlotSymbol[][] = [
        ['ACE', 'WILD', 'ACE'],
        ['ACE', 'WILD', 'ACE'],
        ['ACE', 'WILD', 'ACE'],
        ['ACE', 'WILD', 'ACE'],
        ['ACE', 'WILD', 'ACE'],
      ];

      const betAmount = 20;
      const winningLines = slotService.evaluatePaylines(matrix, betAmount);

      const line1Win = winningLines.find((w) => w.lineIndex === 0);
      expect(line1Win).toBeDefined();
      expect(line1Win?.symbol).toBe('WILD');
      expect(line1Win?.count).toBe(5);
      expect(line1Win?.winAmount).toBe(SYMBOL_CONFIG.WILD.multipliers[5] * 1.0);
    });

    it('should award 0 line wins if no lines have 3+ matching symbols', () => {
      const matrix: SlotSymbol[][] = [
        ['JACK', 'QUEEN', 'KING'],
        ['ACE', 'BOSS', 'CAR'],
        ['GUN', 'CASH', 'WHISKEY'],
        ['JACK', 'QUEEN', 'KING'],
        ['ACE', 'BOSS', 'CAR'],
      ];

      const winningLines = slotService.evaluatePaylines(matrix, 20);
      expect(winningLines.length).toBe(0);
    });
  });

  describe('Scatter Wins Evaluation', () => {
    it('should award 5x bet multiplier for 3 Scatters anywhere', () => {
      const matrix: SlotSymbol[][] = [
        ['SCATTER', 'JACK', 'ACE'],
        ['QUEEN', 'CAR', 'CASH'],
        ['KING', 'SCATTER', 'BOSS'],
        ['ACE', 'JACK', 'GUN'],
        ['CAR', 'WHISKEY', 'SCATTER'],
      ];

      const betAmount = 50;
      const scatterWin = slotService.evaluateScatters(matrix, betAmount);

      expect(scatterWin).not.toBeNull();
      expect(scatterWin?.count).toBe(3);
      expect(scatterWin?.multiplier).toBe(5);
      expect(scatterWin?.winAmount).toBe(50 * 5);
    });

    it('should award 100x bet multiplier for 5 Scatters anywhere', () => {
      const matrix: SlotSymbol[][] = [
        ['SCATTER', 'JACK', 'ACE'],
        ['SCATTER', 'CAR', 'CASH'],
        ['SCATTER', 'BOSS', 'GUN'],
        ['SCATTER', 'JACK', 'GUN'],
        ['SCATTER', 'WHISKEY', 'BOSS'],
      ];

      const betAmount = 10;
      const scatterWin = slotService.evaluateScatters(matrix, betAmount);

      expect(scatterWin).not.toBeNull();
      expect(scatterWin?.count).toBe(5);
      expect(scatterWin?.multiplier).toBe(100);
      expect(scatterWin?.winAmount).toBe(1000);
    });

    it('should return null if fewer than 3 Scatters appear', () => {
      const matrix: SlotSymbol[][] = [
        ['SCATTER', 'JACK', 'ACE'],
        ['QUEEN', 'CAR', 'CASH'],
        ['KING', 'SCATTER', 'BOSS'],
        ['ACE', 'JACK', 'GUN'],
        ['CAR', 'WHISKEY', 'ACE'],
      ];

      const scatterWin = slotService.evaluateScatters(matrix, 20);
      expect(scatterWin).toBeNull();
    });
  });

  describe('Full Spin Execution Flow', () => {
    it('should calculate total win as lineWinsTotal + scatterWinsTotal', () => {
      const result = slotService.spin(20);

      expect(result.roundId).toMatch(/^rnd_/);
      expect(result.reelMatrix.length).toBe(5);
      expect(result.serverSeed).toBeDefined();
      expect(result.clientSeed).toBeDefined();
      expect(result.nonce).toBeGreaterThan(0);

      const expectedTotal = Number(
        (result.lineWinsTotal + result.scatterWinsTotal).toFixed(2),
      );
      expect(result.totalWin).toBe(expectedTotal);
    });

    it('should return complete game info metadata', () => {
      const info = slotService.getGameInfo();
      expect(info.gameTitle).toBe('Mafia Syndicate 777');
      expect(info.reels).toBe(5);
      expect(info.rows).toBe(3);
      expect(info.paylinesCount).toBe(20);
      expect(info.symbols.BOSS).toBeDefined();
      expect(info.symbols.WILD).toBeDefined();
      expect(info.symbols.SCATTER).toBeDefined();
    });
  });
});

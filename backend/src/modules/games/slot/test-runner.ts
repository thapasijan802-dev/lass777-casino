import { SlotService } from './slot.service';
import { SlotSymbol } from './slot.types';
import { SYMBOL_CONFIG } from './slot.constants';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function assertEqual(actual: any, expected: any, message: string) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(`Assertion Failed [${message}]: Expected ${expectedStr}, got ${actualStr}`);
  }
}

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✔ PASS: ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✖ FAIL: ${name} -> ${err.message}`);
    failed++;
  }
}

console.log('\n========================================');
console.log('🎰 RUNNING SLOT ENGINE AUTHORITATIVE TESTS');
console.log('========================================\n');

const slotService = new SlotService();

console.log('--- Suite 1: Provably Fair RNG & Determinism ---');

test('RNG Determinism: identical seed & nonce must produce identical matrix', () => {
  const serverSeed = 'b1a2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';
  const clientSeed = 'client_test_seed_777';
  const nonce = 42;

  const matrixA = slotService.generateReelMatrix(serverSeed, clientSeed, nonce);
  const matrixB = slotService.generateReelMatrix(serverSeed, clientSeed, nonce);

  assertEqual(matrixA, matrixB, 'Matrices must match exactly');
  assertEqual(matrixA.length, 5, 'Must have 5 reels');
  matrixA.forEach((col, idx) => {
    assertEqual(col.length, 3, `Reel ${idx} must have 3 visible rows`);
  });
});

test('RNG Nonce Progression: incrementing nonce produces distinct matrix', () => {
  const serverSeed = 'b1a2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';
  const clientSeed = 'client_test_seed_777';

  const matrix1 = slotService.generateReelMatrix(serverSeed, clientSeed, 1);
  const matrix2 = slotService.generateReelMatrix(serverSeed, clientSeed, 2);

  assert(JSON.stringify(matrix1) !== JSON.stringify(matrix2), 'Matrices should differ on nonce change');
});

test('Cryptographic SHA256 seed hashing', () => {
  const seed = 'mafia_secret_seed_999';
  const hash = slotService.hashSeed(seed);
  assert(hash.length === 64, 'SHA256 hex string must be 64 characters');
});

console.log('\n--- Suite 2: Paylines & Wild Substitutions ---');

test('Payline evaluation: 3-of-a-kind BOSS on Line 1 (center row)', () => {
  const matrix: SlotSymbol[][] = [
    ['JACK', 'BOSS', 'ACE'],
    ['QUEEN', 'BOSS', 'CAR'],
    ['KING', 'BOSS', 'CASH'],
    ['ACE', 'JACK', 'GUN'],
    ['CAR', 'WHISKEY', 'BOSS'],
  ];

  const betAmount = 20; // lineBet = 20/20 = $1.00
  const winningLines = slotService.evaluatePaylines(matrix, betAmount);

  const line1Win = winningLines.find((w) => w.lineIndex === 0);
  assert(line1Win !== undefined, 'Line 1 win must be detected');
  assertEqual(line1Win?.symbol, 'BOSS', 'Symbol should be BOSS');
  assertEqual(line1Win?.count, 3, 'Match count should be 3');
  assertEqual(line1Win?.winAmount, 50.0, 'Win amount must equal 50.00');
});

test('WILD substitution: 2 GUN + 1 WILD on Line 2 (top row) awards 3 GUNs', () => {
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
  assert(line2Win !== undefined, 'Line 2 win must be detected');
  assertEqual(line2Win?.symbol, 'GUN', 'Symbol should be GUN');
  assertEqual(line2Win?.count, 3, 'Match count should be 3');
  assertEqual(line2Win?.winAmount, 30.0, 'Win amount must equal 30.00');
});

test('Pure 5-of-a-kind WILD line awards top jackpot payout', () => {
  const matrix: SlotSymbol[][] = [
    ['ACE', 'WILD', 'ACE'],
    ['ACE', 'WILD', 'ACE'],
    ['ACE', 'WILD', 'ACE'],
    ['ACE', 'WILD', 'ACE'],
    ['ACE', 'WILD', 'ACE'],
  ];

  const betAmount = 20; // lineBet = $1.00
  const winningLines = slotService.evaluatePaylines(matrix, betAmount);

  const line1Win = winningLines.find((w) => w.lineIndex === 0);
  assert(line1Win !== undefined, 'Line 1 win must be detected');
  assertEqual(line1Win?.symbol, 'WILD', 'Symbol should be WILD');
  assertEqual(line1Win?.count, 5, 'Match count should be 5');
  assertEqual(line1Win?.winAmount, 2000.0, '5x WILD multiplier must be 2000x line bet');
});

test('No matching lines awards 0 payout', () => {
  const matrix: SlotSymbol[][] = [
    ['JACK', 'QUEEN', 'KING'],
    ['ACE', 'BOSS', 'CAR'],
    ['GUN', 'CASH', 'WHISKEY'],
    ['JACK', 'QUEEN', 'KING'],
    ['ACE', 'BOSS', 'CAR'],
  ];

  const winningLines = slotService.evaluatePaylines(matrix, 20);
  assertEqual(winningLines.length, 0, 'Should have 0 winning lines');
});

console.log('\n--- Suite 3: Scatter Wins Anywhere ---');

test('3 Scatters awards 5x total bet multiplier', () => {
  const matrix: SlotSymbol[][] = [
    ['SCATTER', 'JACK', 'ACE'],
    ['QUEEN', 'CAR', 'CASH'],
    ['KING', 'SCATTER', 'BOSS'],
    ['ACE', 'JACK', 'GUN'],
    ['CAR', 'WHISKEY', 'SCATTER'],
  ];

  const betAmount = 50;
  const scatterWin = slotService.evaluateScatters(matrix, betAmount);

  assert(scatterWin !== null, 'Scatter win must be detected');
  assertEqual(scatterWin?.count, 3, 'Should count 3 scatters');
  assertEqual(scatterWin?.multiplier, 5, 'Multiplier should be 5x');
  assertEqual(scatterWin?.winAmount, 250.0, 'Win amount should be $250.00');
});

test('5 Scatters awards 100x total bet multiplier', () => {
  const matrix: SlotSymbol[][] = [
    ['SCATTER', 'JACK', 'ACE'],
    ['SCATTER', 'CAR', 'CASH'],
    ['SCATTER', 'BOSS', 'GUN'],
    ['SCATTER', 'JACK', 'GUN'],
    ['SCATTER', 'WHISKEY', 'BOSS'],
  ];

  const betAmount = 10;
  const scatterWin = slotService.evaluateScatters(matrix, betAmount);

  assert(scatterWin !== null, 'Scatter win must be detected');
  assertEqual(scatterWin?.count, 5, 'Should count 5 scatters');
  assertEqual(scatterWin?.multiplier, 100, 'Multiplier should be 100x');
  assertEqual(scatterWin?.winAmount, 1000.0, 'Win amount should be $1000.00');
});

test('Fewer than 3 Scatters awards 0 scatter win', () => {
  const matrix: SlotSymbol[][] = [
    ['SCATTER', 'JACK', 'ACE'],
    ['QUEEN', 'CAR', 'CASH'],
    ['KING', 'SCATTER', 'BOSS'],
    ['ACE', 'JACK', 'GUN'],
    ['CAR', 'WHISKEY', 'ACE'],
  ];

  const scatterWin = slotService.evaluateScatters(matrix, 20);
  assertEqual(scatterWin, null, 'Scatter win should be null');
});

console.log('\n--- Suite 4: Complete Authoritative Spin Cycle ---');

test('Authoritative spin executes and produces consistent totals', () => {
  const betAmount = 25;
  const result = slotService.spin(betAmount);

  assert(result.roundId.startsWith('rnd_'), 'Round ID must have rnd_ prefix');
  assertEqual(result.reelMatrix.length, 5, 'Matrix must have 5 reels');
  assert(result.serverSeed.length > 0, 'Server seed must exist');
  assert(result.clientSeed.length > 0, 'Client seed must exist');
  assert(result.nonce > 0, 'Nonce must be positive');

  const expectedTotal = Number((result.lineWinsTotal + result.scatterWinsTotal).toFixed(2));
  assertEqual(result.totalWin, expectedTotal, 'Total win must equal lineWins + scatterWins');
  assertEqual(result.betAmount, 25, 'Bet amount must match');
});

test('Game info metadata returns all 12 symbols and paylines configuration', () => {
  const info = slotService.getGameInfo();
  assertEqual(info.gameTitle, 'Mafia Syndicate 777', 'Game title check');
  assertEqual(info.reels, 5, '5 reels');
  assertEqual(info.rows, 3, '3 rows');
  assertEqual(info.paylinesCount, 20, '20 paylines');
  assert(info.symbols.BOSS !== undefined, 'BOSS symbol exists');
  assert(info.symbols.WILD !== undefined, 'WILD symbol exists');
  assert(info.symbols.SCATTER !== undefined, 'SCATTER symbol exists');
});

console.log('\n========================================');
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

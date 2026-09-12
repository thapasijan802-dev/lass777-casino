import { MinesService } from './mines.service';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`Assertion Failed: ${message}`);
}

function assertEqual(actual: any, expected: any, message: string) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`Assertion Failed [${message}]: Expected ${b}, got ${a}`);
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
console.log('💣 RUNNING MINES ENGINE TESTS');
console.log('========================================\n');

const minesService = new MinesService({} as any);

test('Deterministic 25-cell Mine Generation', () => {
  const serverSeed = 'b1a2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';
  const clientSeed = 'test_mines_seed_1';
  const nonce = 1;
  const mineCount = 5;

  const minesA = minesService.generateMinePositions(serverSeed, clientSeed, nonce, mineCount);
  const minesB = minesService.generateMinePositions(serverSeed, clientSeed, nonce, mineCount);

  assertEqual(minesA, minesB, 'Mine positions must be deterministic');
  assertEqual(minesA.length, 5, 'Must generate exactly 5 mines');

  // Verify all within [0..24] and distinct
  const set = new Set(minesA);
  assertEqual(set.size, 5, 'All mine positions must be unique');
  minesA.forEach((pos) => {
    assert(pos >= 0 && pos < 25, `Position ${pos} must be within 0-24`);
  });
});

test('Boundary Mine Counts (1 to 24)', () => {
  const serverSeed = minesService.generateServerSeed();
  const mines1 = minesService.generateMinePositions(serverSeed, 'seed', 1, 1);
  assertEqual(mines1.length, 1, '1 mine check');

  const mines24 = minesService.generateMinePositions(serverSeed, 'seed', 1, 24);
  assertEqual(mines24.length, 24, '24 mines check');
  assertEqual(new Set(mines24).size, 24, '24 unique mines');
});

test('Stake 97% RTP Multiplier Progression', () => {
  // 3 mines:
  // Tile 1: 0.97 * (25/22) = 1.10x
  const m1 = minesService.calculateMultiplier(1, 3);
  assertEqual(m1, 1.10, 'Tile 1 with 3 mines should be 1.10x');

  // Tile 2: 0.97 * (25/22) * (24/21) = 1.26x
  const m2 = minesService.calculateMultiplier(2, 3);
  assertEqual(m2, 1.26, 'Tile 2 with 3 mines should be 1.26x');

  // Tile 3: 0.97 * (25/22) * (24/21) * (23/20) = 1.45x
  const m3 = minesService.calculateMultiplier(3, 3);
  assertEqual(m3, 1.45, 'Tile 3 with 3 mines should be 1.45x');
});

console.log('\n========================================');
console.log(`MINES RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================\n');

if (failed > 0) process.exit(1);

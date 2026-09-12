import { CrashService } from './crash.service';

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
console.log('🚀 RUNNING AVIATOR / CRASH ENGINE TESTS');
console.log('========================================\n');

const crashService = new CrashService({} as any);

test('Provably Fair Seed Generation', () => {
  const seed = crashService.generateServerSeed();
  assert(seed.length === 64, 'Server seed must be 64-char hex string');
  const hash = crashService.hashSeed(seed);
  assert(hash.length === 64, 'Hash must be 64-char hex string');
});

test('Crash Point Determinism: same seed & nonce produce identical crash point', () => {
  const serverSeed = 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';
  const clientSeed = 'test_client_seed_777';
  const nonce = 5;

  const cp1 = crashService.generateCrashPoint(serverSeed, clientSeed, nonce);
  const cp2 = crashService.generateCrashPoint(serverSeed, clientSeed, nonce);
  assertEqual(cp1, cp2, 'Crash point must be deterministic');
  assert(cp1 >= 1.0, 'Crash point must be at least 1.00x');
});

test('Exponential Curve Multiplier Formula M(t) = 1.01 * e^(0.06 * t)', () => {
  const m0 = crashService.calculateMultiplier(0);
  assertEqual(m0, 1.0, 'Multiplier at t=0 must be 1.00x');

  const m1 = crashService.calculateMultiplier(1.0);
  assert(m1 > 1.05 && m1 < 1.10, `Multiplier at t=1s should be ~1.07x, got ${m1}`);

  const m10 = crashService.calculateMultiplier(10.0);
  assert(m10 > 1.80 && m10 < 1.90, `Multiplier at t=10s should be ~1.84x, got ${m10}`);

  const m30 = crashService.calculateMultiplier(30.0);
  assert(m30 > 6.0 && m30 < 6.5, `Multiplier at t=30s should be ~6.11x, got ${m30}`);
});

console.log('\n========================================');
console.log(`AVIATOR RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================\n');

if (failed > 0) process.exit(1);

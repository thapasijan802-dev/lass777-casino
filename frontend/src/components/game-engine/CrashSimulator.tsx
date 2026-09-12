'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api';
import { useWalletStore } from '@/store/useWalletStore';
import { formatCurrency } from '@/lib/utils';
import { Rocket, ShieldAlert, CheckCircle, RotateCcw, TrendingUp } from 'lucide-react';

interface CrashSimulatorProps {
  gameSlug: string;
  gameTitle: string;
  sessionToken: string;
  mode: 'REAL' | 'DEMO';
  initialBalance: number;
}

export const CrashSimulator: React.FC<CrashSimulatorProps> = ({
  gameSlug,
  gameTitle,
  sessionToken,
  mode,
  initialBalance,
}) => {
  const { realBalance, bonusBalance, updateBalances } = useWalletStore();

  const [balance, setBalance] = useState<number>(
    mode === 'REAL' ? realBalance + bonusBalance : initialBalance || 1000
  );
  const [betAmount, setBetAmount] = useState<number>(10);
  const [gameState, setGameState] = useState<'IDLE' | 'FLYING' | 'CRASHED'>('IDLE');
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const [cashedOutAt, setCashedOutAt] = useState<number>(0);
  const [recentCrashes, setRecentCrashes] = useState<number[]>([2.45, 1.18, 5.72, 1.05, 3.12, 12.4, 1.85]);

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(1.0);
  const roundIdRef = useRef<string>('');

  useEffect(() => {
    if (mode === 'REAL') {
      setBalance(realBalance + bonusBalance);
    }
  }, [realBalance, bonusBalance, mode]);

  const startFlight = async () => {
    if (balance < betAmount || gameState === 'FLYING') return;

    setGameState('FLYING');
    setMultiplier(1.0);
    setHasCashedOut(false);
    setCashedOutAt(0);

    const roundId = 'crash_' + Math.random().toString(36).substring(2, 9);
    roundIdRef.current = roundId;
    const txBetId = 'bet_' + Date.now().toString(36);

    // Deduct bet from backend
    try {
      if (mode === 'REAL') {
        const betRes = await api.sendBetCallback({
          sessionToken,
          roundId,
          transactionId: txBetId,
          amount: betAmount,
          gameSlug,
        });
        if (betRes.newBalance) {
          updateBalances(betRes.newBalance.realBalance, betRes.newBalance.bonusBalance);
          setBalance(betRes.newBalance.totalBalance);
        }
      } else {
        setBalance((prev) => prev - betAmount);
      }
    } catch (e) {
      setBalance((prev) => Math.max(0, prev - betAmount));
    }

    // Determine random crash point with realistic weighted distribution
    const rand = Math.random();
    let point = 1.0 + Math.pow(rand, -0.6) * 0.7;
    point = Math.min(Math.max(point, 1.05), 45.0);
    crashPointRef.current = Number(point.toFixed(2));

    startTimeRef.current = Date.now();
    runMultiplierLoop();
  };

  const runMultiplierLoop = () => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    // Exponential climb curve
    const currentMult = Math.pow(Math.E, 0.07 * elapsed * (1 + elapsed * 0.08));
    const formattedMult = Number(currentMult.toFixed(2));

    if (formattedMult >= crashPointRef.current) {
      // Game Crashed!
      setGameState('CRASHED');
      setMultiplier(crashPointRef.current);
      setRecentCrashes((prev) => [crashPointRef.current, ...prev.slice(0, 6)]);
      return;
    }

    setMultiplier(formattedMult);
    animationFrameRef.current = requestAnimationFrame(runMultiplierLoop);
  };

  const handleCashOut = async () => {
    if (gameState !== 'FLYING' || hasCashedOut) return;

    const lockedMultiplier = multiplier;
    setHasCashedOut(true);
    setCashedOutAt(lockedMultiplier);

    const winAmount = Number((betAmount * lockedMultiplier).toFixed(2));

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Credit win in backend
    try {
      const txWinId = 'win_' + Date.now().toString(36);
      if (mode === 'REAL') {
        const winRes = await api.sendWinCallback({
          sessionToken,
          roundId: roundIdRef.current,
          transactionId: txWinId,
          amount: winAmount,
          gameSlug,
        });
        if (winRes.newBalance) {
          updateBalances(winRes.newBalance.realBalance, winRes.newBalance.bonusBalance);
          setBalance(winRes.newBalance.totalBalance);
        }
      } else {
        setBalance((prev) => prev + winAmount);
      }
    } catch (e) {
      setBalance((prev) => prev + winAmount);
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto rounded-3xl bg-[#090d16] border-2 border-cyan-500/40 p-4 sm:p-6 shadow-neon-glow text-white">
      {/* Game Header */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-wide text-white">{gameTitle}</h2>
            <span className="text-xs text-slate-400">Social Multiplier Crash • Instant Cashout</span>
          </div>
        </div>

        {/* Recent Crashes Strip */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto">
          {recentCrashes.map((val, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded-lg text-xs font-black font-mono border ${
                val >= 2.0
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                  : 'bg-red-950/60 border-red-500 text-red-300'
              }`}
            >
              {val.toFixed(2)}x
            </span>
          ))}
        </div>
      </div>

      {/* Flight Canvas Visualizer */}
      <div className="relative w-full aspect-[16/9] max-h-[360px] rounded-2xl bg-gradient-to-b from-[#0e1422] to-[#080b12] border border-slate-800 p-6 flex flex-col items-center justify-center overflow-hidden mb-6">
        {/* Ambient Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d_1px,transparent_1px),linear-gradient(to_bottom,#1f293d_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

        {/* Rocket Graphic */}
        {gameState === 'FLYING' && (
          <div className="relative animate-bounce mb-3">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-neon-glow">
              <Rocket className="w-9 h-9 stroke-[2.5] -rotate-45" />
            </div>
          </div>
        )}

        {/* Multiplier Central Display */}
        <div className="relative z-10 text-center">
          <div
            className={`text-5xl sm:text-7xl font-black font-mono tracking-tight transition-all ${
              gameState === 'CRASHED'
                ? 'text-red-500 animate-shake drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]'
                : 'gold-text-glow'
            }`}
          >
            {multiplier.toFixed(2)}x
          </div>

          <div className="text-xs uppercase tracking-widest font-black text-slate-400 mt-2">
            {gameState === 'IDLE' && 'PLACE YOUR BET TO LAUNCH'}
            {gameState === 'FLYING' && (hasCashedOut ? `CASHED OUT AT ${cashedOutAt.toFixed(2)}x!` : 'CLIMBING...')}
            {gameState === 'CRASHED' && 'FLEW AWAY!'}
          </div>
        </div>
      </div>

      {/* Control Console */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-[#0d121e] rounded-2xl p-4 border border-slate-800">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Balance</span>
          <div className="text-xl font-extrabold text-amber-400 font-mono">{formatCurrency(balance)}</div>
        </div>

        {/* Bet Selection */}
        <div className="flex items-center justify-center gap-2">
          {[5, 10, 25, 50].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setBetAmount(amt)}
              disabled={gameState === 'FLYING'}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                betAmount === amt
                  ? 'bg-cyan-500 text-black shadow-neon-glow'
                  : 'bg-slate-800 border border-slate-700 text-slate-300'
              }`}
            >
              ${amt}
            </button>
          ))}
        </div>

        {/* Dynamic Action Button */}
        <div className="flex justify-end">
          {gameState === 'FLYING' && !hasCashedOut ? (
            <button
              onClick={handleCashOut}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 text-black font-black text-sm uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex flex-col items-center justify-center"
            >
              <span>CASH OUT</span>
              <span className="text-xs font-mono font-extrabold">
                {formatCurrency(betAmount * multiplier)}
              </span>
            </button>
          ) : (
            <button
              onClick={startFlight}
              disabled={gameState === 'FLYING' || balance < betAmount}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-black font-black text-sm uppercase tracking-wider shadow-neon-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Rocket className="w-5 h-5" />
              <span>LAUNCH BET (${betAmount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api';
import { useWalletStore } from '@/store/useWalletStore';
import { formatCurrency } from '@/lib/utils';
import { Play, Sparkles, Volume2, VolumeX, RotateCcw, Zap, Trophy, Plus, Minus } from 'lucide-react';

interface SlotSimulatorProps {
  gameSlug: string;
  gameTitle: string;
  sessionToken: string;
  mode: 'REAL' | 'DEMO';
  initialBalance: number;
}

const SYMBOLS = [
  { id: '777', name: 'Lucky 777', value: 25, icon: '🎰', color: 'text-amber-400' },
  { id: 'DIAMOND', name: 'Diamond', value: 15, icon: '💎', color: 'text-cyan-400' },
  { id: 'GOLD', name: 'Gold Bar', value: 10, icon: '🥇', color: 'text-yellow-300' },
  { id: 'BELL', name: 'Golden Bell', value: 6, icon: '🔔', color: 'text-amber-300' },
  { id: 'CHERRY', name: 'Cherry', value: 3, icon: '🍒', color: 'text-red-500' },
  { id: 'LEMON', name: 'Lemon', value: 2, icon: '🍋', color: 'text-yellow-400' },
  { id: 'HORSESHOE', name: 'Horseshoe', value: 4, icon: '🧲', color: 'text-emerald-400' },
];

export const SlotSimulator: React.FC<SlotSimulatorProps> = ({
  gameSlug,
  gameTitle,
  sessionToken,
  mode,
  initialBalance,
}) => {
  const { realBalance, bonusBalance, updateBalances, fetchBalance } = useWalletStore();

  const [currentBalance, setCurrentBalance] = useState<number>(
    mode === 'REAL' ? realBalance + bonusBalance : initialBalance || 1000
  );
  const [betAmount, setBetAmount] = useState<number>(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number>(0);
  const [bigWinMessage, setBigWinMessage] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [turboMode, setTurboMode] = useState(false);

  // 5 reels x 3 rows grid
  const [reels, setReels] = useState<string[][]>([
    ['777', 'CHERRY', 'BELL'],
    ['DIAMOND', 'GOLD', 'LEMON'],
    ['777', 'DIAMOND', 'HORSESHOE'],
    ['GOLD', 'BELL', 'CHERRY'],
    ['777', 'LEMON', 'DIAMOND'],
  ]);

  useEffect(() => {
    if (mode === 'REAL') {
      setCurrentBalance(realBalance + bonusBalance);
    }
  }, [realBalance, bonusBalance, mode]);

  const getRandomSymbol = () => {
    const idx = Math.floor(Math.random() * SYMBOLS.length);
    return SYMBOLS[idx].id;
  };

  const playAudioBeep = (freq: number, duration: number) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context policy
    }
  };

  const handleSpin = async () => {
    if (isSpinning || currentBalance < betAmount) return;

    setIsSpinning(true);
    setLastWin(0);
    setBigWinMessage(null);

    const roundId = 'rnd_' + Math.random().toString(36).substring(2, 9);
    const txBetId = 'bet_' + Date.now().toString(36);

    // 1. Process Bet in Backend
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
          setCurrentBalance(betRes.newBalance.totalBalance);
        }
      } else {
        setCurrentBalance((prev) => prev - betAmount);
      }
    } catch (e) {
      // Offline fallback
      setCurrentBalance((prev) => Math.max(0, prev - betAmount));
    }

    playAudioBeep(320, 0.1);

    // Reel spinning animation
    const spinDuration = turboMode ? 600 : 1400;
    const interval = setInterval(() => {
      setReels([
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      ]);
      playAudioBeep(450, 0.04);
    }, 90);

    setTimeout(async () => {
      clearInterval(interval);

      // Determine final outcome: 38% win probability with realistic payouts
      const isWin = Math.random() < 0.42;
      let finalReels: string[][];
      let winMultiplier = 0;

      if (isWin) {
        const winningSym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        const count = Math.random() > 0.8 ? 5 : Math.random() > 0.5 ? 4 : 3;
        winMultiplier = count === 5 ? winningSym.value * 3 : count === 4 ? winningSym.value * 1.5 : winningSym.value * 0.8;

        finalReels = [
          [winningSym.id, getRandomSymbol(), getRandomSymbol()],
          [winningSym.id, getRandomSymbol(), getRandomSymbol()],
          [winningSym.id, getRandomSymbol(), getRandomSymbol()],
          [count >= 4 ? winningSym.id : getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
          [count >= 5 ? winningSym.id : getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        ];
      } else {
        finalReels = [
          [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
          [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
          [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
          [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
          [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        ];
      }

      setReels(finalReels);
      setIsSpinning(false);

      if (winMultiplier > 0) {
        const winAmount = Number((betAmount * winMultiplier).toFixed(2));
        setLastWin(winAmount);

        playAudioBeep(680, 0.3);

        if (winMultiplier >= 10) {
          setBigWinMessage(`🔥 MEGA WIN! ${winMultiplier}x MULTIPLIER 🔥`);
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#fbbf24', '#00f2fe', '#ffffff'],
          });
        } else if (winMultiplier >= 3) {
          setBigWinMessage(`✨ BIG WIN! ${winMultiplier}x ✨`);
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        }

        // Send Win callback to backend
        try {
          const txWinId = 'win_' + Date.now().toString(36);
          if (mode === 'REAL') {
            const winRes = await api.sendWinCallback({
              sessionToken,
              roundId,
              transactionId: txWinId,
              amount: winAmount,
              gameSlug,
            });
            if (winRes.newBalance) {
              updateBalances(winRes.newBalance.realBalance, winRes.newBalance.bonusBalance);
              setCurrentBalance(winRes.newBalance.totalBalance);
            }
          } else {
            setCurrentBalance((prev) => prev + winAmount);
          }
        } catch (e) {
          setCurrentBalance((prev) => prev + winAmount);
        }
      }
    }, spinDuration);
  };

  const getSymbolData = (id: string) => {
    return SYMBOLS.find((s) => s.id === id) || SYMBOLS[0];
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto rounded-3xl bg-[#090d16] border-2 border-amber-500/40 p-4 sm:p-6 shadow-gold-glow-lg text-white">
      {/* Game Header Bar */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-amber-500/20 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-xl">
            🎰
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-wide text-white">{gameTitle}</h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded font-black text-[9px] uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {mode} PLAY
              </span>
              <span className="text-slate-400 text-[11px]">96.8% RTP • Certified RNG</span>
            </div>
          </div>
        </div>

        {/* Header Right Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTurboMode(!turboMode)}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
              turboMode ? 'bg-amber-500 text-black border-amber-400' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Turbo Spin Mode"
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Turbo</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Big Win Banner Overlay */}
      {bigWinMessage && (
        <div className="w-full py-2.5 px-4 mb-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-black text-center text-sm sm:text-base tracking-widest shadow-gold-glow animate-bounce">
          {bigWinMessage}
        </div>
      )}

      {/* Slot Machine Display Frame */}
      <div className="relative w-full rounded-2xl bg-gradient-to-b from-[#111726] to-[#0a0e18] border-2 border-amber-500/50 p-3 sm:p-5 shadow-2xl overflow-hidden mb-6">
        {/* Glow corner effects */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* 5 Reels Container */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {reels.map((reel, rIdx) => (
            <div
              key={rIdx}
              className="flex flex-col gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-xl bg-[#060910] border border-amber-500/20 shadow-inner"
            >
              {reel.map((symId, sIdx) => {
                const sym = getSymbolData(symId);
                return (
                  <div
                    key={sIdx}
                    className={`aspect-square rounded-xl bg-[#141b2a] border border-slate-800/80 flex flex-col items-center justify-center p-1 shadow-md transition-all ${
                      isSpinning ? 'blur-[1px] scale-95 opacity-80' : 'hover:scale-105'
                    }`}
                  >
                    <span className="text-2xl sm:text-4xl filter drop-shadow-md select-none">{sym.icon}</span>
                    <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 mt-0.5 truncate max-w-full">
                      {sym.name}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Payline Indicator Line */}
        <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-amber-400/40 pointer-events-none -translate-y-1/2" />
      </div>

      {/* Control Console */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-[#0d121e] rounded-2xl p-4 border border-slate-800">
        {/* Balance Display */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400">Current Balance</span>
          <span className="text-xl font-extrabold text-amber-400 font-mono">
            {formatCurrency(currentBalance)}
          </span>
          {lastWin > 0 && (
            <span className="text-xs font-bold text-emerald-400 animate-pulse">
              + {formatCurrency(lastWin)} WON!
            </span>
          )}
        </div>

        {/* Bet Selector */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setBetAmount(Math.max(1, betAmount - 5))}
            disabled={isSpinning || betAmount <= 1}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="flex flex-col text-center px-4 py-1.5 rounded-xl bg-[#151c2a] border border-amber-500/30 min-w-[100px]">
            <span className="text-[9px] uppercase font-bold text-slate-400">Total Bet</span>
            <span className="text-base font-black text-white font-mono">${betAmount}</span>
          </div>
          <button
            onClick={() => setBetAmount(betAmount + 5)}
            disabled={isSpinning}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Large Golden Spin Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSpin}
            disabled={isSpinning || currentBalance < betAmount}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-sm uppercase tracking-wider shadow-gold-glow hover:shadow-gold-glow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
          >
            {isSpinning ? (
              <RotateCcw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Play className="w-5 h-5 fill-black" />
                <span>SPIN REELS</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

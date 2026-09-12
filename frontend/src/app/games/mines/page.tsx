'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useAuthStore } from '@/store/useAuthStore';
import { useWalletStore } from '@/store/useWalletStore';
import { originalsAudio } from '@/lib/originalsAudio';
import { formatCurrency } from '@/lib/utils';
import { MinesGrid } from '@/components/games/mines/MinesGrid';
import { MinesControls } from '@/components/games/mines/MinesControls';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  HelpCircle,
  ShieldCheck,
  Bomb,
  Gem,
} from 'lucide-react';

export default function MinesGamePage() {
  const { isAuthenticated, token, openAuthModal } = useAuthStore();
  const { realBalance, bonusBalance, updateBalances, fetchBalance, openDepositModal } = useWalletStore();

  const [mode, setMode] = useState<'REAL' | 'DEMO'>('DEMO');
  const [balance, setBalance] = useState<number>(1000.0);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [mineCount, setMineCount] = useState<number>(3);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<'ACTIVE' | 'CASHED_OUT' | 'EXPLODED' | 'IDLE'>('IDLE');
  const [revealedTiles, setRevealedTiles] = useState<number[]>([]);
  const [minePositions, setMinePositions] = useState<number[]>([]);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [nextMultiplier, setNextMultiplier] = useState<number | undefined>(undefined);
  const [cashoutValue, setCashoutValue] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [winMessage, setWinMessage] = useState<string | null>(null);

  // Sync auth & balance
  useEffect(() => {
    if (isAuthenticated) {
      setMode('REAL');
      fetchBalance();
      setBalance(realBalance + bonusBalance);
    } else {
      setMode('DEMO');
      setBalance(1000.0);
    }
  }, [isAuthenticated, realBalance, bonusBalance, fetchBalance]);

  const handleUserGesture = () => {
    originalsAudio.init();
  };

  const toggleSound = () => {
    handleUserGesture();
    const next = !muted;
    setMuted(next);
    originalsAudio.setMuted(next);
  };

  // API Call helper
  const apiCall = async (endpoint: string, body: any) => {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const baseUrl = rawUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${baseUrl}/api/v1/games/mines/${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  };

  // 1. Start Game
  const handleStartGame = async () => {
    handleUserGesture();
    if (isLoading) return;

    if (balance < betAmount) {
      if (mode === 'REAL') {
        setErrorToast('Insufficient balance. Please deposit funds.');
        openDepositModal();
      } else {
        setBalance((prev) => prev + 1000);
        setErrorToast('Demo balance topped up with $1,000.00');
      }
      setTimeout(() => setErrorToast(null), 3000);
      return;
    }

    setIsLoading(true);
    setWinMessage(null);
    setMinePositions([]);

    try {
      const data = await apiCall('start', {
        betAmount,
        mineCount,
        mode,
      });

      setSessionId(data.sessionId);
      setStatus('ACTIVE');
      setRevealedTiles([]);
      setCurrentMultiplier(1.0);
      setNextMultiplier(data.nextMultiplier);
      setCashoutValue(betAmount);

      // Deduct balance
      if (data.newBalance) {
        if (mode === 'REAL') {
          updateBalances(data.newBalance.realBalance, data.newBalance.bonusBalance);
          setBalance(data.newBalance.totalBalance);
        } else {
          setBalance(data.newBalance.totalBalance);
        }
      } else {
        setBalance((prev) => Math.max(0, Number((prev - betAmount).toFixed(2))));
      }
    } catch (err: any) {
      setErrorToast(err.message || 'Failed to start game');
      setTimeout(() => setErrorToast(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Reveal Tile
  const handleTileClick = async (tileIndex: number) => {
    handleUserGesture();
    if (!sessionId || status !== 'ACTIVE' || isLoading || revealedTiles.includes(tileIndex)) return;

    setIsLoading(true);

    try {
      const data = await apiCall('reveal', {
        sessionId,
        tileIndex,
        mode,
      });

      setRevealedTiles(data.revealedTiles);
      setCurrentMultiplier(data.currentMultiplier);
      setNextMultiplier(data.nextMultiplier);
      setCashoutValue(data.cashoutValue);

      if (data.status === 'EXPLODED') {
        setStatus('EXPLODED');
        setMinePositions(data.minePositions || []);
        originalsAudio.playBomb();
      } else if (data.status === 'CASHED_OUT') {
        // Auto cashout on perfect clear
        setStatus('CASHED_OUT');
        setMinePositions(data.minePositions || []);
        originalsAudio.playCashout();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#f59e0b', '#06b6d4'],
        });
        setWinMessage(`PERFECT CLEAR! Claimed ${formatCurrency(data.payout)} (${data.currentMultiplier}x)!`);
        if (data.newBalance) {
          if (mode === 'REAL') {
            updateBalances(data.newBalance.realBalance, data.newBalance.bonusBalance);
            setBalance(data.newBalance.totalBalance);
          } else {
            setBalance(data.newBalance.totalBalance);
          }
        }
      } else {
        // Safe Gem uncovered
        originalsAudio.playGem(data.revealedTiles.length);
      }
    } catch (err: any) {
      setErrorToast(err.message || 'Error revealing tile');
      setTimeout(() => setErrorToast(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Cashout
  const handleCashout = async () => {
    handleUserGesture();
    if (!sessionId || status !== 'ACTIVE' || isLoading) return;

    setIsLoading(true);

    try {
      const data = await apiCall('cashout', {
        sessionId,
        mode,
      });

      setStatus('CASHED_OUT');
      setMinePositions(data.minePositions || []);
      originalsAudio.playCashout();

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#06b6d4'],
      });

      setWinMessage(`CASHED OUT! +${formatCurrency(data.payout)} (${data.currentMultiplier}x Multiplier)!`);

      if (data.newBalance) {
        if (mode === 'REAL') {
          updateBalances(data.newBalance.realBalance, data.newBalance.bonusBalance);
          setBalance(data.newBalance.totalBalance);
        } else {
          setBalance(data.newBalance.totalBalance);
        }
      } else {
        setBalance((prev) => Number((prev + data.payout).toFixed(2)));
      }
    } catch (err: any) {
      setErrorToast(err.message || 'Error cashing out');
      setTimeout(() => setErrorToast(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={handleUserGesture}
      className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col select-none"
    >
      {/* Top Header Control Bar */}
      <header className="h-14 border-b border-amber-500/20 bg-[#090d16] px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/lobby"
            className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Lobby</span>
          </Link>
          <div className="h-4 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-wider text-amber-400">
              MINES ORIGINALS
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/10 border border-amber-500/30 text-amber-300">
              5x5 • PROVABLY FAIR
            </span>
          </div>
        </div>

        {/* Center Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#101624] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              if (!isAuthenticated) openAuthModal('register');
              else setMode('REAL');
            }}
            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
              mode === 'REAL' ? 'bg-amber-500 text-black shadow-gold-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Real Play
          </button>
          <button
            onClick={() => setMode('DEMO')}
            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
              mode === 'DEMO' ? 'bg-cyan-500 text-black shadow-neon-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Demo Play
          </button>
        </div>

        {/* Right Balance & Sound */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-[9px] text-slate-400 uppercase font-bold">
              {mode === 'REAL' ? 'Real Balance' : 'Demo Balance'}
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-amber-400 font-mono">
              {formatCurrency(balance)}
            </span>
          </div>

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </header>

      {/* Error Toast */}
      {errorToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs shadow-xl border border-red-400 animate-fade-in">
          {errorToast}
        </div>
      )}

      {/* Main Arena */}
      <main className="flex-1 p-3 sm:p-6 max-w-5xl mx-auto w-full flex flex-col items-center justify-center">
        {/* Win Banner Notification */}
        {winMessage && (
          <div className="w-full max-w-3xl mb-3 py-2 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 text-black font-black text-center text-sm tracking-widest shadow-neon-glow animate-bounce">
            {winMessage}
          </div>
        )}

        {status === 'EXPLODED' && (
          <div className="w-full max-w-3xl mb-3 py-2 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-red-700 text-white font-black text-center text-sm tracking-widest shadow-lg animate-pulse">
            💥 DETONATED! GAME OVER
          </div>
        )}

        {/* Split Arena: 5x5 Grid + Controls Sidebar */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full max-w-3xl">
          <MinesGrid
            revealedTiles={revealedTiles}
            minePositions={minePositions}
            status={status}
            onTileClick={handleTileClick}
            isLoading={isLoading}
          />

          <MinesControls
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            mineCount={mineCount}
            setMineCount={setMineCount}
            status={status}
            currentMultiplier={currentMultiplier}
            nextMultiplier={nextMultiplier}
            cashoutValue={cashoutValue}
            onStartGame={handleStartGame}
            onCashout={handleCashout}
            balance={balance}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}

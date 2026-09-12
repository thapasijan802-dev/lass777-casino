'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import confetti from 'canvas-confetti';
import { useAuthStore } from '@/store/useAuthStore';
import { useWalletStore } from '@/store/useWalletStore';
import { originalsAudio } from '@/lib/originalsAudio';
import { formatCurrency } from '@/lib/utils';
import { CrashCanvas } from '@/components/games/crash/CrashCanvas';
import { CrashBetBoard } from '@/components/games/crash/CrashBetBoard';
import { CrashBetPanel } from '@/components/games/crash/CrashBetPanel';
import { CrashGameState, CrashPlayerBet } from '@/components/games/crash/types';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  History,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function AviatorCrashPage() {
  const { isAuthenticated, token, openAuthModal } = useAuthStore();
  const { realBalance, bonusBalance, updateBalances, fetchBalance, openDepositModal } = useWalletStore();

  const socketRef = useRef<Socket | null>(null);

  const [mode, setMode] = useState<'REAL' | 'DEMO'>('DEMO');
  const [balance, setBalance] = useState<number>(1000.0);
  const [status, setStatus] = useState<CrashGameState>('BETTING');
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [bettingCountdown, setBettingCountdown] = useState<number>(5);
  const [crashPoint, setCrashPoint] = useState<number | undefined>(undefined);
  const [allBets, setAllBets] = useState<CrashPlayerBet[]>([]);
  const [myBets, setMyBets] = useState<{ [key: number]: CrashPlayerBet | undefined }>({});
  const [recentCrashes, setRecentCrashes] = useState<number[]>([1.84, 1.12, 4.25, 2.05, 1.03, 7.82, 1.45, 12.6, 2.31, 1.95]);
  const [muted, setMuted] = useState<boolean>(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

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

  // Connect to NestJS /crash WebSocket namespace
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL?.replace('/slot', '/crash') || 'http://localhost:4000/crash';
    const socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('game_snapshot', (data: any) => {
      setStatus(data.status);
      setMultiplier(data.currentMultiplier || 1.0);
      setBettingCountdown(data.bettingCountdown || 5);
      setAllBets(data.bets || []);
      if (data.recentCrashes) setRecentCrashes(data.recentCrashes);
    });

    socket.on('betting_started', (data: any) => {
      setStatus('BETTING');
      setMultiplier(1.0);
      setCrashPoint(undefined);
      setBettingCountdown(data.countdown || 5);
      setAllBets(data.bets || []);
      setMyBets({});
      originalsAudio.stopFlightHum();
      if (data.recentCrashes) setRecentCrashes(data.recentCrashes);
    });

    socket.on('betting_countdown', (data: { countdown: number }) => {
      setBettingCountdown(data.countdown);
    });

    socket.on('flight_started', (data: any) => {
      setStatus('RUNNING');
      setMultiplier(1.0);
      originalsAudio.playTakeoff();
      originalsAudio.playFlightHum();
    });

    socket.on('multiplier_update', (data: { multiplier: number; elapsed: number }) => {
      setMultiplier(data.multiplier);
    });

    socket.on('player_cashed_out', (data: any) => {
      setAllBets((prev) =>
        prev.map((b) => (b.id === data.id ? { ...b, cashedOut: true, cashoutMultiplier: data.multiplier, payout: data.payout } : b))
      );

      // Check if my bet
      setMyBets((prev) => {
        const copy = { ...prev };
        Object.keys(copy).forEach((idxStr) => {
          const idx = Number(idxStr);
          if (copy[idx]?.id === data.id) {
            copy[idx] = { ...copy[idx]!, cashedOut: true, cashoutMultiplier: data.multiplier, payout: data.payout };
          }
        });
        return copy;
      });
    });

    socket.on('game_crashed', (data: { crashPoint: number; recentCrashes: number[] }) => {
      setStatus('CRASHED');
      setCrashPoint(data.crashPoint);
      setMultiplier(data.crashPoint);
      originalsAudio.playCrash();
      if (data.recentCrashes) setRecentCrashes(data.recentCrashes);
    });

    socket.on('bet_placed', (data: any) => {
      if (data.newBalance) {
        if (mode === 'REAL') {
          updateBalances(data.newBalance.realBalance, data.newBalance.bonusBalance);
          setBalance(data.newBalance.totalBalance);
        } else {
          setBalance(data.newBalance.totalBalance);
        }
      }
    });

    socket.on('cashout_success', (data: any) => {
      originalsAudio.playCashout();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#06b6d4'],
      });

      if (data.newBalance) {
        if (mode === 'REAL') {
          updateBalances(data.newBalance.realBalance, data.newBalance.bonusBalance);
          setBalance(data.newBalance.totalBalance);
        } else {
          setBalance(data.newBalance.totalBalance);
        }
      }
    });

    socket.on('bet_error', (err: { message: string }) => {
      setErrorToast(err.message);
      setTimeout(() => setErrorToast(null), 3500);
    });

    socket.on('bet_broadcast', (bet: CrashPlayerBet) => {
      setAllBets((prev) => [...prev, bet]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      originalsAudio.stopFlightHum();
    };
  }, [token, mode, updateBalances]);

  const handleUserGesture = () => {
    originalsAudio.init();
  };

  const toggleSound = () => {
    handleUserGesture();
    const next = !muted;
    setMuted(next);
    originalsAudio.setMuted(next);
  };

  // Place Bet Handler
  const handlePlaceBet = (betIndex: number, amount: number, autoCashout?: number) => {
    handleUserGesture();

    if (balance < amount) {
      if (mode === 'REAL') {
        setErrorToast('Insufficient balance for bet. Please deposit funds.');
        openDepositModal();
      } else {
        setBalance((prev) => prev + 1000);
        setErrorToast('Demo balance reloaded with $1,000.00');
      }
      setTimeout(() => setErrorToast(null), 3000);
      return;
    }

    const optimisticBet: CrashPlayerBet = {
      id: 'local_' + Math.random().toString(36).substring(2, 9),
      userId: 'me',
      username: 'You',
      betAmount: amount,
      autoCashoutMultiplier: autoCashout,
      cashedOut: false,
      betIndex,
    };

    setMyBets((prev) => ({ ...prev, [betIndex]: optimisticBet }));

    // Optimistic balance decrement
    setBalance((prev) => Math.max(0, Number((prev - amount).toFixed(2))));

    if (socketRef.current) {
      socketRef.current.emit('place_bet', {
        betAmount: amount,
        autoCashoutMultiplier: autoCashout,
        mode,
        betIndex,
        token: isAuthenticated ? token : undefined,
      });
    }
  };

  // Manual Cashout Handler
  const handleCashout = (betIndex: number) => {
    handleUserGesture();
    if (socketRef.current) {
      socketRef.current.emit('cashout', { betIndex, token: isAuthenticated ? token : undefined });
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
              AVIATOR ORIGINALS
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              REAL-TIME CURVE
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

      {/* Top Recent Crashes Strip */}
      <div className="bg-[#090d16] border-b border-slate-800/80 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        <div className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase flex-shrink-0 mr-1">
          <History className="w-3.5 h-3.5" />
          <span>History:</span>
        </div>
        {recentCrashes.slice(-14).map((cp, idx) => (
          <span
            key={idx}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-black font-mono flex-shrink-0 ${
              cp >= 10.0
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : cp >= 2.0
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {cp.toFixed(2)}x
          </span>
        ))}
      </div>

      {/* Main Game Arena */}
      <main className="flex-1 p-3 sm:p-5 max-w-7xl mx-auto w-full flex flex-col gap-4">
        {/* Upper Split: Multiplayer Live Board + Flight Canvas */}
        <div className="flex flex-col lg:flex-row gap-4">
          <CrashBetBoard bets={allBets} />
          <div className="flex-1">
            <CrashCanvas
              status={status}
              multiplier={multiplier}
              bettingCountdown={bettingCountdown}
              crashPoint={crashPoint}
            />
          </div>
        </div>

        {/* Lower Dual Betting Controller Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CrashBetPanel
            panelIndex={0}
            status={status}
            currentMultiplier={multiplier}
            myBet={myBets[0]}
            onPlaceBet={handlePlaceBet}
            onCashout={handleCashout}
            balance={balance}
          />
          <CrashBetPanel
            panelIndex={1}
            status={status}
            currentMultiplier={multiplier}
            myBet={myBets[1]}
            onPlaceBet={handlePlaceBet}
            onCashout={handleCashout}
            balance={balance}
          />
        </div>
      </main>
    </div>
  );
}

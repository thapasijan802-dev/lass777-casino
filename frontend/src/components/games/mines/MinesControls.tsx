'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { Bomb, Gem, Sparkles, TrendingUp } from 'lucide-react';

interface MinesControlsProps {
  betAmount: number;
  setBetAmount: (amount: number) => void;
  mineCount: number;
  setMineCount: (count: number) => void;
  status: 'ACTIVE' | 'CASHED_OUT' | 'EXPLODED' | 'IDLE';
  currentMultiplier: number;
  nextMultiplier?: number;
  cashoutValue: number;
  onStartGame: () => void;
  onCashout: () => void;
  balance: number;
  isLoading: boolean;
}

const QUICK_MINES = [1, 3, 5, 10, 24];
const CHIPS = [1, 5, 10, 25, 50, 100, 250];

export const MinesControls: React.FC<MinesControlsProps> = ({
  betAmount,
  setBetAmount,
  mineCount,
  setMineCount,
  status,
  currentMultiplier,
  nextMultiplier,
  cashoutValue,
  onStartGame,
  onCashout,
  balance,
  isLoading,
}) => {
  const isGameActive = status === 'ACTIVE';

  return (
    <div className="w-full lg:w-80 rounded-3xl bg-[#090d16] border-2 border-amber-500/30 p-5 shadow-2xl flex flex-col justify-between gap-4">
      <div className="flex flex-col gap-4">
        {/* Mines Count Selector */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400 uppercase text-[10px] flex items-center gap-1">
              <Bomb className="w-3.5 h-3.5 text-red-400" />
              Mines
            </span>
            <span className="text-amber-400 font-mono text-sm font-black">{mineCount} Mines</span>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="range"
              min={1}
              max={24}
              disabled={isGameActive || isLoading}
              value={mineCount}
              onChange={(e) => setMineCount(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer disabled:opacity-40"
            />
          </div>

          {/* Quick Mine Selectors */}
          <div className="flex gap-1.5 mt-0.5">
            {QUICK_MINES.map((cnt) => (
              <button
                key={cnt}
                disabled={isGameActive || isLoading}
                onClick={() => setMineCount(cnt)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-black font-mono transition-all disabled:opacity-30 ${
                  mineCount === cnt
                    ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {cnt}
              </button>
            ))}
          </div>
        </div>

        {/* Bet Amount Selector */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400 uppercase text-[10px]">Bet Amount</span>
            <span className="text-white font-mono text-sm font-black">${betAmount}.00</span>
          </div>

          <div className="flex items-center bg-[#121826] rounded-xl border border-slate-700 px-3 py-2">
            <span className="text-slate-400 font-mono text-xs mr-1">$</span>
            <input
              type="number"
              min={1}
              max={500}
              disabled={isGameActive || isLoading}
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Math.min(500, Number(e.target.value))))}
              className="w-full bg-transparent font-mono text-xs font-bold text-white outline-none"
            />
          </div>

          {/* 1/2, 2x, Max */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              disabled={isGameActive || isLoading}
              onClick={() => setBetAmount(Math.max(1, Math.floor(betAmount / 2)))}
              className="py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-black text-slate-300 disabled:opacity-30"
            >
              1/2
            </button>
            <button
              disabled={isGameActive || isLoading}
              onClick={() => setBetAmount(Math.min(500, betAmount * 2))}
              className="py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-black text-slate-300 disabled:opacity-30"
            >
              2x
            </button>
            <button
              disabled={isGameActive || isLoading}
              onClick={() => setBetAmount(500)}
              className="py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-[10px] font-black text-amber-300 border border-amber-500/40 disabled:opacity-30"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Dynamic Multiplier Stats Strip */}
        {isGameActive && (
          <div className="p-3 rounded-2xl bg-[#101524] border border-amber-500/30 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Current Multiplier</span>
              <span className="text-emerald-400 font-mono font-black text-base animate-pulse">
                {currentMultiplier.toFixed(2)}x
              </span>
            </div>
            {nextMultiplier && nextMultiplier > currentMultiplier && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Next Tile Value</span>
                <span className="text-amber-400 font-mono font-bold">
                  {nextMultiplier.toFixed(2)}x (${(betAmount * nextMultiplier).toFixed(2)})
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Dynamic Action Button */}
      {isGameActive ? (
        <button
          onClick={onCashout}
          disabled={isLoading || cashoutValue <= 0}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 text-black font-black text-sm uppercase tracking-wider shadow-neon-glow hover:brightness-110 active:scale-98 transition-all flex flex-col items-center justify-center cursor-pointer animate-pulse"
        >
          <span className="text-[10px] font-extrabold uppercase">CASH OUT</span>
          <span className="text-lg font-black font-mono">
            {formatCurrency(cashoutValue)} ({currentMultiplier.toFixed(2)}x)
          </span>
        </button>
      ) : (
        <button
          onClick={onStartGame}
          disabled={isLoading || balance < betAmount}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-sm uppercase tracking-wider shadow-gold-glow hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>START GAME (${betAmount}.00)</span>
        </button>
      )}
    </div>
  );
};

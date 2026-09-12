'use client';

import React, { useState, useEffect } from 'react';
import { CrashGameState, CrashPlayerBet } from './types';
import { formatCurrency } from '@/lib/utils';
import { Minus, Plus, Zap, Check } from 'lucide-react';

interface CrashBetPanelProps {
  panelIndex: number; // 0 or 1
  status: CrashGameState;
  currentMultiplier: number;
  myBet?: CrashPlayerBet;
  onPlaceBet: (betIndex: number, amount: number, autoCashout?: number) => void;
  onCashout: (betIndex: number) => void;
  balance: number;
}

export const CrashBetPanel: React.FC<CrashBetPanelProps> = ({
  panelIndex,
  status,
  currentMultiplier,
  myBet,
  onPlaceBet,
  onCashout,
  balance,
}) => {
  const [betAmount, setBetAmount] = useState<number>(panelIndex === 0 ? 10 : 25);
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState<boolean>(false);
  const [autoCashoutMultiplier, setAutoCashoutMultiplier] = useState<number>(2.0);

  const isBetting = status === 'BETTING';
  const isFlying = status === 'RUNNING';
  const hasActiveBet = myBet && !myBet.cashedOut;
  const currentLivePayout = hasActiveBet ? Number((myBet.betAmount * currentMultiplier).toFixed(2)) : 0;

  const handleActionClick = () => {
    if (isBetting) {
      if (myBet) return; // Already placed
      onPlaceBet(
        panelIndex,
        betAmount,
        autoCashoutEnabled ? autoCashoutMultiplier : undefined,
      );
    } else if (isFlying && hasActiveBet) {
      onCashout(panelIndex);
    }
  };

  return (
    <div className="flex-1 rounded-2xl bg-[#090d16] border border-amber-500/20 p-4 shadow-xl flex flex-col justify-between gap-3">
      {/* Top Header: Panel Label & Auto Cashout Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
          Bet {panelIndex + 1}
        </span>

        {/* Auto-Cashout toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Auto Cashout</span>
          <button
            onClick={() => setAutoCashoutEnabled(!autoCashoutEnabled)}
            disabled={hasActiveBet}
            className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
              autoCashoutEnabled ? 'bg-amber-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                autoCashoutEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-2 gap-3 items-center">
        {/* Bet Amount Selector */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase font-bold text-slate-400">Bet Amount</span>
          <div className="flex items-center bg-[#121826] rounded-xl border border-slate-700/80 px-2 py-1.5 focus-within:border-amber-400">
            <span className="text-xs text-slate-400 font-mono mr-1">$</span>
            <input
              type="number"
              min={1}
              max={1000}
              disabled={hasActiveBet}
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Math.min(1000, Number(e.target.value))))}
              className="w-full bg-transparent font-mono text-xs font-bold text-white outline-none"
            />
          </div>
          {/* 1/2 and 2x buttons */}
          <div className="flex gap-1 mt-1">
            <button
              disabled={hasActiveBet}
              onClick={() => setBetAmount((prev) => Math.max(1, Math.floor(prev / 2)))}
              className="flex-1 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-[9px] font-black text-slate-300 disabled:opacity-40"
            >
              1/2
            </button>
            <button
              disabled={hasActiveBet}
              onClick={() => setBetAmount((prev) => Math.min(1000, prev * 2))}
              className="flex-1 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-[9px] font-black text-slate-300 disabled:opacity-40"
            >
              2x
            </button>
          </div>
        </div>

        {/* Auto Cashout Multiplier Input */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase font-bold text-slate-400">Target Multiplier</span>
          <div
            className={`flex items-center bg-[#121826] rounded-xl border px-2 py-1.5 transition-colors ${
              autoCashoutEnabled
                ? 'border-amber-500/50 focus-within:border-amber-400'
                : 'border-slate-800 opacity-50'
            }`}
          >
            <input
              type="number"
              step="0.1"
              min={1.01}
              max={100}
              disabled={!autoCashoutEnabled || hasActiveBet}
              value={autoCashoutMultiplier}
              onChange={(e) =>
                setAutoCashoutMultiplier(Math.max(1.01, Number(e.target.value)))
              }
              className="w-full bg-transparent font-mono text-xs font-bold text-white outline-none text-right"
            />
            <span className="text-xs text-amber-400 font-mono ml-1">x</span>
          </div>
          {/* Quick presets */}
          <div className="flex gap-1 mt-1">
            {[1.5, 2.0, 5.0].map((preset) => (
              <button
                key={preset}
                disabled={!autoCashoutEnabled || hasActiveBet}
                onClick={() => setAutoCashoutMultiplier(preset)}
                className="flex-1 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-[9px] font-black text-slate-300 disabled:opacity-40"
              >
                {preset}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Giant Action Button */}
      {isFlying && hasActiveBet ? (
        <button
          onClick={handleActionClick}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-sm uppercase tracking-wider shadow-neon-glow hover:brightness-110 active:scale-98 transition-all flex flex-col items-center justify-center animate-pulse"
        >
          <span className="text-[10px] font-extrabold uppercase">CASH OUT</span>
          <span className="text-base font-black font-mono">
            {formatCurrency(currentLivePayout)} ({currentMultiplier.toFixed(2)}x)
          </span>
        </button>
      ) : myBet?.cashedOut ? (
        <div className="w-full py-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 font-black text-xs uppercase flex items-center justify-center gap-2 text-center">
          <Check className="w-4 h-4" />
          <span>CASHED OUT +{formatCurrency(myBet.payout || 0)} ({myBet.cashoutMultiplier?.toFixed(2)}x)</span>
        </div>
      ) : isBetting && myBet ? (
        <div className="w-full py-3.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs uppercase flex items-center justify-center gap-2 text-center">
          <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
          <span>BET PLACED (${myBet.betAmount}) • WAITING FOR TAKEOFF</span>
        </div>
      ) : isFlying ? (
        <button
          disabled
          className="w-full py-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-500 font-black text-xs uppercase flex items-center justify-center"
        >
          <span>WAITING FOR NEXT ROUND</span>
        </button>
      ) : (
        <button
          onClick={handleActionClick}
          disabled={balance < betAmount}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-sm uppercase tracking-wider shadow-gold-glow hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <span>PLACE BET ${betAmount}.00</span>
        </button>
      )}
    </div>
  );
};

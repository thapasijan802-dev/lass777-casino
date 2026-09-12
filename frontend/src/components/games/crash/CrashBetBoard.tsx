'use client';

import React from 'react';
import { CrashPlayerBet } from './types';
import { formatCurrency } from '@/lib/utils';
import { Users, TrendingUp } from 'lucide-react';

interface CrashBetBoardProps {
  bets: CrashPlayerBet[];
}

export const CrashBetBoard: React.FC<CrashBetBoardProps> = ({ bets }) => {
  const totalWagered = bets.reduce((sum, b) => sum + b.betAmount, 0);

  return (
    <div className="w-full lg:w-72 rounded-2xl bg-[#090d16] border border-amber-500/20 p-3.5 flex flex-col h-[460px] shadow-xl">
      {/* Header Stat Strip */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-bold">
          <Users className="w-3.5 h-3.5 text-amber-400" />
          <span>{bets.length} Players</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase block font-medium">Pool</span>
          <span className="font-extrabold text-amber-400 font-mono">
            {formatCurrency(totalWagered)}
          </span>
        </div>
      </div>

      {/* Bets List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 mt-2.5 scrollbar-thin scrollbar-thumb-slate-800">
        {bets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs">
            <span>No bets placed yet</span>
            <span className="text-[10px] text-slate-600 mt-1">Place your bet for the next round</span>
          </div>
        ) : (
          bets.map((bet) => (
            <div
              key={bet.id}
              className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                bet.cashedOut
                  ? 'bg-emerald-950/30 border-emerald-500/40'
                  : 'bg-[#101524] border-slate-800'
              }`}
            >
              {/* User info */}
              <div className="flex items-center gap-2 truncate pr-2">
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-amber-300 flex-shrink-0">
                  {bet.username.charAt(0).toUpperCase()}
                </div>
                <span className="truncate font-semibold text-slate-200 text-[11px]">
                  {bet.username}
                </span>
              </div>

              {/* Multiplier / Payout */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-mono text-slate-400 text-[11px]">
                  ${bet.betAmount}
                </span>

                {bet.cashedOut ? (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-black font-mono animate-pulse">
                    <span>{bet.cashoutMultiplier?.toFixed(2)}x</span>
                  </div>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

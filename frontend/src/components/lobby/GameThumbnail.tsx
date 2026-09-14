'use client';

import React, { useState } from 'react';
import { Game } from '@/types';
import {
  Zap,
  Flame,
  Sparkles,
  Bomb,
  Gem,
  Rocket,
  Dices,
  CircleDot,
  Trophy,
  Crown,
  Crosshair,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface GameThumbnailProps {
  game: Game;
}

export const GameThumbnail: React.FC<GameThumbnailProps> = ({ game }) => {
  const [imgError, setImgError] = useState(false);

  // Render game-specific custom visual artwork
  const renderGameVisualArt = () => {
    switch (game.slug) {
      case 'plinko':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-[#18092a] via-[#100720] to-[#0a0515] flex flex-col items-center justify-between p-3 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:12px_12px]" />
            {/* Plinko Pyramid Visualization */}
            <div className="relative z-10 w-full flex flex-col items-center pt-2">
              <div className="w-2.5 h-2.5 rounded-full bg-pink-400 shadow-[0_0_12px_#f43f5e] animate-bounce mb-1" />
              {/* Pegs */}
              <div className="flex gap-4 text-pink-300/60 text-[8px]">● ●</div>
              <div className="flex gap-3 text-pink-300/60 text-[8px]">● ● ●</div>
              <div className="flex gap-2 text-pink-300/60 text-[8px]">● ● ● ●</div>
              <div className="flex gap-1.5 text-pink-300/60 text-[8px]">● ● ● ● ●</div>
            </div>
            {/* Bottom Multiplier Buckets */}
            <div className="relative z-10 w-full flex items-center justify-between gap-0.5 text-[8px] font-mono font-black pt-2 border-t border-pink-500/20">
              <span className="px-1 py-0.5 rounded bg-red-600/80 text-white">1000x</span>
              <span className="px-1 py-0.5 rounded bg-amber-600/80 text-white">130x</span>
              <span className="px-1 py-0.5 rounded bg-yellow-500/80 text-black">26x</span>
              <span className="px-1 py-0.5 rounded bg-emerald-500/80 text-black">2x</span>
              <span className="px-1 py-0.5 rounded bg-yellow-500/80 text-black">26x</span>
              <span className="px-1 py-0.5 rounded bg-amber-600/80 text-white">130x</span>
              <span className="px-1 py-0.5 rounded bg-red-600/80 text-white">1000x</span>
            </div>
            {/* Title Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)] uppercase">
                PLINKO
              </span>
            </div>
          </div>
        );

      case 'mines':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1b16] via-[#091410] to-[#050c0a] flex flex-col items-center justify-center p-4 overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
            {/* 3x3 Grid of tiles preview */}
            <div className="grid grid-cols-3 gap-1.5 w-28 h-28 relative z-10">
              <div className="rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <Gem className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
              <div className="rounded-lg bg-[#14231f] border border-slate-700/60 flex items-center justify-center" />
              <div className="rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <Gem className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="rounded-lg bg-[#14231f] border border-slate-700/60 flex items-center justify-center" />
              <div className="rounded-lg bg-red-950/80 border border-red-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                <Bomb className="w-4 h-4 text-red-400" />
              </div>
              <div className="rounded-lg bg-[#14231f] border border-slate-700/60 flex items-center justify-center" />
              <div className="rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <Gem className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="rounded-lg bg-[#14231f] border border-slate-700/60 flex items-center justify-center" />
              <div className="rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <Gem className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
            </div>
            {/* Mines Badge */}
            <div className="absolute bottom-2 inset-x-0 text-center">
              <span className="text-sm font-black tracking-widest text-emerald-400 uppercase drop-shadow-[0_0_8px_#10b981]">
                MINES 99% RTP
              </span>
            </div>
          </div>
        );

      case 'crash':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1828] via-[#07101c] to-[#040810] flex flex-col justify-between p-3 overflow-hidden">
            {/* Grid Lines */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#00f2fe_1px,transparent_1px),linear-gradient(to_bottom,#00f2fe_1px,transparent_1px)] [background-size:20px_20px]" />
            {/* Ascending Rocket Path */}
            <div className="relative z-10 flex-1 flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-cyan-500/10 blur-xl absolute" />
                <Rocket className="w-12 h-12 text-cyan-400 -rotate-45 drop-shadow-[0_0_15px_#00f2fe] animate-pulse" />
              </div>
            </div>
            <div className="relative z-10 flex items-center justify-between text-xs font-mono font-black">
              <span className="text-cyan-300/70">ORIGINALS</span>
              <span className="text-lg text-emerald-400 drop-shadow-[0_0_10px_#00e701]">
                78.40x 🚀
              </span>
            </div>
          </div>
        );

      case 'limbo':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a0f2e] via-[#100a1f] to-[#080510] flex flex-col items-center justify-center p-3 overflow-hidden">
            <div className="w-24 h-24 rounded-full bg-purple-600/10 blur-2xl absolute" />
            <TrendingUp className="w-12 h-12 text-purple-400 mb-2 drop-shadow-[0_0_12px_#c084fc]" />
            <span className="text-2xl font-black font-mono text-purple-300 drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]">
              1,000,000x
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 mt-1">
              LIMBO ROCKET
            </span>
          </div>
        );

      case 'dice':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-[#18182b] via-[#0e0e1a] to-[#070710] flex flex-col items-center justify-center p-3 overflow-hidden">
            <div className="flex gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.5)] rotate-6 flex items-center justify-center text-black font-black text-lg">
                ⚄
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 p-0.5 shadow-[0_0_15px_rgba(16,185,129,0.5)] -rotate-6 flex items-center justify-center text-black font-black text-lg">
                ⚅
              </div>
            </div>
            <div className="w-32 h-1.5 rounded-full bg-slate-800 relative overflow-hidden mt-2">
              <div className="w-2/3 h-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-cyan-300 mt-2">
              CRYPTO DICE 99%
            </span>
          </div>
        );

      case 'gates-of-olympus':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-[#2a1a08] via-[#1a1005] to-[#0c0702] flex flex-col justify-between p-3 overflow-hidden">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:12px_12px]" />
            <div className="flex justify-between items-center relative z-10">
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-black">
                1000x MULTI
              </span>
              <span className="text-[9px] font-bold text-amber-300">PRAGMATIC</span>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center my-auto">
              <div className="text-4xl drop-shadow-[0_0_15px_#f59e0b] mb-1">⚡ 🏛️</div>
              <span className="text-lg font-black tracking-tight text-white uppercase drop-shadow-[0_2px_10px_rgba(245,158,11,0.9)]">
                GATES OF <span className="text-amber-400">OLYMPUS</span>
              </span>
            </div>
            <div className="relative z-10 flex justify-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f2fe]" />
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
              <span className="w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_6px_#a855f7]" />
            </div>
          </div>
        );

      case 'sweet-bonanza':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-[#330d24] via-[#200717] to-[#10030b] flex flex-col justify-between p-3 overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-pink-500 text-white">
                100x BOMBS
              </span>
              <span className="text-[9px] font-bold text-pink-300">PRAGMATIC</span>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center my-auto">
              <div className="text-4xl drop-shadow-[0_0_15px_#ec4899] mb-1 animate-bounce">🍭 💣</div>
              <span className="text-lg font-black tracking-tight text-white uppercase drop-shadow-[0_2px_10px_rgba(236,72,153,0.9)]">
                SWEET <span className="text-pink-400">BONANZA</span>
              </span>
            </div>
            <div className="relative z-10 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-pink-300">
                ALL WAYS PAYS
              </span>
            </div>
          </div>
        );

      case 'sugar-rush':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-[#2e0827] via-[#1c0418] to-[#0c020a] flex flex-col justify-between p-3 overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-fuchsia-500 text-white">
                1024x SPOTS
              </span>
              <span className="text-[9px] font-bold text-fuchsia-300">PRAGMATIC</span>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center my-auto">
              <div className="text-4xl drop-shadow-[0_0_15px_#d946ef] mb-1">🍬 🐻</div>
              <span className="text-lg font-black tracking-tight text-white uppercase drop-shadow-[0_2px_10px_rgba(217,70,239,0.9)]">
                SUGAR <span className="text-fuchsia-400">RUSH 1000</span>
              </span>
            </div>
            <div className="relative z-10 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-fuchsia-300">
                STICKY MULTIPLIERS
              </span>
            </div>
          </div>
        );

      case 'wanted-dead-or-a-wild':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-[#2d1b09] via-[#1d1005] to-[#0e0702] flex flex-col justify-between p-3 overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-600 text-black">
                VS SKULLS
              </span>
              <span className="text-[9px] font-bold text-amber-400">HACKSAW</span>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center my-auto">
              <div className="text-3xl drop-shadow-[0_0_15px_#d97706] mb-1">💀 🤠 🔫</div>
              <span className="text-base font-black tracking-tighter text-amber-100 uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                WANTED: <span className="text-amber-500">DEAD OR A WILD</span>
              </span>
            </div>
            <div className="relative z-10 text-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                DUEL AT DAWN 100x
              </span>
            </div>
          </div>
        );

      case 'rip-city':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-[#18181b] via-[#111113] to-[#09090b] flex flex-col justify-between p-3 overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500 text-black">
                WILD CAT
              </span>
              <span className="text-[9px] font-bold text-slate-400">HACKSAW</span>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center my-auto">
              <div className="text-3xl drop-shadow-[0_0_15px_#10b981] mb-1">🐱 🐭 🧀</div>
              <span className="text-lg font-black tracking-tighter text-white uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                RIP <span className="text-emerald-400">CITY</span>
              </span>
            </div>
            <div className="relative z-10 text-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                EXPANDING JAWS
              </span>
            </div>
          </div>
        );

      case 'crazy-time':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-[#2e1008] via-[#1c0804] to-[#0e0402] flex flex-col justify-between p-3 overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-600 text-white">
                LIVE SHOW
              </span>
              <span className="text-[9px] font-bold text-amber-400">EVOLUTION</span>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center my-auto">
              <div className="text-4xl drop-shadow-[0_0_15px_#ef4444] mb-1 animate-spin [animation-duration:8s]">
                🎡
              </div>
              <span className="text-lg font-black tracking-tight text-white uppercase drop-shadow-[0_2px_10px_rgba(239,68,68,0.9)]">
                CRAZY <span className="text-yellow-400">TIME</span>
              </span>
            </div>
            <div className="relative z-10 text-center">
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-300">
                PACHINKO • CASH HUNT • COIN FLIP
              </span>
            </div>
          </div>
        );

      case 'lightning-roulette':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-[#2a2007] via-[#1a1304] to-[#0c0902] flex flex-col justify-between p-3 overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-black">
                500x STRIKES
              </span>
              <span className="text-[9px] font-bold text-amber-300">EVOLUTION</span>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center my-auto">
              <div className="text-4xl drop-shadow-[0_0_15px_#f59e0b] mb-1">⚡ 🎯</div>
              <span className="text-base font-black tracking-tight text-white uppercase drop-shadow-[0_2px_10px_rgba(245,158,11,0.9)]">
                LIGHTNING <span className="text-amber-400">ROULETTE</span>
              </span>
            </div>
            <div className="relative z-10 text-center">
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-300">
                HIGH-VOLTAGE MULTIPLIERS
              </span>
            </div>
          </div>
        );

      case 'aviator':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-[#260a0a] via-[#170505] to-[#0a0202] flex flex-col justify-between p-3 overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-600 text-white">
                #1 CRASH
              </span>
              <span className="text-[9px] font-bold text-red-300">SPRIBE</span>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center my-auto">
              <div className="text-4xl drop-shadow-[0_0_15px_#ef4444] mb-1 animate-pulse">🛩️</div>
              <span className="text-xl font-black tracking-wider text-white uppercase drop-shadow-[0_2px_10px_rgba(239,68,68,0.9)]">
                AVIATOR
              </span>
            </div>
            <div className="relative z-10 text-center">
              <span className="text-[9px] font-black uppercase tracking-wider text-red-400">
                CASH OUT IN FLIGHT
              </span>
            </div>
          </div>
        );

      case 'fortune-tiger':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-[#2a1805] via-[#1a0e02] to-[#0a0501] flex flex-col justify-between p-3 overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-black">
                10x MULTI
              </span>
              <span className="text-[9px] font-bold text-amber-300">PG SOFT</span>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center my-auto">
              <div className="text-4xl drop-shadow-[0_0_15px_#f59e0b] mb-1">🐯 🪙</div>
              <span className="text-lg font-black tracking-tight text-white uppercase drop-shadow-[0_2px_10px_rgba(245,158,11,0.9)]">
                FORTUNE <span className="text-amber-400">TIGER</span>
              </span>
            </div>
            <div className="relative z-10 text-center">
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-300">
                GOLDEN INGOT RESPINS
              </span>
            </div>
          </div>
        );

      case 'big-bass-splash':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-[#08202b] via-[#05121a] to-[#02090d] flex flex-col justify-between p-3 overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-cyan-500 text-black">
                FREE SPINS
              </span>
              <span className="text-[9px] font-bold text-cyan-300">PRAGMATIC</span>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center my-auto">
              <div className="text-4xl drop-shadow-[0_0_15px_#06b6d4] mb-1">🐟 🎣 🛻</div>
              <span className="text-base font-black tracking-tight text-white uppercase drop-shadow-[0_2px_10px_rgba(6,182,212,0.9)]">
                BIG BASS <span className="text-cyan-400">SPLASH</span>
              </span>
            </div>
            <div className="relative z-10 text-center">
              <span className="text-[9px] font-black uppercase tracking-wider text-cyan-300">
                FISHERMAN CASH COLLECT
              </span>
            </div>
          </div>
        );

      default:
        // Universal high-end fallback graphic
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-[#131b2c] via-[#0e1422] to-[#080b13] flex flex-col justify-between p-3 overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {game.category}
              </span>
              <span className="text-[9px] font-bold text-slate-400">
                {game.provider.replace('_', ' ')}
              </span>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center my-auto">
              <div className="text-3xl mb-1 drop-shadow-[0_0_12px_#00e701]">
                {game.category === 'SLOTS' && '🎰'}
                {game.category === 'CRASH' && '🚀'}
                {game.category === 'LIVE' && '🎲'}
                {game.category === 'FISH' && '🦈'}
                {game.category === 'ORIGINALS' && '⚡'}
              </div>
              <span className="text-sm font-black tracking-tight text-white uppercase line-clamp-1 drop-shadow-md">
                {game.title}
              </span>
            </div>
            <div className="relative z-10 text-center">
              <span className="text-[9px] font-mono font-bold text-emerald-400">
                {game.rtp}% RTP • {game.volatility}
              </span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0f1a]">
      {/* Background artwork */}
      {renderGameVisualArt()}

      {/* Subtle top sheen */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080b12] via-transparent to-white/5 pointer-events-none opacity-50" />
    </div>
  );
};

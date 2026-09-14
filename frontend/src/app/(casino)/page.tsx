'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { GameCard } from '@/components/lobby/GameCard';
import { LiveBetsFeed } from '@/components/lobby/LiveBetsFeed';
import { INITIAL_GAMES, VIP_TIERS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import {
  Sparkles,
  Flame,
  ArrowRight,
  Gift,
  Crown,
  ShieldCheck,
  Zap,
  Coins,
  Trophy,
  Rocket,
  Gamepad2,
  Lock,
  ChevronRight,
} from 'lucide-react';

export default function LandingPage() {
  const { openAuthModal } = useAuthStore();

  // Dynamic live jackpot ticker state
  const [jackpot, setJackpot] = useState(2487520.85);

  useEffect(() => {
    const interval = setInterval(() => {
      setJackpot((prev) => prev + Number((Math.random() * 3.4).toFixed(2)));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Filter games by category for showcase sections
  const originalsGames = INITIAL_GAMES.filter((g) => g.category === 'ORIGINALS').slice(0, 6);
  const trendingSlots = INITIAL_GAMES.filter((g) => g.category === 'SLOTS').slice(0, 8);
  const liveShows = INITIAL_GAMES.filter((g) => g.category === 'LIVE').slice(0, 4);

  return (
    <div className="relative min-h-screen bg-[#080b12] text-slate-100 overflow-hidden">
      {/* 1. HERO SECTION (Stake & Rainbet Sleek Aesthetic) */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-20 right-10 w-[400px] h-[300px] bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Top VIP Badge Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#101928] border border-emerald-500/40 text-emerald-400 text-xs sm:text-sm font-black uppercase tracking-wider mb-6 shadow-sm">
            <Zap className="w-4 h-4 fill-emerald-400 text-emerald-400" />
            <span>9CASINO • OFFICIAL NEXT-GEN CRYPTO GAMING & ORIGINALS</span>
          </div>

          {/* Big Bold Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase leading-none mb-6">
            BET SMART. <span className="emerald-text-glow">WIN BIG.</span>
          </h1>

          <p className="max-w-2xl text-slate-300 text-sm sm:text-lg md:text-xl font-medium mb-10 leading-relaxed">
            Experience provably fair <strong className="text-white">9Casino Originals (99% RTP)</strong>, blockbuster Pragmatic & Hacksaw slots, and immersive live tables. Instant crypto cashouts and $20 on the house upon registration.
          </p>

          {/* Quick CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-12">
            <button
              onClick={() => openAuthModal('register')}
              className="w-full sm:w-auto flex-1 py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-400 to-[#00e701] text-black font-black text-base uppercase tracking-wider shadow-[0_0_25px_rgba(0,231,1,0.4)] hover:brightness-110 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Gift className="w-5 h-5" />
              <span>CLAIM $20 FREE</span>
            </button>

            <Link
              href="/lobby?category=ORIGINALS"
              className="w-full sm:w-auto flex-1 py-4 px-8 rounded-2xl bg-[#121929] hover:bg-slate-800 border border-slate-700 text-white hover:text-emerald-400 font-black text-base uppercase tracking-wider hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 text-emerald-400" />
              <span>PLAY ORIGINALS</span>
            </Link>
          </div>

          {/* Mobile Grind Quick Launch Ticker */}
          <div className="w-full max-w-xl mx-auto mb-8 sm:hidden">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center justify-center gap-1.5">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>QUICK GRIND • INSTANT PLAY</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
              <Link
                href="/games/mines"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#121929] border border-emerald-500/40 text-emerald-300 font-extrabold text-xs whitespace-nowrap active:scale-95 shadow-sm shrink-0"
              >
                <span>💣 Mines</span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/20 px-1 rounded">99%</span>
              </Link>
              <Link
                href="/games/crash"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#121929] border border-cyan-500/40 text-cyan-300 font-extrabold text-xs whitespace-nowrap active:scale-95 shadow-sm shrink-0"
              >
                <span>🚀 Crash</span>
                <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/20 px-1 rounded">99%</span>
              </Link>
              <Link
                href="/play/plinko"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#121929] border border-pink-500/40 text-pink-300 font-extrabold text-xs whitespace-nowrap active:scale-95 shadow-sm shrink-0"
              >
                <span>🎯 Plinko</span>
                <span className="text-[9px] font-mono text-pink-400 bg-pink-500/20 px-1 rounded">1000x</span>
              </Link>
              <Link
                href="/play/gates-of-olympus"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#121929] border border-amber-500/40 text-amber-300 font-extrabold text-xs whitespace-nowrap active:scale-95 shadow-sm shrink-0"
              >
                <span>⚡ Olympus</span>
                <span className="text-[9px] font-mono text-amber-400 bg-amber-500/20 px-1 rounded">1000x</span>
              </Link>
              <Link
                href="/play/sweet-bonanza"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#121929] border border-fuchsia-500/40 text-fuchsia-300 font-extrabold text-xs whitespace-nowrap active:scale-95 shadow-sm shrink-0"
              >
                <span>🍭 Bonanza</span>
              </Link>
            </div>
          </div>

          {/* Key Stats Bar */}
          <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-[#0d1322]/80 border border-slate-800/80 backdrop-blur-md text-left">
            <div className="p-2 sm:p-3">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">9Casino Originals</span>
              <div className="text-base sm:text-xl font-black font-mono text-emerald-400">99.0% RTP</div>
            </div>
            <div className="p-2 sm:p-3">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mega Jackpot</span>
              <div className="text-base sm:text-xl font-black font-mono text-amber-400">{formatCurrency(jackpot)}</div>
            </div>
            <div className="p-2 sm:p-3">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Cashout</span>
              <div className="text-base sm:text-xl font-black font-mono text-cyan-400">&lt; 90 Seconds</div>
            </div>
            <div className="p-2 sm:p-3">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Daily Rakeback</span>
              <div className="text-base sm:text-xl font-black font-mono text-purple-400">Up to 20%</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 9CASINO ORIGINALS SECTION (Plinko, Mines, Crash, Limbo, Dice) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-400 mb-2">
              <Zap className="w-4 h-4 fill-emerald-400" />
              <span>PROVABLY FAIR • 99% RTP</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              9CASINO <span className="emerald-text-glow">ORIGINALS</span>
            </h2>
          </div>

          <Link
            href="/lobby?category=ORIGINALS"
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#121929] hover:bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>View All Originals (10+)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {originalsGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* 3. TRENDING BLOCKBUSTER SLOTS (Pragmatic & Hacksaw) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-400 mb-2">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>HIGH VOLATILITY • PRAGMATIC & HACKSAW</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              TRENDING <span className="gold-text-glow">VIDEO SLOTS</span>
            </h2>
          </div>

          <Link
            href="/lobby?category=SLOTS"
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#121929] hover:bg-slate-800 border border-slate-700 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>View All Slots</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
          {trendingSlots.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* 4. REAL-TIME LIVE BETS FEED (Stake / Rainbet style) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
        <LiveBetsFeed />
      </section>

      {/* 5. LIVE CASINO & GAME SHOWS (Crazy Time, Lightning Roulette) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase text-cyan-400 mb-2">
              <Crown className="w-4 h-4 text-cyan-400" />
              <span>LIVE DEALERS & GAME SHOWS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              LIVE CASINO <span className="cyan-text-glow">STUDIOS</span>
            </h2>
          </div>

          <Link
            href="/lobby?category=LIVE"
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#121929] hover:bg-slate-800 border border-slate-700 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>View Live Tables</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          {liveShows.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* 6. VIP HIGH-ROLLER CLUB (Stake-inspired Rakeback & Tiers) */}
      <section id="vip" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase mb-3">
            <Crown className="w-3.5 h-3.5 text-emerald-400" />
            <span>9Casino VIP Rakeback Program</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">LEVEL UP & EARN RAKEBACK</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            Every bet you place—win or lose—earns instant rakeback and accelerates your climb to higher VIP tiers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {VIP_TIERS.map((tier) => (
            <div
              key={tier.level}
              className="rounded-2xl bg-[#0c111e] border border-slate-800 hover:border-emerald-500/50 p-5 text-center flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div>
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center font-black text-emerald-400 mb-3 font-mono">
                  {tier.level}
                </div>
                <h4 className="font-black text-sm text-slate-100 mb-1">{tier.name}</h4>
                <div className="text-xs font-bold text-emerald-400 mb-2">{tier.cashback} Rakeback</div>
                <p className="text-[11px] text-slate-400 mb-3">{tier.perks}</p>
              </div>
              <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
                Wager: {tier.wager}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. SUPPORTED CRYPTO VAULT BANNER */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60 mb-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#0d1322] via-[#0f1728] to-[#0d1322] border border-slate-800 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <h3 className="text-2xl font-black text-white">INSTANT CRYPTO CASHOUTS</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Deposit and withdraw in seconds with zero hidden fees. Automated processing via Bitcoin, Ethereum, USDT, Solana, and more.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold">
            <span className="px-3 py-1.5 rounded-xl bg-[#141d30] border border-slate-700 text-amber-400">BTC</span>
            <span className="px-3 py-1.5 rounded-xl bg-[#141d30] border border-slate-700 text-blue-400">ETH</span>
            <span className="px-3 py-1.5 rounded-xl bg-[#141d30] border border-slate-700 text-emerald-400">USDT</span>
            <span className="px-3 py-1.5 rounded-xl bg-[#141d30] border border-slate-700 text-purple-400">SOL</span>
            <span className="px-3 py-1.5 rounded-xl bg-[#141d30] border border-slate-700 text-yellow-400">DOGE</span>
            <span className="px-3 py-1.5 rounded-xl bg-[#141d30] border border-slate-700 text-slate-300">LTC</span>
          </div>
        </div>
      </section>
    </div>
  );
}

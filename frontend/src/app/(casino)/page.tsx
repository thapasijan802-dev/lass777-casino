'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { GameCard } from '@/components/lobby/GameCard';
import { INITIAL_GAMES, VIP_TIERS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import {
  Sparkles,
  Flame,
  ArrowRight,
  Download,
  Gift,
  Crown,
  Smartphone,
  ShieldCheck,
  Zap,
  Coins,
  QrCode,
  CheckCircle2,
  Trophy,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, openAuthModal } = useAuthStore();

  // Dynamic live jackpot ticker state
  const [jackpot, setJackpot] = useState(1847520.45);
  const [recentWinner, setRecentWinner] = useState({
    user: 'Alex***77',
    amount: 14500,
    game: 'Gates of Olympus',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setJackpot((prev) => prev + Number((Math.random() * 2.85).toFixed(2)));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const winnersList = [
    { user: 'Vip***99', amount: 8450, game: 'Fortune Tiger' },
    { user: 'Lucky***07', amount: 16200, game: 'Gates of Olympus' },
    { user: 'Leo***777', amount: 5320, game: 'Aviator' },
    { user: 'Sarah***K', amount: 24800, game: 'Lass Slot 777 Deluxe' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const randomWinner = winnersList[Math.floor(Math.random() * winnersList.length)];
      setRecentWinner(randomWinner);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const featuredGames = INITIAL_GAMES.slice(0, 8);

  return (
    <div className="relative min-h-screen bg-[#07090e] text-white overflow-hidden">
      {/* 1. HERO SECTION (Lass777 Glamour Aesthetic) */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glamour Background Image with Dark Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80"
            alt="Glamorous Casino VIP Lounge"
            className="w-full h-full object-cover object-center brightness-[0.22] contrast-[1.15]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-transparent to-[#07090e]" />
        </div>

        {/* Floating Money & Golden Particles Animation */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          <div className="absolute top-1/4 left-[8%] animate-float text-3xl opacity-70 filter drop-shadow-[0_0_10px_#f59e0b]">
            🪙
          </div>
          <div className="absolute top-1/3 right-[10%] animate-float [animation-delay:1.5s] text-4xl opacity-80 filter drop-shadow-[0_0_15px_#00f2fe]">
            💎
          </div>
          <div className="absolute bottom-1/3 left-[15%] animate-float [animation-delay:2.5s] text-2xl opacity-60">
            💵
          </div>
          <div className="absolute top-2/3 right-[18%] animate-float [animation-delay:0.8s] text-3xl opacity-75">
            🎰
          </div>
        </div>

        {/* Hero Content Container */}
        <div className="relative z-20 max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Top VIP Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-black uppercase tracking-wider mb-6 shadow-gold-glow animate-pulse-glow">
            <Crown className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>OFFICIAL LASS777 WHITE-LABEL GAMING ENTERTAINMENT</span>
          </div>

          {/* Big Bold Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase leading-none mb-6">
            BIG BET, <span className="gold-text-glow">BIG WIN!</span>
          </h1>

          <p className="max-w-2xl text-slate-300 text-sm sm:text-lg md:text-xl font-medium mb-8 leading-relaxed">
            Experience the gold standard in high-roller online slots, crash games, and live tables. Instant crypto payouts, 24/7 VIP concierge, and $20 on the house upon registration.
          </p>

          {/* Live Mega Jackpot Counter */}
          <div className="w-full max-w-xl mx-auto mb-10 p-5 rounded-3xl bg-gradient-to-r from-amber-950/70 via-[#131926]/90 to-amber-950/70 border-2 border-amber-500/50 shadow-gold-glow-lg backdrop-blur-xl">
            <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-amber-400 mb-1">
              <Trophy className="w-4 h-4 fill-amber-400" />
              <span>LASS777 PROGRESSIVE MEGA JACKPOT</span>
            </div>
            <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white gold-text-glow">
              {formatCurrency(jackpot)}
            </div>
          </div>

          {/* Call To Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
            <button
              onClick={() => openAuthModal('register')}
              className="w-full sm:w-auto flex-1 py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-base uppercase tracking-wider shadow-gold-glow hover:shadow-gold-glow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Gift className="w-5 h-5" />
              <span>GET $20 FREE</span>
            </button>

            <a
              href="#app-download"
              className="w-full sm:w-auto flex-1 py-4 px-8 rounded-2xl bg-[#111724]/90 hover:bg-slate-800 border-2 border-amber-500/40 text-slate-100 hover:text-amber-400 font-black text-base uppercase tracking-wider shadow-card-elevated hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5 text-amber-400" />
              <span>DOWNLOAD APK</span>
            </a>
          </div>

          {/* Real-Time Winner Ticker Strip */}
          <div className="mt-12 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#0d121c]/80 border border-slate-800 backdrop-blur-md text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-400">Live Winner:</span>
            <span className="font-bold text-slate-200">{recentWinner.user}</span>
            <span className="text-slate-400">just won</span>
            <span className="font-mono font-black text-emerald-400">
              +{formatCurrency(recentWinner.amount)}
            </span>
            <span className="text-slate-400 hidden sm:inline">on {recentWinner.game}</span>
          </div>
        </div>
      </section>

      {/* 2. FEATURED CASINO GAMES SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-amber-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-400 mb-2">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>POPULAR SLOTS & CRASH</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">TRENDING AT LASS777</h2>
          </div>

          <Link
            href="/lobby"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>View All Games (25+)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid of 8 Featured Games */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {featuredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* 3. PROMOTIONS & BONUSES SECTION */}
      <section id="promotions" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase mb-3">
            <Gift className="w-3.5 h-3.5" />
            <span>High-Roller Promotions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">GENEROUS PLAYER BONUSES</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Promo Card 1 */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#131928] to-[#0d121c] border border-amber-500/30 p-8 shadow-card-elevated flex flex-col justify-between">
            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500 text-black">
                FREE SIGNUP CHIP
              </span>
              <h3 className="text-2xl font-black mt-4 mb-2">$20 NO-DEPOSIT BONUS</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Register your account in under 30 seconds and receive a complimentary $20 bonus chip immediately credited to your wallet.
              </p>
            </div>
            <button
              onClick={() => openAuthModal('register')}
              className="mt-6 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-colors"
            >
              CLAIM $20 NOW
            </button>
          </div>

          {/* Promo Card 2 (Featured) */}
          <div className="relative rounded-3xl bg-gradient-to-b from-amber-950/40 via-[#151d2f] to-[#0e1320] border-2 border-amber-400 p-8 shadow-gold-glow-lg flex flex-col justify-between md:-translate-y-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[10px] font-black uppercase tracking-widest shadow-gold-glow">
              MOST POPULAR
            </div>
            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
                WELCOME PACKAGE
              </span>
              <h3 className="text-3xl font-black mt-4 mb-2 gold-text-glow">200% MATCH UP TO $1,000</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Triple your bankroll on your first deposit! Plus get 50 free spins on our exclusive Lass Slot 777 Deluxe.
              </p>
            </div>
            <button
              onClick={() => openAuthModal('register')}
              className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-gold-glow hover:brightness-110 transition-all"
            >
              DEPOSIT & GET 200%
            </button>
          </div>

          {/* Promo Card 3 */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#131928] to-[#0d121c] border border-cyan-500/30 p-8 shadow-card-elevated flex flex-col justify-between">
            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                DAILY CASHBACK
              </span>
              <h3 className="text-2xl font-black mt-4 mb-2">UP TO 20% DAILY REBATE</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Play without fear. Every single day, receive automated cashback credited straight into your account with 1x wagering!
              </p>
            </div>
            <Link
              href="/lobby"
              className="mt-6 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-center font-black text-xs uppercase tracking-wider transition-colors"
            >
              EXPLORE GAMES
            </Link>
          </div>
        </div>
      </section>

      {/* 4. VIP HIGH-ROLLER CLUB */}
      <section id="vip" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase mb-3">
            <Crown className="w-3.5 h-3.5" />
            <span>Exclusive Membership</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">LASS777 VIP LOUNGE</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {VIP_TIERS.map((tier) => (
            <div
              key={tier.level}
              className="rounded-2xl bg-[#0f1422] border border-amber-500/20 hover:border-amber-500/60 p-5 text-center flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-gold-glow"
            >
              <div>
                <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center font-black text-amber-400 mb-3">
                  {tier.level}
                </div>
                <h4 className="font-black text-sm text-slate-100 mb-1">{tier.name}</h4>
                <div className="text-xs font-bold text-amber-400 mb-3">{tier.cashback} Cashback</div>
                <p className="text-[11px] text-slate-400">{tier.perks}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. MOBILE APK DOWNLOAD SECTION (lass777.com core feature) */}
      <section id="app-download" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-[#141b2c] via-[#101524] to-[#141b2c] border-2 border-amber-500/40 p-8 sm:p-12 shadow-gold-glow-lg flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black uppercase">
              <Smartphone className="w-4 h-4" />
              <span>Mobile-First Gaming Platform</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              DOWNLOAD THE <span className="gold-text-glow">LASS777 APP</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
              Enjoy ultra-smooth 60fps slots, instant push notifications on winning jackpots, fingerprint biometrics login, and exclusive in-app daily bonuses!
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => alert('Download starting for Lass777_v2.4.apk (Official Android Build)')}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-sm uppercase tracking-wider shadow-gold-glow hover:brightness-110 flex items-center gap-2 transition-transform active:scale-95"
              >
                <Download className="w-5 h-5" />
                <span>DOWNLOAD ANDROID APK</span>
              </button>

              <button
                onClick={() => alert('For iOS: Open Safari, tap "Share", and select "Add to Home Screen" to install the Lass777 WebApp.')}
                className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-black text-sm uppercase tracking-wider flex items-center gap-2 transition-colors"
              >
                <Smartphone className="w-5 h-5 text-slate-300" />
                <span>INSTALL ON iOS</span>
              </button>
            </div>
          </div>

          {/* QR Code Card */}
          <div className="p-6 rounded-2xl bg-[#090d16] border border-amber-500/30 text-center flex flex-col items-center shrink-0">
            <div className="w-36 h-36 rounded-xl bg-white p-2.5 flex items-center justify-center mb-3 shadow-inner">
              {/* Stylized QR Code Placeholder */}
              <div className="w-full h-full border-4 border-black p-2 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-6 h-6 bg-black" />
                  <div className="w-6 h-6 bg-black" />
                </div>
                <div className="text-center font-black text-[10px] text-black tracking-tighter">
                  LASS777
                </div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 bg-black" />
                  <div className="w-3 h-3 bg-amber-500" />
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-300">Scan to Install on Mobile</span>
            <span className="text-[10px] text-amber-400 mt-0.5">Android & iOS Supported</span>
          </div>
        </div>
      </section>
    </div>
  );
}

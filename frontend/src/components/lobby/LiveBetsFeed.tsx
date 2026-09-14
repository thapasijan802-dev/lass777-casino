'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Flame, Trophy, Zap, ShieldCheck } from 'lucide-react';

interface BetEntry {
  id: string;
  game: string;
  slug: string;
  player: string;
  betAmount: number;
  multiplier: number;
  payout: number;
  time: string;
}

const SAMPLE_GAMES = [
  { name: 'Plinko', slug: 'plinko' },
  { name: 'Mines', slug: 'mines' },
  { name: 'Gates of Olympus 1000', slug: 'gates-of-olympus' },
  { name: 'Sweet Bonanza 1000', slug: 'sweet-bonanza' },
  { name: 'Crash', slug: 'crash' },
  { name: 'Sugar Rush 1000', slug: 'sugar-rush' },
  { name: 'Wanted Dead or a Wild', slug: 'wanted-dead-or-a-wild' },
  { name: 'Crazy Time', slug: 'crazy-time' },
  { name: 'Limbo Rocket', slug: 'limbo' },
  { name: 'RIP City', slug: 'rip-city' },
  { name: 'Lightning Roulette', slug: 'lightning-roulette' },
  { name: 'Aviator', slug: 'aviator' },
];

const SAMPLE_USERS = [
  'Sijan***99',
  'Crypto***Whale',
  'Alex***77',
  'Lucky***Ace',
  'Zeus***God',
  'Rain***King',
  'Stake***God',
  'Neon***Viper',
  'Elena***K',
  'Vip***Roller',
  'Ghost***07',
  'Maxx***Win',
];

export const LiveBetsFeed: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'lucky'>('all');
  const [bets, setBets] = useState<BetEntry[]>([
    {
      id: 'b1',
      game: 'Gates of Olympus 1000',
      slug: 'gates-of-olympus',
      player: 'Sijan***99',
      betAmount: 120,
      multiplier: 142.5,
      payout: 17100,
      time: 'Just now',
    },
    {
      id: 'b2',
      game: 'Plinko',
      slug: 'plinko',
      player: 'Crypto***Whale',
      betAmount: 500,
      multiplier: 26.0,
      payout: 13000,
      time: '2s ago',
    },
    {
      id: 'b3',
      game: 'Mines',
      slug: 'mines',
      player: 'Alex***77',
      betAmount: 45,
      multiplier: 8.4,
      payout: 378,
      time: '5s ago',
    },
    {
      id: 'b4',
      game: 'Crash',
      slug: 'crash',
      player: 'Rain***King',
      betAmount: 250,
      multiplier: 34.2,
      payout: 8550,
      time: '8s ago',
    },
    {
      id: 'b5',
      game: 'Sweet Bonanza 1000',
      slug: 'sweet-bonanza',
      player: 'Lucky***Ace',
      betAmount: 80,
      multiplier: 112.0,
      payout: 8960,
      time: '12s ago',
    },
    {
      id: 'b6',
      game: 'Wanted Dead or a Wild',
      slug: 'wanted-dead-or-a-wild',
      player: 'Vip***Roller',
      betAmount: 800,
      multiplier: 45.0,
      payout: 36000,
      time: '15s ago',
    },
    {
      id: 'b7',
      game: 'Crazy Time',
      slug: 'crazy-time',
      player: 'Neon***Viper',
      betAmount: 100,
      multiplier: 25.0,
      payout: 2500,
      time: '18s ago',
    },
    {
      id: 'b8',
      game: 'Limbo Rocket',
      slug: 'limbo',
      player: 'Maxx***Win',
      betAmount: 30,
      multiplier: 380.0,
      payout: 11400,
      time: '22s ago',
    },
  ]);

  // Simulate real-time bets arriving
  useEffect(() => {
    const interval = setInterval(() => {
      const randomGame = SAMPLE_GAMES[Math.floor(Math.random() * SAMPLE_GAMES.length)];
      const randomUser = SAMPLE_USERS[Math.floor(Math.random() * SAMPLE_USERS.length)];

      let betAmount = Math.floor(Math.random() * 200) + 10;
      let multiplier = Number((Math.random() * 15 + 1.1).toFixed(2));

      // Occasional mega win
      if (Math.random() < 0.25) {
        multiplier = Number((Math.random() * 250 + 20).toFixed(2));
      }
      if (Math.random() < 0.15) {
        betAmount = Math.floor(Math.random() * 800) + 400; // High roller
      }

      const payout = Number((betAmount * multiplier).toFixed(2));

      const newBet: BetEntry = {
        id: 'bet_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        game: randomGame.name,
        slug: randomGame.slug,
        player: randomUser,
        betAmount,
        multiplier,
        payout,
        time: 'Just now',
      };

      setBets((prev) => [newBet, ...prev.slice(0, 9)]);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const filteredBets = bets.filter((bet) => {
    if (activeTab === 'high') return bet.betAmount >= 200;
    if (activeTab === 'lucky') return bet.multiplier >= 50;
    return true;
  });

  return (
    <div className="w-full rounded-2xl bg-[#0b0f19] border border-slate-800/80 p-4 sm:p-6 shadow-xl">
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
            <span>LIVE BETS</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              REAL-TIME
            </span>
          </h3>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#121826] border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>All Bets</span>
          </button>

          <button
            onClick={() => setActiveTab('high')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'high'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>High Rollers</span>
          </button>

          <button
            onClick={() => setActiveTab('lucky')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'lucky'
                ? 'bg-cyan-500 text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Lucky 50x+</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold pb-2">
              <th className="py-2.5 px-3">Game</th>
              <th className="py-2.5 px-3">Player</th>
              <th className="py-2.5 px-3">Bet</th>
              <th className="py-2.5 px-3">Multiplier</th>
              <th className="py-2.5 px-3 text-right">Payout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 font-medium">
            {filteredBets.slice(0, 7).map((bet) => {
              const isHuge = bet.multiplier >= 100;
              const isHigh = bet.multiplier >= 20;

              return (
                <tr
                  key={bet.id}
                  className="hover:bg-slate-800/30 transition-colors animate-row-new group"
                >
                  <td className="py-3 px-3">
                    <Link
                      href={`/play/${bet.slug}`}
                      className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-emerald-400 transition-colors" />
                      {bet.game}
                    </Link>
                  </td>

                  <td className="py-3 px-3 text-slate-400 font-mono">
                    {bet.player}
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-300">
                    {formatCurrency(bet.betAmount)}
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md font-mono font-black text-[11px] ${
                        isHuge
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                          : isHigh
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {bet.multiplier.toFixed(2)}x
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-black text-emerald-400">
                    +{formatCurrency(bet.payout)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

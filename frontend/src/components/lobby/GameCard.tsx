'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Game } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { GameThumbnail } from './GameThumbnail';
import { Play, Eye, Flame, Sparkles, Heart, Zap } from 'lucide-react';

interface GameCardProps {
  game: Game;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'PRAGMATIC':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'PG_SOFT':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'SPRIBE':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'JILI':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'BIGSIX':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'EVOLUTION':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'NETENT':
        return 'bg-lime-500/20 text-lime-300 border-lime-500/40';
      default:
        return 'bg-slate-800/80 text-slate-300 border-slate-700';
    }
  };

  const getPlayHref = () => {
    if (game.slug === 'mines') return '/games/mines';
    if (game.slug === 'crash') return '/games/crash';
    if (game.slug === 'mafia-syndicate-777') return '/games/slot';
    return `/play/${game.slug}`;
  };

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch (e) {}
    }
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-[#0d1322] border border-slate-800/80 hover:border-emerald-500/60 shadow-md hover:shadow-[0_8px_25px_rgba(0,231,1,0.18)] transition-all duration-200 transform active:scale-95 sm:hover:-translate-y-1.5 flex flex-col justify-between">
      {/* Thumbnail Container (Tappable on mobile) */}
      <Link
        href={getPlayHref()}
        onClick={triggerHaptic}
        className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950 block"
      >
        <GameThumbnail game={game} />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
          <span
            className={`text-[8px] sm:text-[9px] font-black uppercase px-2 py-0.5 rounded-full border backdrop-blur-md shadow-sm ${getProviderColor(
              game.provider
            )}`}
          >
            {game.provider === 'BIGSIX' ? '9CASINO' : game.provider.replace('_', ' ')}
          </span>

          <div className="flex items-center gap-1">
            {game.isHot && (
              <span className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-red-600 text-white shadow-md">
                <Flame className="w-2.5 h-2.5 fill-white" />
                HOT
              </span>
            )}
            {game.isFeatured && (
              <span className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500 text-black font-extrabold shadow-sm">
                <Zap className="w-2.5 h-2.5 fill-black" />
                POPULAR
              </span>
            )}
          </div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            triggerHaptic();
            setIsFavorite(!isFavorite);
          }}
          className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-slate-300 hover:text-red-400 transition-colors z-20 active:scale-90"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Desktop Hover Overlay with Direct Play Actions */}
        <div className="hidden sm:flex absolute inset-0 bg-[#080b12]/85 backdrop-blur-[3px] opacity-0 group-hover:opacity-100 transition-opacity flex-col items-center justify-center p-3 gap-2 z-20">
          <Link
            href={`${getPlayHref()}?mode=REAL`}
            onClick={triggerHaptic}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-[#00e701] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,231,1,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            PLAY NOW
          </Link>

          <Link
            href={`${getPlayHref()}?mode=DEMO`}
            onClick={triggerHaptic}
            className="w-full py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-[11px] uppercase flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3 h-3" />
            DEMO
          </Link>

          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {((game.playCount || 1200) / 10).toFixed(0)} playing
          </span>
        </div>
      </Link>

      {/* Game Details Card Footer with 1-Tap Mobile Action */}
      <div className="p-2.5 sm:p-3 bg-[#0a0e1a] border-t border-slate-800/60 flex items-center justify-between gap-1.5">
        <div className="min-w-0 flex-1">
          <Link
            href={getPlayHref()}
            onClick={triggerHaptic}
            className="block font-extrabold text-[11px] sm:text-xs text-slate-100 truncate group-hover:text-emerald-400 transition-colors"
          >
            {game.title}
          </Link>

          <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-400 font-medium mt-0.5">
            <span className="text-emerald-400 font-mono font-bold">{game.rtp}% RTP</span>
            <span className="uppercase tracking-tight text-slate-500 hidden sm:inline">
              {game.volatility.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* 1-Tap Mobile Play Action Pill */}
        <Link
          href={getPlayHref()}
          onClick={triggerHaptic}
          className="sm:hidden shrink-0 w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 active:scale-90 active:bg-emerald-500 active:text-black transition-all shadow-sm"
          title="Instant Play"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
        </Link>
      </div>
    </div>
  );
};

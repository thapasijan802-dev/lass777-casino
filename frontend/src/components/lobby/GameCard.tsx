'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Game } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { Play, Eye, Flame, Sparkles, Heart } from 'lucide-react';

interface GameCardProps {
  game: Game;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'PRAGMATIC':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'PG_SOFT':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'SPRIBE':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'JILI':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'BIGSIX':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-[#111622] border border-slate-800 hover:border-amber-500/60 shadow-lg hover:shadow-gold-glow transition-all duration-300 transform hover:-translate-y-1">
      {/* Thumbnail Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
        <img
          src={game.thumbnail}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span
            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border backdrop-blur-md ${getProviderColor(
              game.provider
            )}`}
          >
            {game.provider.replace('_', ' ')}
          </span>

          <div className="flex items-center gap-1">
            {game.isHot && (
              <span className="flex items-center gap-0.5 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white shadow-md">
                <Flame className="w-2.5 h-2.5 fill-white" />
                HOT
              </span>
            )}
            {game.isFeatured && (
              <span className="flex items-center gap-0.5 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-black shadow-gold-glow">
                <Sparkles className="w-2.5 h-2.5 fill-black" />
                VIP
              </span>
            )}
          </div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
          className="absolute bottom-2.5 right-2.5 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-red-400 transition-colors z-10"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Hover Overlay with Action Buttons */}
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 gap-2.5 z-20">
          <Link
            href={`/play/${game.slug}?mode=REAL`}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs uppercase tracking-wider shadow-gold-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Play className="w-4 h-4 fill-black" />
            PLAY REAL MONEY
          </Link>

          <Link
            href={`/play/${game.slug}?mode=DEMO`}
            className="w-full py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            DEMO PLAY
          </Link>
        </div>
      </div>

      {/* Game Details Footer */}
      <div className="p-3 bg-[#0d121c]">
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3 className="font-bold text-xs text-slate-100 truncate group-hover:text-amber-400 transition-colors">
            {game.title}
          </h3>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <span className="text-emerald-400 font-semibold">{game.rtp}% RTP</span>
          <span className="uppercase tracking-tight text-slate-400">
            {game.volatility.replace('_', ' ')} VOL
          </span>
        </div>
      </div>
    </div>
  );
};

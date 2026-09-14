'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLobbyStore } from '@/store/useLobbyStore';
import { LobbyFilter } from '@/components/lobby/LobbyFilter';
import { GameCard } from '@/components/lobby/GameCard';
import { INITIAL_GAMES } from '@/lib/constants';
import { Sparkles } from 'lucide-react';

function LobbyContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const providerParam = searchParams.get('provider');

  const {
    games,
    selectedCategory,
    selectedProvider,
    searchQuery,
    setCategory,
    setProvider,
    fetchGames,
  } = useLobbyStore();

  useEffect(() => {
    if (categoryParam) {
      setCategory(categoryParam);
    }
    if (providerParam) {
      setProvider(providerParam);
    }
    fetchGames();
  }, [categoryParam, providerParam, setCategory, setProvider, fetchGames]);

  // Fallback to local catalog if backend games list is empty
  const displayGames = games && games.length > 0 ? games : INITIAL_GAMES;

  // Filter client-side if fallback catalog is used
  const filteredGames = displayGames.filter((g) => {
    if (selectedCategory !== 'ALL' && g.category !== selectedCategory) return false;
    if (selectedProvider !== 'ALL' && g.provider !== selectedProvider) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        g.title.toLowerCase().includes(q) ||
        g.slug.toLowerCase().includes(q) ||
        g.provider.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#080b12] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Lobby Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#0d1424] via-[#090d18] to-[#0d1424] border border-slate-800 p-6 sm:p-10 mb-8 overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>35+ Certified Games • Provably Fair</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
            9CASINO <span className="emerald-text-glow">GAME LOBBY</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Play provably fair 9Casino Originals (Plinko, Mines, Crash), blockbuster slots from Pragmatic and Hacksaw, or join live dealer tables from Evolution Gaming.
          </p>
        </div>
      </div>

      {/* Lobby Filters */}
      <LobbyFilter />

      {/* Game Catalog Grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-2xl bg-[#0d121f] border border-slate-800">
          <div className="text-4xl mb-3">🎲</div>
          <h3 className="text-lg font-bold text-white mb-1">No games found</h3>
          <p className="text-xs text-slate-400">Try adjusting your category or search query.</p>
        </div>
      )}
    </div>
  );
}

export default function LobbyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080b12] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LobbyContent />
    </Suspense>
  );
}

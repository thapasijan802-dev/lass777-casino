'use client';

import React from 'react';
import { useLobbyStore } from '@/store/useLobbyStore';
import { CATEGORIES, PROVIDERS } from '@/lib/constants';
import { Search, Flame, Coins, Rocket, Fish, Tv, Filter, Zap } from 'lucide-react';

export const LobbyFilter: React.FC = () => {
  const { selectedCategory, selectedProvider, searchQuery, setCategory, setProvider, setSearchQuery } =
    useLobbyStore();

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'ALL':
        return <Flame className="w-4 h-4" />;
      case 'ORIGINALS':
        return <Zap className="w-4 h-4" />;
      case 'SLOTS':
        return <Coins className="w-4 h-4" />;
      case 'CRASH':
        return <Rocket className="w-4 h-4" />;
      case 'FISH':
        return <Fish className="w-4 h-4" />;
      case 'LIVE':
        return <Tv className="w-4 h-4" />;
      default:
        return <Flame className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-400 to-[#00e701] text-black shadow-[0_0_15px_rgba(0,231,1,0.35)] scale-105'
                  : 'bg-[#0e1422] border border-slate-800 text-slate-300 hover:border-emerald-500/40 hover:text-white'
              }`}
            >
              {getCategoryIcon(cat.id)}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Provider Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search input */}
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search slots, originals, providers, or live tables..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0e1422] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
          />
        </div>

        {/* Provider Select Dropdown */}
        <div className="relative">
          <Filter className="absolute left-3.5 top-3 w-4 h-4 text-emerald-400 pointer-events-none" />
          <select
            value={selectedProvider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0e1422] border border-slate-800 text-white text-xs font-bold focus:outline-none focus:border-emerald-400 transition-colors cursor-pointer appearance-none"
          >
            {PROVIDERS.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0b101c] text-white">
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

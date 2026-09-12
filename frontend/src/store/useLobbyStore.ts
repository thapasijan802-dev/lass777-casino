import { create } from 'zustand';
import { api } from '@/lib/api';
import { Game } from '@/types';

interface LobbyState {
  selectedCategory: string;
  selectedProvider: string;
  searchQuery: string;
  games: Game[];
  isLoading: boolean;
  setCategory: (category: string) => void;
  setProvider: (provider: string) => void;
  setSearchQuery: (query: string) => void;
  fetchGames: () => Promise<void>;
}

export const useLobbyStore = create<LobbyState>((set, get) => ({
  selectedCategory: 'ALL',
  selectedProvider: 'ALL',
  searchQuery: '',
  games: [],
  isLoading: false,

  setCategory: (selectedCategory: string) => {
    set({ selectedCategory });
    get().fetchGames();
  },

  setProvider: (selectedProvider: string) => {
    set({ selectedProvider });
    get().fetchGames();
  },

  setSearchQuery: (searchQuery: string) => {
    set({ searchQuery });
    get().fetchGames();
  },

  fetchGames: async () => {
    const { selectedCategory, selectedProvider, searchQuery } = get();
    set({ isLoading: true });

    try {
      const params: any = {};
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      if (selectedProvider !== 'ALL') params.provider = selectedProvider;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.getGames(params);
      if (res && res.data) {
        set({ games: res.data, isLoading: false });
        return;
      }
    } catch (e) {
      console.warn('Backend lobby fetch failed, using built-in catalog data');
    }

    set({ isLoading: false });
  },
}));

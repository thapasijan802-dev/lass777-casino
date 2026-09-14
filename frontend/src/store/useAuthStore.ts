import { create } from 'zustand';
import { api } from '@/lib/api';
import { User, Wallet } from '@/types';

interface AuthState {
  user: User | null;
  wallet: Wallet | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  setWallet: (wallet: Wallet) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  wallet: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  authModalOpen: false,
  authModalTab: 'login',

  openAuthModal: (tab = 'login') => set({ authModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ authModalOpen: false }),

  initialize: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('9casino_token') || localStorage.getItem('lass777_token');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const data = await api.getMe();
      set({
        user: data,
        wallet: data.wallet,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (e) {
      localStorage.removeItem('9casino_token');
      localStorage.removeItem('lass777_token');
      set({ user: null, wallet: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    const data = await api.login({ email, password });
    localStorage.setItem('9casino_token', data.token);
    set({
      user: data.user,
      wallet: data.user.wallet,
      token: data.token,
      isAuthenticated: true,
      authModalOpen: false,
    });
  },

  register: async (payload: any) => {
    const data = await api.register(payload);
    localStorage.setItem('9casino_token', data.token);
    set({
      user: data.user,
      wallet: data.user.wallet,
      token: data.token,
      isAuthenticated: true,
      authModalOpen: false,
    });
  },

  logout: () => {
    localStorage.removeItem('9casino_token');
    localStorage.removeItem('lass777_token');
    set({
      user: null,
      wallet: null,
      token: null,
      isAuthenticated: false,
    });
  },

  setWallet: (wallet: Wallet) => set({ wallet }),
}));

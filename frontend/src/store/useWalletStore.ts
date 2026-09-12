import { create } from 'zustand';
import { api } from '@/lib/api';
import { Transaction } from '@/types';

interface WalletState {
  realBalance: number;
  bonusBalance: number;
  lockedBalance: number;
  currency: string;
  transactions: Transaction[];
  isLoading: boolean;
  depositModalOpen: boolean;
  withdrawModalOpen: boolean;
  openDepositModal: () => void;
  closeDepositModal: () => void;
  openWithdrawModal: () => void;
  closeWithdrawModal: () => void;
  fetchBalance: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  updateBalances: (real: number, bonus?: number) => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  realBalance: 0,
  bonusBalance: 0,
  lockedBalance: 0,
  currency: 'USD',
  transactions: [],
  isLoading: false,
  depositModalOpen: false,
  withdrawModalOpen: false,

  openDepositModal: () => set({ depositModalOpen: true }),
  closeDepositModal: () => set({ depositModalOpen: false }),
  openWithdrawModal: () => set({ withdrawModalOpen: true }),
  closeWithdrawModal: () => set({ withdrawModalOpen: false }),

  fetchBalance: async () => {
    try {
      const data = await api.getBalance();
      set({
        realBalance: data.realBalance,
        bonusBalance: data.bonusBalance,
        lockedBalance: data.lockedBalance,
        currency: data.currency,
      });
    } catch (e) {
      // ignore
    }
  },

  fetchTransactions: async () => {
    try {
      set({ isLoading: true });
      const data = await api.getTransactions();
      set({ transactions: data, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  updateBalances: (real: number, bonus?: number) => {
    set((state) => ({
      realBalance: real,
      bonusBalance: bonus !== undefined ? bonus : state.bonusBalance,
    }));
  },
}));

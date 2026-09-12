'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useWalletStore } from '@/store/useWalletStore';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  Wallet as WalletIcon,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';

export default function WalletPage() {
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const {
    realBalance,
    bonusBalance,
    lockedBalance,
    openDepositModal,
    openWithdrawModal,
    fetchBalance,
    transactions,
    fetchTransactions,
    isLoading,
  } = useWalletStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBalance();
      fetchTransactions();
    }
  }, [isAuthenticated, fetchBalance, fetchTransactions]);

  const handleClaimPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoMessage(null);
    setPromoError(null);

    if (!promoInput.trim()) return;

    try {
      const res = await api.claimBonus(promoInput.trim());
      setPromoMessage(res.message);
      setPromoInput('');
      fetchBalance();
      fetchTransactions();
    } catch (err: any) {
      setPromoError(err.message || 'Invalid promo code');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
          <WalletIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Sign In to Access Your Wallet</h2>
        <p className="text-xs text-slate-400 mb-6 max-w-sm">
          Please log in to manage your balances, make deposits, and review your complete transaction history.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs uppercase tracking-wider shadow-gold-glow"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-1">
          VIP CASHIER & <span className="gold-text-glow">WALLET</span>
        </h1>
        <p className="text-xs text-slate-400">Manage your real funds, bonus credits, and transaction ledger.</p>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-gradient-to-br from-[#121927] to-[#0e1320] border border-amber-500/40 p-6 shadow-gold-glow">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Real Money Balance</div>
          <div className="text-3xl font-black text-white font-mono mb-4">{formatCurrency(realBalance)}</div>
          <div className="flex gap-2">
            <button
              onClick={openDepositModal}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs uppercase shadow-gold-glow flex items-center justify-center gap-1"
            >
              <ArrowDownLeft className="w-4 h-4" />
              Deposit
            </button>
            <button
              onClick={openWithdrawModal}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs uppercase flex items-center justify-center gap-1"
            >
              <ArrowUpRight className="w-4 h-4" />
              Withdraw
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-[#0f1422] border border-slate-800 p-6">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Bonus Credits</div>
          <div className="text-3xl font-black text-amber-400 font-mono mb-2">
            {formatCurrency(bonusBalance)}
          </div>
          <p className="text-[11px] text-slate-400">
            Usable across all slots and crash games. Subject to bonus wagering rules.
          </p>
        </div>

        <div className="rounded-2xl bg-[#0f1422] border border-slate-800 p-6">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Pending / Locked</div>
          <div className="text-3xl font-black text-slate-300 font-mono mb-2">
            {formatCurrency(lockedBalance)}
          </div>
          <p className="text-[11px] text-slate-400">
            Pending withdrawal review. Released automatically upon approval.
          </p>
        </div>
      </div>

      {/* Promo Code Redemption Box */}
      <div className="rounded-2xl bg-[#0e1320] border border-amber-500/30 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-3">
          <Gift className="w-4 h-4" />
          Redeem Promo Voucher
        </h3>
        <form onSubmit={handleClaimPromo} className="flex flex-col sm:flex-row gap-3 max-w-md">
          <input
            type="text"
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
            placeholder="e.g. LASS777 or VIPBOOST"
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#161c28] border border-slate-700 text-white font-mono text-sm uppercase focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-gold-glow"
          >
            Apply Code
          </button>
        </form>
        {promoMessage && <p className="text-xs text-emerald-400 font-bold mt-2">{promoMessage}</p>}
        {promoError && <p className="text-xs text-red-400 font-bold mt-2">{promoError}</p>}
      </div>

      {/* Transaction History Ledger */}
      <div className="rounded-2xl bg-[#0e1320] border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Transaction Ledger</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#121826] text-slate-400 uppercase font-black tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Details / Ref</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {transactions && transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          tx.type === 'DEPOSIT' || tx.type === 'WIN' || tx.type === 'BONUS'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-red-500/20 text-red-400 border border-red-500/40'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      {tx.type === 'DEPOSIT' || tx.type === 'WIN' || tx.type === 'BONUS' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase ${
                          tx.status === 'COMPLETED'
                            ? 'text-emerald-400'
                            : tx.status === 'PENDING'
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {tx.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                        {tx.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {tx.paymentMethod || tx.providerRef || 'Internal Game Engine'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No transactions recorded yet. Make your first deposit or test a spin!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

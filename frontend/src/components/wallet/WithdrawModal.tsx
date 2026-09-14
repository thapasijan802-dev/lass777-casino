'use client';

import React, { useState } from 'react';
import { useWalletStore } from '@/store/useWalletStore';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { X, CheckCircle2, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';

export const WithdrawModal: React.FC = () => {
  const { withdrawModalOpen, closeWithdrawModal, realBalance, updateBalances, fetchBalance } = useWalletStore();

  const [method, setMethod] = useState<'USDT_TRC20' | 'BTC' | 'ETH' | 'PIX'>('USDT_TRC20');
  const [amount, setAmount] = useState<number>(50);
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!withdrawModalOpen) return null;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (amount > realBalance) {
      setError('Withdrawal amount exceeds your available real money balance');
      return;
    }

    if (!address.trim()) {
      setError('Please provide destination wallet address or payout account');
      return;
    }

    setLoading(true);

    try {
      const res = await api.withdraw({
        amount,
        method,
        destinationAddress: address.trim(),
      });

      setSuccess(res.message || 'Withdrawal submitted successfully!');
      if (res.newBalance) {
        updateBalances(res.newBalance.realBalance);
      }
      fetchBalance();
      setTimeout(() => {
        closeWithdrawModal();
        setSuccess(null);
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit withdrawal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0e131e] border border-amber-500/40 p-6 sm:p-8 shadow-gold-glow-lg text-white">
        <button
          onClick={closeWithdrawModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>VIP Cashout</span>
          </div>
          <h2 className="text-2xl font-black tracking-wide">WITHDRAW FUNDS</h2>
          <p className="text-xs text-slate-400">
            Available Real Balance:{' '}
            <span className="text-amber-400 font-bold font-mono">{formatCurrency(realBalance)}</span>
          </p>
        </div>

        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-950/70 border border-emerald-500 text-center space-y-3 animate-in zoom-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-black text-emerald-300">Request Submitted!</h3>
            <p className="text-xs text-emerald-200">{success}</p>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Payout Method</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'USDT_TRC20', label: 'USDT (TRC20)', note: 'Fastest Payout' },
                  { id: 'BTC', label: 'Bitcoin (BTC)', note: 'Direct Crypto' },
                  { id: 'ETH', label: 'Ethereum (ETH)', note: 'Direct Crypto' },
                  { id: 'PIX', label: 'Instant Bank / Pix', note: 'Fiat Payout' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMethod(item.id as any)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      method === item.id
                        ? 'bg-amber-500/15 border-amber-400 text-amber-300 shadow-gold-glow'
                        : 'bg-[#151b27] border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="text-xs font-black">{item.label}</span>
                    <span className="text-[10px] text-slate-400">{item.note}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-300 uppercase">Amount ($)</label>
                <button
                  type="button"
                  onClick={() => setAmount(Math.max(20, Math.floor(realBalance)))}
                  className="text-xs font-bold text-amber-400 hover:underline"
                >
                  Max Available
                </button>
              </div>
              <input
                type="number"
                min={20}
                max={realBalance || 20}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#161c28] border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Destination Wallet Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. TYd8K1gRk4b6Xv7Y2P9m5Z8sWq1a3b5c7e"
                className="w-full px-4 py-2.5 rounded-xl bg-[#161c28] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Withdrawals are processed 24/7. VIP level 2+ enjoy automated instant payouts.</span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || realBalance < 20}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-[#00e701] text-black font-black uppercase tracking-wider text-sm shadow-[0_0_15px_rgba(0,231,1,0.35)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Submitting Request...</span>
              ) : (
                <>
                  <span>REQUEST CASHOUT OF {formatCurrency(amount)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

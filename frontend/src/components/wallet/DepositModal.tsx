'use client';

import React, { useState } from 'react';
import { useWalletStore } from '@/store/useWalletStore';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { X, CheckCircle2, Copy, QrCode, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const DepositModal: React.FC = () => {
  const { depositModalOpen, closeDepositModal, updateBalances, fetchBalance } = useWalletStore();

  const [selectedMethod, setSelectedMethod] = useState<'USDT_TRC20' | 'USDT_ERC20' | 'BTC' | 'ETH' | 'CREDIT_CARD' | 'PIX'>('USDT_TRC20');
  const [amount, setAmount] = useState<number>(100);
  const [bonusCode, setBonusCode] = useState<string>('WELCOME200');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!depositModalOpen) return null;

  const quickAmounts = [25, 50, 100, 250, 500, 1000];

  const depositAddress =
    selectedMethod === 'USDT_TRC20'
      ? 'TYd8K1gRk4b6Xv7Y2P9m5Z8sWq1a3b5c7e'
      : selectedMethod === 'BTC'
      ? 'bc1q9v8h7g6f5d4s3a2z1x0c9v8b7n6m5l4k3j2h1'
      : '0x71C...849E2bA72382c4';

  const handleCopy = () => {
    navigator.clipboard?.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = async () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await api.deposit({
        amount,
        method: selectedMethod,
        bonusCode: bonusCode || undefined,
      });

      setSuccessMessage(res.message || 'Deposit processed successfully!');
      if (res.newBalance) {
        updateBalances(res.newBalance.realBalance, res.newBalance.bonusBalance);
      }
      fetchBalance();
      setTimeout(() => {
        closeDepositModal();
        setSuccessMessage(null);
      }, 2500);
    } catch (err: any) {
      // If offline or simulated, simulate local instant credit:
      const newReal = amount;
      updateBalances(newReal, bonusCode ? amount : 0);
      setSuccessMessage(`Demo Deposit of $${amount} credited!`);
      setTimeout(() => {
        closeDepositModal();
        setSuccessMessage(null);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0e131e] border border-amber-500/40 p-6 sm:p-8 shadow-gold-glow-lg text-white">
        <button
          onClick={closeDepositModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Cashier</span>
          </div>
          <h2 className="text-2xl font-black tracking-wide">DEPOSIT FUNDS</h2>
          <p className="text-xs text-slate-400">Zero fees • 100% automated credit • Bank-grade encryption</p>
        </div>

        {successMessage ? (
          <div className="p-6 rounded-2xl bg-emerald-950/70 border border-emerald-500 text-center space-y-3 animate-in zoom-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-black text-emerald-300">Deposit Confirmed!</h3>
            <p className="text-xs text-emerald-200">{successMessage}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Select Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'USDT_TRC20', label: 'USDT TRC20', tag: 'Fastest' },
                  { id: 'USDT_ERC20', label: 'USDT ERC20', tag: 'Stable' },
                  { id: 'BTC', label: 'Bitcoin', tag: 'Crypto' },
                  { id: 'CREDIT_CARD', label: 'Cards / Visa', tag: 'Fiat' },
                  { id: 'ETH', label: 'Ethereum', tag: 'Crypto' },
                  { id: 'PIX', label: 'Pix / E-Wallet', tag: 'Instant' },
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id as any)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      selectedMethod === method.id
                        ? 'bg-amber-500/15 border-amber-400 text-amber-300 shadow-gold-glow'
                        : 'bg-[#151b27] border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-xs font-black">{method.label}</span>
                    <span className="text-[9px] uppercase font-bold text-amber-500/80">{method.tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Amount Pills */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Select Amount</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                {quickAmounts.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      amount === val
                        ? 'bg-amber-500 text-black shadow-gold-glow'
                        : 'bg-[#161c28] border border-slate-700 text-slate-300 hover:border-amber-500/50'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={10}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Custom amount"
                className="w-full px-4 py-2.5 rounded-xl bg-[#161c28] border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {/* Bonus Code Input */}
            <div>
              <label className="block text-xs font-bold text-amber-400 uppercase mb-1">
                Deposit Bonus Code (100% Match)
              </label>
              <input
                type="text"
                value={bonusCode}
                onChange={(e) => setBonusCode(e.target.value.toUpperCase())}
                placeholder="WELCOME200"
                className="w-full px-4 py-2 rounded-xl bg-[#161c28] border border-amber-500/40 text-amber-300 font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Generated Address Box for Crypto */}
            {selectedMethod.startsWith('USDT') || selectedMethod === 'BTC' || selectedMethod === 'ETH' ? (
              <div className="p-3.5 rounded-xl bg-[#121824] border border-slate-700 flex items-center justify-between gap-2">
                <div className="overflow-hidden">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Destination {selectedMethod} Address:</div>
                  <div className="text-xs font-mono text-amber-300 truncate">{depositAddress}</div>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ) : null}

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs text-center">
                {error}
              </div>
            )}

            {/* Submit Action */}
            <button
              onClick={handleDeposit}
              disabled={loading || amount < 10}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black uppercase tracking-wider text-sm shadow-gold-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Confirming Deposit...</span>
              ) : (
                <>
                  <span>CONFIRM DEPOSIT OF {formatCurrency(amount)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

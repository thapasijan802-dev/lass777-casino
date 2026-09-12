'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { X, Lock, Mail, User as UserIcon, Phone, Gift, ArrowRight, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalTab, closeAuthModal, openAuthModal, login, register } = useAuthStore();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [promoCode, setPromoCode] = useState('FREE20');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authModalTab === 'login') {
        await login(email, password);
      } else {
        await register({
          email,
          username,
          password,
          phone: phone || undefined,
          promoCode: promoCode || undefined,
        });
      }
      closeAuthModal();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (type: 'player' | 'admin') => {
    setError(null);
    setLoading(true);
    try {
      if (type === 'admin') {
        await login('admin@lass777.com', 'AdminPass777!');
      } else {
        await login('demo@lass777.com', 'DemoPass777!');
      }
      closeAuthModal();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0e131d] border border-amber-500/40 p-6 sm:p-8 shadow-gold-glow-lg text-white">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase mb-2">
            <Gift className="w-3.5 h-3.5" />
            <span>Lass777 VIP Membership</span>
          </div>
          <h2 className="text-2xl font-black tracking-wide">
            {authModalTab === 'login' ? 'WELCOME BACK' : 'CREATE YOUR ACCOUNT'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {authModalTab === 'login'
              ? 'Enter your credentials to access your high-roller account'
              : 'Register now and instantly receive $20 FREE bonus chip!'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-xl border border-slate-800 mb-6">
          <button
            onClick={() => {
              setError(null);
              openAuthModal('login');
            }}
            className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
              authModalTab === 'login'
                ? 'bg-amber-500 text-black shadow-gold-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setError(null);
              openAuthModal('register');
            }}
            className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
              authModalTab === 'register'
                ? 'bg-amber-500 text-black shadow-gold-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register ($20 Free)
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs text-center font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vip.player@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#161c28] border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {authModalTab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="LuckyVip777"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#161c28] border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>
          )}

          {authModalTab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Mobile Number <span className="text-slate-500">(Optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 777 0100"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#161c28] border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#161c28] border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {authModalTab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-amber-400 uppercase mb-1">Promo Code</label>
              <div className="relative">
                <Gift className="absolute left-3 top-3 w-4 h-4 text-amber-400" />
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="FREE20"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#161c28] border border-amber-500/50 text-amber-300 font-mono font-bold text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black uppercase tracking-wider text-sm shadow-gold-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block animate-spin">🌀</span>
            ) : (
              <>
                <span>{authModalTab === 'login' ? 'ENTER CASINO' : 'CLAIM $20 & PLAY'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Quick Demo Login Shortcuts */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="text-center text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2.5">
            Quick 1-Click Demo Logins for Testing
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('player')}
              className="py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-bold text-amber-300 flex items-center justify-center gap-1 transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5" />
              Demo Player ($2.5k)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="py-2 px-3 rounded-lg bg-purple-950/60 hover:bg-purple-900/70 border border-purple-500/40 text-xs font-bold text-purple-300 flex items-center justify-center gap-1 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

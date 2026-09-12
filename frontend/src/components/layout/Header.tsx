'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useWalletStore } from '@/store/useWalletStore';
import { formatCurrency } from '@/lib/utils';
import {
  Coins,
  Crown,
  Flame,
  Gamepad2,
  Gift,
  LogOut,
  Menu,
  ShieldCheck,
  User as UserIcon,
  Wallet as WalletIcon,
  X,
  PlusCircle,
} from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, openAuthModal, initialize } = useAuthStore();
  const { realBalance, bonusBalance, openDepositModal, fetchBalance } = useWalletStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBalance();
    }
  }, [isAuthenticated, fetchBalance]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/lobby', label: 'Casino Lobby' },
    { href: '/lobby?category=SLOTS', label: 'Slots' },
    { href: '/lobby?category=CRASH', label: 'Crash' },
    { href: '/lobby?category=FISH', label: 'Fish Arcade' },
    { href: '/#promotions', label: 'Promotions' },
    { href: '/#vip', label: 'VIP Club' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-500/20 bg-[#07090e]/90 backdrop-blur-xl transition-all">
      {/* Top promotional ticker */}
      <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 py-1 px-4 text-center text-xs font-black tracking-wider text-black uppercase shadow-inner flex items-center justify-center gap-2">
        <Crown className="w-3.5 h-3.5 fill-black animate-bounce" />
        <span>WELCOME TO LASS777 • 200% FIRST DEPOSIT BONUS + $20 FREE REGISTRATION BONUS • INSTANT WITHDRAWALS</span>
        <Crown className="w-3.5 h-3.5 fill-black animate-bounce" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-800 p-0.5 shadow-gold-glow group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0d111a] rounded-[10px] flex items-center justify-center">
              <span className="text-xl font-black italic gold-text-glow">777</span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black tracking-wider text-white group-hover:text-amber-400 transition-colors">
                LASS<span className="text-amber-400">777</span>
              </span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                VIP
              </span>
            </div>
            <span className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">
              PREMIER iGAMING CASINO
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-semibold transition-all hover:text-amber-400 ${
                  isActive ? 'text-amber-400 font-bold drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'text-slate-300'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Account / Auth Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Balance Widget */}
              <div className="flex items-center bg-[#121824] border border-amber-500/30 rounded-full px-3 py-1.5 shadow-inner">
                <div className="flex flex-col text-right mr-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Balance</span>
                  <span className="text-sm font-extrabold text-amber-400 font-mono">
                    {formatCurrency(realBalance + bonusBalance)}
                  </span>
                </div>
                <button
                  onClick={openDepositModal}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:brightness-110 shadow-gold-glow transition-transform active:scale-95"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Deposit
                </button>
              </div>

              {/* User Dropdown / Navs */}
              <Link
                href="/profile"
                className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-700/80 transition-all text-slate-300 hover:text-amber-400"
                title="Player Profile"
              >
                <UserIcon className="w-5 h-5" />
              </Link>

              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black uppercase bg-purple-900/60 border border-purple-500/50 text-purple-200 hover:bg-purple-800/70 shadow-neon-glow transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}

              <button
                onClick={logout}
                className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-red-500/50 hover:bg-red-950/40 text-slate-400 hover:text-red-400 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 text-sm font-bold text-slate-200 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="relative group overflow-hidden px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-gold-glow hover:shadow-gold-glow-lg transition-all transform hover:scale-[1.02] active:scale-95"
              >
                <div className="absolute inset-0 w-1/2 h-full bg-white/40 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
                <span className="relative flex items-center gap-1.5">
                  <Gift className="w-4 h-4" />
                  GET $20 FREE
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu hamburger button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800/50 border border-slate-700"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile drop-down navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-amber-500/20 bg-[#0a0e17] px-4 py-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-200 hover:text-amber-400 px-3 py-2 rounded-lg hover:bg-slate-800/50"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-amber-500/30">
                  <div>
                    <div className="text-xs text-slate-400">Total Balance</div>
                    <div className="text-lg font-black text-amber-400">
                      {formatCurrency(realBalance + bonusBalance)}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openDepositModal();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-black uppercase bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-gold-glow"
                  >
                    Deposit
                  </button>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center rounded-xl bg-slate-800 text-sm font-bold text-slate-200"
                  >
                    Profile
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-2 text-center rounded-xl bg-purple-900/60 border border-purple-500/50 text-sm font-bold text-purple-200"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-900/40 text-sm font-bold text-red-300"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-slate-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('register');
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-sm font-black uppercase shadow-gold-glow flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  GET $20 FREE REGISTRATION BONUS
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

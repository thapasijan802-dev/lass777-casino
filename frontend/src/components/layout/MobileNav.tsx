'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useWalletStore } from '@/store/useWalletStore';
import { Home, Gamepad2, PlusCircle, Gift, User } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const { openDepositModal } = useWalletStore();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d15]/95 backdrop-blur-xl border-t border-amber-500/30 px-3 py-2">
      <div className="flex items-center justify-around">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            pathname === '/' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <Link
          href="/lobby"
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            pathname.startsWith('/lobby') ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span>Lobby</span>
        </Link>

        {/* Floating Center Deposit Button */}
        <button
          onClick={() => {
            if (isAuthenticated) {
              openDepositModal();
            } else {
              openAuthModal('register');
            }
          }}
          className="-mt-5 flex flex-col items-center justify-center w-13 h-13 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-black shadow-gold-glow-lg border-2 border-black p-2.5 active:scale-90 transition-transform"
        >
          <PlusCircle className="w-6 h-6 stroke-[2.5]" />
          <span className="text-[9px] font-black uppercase tracking-tighter">Deposit</span>
        </button>

        <Link
          href="/#promotions"
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-amber-400"
        >
          <Gift className="w-5 h-5" />
          <span>Bonuses</span>
        </Link>

        {isAuthenticated ? (
          <Link
            href="/profile"
            className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
              pathname.startsWith('/profile') ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </Link>
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            className="flex flex-col items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-amber-400"
          >
            <User className="w-5 h-5" />
            <span>Login</span>
          </button>
        )}
      </div>
    </div>
  );
};

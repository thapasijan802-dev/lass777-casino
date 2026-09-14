'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useWalletStore } from '@/store/useWalletStore';
import { Home, Zap, PlusCircle, Flame, User, Gamepad2 } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const { openDepositModal } = useWalletStore();

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch (e) {}
    }
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080b12]/95 backdrop-blur-2xl border-t border-slate-800/90 px-2 py-1.5 pb-[calc(0.4rem+env(safe-area-inset-bottom,0px))] shadow-[0_-10px_30px_rgba(0,0,0,0.7)]">
      <div className="flex items-center justify-around">
        {/* 1. Home Tab */}
        <Link
          href="/"
          onClick={triggerHaptic}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all active:scale-90 ${
            pathname === '/'
              ? 'text-emerald-400 font-extrabold drop-shadow-[0_0_8px_rgba(0,231,1,0.5)]'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </Link>

        {/* 2. Originals Grind Tab */}
        <Link
          href="/lobby?category=ORIGINALS"
          onClick={triggerHaptic}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all active:scale-90 ${
            pathname.includes('ORIGINALS')
              ? 'text-emerald-400 font-extrabold drop-shadow-[0_0_8px_rgba(0,231,1,0.5)]'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Originals</span>
        </Link>

        {/* 3. Floating Center Deposit Action */}
        <button
          onClick={() => {
            triggerHaptic();
            if (isAuthenticated) {
              openDepositModal();
            } else {
              openAuthModal('register');
            }
          }}
          className="-mt-5 flex flex-col items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-400 to-[#00e701] text-black shadow-[0_0_20px_rgba(0,231,1,0.5)] border-2 border-[#080b12] p-1.5 active:scale-90 transition-transform cursor-pointer"
          title="Instant Deposit"
        >
          <PlusCircle className="w-6 h-6 stroke-[2.5]" />
          <span className="text-[7.5px] font-black uppercase tracking-tighter -mt-0.5">Deposit</span>
        </button>

        {/* 4. All Games Lobby Tab */}
        <Link
          href="/lobby"
          onClick={triggerHaptic}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all active:scale-90 ${
            pathname === '/lobby' && !pathname.includes('ORIGINALS')
              ? 'text-emerald-400 font-extrabold drop-shadow-[0_0_8px_rgba(0,231,1,0.5)]'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Lobby</span>
        </Link>

        {/* 5. Profile / Auth Tab */}
        {isAuthenticated ? (
          <Link
            href="/profile"
            onClick={triggerHaptic}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all active:scale-90 ${
              pathname.startsWith('/profile')
                ? 'text-emerald-400 font-extrabold drop-shadow-[0_0_8px_rgba(0,231,1,0.5)]'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">VIP</span>
          </Link>
        ) : (
          <button
            onClick={() => {
              triggerHaptic();
              openAuthModal('login');
            }}
            className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-slate-400 hover:text-emerald-400 font-medium transition-all active:scale-90 cursor-pointer"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Sign In</span>
          </button>
        )}
      </div>
    </div>
  );
};

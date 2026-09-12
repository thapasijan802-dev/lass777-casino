'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  Receipt,
  ShieldCheck,
  ArrowLeft,
  LogOut,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated, login, logout, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const navItems = [
    { href: '/admin', label: 'Dashboard & GGR', icon: LayoutDashboard },
    { href: '/admin#users', label: 'Player Management', icon: Users },
    { href: '/admin#games', label: 'Game Catalog', icon: Gamepad2 },
    { href: '/admin#transactions', label: 'Withdrawal Approvals', icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 border-r border-amber-500/20 bg-[#090d16] p-5 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-purple-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black tracking-wide text-white">LASS777 ADMIN</div>
              <div className="text-[10px] uppercase font-bold text-amber-400">OPERATOR CONSOLE</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-purple-900/50 border border-purple-500/40 text-purple-200 shadow-neon-glow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Operator Controls */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Casino Front</span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs truncate max-w-[140px]">
                <div className="font-bold text-white truncate">{user?.username}</div>
                <div className="text-[10px] text-purple-400 font-bold uppercase">{user?.role}</div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => login('admin@lass777.com', 'AdminPass777!')}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider"
            >
              1-Click Admin Login
            </button>
          )}
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

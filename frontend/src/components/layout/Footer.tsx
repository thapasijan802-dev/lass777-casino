'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Headphones, Award, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-amber-500/20 bg-[#06080d] text-slate-400 text-sm">
      {/* Trust & Features Banner */}
      <div className="border-b border-slate-800/80 py-8 bg-[#090d15]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-200">Certified RNG Fair</div>
              <div className="text-xs text-slate-500">eCOGRA Tested Games</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-200">Instant Cashouts</div>
              <div className="text-xs text-slate-500">Automated Crypto & Fiat</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-200">24/7 VIP Support</div>
              <div className="text-xs text-slate-500">Live Chat & Dedicated VIP Host</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-200">Tier-1 Providers</div>
              <div className="text-xs text-slate-500">Direct Aggregator APIs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Information */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-[#00e701] p-0.5 shadow-[0_0_12px_rgba(0,231,1,0.35)]">
                <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                  <span className="text-lg font-black font-mono text-emerald-400">9</span>
                </div>
              </div>
              <span className="text-2xl font-black tracking-wider text-white">
                9<span className="text-emerald-400">CASINO</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The premier online destination for provably fair crypto originals, blockbuster slots, and high-stakes live dealer game shows. Lightning-fast crypto payouts, automated rakeback, and 24/7 VIP support.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>OVER $28,000,000 IN MONTHLY PAYOUTS PROCESSED</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">Games</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/lobby?category=ORIGINALS" className="hover:text-emerald-400 transition-colors">9Casino Originals</Link></li>
              <li><Link href="/lobby?category=SLOTS" className="hover:text-emerald-400 transition-colors">Video Slots</Link></li>
              <li><Link href="/lobby?category=CRASH" className="hover:text-emerald-400 transition-colors">Crash Games & Aviator</Link></li>
              <li><Link href="/lobby?category=LIVE" className="hover:text-emerald-400 transition-colors">Live Casino Tables</Link></li>
              <li><Link href="/lobby" className="hover:text-emerald-400 transition-colors">All 35+ Games</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">Promotions</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/#vip" className="hover:text-emerald-400 transition-colors">VIP Rakeback Club</Link></li>
              <li><Link href="/wallet" className="hover:text-emerald-400 transition-colors">Deposit & Withdraw</Link></li>
              <li><Link href="/#vip" className="hover:text-emerald-400 transition-colors">Weekly Reload Bonus</Link></li>
              <li><Link href="/#vip" className="hover:text-emerald-400 transition-colors">Monthly VIP Drops</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">Security & Fairness</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-400">Provably Fair Verification</span></li>
              <li><span className="text-slate-400">Crypto Vault Cold Storage</span></li>
              <li><span className="text-slate-400">Anti-Money Laundering (AML)</span></li>
              <li><span className="text-slate-400">Responsible Gaming 18+</span></li>
              <li><span className="text-slate-400">Privacy & Terms</span></li>
            </ul>
          </div>
        </div>

        {/* Certified Providers Bar */}
        <div className="pt-8 border-t border-slate-800/80">
          <div className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
            Official Certified Game Aggregators & Studio Partners
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-500 font-black text-xs sm:text-sm tracking-wider">
            <span className="hover:text-emerald-400 transition-colors">9CASINO ORIGINALS</span>
            <span className="hover:text-emerald-400 transition-colors">PRAGMATIC PLAY</span>
            <span className="hover:text-emerald-400 transition-colors">HACKSAW GAMING</span>
            <span className="hover:text-emerald-400 transition-colors">EVOLUTION</span>
            <span className="hover:text-emerald-400 transition-colors">PG SOFT</span>
            <span className="hover:text-emerald-400 transition-colors">SPRIBE</span>
            <span className="hover:text-emerald-400 transition-colors">JILI GAMES</span>
          </div>
        </div>

        {/* Regulatory & Disclaimer */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 text-center space-y-3">
          <div className="flex items-center justify-center gap-4 text-xs font-bold text-emerald-400">
            <span className="px-2 py-0.5 rounded border border-emerald-500/40">18+ ONLY</span>
            <span>PROVABLY FAIR</span>
            <span>INSTANT CRYPTO CASHOUTS</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-3xl mx-auto">
            9casino is a premier crypto entertainment and iGaming platform. All games are certified provably fair or served directly via licensed gaming aggregators. Please play responsibly.
          </p>
          <div className="text-[11px] text-slate-600">
            © {new Date().getFullYear()} 9casino Global Entertainment Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

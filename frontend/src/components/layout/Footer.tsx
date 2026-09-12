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
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-800 p-0.5 shadow-gold-glow">
                <div className="w-full h-full bg-[#0d111a] rounded-[10px] flex items-center justify-center">
                  <span className="text-lg font-black italic gold-text-glow">777</span>
                </div>
              </div>
              <span className="text-2xl font-black tracking-wider text-white">
                LASS<span className="text-amber-400">777</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The premier online destination for world-class slots, crash games, and high-stakes fish arcades. Powered by industry-leading game aggregator protocols with lightning-fast payouts and VIP rewards.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>OVER $14,000,000 IN MONTHLY JACKPOTS WON</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">Games</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/lobby?category=SLOTS" className="hover:text-amber-400 transition-colors">Video Slots</Link></li>
              <li><Link href="/lobby?category=CRASH" className="hover:text-amber-400 transition-colors">Crash Games & Aviator</Link></li>
              <li><Link href="/lobby?category=FISH" className="hover:text-amber-400 transition-colors">Fish Arcade Shooting</Link></li>
              <li><Link href="/lobby?category=LIVE" className="hover:text-amber-400 transition-colors">Live Casino Tables</Link></li>
              <li><Link href="/lobby" className="hover:text-amber-400 transition-colors">Jackpot Games</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">Promotions</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/#promotions" className="hover:text-amber-400 transition-colors">$20 Free Sign-up Chip</Link></li>
              <li><Link href="/#promotions" className="hover:text-amber-400 transition-colors">200% Welcome Package</Link></li>
              <li><Link href="/#vip" className="hover:text-amber-400 transition-colors">VIP High-Roller Club</Link></li>
              <li><Link href="/wallet" className="hover:text-amber-400 transition-colors">Daily Deposit Cashbacks</Link></li>
              <li><Link href="/#app-download" className="hover:text-amber-400 transition-colors">Mobile App Rewards</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">Security & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-400">Terms of Service</span></li>
              <li><span className="text-slate-400">Privacy Policy</span></li>
              <li><span className="text-slate-400">Fairness & RNG Testing</span></li>
              <li><span className="text-slate-400">Responsible Gaming 18+</span></li>
              <li><span className="text-slate-400">Self-Exclusion</span></li>
            </ul>
          </div>
        </div>

        {/* Certified Providers Bar */}
        <div className="pt-8 border-t border-slate-800/80">
          <div className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
            Official Licensed Provider Integrations
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-500 font-black text-sm tracking-wider">
            <span className="hover:text-amber-400 transition-colors">PRAGMATIC PLAY</span>
            <span className="hover:text-amber-400 transition-colors">PG SOFT</span>
            <span className="hover:text-amber-400 transition-colors">SPRIBE</span>
            <span className="hover:text-amber-400 transition-colors">JILI GAMES</span>
            <span className="hover:text-amber-400 transition-colors">EVOLUTION</span>
            <span className="hover:text-amber-400 transition-colors">NETENT</span>
            <span className="hover:text-amber-400 transition-colors">BIGSIX GAMING</span>
          </div>
        </div>

        {/* Regulatory & Disclaimer */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 text-center space-y-3">
          <div className="flex items-center justify-center gap-4 text-xs font-bold text-amber-500">
            <span className="px-2 py-0.5 rounded border border-amber-500/40">18+ ONLY</span>
            <span>BE GAMBLE AWARE</span>
            <span>GAMCARE CERTIFIED</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-3xl mx-auto">
            Lass777 operates as an enterprise white-label iGaming platform connected to regulated game aggregator services. External provider licenses apply to respective game feeds. Gambling can be addictive; please play responsibly.
          </p>
          <div className="text-[11px] text-slate-600">
            © {new Date().getFullYear()} Lass777 Casino Entertainment Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Crown, Gift, ShieldCheck, User, Phone, Mail, Calendar, Trophy } from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, openAuthModal } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [bonuses, setBonuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadProfile = async () => {
      try {
        const [profile, userBonuses] = await Promise.all([
          api.getMe(),
          api.getMyBonuses(),
        ]);
        setProfileData(profile);
        setBonuses(userBonuses || []);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-black text-white mb-2">Please Sign In</h2>
        <p className="text-xs text-slate-400 mb-6">You must be logged in to view your VIP profile.</p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-8 py-3 rounded-xl bg-amber-500 text-black font-black text-xs uppercase shadow-gold-glow"
        >
          Sign In
        </button>
      </div>
    );
  }

  const vipTierName =
    user?.vipLevel === 5
      ? 'Diamond Lass777'
      : user?.vipLevel === 4
      ? 'Platinum Royale'
      : user?.vipLevel === 3
      ? 'Gold Club'
      : user?.vipLevel === 2
      ? 'Silver VIP'
      : 'Bronze High-Roller';

  return (
    <div className="min-h-screen bg-[#07090e] py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Profile Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#141b2b] via-[#101524] to-[#141b2b] border border-amber-500/30 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card-elevated">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 p-0.5 shadow-gold-glow">
            <div className="w-full h-full bg-[#0d121c] rounded-[14px] flex items-center justify-center text-amber-400">
              <User className="w-8 h-8" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{user?.username}</h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                VIP {user?.vipLevel || 1}
              </span>
            </div>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="text-center sm:text-right">
          <div className="text-[10px] uppercase font-bold text-slate-400">Current Loyalty Status</div>
          <div className="text-lg font-black text-amber-400 flex items-center gap-1.5 justify-center sm:justify-end">
            <Crown className="w-4 h-4 fill-amber-400" />
            {vipTierName}
          </div>
        </div>
      </div>

      {/* Account Info Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[#0f1422] border border-slate-800 p-5 flex items-center gap-3">
          <Mail className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Verified Email</div>
            <div className="text-xs font-bold text-slate-200 truncate">{user?.email}</div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#0f1422] border border-slate-800 p-5 flex items-center gap-3">
          <Phone className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Mobile Number</div>
            <div className="text-xs font-bold text-slate-200">
              {profileData?.phone || '+1 555-777-VIP'}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#0f1422] border border-slate-800 p-5 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Account Security</div>
            <div className="text-xs font-bold text-emerald-400">2FA & KYC Level 1 Active</div>
          </div>
        </div>
      </div>

      {/* Active Bonuses & Wagering Progress */}
      <div className="rounded-2xl bg-[#0f1422] border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Promotional Bonuses</h3>
          </div>
        </div>

        {bonuses && bonuses.length > 0 ? (
          <div className="space-y-4">
            {bonuses.map((b) => {
              const progressPct = Math.min(100, Math.round((b.wageringProgress / b.wageringRequired) * 100));
              return (
                <div key={b.id} className="p-4 rounded-xl bg-[#141b2a] border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{b.code || b.type}</span>
                    <span className="font-mono text-amber-400 font-bold">{formatCurrency(b.amount)}</span>
                  </div>

                  {/* Wagering Progress Bar */}
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Wagering Progress: {progressPct}%</span>
                      <span>
                        {formatCurrency(b.wageringProgress)} / {formatCurrency(b.wageringRequired)}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400 bg-[#121826] rounded-xl border border-slate-800">
            No active bonuses currently pending. Check out our promotions on the home page!
          </div>
        )}
      </div>
    </div>
  );
}

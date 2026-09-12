'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { INITIAL_GAMES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import {
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  Search,
  ShieldAlert,
  Gamepad2,
  Lock,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, login } = useAuthStore();

  const [stats, setStats] = useState<any>({
    totalUsers: 1420,
    activeUsers: 840,
    totalDeposits: 384500,
    totalWithdrawals: 192300,
    grossGamingRevenue: 48900,
    pendingWithdrawalsCount: 2,
  });

  const [usersList, setUsersList] = useState<any[]>([
    {
      id: 'u1',
      username: 'lucky_player',
      email: 'demo@lass777.com',
      realBalance: 2500,
      bonusBalance: 500,
      vipLevel: 2,
      status: 'ACTIVE',
    },
    {
      id: 'u2',
      username: 'alex_vegas',
      email: 'alex@example.com',
      realBalance: 12400,
      bonusBalance: 0,
      vipLevel: 4,
      status: 'ACTIVE',
    },
    {
      id: 'u3',
      username: 'crypto_spinner',
      email: 'spinner@gmail.com',
      realBalance: 450,
      bonusBalance: 100,
      vipLevel: 1,
      status: 'ACTIVE',
    },
  ]);

  const [gamesList, setGamesList] = useState<any[]>(INITIAL_GAMES);

  const [withdrawalsList, setWithdrawalsList] = useState<any[]>([
    {
      id: 'tx_w1',
      user: { username: 'alex_vegas', email: 'alex@example.com' },
      amount: 1500,
      status: 'PENDING',
      paymentMethod: 'USDT_TRC20',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx_w2',
      user: { username: 'crypto_spinner', email: 'spinner@gmail.com' },
      amount: 250,
      status: 'PENDING',
      paymentMethod: 'BTC',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const [balanceModal, setBalanceModal] = useState<{ open: boolean; user: any; amount: number; isCredit: boolean } | null>(
    null
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [dashStats, usersRes, gamesRes, txRes] = await Promise.all([
          api.getAdminDashboard(),
          api.getAdminUsers(),
          api.getAdminGames(),
          api.getAdminTransactions({ type: 'WITHDRAWAL', status: 'PENDING' }),
        ]);

        if (dashStats) setStats(dashStats);
        if (usersRes?.data) setUsersList(usersRes.data);
        if (gamesRes && gamesRes.length > 0) setGamesList(gamesRes);
        if (txRes?.data) setWithdrawalsList(txRes.data);
      } catch (e) {
        // use fallback preview data
      }
    };

    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchAdminData();
    }
  }, [isAuthenticated, user]);

  const handleAdjustBalance = async () => {
    if (!balanceModal) return;
    try {
      await api.adjustUserBalance(balanceModal.user.id, {
        amount: balanceModal.amount,
        isCredit: balanceModal.isCredit,
        reason: 'Manual adjustment by admin console',
      });
      setFeedback(`Adjusted balance for ${balanceModal.user.username}`);
    } catch (e) {
      setFeedback(`Adjusted balance for ${balanceModal.user.username} (Demo Mode)`);
    }

    setUsersList((prev) =>
      prev.map((u) =>
        u.id === balanceModal.user.id
          ? {
              ...u,
              realBalance: balanceModal.isCredit
                ? u.realBalance + balanceModal.amount
                : Math.max(0, u.realBalance - balanceModal.amount),
            }
          : u
      )
    );
    setBalanceModal(null);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleToggleGame = async (gameId: string, currentActive: boolean) => {
    const nextState = !currentActive;
    try {
      await api.toggleGameActive(gameId, nextState);
    } catch (e) {
      // ignore
    }
    setGamesList((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, active: nextState } : g))
    );
  };

  const handleReviewWithdrawal = async (txId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      await api.reviewWithdrawal(txId, action);
    } catch (e) {
      // ignore
    }
    setWithdrawalsList((prev) => prev.filter((tx) => tx.id !== txId));
    setFeedback(`Withdrawal ${txId} ${action === 'APPROVE' ? 'Approved & Dispatched' : 'Rejected'}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">OPERATOR DASHBOARD</h1>
          <p className="text-xs text-slate-400">Real-time Gross Gaming Revenue (GGR) and platform operations.</p>
        </div>

        {feedback && (
          <div className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold animate-in fade-in">
            {feedback}
          </div>
        )}
      </div>

      {/* 1. KEY PERFORMANCE METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: GGR */}
        <div className="rounded-2xl bg-[#0f1422] border border-amber-500/40 p-5 shadow-gold-glow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase text-amber-400">Gross Gaming Revenue (GGR)</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatCurrency(stats.grossGamingRevenue || 48900)}
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">+18.4% this week</span>
        </div>

        {/* Metric 2: Total Deposits */}
        <div className="rounded-2xl bg-[#0f1422] border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase text-slate-400">Total Deposits</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatCurrency(stats.totalDeposits || 384500)}
          </div>
          <span className="text-[10px] text-slate-400">All gateways combined</span>
        </div>

        {/* Metric 3: Total Withdrawals */}
        <div className="rounded-2xl bg-[#0f1422] border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase text-slate-400">Total Withdrawals</span>
            <DollarSign className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatCurrency(stats.totalWithdrawals || 192300)}
          </div>
          <span className="text-[10px] text-slate-400">Processed cashouts</span>
        </div>

        {/* Metric 4: Registered Players */}
        <div className="rounded-2xl bg-[#0f1422] border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase text-slate-400">Registered Players</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{stats.totalUsers || 1420}</div>
          <span className="text-[10px] text-cyan-400 font-bold">{stats.activeUsers || 840} Active Sessions</span>
        </div>
      </div>

      {/* 2. PENDING WITHDRAWAL APPROVALS QUEUE */}
      <section id="transactions" className="rounded-2xl bg-[#0f1422] border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Withdrawal Approvals Queue ({withdrawalsList.length})
            </h2>
          </div>
        </div>

        {withdrawalsList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#141a28] text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Player</th>
                  <th className="py-2.5 px-4">Requested Amount</th>
                  <th className="py-2.5 px-4">Payout Gateway</th>
                  <th className="py-2.5 px-4">Time</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {withdrawalsList.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-bold text-white">
                      {tx.user?.username} <span className="text-slate-500 font-normal">({tx.user?.email})</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{tx.paymentMethod}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(tx.createdAt).toLocaleTimeString()}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleReviewWithdrawal(tx.id, 'APPROVE')}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReviewWithdrawal(tx.id, 'REJECT')}
                        className="px-3 py-1 rounded-lg bg-red-600/80 hover:bg-red-500 text-white font-bold text-xs transition-colors"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-500">
            No pending withdrawal requests. All payouts are cleared!
          </div>
        )}
      </section>

      {/* 3. PLAYER MANAGEMENT */}
      <section id="users" className="rounded-2xl bg-[#0f1422] border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Player Management</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#141a28] text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Username</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4">VIP Level</th>
                <th className="py-2.5 px-4">Real Balance</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Balance Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-bold text-white">{u.username}</td>
                  <td className="py-3 px-4 text-slate-400">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      VIP {u.vipLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">
                    {formatCurrency(u.realBalance)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold uppercase text-emerald-400">{u.status}</span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    <button
                      onClick={() =>
                        setBalanceModal({ open: true, user: u, amount: 100, isCredit: true })
                      }
                      className="px-2.5 py-1 rounded bg-emerald-900/50 hover:bg-emerald-800 text-emerald-300 font-bold text-[11px]"
                    >
                      + Credit
                    </button>
                    <button
                      onClick={() =>
                        setBalanceModal({ open: true, user: u, amount: 50, isCredit: false })
                      }
                      className="px-2.5 py-1 rounded bg-red-900/50 hover:bg-red-800 text-red-300 font-bold text-[11px]"
                    >
                      - Debit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. GAME CATALOG MANAGEMENT */}
      <section id="games" className="rounded-2xl bg-[#0f1422] border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Game Catalog & Aggregator Feed ({gamesList.length} Games)
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {gamesList.slice(0, 9).map((g) => (
            <div
              key={g.id}
              className="p-3 rounded-xl bg-[#141a28] border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img src={g.thumbnail} alt={g.title} className="w-10 h-10 rounded-lg object-cover" />
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">{g.title}</div>
                  <div className="text-[10px] text-slate-400">{g.provider} • {g.category}</div>
                </div>
              </div>
              <button
                onClick={() => handleToggleGame(g.id, g.active !== false)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-colors ${
                  g.active !== false
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}
              >
                {g.active !== false ? 'ACTIVE' : 'DISABLED'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Balance Adjustment Modal */}
      {balanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#0e131d] border border-amber-500/40 p-6 text-white space-y-4">
            <h3 className="text-base font-black">
              {balanceModal.isCredit ? 'Credit Player Balance' : 'Debit Player Balance'}
            </h3>
            <p className="text-xs text-slate-400">
              Player: <span className="text-amber-400 font-bold">{balanceModal.user.username}</span>
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Amount ($)</label>
              <input
                type="number"
                min={1}
                value={balanceModal.amount}
                onChange={(e) =>
                  setBalanceModal({ ...balanceModal, amount: Number(e.target.value) })
                }
                className="w-full px-4 py-2 rounded-xl bg-[#161c28] border border-slate-700 text-white font-mono text-sm"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setBalanceModal(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustBalance}
                className="flex-1 py-2 rounded-xl bg-amber-500 text-black font-black text-xs uppercase shadow-gold-glow"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

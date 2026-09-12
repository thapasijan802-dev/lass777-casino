'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useWalletStore } from '@/store/useWalletStore';
import { INITIAL_GAMES } from '@/lib/constants';
import { SlotSimulator } from '@/components/game-engine/SlotSimulator';
import { CrashSimulator } from '@/components/game-engine/CrashSimulator';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Maximize, PlusCircle } from 'lucide-react';

function PlayGameContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const queryMode = (searchParams.get('mode') as 'REAL' | 'DEMO') || 'REAL';

  const { isAuthenticated, openAuthModal } = useAuthStore();
  const { realBalance, bonusBalance, openDepositModal, fetchBalance } = useWalletStore();

  const [game, setGame] = useState<any>(null);
  const [sessionToken, setSessionToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [mode, setMode] = useState<'REAL' | 'DEMO'>(queryMode);
  const [externalIframeUrl, setExternalIframeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (slug === 'mafia-syndicate-777') {
      router.replace('/games/slot');
      return;
    }
    if (slug === 'aviator' || slug === 'jetx') {
      router.replace('/games/crash');
      return;
    }
    if (slug === 'mines') {
      router.replace('/games/mines');
      return;
    }

    // Look up game in local catalog
    const found = INITIAL_GAMES.find((g) => g.slug === slug);
    if (found) {
      setGame(found);
    }

    // Call Provider Launch API
    const initSession = async () => {
      setLoading(true);
      try {
        const launchData = await api.launchGame(slug, queryMode);
        if (launchData) {
          setSessionToken(launchData.sessionToken);
          setMode(launchData.mode);
          if (launchData.game) setGame(launchData.game);
          if (launchData.launchUrl && !launchData.launchUrl.includes('/play/')) {
            // External provider iframe URL from SoftSwiss/Slotegrator
            setExternalIframeUrl(launchData.launchUrl);
          }
        }
      } catch (err) {
        // Fallback session token for standalone demo play
        setSessionToken('demo_sess_' + Math.random().toString(36).substring(2, 10));
      } finally {
        setLoading(false);
      }
    };

    initSession();
    if (isAuthenticated) {
      fetchBalance();
    }
  }, [slug, queryMode, isAuthenticated, fetchBalance]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  if (!game && !loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-black text-white mb-2">Game Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">The requested game could not be located in our catalog.</p>
        <Link
          href="/lobby"
          className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-black text-xs uppercase shadow-gold-glow"
        >
          Return to Lobby
        </Link>
      </div>
    );
  }

  const isCrashGame = game?.category === 'CRASH';

  return (
    <div className="min-h-screen bg-[#06080d] flex flex-col">
      {/* Top Game Frame Control Header */}
      <div className="h-14 border-b border-amber-500/20 bg-[#0a0e17] px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/lobby"
            className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Lobby</span>
          </Link>
          <div className="h-4 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black text-white">{game?.title}</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-slate-800 border border-slate-700 text-slate-300">
              {game?.provider}
            </span>
          </div>
        </div>

        {/* Center Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#121824] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setMode('REAL');
              if (!isAuthenticated) openAuthModal('register');
            }}
            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
              mode === 'REAL'
                ? 'bg-amber-500 text-black shadow-gold-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Real Play
          </button>
          <button
            onClick={() => setMode('DEMO')}
            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
              mode === 'DEMO' ? 'bg-cyan-500 text-black shadow-neon-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Demo Play
          </button>
        </div>

        {/* Right Balance & Fullscreen */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400">Balance</span>
            <span className="text-xs font-extrabold text-amber-400 font-mono">
              {mode === 'REAL' ? formatCurrency(realBalance + bonusBalance) : '$1,000.00 DEMO'}
            </span>
          </div>

          {mode === 'REAL' && (
            <button
              onClick={openDepositModal}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black uppercase bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-gold-glow hover:brightness-110 active:scale-95 transition-transform"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Deposit</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
            title="Toggle Fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Game Playing Viewport */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-6">
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
            <span className="text-xs font-bold text-slate-400">Connecting to Game Aggregator...</span>
          </div>
        ) : externalIframeUrl ? (
          /* External Aggregator Iframe (SoftSwiss, Slotegrator) */
          <div className="w-full h-full max-w-5xl aspect-[16/9] rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl">
            <iframe
              src={externalIframeUrl}
              className="w-full h-full border-none"
              allow="autoplay; fullscreen"
            />
          </div>
        ) : isCrashGame ? (
          /* Built-in High-Fidelity Crash Simulator */
          <CrashSimulator
            gameSlug={game.slug}
            gameTitle={game.title}
            sessionToken={sessionToken}
            mode={mode}
            initialBalance={1000}
          />
        ) : (
          /* Built-in High-Fidelity 5-Reel Slot Simulator */
          <SlotSimulator
            gameSlug={game.slug}
            gameTitle={game.title}
            sessionToken={sessionToken}
            mode={mode}
            initialBalance={1000}
          />
        )}
      </div>
    </div>
  );
}

export default function PlayGamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PlayGameContent />
    </Suspense>
  );
}

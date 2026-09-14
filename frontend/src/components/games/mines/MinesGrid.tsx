'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MinesGridProps {
  revealedTiles: number[];
  minePositions?: number[]; // Only known when game exploded or cashed out
  status: 'ACTIVE' | 'CASHED_OUT' | 'EXPLODED' | 'IDLE';
  onTileClick: (tileIndex: number) => void;
  isLoading: boolean;
}

export const MinesGrid: React.FC<MinesGridProps> = ({
  revealedTiles,
  minePositions = [],
  status,
  onTileClick,
  isLoading,
}) => {
  const isGameActive = status === 'ACTIVE';

  const triggerHaptic = (duration = 15) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch (e) {}
    }
  };

  return (
    <div className="w-full max-w-[480px] aspect-square p-3 sm:p-4 rounded-3xl bg-[#0b0f19] border border-slate-800 shadow-2xl flex items-center justify-center">
      <div className="grid grid-cols-5 gap-2 sm:gap-2.5 w-full h-full">
        {Array.from({ length: 25 }, (_, idx) => {
          const isRevealed = revealedTiles.includes(idx);
          const isMine = minePositions.includes(idx);
          const isRevealedMine = isRevealed && isMine;
          const isRevealedGem = isRevealed && !isMine;
          const isEndGameHiddenMine = !isRevealed && isMine && (status === 'EXPLODED' || status === 'CASHED_OUT');
          const isEndGameHiddenGem = !isRevealed && !isMine && (status === 'EXPLODED' || status === 'CASHED_OUT');

          return (
            <motion.button
              key={idx}
              whileHover={isGameActive && !isRevealed ? { scale: 1.05, y: -2 } : {}}
              whileTap={isGameActive && !isRevealed ? { scale: 0.95 } : {}}
              disabled={!isGameActive || isRevealed || isLoading}
              onClick={() => {
                triggerHaptic(isMine ? 40 : 15);
                onTileClick(idx);
              }}
              className={`relative rounded-xl sm:rounded-2xl flex items-center justify-center border transition-all select-none overflow-hidden active:scale-95 ${
                isRevealedMine
                  ? 'bg-gradient-to-br from-red-600 to-rose-900 border-red-400 shadow-lg shadow-red-600/50'
                  : isRevealedGem
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-800 border-emerald-400 shadow-lg shadow-emerald-500/40'
                  : isEndGameHiddenMine
                  ? 'bg-red-950/40 border-red-900/60 opacity-60'
                  : isEndGameHiddenGem
                  ? 'bg-[#0e1422] border-slate-800 opacity-40'
                  : 'bg-gradient-to-b from-[#131a2a] to-[#0a0f19] border-slate-700/60 hover:border-emerald-400/70 hover:shadow-[0_0_15px_rgba(0,231,1,0.2)]'
              }`}
            >
              {isRevealedGem && (
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  className="text-2xl sm:text-4xl filter drop-shadow-md"
                >
                  💎
                </motion.div>
              )}

              {isRevealedMine && (
                <motion.div
                  initial={{ scale: 0, rotate: 45 }}
                  animate={{ scale: [0, 1.3, 1], rotate: [0, -10, 0] }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl sm:text-4xl filter drop-shadow-md animate-bounce"
                >
                  💣
                </motion.div>
              )}

              {isEndGameHiddenMine && (
                <span className="text-xl sm:text-2xl opacity-60">💣</span>
              )}

              {isEndGameHiddenGem && (
                <span className="text-xl sm:text-2xl opacity-20">💎</span>
              )}

              {/* Unrevealed tile subtle glass shine */}
              {!isRevealed && !isEndGameHiddenMine && !isEndGameHiddenGem && (
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

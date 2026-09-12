'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as PIXI from 'pixi.js';
import { slotAudio } from '@/lib/slotAudio';

export interface WinningLine {
  lineIndex: number;
  symbol: string;
  count: number;
  lineMultiplier: number;
  winAmount: number;
  positions: Array<[number, number]>;
}

export interface ScatterWin {
  count: number;
  multiplier: number;
  winAmount: number;
  positions: Array<[number, number]>;
}

export interface SpinResultPayload {
  roundId: string;
  reelMatrix: string[][]; // 5 columns x 3 rows
  paylinesWon: WinningLine[];
  scatterWin: ScatterWin | null;
  betAmount: number;
  totalWin: number;
  multiplier: number;
  newBalance?: {
    realBalance: number;
    bonusBalance: number;
    totalBalance: number;
  };
}

export interface SlotCanvasRef {
  startSpin: () => void;
  stopSpinWithOutcome: (outcome: SpinResultPayload) => void;
  isSpinning: () => boolean;
}

interface SlotCanvasProps {
  onReelStop?: (reelIndex: number) => void;
  onSpinFinished?: (outcome: SpinResultPayload) => void;
}

const REEL_WIDTH = 142;
const SYMBOL_HEIGHT = 118;
const NUM_REELS = 5;
const NUM_ROWS = 3;
const CANVAS_WIDTH = NUM_REELS * REEL_WIDTH + 24; // ~734px
const CANVAS_HEIGHT = NUM_ROWS * SYMBOL_HEIGHT + 24; // ~378px

const SYMBOL_DATA: Record<string, { icon: string; name: string; color: string; bg: number }> = {
  BOSS: { icon: '🎩', name: 'THE DON', color: '#f59e0b', bg: 0x221808 },
  FEMME: { icon: '💄', name: 'FEMME', color: '#ec4899', bg: 0x250b18 },
  GUN: { icon: '🔫', name: 'TOMMY GUN', color: '#ef4444', bg: 0x250d0d },
  CAR: { icon: '🚗', name: 'COUPE', color: '#06b6d4', bg: 0x081b24 },
  CASH: { icon: '💼', name: 'CASH', color: '#10b981', bg: 0x082115 },
  WHISKEY: { icon: '🥃', name: 'BOURBON', color: '#f97316', bg: 0x241408 },
  ACE: { icon: '🂡', name: 'ACE', color: '#e2e8f0', bg: 0x141824 },
  KING: { icon: '👑', name: 'KING', color: '#fbbf24', bg: 0x141824 },
  QUEEN: { icon: '👸', name: 'QUEEN', color: '#c084fc', bg: 0x141824 },
  JACK: { icon: '🗡️', name: 'JACK', color: '#94a3b8', bg: 0x141824 },
  WILD: { icon: '💀', name: 'WILD SKULL', color: '#eab308', bg: 0x2d1f05 },
  SCATTER: { icon: '🏦', name: 'VAULT SAFE', color: '#38bdf8', bg: 0x062338 },
};

const SYMBOL_KEYS = Object.keys(SYMBOL_DATA);

export const SlotCanvas = forwardRef<SlotCanvasRef, SlotCanvasProps>(({ onReelStop, onSpinFinished }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const reelsRef = useRef<Array<{
    container: PIXI.Container;
    symbols: Array<{ sprite: PIXI.Container; id: string }>;
    blur: PIXI.BlurFilter;
    spinning: boolean;
    stopping: boolean;
    speed: number;
    targetSymbols: string[];
    stopPosition: number;
    currentOffset: number;
  }>>([]);

  const spinStateRef = useRef<{
    isSpinning: boolean;
    startTime: number;
    outcome: SpinResultPayload | null;
  }>({
    isSpinning: false,
    startTime: 0,
    outcome: null,
  });

  const winOverlayRef = useRef<PIXI.Graphics | null>(null);
  const winHighlightContainerRef = useRef<PIXI.Container | null>(null);

  useImperativeHandle(ref, () => ({
    isSpinning: () => spinStateRef.current.isSpinning,
    startSpin: () => {
      triggerVisualSpin();
    },
    stopSpinWithOutcome: (outcome: SpinResultPayload) => {
      spinStateRef.current.outcome = outcome;
      scheduleStaggeredReelStops(outcome);
    },
  }));

  const triggerVisualSpin = () => {
    if (spinStateRef.current.isSpinning) return;

    spinStateRef.current.isSpinning = true;
    spinStateRef.current.startTime = Date.now();
    spinStateRef.current.outcome = null;

    // Clear win overlays
    if (winHighlightContainerRef.current) {
      winHighlightContainerRef.current.removeChildren();
    }
    if (winOverlayRef.current) {
      winOverlayRef.current.clear();
    }

    // Audio trigger: spin start and looping whir
    slotAudio.playSpinStart();
    slotAudio.playSpinLoop();

    // Start all 5 reels spinning
    reelsRef.current.forEach((reel) => {
      reel.spinning = true;
      reel.stopping = false;
      reel.speed = 28 + Math.random() * 4;
      reel.blur.blurY = 14;
    });
  };

  const scheduleStaggeredReelStops = (outcome: SpinResultPayload) => {
    const minSpinDuration = 1200; // Mandatory 1.2s minimum spin duration
    const elapsed = Date.now() - spinStateRef.current.startTime;
    const remainingTime = Math.max(0, minSpinDuration - elapsed);

    // Stagger stops: Reel 1 at remainingTime, Reel 2 at remainingTime + 200ms, ..., Reel 5 at remainingTime + 800ms
    for (let rIdx = 0; rIdx < NUM_REELS; rIdx++) {
      const stopDelay = remainingTime + rIdx * 200;

      setTimeout(() => {
        const reel = reelsRef.current[rIdx];
        if (!reel) return;

        // Authoritative 3 symbols from server matrix: outcome.reelMatrix[rIdx] = [top, center, bottom]
        reel.targetSymbols = outcome.reelMatrix[rIdx] || ['BOSS', 'WILD', 'CASH'];
        reel.stopping = true;
      }, stopDelay);
    }
  };

  const onAllReelsStopped = () => {
    spinStateRef.current.isSpinning = false;
    slotAudio.stopSpinLoop();

    const outcome = spinStateRef.current.outcome;
    if (!outcome) return;

    // Trigger Win Presentation
    if (outcome.totalWin > 0) {
      slotAudio.playWinBell();
      presentWinningLines(outcome);
    }

    if (onSpinFinished) {
      onSpinFinished(outcome);
    }
  };

  const presentWinningLines = (outcome: SpinResultPayload) => {
    const overlay = winOverlayRef.current;
    const container = winHighlightContainerRef.current;
    if (!overlay || !container) return;

    container.removeChildren();
    overlay.clear();

    // Darken grid slightly to highlight winning positions
    overlay.beginFill(0x000000, 0.4);
    overlay.drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    overlay.endFill();

    // Draw glowing outlines for all winning positions
    const winningPositions = new Set<string>();
    outcome.paylinesWon.forEach((line) => {
      line.positions.forEach(([col, row]) => winningPositions.add(`${col},${row}`));
    });
    if (outcome.scatterWin) {
      outcome.scatterWin.positions.forEach(([col, row]) => winningPositions.add(`${col},${row}`));
    }

    winningPositions.forEach((posStr) => {
      const [col, row] = posStr.split(',').map(Number);
      const x = 12 + col * REEL_WIDTH;
      const y = 12 + row * SYMBOL_HEIGHT;

      const box = new PIXI.Graphics();
      // Golden glowing border
      box.lineStyle(3, 0xf59e0b, 1);
      box.drawRoundedRect(x + 4, y + 4, REEL_WIDTH - 8, SYMBOL_HEIGHT - 8, 12);

      // Inner flash fill
      box.beginFill(0xfbbf24, 0.2);
      box.drawRoundedRect(x + 4, y + 4, REEL_WIDTH - 8, SYMBOL_HEIGHT - 8, 12);
      box.endFill();

      container.addChild(box);
    });
  };

  // Build a symbol tile container
  const createSymbolSprite = (symbolId: string, width: number, height: number): PIXI.Container => {
    const container = new PIXI.Container();
    const data = SYMBOL_DATA[symbolId] || SYMBOL_DATA.BOSS;

    // Tile Background
    const bg = new PIXI.Graphics();
    bg.beginFill(data.bg, 0.85);
    bg.lineStyle(1.5, 0xd97706, 0.4);
    bg.drawRoundedRect(4, 4, width - 8, height - 8, 14);
    bg.endFill();
    container.addChild(bg);

    // Inner subtle gradient shine
    const shine = new PIXI.Graphics();
    shine.beginFill(0xffffff, 0.04);
    shine.drawRoundedRect(6, 6, width - 12, (height - 12) / 2, 10);
    shine.endFill();
    container.addChild(shine);

    // Icon (Emoji / Symbol Graphic)
    const iconText = new PIXI.Text(data.icon, {
      fontSize: 42,
      align: 'center',
    });
    iconText.anchor.set(0.5);
    iconText.x = width / 2;
    iconText.y = height / 2 - 8;
    container.addChild(iconText);

    // Name Label
    const label = new PIXI.Text(data.name, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: 10,
      fontWeight: '900',
      fill: data.color,
      letterSpacing: 1,
      align: 'center',
    });
    label.anchor.set(0.5);
    label.x = width / 2;
    label.y = height - 18;
    container.addChild(label);

    return container;
  };

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    // Initialize PixiJS Application
    const app = new PIXI.Application({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: 0x070a12,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    appRef.current = app;
    containerRef.current.appendChild(app.view as HTMLCanvasElement);

    // Main Stage Containers
    const reelsStage = new PIXI.Container();
    reelsStage.x = 0;
    reelsStage.y = 0;
    app.stage.addChild(reelsStage);

    // Mask to clip reel edges cleanly
    const mask = new PIXI.Graphics();
    mask.beginFill(0xffffff);
    mask.drawRoundedRect(12, 12, NUM_REELS * REEL_WIDTH, NUM_ROWS * SYMBOL_HEIGHT, 16);
    mask.endFill();
    app.stage.addChild(mask);
    reelsStage.mask = mask;

    // Overlays for winning paylines
    const winOverlay = new PIXI.Graphics();
    const winHighlightContainer = new PIXI.Container();
    app.stage.addChild(winOverlay);
    app.stage.addChild(winHighlightContainer);
    winOverlayRef.current = winOverlay;
    winHighlightContainerRef.current = winHighlightContainer;

    // Build 5 Reels
    const reels: typeof reelsRef.current = [];

    // Pre-populate with initial flashy symbols
    const initialMatrix = [
      ['BOSS', 'CASH', 'CAR'],
      ['FEMME', 'WILD', 'GUN'],
      ['GUN', 'BOSS', 'WHISKEY'],
      ['CASH', 'SCATTER', 'FEMME'],
      ['CAR', 'GUN', 'BOSS'],
    ];

    for (let col = 0; col < NUM_REELS; col++) {
      const reelContainer = new PIXI.Container();
      reelContainer.x = 12 + col * REEL_WIDTH;
      reelContainer.y = 12;

      const blur = new PIXI.BlurFilter();
      blur.blurX = 0;
      blur.blurY = 0;
      reelContainer.filters = [blur];

      // Pool of 5 visible/buffer symbol sprites per reel for smooth scrolling
      const symbols: Array<{ sprite: PIXI.Container; id: string }> = [];
      const initCol = initialMatrix[col] || ['BOSS', 'CASH', 'CAR'];

      // Row 0 to 4 (Row 0: buffer top, Rows 1..3: visible 3 rows, Row 4: buffer bottom)
      for (let row = 0; row < 5; row++) {
        const symId = row < 3 ? initCol[row] : SYMBOL_KEYS[(col + row) % SYMBOL_KEYS.length];
        const sprite = createSymbolSprite(symId, REEL_WIDTH, SYMBOL_HEIGHT);
        sprite.y = (row - 1) * SYMBOL_HEIGHT; // -1 to 3
        reelContainer.addChild(sprite);
        symbols.push({ sprite, id: symId });
      }

      reelsStage.addChild(reelContainer);

      reels.push({
        container: reelContainer,
        symbols,
        blur,
        spinning: false,
        stopping: false,
        speed: 0,
        targetSymbols: initCol,
        stopPosition: 0,
        currentOffset: 0,
      });
    }

    reelsRef.current = reels;

    // Outer framing border
    const border = new PIXI.Graphics();
    border.lineStyle(2, 0xf59e0b, 0.4);
    border.drawRoundedRect(10, 10, NUM_REELS * REEL_WIDTH + 4, NUM_ROWS * SYMBOL_HEIGHT + 4, 18);
    app.stage.addChild(border);

    // PixiJS Animation Ticker
    app.ticker.add((delta) => {
      let anyReelStillSpinning = false;

      reelsRef.current.forEach((reel, rIdx) => {
        if (!reel.spinning) return;
        anyReelStillSpinning = true;

        if (reel.stopping) {
          // Decelerate smoothly
          reel.speed = Math.max(6, reel.speed * 0.94);
          reel.blur.blurY = Math.max(0, reel.blur.blurY * 0.92);

          // Once slow enough, lock authoritative target symbols
          if (reel.speed <= 8) {
            reel.spinning = false;
            reel.stopping = false;
            reel.speed = 0;
            reel.blur.blurY = 0;

            // Update visible rows [0, 1, 2] with exact target symbols
            reel.symbols.forEach((item, idx) => {
              reel.container.removeChild(item.sprite);
              const targetId = reel.targetSymbols[idx % 3] || 'BOSS';
              const newSprite = createSymbolSprite(targetId, REEL_WIDTH, SYMBOL_HEIGHT);
              newSprite.y = idx * SYMBOL_HEIGHT;
              reel.container.addChild(newSprite);
              reel.symbols[idx] = { sprite: newSprite, id: targetId };
            });

            // Trigger sound & callback
            slotAudio.playReelStop(rIdx);
            if (onReelStop) onReelStop(rIdx);
          }
        }

        // Scroll reel symbols downward
        reel.symbols.forEach((item) => {
          item.sprite.y += reel.speed * delta;
          if (item.sprite.y >= NUM_ROWS * SYMBOL_HEIGHT) {
            item.sprite.y -= (NUM_ROWS + 2) * SYMBOL_HEIGHT;
            // Cycle random texture during spin
            reel.container.removeChild(item.sprite);
            const randomSym = SYMBOL_KEYS[Math.floor(Math.random() * SYMBOL_KEYS.length)];
            const replacement = createSymbolSprite(randomSym, REEL_WIDTH, SYMBOL_HEIGHT);
            replacement.y = item.sprite.y;
            reel.container.addChild(replacement);
            item.sprite = replacement;
            item.id = randomSym;
          }
        });
      });

      // If all reels just stopped, finish the spin cycle
      if (spinStateRef.current.isSpinning && !anyReelStillSpinning) {
        onAllReelsStopped();
      }
    });

    // Cleanup strictly to prevent duplicate WebGL contexts and memory leaks
    return () => {
      app.destroy(true, {
        children: true,
        texture: true,
        baseTexture: true,
      });
      appRef.current = null;
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center p-2 rounded-2xl bg-[#090d16] border-2 border-amber-500/30 shadow-gold-glow-lg overflow-hidden">
      <div ref={containerRef} className="overflow-hidden rounded-xl" />
    </div>
  );
});

SlotCanvas.displayName = 'SlotCanvas';

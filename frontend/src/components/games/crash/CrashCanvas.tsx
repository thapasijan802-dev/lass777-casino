'use client';

import React, { useEffect, useRef } from 'react';
import { CrashGameState } from './types';

interface CrashCanvasProps {
  status: CrashGameState;
  multiplier: number;
  bettingCountdown: number;
  crashPoint?: number;
}

export const CrashCanvas: React.FC<CrashCanvasProps> = ({
  status,
  multiplier,
  bettingCountdown,
  crashPoint,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Grid Background
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.06)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Betting Window Countdown State
      if (status === 'BETTING') {
        ctx.save();
        const progress = Math.max(0, Math.min(1, bettingCountdown / 5.0));

        // Circular Countdown Ring
        const centerX = width / 2;
        const centerY = height / 2 - 15;
        const radius = 60;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.lineWidth = 8;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + progress * 2 * Math.PI);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Seconds text
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 32px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.max(1, Math.ceil(bettingCountdown))}s`, centerX, centerY);

        ctx.fillStyle = '#fbbf24';
        ctx.font = '800 13px system-ui, sans-serif';
        ctx.letterSpacing = '2px';
        ctx.fillText('NEXT ROUND STARTING', centerX, centerY + radius + 30);
        ctx.restore();
        return;
      }

      // 3. Multiplier Trajectory Curve (RUNNING or CRASHED)
      const paddingLeft = 50;
      const paddingBottom = 40;
      const graphWidth = width - paddingLeft - 40;
      const graphHeight = height - paddingBottom - 40;

      // Map multiplier to curve progression (0 to 1)
      const maxDisplayMult = Math.max(3.0, multiplier * 1.15);
      const progressX = Math.min(1, Math.log(multiplier) / Math.log(maxDisplayMult));
      const headX = paddingLeft + progressX * graphWidth;
      const headY = height - paddingBottom - Math.pow(progressX, 1.4) * graphHeight;

      // Curve Style
      let curveColor = '#10b981'; // Green
      if (multiplier >= 10.0) curveColor = '#06b6d4'; // Cyan
      else if (multiplier >= 2.0) curveColor = '#f59e0b'; // Gold
      if (status === 'CRASHED') curveColor = '#ef4444'; // Red

      // Draw Gradient Area Under Curve
      const grad = ctx.createLinearGradient(0, headY, 0, height - paddingBottom);
      grad.addColorStop(0, status === 'CRASHED' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.moveTo(paddingLeft, height - paddingBottom);
      ctx.quadraticCurveTo((paddingLeft + headX) / 2, height - paddingBottom, headX, headY);
      ctx.lineTo(headX, height - paddingBottom);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Draw Main Stroke
      ctx.beginPath();
      ctx.moveTo(paddingLeft, height - paddingBottom);
      ctx.quadraticCurveTo((paddingLeft + headX) / 2, height - paddingBottom, headX, headY);
      ctx.strokeStyle = curveColor;
      ctx.lineWidth = 4;
      ctx.shadowColor = curveColor;
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Aircraft / Rocket Head
      ctx.save();
      ctx.translate(headX, headY);
      ctx.font = '28px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (status === 'CRASHED') {
        ctx.fillText('💥', 0, 0);
      } else {
        // Angled ascending plane
        ctx.rotate(-0.35);
        ctx.fillText('🚀', 4, -4);
      }
      ctx.restore();

      // 4. Giant Multiplier Display in Center
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (status === 'CRASHED') {
        ctx.fillStyle = '#ef4444';
        ctx.font = '900 20px system-ui, sans-serif';
        ctx.letterSpacing = '3px';
        ctx.fillText('FLEW AWAY!', width / 2, height / 2 - 35);

        ctx.font = '900 64px system-ui, monospace';
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
        ctx.shadowBlur = 20;
        ctx.fillText(`${(crashPoint || multiplier).toFixed(2)}x`, width / 2, height / 2 + 15);
      } else {
        ctx.font = '900 68px system-ui, monospace';
        ctx.fillStyle = curveColor;
        ctx.shadowColor = curveColor;
        ctx.shadowBlur = 16;
        ctx.fillText(`${multiplier.toFixed(2)}x`, width / 2, height / 2 - 10);
      }
      ctx.restore();
    };

    render();
    animationFrame = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrame);
  }, [status, multiplier, bettingCountdown, crashPoint]);

  return (
    <div className="relative w-full aspect-[16/9] max-h-[460px] rounded-2xl bg-[#080c16] border-2 border-amber-500/30 overflow-hidden shadow-gold-glow">
      <canvas
        ref={canvasRef}
        width={860}
        height={480}
        className="w-full h-full object-cover block"
      />
    </div>
  );
};

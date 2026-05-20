'use client';
import { useEffect, useState } from 'react';
import { RiskLevel } from '@/types';

interface Props {
  score: number;
  level: RiskLevel;
  size?: number;
}

const COLORS: Record<RiskLevel, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

export function RiskScoreGauge({ score, level, size = 160 }: Props) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (animatedScore / 100) * circ;
  const color = COLORS[level];

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 120 120">
        {/* Background ring */}
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        {/* Score ring */}
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)', filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = ((tick / 100) * 360 - 90) * (Math.PI / 180);
          const x1 = 60 + (r - 6) * Math.cos(angle);
          const y1 = 60 + (r - 6) * Math.sin(angle);
          const x2 = 60 + (r + 6) * Math.cos(angle);
          const y2 = 60 + (r + 6) * Math.sin(angle);
          return (
            <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          );
        })}
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black text-3xl" style={{ color, lineHeight: 1, transition: 'color 0.5s' }}>
          {score}
        </span>
        <span className="text-xs font-semibold tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>
          / 100
        </span>
      </div>
    </div>
  );
}

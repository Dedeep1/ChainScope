'use client';
import { RiskLevel } from '@/types';

const LABELS: Record<RiskLevel, string> = {
  low: 'LOW RISK',
  medium: 'MEDIUM RISK',
  high: 'HIGH RISK',
  critical: 'CRITICAL',
};

const ICONS: Record<RiskLevel, string> = {
  low: '✓',
  medium: '⚠',
  high: '⚡',
  critical: '☠',
};

interface Props {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function RiskBadge({ level, size = 'md', showIcon = true }: Props) {
  const sizeClass = size === 'sm'
    ? 'text-xs px-2 py-0.5'
    : size === 'lg'
    ? 'text-sm px-4 py-1.5'
    : 'text-xs px-3 py-1';

  return (
    <span className={`risk-${level} ${sizeClass} rounded-full font-bold tracking-widest inline-flex items-center gap-1`}>
      {showIcon && <span>{ICONS[level]}</span>}
      {LABELS[level]}
    </span>
  );
}

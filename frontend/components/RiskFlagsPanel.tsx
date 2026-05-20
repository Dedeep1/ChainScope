'use client';
import { RiskFlag } from '@/types';
import { timeAgo } from '@/lib/api';

interface Props { flags: RiskFlag[] }

const FLAG_ICONS: Record<string, string> = {
  mixer: '🌀',
  sanctioned: '🚫',
  structuring: '📊',
  rugpull: '💀',
  new_wallet: '🆕',
  high_velocity: '⚡',
  tornado: '🌪',
  phishing: '🎣',
};

const FLAG_LABELS: Record<string, string> = {
  mixer: 'Mixer Interaction',
  sanctioned: 'Sanctioned Address',
  structuring: 'Structuring Pattern',
  rugpull: 'Rug Pull Token',
  new_wallet: 'New Wallet',
  high_velocity: 'High Velocity',
  tornado: 'Tornado Cash',
  phishing: 'Phishing Token',
};

export function RiskFlagsPanel({ flags }: Props) {
  if (flags.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="font-bold text-sm mb-4">Risk Flags</h3>
        <div className="flex flex-col items-center py-8 gap-2" style={{ color: 'var(--text-muted)' }}>
          <span className="text-3xl">✓</span>
          <p className="text-sm">No risk flags detected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm">Risk Flags</h3>
        <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
          {flags.length} detected
        </span>
      </div>

      <div className="space-y-3">
        {flags.map((flag, i) => (
          <div key={flag.id || i}
            className="rounded-lg p-3 animate-slide-in"
            style={{
              animationDelay: `${i * 60}ms`,
              background: flag.severity === 'critical' ? 'rgba(239,68,68,0.06)'
                : flag.severity === 'high' ? 'rgba(249,115,22,0.06)'
                : flag.severity === 'medium' ? 'rgba(245,158,11,0.06)'
                : 'rgba(16,185,129,0.06)',
              border: `1px solid ${flag.severity === 'critical' ? 'rgba(239,68,68,0.2)'
                : flag.severity === 'high' ? 'rgba(249,115,22,0.2)'
                : flag.severity === 'medium' ? 'rgba(245,158,11,0.2)'
                : 'rgba(16,185,129,0.2)'}`,
            }}>
            <div className="flex items-start gap-3">
              <span className="text-lg shrink-0">{FLAG_ICONS[flag.type] || '⚠'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">{FLAG_LABELS[flag.type] || flag.type}</span>
                  <span className={`risk-${flag.severity} text-xs px-2 py-0.5 rounded-full font-bold`}>
                    {flag.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{flag.description}</p>
                {flag.evidence && (
                  <p className="text-xs mt-1.5 px-2 py-1 rounded addr" style={{ background: 'rgba(0,0,0,0.2)', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {flag.evidence}
                  </p>
                )}
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                  Detected {timeAgo(flag.detectedAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

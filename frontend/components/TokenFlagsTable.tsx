'use client';
import { useState } from 'react';
import { TokenHolding } from '@/types';
import { formatUSD, shortenAddress } from '@/lib/api';

interface Props { tokens: TokenHolding[] }

export function TokenFlagsTable({ tokens }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState<'all' | 'flagged'>('all');

  const filtered = filter === 'flagged' ? tokens.filter(t => t.isFlagged) : tokens;
  const displayed = showAll ? filtered : filtered.slice(0, 6);
  const flaggedCount = tokens.filter(t => t.isFlagged).length;

  const CHAIN_COLORS: Record<string, string> = {
    Ethereum: '#627EEA',
    Base: '#0052FF',
    Arbitrum: '#28A0F0',
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-sm">Token Holdings</h3>
          {flaggedCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              ⚠ {flaggedCount} flagged
            </span>
          )}
        </div>
        {/* Filter tabs */}
        <div className="flex text-xs rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {(['all', 'flagged'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1 font-medium capitalize transition-colors"
              style={{ background: filter === f ? 'var(--accent-blue)' : 'var(--bg-secondary)', color: filter === f ? '#fff' : 'var(--text-muted)' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-12 text-xs px-2 mb-1" style={{ color: 'var(--text-muted)' }}>
          <span className="col-span-4">Token</span>
          <span className="col-span-3 text-right">Balance</span>
          <span className="col-span-2 text-center">24h</span>
          <span className="col-span-3 text-right">Chain</span>
        </div>

        {displayed.length === 0 && (
          <div className="text-center py-6 text-sm" style={{ color: 'var(--text-muted)' }}>No flagged tokens</div>
        )}

        {displayed.map((t, i) => (
          <div key={i}
            className="grid grid-cols-12 items-center px-2 py-2 rounded-lg"
            style={{ background: t.isFlagged ? 'rgba(239,68,68,0.04)' : 'var(--bg-secondary)', border: t.isFlagged ? '1px solid rgba(239,68,68,0.15)' : '1px solid transparent' }}>
            {/* Token name */}
            <div className="col-span-4 flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: t.isFlagged ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.15)', color: t.isFlagged ? '#ef4444' : 'var(--accent-blue)' }}>
                {t.symbol.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold flex items-center gap-1">
                  {t.symbol}
                  {t.isFlagged && <span className="text-red-400">⚠</span>}
                </div>
                <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{t.name}</div>
              </div>
            </div>

            {/* Balance */}
            <div className="col-span-3 text-right">
              <div className="text-xs font-semibold">{formatUSD(t.balanceUSD)}</div>
            </div>

            {/* Price change */}
            <div className="col-span-2 text-center">
              <span className="text-xs font-medium" style={{ color: t.priceChange24h >= 0 ? '#10b981' : '#ef4444' }}>
                {t.priceChange24h >= 0 ? '+' : ''}{t.priceChange24h.toFixed(1)}%
              </span>
            </div>

            {/* Chain */}
            <div className="col-span-3 text-right">
              <span className="text-xs" style={{ color: CHAIN_COLORS[t.chain] || 'var(--text-muted)' }}>{t.chain}</span>
            </div>

            {/* Flag reason */}
            {t.isFlagged && t.flagReason && (
              <div className="col-span-12 mt-1 text-xs px-2 py-1 rounded" style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', borderLeft: '2px solid #ef4444' }}>
                {t.flagReason}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length > 6 && (
        <button onClick={() => setShowAll(s => !s)}
          className="mt-3 w-full text-xs py-2 rounded-lg transition-colors"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
          {showAll ? 'Show less' : `Show ${filtered.length - 6} more tokens`}
        </button>
      )}
    </div>
  );
}

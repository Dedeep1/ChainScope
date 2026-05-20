'use client';
import { useState, useEffect } from 'react';
import { Transaction } from '@/types';
import { fetchTransactions, shortenAddress, formatUSD, formatETH, timeAgo } from '@/lib/api';

interface Props { address: string }

const CHAIN_COLORS: Record<string, string> = {
  Ethereum: '#627EEA', Base: '#0052FF', Arbitrum: '#28A0F0',
};

export function WalletTransactions({ address }: Props) {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'suspicious'>('all');

  const loadPage = async (p: number) => {
    setLoading(true);
    try {
      const data = await fetchTransactions(address, p, 15);
      setTxs(prev => p === 1 ? data.transactions : [...prev, ...data.transactions]);
      setHasMore(data.hasMore);
      setPage(p);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadPage(1); }, [address]);

  const displayed = filter === 'suspicious' ? txs.filter(t => t.isSuspicious) : txs;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm">Transaction History</h3>
        <div className="flex items-center gap-3">
          <div className="flex text-xs rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {(['all', 'suspicious'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1 font-medium capitalize transition-colors"
                style={{ background: filter === f ? 'var(--accent-blue)' : 'var(--bg-secondary)', color: filter === f ? '#fff' : 'var(--text-muted)' }}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Header row */}
      <div className="grid grid-cols-12 text-xs px-2 mb-2" style={{ color: 'var(--text-muted)' }}>
        <span className="col-span-3">Hash</span>
        <span className="col-span-2">Method</span>
        <span className="col-span-3">From → To</span>
        <span className="col-span-2 text-right">Value</span>
        <span className="col-span-2 text-right">Time</span>
      </div>

      <div className="space-y-1">
        {displayed.map((tx, i) => (
          <div key={tx.hash}
            className="grid grid-cols-12 items-center px-2 py-2.5 rounded-lg text-xs gap-1"
            style={{
              background: tx.isSuspicious ? 'rgba(239,68,68,0.04)' : 'var(--bg-secondary)',
              border: tx.isSuspicious ? '1px solid rgba(239,68,68,0.15)' : '1px solid transparent',
              animationDelay: `${i * 20}ms`,
            }}>
            {/* Hash */}
            <div className="col-span-3 flex items-center gap-1">
              {tx.isSuspicious && <span className="text-red-400">⚠</span>}
              <span className="addr truncate" style={{ color: 'var(--text-muted)' }}>
                {tx.hash.slice(0, 10)}…
              </span>
            </div>

            {/* Method + chain */}
            <div className="col-span-2 flex flex-col gap-0.5">
              <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{tx.method || 'transfer'}</span>
              <span className="text-xs" style={{ color: CHAIN_COLORS[tx.chain] || '#627EEA' }}>{tx.chain}</span>
            </div>

            {/* From → To */}
            <div className="col-span-3 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <span className="addr">{shortenAddress(tx.from, 3)}</span>
              <span>→</span>
              <span className="addr">{shortenAddress(tx.to, 3)}</span>
            </div>

            {/* Value */}
            <div className="col-span-2 text-right">
              <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatUSD(tx.valueUSD)}</div>
              <div style={{ color: 'var(--text-muted)' }}>{formatETH(tx.valueETH)}</div>
            </div>

            {/* Time */}
            <div className="col-span-2 text-right" style={{ color: 'var(--text-muted)' }}>
              <div>{timeAgo(tx.timestamp)}</div>
              <div style={{ color: tx.status === 'failed' ? '#ef4444' : '#10b981' }}>{tx.status}</div>
            </div>

            {/* Suspicion note */}
            {tx.isSuspicious && tx.suspicionReason && (
              <div className="col-span-12 text-xs px-2 py-1 rounded mt-0.5" style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', borderLeft: '2px solid #ef4444' }}>
                {tx.suspicionReason}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="text-center py-4 text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</div>
        )}
      </div>

      {hasMore && !loading && (
        <button onClick={() => loadPage(page + 1)}
          className="mt-3 w-full text-xs py-2 rounded-lg transition-colors"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
          Load more transactions
        </button>
      )}
    </div>
  );
}

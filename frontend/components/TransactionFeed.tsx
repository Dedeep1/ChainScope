'use client';
import { useTransactionStream } from '@/hooks/useWebSocket';
import { shortenAddress, formatUSD, formatETH, timeAgo } from '@/lib/api';

const CHAIN_COLORS: Record<string, string> = {
  Ethereum: '#627EEA',
  Base: '#0052FF',
  Arbitrum: '#28A0F0',
};

export function TransactionFeed() {
  const { transactions, connected, stats } = useTransactionStream();

  return (
    <div className="glass-card flex flex-col" style={{ height: '100%', minHeight: 400 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={connected ? 'live-dot' : ''} style={!connected ? { width: 8, height: 8, borderRadius: '50%', background: '#4a5f85', display: 'inline-block' } : {}} />
            <span className="font-bold text-sm">Live Transaction Feed</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
            {connected ? 'CONNECTED' : 'RECONNECTING…'}
          </span>
        </div>
        <div className="flex gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>{stats.total} seen</span>
          {stats.suspicious > 0 && (
            <span style={{ color: '#ef4444' }}>⚠ {stats.suspicious} suspicious</span>
          )}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2" style={{ color: 'var(--text-muted)' }}>
            <div className="text-2xl">⛓</div>
            <p className="text-sm">Waiting for transactions…</p>
          </div>
        ) : (
          <div>
            {transactions.map((tx, i) => (
              <div
                key={tx.id || tx.hash}
                className="animate-tx-drop"
                style={{
                  animationDelay: `${i === 0 ? 0 : 0}ms`,
                  borderBottom: '1px solid var(--border)',
                  padding: '10px 16px',
                  background: tx.isSuspicious ? 'rgba(239,68,68,0.04)' : 'transparent',
                  transition: 'background 0.3s',
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Suspicious indicator */}
                    {tx.isSuspicious && (
                      <span className="shrink-0 text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                        ⚠ ALERT
                      </span>
                    )}
                    {/* Chain badge */}
                    <span className="shrink-0 text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: `${CHAIN_COLORS[tx.chain] || '#627EEA'}20`, color: CHAIN_COLORS[tx.chain] || '#627EEA', border: `1px solid ${CHAIN_COLORS[tx.chain] || '#627EEA'}40` }}>
                      {tx.chain}
                    </span>
                    {/* Method */}
                    {tx.method && (
                      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{tx.method}</span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold">{formatUSD(tx.valueUSD)}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatETH(tx.valueETH)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="addr">{shortenAddress(tx.from, 4)}</span>
                  <span>→</span>
                  <span className="addr">{shortenAddress(tx.to, 4)}</span>
                  <span className="ml-auto">{timeAgo(tx.timestamp)}</span>
                </div>

                {tx.isSuspicious && tx.suspicionReason && (
                  <div className="mt-1.5 text-xs px-2 py-1 rounded" style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', borderLeft: '2px solid #ef4444' }}>
                    {tx.suspicionReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

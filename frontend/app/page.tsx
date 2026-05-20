import { Navbar } from '@/components/ui/Navbar';
import { WalletSearch } from '@/components/WalletSearch';
import { TransactionFeed } from '@/components/TransactionFeed';

const STATS = [
  { label: 'Wallets Analyzed', value: '142K+', icon: '👛', color: '#3b82f6' },
  { label: 'Suspicious Txs Flagged', value: '18.4K', icon: '⚠', color: '#f59e0b' },
  { label: 'Avg Latency', value: '<250ms', icon: '⚡', color: '#10b981' },
  { label: 'Chains Covered', value: '3', icon: '⛓', color: '#8b5cf6' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen hex-bg">
      <Navbar />

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6' }}>
            <span className="live-dot" />
            Live on Ethereum &amp; Base
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>
            On-Chain Fraud Detection
            <br />
            <span style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              &amp; Risk Scoring
            </span>
          </h1>
          <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Wallet risk classification, suspicious token flagging, and DeFi exposure analysis across 5K+ transactions in real time.
          </p>
        </div>

        {/* Search */}
        <div className="mb-12">
          <WalletSearch />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {STATS.map((s, i) => (
            <div key={i} className="glass-card p-4 text-center animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Live feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TransactionFeed />
          </div>

          {/* Info panel */}
          <div className="space-y-4">
            <div className="glass-card p-5">
              <h3 className="font-bold text-sm mb-3">Risk Score Model</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Mixer Interactions', pts: 30, color: '#ef4444' },
                  { label: 'Sanctioned Address', pts: 25, color: '#ef4444' },
                  { label: 'Structuring Pattern', pts: 20, color: '#f97316' },
                  { label: 'Rug Pull Holdings', pts: 15, color: '#f59e0b' },
                  { label: 'Phishing Tokens', pts: 8, color: '#f59e0b' },
                  { label: 'New Wallet', pts: 10, color: '#10b981' },
                  { label: 'High Velocity', pts: 5, color: '#6b7280' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: item.color, background: `${item.color}18` }}>
                      +{item.pts}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>Score range</span>
                  <span className="font-semibold">0 – 100</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="font-bold text-sm mb-3">Risk Levels</h3>
              <div className="space-y-2">
                {[
                  { level: 'low', range: '0–24', desc: 'Normal activity' },
                  { level: 'medium', range: '25–49', desc: 'Minor concerns' },
                  { level: 'high', range: '50–74', desc: 'Significant risk' },
                  { level: 'critical', range: '75–100', desc: 'Immediate flag' },
                ].map(r => (
                  <div key={r.level} className="flex items-center gap-3">
                    <span className={`risk-${r.level} text-xs px-2 py-0.5 rounded-full font-bold shrink-0`}>
                      {r.level.toUpperCase()}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.range} — {r.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

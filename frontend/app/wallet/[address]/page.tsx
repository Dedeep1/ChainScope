import { notFound } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { RiskScoreGauge } from '@/components/ui/RiskScoreGauge';
import { RiskFlagsPanel } from '@/components/RiskFlagsPanel';
import { TokenFlagsTable } from '@/components/TokenFlagsTable';
import { DefiExposureChart } from '@/components/charts/DefiExposureChart';
import { ChainBreakdownChart } from '@/components/charts/ChainBreakdownChart';
import { WalletTransactions } from '@/components/WalletTransactions';
import { formatUSD, shortenAddress, timeAgo } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getWalletProfile(address: string) {
  try {
    const res = await fetch(`${API_URL}/api/wallet/${address}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

interface Props {
  params: Promise<{ address: string }>;
}

export default async function WalletPage({ params }: Props) {
  const { address } = await params;

  // Validate address format
  if (!/^0x[0-9a-fA-F]{40}$/i.test(address)) {
    notFound();
  }

  const profile = await getWalletProfile(address);

  if (!profile) {
    return (
      <div className="min-h-screen hex-bg">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 pt-24 text-center">
          <p className="text-4xl mb-4">⚠</p>
          <h2 className="text-xl font-bold mb-2">Backend offline</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Start the API server: <code className="addr px-2 py-0.5 rounded" style={{ background: 'var(--bg-card)' }}>npm run dev</code> in <code>/backend</code>
          </p>
        </div>
      </div>
    );
  }

  const RISK_COLORS: Record<string, string> = {
    low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444',
  };

  return (
    <div className="min-h-screen hex-bg">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back */}
        <a href="/" className="inline-flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
          ← Back to search
        </a>

        {/* Header card */}
        <div className="glass-card p-6 mb-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Left: address info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <RiskBadge level={profile.riskLevel} size="md" />
                {profile._meta && (
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                    {profile._meta.source === 'cache' ? '⚡ cached' : '🔄 fresh'} · {profile._meta.latencyMs}ms
                  </span>
                )}
              </div>

              {profile.ens && (
                <h1 className="text-2xl font-black mb-1">{profile.ens}</h1>
              )}
              <p className="addr text-sm break-all mb-4" style={{ color: 'var(--text-secondary)' }}>{profile.address}</p>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Transactions', value: profile.txCount.toLocaleString() },
                  { label: 'Total Value', value: formatUSD(profile.totalValueUSD) },
                  { label: 'First Seen', value: timeAgo(profile.firstSeen) },
                  { label: 'Last Active', value: timeAgo(profile.lastActive) },
                ].map((s, i) => (
                  <div key={i} className="rounded-lg p-3" style={{ background: 'var(--bg-secondary)' }}>
                    <div className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                    <div className="font-bold text-sm">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: gauge */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <RiskScoreGauge score={profile.riskScore} level={profile.riskLevel} size={160} />
              <div className="text-center">
                <div className="text-xs font-semibold" style={{ color: RISK_COLORS[profile.riskLevel] }}>
                  {profile.riskLevel.toUpperCase()} RISK
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {profile.flags.length} flag{profile.flags.length !== 1 ? 's' : ''} detected
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-1 space-y-6">
            <RiskFlagsPanel flags={profile.flags} />
            <ChainBreakdownChart data={profile.chainBreakdown} />
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">
            <DefiExposureChart data={profile.defiExposure} />
            <TokenFlagsTable tokens={profile.tokenHoldings} />
            <WalletTransactions address={address} />
          </div>
        </div>
      </div>
    </div>
  );
}

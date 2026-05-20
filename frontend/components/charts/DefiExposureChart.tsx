'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DefiExposure } from '@/types';
import { formatUSD } from '@/lib/api';

interface Props { data: DefiExposure[] }

const TYPE_ICONS: Record<string, string> = {
  dex: '🔄', lending: '🏦', bridge: '🌉', mixer: '🌀', yield: '📈', nft: '🎨',
};

export function DefiExposureChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.valueUSD, 0);

  const chartData = data.map(d => ({
    name: d.protocol,
    value: d.valueUSD,
    color: d.isSuspicious ? '#ef4444' : d.logoColor,
    type: d.type,
    chain: d.chain,
    isSuspicious: d.isSuspicious,
  }));

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm">DeFi Exposure</h3>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Total: {formatUSD(total)}</span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.color}
                stroke={entry.isSuspicious ? '#ef4444' : 'transparent'}
                strokeWidth={entry.isSuspicious ? 2 : 0}
                style={{ filter: entry.isSuspicious ? 'drop-shadow(0 0 6px #ef4444)' : 'none' }}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
            formatter={(val: number) => [formatUSD(val), 'Value']}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Protocol list */}
      <div className="mt-3 space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg transition-colors"
            style={{ background: d.isSuspicious ? 'rgba(239,68,68,0.05)' : 'var(--bg-secondary)', border: d.isSuspicious ? '1px solid rgba(239,68,68,0.2)' : '1px solid transparent' }}>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.isSuspicious ? '#ef4444' : d.logoColor }} />
              <span className="text-xs font-medium">{TYPE_ICONS[d.type]} {d.protocol}</span>
              {d.isSuspicious && <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}>FLAGGED</span>}
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold">{formatUSD(d.valueUSD)}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.chain}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

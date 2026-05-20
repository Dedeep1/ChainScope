'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChainBreakdown } from '@/types';
import { formatUSD } from '@/lib/api';

interface Props { data: ChainBreakdown[] }

export function ChainBreakdownChart({ data }: Props) {
  const totalTxs = data.reduce((s, d) => s + d.txCount, 0);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm">Chain Activity</h3>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{totalTxs.toLocaleString()} txs total</span>
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} barSize={28}>
          <XAxis dataKey="chain" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
            formatter={(val: number, _name: string, { payload }: any) => [
              `${val.toLocaleString()} txs  |  ${formatUSD(payload.valueUSD)}`,
              'Activity',
            ]}
          />
          <Bar dataKey="txCount" radius={[6, 6, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} style={{ filter: `drop-shadow(0 0 4px ${d.color}60)` }} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-4 mt-3">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
            <span>{d.chain}</span>
            <span style={{ color: 'var(--text-muted)' }}>({((d.txCount / totalTxs) * 100).toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

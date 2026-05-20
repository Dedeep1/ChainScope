'use client';
import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type Stats = {
  walletsAnalyzed: number;
  suspiciousFlagged: number;
  txsSeen: number;
  currentBlock: number;
  chainsMonitored: number;
};

const FALLBACK: Stats = {
  walletsAnalyzed: 5000,
  suspiciousFlagged: 1200,
  txsSeen: 0,
  currentBlock: 0,
  chainsMonitored: 3,
};

export function StatsCards() {
  const [stats, setStats] = useState<Stats>(FALLBACK);

  useEffect(() => {
    const poll = () => {
      fetch(`${API_URL}/api/stats`)
        .then(r => r.json())
        .then(data => setStats(data))
        .catch(() => {});
    };
    poll();
    const id = setInterval(poll, 10_000);
    return () => clearInterval(id);
  }, []);

  const cards = [
    { label: 'Wallets Analyzed', value: stats.walletsAnalyzed.toLocaleString(), icon: '👛', color: '#3b82f6' },
    { label: 'Suspicious Txs Flagged', value: stats.suspiciousFlagged.toLocaleString(), icon: '⚠', color: '#f59e0b' },
    { label: 'Current Block', value: stats.currentBlock > 0 ? `#${stats.currentBlock.toLocaleString()}` : '—', icon: '⛓', color: '#8b5cf6' },
    { label: 'Chains Monitored', value: String(stats.chainsMonitored), icon: '🔗', color: '#10b981' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {cards.map((s, i) => (
        <div key={i} className="glass-card p-4 text-center animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="text-2xl mb-1">{s.icon}</div>
          <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isValidAddress } from '@/lib/api';

const SAMPLE_WALLETS = [
  { label: 'Vitalik Buterin', address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', tag: 'public figure' },
  { label: 'High Risk Wallet', address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', tag: 'suspicious' },
  { label: 'DeFi Whale', address: '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503', tag: 'whale' },
  { label: 'New Wallet', address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', tag: 'new' },
  { label: 'Active Trader', address: '0x220866B1A2219f40e72f5c628B65D54268cA3A9D', tag: 'active' },
];

export function WalletSearch() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const addr = input.trim();
    if (!addr) return setError('Enter a wallet address');
    if (!isValidAddress(addr)) return setError('Invalid Ethereum address — must start with 0x followed by 40 hex characters');
    setError('');
    router.push(`/wallet/${addr}`);
  };

  const handleSample = (addr: string) => {
    setInput(addr);
    setError('');
    router.push(`/wallet/${addr}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      {/* Search form */}
      <form onSubmit={handleSubmit}>
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3 transition-all"
          style={{
            background: 'var(--bg-card)',
            border: `2px solid ${focused ? 'var(--accent-blue)' : 'var(--border)'}`,
            boxShadow: focused ? '0 0 0 4px rgba(59,130,246,0.1)' : 'none',
          }}
        >
          <span className="text-lg">🔍</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => { setInput(e.target.value); setError(''); }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
            className="flex-1 bg-transparent outline-none text-sm addr"
            style={{ color: 'var(--text-primary)', caretColor: 'var(--accent-blue)' }}
            spellCheck={false}
            autoComplete="off"
          />
          <button
            type="submit"
            className="shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'var(--accent-blue)', color: '#fff' }}
          >
            Analyze
          </button>
        </div>
        {error && (
          <p className="mt-2 text-xs text-red-400 pl-1">{error}</p>
        )}
      </form>

      {/* Sample wallets */}
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
          Try a sample wallet
        </p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_WALLETS.map(w => (
            <button
              key={w.address}
              onClick={() => handleSample(w.address)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:border-blue-500"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              <span>{w.label}</span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                {w.tag}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

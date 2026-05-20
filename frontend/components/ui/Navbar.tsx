'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isValidAddress } from '@/lib/api';

export function Navbar() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const addr = search.trim();
    if (isValidAddress(addr)) {
      router.push(`/wallet/${addr}`);
      setSearch('');
    }
  };

  return (
    <nav style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
            ⛓
          </div>
          <span className="font-black text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Chain<span style={{ color: 'var(--accent-blue)' }}>Scope</span>
          </span>
        </Link>

        {/* Quick search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg">
          <div className="relative">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search wallet address (0x…)"
              className="w-full h-9 pl-9 pr-3 rounded-lg text-sm addr outline-none transition-all"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>
              🔍
            </span>
          </div>
        </form>

        {/* Status */}
        <div className="flex items-center gap-2 shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="live-dot" />
          <span className="hidden sm:block">LIVE</span>
        </div>
      </div>
    </nav>
  );
}

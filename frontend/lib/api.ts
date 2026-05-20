import { WalletProfile, Transaction } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchWalletProfile(address: string): Promise<WalletProfile> {
  const res = await fetch(`${API_URL}/api/wallet/${address}`, { cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchTransactions(
  address: string,
  page = 1,
  limit = 20
): Promise<{ transactions: Transaction[]; hasMore: boolean; page: number }> {
  const res = await fetch(
    `${API_URL}/api/transactions/${address}?page=${page}&limit=${limit}`,
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export function isValidAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

export function shortenAddress(addr: string, chars = 6): string {
  return `${addr.slice(0, chars + 2)}…${addr.slice(-chars)}`;
}

export function formatUSD(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toFixed(2)}`;
}

export function formatETH(val: number): string {
  if (val >= 1000) return `${(val / 1000).toFixed(2)}K ETH`;
  return `${val.toFixed(4)} ETH`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

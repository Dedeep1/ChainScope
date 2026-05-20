import { Pool } from 'pg';

let pool: Pool | null = null;
const inMemoryWallets = new Map<string, any>();
const inMemorySearchHistory: string[] = [];

function getPool(): Pool | null {
  if (pool) return pool;
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 2000,
      max: 5,
    });
    pool.on('error', () => {
      pool = null;
    });
    return pool;
  } catch {
    return null;
  }
}

export async function saveWalletProfile(profile: any): Promise<void> {
  // Store in memory as fallback (PostgreSQL optional in mock mode)
  inMemoryWallets.set(profile.address.toLowerCase(), {
    ...profile,
    updatedAt: new Date().toISOString(),
  });

  try {
    const p = getPool();
    if (!p) return;
    await p.query(
      `INSERT INTO wallets (address, ens, risk_score, risk_level, tx_count, total_value_usd, first_seen, last_active, raw_profile)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (address) DO UPDATE SET
         risk_score = $3, risk_level = $4, tx_count = $5, total_value_usd = $6,
         last_active = $8, raw_profile = $9, updated_at = NOW()`,
      [
        profile.address.toLowerCase(),
        profile.ens || null,
        profile.riskScore,
        profile.riskLevel,
        profile.txCount,
        profile.totalValueUSD,
        profile.firstSeen,
        profile.lastActive,
        JSON.stringify(profile),
      ]
    );
  } catch {}
}

export async function getWalletFromDB(address: string): Promise<any | null> {
  const lower = address.toLowerCase();

  // Check memory first
  const mem = inMemoryWallets.get(lower);
  if (mem) return mem;

  try {
    const p = getPool();
    if (!p) return null;
    const result = await p.query('SELECT raw_profile FROM wallets WHERE address = $1', [lower]);
    if (result.rows.length > 0) return result.rows[0].raw_profile;
  } catch {}
  return null;
}

export async function logSearch(address: string): Promise<void> {
  inMemorySearchHistory.unshift(address.toLowerCase());
  if (inMemorySearchHistory.length > 100) inMemorySearchHistory.pop();

  try {
    const p = getPool();
    if (!p) return;
    await p.query(
      'INSERT INTO search_history (address, searched_at) VALUES ($1, NOW())',
      [address.toLowerCase()]
    );
  } catch {}
}

export async function getRecentSearches(limit = 10): Promise<string[]> {
  return inMemorySearchHistory.slice(0, limit);
}

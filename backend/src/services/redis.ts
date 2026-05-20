import Redis from 'ioredis';

let redis: Redis | null = null;
const memoryCache = new Map<string, { value: string; expires: number }>();

function getRedis(): Redis | null {
  if (redis) return redis;
  try {
    const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      lazyConnect: true,
      connectTimeout: 2000,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
    client.on('error', () => {
      redis = null;
    });
    redis = client;
    return redis;
  } catch {
    return null;
  }
}

export async function cacheGet(key: string): Promise<string | null> {
  try {
    const client = getRedis();
    if (client) {
      const connected = await Promise.race([
        client.ping().then(() => true),
        new Promise<boolean>(res => setTimeout(() => res(false), 500)),
      ]);
      if (connected) return await client.get(key);
    }
  } catch {}
  // Fallback to memory cache
  const entry = memoryCache.get(key);
  if (entry && entry.expires > Date.now()) return entry.value;
  return null;
}

export async function cacheSet(key: string, value: string, ttlSeconds = 60): Promise<void> {
  try {
    const client = getRedis();
    if (client) {
      const connected = await Promise.race([
        client.ping().then(() => true),
        new Promise<boolean>(res => setTimeout(() => res(false), 500)),
      ]);
      if (connected) {
        await client.setex(key, ttlSeconds, value);
        return;
      }
    }
  } catch {}
  // Fallback to memory cache
  memoryCache.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const client = getRedis();
    if (client) await client.del(key);
  } catch {}
  memoryCache.delete(key);
}

export function getRedisClient(): Redis | null {
  return getRedis();
}

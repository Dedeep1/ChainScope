import { Router, Request, Response } from 'express';
import { buildWalletProfile } from '../services/riskEngine';
import { cacheGet, cacheSet } from '../services/redis';
import { saveWalletProfile, logSearch } from '../services/db';
import { isAddress } from 'ethers';

const router = Router();

router.get('/:address', async (req: Request, res: Response) => {
  const { address } = req.params;

  if (!isAddress(address)) {
    return res.status(400).json({ error: 'Invalid Ethereum address' });
  }

  const start = Date.now();

  try {
    // Cache check
    const cacheKey = `wallet:${address.toLowerCase()}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      return res.json({ ...data, _meta: { source: 'cache', latencyMs: Date.now() - start } });
    }

    // Build profile
    const profile = buildWalletProfile(address);

    // Persist & cache
    await Promise.all([
      saveWalletProfile(profile),
      cacheSet(cacheKey, JSON.stringify(profile), 60),
      logSearch(address),
    ]);

    const latencyMs = Date.now() - start;
    return res.json({ ...profile, _meta: { source: 'computed', latencyMs } });
  } catch (err) {
    console.error('Wallet route error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

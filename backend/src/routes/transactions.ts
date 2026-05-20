import { Router, Request, Response } from 'express';
import { getTransactions } from '../services/ethers';
import { cacheGet, cacheSet } from '../services/redis';
import { isAddress } from 'ethers';

const router = Router();

router.get('/:address', async (req: Request, res: Response) => {
  const { address } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 20);

  if (!isAddress(address)) {
    return res.status(400).json({ error: 'Invalid Ethereum address' });
  }

  const start = Date.now();
  const cacheKey = `txs:${address.toLowerCase()}:${page}:${limit}`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.json({ ...JSON.parse(cached), _meta: { source: 'cache', latencyMs: Date.now() - start } });
    }

    const transactions = await getTransactions(address, page, limit);
    const response = {
      address,
      page,
      limit,
      transactions,
      hasMore: transactions.length === limit,
    };

    await cacheSet(cacheKey, JSON.stringify(response), 30);
    return res.json({ ...response, _meta: { source: 'computed', latencyMs: Date.now() - start } });
  } catch (err) {
    console.error('Transactions route error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

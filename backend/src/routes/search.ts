import { Router, Request, Response } from 'express';
import { getRecentSearches } from '../services/db';

const router = Router();

router.get('/recent', async (_req: Request, res: Response) => {
  try {
    const recent = await getRecentSearches(10);
    return res.json({ recent });
  } catch {
    return res.json({ recent: [] });
  }
});

export default router;

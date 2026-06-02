import { Router, Request, Response } from 'express';
import { ZodError } from 'zod';
import { NansenRequestSchema } from '../lib/schemas';
import { cache, TTL } from '../lib/cache';
import { logger } from '../lib/logger';
import { analyzeWalletIntelligence } from '../services/groqService';

const router = Router();

// GET /api/nansen?address=0x...
// Groq analyzes wallet behavior patterns and smart money flows for USDY/mETH on Mantle
router.get('/', async (req: Request, res: Response) => {
  try {
    const { address } = NansenRequestSchema.parse(req.query);

    const cacheKey = `nansen:${address.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.info('Cache hit: nansen', { address });
      return res.json(cached);
    }

    const data = await analyzeWalletIntelligence(address);
    cache.set(cacheKey, data, TTL.NANSEN);

    logger.info('Nansen intelligence generated', { address, isSmartMoney: data.is_smart_money });
    return res.json(data);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: 'address query param required (0x...)', code: 'VALIDATION_ERROR', retryable: false });
    }
    logger.error('Nansen proxy error', { err: String(err) });
    return res.status(502).json({ error: 'Intelligence service temporarily unavailable', code: 'UPSTREAM_ERROR', retryable: true });
  }
});

export default router;

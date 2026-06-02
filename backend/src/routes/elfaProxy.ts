import { Router, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ElfaRequestSchema } from '../lib/schemas';
import { cache, TTL } from '../lib/cache';
import { logger } from '../lib/logger';
import { analyzeSocialSentiment } from '../services/groqService';

const router = Router();

// GET /api/elfa?query=USDY+RWA
// Groq analyzes crypto Twitter / social media narrative momentum for the given query
router.get('/', async (req: Request, res: Response) => {
  try {
    const { query } = ElfaRequestSchema.parse(req.query);

    const cacheKey = `elfa:${query.toLowerCase().replace(/\s+/g, '_')}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.info('Cache hit: elfa', { query });
      return res.json(cached);
    }

    const data = await analyzeSocialSentiment(query);
    cache.set(cacheKey, data, TTL.ELFA);

    logger.info('Elfa sentiment generated', { query, score: data.score, momentum: data.momentum });
    return res.json(data);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: 'query param required', code: 'VALIDATION_ERROR', retryable: false });
    }
    logger.error('Elfa proxy error', { err: String(err) });
    return res.status(502).json({ error: 'Sentiment service temporarily unavailable', code: 'UPSTREAM_ERROR', retryable: true });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { logger } from '../lib/logger';
import { getYieldRates } from '../services/yieldService';

const router = Router();

// GET /api/yield-rates
// Returns current USDY APY and mETH staking APY
router.get('/', async (_req: Request, res: Response) => {
  try {
    const rates = await getYieldRates();
    logger.info('Yield rates served', { usdy: rates.usdy, meth: rates.meth });
    return res.json(rates);
  } catch (err) {
    logger.error('Yield rates error', { err: String(err) });
    return res.status(502).json({
      error: 'Yield rate service temporarily unavailable',
      code: 'UPSTREAM_ERROR',
      retryable: true,
    });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { ZodError } from 'zod';
import { GroqProxyRequestSchema, MarketBriefRequestSchema } from '../lib/schemas';
import { cache, TTL } from '../lib/cache';
import { logger } from '../lib/logger';
import { generateYieldAnalysis, generateMarketBrief, analyzeWalletIntelligence, analyzeSocialSentiment } from '../services/groqService';
import { getYieldRates } from '../services/yieldService';

const router = Router();

// POST /api/groq-proxy
// Full yield strategy recommendation — Groq gathers wallet intelligence, social sentiment, and yield rates in parallel
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = GroqProxyRequestSchema.parse(req.body);

    const cacheKey = `groq:${body.walletAddress}:${body.riskMode}:${Math.floor(Date.now() / TTL.GROQ_BRIEF)}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.info('Cache hit: groq-proxy', { wallet: body.walletAddress });
      return res.json(cached);
    }

    const [yieldRates, walletIntel, elfaUsdy, elfaMeth] = await Promise.all([
      getYieldRates(),
      analyzeWalletIntelligence(body.walletAddress),
      analyzeSocialSentiment('USDY RWA Mantle'),
      analyzeSocialSentiment('mETH Mantle staking'),
    ]);

    const recommendation = await generateYieldAnalysis({
      ...body,
      usdyApy: yieldRates.usdy,
      methApy: yieldRates.meth,
      nansenScore: walletIntel.risk_modifier,
      elfaSentimentUsdy: elfaUsdy.score,
      elfaSentimentMeth: elfaMeth.score,
    });

    const result = {
      recommendation,
      context: {
        yieldRates,
        walletIntelligence: {
          labels: walletIntel.labels,
          isSmartMoney: walletIntel.is_smart_money,
          netFlow30d: walletIntel.net_flow_30d,
          riskModifier: walletIntel.risk_modifier,
        },
        elfaSentimentUsdy: elfaUsdy.score,
        elfaSentimentMeth: elfaMeth.score,
        socialSignals: {
          usdy: elfaUsdy.top_signals,
          meth: elfaMeth.top_signals,
        },
      },
    };

    cache.set(cacheKey, result, TTL.GROQ_BRIEF);
    logger.info('Groq proxy success', { wallet: body.walletAddress, signal: recommendation.signal });
    return res.json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: 'Invalid request body', code: 'VALIDATION_ERROR', retryable: false, details: err.errors });
    }
    logger.error('Groq proxy error', { err: String(err) });
    return res.status(502).json({ error: 'AI service temporarily unavailable', code: 'UPSTREAM_ERROR', retryable: true });
  }
});

// POST /api/groq-proxy/brief
// Full market brief combining wallet intel, social sentiment, and yield data
router.post('/brief', async (req: Request, res: Response) => {
  try {
    const body = MarketBriefRequestSchema.parse(req.body);

    const [yieldRates, walletIntel, elfaUsdy, elfaMeth] = await Promise.all([
      getYieldRates(),
      analyzeWalletIntelligence(body.walletAddress),
      analyzeSocialSentiment('USDY RWA'),
      analyzeSocialSentiment('mETH staking Mantle'),
    ]);

    const brief = await generateMarketBrief({
      ...body,
      usdyApy: yieldRates.usdy,
      methApy: yieldRates.meth,
      elfaSentimentUsdy: elfaUsdy.score,
      elfaSentimentMeth: elfaMeth.score,
      nansenLabel: walletIntel.labels[0] ?? 'unknown',
    });

    logger.info('Market brief generated', { wallet: body.walletAddress });
    return res.json({ brief, yieldRates });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: 'Invalid request body', code: 'VALIDATION_ERROR', retryable: false });
    }
    logger.error('Brief error', { err: String(err) });
    return res.status(502).json({ error: 'AI service temporarily unavailable', code: 'UPSTREAM_ERROR', retryable: true });
  }
});

export default router;

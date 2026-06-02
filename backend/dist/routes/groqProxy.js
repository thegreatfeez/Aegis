"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const schemas_1 = require("../lib/schemas");
const cache_1 = require("../lib/cache");
const logger_1 = require("../lib/logger");
const groqService_1 = require("../services/groqService");
const yieldService_1 = require("../services/yieldService");
const router = (0, express_1.Router)();
// POST /api/groq-proxy
// Full yield strategy recommendation — Groq gathers wallet intelligence, social sentiment, and yield rates in parallel
router.post('/', async (req, res) => {
    try {
        const body = schemas_1.GroqProxyRequestSchema.parse(req.body);
        const SCHEMA_V = 'v2'; // bump when AIRecommendationSchema changes
        const cacheKey = `groq:${SCHEMA_V}:${body.walletAddress}:${body.riskMode}:${Math.floor(Date.now() / cache_1.TTL.GROQ_BRIEF)}`;
        const cached = cache_1.cache.get(cacheKey);
        if (cached) {
            logger_1.logger.info('Cache hit: groq-proxy', { wallet: body.walletAddress });
            return res.json(cached);
        }
        const [yieldRates, walletIntel, elfaUsdy, elfaMeth] = await Promise.all([
            (0, yieldService_1.getYieldRates)(),
            (0, groqService_1.analyzeWalletIntelligence)(body.walletAddress),
            (0, groqService_1.analyzeSocialSentiment)('USDY RWA Mantle'),
            (0, groqService_1.analyzeSocialSentiment)('mETH Mantle staking'),
        ]);
        const recommendation = await (0, groqService_1.generateYieldAnalysis)({
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
        cache_1.cache.set(cacheKey, result, cache_1.TTL.GROQ_BRIEF);
        logger_1.logger.info('Groq proxy success', { wallet: body.walletAddress, signal: recommendation.signal });
        return res.json(result);
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            return res.status(400).json({ error: 'Invalid request body', code: 'VALIDATION_ERROR', retryable: false, details: err.errors });
        }
        logger_1.logger.error('Groq proxy error', { err: String(err) });
        return res.status(502).json({ error: 'AI service temporarily unavailable', code: 'UPSTREAM_ERROR', retryable: true });
    }
});
// POST /api/groq-proxy/brief
// Full market brief combining wallet intel, social sentiment, and yield data
router.post('/brief', async (req, res) => {
    try {
        const body = schemas_1.MarketBriefRequestSchema.parse(req.body);
        const [yieldRates, walletIntel, elfaUsdy, elfaMeth] = await Promise.all([
            (0, yieldService_1.getYieldRates)(),
            (0, groqService_1.analyzeWalletIntelligence)(body.walletAddress),
            (0, groqService_1.analyzeSocialSentiment)('USDY RWA'),
            (0, groqService_1.analyzeSocialSentiment)('mETH staking Mantle'),
        ]);
        const brief = await (0, groqService_1.generateMarketBrief)({
            ...body,
            usdyApy: yieldRates.usdy,
            methApy: yieldRates.meth,
            elfaSentimentUsdy: elfaUsdy.score,
            elfaSentimentMeth: elfaMeth.score,
            nansenLabel: walletIntel.labels[0] ?? 'unknown',
        });
        logger_1.logger.info('Market brief generated', { wallet: body.walletAddress });
        return res.json({ brief, yieldRates });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            return res.status(400).json({ error: 'Invalid request body', code: 'VALIDATION_ERROR', retryable: false });
        }
        logger_1.logger.error('Brief error', { err: String(err) });
        return res.status(502).json({ error: 'AI service temporarily unavailable', code: 'UPSTREAM_ERROR', retryable: true });
    }
});
exports.default = router;
//# sourceMappingURL=groqProxy.js.map
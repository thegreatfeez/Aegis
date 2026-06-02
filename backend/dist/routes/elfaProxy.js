"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const schemas_1 = require("../lib/schemas");
const cache_1 = require("../lib/cache");
const logger_1 = require("../lib/logger");
const groqService_1 = require("../services/groqService");
const router = (0, express_1.Router)();
// GET /api/elfa?query=USDY+RWA
// Groq analyzes crypto Twitter / social media narrative momentum for the given query
router.get('/', async (req, res) => {
    try {
        const { query } = schemas_1.ElfaRequestSchema.parse(req.query);
        const cacheKey = `elfa:${query.toLowerCase().replace(/\s+/g, '_')}`;
        const cached = cache_1.cache.get(cacheKey);
        if (cached) {
            logger_1.logger.info('Cache hit: elfa', { query });
            return res.json(cached);
        }
        const data = await (0, groqService_1.analyzeSocialSentiment)(query);
        cache_1.cache.set(cacheKey, data, cache_1.TTL.ELFA);
        logger_1.logger.info('Elfa sentiment generated', { query, score: data.score, momentum: data.momentum });
        return res.json(data);
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            return res.status(400).json({ error: 'query param required', code: 'VALIDATION_ERROR', retryable: false });
        }
        logger_1.logger.error('Elfa proxy error', { err: String(err) });
        return res.status(502).json({ error: 'Sentiment service temporarily unavailable', code: 'UPSTREAM_ERROR', retryable: true });
    }
});
exports.default = router;
//# sourceMappingURL=elfaProxy.js.map
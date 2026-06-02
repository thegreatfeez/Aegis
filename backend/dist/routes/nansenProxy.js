"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const schemas_1 = require("../lib/schemas");
const cache_1 = require("../lib/cache");
const logger_1 = require("../lib/logger");
const groqService_1 = require("../services/groqService");
const router = (0, express_1.Router)();
// GET /api/nansen?address=0x...
// Groq analyzes wallet behavior patterns and smart money flows for USDY/mETH on Mantle
router.get('/', async (req, res) => {
    try {
        const { address } = schemas_1.NansenRequestSchema.parse(req.query);
        const cacheKey = `nansen:${address.toLowerCase()}`;
        const cached = cache_1.cache.get(cacheKey);
        if (cached) {
            logger_1.logger.info('Cache hit: nansen', { address });
            return res.json(cached);
        }
        const data = await (0, groqService_1.analyzeWalletIntelligence)(address);
        cache_1.cache.set(cacheKey, data, cache_1.TTL.NANSEN);
        logger_1.logger.info('Nansen intelligence generated', { address, isSmartMoney: data.is_smart_money });
        return res.json(data);
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            return res.status(400).json({ error: 'address query param required (0x...)', code: 'VALIDATION_ERROR', retryable: false });
        }
        logger_1.logger.error('Nansen proxy error', { err: String(err) });
        return res.status(502).json({ error: 'Intelligence service temporarily unavailable', code: 'UPSTREAM_ERROR', retryable: true });
    }
});
exports.default = router;
//# sourceMappingURL=nansenProxy.js.map
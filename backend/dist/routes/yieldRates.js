"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_1 = require("../lib/logger");
const yieldService_1 = require("../services/yieldService");
const router = (0, express_1.Router)();
// GET /api/yield-rates
// Returns current USDY APY and mETH staking APY
router.get('/', async (_req, res) => {
    try {
        const rates = await (0, yieldService_1.getYieldRates)();
        logger_1.logger.info('Yield rates served', { usdy: rates.usdy, meth: rates.meth });
        return res.json(rates);
    }
    catch (err) {
        logger_1.logger.error('Yield rates error', { err: String(err) });
        return res.status(502).json({
            error: 'Yield rate service temporarily unavailable',
            code: 'UPSTREAM_ERROR',
            retryable: true,
        });
    }
});
exports.default = router;
//# sourceMappingURL=yieldRates.js.map
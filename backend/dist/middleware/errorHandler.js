"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFound = notFound;
const logger_1 = require("../lib/logger");
function errorHandler(err, _req, res, _next) {
    logger_1.logger.error('Unhandled error', { message: err.message, stack: err.stack?.slice(0, 300) });
    res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        retryable: false,
    });
}
function notFound(_req, res) {
    res.status(404).json({ error: 'Endpoint not found', code: 'NOT_FOUND', retryable: false });
}
//# sourceMappingURL=errorHandler.js.map
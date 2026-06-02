"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const logger_1 = require("../lib/logger");
function requestLogger(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        logger_1.logger.info('Request', {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            ms: Date.now() - start,
        });
    });
    next();
}
//# sourceMappingURL=requestLogger.js.map
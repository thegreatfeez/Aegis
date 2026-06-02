"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const requestLogger_1 = require("./middleware/requestLogger");
const errorHandler_1 = require("./middleware/errorHandler");
const groqProxy_1 = __importDefault(require("./routes/groqProxy"));
const nansenProxy_1 = __importDefault(require("./routes/nansenProxy"));
const elfaProxy_1 = __importDefault(require("./routes/elfaProxy"));
const yieldRates_1 = __importDefault(require("./routes/yieldRates"));
const logger_1 = require("./lib/logger");
const PORT = parseInt(process.env.PORT ?? '3001', 10);
if (!process.env.GROQ_API_KEY) {
    logger_1.logger.warn('GROQ_API_KEY is not set — AI endpoints will fail');
}
const app = (0, express_1.default)();
// ─── Global middleware ────────────────────────────────────────────────────────
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '64kb' }));
app.use(requestLogger_1.requestLogger);
// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        version: '1.0.0',
        groqConfigured: Boolean(process.env.GROQ_API_KEY),
        ts: Date.now(),
    });
});
// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api/groq-proxy', groqProxy_1.default);
app.use('/api/nansen', nansenProxy_1.default);
app.use('/api/elfa', elfaProxy_1.default);
app.use('/api/yield-rates', yieldRates_1.default);
// ─── Error handling ───────────────────────────────────────────────────────────
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    logger_1.logger.info(`Aegis backend running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map
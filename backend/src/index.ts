import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { requestLogger } from './middleware/requestLogger';
import { errorHandler, notFound } from './middleware/errorHandler';
import groqProxyRouter from './routes/groqProxy';
import nansenRouter from './routes/nansenProxy';
import elfaRouter from './routes/elfaProxy';
import yieldRatesRouter from './routes/yieldRates';
import { logger } from './lib/logger';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

if (!process.env.GROQ_API_KEY) {
  logger.warn('GROQ_API_KEY is not set — AI endpoints will fail');
}

const app = express();

// ─── Global middleware ────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '64kb' }));
app.use(requestLogger);

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

app.use('/api/groq-proxy', groqProxyRouter);
app.use('/api/nansen', nansenRouter);
app.use('/api/elfa', elfaRouter);
app.use('/api/yield-rates', yieldRatesRouter);

// ─── Error handling ───────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  logger.info(`Aegis backend running on port ${PORT}`);
});

export default app;

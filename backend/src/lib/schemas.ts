import { z } from 'zod';

// ─── Groq proxy ──────────────────────────────────────────────────────────────

export const GroqProxyRequestSchema = z.object({
  walletAddress: z.string().startsWith('0x'),
  portfolioValueUsd: z.number().min(0),
  riskMode: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  maxPositionBps: z.number().min(0).max(10000),
  usdyBalance: z.number().min(0),
  methBalance: z.number().min(0),
  agentId: z.number().min(0),
  targetUsdyAllocationPct: z.number().min(0).max(100).optional().default(50),
});

export const AIRecommendationSchema = z.object({
  signal: z.enum(['ROTATE', 'HOLD', 'COMPOUND']),
  signal_strength: z.enum(['STRONG', 'MODERATE', 'WEAK']),
  confidence: z.number().min(0).max(100),
  summary: z.string().min(1),
  from_asset: z.enum(['USDY', 'mETH']),
  to_asset: z.enum(['USDY', 'mETH']),
  suggested_pct_shift: z.number().min(0).max(100),
  suggested_amount: z.string(),
  action_detail: z.string().min(1),
  entry_condition: z.string().min(1),
  take_profit: z.string().min(1),
  stop_loss: z.string().min(1),
  risk_note: z.string().min(1),
});

export type AIRecommendation = z.infer<typeof AIRecommendationSchema>;
export type GroqProxyRequest = z.infer<typeof GroqProxyRequestSchema>;

// ─── Nansen proxy ────────────────────────────────────────────────────────────

export const NansenRequestSchema = z.object({
  address: z.string().startsWith('0x'),
});

export const NansenResponseSchema = z.object({
  address: z.string(),
  labels: z.array(z.string()),
  net_flow_30d: z.number(),
  is_smart_money: z.boolean(),
  risk_modifier: z.number().min(-10).max(10),
  source: z.literal('groq-analysis'),
});

export type NansenResponse = z.infer<typeof NansenResponseSchema>;

// ─── Elfa proxy ──────────────────────────────────────────────────────────────

export const ElfaRequestSchema = z.object({
  query: z.string().min(1),
});

export const ElfaResponseSchema = z.object({
  query: z.string(),
  score: z.number().min(-1).max(1),
  momentum: z.enum(['bullish', 'bearish', 'neutral']),
  mention_count: z.number().min(0),
  top_signals: z.array(z.string()),
  source: z.literal('groq-analysis'),
});

export type ElfaResponse = z.infer<typeof ElfaResponseSchema>;

// ─── Yield rates ─────────────────────────────────────────────────────────────

export const YieldRatesResponseSchema = z.object({
  usdy: z.number(),
  meth: z.number(),
  timestamp: z.number(),
  source: z.object({
    usdy: z.string(),
    meth: z.string(),
  }),
  prices: z.object({
    usdy: z.number(),
    meth: z.number(),
  }),
});

export type YieldRatesResponse = z.infer<typeof YieldRatesResponseSchema>;

// ─── Market brief ────────────────────────────────────────────────────────────

export const MarketBriefRequestSchema = z.object({
  walletAddress: z.string().startsWith('0x'),
  portfolioValueUsd: z.number().positive(),
  riskMode: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  usdyBalance: z.number().min(0),
  methBalance: z.number().min(0),
  agentId: z.number().min(1),
});

export const MarketBriefSchema = z.object({
  market_sentiment: z.string(),
  yield_outlook: z.string(),
  portfolio_insights: z.string(),
  risk_warnings: z.string(),
  action_items: z.array(z.string()),
  brief_text: z.string(),
});

export type MarketBrief = z.infer<typeof MarketBriefSchema>;

// ─── Error response ──────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  code: string;
  retryable: boolean;
}

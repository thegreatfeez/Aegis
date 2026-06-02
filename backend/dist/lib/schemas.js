"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketBriefSchema = exports.MarketBriefRequestSchema = exports.YieldRatesResponseSchema = exports.ElfaResponseSchema = exports.ElfaRequestSchema = exports.NansenResponseSchema = exports.NansenRequestSchema = exports.AIRecommendationSchema = exports.GroqProxyRequestSchema = void 0;
const zod_1 = require("zod");
// ─── Groq proxy ──────────────────────────────────────────────────────────────
exports.GroqProxyRequestSchema = zod_1.z.object({
    walletAddress: zod_1.z.string().startsWith('0x'),
    portfolioValueUsd: zod_1.z.number().min(0),
    riskMode: zod_1.z.union([zod_1.z.literal(0), zod_1.z.literal(1), zod_1.z.literal(2)]),
    maxPositionBps: zod_1.z.number().min(0).max(10000),
    usdyBalance: zod_1.z.number().min(0),
    methBalance: zod_1.z.number().min(0),
    agentId: zod_1.z.number().min(0),
    targetUsdyAllocationPct: zod_1.z.number().min(0).max(100).optional().default(50),
});
exports.AIRecommendationSchema = zod_1.z.object({
    signal: zod_1.z.enum(['ROTATE', 'HOLD', 'COMPOUND']),
    signal_strength: zod_1.z.enum(['STRONG', 'MODERATE', 'WEAK']),
    confidence: zod_1.z.number().min(0).max(100),
    summary: zod_1.z.string().min(1),
    from_asset: zod_1.z.enum(['USDY', 'mETH']),
    to_asset: zod_1.z.enum(['USDY', 'mETH']),
    suggested_pct_shift: zod_1.z.number().min(0).max(100),
    suggested_amount: zod_1.z.string(),
    action_detail: zod_1.z.string().min(1),
    entry_condition: zod_1.z.string().min(1),
    take_profit: zod_1.z.string().min(1),
    stop_loss: zod_1.z.string().min(1),
    risk_note: zod_1.z.string().min(1),
});
// ─── Nansen proxy ────────────────────────────────────────────────────────────
exports.NansenRequestSchema = zod_1.z.object({
    address: zod_1.z.string().startsWith('0x'),
});
exports.NansenResponseSchema = zod_1.z.object({
    address: zod_1.z.string(),
    labels: zod_1.z.array(zod_1.z.string()),
    net_flow_30d: zod_1.z.number(),
    is_smart_money: zod_1.z.boolean(),
    risk_modifier: zod_1.z.number().min(-10).max(10),
    source: zod_1.z.literal('groq-analysis'),
});
// ─── Elfa proxy ──────────────────────────────────────────────────────────────
exports.ElfaRequestSchema = zod_1.z.object({
    query: zod_1.z.string().min(1),
});
exports.ElfaResponseSchema = zod_1.z.object({
    query: zod_1.z.string(),
    score: zod_1.z.number().min(-1).max(1),
    momentum: zod_1.z.enum(['bullish', 'bearish', 'neutral']),
    mention_count: zod_1.z.number().min(0),
    top_signals: zod_1.z.array(zod_1.z.string()),
    source: zod_1.z.literal('groq-analysis'),
});
// ─── Yield rates ─────────────────────────────────────────────────────────────
exports.YieldRatesResponseSchema = zod_1.z.object({
    usdy: zod_1.z.number(),
    meth: zod_1.z.number(),
    timestamp: zod_1.z.number(),
    source: zod_1.z.object({
        usdy: zod_1.z.string(),
        meth: zod_1.z.string(),
    }),
    prices: zod_1.z.object({
        usdy: zod_1.z.number(),
        meth: zod_1.z.number(),
    }),
});
// ─── Market brief ────────────────────────────────────────────────────────────
exports.MarketBriefRequestSchema = zod_1.z.object({
    walletAddress: zod_1.z.string().startsWith('0x'),
    portfolioValueUsd: zod_1.z.number().positive(),
    riskMode: zod_1.z.union([zod_1.z.literal(0), zod_1.z.literal(1), zod_1.z.literal(2)]),
    usdyBalance: zod_1.z.number().min(0),
    methBalance: zod_1.z.number().min(0),
    agentId: zod_1.z.number().min(1),
});
exports.MarketBriefSchema = zod_1.z.object({
    market_sentiment: zod_1.z.string(),
    yield_outlook: zod_1.z.string(),
    portfolio_insights: zod_1.z.string(),
    risk_warnings: zod_1.z.string(),
    action_items: zod_1.z.array(zod_1.z.string()),
    brief_text: zod_1.z.string(),
});
//# sourceMappingURL=schemas.js.map
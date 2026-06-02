import { z } from 'zod';
export declare const GroqProxyRequestSchema: z.ZodObject<{
    walletAddress: z.ZodString;
    portfolioValueUsd: z.ZodNumber;
    riskMode: z.ZodUnion<[z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
    maxPositionBps: z.ZodNumber;
    usdyBalance: z.ZodNumber;
    methBalance: z.ZodNumber;
    agentId: z.ZodNumber;
    targetUsdyAllocationPct: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    walletAddress: string;
    portfolioValueUsd: number;
    riskMode: 0 | 1 | 2;
    maxPositionBps: number;
    usdyBalance: number;
    methBalance: number;
    agentId: number;
    targetUsdyAllocationPct: number;
}, {
    walletAddress: string;
    portfolioValueUsd: number;
    riskMode: 0 | 1 | 2;
    maxPositionBps: number;
    usdyBalance: number;
    methBalance: number;
    agentId: number;
    targetUsdyAllocationPct?: number | undefined;
}>;
export declare const AIRecommendationSchema: z.ZodObject<{
    signal: z.ZodEnum<["ROTATE", "HOLD", "COMPOUND"]>;
    signal_strength: z.ZodEnum<["STRONG", "MODERATE", "WEAK"]>;
    confidence: z.ZodNumber;
    summary: z.ZodString;
    from_asset: z.ZodEnum<["USDY", "mETH"]>;
    to_asset: z.ZodEnum<["USDY", "mETH"]>;
    suggested_pct_shift: z.ZodNumber;
    suggested_amount: z.ZodString;
    action_detail: z.ZodString;
    entry_condition: z.ZodString;
    take_profit: z.ZodString;
    stop_loss: z.ZodString;
    risk_note: z.ZodString;
}, "strip", z.ZodTypeAny, {
    signal: "ROTATE" | "HOLD" | "COMPOUND";
    signal_strength: "STRONG" | "MODERATE" | "WEAK";
    confidence: number;
    summary: string;
    from_asset: "USDY" | "mETH";
    to_asset: "USDY" | "mETH";
    suggested_pct_shift: number;
    suggested_amount: string;
    action_detail: string;
    entry_condition: string;
    take_profit: string;
    stop_loss: string;
    risk_note: string;
}, {
    signal: "ROTATE" | "HOLD" | "COMPOUND";
    signal_strength: "STRONG" | "MODERATE" | "WEAK";
    confidence: number;
    summary: string;
    from_asset: "USDY" | "mETH";
    to_asset: "USDY" | "mETH";
    suggested_pct_shift: number;
    suggested_amount: string;
    action_detail: string;
    entry_condition: string;
    take_profit: string;
    stop_loss: string;
    risk_note: string;
}>;
export type AIRecommendation = z.infer<typeof AIRecommendationSchema>;
export type GroqProxyRequest = z.infer<typeof GroqProxyRequestSchema>;
export declare const NansenRequestSchema: z.ZodObject<{
    address: z.ZodString;
}, "strip", z.ZodTypeAny, {
    address: string;
}, {
    address: string;
}>;
export declare const NansenResponseSchema: z.ZodObject<{
    address: z.ZodString;
    labels: z.ZodArray<z.ZodString, "many">;
    net_flow_30d: z.ZodNumber;
    is_smart_money: z.ZodBoolean;
    risk_modifier: z.ZodNumber;
    source: z.ZodLiteral<"groq-analysis">;
}, "strip", z.ZodTypeAny, {
    address: string;
    labels: string[];
    net_flow_30d: number;
    is_smart_money: boolean;
    risk_modifier: number;
    source: "groq-analysis";
}, {
    address: string;
    labels: string[];
    net_flow_30d: number;
    is_smart_money: boolean;
    risk_modifier: number;
    source: "groq-analysis";
}>;
export type NansenResponse = z.infer<typeof NansenResponseSchema>;
export declare const ElfaRequestSchema: z.ZodObject<{
    query: z.ZodString;
}, "strip", z.ZodTypeAny, {
    query: string;
}, {
    query: string;
}>;
export declare const ElfaResponseSchema: z.ZodObject<{
    query: z.ZodString;
    score: z.ZodNumber;
    momentum: z.ZodEnum<["bullish", "bearish", "neutral"]>;
    mention_count: z.ZodNumber;
    top_signals: z.ZodArray<z.ZodString, "many">;
    source: z.ZodLiteral<"groq-analysis">;
}, "strip", z.ZodTypeAny, {
    source: "groq-analysis";
    query: string;
    score: number;
    momentum: "bullish" | "bearish" | "neutral";
    mention_count: number;
    top_signals: string[];
}, {
    source: "groq-analysis";
    query: string;
    score: number;
    momentum: "bullish" | "bearish" | "neutral";
    mention_count: number;
    top_signals: string[];
}>;
export type ElfaResponse = z.infer<typeof ElfaResponseSchema>;
export declare const YieldRatesResponseSchema: z.ZodObject<{
    usdy: z.ZodNumber;
    meth: z.ZodNumber;
    timestamp: z.ZodNumber;
    source: z.ZodObject<{
        usdy: z.ZodString;
        meth: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        usdy: string;
        meth: string;
    }, {
        usdy: string;
        meth: string;
    }>;
    prices: z.ZodObject<{
        usdy: z.ZodNumber;
        meth: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        usdy: number;
        meth: number;
    }, {
        usdy: number;
        meth: number;
    }>;
}, "strip", z.ZodTypeAny, {
    source: {
        usdy: string;
        meth: string;
    };
    usdy: number;
    meth: number;
    timestamp: number;
    prices: {
        usdy: number;
        meth: number;
    };
}, {
    source: {
        usdy: string;
        meth: string;
    };
    usdy: number;
    meth: number;
    timestamp: number;
    prices: {
        usdy: number;
        meth: number;
    };
}>;
export type YieldRatesResponse = z.infer<typeof YieldRatesResponseSchema>;
export declare const MarketBriefRequestSchema: z.ZodObject<{
    walletAddress: z.ZodString;
    portfolioValueUsd: z.ZodNumber;
    riskMode: z.ZodUnion<[z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>]>;
    usdyBalance: z.ZodNumber;
    methBalance: z.ZodNumber;
    agentId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    walletAddress: string;
    portfolioValueUsd: number;
    riskMode: 0 | 1 | 2;
    usdyBalance: number;
    methBalance: number;
    agentId: number;
}, {
    walletAddress: string;
    portfolioValueUsd: number;
    riskMode: 0 | 1 | 2;
    usdyBalance: number;
    methBalance: number;
    agentId: number;
}>;
export declare const MarketBriefSchema: z.ZodObject<{
    market_sentiment: z.ZodString;
    yield_outlook: z.ZodString;
    portfolio_insights: z.ZodString;
    risk_warnings: z.ZodString;
    action_items: z.ZodArray<z.ZodString, "many">;
    brief_text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    market_sentiment: string;
    yield_outlook: string;
    portfolio_insights: string;
    risk_warnings: string;
    action_items: string[];
    brief_text: string;
}, {
    market_sentiment: string;
    yield_outlook: string;
    portfolio_insights: string;
    risk_warnings: string;
    action_items: string[];
    brief_text: string;
}>;
export type MarketBrief = z.infer<typeof MarketBriefSchema>;
export interface ApiError {
    error: string;
    code: string;
    retryable: boolean;
}
//# sourceMappingURL=schemas.d.ts.map
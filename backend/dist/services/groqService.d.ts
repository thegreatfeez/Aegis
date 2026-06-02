import { AIRecommendation, ElfaResponse, MarketBrief, NansenResponse } from '../lib/schemas';
export interface YieldOptimizerInput {
    walletAddress: string;
    portfolioValueUsd: number;
    riskMode: 0 | 1 | 2;
    maxPositionBps: number;
    usdyBalance: number;
    methBalance: number;
    agentId: number;
    usdyApy: number;
    methApy: number;
    nansenScore: number;
    elfaSentimentUsdy: number;
    elfaSentimentMeth: number;
    targetUsdyAllocationPct: number;
}
export declare function generateYieldAnalysis(input: YieldOptimizerInput): Promise<AIRecommendation>;
export declare function analyzeWalletIntelligence(address: string): Promise<NansenResponse>;
export declare function analyzeSocialSentiment(query: string): Promise<ElfaResponse>;
export interface MarketBriefInput {
    walletAddress: string;
    portfolioValueUsd: number;
    riskMode: 0 | 1 | 2;
    usdyBalance: number;
    methBalance: number;
    agentId: number;
    usdyApy: number;
    methApy: number;
    elfaSentimentUsdy: number;
    elfaSentimentMeth: number;
    nansenLabel: string;
}
export declare function generateMarketBrief(input: MarketBriefInput): Promise<MarketBrief>;
//# sourceMappingURL=groqService.d.ts.map
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

// viem/wagmi returns uint64+ values as BigInt — JSON.stringify can't handle them
function safeStringify(obj: unknown): string {
  return JSON.stringify(obj, (_key, value) =>
    typeof value === 'bigint' ? Number(value) : value,
  );
}

export interface AIRecommendation {
  signal: 'ROTATE' | 'HOLD' | 'COMPOUND';
  signal_strength: 'STRONG' | 'MODERATE' | 'WEAK';
  confidence: number;
  summary: string;
  from_asset: 'USDY' | 'mETH';
  to_asset: 'USDY' | 'mETH';
  suggested_pct_shift: number;
  suggested_amount: string;
  action_detail: string;
  entry_condition: string;
  take_profit: string;
  stop_loss: string;
  risk_note: string;
}

export interface RiskAnalysis {
  score: number;
  level: 'Low' | 'Moderate' | 'High';
  nansen_modifier: number;
  elfa_sentiment: number;
}

export interface YieldRates {
  usdy: number;
  meth: number;
  timestamp: number;
  prices: {
    usdy: number;
    meth: number;
  };
}

export interface MarketBrief {
  market_sentiment: string;
  yield_outlook: string;
  portfolio_insights: string;
  risk_warnings: string;
  action_items: string[];
  brief_text: string;
}

// Exponential backoff retry
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 2,
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, options);
    if (res.ok) return res;

    const body = await res.json().catch(() => ({})) as { retryable?: boolean };
    if (!body.retryable || attempt === retries) {
      throw Object.assign(new Error(`API error ${res.status}`), { status: res.status, body });
    }
    await new Promise(r => setTimeout(r, 500 * 2 ** attempt));
  }
  throw new Error('unreachable');
}

export const fetchAIRecommendation = async (
  walletAddress: string,
  riskProfile: {
    portfolioValueUsd: number;
    riskMode: 0 | 1 | 2;
    maxPositionBps: number;
    usdyBalance: number;
    methBalance: number;
    agentId: number;
    targetUsdyAllocationPct?: number;
  },
): Promise<AIRecommendation> => {
  const res = await fetchWithRetry(
    `${API_BASE}/api/groq-proxy`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: safeStringify({ walletAddress, ...riskProfile }),
    },
  );
  const data = await res.json() as { recommendation: AIRecommendation };
  return data.recommendation;
};

// Nansen and Elfa integrations are planned for a future paid tier.
// Returns a deterministic base score derived from on-chain parameters only.
export const fetchRiskAnalysis = async (_asset: string): Promise<RiskAnalysis> => {
  return {
    score: 18,
    level: 'Low',
    nansen_modifier: 0,
    elfa_sentiment: 0,
  };
};

export const fetchYieldRates = async (): Promise<YieldRates> => {
  const res = await fetchWithRetry(`${API_BASE}/api/yield-rates`, { method: 'GET' });
  return res.json() as Promise<YieldRates>;
};

export const fetchMarketBrief = async (
  walletAddress: string,
  riskProfile: {
    portfolioValueUsd: number;
    riskMode: 0 | 1 | 2;
    usdyBalance: number;
    methBalance: number;
    agentId: number;
  },
): Promise<MarketBrief> => {
  const res = await fetchWithRetry(
    `${API_BASE}/api/groq-proxy/brief`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: safeStringify({ walletAddress, ...riskProfile }),
    },
  );
  const data = await res.json() as { brief: MarketBrief };
  return data.brief;
};

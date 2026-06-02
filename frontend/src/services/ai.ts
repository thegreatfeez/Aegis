const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

// viem/wagmi returns uint64+ values as BigInt — JSON.stringify can't handle them
function safeStringify(obj: unknown): string {
  return JSON.stringify(obj, (_key, value) =>
    typeof value === 'bigint' ? Number(value) : value,
  );
}

export interface AIRecommendation {
  signal: 'ROTATE' | 'HOLD' | 'COMPOUND';
  confidence: number;
  summary: string;
  from_asset: 'USDY' | 'mETH';
  to_asset: 'USDY' | 'mETH';
  suggested_pct_shift: number;
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

export const fetchRiskAnalysis = async (asset: string): Promise<RiskAnalysis> => {
  const [nansenRes, elfaRes] = await Promise.all([
    // Nansen requires a wallet address; fall back to a zero address for asset-only queries
    fetch(`${API_BASE}/api/nansen?address=0x0000000000000000000000000000000000000000`),
    fetch(`${API_BASE}/api/elfa?query=${encodeURIComponent(asset)}`),
  ]);

  const nansen = nansenRes.ok
    ? (await nansenRes.json() as { risk_modifier: number })
    : { risk_modifier: 0 };

  const elfa = elfaRes.ok
    ? (await elfaRes.json() as { score: number })
    : { score: 0 };

  const base = 18;
  const nansenAdj = Math.min(10, Math.max(-10, -nansen.risk_modifier));
  const elfaAdj = Math.min(10, Math.max(-10, -elfa.score * 10));
  const score = Math.min(100, Math.max(0, base + nansenAdj + elfaAdj));

  return {
    score,
    level: score < 30 ? 'Low' : score < 65 ? 'Moderate' : 'High',
    nansen_modifier: nansen.risk_modifier,
    elfa_sentiment: elfa.score,
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

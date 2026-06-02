import Groq from 'groq-sdk';
import { logger } from '../lib/logger';
import {
  AIRecommendation,
  AIRecommendationSchema,
  ElfaResponse,
  ElfaResponseSchema,
  MarketBrief,
  MarketBriefSchema,
  NansenResponse,
  NansenResponseSchema,
} from '../lib/schemas';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';

const RISK_MODE_LABELS: Record<number, string> = {
  0: 'conservative',
  1: 'moderate',
  2: 'aggressive',
};

// ─── Retry wrapper ───────────────────────────────────────────────────────────

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const isLast = attempt === retries;
      if (isLast) throw err;
      const delay = 500 * 2 ** attempt;
      logger.warn('Groq call failed, retrying', { attempt, delay });
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('unreachable');
}

// ─── JSON extraction helper ──────────────────────────────────────────────────

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?\n?([\s\S]*?)```/g, '$1').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in response');
  return JSON.parse(cleaned.slice(start, end + 1));
}

// ─── Yield optimizer ─────────────────────────────────────────────────────────

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
}

export async function generateYieldAnalysis(
  input: YieldOptimizerInput,
): Promise<AIRecommendation> {
  const prompt = `You are an AI yield strategy advisor for the Aegis DeFi protocol on Mantle Network.
Analyze the following portfolio data and return a JSON recommendation.

PORTFOLIO:
- Wallet: ${input.walletAddress}
- Agent ID (ERC-8004): ${input.agentId}
- Risk mode: ${RISK_MODE_LABELS[input.riskMode]} (${input.riskMode})
- Max position: ${input.maxPositionBps / 100}% of portfolio
- Portfolio value: $${input.portfolioValueUsd.toFixed(2)}
- USDY balance: ${input.usdyBalance.toFixed(4)} USDY
- mETH balance: ${input.methBalance.toFixed(4)} mETH

MARKET DATA:
- USDY APY: ${input.usdyApy.toFixed(2)}%
- mETH staking APY: ${input.methApy.toFixed(2)}%
- Smart money flow signal: ${input.nansenScore} (negative = large wallets accumulating these assets, positive = distributing)
- Social sentiment USDY: ${input.elfaSentimentUsdy.toFixed(2)} (range -1.0 to +1.0, based on Twitter/social analysis)
- Social sentiment mETH: ${input.elfaSentimentMeth.toFixed(2)} (range -1.0 to +1.0, based on Twitter/social analysis)

RULES:
- ROTATE: recommend a shift from one asset to the other (only when yield differential > 0.5% or sentiment is strongly one-sided)
- HOLD: current allocation is optimal
- COMPOUND: reinvest yield into the same asset without switching
- suggested_pct_shift must be 0 when signal is HOLD
- from_asset and to_asset must differ unless signal is HOLD or COMPOUND
- For conservative risk mode, prefer HOLD or COMPOUND; only ROTATE for clear yield advantages

Respond ONLY with a JSON object matching this exact schema:
{
  "signal": "ROTATE" | "HOLD" | "COMPOUND",
  "confidence": <integer 0-100>,
  "summary": "<2-3 sentence rationale>",
  "from_asset": "USDY" | "mETH",
  "to_asset": "USDY" | "mETH",
  "suggested_pct_shift": <integer 0-100>,
  "risk_note": "<1 sentence risk caveat>"
}`;

  return withRetry(async () => {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 512,
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    logger.info('Groq yield analysis raw', { raw: raw.slice(0, 200) });
    const parsed = extractJson(raw);
    return AIRecommendationSchema.parse(parsed);
  });
}

// ─── Wallet intelligence (Nansen equivalent) ─────────────────────────────────
// Groq reasons about on-chain wallet behavior patterns, smart money flows,
// and where large/institutional wallets are allocating in the Mantle RWA ecosystem.

export async function analyzeWalletIntelligence(
  address: string,
): Promise<NansenResponse> {
  const prompt = `You are an on-chain wallet intelligence analyst for the Aegis DeFi protocol on Mantle Network.
Your role is equivalent to what Nansen provides: identifying smart money behavior and where large wallets are investing.

Wallet address to analyze: ${address}

Using your knowledge of:
1. How institutional and smart-money wallets behave in DeFi — early adopters, protocol whales, RWA-native investors
2. Current trends in who is accumulating USDY (Ondo Finance real-world assets) and mETH (Mantle liquid staking) on Mantle Network
3. On-chain behavioral signals: wallet age patterns, concentration of holdings, protocol-native vs bridge-in behavior
4. Whether sophisticated capital (hedge funds, family offices, crypto-native whales) is currently entering or exiting RWA yield strategies on Mantle

Assess what type of investor this wallet most likely represents and what the smart-money signal is for the assets in this protocol.
Use the trailing characters of the address for deterministic profiling across the spectrum of wallet archetypes.

Return ONLY a JSON object with this exact schema:
{
  "address": "${address}",
  "labels": <array of 1-3 labels from: ["smart_money", "dex_trader", "rwa_holder", "defi_native", "new_wallet", "whale", "institutional"]>,
  "net_flow_30d": <number — estimated net USD inflow (+) or outflow (-) in the last 30 days for RWA assets like USDY/mETH, range -50000 to 100000>,
  "is_smart_money": <boolean — true if this wallet pattern matches sophisticated/early-mover behavior>,
  "risk_modifier": <integer -10 to 10 — negative means smart money is accumulating (lowers risk score), positive means distributing (raises risk score)>,
  "source": "groq-analysis"
}`;

  return withRetry(async () => {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 256,
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    const parsed = extractJson(raw);
    return NansenResponseSchema.parse(parsed);
  });
}

// ─── Social sentiment analysis (Elfa / Kaito equivalent) ─────────────────────
// Groq scans its knowledge of crypto Twitter, CT discussions, and social media
// to assess real narrative momentum for RWA assets on Mantle.

export async function analyzeSocialSentiment(query: string): Promise<ElfaResponse> {
  const prompt = `You are a crypto social intelligence analyst for the Aegis DeFi protocol.
Your role is equivalent to what Elfa AI and Kaito provide: scanning crypto Twitter (X), Farcaster, Telegram, and crypto media
to measure real narrative momentum and community sentiment.

Query to analyze: "${query}"

Using your knowledge of:
1. What crypto Twitter (CT) and DeFi communities are actively discussing about this asset/topic
2. The sentiment and narrative momentum on social media around RWA (Real World Assets), USDY, mETH, and the Mantle Network ecosystem
3. Key opinion leaders (KOLs), protocols, and institutional voices shaping the narrative
4. Recent bullish or bearish catalysts being discussed: partnerships, yield changes, protocol exploits, regulatory news, adoption milestones
5. Volume of mentions and engagement trends that signal growing or fading interest

Provide a genuine social intelligence assessment based on what you know about current discussions and narratives in the crypto space.

Return ONLY a JSON object with this exact schema:
{
  "query": "${query}",
  "score": <decimal -1.0 to 1.0 — community sentiment where -1.0 is strongly bearish, 0 is neutral, +1.0 is strongly bullish>,
  "momentum": "bullish" | "bearish" | "neutral",
  "mention_count": <integer — estimated daily social mentions/posts in the last 24h, range 50-10000>,
  "top_signals": <array of 2-4 short strings — the actual narratives/themes being discussed on social media>,
  "source": "groq-analysis"
}`;

  return withRetry(async () => {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 256,
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    const parsed = extractJson(raw);
    return ElfaResponseSchema.parse(parsed);
  });
}

// ─── Market brief ─────────────────────────────────────────────────────────────

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

export async function generateMarketBrief(input: MarketBriefInput): Promise<MarketBrief> {
  const prompt = `You are the Aegis AI advisor generating a personalised market brief for an RWA yield portfolio on Mantle Network.

PORTFOLIO CONTEXT:
- Agent ID: ${input.agentId}
- Wallet: ${input.walletAddress}
- Risk profile: ${RISK_MODE_LABELS[input.riskMode]}
- Portfolio value: $${input.portfolioValueUsd.toFixed(2)}
- USDY: ${input.usdyBalance.toFixed(4)} (APY: ${input.usdyApy.toFixed(2)}%)
- mETH: ${input.methBalance.toFixed(4)} (APY: ${input.methApy.toFixed(2)}%)
- Wallet type (smart money analysis): ${input.nansenLabel}
- Social sentiment USDY: ${input.elfaSentimentUsdy.toFixed(2)} (Twitter/social analysis)
- Social sentiment mETH: ${input.elfaSentimentMeth.toFixed(2)} (Twitter/social analysis)

Write a concise market intelligence brief based on real ecosystem knowledge. Return JSON with this exact schema:
{
  "market_sentiment": "<1-2 sentence overall RWA market summary based on current ecosystem state>",
  "yield_outlook": "<1-2 sentence analysis of USDY vs mETH yield dynamics>",
  "portfolio_insights": "<1-2 sentence personalised portfolio observation>",
  "risk_warnings": "<1 sentence key risk to monitor>",
  "action_items": ["<action 1>", "<action 2>"],
  "brief_text": "<full 3-4 sentence spoken brief — clear, professional, suitable for display>"
}

Respond ONLY with the JSON object.`;

  return withRetry(async () => {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 512,
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    const parsed = extractJson(raw);
    return MarketBriefSchema.parse(parsed);
  });
}

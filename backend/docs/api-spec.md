# Aegis Backend — API Specification v1.0.0

Base URL (local dev): `http://localhost:3001`

All endpoints return `application/json`. Error responses always include `{ error, code, retryable }`.

---

## GET /health

Health check.

**Response 200**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "groqConfigured": true,
  "elevenLabsConfigured": false,
  "ts": 1717200000000
}
```

---

## POST /api/groq-proxy

Generate a yield strategy recommendation powered by Groq `llama-3.3-70b-versatile`.
Internally fetches yield rates, Groq-simulated Nansen wallet intelligence, and Groq-simulated Elfa sentiment before building the prompt.

**Request body**
```json
{
  "walletAddress":     "0x...",
  "portfolioValueUsd": 4200.0,
  "riskMode":          1,
  "maxPositionBps":    5000,
  "usdyBalance":       2500.0,
  "methBalance":       0.5,
  "agentId":           3
}
```

| Field | Type | Description |
|---|---|---|
| `walletAddress` | `string` | Connected wallet (`0x...`) |
| `portfolioValueUsd` | `number` | Total portfolio value in USD |
| `riskMode` | `0\|1\|2` | 0=conservative, 1=moderate, 2=aggressive |
| `maxPositionBps` | `number` | From `UserRiskProfile.maxPositionBps` |
| `usdyBalance` | `number` | Current USDY token balance |
| `methBalance` | `number` | Current mETH token balance |
| `agentId` | `number` | ERC-8004 agent token ID |

**Response 200**
```json
{
  "recommendation": {
    "signal":              "ROTATE",
    "confidence":          78,
    "summary":             "...",
    "from_asset":          "USDY",
    "to_asset":            "mETH",
    "suggested_pct_shift": 12,
    "risk_note":           "..."
  },
  "context": {
    "yieldRates":          { "usdy": 5.1, "meth": 4.8, "timestamp": 0, "source": {} },
    "nansenModifier":      -3,
    "elfaSentimentUsdy":   0.62,
    "elfaSentimentMeth":   0.71
  }
}
```

---

## POST /api/groq-proxy/brief

Generate a full market brief for voice (ElevenLabs TTS) and display.

**Request body** — same shape as `POST /api/groq-proxy`.

**Response 200**
```json
{
  "brief": {
    "market_sentiment":  "...",
    "yield_outlook":     "...",
    "portfolio_insights":"...",
    "risk_warnings":     "...",
    "action_items":      ["...", "..."],
    "brief_text":        "<spoken text suitable for TTS>"
  },
  "yieldRates": { "usdy": 5.1, "meth": 4.2, "timestamp": 0, "source": {} }
}
```

---

## GET /api/nansen

Returns Groq-simulated wallet intelligence (replaces paid Nansen API).

**Query params**
- `address` — wallet address (`0x...`)

**Response 200**
```json
{
  "address":       "0x...",
  "labels":        ["defi_native", "rwa_holder"],
  "net_flow_30d":  12400,
  "is_smart_money": false,
  "risk_modifier": -3,
  "source":        "groq-simulated"
}
```

`risk_modifier` is in range `[-10, +10]`. A negative value lowers the computed risk score (bullish signal). Used directly in `computeRiskScore()`.

---

## GET /api/elfa

Returns Groq-simulated social sentiment (replaces paid Elfa AI API).

**Query params**
- `query` — search query, e.g. `USDY RWA` or `mETH Mantle staking`

**Response 200**
```json
{
  "query":         "USDY RWA",
  "score":         0.62,
  "momentum":      "bullish",
  "mention_count": 1240,
  "top_signals":   ["...", "..."],
  "source":        "groq-simulated"
}
```

`score` is in range `[-1.0, +1.0]`. Used as `elfaSentiment` parameter in `computeRiskScore()` and committed in `contextHash`.

---

## GET /api/yield-rates

Returns current APYs for USDY and mETH.

**Response 200**
```json
{
  "usdy":      5.1,
  "meth":      4.2,
  "timestamp": 1717200000000,
  "source": {
    "usdy": "ondo-finance-api",
    "meth": "mantle-staking-contract"
  }
}
```

---

## POST /api/elevenlabs

Proxies ElevenLabs TTS synthesis. Returns `audio/mpeg` binary. Only available when `ELEVENLABS_API_KEY` is configured.

**Request body**
```json
{
  "text":     "<speech text, max 2000 chars>",
  "voice_id": "<optional ElevenLabs voice ID>"
}
```

**Response 200** — `Content-Type: audio/mpeg` binary audio data.

---

## Error response format

All error responses share this shape:
```json
{
  "error":     "Human-readable message",
  "code":      "MACHINE_CODE",
  "retryable": true
}
```

See [error-codes.md](./error-codes.md) for the full taxonomy.

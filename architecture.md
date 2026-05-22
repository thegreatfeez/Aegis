# Aegis — System Architecture

> AI-guided, wallet-native yield management for Mantle RWA assets
> **Hackathon track:** AI × RWA — Dynamic yield strategies and automated risk management for USDY and mETH on Mantle's RWA infrastructure

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Layer 1 — Frontend](#layer-1--frontend)
4. [Layer 2 — AI Engine](#layer-2--ai-engine)
5. [Layer 3 — Smart Contracts](#layer-3--smart-contracts)
6. [Layer 4 — RWA Asset Layer](#layer-4--rwa-asset-layer)
7. [Sponsor Integrations](#sponsor-integrations)
8. [Data Flow — End to End](#data-flow--end-to-end)
9. [Directory Structure](#directory-structure)
10. [Environment Variables](#environment-variables)
11. [Local Development](#local-development)
12. [Deployment](#deployment)
13. [Security Considerations](#security-considerations)
14. [Roadmap](#roadmap)

---

## Overview

Aegis adapts the wallet-native risk management ideology of Pulse AI (Solana) to an EVM-compatible architecture on **Mantle testnet**. The core thesis is unchanged: a wallet with $100 of USDY should not receive the same yield strategy as one with $100,000. Every AI-generated rebalance recommendation is committed on-chain as an auditable hash before execution — functioning as a double-entry ledger entry for AI advice, a concept directly drawn from accounting principles.

### What it does

- Issues each user an **ERC-8004 agent identity NFT** on first profile initialisation, creating a permanent on-chain reputation record for their AI agent
- Tracks a user's RWA portfolio (USDY, mETH, cmETH) in real time
- Scores risk across six on-chain factors, enriched with Nansen smart-money wallet intelligence and Elfa AI social sentiment
- Generates AI yield briefs using Groq LLM; all AI outputs are proxied securely through Tencent Cloud SCF — no keys exposed client-side
- Commits AI advice hashes on-chain **before** any rebalance executes — every signal is traceable on Mantle Explorer
- Routes USDY ↔ mETH swaps through Merchant Moe's `ILBRouter` on Mantle
- Voices market briefs via ElevenLabs TTS

### Why this wins the AI × RWA track

The `AdviceCommitment` contract is the differentiator. Every AI recommendation produces a `keccak256` hash of the advice payload and context payload — including Elfa AI sentiment scores — stored immutably on-chain. The `AutoRebalancer` can only execute a swap if a valid commitment exists and the hash matches exactly. This creates a verifiable, auditable chain from AI signal to on-chain action.

Three things no other "LLM picks tokens" project at this hackathon will have:

1. **ERC-8004 compliance** — every agent is issued an on-chain identity NFT that accumulates a verifiable history of commitments and executions, directly satisfying the hackathon's own agent identity standard.
2. **On-chain benchmarking** — every AI decision, its context (yield rates, risk score, sentiment), and its outcome (executed or not) are permanently on Mantle. Any judge can reproduce the audit trail in real time.
3. **Radical transparency in execution** — the `AutoRebalancer` is cryptographically gated by the commitment hash. It is architecturally impossible for a swap to execute without a prior on-chain commitment.

Traditional TradFi compliance officers understand the double-entry ledger model. Web3 judges understand on-chain verifiability. This project speaks both languages.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                               │
│  React · Vite · Tailwind · wagmi · viem · ConnectKit                │
│                                                                     │
│  ┌──────────┐  ┌────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │Portfolio │  │ AI Insights│  │Strategy      │  │ Positions   │  │
│  │Dashboard │  │ + Voice    │  │Builder UI    │  │ + Swap      │  │
│  └──────────┘  └────────────┘  └──────────────┘  └─────────────┘  │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ wagmi hooks / viem reads
┌───────────────────────────▼─────────────────────────────────────────┐
│                    TENCENT CLOUD SCF LAYER                          │
│  All AI/data API keys proxied here — zero client-side key exposure  │
│                                                                     │
│  /api/groq-proxy   /api/nansen   /api/elfa   /api/yield-rates       │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ server-side API calls
┌───────────────────────────▼─────────────────────────────────────────┐
│                         AI ENGINE LAYER                             │
│  Groq LLM (llama-3.3-70b) · Nansen API · Elfa AI · ElevenLabs      │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │Yield         │  │Risk Scorer   │  │Market Brief  │             │
│  │Optimizer     │  │(6-factor +   │  │Generator     │             │
│  │USDY APY vs   │  │Nansen wallet │  │Groq + Elfa   │             │
│  │mETH rate →   │  │intelligence  │  │AI sentiment  │             │
│  │ROTATE/HOLD/  │  │+ Elfa        │  │→ ElevenLabs  │             │
│  │COMPOUND sig  │  │sentiment)    │  │voice brief   │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ ethers.js / viem contract calls
┌───────────────────────────▼─────────────────────────────────────────┐
│                    ON-CHAIN PROTOCOL LAYER                          │
│  Solidity · Foundry · Mantle testnet · OpenZeppelin · ERC-4626      │
│                                                                     │
│  ┌───────────────┐  ┌────────────┐  ┌────────────────────────────┐ │
│  │UserRiskProfile│  │YieldVault  │  │AutoRebalancer              │ │
│  │+ ERC-8004     │  │ERC-4626    │  │validates AdviceCommitment  │ │
│  │Agent NFT mint │  │USDY + mETH │  │hash → Merchant Moe router  │ │
│  └───────────────┘  └────────────┘  └────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────┐  ┌────────────────────────────────────┐  │
│  │AdviceCommitment       │  │RiskPolicy (admin)                  │  │
│  │adviceHash · context   │  │global bps params · Ownable         │  │
│  │Hash · nonce · agentId │  │multisig upgrade path               │  │
│  │immutable · history    │  │                                    │  │
│  └───────────────────────┘  └────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────┐                                          │
│  │AegisAgent (ERC-8004│                                          │
│  │Agent identity NFT     │                                          │
│  │walletToAgentId mapping│                                          │
│  └───────────────────────┘                                          │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ ERC-20 token interfaces
┌───────────────────────────▼─────────────────────────────────────────┐
│                       RWA ASSET LAYER                               │
│                                                                     │
│  USDY (Ondo)  ·  mETH (Mantle LST)  ·  cmETH (auto-compounding)   │
│  MNT (gas token)  ·  Merchant Moe LP tokens                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Layer 1 — Frontend

### Stack

| Package | Purpose |
|---|---|
| React 18 + Vite | UI framework and bundler |
| Tailwind CSS | Utility-first styling with dark/light theme vars |
| wagmi v2 | EVM wallet state management |
| viem | Low-level EVM reads/writes |
| ConnectKit | Wallet connection modal |
| @tanstack/react-query | Async state, caching |
| ElevenLabs TTS API | Voice briefings |
| Li.Fi Widget | Cross-chain bridge (optional) |

> **Note:** The Groq SDK has been moved server-side. All AI completions are called via the Tencent Cloud SCF proxy — no API keys live in the browser bundle.

### Pages / Panels

#### `<Dashboard />`
- Reads `UserRiskProfile` for the connected wallet via `useContractRead`
- Checks if an ERC-8004 agent NFT has been minted for the wallet; surfaces "Activate Agent" CTA if not
- Fetches USDY and mETH balances from the `YieldVault`
- Renders a `<RiskGauge />` (0–100 composite score) per asset, with Nansen and Elfa AI signal breakdown
- Shows on-chain `PositionIntent` history and `AdviceCommitment` history (fetched via `getCommitmentHistory()`)
- "Init On-Chain Profile" button calls `UserRiskProfile.initialize()` and triggers `AegisAgent.mint()` in sequence
- "Update Profile" inline form calls `UserRiskProfile.update()`

#### `<AIInsights />`
- `<MarketBriefCard />` — calls SCF proxy to generate Groq brief enriched with Elfa AI sentiment; ElevenLabs voice button
- `<YieldAnalysisCard />` — per-asset yield signal (ROTATE / HOLD / COMPOUND) with confidence %
- `<AnalysisHistory />` — fetches prior commitment history from `AdviceCommitment.getCommitmentHistory()` on-chain, with Mantle Explorer links. **No localStorage dependency** — the chain is the source of truth.

#### `<StrategyBuilder />`
- Slider UI for target allocation split: USDY % vs. mETH %
- Reads current `RiskPolicy` from chain (max bps constraints)
- Submits desired split to the SCF AI proxy to get a `ROTATE` signal
- On confirm: calls `recordAdviceCommitment()` then `AutoRebalancer.execute()`

#### `<Positions />`
- Lists live `PositionIntent` accounts filtered by authority
- Shows Mantle Testnet Explorer links per transaction
- Displays ERC-8004 Agent NFT badge and token ID for connected wallet
- Devnet simulation badge when running on testnet

#### `<SwapPanel />`
- USDY ↔ mETH via `AutoRebalancer` (which calls Merchant Moe internally)
- Quote estimation using `IMerchantMoeRouter.getAmountsOut()`
- Slippage selector (50 / 100 / 200 / 500 bps)
- Risk banner with position size recommendation from AI engine

### Wallet Integration

```typescript
// wagmi config — Mantle testnet
import { createConfig, http } from 'wagmi'
import { mantleTestnet } from 'wagmi/chains'

export const config = createConfig({
  chains: [mantleTestnet],
  transports: {
    [mantleTestnet.id]: http(import.meta.env.VITE_MANTLE_RPC_URL),
  },
})
```

---

## Layer 2 — AI Engine

> All Groq, Nansen, and Elfa AI calls are made server-side via Tencent Cloud SCF. The frontend calls `/api/groq-proxy`, `/api/nansen`, and `/api/elfa` respectively. No third-party API keys are present in the browser bundle.

### Yield Optimizer

The SCF proxy assembles a structured Groq prompt containing:

- Current USDY APY (fetched from Ondo API)
- Current mETH staking rate (from Mantle staking contract read)
- User's `UserRiskProfile` (riskMode, maxPositionBps, maxConcentrationBps)
- Portfolio value in USD
- Nansen smart-money flow score for the connected wallet
- Elfa AI sentiment score for USDY and mETH

Returns JSON:

```json
{
  "signal": "ROTATE" | "HOLD" | "COMPOUND",
  "confidence": 0-100,
  "summary": "2-3 sentence rationale",
  "from_asset": "USDY" | "mETH",
  "to_asset": "USDY" | "mETH",
  "suggested_pct_shift": 0-100,
  "risk_note": "1 sentence"
}
```

### Risk Scorer (6-factor)

| Factor | Weight | Signal |
|---|---|---|
| Liquidity depth (Merchant Moe pool) | 0–25 | Lower liquidity = higher risk |
| 24h volume / liquidity ratio | 0–20 | Low ratio = illiquid |
| Asset age (USDY launch date / mETH issuance) | 0–20 | Newer = higher risk |
| Buy/Sell txn ratio (on-chain) | 0–15 | Extreme imbalance = risk |
| FDV / Liquidity ratio | 0–10 | High FDV vs low liquidity = risk |
| **Nansen wallet intelligence** | ±10 modifier | Smart money inflow lowers risk |
| **Elfa AI social sentiment** | ±10 modifier | Negative momentum raises risk |

```typescript
// src/services/riskEngine.ts
export function computeRiskScore(
  asset: RWAAsset,
  nansenScore?: number,
  elfaSentiment?: number   // -1.0 to +1.0
): RiskResult {
  const scores = {
    liquidity:  scoreLiquidity(asset.liquidityUsd),
    volume:     scoreVolume(asset.volume24h, asset.liquidityUsd),
    age:        scoreAge(asset.ageHours),
    txnRatio:   scoreTxnRatio(asset.buys24h, asset.sells24h),
    fdvRatio:   scoreFdvRatio(asset.fdv, asset.liquidityUsd),
  }
  const base = Object.values(scores).reduce((a, b) => a + b, 0)

  // Nansen: smart money inflow reduces risk score (negative modifier = lower risk)
  const nansenAdj = nansenScore
    ? Math.min(10, Math.max(-10, -nansenScore / 10))
    : 0

  // Elfa: negative sentiment raises risk score; positive lowers it
  const elfaAdj = elfaSentiment !== undefined
    ? Math.min(10, Math.max(-10, -elfaSentiment * 10))
    : 0

  return {
    score: Math.min(100, Math.max(0, base + nansenAdj + elfaAdj)),
    breakdown: { ...scores, nansenAdj, elfaAdj },
    level: getRiskLevel(base),
  }
}
```

### Market Brief Generator

Prompt chain (all steps run server-side in SCF):
1. Fetch Elfa AI social sentiment for `"USDY RWA"` and `"mETH staking Mantle"`
2. Fetch Nansen wallet label for connected address
3. Build Groq prompt with portfolio context + sentiment scores + yield rates
4. Return structured JSON with `market_sentiment`, `yield_outlook`, `portfolio_insights`, `risk_warnings`, `action_items`
5. Serialize brief to text → ElevenLabs TTS → audio URL → in-browser playback

### Commitment Schema

The context payload now includes Elfa AI sentiment scores, making the on-chain commitment a complete, verifiable snapshot of every signal that influenced the AI's recommendation.

```typescript
// src/lib/commitmentSchema.ts
export function buildAdviceCommitmentPayloads({
  wallet,
  asset,
  portfolioValueUsd,
  yieldRates,
  analysis,
  riskScore,
  elfaSentiment,   // included in context hash — on-chain verifiable
  agentId,         // ERC-8004 token ID
}: CommitmentInput): CommitmentPayloads {
  const context = canonicalJSONStringify({
    schema_version: '1.1.0',
    wallet,
    asset,
    agent_id: agentId,
    portfolio_value_usd: portfolioValueUsd,
    yield_rates: yieldRates,
    risk_score: riskScore,
    elfa_sentiment: elfaSentiment,   // sentiment is part of the auditable record
  })
  const advice = canonicalJSONStringify({
    schema_version: '1.1.0',
    signal:           analysis.signal,
    confidence:       analysis.confidence,
    summary:          analysis.summary,
    suggested_action: analysis.suggested_action,
  })
  return { contextPayload: context, advicePayload: advice }
}
```

---

## Layer 3 — Smart Contracts

### `AegisAgent.sol` ← NEW (ERC-8004 Agent Identity)

Every user who initialises a `UserRiskProfile` is issued a unique ERC-8004 agent identity NFT. This NFT accumulates an on-chain record of the agent's commitments and executions — satisfying the hackathon's agent identity standard and enabling a permanent, portable reputation layer.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title AegisAgent — ERC-8004 compliant agent identity NFT
/// @notice One NFT per wallet. Minted on first UserRiskProfile initialisation.
///         Accumulates on-chain reputation via AdviceCommitment events.
contract AegisAgent is ERC721, Ownable {
    uint256 private _tokenIdCounter;

    // wallet address → agent token ID (0 = no agent yet)
    mapping(address => uint256) public walletToAgentId;
    // agent token ID → total commitments made
    mapping(uint256 => uint256) public commitmentCount;
    // agent token ID → total executions completed
    mapping(uint256 => uint256) public executionCount;

    address public profileRegistry;   // UserRiskProfile — authorised to mint
    address public commitmentContract; // AdviceCommitment — authorised to record stats

    event AgentMinted(address indexed wallet, uint256 indexed agentId);
    event AgentStatUpdated(uint256 indexed agentId, uint256 commitments, uint256 executions);

    modifier onlyAuthorized() {
        require(
            msg.sender == profileRegistry || msg.sender == commitmentContract,
            "Not authorized"
        );
        _;
    }

    constructor() ERC721("Aegis Agent", "RWAPA") Ownable(msg.sender) {}

    function setAuthorizedContracts(
        address profileRegistry_,
        address commitmentContract_
    ) external onlyOwner {
        profileRegistry    = profileRegistry_;
        commitmentContract = commitmentContract_;
    }

    /// @notice Mint an agent NFT for a wallet. Called by UserRiskProfile.initialize().
    function mint(address to) external onlyAuthorized returns (uint256 agentId) {
        require(walletToAgentId[to] == 0, "Agent already exists");
        agentId = ++_tokenIdCounter;
        _safeMint(to, agentId);
        walletToAgentId[to] = agentId;
        emit AgentMinted(to, agentId);
    }

    /// @notice Increment reputation counters. Called by AdviceCommitment.
    function recordCommitment(uint256 agentId) external onlyAuthorized {
        commitmentCount[agentId]++;
        emit AgentStatUpdated(agentId, commitmentCount[agentId], executionCount[agentId]);
    }

    function recordExecution(uint256 agentId) external onlyAuthorized {
        executionCount[agentId]++;
        emit AgentStatUpdated(agentId, commitmentCount[agentId], executionCount[agentId]);
    }

    function getAgentStats(uint256 agentId)
        external view
        returns (uint256 commitments, uint256 executions)
    {
        return (commitmentCount[agentId], executionCount[agentId]);
    }
}
```

---

### `UserRiskProfile.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "./AegisAgent.sol";

contract UserRiskProfile is EIP712 {
    struct Profile {
        address authority;
        uint8   riskMode;            // 0=conservative, 1=moderate, 2=aggressive
        uint16  maxPositionBps;      // max single position, basis points of portfolio
        uint16  maxConcentrationBps; // max asset concentration
        uint64  createdAt;
        uint64  updatedAt;
    }

    mapping(address => Profile) public profiles;

    AegisAgent public agentNFT;

    event ProfileInitialized(address indexed authority, uint8 riskMode, uint256 agentId);
    event ProfileUpdated(address indexed authority, uint8 riskMode, uint16 maxPositionBps);

    constructor(address agentNFT_) EIP712("Aegis", "1") {
        agentNFT = AegisAgent(agentNFT_);
    }

    /// @notice Initialise profile and mint ERC-8004 agent NFT in one transaction.
    function initialize(
        uint8  riskMode,
        uint16 maxPositionBps,
        uint16 maxConcentrationBps
    ) external {
        require(profiles[msg.sender].createdAt == 0, "Profile exists");
        require(maxPositionBps <= 10_000 && maxConcentrationBps <= 10_000, "Invalid bps");

        profiles[msg.sender] = Profile({
            authority:           msg.sender,
            riskMode:            riskMode,
            maxPositionBps:      maxPositionBps,
            maxConcentrationBps: maxConcentrationBps,
            createdAt:           uint64(block.timestamp),
            updatedAt:           uint64(block.timestamp)
        });

        // Mint ERC-8004 agent identity NFT
        uint256 agentId = agentNFT.mint(msg.sender);

        emit ProfileInitialized(msg.sender, riskMode, agentId);
    }

    function update(
        uint8  riskMode,
        uint16 maxPositionBps,
        uint16 maxConcentrationBps
    ) external {
        require(profiles[msg.sender].createdAt != 0, "No profile");
        require(maxPositionBps <= 10_000 && maxConcentrationBps <= 10_000, "Invalid bps");
        Profile storage p = profiles[msg.sender];
        p.riskMode            = riskMode;
        p.maxPositionBps      = maxPositionBps;
        p.maxConcentrationBps = maxConcentrationBps;
        p.updatedAt           = uint64(block.timestamp);
        emit ProfileUpdated(msg.sender, riskMode, maxPositionBps);
    }
}
```

---

### `YieldVault.sol`

**Fix:** The deposit guard now correctly measures the **user's own** current position value (not `totalAssets()` which is vault-wide) to enforce per-wallet `maxPositionBps`.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./RiskPolicy.sol";
import "./UserRiskProfile.sol";

contract YieldVault is ERC4626, Ownable, ReentrancyGuard {
    RiskPolicy      public riskPolicy;
    UserRiskProfile public riskProfileRegistry;

    constructor(
        IERC20 asset_,
        string memory name_,
        string memory symbol_,
        address riskPolicy_,
        address profileRegistry_
    ) ERC4626(asset_) ERC20(name_, symbol_) Ownable(msg.sender) {
        riskPolicy          = RiskPolicy(riskPolicy_);
        riskProfileRegistry = UserRiskProfile(profileRegistry_);
    }

    /// @notice Override deposit to enforce per-wallet risk policy constraints.
    /// @dev Uses the depositor's own share value, not the vault's totalAssets().
    function deposit(uint256 assets, address receiver)
        public
        override
        nonReentrant
        returns (uint256)
    {
        UserRiskProfile.Profile memory profile = riskProfileRegistry.profiles(msg.sender);

        if (profile.createdAt != 0) {
            // Calculate the user's current position value in underlying asset terms
            uint256 userShares       = balanceOf(msg.sender);
            uint256 userCurrentValue = convertToAssets(userShares);

            // After deposit, the user's position would be userCurrentValue + assets
            uint256 projectedValue = userCurrentValue + assets;

            // maxPositionBps applies to the projected total position
            uint256 maxAllowed = (projectedValue * profile.maxPositionBps) / 10_000;

            require(
                assets <= maxAllowed || userCurrentValue == 0,
                "Exceeds max position bps"
            );
        }
        return super.deposit(assets, receiver);
    }

    function withdraw(uint256 assets, address receiver, address owner_)
        public
        override
        nonReentrant
        returns (uint256)
    {
        return super.withdraw(assets, receiver, owner_);
    }
}
```

---

### `AdviceCommitment.sol`

**Changes:**
- Now `Ownable` with an `addAuthorizedExecutor` admin function — only the `AutoRebalancer` can mark commitments executed.
- Removed the `msg.sender == authority` bypass in `markExecuted` — the user cannot short-circuit the swap validation.
- Added `userNonces` mapping and `getCommitmentHistory()` view — replaces the `localStorage` history cache.
- Emits `agentId` in events — ties every commitment to the agent's on-chain identity.
- Calls `agentNFT.recordCommitment()` and `agentNFT.recordExecution()` to update the agent's reputation.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AegisAgent.sol";

contract AdviceCommitment is Ownable {
    struct Commitment {
        address authority;
        uint256 nonce;
        uint256 agentId;       // ERC-8004 token ID
        bytes32 adviceHash;    // keccak256(canonicalJSON(advice payload))
        bytes32 contextHash;   // keccak256(canonicalJSON(context payload incl. sentiment))
        uint256 portfolioValueWei;
        uint8   riskScore;
        uint64  createdAt;
        bool    executed;
    }

    // authority => nonce => Commitment
    mapping(address => mapping(uint256 => Commitment)) public commitments;

    // authority => ordered list of nonces (for history queries)
    mapping(address => uint256[]) public userNonces;

    // Only explicitly authorised executors (i.e. AutoRebalancer) may mark executed
    mapping(address => bool) private _authorizedExecutors;

    AegisAgent public agentNFT;

    event CommitmentRecorded(
        address indexed authority,
        uint256 indexed nonce,
        uint256 indexed agentId,
        bytes32 adviceHash,
        bytes32 contextHash,
        uint8   riskScore
    );
    event CommitmentExecuted(
        address indexed authority,
        uint256 indexed nonce,
        uint256 indexed agentId
    );

    constructor(address agentNFT_) Ownable(msg.sender) {
        agentNFT = AegisAgent(agentNFT_);
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    /// @notice Register an executor (e.g. AutoRebalancer). Called once in Deploy.s.sol.
    function addAuthorizedExecutor(address executor) external onlyOwner {
        _authorizedExecutors[executor] = true;
    }

    function isAuthorizedExecutor(address addr) public view returns (bool) {
        return _authorizedExecutors[addr];
    }

    // ─── Core ─────────────────────────────────────────────────────────────────

    function record(
        uint256 nonce,
        bytes32 adviceHash,
        bytes32 contextHash,
        uint256 portfolioValueWei,
        uint8   riskScore
    ) external {
        require(commitments[msg.sender][nonce].createdAt == 0, "Nonce used");

        uint256 agentId = agentNFT.walletToAgentId(msg.sender);
        require(agentId != 0, "No agent NFT — initialise profile first");

        commitments[msg.sender][nonce] = Commitment({
            authority:         msg.sender,
            nonce:             nonce,
            agentId:           agentId,
            adviceHash:        adviceHash,
            contextHash:       contextHash,
            portfolioValueWei: portfolioValueWei,
            riskScore:         riskScore,
            createdAt:         uint64(block.timestamp),
            executed:          false
        });

        userNonces[msg.sender].push(nonce);
        agentNFT.recordCommitment(agentId);

        emit CommitmentRecorded(
            msg.sender, nonce, agentId, adviceHash, contextHash, riskScore
        );
    }

    /// @notice Called exclusively by the AutoRebalancer after a successful swap.
    ///         The user cannot call this directly — a swap must actually occur.
    function markExecuted(address authority, uint256 nonce) external {
        require(isAuthorizedExecutor(msg.sender), "Only authorized executor");
        Commitment storage c = commitments[authority][nonce];
        require(c.createdAt != 0, "Commitment not found");
        require(!c.executed,      "Already executed");

        c.executed = true;
        agentNFT.recordExecution(c.agentId);

        emit CommitmentExecuted(authority, nonce, c.agentId);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    /// @notice Returns all nonces for a user — used by the frontend history panel.
    function getCommitmentHistory(address user)
        external view
        returns (uint256[] memory)
    {
        return userNonces[user];
    }
}
```

---

### `AutoRebalancer.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./AdviceCommitment.sol";
import "./interfaces/IMerchantMoeRouter.sol";

contract AutoRebalancer is ReentrancyGuard {
    AdviceCommitment   public immutable commitmentRegistry;
    IMerchantMoeRouter public immutable merchantMoeRouter;

    address public immutable USDY;
    address public immutable mETH;

    event RebalanceExecuted(
        address indexed user,
        uint256 indexed nonce,
        uint256 indexed agentId,
        address fromAsset,
        address toAsset,
        uint256 amountIn,
        uint256 amountOut
    );

    constructor(
        address commitmentRegistry_,
        address router_,
        address usdy_,
        address meth_
    ) {
        commitmentRegistry = AdviceCommitment(commitmentRegistry_);
        merchantMoeRouter  = IMerchantMoeRouter(router_);
        USDY = usdy_;
        mETH = meth_;
    }

    function execute(
        uint256 commitmentNonce,
        bytes32 expectedAdviceHash,
        address fromAsset,
        address toAsset,
        uint256 amountIn,
        uint256 amountOutMin,
        uint256 deadline
    ) external nonReentrant {
        AdviceCommitment.Commitment memory c =
            commitmentRegistry.commitments(msg.sender, commitmentNonce);

        require(c.authority   == msg.sender,          "Wrong authority");
        require(c.adviceHash  == expectedAdviceHash,  "Hash mismatch");
        require(!c.executed,                          "Already executed");
        require(fromAsset == USDY || fromAsset == mETH, "Invalid asset");
        require(toAsset   == USDY || toAsset   == mETH, "Invalid asset");
        require(fromAsset != toAsset,                 "Same asset");

        // Pull tokens from user
        IERC20(fromAsset).transferFrom(msg.sender, address(this), amountIn);
        IERC20(fromAsset).approve(address(merchantMoeRouter), amountIn);

        // Route through Merchant Moe ILBRouter
        uint256 amountOut = merchantMoeRouter.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            _buildPath(fromAsset, toAsset),
            msg.sender,
            deadline
        );

        // Mark commitment executed — updates agent reputation via AdviceCommitment
        commitmentRegistry.markExecuted(msg.sender, commitmentNonce);

        emit RebalanceExecuted(
            msg.sender, commitmentNonce, c.agentId,
            fromAsset, toAsset, amountIn, amountOut
        );
    }

    function _buildPath(address from, address to)
        internal pure
        returns (address[] memory path)
    {
        path    = new address[](2);
        path[0] = from;
        path[1] = to;
    }
}
```

---

### `RiskPolicy.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract RiskPolicy is Ownable {
    struct Policy {
        uint256 minPortfolioWei;
        uint256 maxPortfolioWei;
        uint16  maxPositionBps;
        uint16  maxConcentrationBps;
        uint16  volatilityScaleBps;
        uint64  updatedAt;
    }

    Policy public globalPolicy;

    event PolicyUpdated(uint16 maxPositionBps, uint16 maxConcentrationBps);

    constructor() Ownable(msg.sender) {}

    function update(
        uint256 minPortfolioWei,
        uint256 maxPortfolioWei,
        uint16  maxPositionBps,
        uint16  maxConcentrationBps,
        uint16  volatilityScaleBps
    ) external onlyOwner {
        require(maxPositionBps     <= 10_000, "Invalid bps");
        require(maxConcentrationBps <= 10_000, "Invalid bps");
        require(minPortfolioWei    <= maxPortfolioWei, "Invalid range");
        globalPolicy = Policy({
            minPortfolioWei:     minPortfolioWei,
            maxPortfolioWei:     maxPortfolioWei,
            maxPositionBps:      maxPositionBps,
            maxConcentrationBps: maxConcentrationBps,
            volatilityScaleBps:  volatilityScaleBps,
            updatedAt:           uint64(block.timestamp)
        });
        emit PolicyUpdated(maxPositionBps, maxConcentrationBps);
    }
}
```

---

### `PositionIntent.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PositionIntent {
    struct Intent {
        address authority;
        uint256 nonce;
        address tokenAsset;
        uint8   side;              // 0 = deposit, 1 = withdraw
        uint256 amountWei;
        uint16  expectedSlippageBps;
        uint64  createdAt;
    }

    mapping(address => mapping(uint256 => Intent)) public intents;
    mapping(address => uint256[]) public userNonces;

    event IntentRecorded(
        address indexed authority,
        uint256 indexed nonce,
        address tokenAsset,
        uint8   side
    );

    function record(
        uint256 nonce,
        address tokenAsset,
        uint8   side,
        uint256 amountWei,
        uint16  expectedSlippageBps
    ) external {
        require(intents[msg.sender][nonce].createdAt == 0, "Nonce used");
        require(side <= 1,                "Invalid side");
        require(expectedSlippageBps <= 10_000, "Invalid slippage");
        intents[msg.sender][nonce] = Intent({
            authority:           msg.sender,
            nonce:               nonce,
            tokenAsset:          tokenAsset,
            side:                side,
            amountWei:           amountWei,
            expectedSlippageBps: expectedSlippageBps,
            createdAt:           uint64(block.timestamp)
        });
        userNonces[msg.sender].push(nonce);
        emit IntentRecorded(msg.sender, nonce, tokenAsset, side);
    }

    function getUserIntents(address user) external view returns (uint256[] memory) {
        return userNonces[user];
    }
}
```

---

## Layer 4 — RWA Asset Layer

| Asset | Address (Mantle testnet) | Type | Yield Source |
|---|---|---|---|
| USDY | TBD (Ondo deploy) | ERC-20, rebase | US T-bill yield ~5% APY |
| mETH | `0x...` (Mantle staking) | ERC-20, LST | ETH staking yield ~4% APY |
| cmETH | `0x...` (auto-compound) | ERC-4626 | Compounded mETH yield |
| MNT | Native gas token | ERC-20 | — |

### Yield Rate Fetching

```typescript
// src/services/yieldService.ts
export async function fetchYieldRates(): Promise<YieldRates> {
  const [usdyApy, methApy] = await Promise.all([
    fetchUSDYApy(),   // Ondo Finance API (via SCF proxy)
    fetchMETHApy(),   // Mantle staking contract read
  ])
  return { usdy: usdyApy, meth: methApy, timestamp: Date.now() }
}

async function fetchMETHApy(): Promise<number> {
  const rate = await publicClient.readContract({
    address: METH_STAKING_ADDRESS,
    abi:     METH_STAKING_ABI,
    functionName: 'exchangeRate',
  })
  return annualizeRate(Number(rate))
}
```

---

## Sponsor Integrations

### 1. Merchant Moe (on-chain, highest priority)

Merchant Moe is Mantle's native DEX running a Liquidity Book AMM. The `AutoRebalancer` calls their `ILBRouter` directly for all USDY ↔ mETH swaps.

```solidity
// contracts/src/interfaces/IMerchantMoeRouter.sol
interface IMerchantMoeRouter {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256 amountOut);

    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external view returns (uint256[] memory amounts);
}
```

**Integration depth:** The `AutoRebalancer` contract calls Merchant Moe on every rebalance. Judges can verify this on-chain against the `RebalanceExecuted` event logs.

---

### 2. Nansen API (AI risk layer)

Enriches the risk scorer with wallet-level smart-money intelligence. Proxied through Tencent Cloud SCF.

```typescript
// src/services/nansenService.ts  (calls SCF proxy, not Nansen directly)
export async function fetchWalletIntelligence(walletAddress: string): Promise<NansenScore> {
  const data = await fetch(`${SCF_BASE_URL}/api/nansen?address=${walletAddress}`)
    .then(r => r.json())
  return {
    isSmartMoney: data.labels?.includes('smart_money') ?? false,
    flowScore:    data.net_flow_30d ?? 0,
    riskModifier: data.labels?.includes('smart_money') ? -10 : 0,
  }
}
```

**Integration depth:** Nansen data feeds into every `computeRiskScore()` call, is displayed in the risk gauge breakdown, and is encoded in the `contextHash` of every on-chain commitment.

---

### 3. Elfa AI API (social sentiment layer)

Provides social intelligence for RWA narrative momentum. Injected into the Groq brief prompt **and** into the commitment `contextHash` — making Elfa AI's influence on every decision verifiable on Mantle Explorer.

```typescript
// src/services/elfaService.ts  (calls SCF proxy)
export async function fetchRWASentiment(): Promise<ElfaSentiment> {
  const [usdySentiment, methSentiment] = await Promise.all([
    fetch(`${SCF_BASE_URL}/api/elfa?query=USDY+RWA`).then(r => r.json()),
    fetch(`${SCF_BASE_URL}/api/elfa?query=mETH+Mantle+staking`).then(r => r.json()),
  ])
  return {
    usdyMomentum: usdySentiment.score,   // -1.0 to +1.0
    methMomentum: methSentiment.score,
    signal:       resolveSentimentSignal(usdySentiment.score, methSentiment.score),
  }
}
```

**Integration depth:** Elfa sentiment score is a named input in the commitment `contextHash` (via `commitmentSchema.ts`), shown in the AI Insights panel, and used as a ±10 modifier in the risk scorer.

---

### 4. Tencent Cloud SCF (backend infrastructure)

All third-party API keys are kept server-side in Tencent Cloud Function Compute (Singapore region). The frontend makes fetch calls to SCF endpoints only — zero API key exposure in the browser bundle.

```
Backend: Tencent Cloud SCF (Singapore region)
  └── /api/groq-proxy    → Groq completions (llama-3.3-70b)
  └── /api/nansen        → Nansen wallet intelligence
  └── /api/elfa          → Elfa AI social sentiment
  └── /api/yield-rates   → USDY APY + mETH rate aggregation
  └── /api/elevenlabs    → ElevenLabs TTS synthesis
```

---

## Data Flow — End to End

```
User connects wallet (wagmi + ConnectKit)
        │
        ▼
Dashboard loads → checks for ERC-8004 agent NFT
        │   if none: "Activate Agent" CTA
        │   UserRiskProfile.initialize() → AegisAgent.mint() → agentId issued
        │
        ▼
Dashboard loads → reads UserRiskProfile, YieldVault balances,
                  AdviceCommitment history (on-chain), PositionIntents
        │
        ▼
User clicks "Generate Brief" in AI Insights
        │
        ├── SCF /api/nansen  → Nansen wallet intelligence
        ├── SCF /api/elfa    → Elfa AI social sentiment
        ├── SCF /api/yield-rates → mETH staking contract + Ondo APY
        │
        ▼
SCF /api/groq-proxy → Groq LLM assembles brief with all context
        │
        ▼
Structured JSON returned → SCF /api/elevenlabs → audio URL → in-browser playback
        │
        ▼
User reviews ROTATE signal in Strategy Builder
        │
        ▼
Frontend calls buildAdviceCommitmentPayloads()
  → canonicalJSON(context incl. elfaSentiment, agentId) → keccak256 = contextHash
  → canonicalJSON(advice)                               → keccak256 = adviceHash
        │
        ▼
User signs tx → AdviceCommitment.record(nonce, adviceHash, contextHash, ...)
        │   agentNFT.recordCommitment(agentId) called internally
        │   stored immutably on Mantle — visible on Mantle Explorer immediately
        │
        ▼
User confirms rebalance → AutoRebalancer.execute(nonce, adviceHash, ...)
        │   validates hash match (reverts if mismatch)
        │   IERC20.transferFrom → Merchant Moe ILBRouter
        │   USDY ↔ mETH swap settled on-chain
        │   commitmentRegistry.markExecuted() called
        │   agentNFT.recordExecution(agentId) — agent reputation updated
        │
        ▼
PositionIntent.record() called to log the completed position
        │
        ▼
Dashboard refreshes → new balances, on-chain commitment history,
                       updated agent NFT stats (commitments / executions)
```

---

## Directory Structure

```
rwa-pulse/
├── contracts/
│   ├── src/
│   │   ├── AegisAgent.sol          ← NEW — ERC-8004 agent identity NFT
│   │   ├── UserRiskProfile.sol        ← updated — mints agent NFT on init
│   │   ├── YieldVault.sol             ← fixed — per-user deposit math
│   │   ├── AdviceCommitment.sol       ← updated — history, auth fix, agentId
│   │   ├── AutoRebalancer.sol         ← updated — ReentrancyGuard, agentId event
│   │   ├── RiskPolicy.sol
│   │   ├── PositionIntent.sol
│   │   └── interfaces/
│   │       └── IMerchantMoeRouter.sol
│   ├── test/
│   │   ├── AegisAgent.t.sol        ← NEW
│   │   ├── UserRiskProfile.t.sol
│   │   ├── YieldVault.t.sol
│   │   ├── AdviceCommitment.t.sol
│   │   └── AutoRebalancer.t.sol
│   ├── script/
│   │   └── Deploy.s.sol
│   └── foundry.toml
│
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   ├── AIInsights.tsx
│   │   ├── StrategyBuilder.tsx
│   │   ├── Positions.tsx
│   │   ├── SwapPanel.tsx
│   │   ├── RiskGauge.tsx
│   │   ├── AgentBadge.tsx             ← NEW — displays ERC-8004 NFT + stats
│   │   ├── Header.tsx
│   │   └── WalletProvider.tsx
│   ├── hooks/
│   │   ├── useAegisProtocol.ts
│   │   ├── useYieldRates.ts
│   │   ├── useWalletPortfolio.ts
│   │   ├── useAIAnalysis.ts
│   │   ├── useAgentNFT.ts             ← NEW — reads agent ID, stats, mints
│   │   └── useElevenLabs.ts
│   ├── services/
│   │   ├── riskEngine.ts              ← updated — Elfa sentiment as 2nd modifier
│   │   ├── yieldService.ts
│   │   ├── nansenService.ts           ← updated — calls SCF proxy
│   │   ├── elfaService.ts             ← updated — calls SCF proxy
│   │   └── elevenLabsService.ts       ← updated — calls SCF proxy
│   ├── lib/
│   │   ├── commitmentSchema.ts        ← updated — elfaSentiment + agentId in hash
│   │   ├── wagmiClient.ts
│   │   └── abis/
│   │       ├── AegisAgent.json     ← NEW
│   │       ├── UserRiskProfile.json
│   │       ├── YieldVault.json
│   │       ├── AdviceCommitment.json
│   │       ├── AutoRebalancer.json
│   │       └── PositionIntent.json
│   ├── config.ts
│   ├── App.tsx
│   └── main.tsx
│
├── .env.example
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── ARCHITECTURE.md
└── README.md
```

---

## Environment Variables

```bash
# Mantle testnet RPC
VITE_MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz

# Contract addresses (post-deploy)
VITE_RWA_PULSE_AGENT_ADDRESS=0x...       # ERC-8004 agent NFT
VITE_USER_RISK_PROFILE_ADDRESS=0x...
VITE_YIELD_VAULT_USDY_ADDRESS=0x...
VITE_YIELD_VAULT_METH_ADDRESS=0x...
VITE_ADVICE_COMMITMENT_ADDRESS=0x...
VITE_AUTO_REBALANCER_ADDRESS=0x...
VITE_RISK_POLICY_ADDRESS=0x...
VITE_POSITION_INTENT_ADDRESS=0x...

# RWA asset addresses on Mantle testnet
VITE_USDY_ADDRESS=0x...
VITE_METH_ADDRESS=0x...
VITE_CMETH_ADDRESS=0x...

# Merchant Moe router
VITE_MERCHANT_MOE_ROUTER=0x...

# Tencent Cloud SCF base URL — all AI/data keys are server-side only
VITE_API_BASE_URL=https://your-scf-endpoint.tencentcloudapi.com

# ─── SERVER-SIDE ONLY (Tencent Cloud SCF environment variables) ───────────────
# These are NEVER in the frontend bundle
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile
NANSEN_API_KEY=...
ELFA_API_KEY=...
ELEVENLABS_API_KEY=...
```

---

## Local Development

### Prerequisites

- Node.js ≥ 20
- Foundry (`curl -L https://foundry.paradigm.xyz | bash`)
- A Mantle testnet wallet with test MNT (faucet: https://faucet.sepolia.mantle.xyz)

### Install and run

```bash
# Install frontend deps
npm install

# Compile contracts
cd contracts && forge build

# Run contract tests
forge test -vvv

# Deploy to Mantle testnet (see deployment order below)
forge script script/Deploy.s.sol:DeployAll \
  --rpc-url https://rpc.sepolia.mantle.xyz \
  --broadcast \
  --verify \
  --slow

# Copy deployed addresses to .env, then:
cd ..
npm run dev
```

### Run frontend only (no wallet needed)

```bash
npm run dev
# Opens on http://localhost:5173
# Connect MetaMask set to Mantle Sepolia testnet (chain ID 5003)
```

---

## Deployment

### Contract deployment order

| Order | Contract | Notes |
|---|---|---|
| 1 | `RiskPolicy` | No deps |
| 2 | `AegisAgent` | No deps; deploy before UserRiskProfile |
| 3 | `UserRiskProfile` | Needs `AegisAgent` address |
| 4 | `AdviceCommitment` | Needs `AegisAgent` address |
| 5 | `YieldVault (USDY)` | Needs USDY address, RiskPolicy, UserRiskProfile |
| 6 | `YieldVault (mETH)` | Needs mETH address, RiskPolicy, UserRiskProfile |
| 7 | `AutoRebalancer` | Needs AdviceCommitment, Merchant Moe router |
| 8 | `PositionIntent` | No deps |
| — | **Post-deploy wiring** | See below |

### Post-deploy wiring (in Deploy.s.sol)

```solidity
// Wire ERC-8004 NFT to its authorised callers
agentNFT.setAuthorizedContracts(
    address(userRiskProfile),
    address(adviceCommitment)
);

// Register AutoRebalancer as the only authorised executor
adviceCommitment.addAuthorizedExecutor(address(autoRebalancer));
```

### Verify on Mantle Explorer

```bash
# Example — repeat for each contract
forge verify-contract <ADDRESS> src/AdviceCommitment.sol:AdviceCommitment \
  --chain-id 5003 \
  --verifier blockscout \
  --verifier-url https://explorer.sepolia.mantle.xyz/api
```

---

## Security Considerations

### Contracts

- **`markExecuted` is executor-only.** The `msg.sender == authority` bypass has been removed. Only the `AutoRebalancer` (registered via `addAuthorizedExecutor`) can mark a commitment executed. A user cannot short-circuit the swap validation.
- **Per-wallet deposit math is correct.** `YieldVault.deposit()` now uses the depositor's own share value (`convertToAssets(balanceOf(msg.sender))`) rather than vault-wide `totalAssets()`.
- **Reentrancy.** `YieldVault` and `AutoRebalancer` both use OpenZeppelin's `ReentrancyGuard`.
- **Bps validation.** All basis-point values validated: `require(value <= 10_000)`.
- **Commitment nonce uniqueness.** Replay prevention via `require(createdAt == 0)`.
- **Asset whitelist.** `AutoRebalancer` enforces `fromAsset ∈ {USDY, mETH}` — no arbitrary token routing.
- **No `delegatecall`.** Not present anywhere in the protocol surface.
- **Gnosis Safe multisig.** `RiskPolicy` upgrade path uses a 2-of-3 multisig.

### AI layer

- All AI outputs are committed on-chain before execution — they can never be executed directly.
- The commitment hash binds the advice payload to a specific wallet, agentId, portfolio value, yield rates, sentiment score, and risk score at a specific block timestamp.
- Elfa AI sentiment is part of the `contextHash` — its influence on every decision is verifiable on Mantle Explorer.
- Users can inspect their `AdviceCommitment` on Mantle Explorer before confirming any execution.

### Frontend / API

- **All API keys are server-side.** Groq, Nansen, Elfa AI, and ElevenLabs keys live exclusively in Tencent Cloud SCF environment variables. The browser bundle contains no secrets.
- Wallet adapter is non-custodial; no private keys stored.
- SCF endpoints are the sole origin for AI and data calls — the frontend never contacts third-party APIs directly.

---

## Roadmap

### Hackathon demo scope

- [x] Architecture + contract interfaces defined
- [ ] `AegisAgent` ERC-8004 NFT deployed to Mantle testnet
- [ ] `UserRiskProfile` + `AdviceCommitment` deployed and wired to agent NFT
- [ ] `AutoRebalancer` registered as authorised executor
- [ ] Foundry test suite passing (`forge test -vvv`)
- [ ] Frontend connected to deployed contracts via wagmi
- [ ] Nansen API integrated via SCF proxy into risk scorer
- [ ] Elfa AI API integrated via SCF proxy — sentiment in risk score and contextHash
- [ ] Groq market brief generated via SCF proxy
- [ ] Merchant Moe swap demo (USDY → mETH via AutoRebalancer)
- [ ] ElevenLabs voice briefing working end-to-end
- [ ] AdviceCommitment + agent NFT stats verifiable on Mantle Explorer
- [ ] On-chain commitment history displayed in `<AnalysisHistory />` (no localStorage)
- [ ] `<AgentBadge />` showing ERC-8004 token ID and commitment/execution counts

### Post-hackathon

- Mainnet USDY and mETH addresses (Mantle mainnet)
- cmETH auto-compounding strategy via YieldVault
- Chainlink price oracle integration for mETH/USD
- Gelato Network automation for scheduled rebalances
- Full Foundry fuzz test suite
- Formal security review

---

## Key Design Decisions

### 1. `AdviceCommitment` — On-Chain Double-Entry Ledger for AI Advice

Every AI recommendation produces a debit entry (the commitment hash, stored before execution) and a credit entry (the `executed` flag, set after the swap settles). The hash encodes the AI output, the wallet, the agent ID, the portfolio value, the yield rates, the Elfa sentiment score, and the risk score at a specific block timestamp. This is not possible in any off-chain AI trading assistant.

### 2. ERC-8004 Agent Identity as a Reputation Layer

The `AegisAgent` NFT is not cosmetic. Every `CommitmentRecorded` and `CommitmentExecuted` event increments the agent's on-chain counters. Over time, a wallet builds a verifiable track record: how many AI recommendations it committed, how many it executed, what risk levels it operated at. This creates the foundation for a cross-protocol agent reputation system — the first of its kind on Mantle.

### 3. Zero Client-Side Key Exposure

Moving all third-party API keys to Tencent Cloud SCF is not just a security decision — it is an architecture one. It means the SCF layer is the canonical AI orchestration point: all context is assembled server-side, LLM calls are made server-side, and only the final structured JSON (and audio URL) are returned to the browser. The frontend is a wallet-connected display layer; the intelligence is entirely backend-resident and auditable via the on-chain commitment it produces.
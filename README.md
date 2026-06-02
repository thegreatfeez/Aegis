# Aegis

> AI-powered yield strategy protocol on Mantle — on-chain commitment of every AI recommendation before execution.

For a full explanation of the protocol design, architecture, and economics, read the **[Aegis Whitepaper](https://aegis.app/whitepaper)** (available to read or download as PDF from the landing page).

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Web3 | wagmi v2, viem, ConnectKit |
| AI | Groq (Llama 3.3 70B) via Tencent Cloud SCF proxy |
| Backend | Node.js, Express (API proxy — no keys on client) |
| Chain | Mantle Sepolia (testnet) |

---

## Contracts (Mantle Sepolia)

| Contract | Address |
|----------|---------|
| AegisAgent | `0xef571ecd58ee26e3c4ca6be8cab6a88abc58a6a7` |
| UserRiskProfile | `0xe7fa28e17be54a8a1c30d8f6638f8c42bbc5fad2` |
| AdviceCommitment | `0x41271490144e382b51457f2e09f6ad3edefc1fb8` |
| AutoRebalancer | `0xf5caec80ab327b5d0988974d938f29db66eff8d7` |
| YieldVault | `0x1ae32dfd7f063a13134cdcd5c194631843e158c0` |
| RiskPolicy | `0xc9cfdd1150f6048ce90d215d971ed327bc45d45a` |

---

## Local Setup

### Prerequisites
- Node.js 18+
- A wallet with Mantle Sepolia MNT for gas

### Frontend

```bash
cd frontend
cp .env.example .env          # add your RPC URL if needed
npm install
npm run dev                   # http://localhost:5173
```

### Backend (API proxy)

```bash
cd backend
cp .env.example .env          # add GROQ_API_KEY
npm install
npm run dev                   # http://localhost:3000
```

### Environment Variables

**backend/.env**
```
GROQ_API_KEY=your_key_here
```

**frontend/.env**
```
VITE_BACKEND_URL=http://localhost:3000
```

---

## Project Structure

```
aegis/
├── frontend/
│   ├── src/
│   │   ├── components/       # Dashboard, Strategy, Insights, Landing, Whitepaper
│   │   ├── lib/              # contracts.ts, wagmi.ts, utils.ts
│   │   ├── services/         # ai.ts (Groq integration)
│   │   └── layout/           # DashboardLayout
│   └── public/
└── backend/
    └── src/
        ├── routes/           # groqProxy, yieldRates
        └── services/         # groqService, yieldService
```

---

## User Flow

1. Connect wallet → mint test USDY / mETH from the faucet
2. Set a risk profile (Conservative / Moderate / Aggressive)
3. Go to **Strategy** — AI analyses your portfolio and returns a signal
4. Click **Commit Strategy** — advice hash is recorded on-chain
5. Click **Execute Swap** — AutoRebalancer processes the swap against the commitment
6. Deposit USDY into the **YieldVault** from the Dashboard to earn aUSDY shares

---

## License

MIT

import { Link } from 'react-router-dom';
import { ArrowLeft, Download, ShieldCheck } from 'lucide-react';

export const Whitepaper = () => {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-bg-primary/80 backdrop-blur border-b border-border-subtle print:hidden">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm font-bold">
            <ArrowLeft size={16} /> Back
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-accent-blue rounded-[8px] flex items-center justify-center">
              <ShieldCheck className="text-white w-4 h-4" />
            </div>
            <span className="text-sm font-black tracking-tight font-heading">AEGIS</span>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border-subtle rounded-[10px] text-xs font-bold tracking-widest text-text-secondary hover:text-text-primary hover:border-accent-blue/40 transition-all"
          >
            <Download size={13} /> Download PDF
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-32 print:pt-8 print:pb-16">

        {/* Cover */}
        <div className="mb-20 print:mb-12">
          <img src="/AegisLogo.png" alt="Aegis Logo" className="w-32 h-32 mx-auto mb-8 block" />
          <p className="text-[10px] font-bold tracking-[0.3em] text-accent-blue mb-4">TECHNICAL WHITEPAPER · v1.0</p>
          <h1 className="text-5xl md:text-6xl font-black font-heading tracking-tight mb-6">
            Aegis Protocol
          </h1>
          <p className="text-xl text-text-secondary leading-relaxed max-w-2xl">
            A verifiable on-chain AI advisory system for yield portfolio management on Mantle — where every AI recommendation is cryptographically committed before any trade can execute.
          </p>
          <div className="mt-8 flex flex-wrap gap-6 text-[10px] font-bold tracking-widest text-text-muted">
            <span>MANTLE NETWORK</span>
            <span>·</span>
            <span>GROQ · LLAMA 3.3 70B</span>
            <span>·</span>
            <span>ERC-4626 VAULT</span>
            <span>·</span>
            <span>ON-CHAIN COMMITMENT ARCHITECTURE</span>
          </div>
        </div>

        <Divider />

        {/* Table of Contents */}
        <Section>
          <SectionTitle number="0" title="Table of Contents" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2 text-sm text-text-secondary">
            {[
              ['1', 'Abstract'],
              ['2', 'The Problem'],
              ['3', 'Solution Overview'],
              ['4', 'Architecture'],
              ['5', 'Commitment Architecture'],
              ['6', 'Risk Profile System'],
              ['7', 'AI Engine'],
              ['8', 'YieldVault'],
              ['9', 'Agent Identity & Reputation'],
              ['10', 'Execution Flow'],
              ['11', 'Security Model'],
              ['12', 'Supported Assets'],
              ['13', 'Roadmap'],
              ['14', 'Conclusion'],
            ].map(([n, t]) => (
              <div key={n} className="flex gap-3 py-1 border-b border-border-subtle/30">
                <span className="text-accent-blue font-mono text-[10px] w-5 shrink-0 mt-0.5">{n}.</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* 1. Abstract */}
        <Section>
          <SectionTitle number="1" title="Abstract" />
          <Body>
            Aegis is an on-chain AI portfolio advisory protocol built on Mantle. It reads a user's live USDY and mETH balances directly from the blockchain, fetches real-time yield rates, and feeds the complete picture into a large language model calibrated to the user's personal risk profile. The AI returns a structured, executable signal — <Mono>ROTATE</Mono>, <Mono>HOLD</Mono>, or <Mono>COMPOUND</Mono> — with a precise amount, entry condition, take-profit level, and stop-loss parameter.
          </Body>
          <Body>
            The defining property of Aegis is its commitment architecture: every AI recommendation is serialised, hashed with <Mono>keccak256</Mono>, and committed to the Mantle blockchain <em>before</em> any swap can execute. The <Mono>AutoRebalancer</Mono> contract enforces a strict precondition — a swap can only settle against a commitment that already exists on-chain. This creates a permanent, tamper-proof audit trail of every recommendation the AI has ever made, and makes it cryptographically impossible to execute a trade that was not preceded by a recorded AI signal.
          </Body>
        </Section>

        <Divider />

        {/* 2. The Problem */}
        <Section>
          <SectionTitle number="2" title="The Problem" />
          <Body>
            DeFi yield management is not passive. The optimal split between stable-yield assets (like USDY, backed by US Treasury Bills) and liquid staking tokens (like mETH, accruing Ethereum staking rewards) shifts continuously as interest rates change, ETH price moves, and market sentiment evolves.
          </Body>

          <SubTitle>2.1 Manual Rebalancing is Impractical</SubTitle>
          <Body>
            To rebalance correctly, a user must track live APYs from two different protocols, model the USD-equivalent return of each, account for their own risk tolerance, time the entry, and set exit conditions. Few users can do this consistently. Most either stay static (missing yield) or act on gut feeling (taking on unquantified risk).
          </Body>

          <SubTitle>2.2 Existing AI Trading Tools Are Black Boxes</SubTitle>
          <Body>
            Current AI advisory products share a fatal flaw: the AI decides, a bot executes, and the user has no way to verify what the AI actually knew when it made the decision, whether the recommendation was generated before or after the trade, or whether the execution matched the original intent. There is no accountability layer.
          </Body>

          {/* Problem diagram */}
          <div className="my-8 p-6 bg-bg-secondary rounded-[12px] border border-border-subtle font-mono text-[11px] text-text-secondary leading-relaxed">
            <p className="text-[9px] font-bold tracking-widest text-text-muted mb-4">FIGURE 1 — TRADITIONAL AI TRADING: ACCOUNTABILITY GAP</p>
            <div className="flex flex-col gap-1">
              <DiagramRow label="AI Model" content="generates signal ────────────────────────────────────→ ?" color="text-accent-warning" />
              <DiagramRow label="Execution Bot" content="executes trade ─────────────────────────────────────→ ?" color="text-accent-warning" />
              <DiagramRow label="Audit Trail" content="none ───────────────────────────────────────────────→ ✗" color="text-accent-danger" />
              <DiagramRow label="Verification" content="impossible ─────────────────────────────────────────→ ✗" color="text-accent-danger" />
            </div>
            <p className="mt-4 text-[10px] text-text-muted italic">No on-chain record. No way to prove what the AI knew or when it decided.</p>
          </div>

          <SubTitle>2.3 Risk is Not One-Size-Fits-All</SubTitle>
          <Body>
            Generic portfolio advice ignores the reality that different users have fundamentally different risk tolerances. A retiree with 90% of savings in USDY should never receive the same recommendation as an aggressive DeFi native with a 6-month horizon. Without a protocol-enforced risk layer, AI advice is dangerous at scale.
          </Body>
        </Section>

        <Divider />

        {/* 3. Solution Overview */}
        <Section>
          <SectionTitle number="3" title="Solution Overview" />
          <Body>
            Aegis addresses each problem directly with three interlocking systems: a <strong>commitment architecture</strong> that makes AI advice permanently auditable on-chain, a <strong>risk profile system</strong> that bounds all recommendations to user-defined constraints, and a <strong>YieldVault</strong> that gives users productive yield while they hold.
          </Body>

          {/* Three pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
            {[
              { n: '01', title: 'On-Chain Commitment', color: 'border-accent-blue/40 bg-accent-blue/5', nc: 'text-accent-blue', desc: 'Every AI recommendation is hashed and written to Mantle before any swap can execute. The trade is gated by the commitment.' },
              { n: '02', title: 'Risk-Gated Advice', color: 'border-accent-success/40 bg-accent-success/5', nc: 'text-accent-success', desc: 'Users set Conservative, Moderate, or Aggressive risk profiles stored on-chain. The AI is calibrated to these limits — it cannot recommend positions that violate them.' },
              { n: '03', title: 'Yield Vault', color: 'border-accent-warning/40 bg-accent-warning/5', nc: 'text-accent-warning', desc: 'An ERC-4626 vault accepts USDY deposits and issues aUSDY shares, accruing yield from Ondo Finance\'s T-bill exposure while assets are managed.' },
            ].map(p => (
              <div key={p.n} className={`p-5 rounded-[12px] border ${p.color}`}>
                <span className={`text-[10px] font-black tracking-widest ${p.nc} block mb-2`}>{p.n}</span>
                <p className="font-bold text-text-primary text-sm mb-2">{p.title}</p>
                <p className="text-xs text-text-secondary leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* 4. Architecture */}
        <Section>
          <SectionTitle number="4" title="Architecture" />
          <Body>
            Aegis is composed of four layers: the frontend interface, a server-side API proxy, the AI engine, and the on-chain contract suite on Mantle.
          </Body>

          {/* Architecture diagram */}
          <div className="my-8 p-6 bg-bg-secondary rounded-[12px] border border-border-subtle font-mono text-[11px] text-text-secondary">
            <p className="text-[9px] font-bold tracking-widest text-text-muted mb-6">FIGURE 2 — SYSTEM ARCHITECTURE</p>

            <ArchBlock title="FRONTEND LAYER" color="border-accent-blue/40">
              React · Vite · TypeScript · wagmi · viem · ConnectKit · Tailwind
              <br />
              <span className="text-text-muted">Dashboard · Strategy Builder · AI Insights · Landing · Whitepaper</span>
            </ArchBlock>
            <ArchArrow label="wagmi hooks / viem reads + writes" />

            <ArchBlock title="API PROXY LAYER  (Tencent Cloud SCF)" color="border-accent-warning/40">
              Node.js / Express — all AI and data API keys proxied server-side
              <br />
              <span className="text-text-muted">/api/groq-proxy · /api/yield-rates · /api/nansen (placeholder)</span>
            </ArchBlock>
            <ArchArrow label="server-side API calls" />

            <ArchBlock title="AI ENGINE LAYER  (current: Groq only)" color="border-accent-success/40">
              Groq LLM — llama-3.3-70b-versatile (all four roles below)
              <br />
              <span className="text-text-muted">① Yield Optimizer · ② Wallet Intelligence · ③ Social Sentiment · ④ Market Brief</span>
            </ArchBlock>
            <ArchArrow label="structured JSON recommendation" />

            <ArchBlock title="ON-CHAIN CONTRACT LAYER  (Mantle)" color="border-accent-blue/40">
              AegisAgent · UserRiskProfile · AdviceCommitment
              <br />
              AutoRebalancer · YieldVault · RiskPolicy · PositionIntent
            </ArchBlock>
          </div>

          <SubTitle>4.1 Contract Relationships</SubTitle>
          <div className="my-6 p-6 bg-bg-secondary rounded-[12px] border border-border-subtle font-mono text-[11px] text-text-secondary">
            <p className="text-[9px] font-bold tracking-widest text-text-muted mb-4">FIGURE 3 — CONTRACT DEPENDENCY GRAPH</p>
            <div className="space-y-1.5">
              <p><span className="text-accent-blue">AegisAgent</span> ──────────────────────── mints agent NFT per wallet</p>
              <p><span className="text-accent-blue">UserRiskProfile</span> ──────────────── stores risk mode + position limits</p>
              <p><span className="text-accent-success">AdviceCommitment</span> ─────────── records advice hash before execution</p>
              <p className="pl-6 text-text-muted">└── requires: AegisAgent ID + UserRiskProfile</p>
              <p><span className="text-accent-warning">AutoRebalancer</span> ──────────────── executes swap against commitment</p>
              <p className="pl-6 text-text-muted">└── requires: matching AdviceCommitment on-chain</p>
              <p className="pl-6 text-text-muted">└── reads: RiskPolicy for global limits</p>
              <p><span className="text-accent-success">YieldVault</span> ─────────────────────── ERC-4626 vault, issues aUSDY shares</p>
              <p><span className="text-text-muted">RiskPolicy</span> ──────────────────────── global position + concentration limits</p>
            </div>
          </div>
        </Section>

        <Divider />

        {/* 5. Commitment Architecture */}
        <Section>
          <SectionTitle number="5" title="Commitment Architecture" />
          <Body>
            The commitment architecture is the core innovation of Aegis. It applies the principle of double-entry bookkeeping to AI advice: a <em>debit entry</em> (the commitment) must be recorded before a <em>credit entry</em> (the execution) can occur.
          </Body>

          <SubTitle>5.1 How It Works</SubTitle>
          <div className="my-8 p-6 bg-bg-secondary rounded-[12px] border border-border-subtle font-mono text-[11px] text-text-secondary">
            <p className="text-[9px] font-bold tracking-widest text-text-muted mb-5">FIGURE 4 — COMMITMENT → EXECUTION FLOW</p>
            <div className="space-y-3">
              <FlowStep n="1" color="text-accent-blue" label="AI RECOMMENDATION" desc="Groq LLM returns structured JSON: signal, rationale, yield rates, confidence, risk score" />
              <FlowStep n="2" color="text-accent-blue" label="HASH COMPUTATION" desc="adviceHash = keccak256(JSON.stringify(recommendation)) · contextHash = keccak256(wallet + asset)" />
              <FlowStep n="3" color="text-accent-success" label="ON-CHAIN COMMITMENT" desc="AdviceCommitment.record(nonce, adviceHash, contextHash, portfolioValue, riskScore)" />
              <FlowStep n="4" color="text-accent-success" label="APPROVAL" desc="User approves fromAsset (USDY or mETH) for the AutoRebalancer contract" />
              <FlowStep n="5" color="text-accent-warning" label="EXECUTION" desc="AutoRebalancer.execute(nonce, adviceHash, fromAsset, toAsset, amountIn, amountOutMin, deadline)" />
              <FlowStep n="6" color="text-accent-warning" label="VERIFICATION" desc="Contract looks up commitment by nonce + authority. Reverts if adviceHash does not match." />
              <FlowStep n="7" color="text-accent-success" label="SETTLEMENT" desc="Swap executes via MerchantMoe router. Commitment marked executed = true." />
            </div>
          </div>

          <SubTitle>5.2 The Two Hashes</SubTitle>
          <Body>
            Two separate hashes are committed for each recommendation:
          </Body>
          <div className="my-4 space-y-3">
            <HashCard
              label="adviceHash"
              color="border-accent-blue/40 bg-accent-blue/5"
              desc="keccak256 of the full AI output — signal type, confidence score, rationale text, suggested allocation shift, entry condition, take-profit and stop-loss levels."
              purpose="Proves the AI's recommendation was not modified between commitment and execution."
            />
            <HashCard
              label="contextHash"
              color="border-accent-success/40 bg-accent-success/5"
              desc="keccak256 of the decision context — wallet address, source asset, block timestamp."
              purpose="Proves the recommendation was made for this specific wallet at this specific time."
            />
          </div>

          <SubTitle>5.3 Why This Matters</SubTitle>
          <Body>
            Without the commitment gate, an attacker (or a rogue bot) could submit a swap to <Mono>AutoRebalancer</Mono> with any <Mono>adviceHash</Mono> — fabricating a post-hoc "AI recommendation" to justify the trade. The commitment architecture makes this impossible: the hash must already exist on-chain before the execution call is processed. The AI can never be blamed for a trade it did not actually recommend.
          </Body>
        </Section>

        <Divider />

        {/* 6. Risk Profile */}
        <Section>
          <SectionTitle number="6" title="Risk Profile System" />
          <Body>
            Before receiving any AI advice, every user configures a risk profile stored in the <Mono>UserRiskProfile</Mono> contract. This profile bounds all future recommendations — the AI is calibrated to it, and the contract enforces it at the protocol level.
          </Body>

          <div className="my-8 overflow-x-auto">
            <p className="text-[9px] font-bold tracking-widest text-text-muted mb-4">FIGURE 5 — RISK PROFILE PARAMETERS</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left py-2 pr-6 text-[10px] font-bold tracking-widest text-text-muted">Mode</th>
                  <th className="text-left py-2 pr-6 text-[10px] font-bold tracking-widest text-text-muted">Max Position</th>
                  <th className="text-left py-2 pr-6 text-[10px] font-bold tracking-widest text-text-muted">Max Concentration</th>
                  <th className="text-left py-2 text-[10px] font-bold tracking-widest text-text-muted">AI Bias</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Conservative', '≤ 20%', '≤ 60%', 'Prefer USDY (stable yield, low volatility)'],
                  ['Moderate', '≤ 40%', '≤ 75%', 'Balanced exposure, data-driven rotations'],
                  ['Aggressive', '≤ 80%', '≤ 90%', 'Maximise return, willing to chase mETH upside'],
                ].map(([m, mp, mc, b]) => (
                  <tr key={m} className="border-b border-border-subtle/30 text-text-secondary">
                    <td className="py-3 pr-6 font-bold text-text-primary">{m}</td>
                    <td className="py-3 pr-6 font-mono">{mp}</td>
                    <td className="py-3 pr-6 font-mono">{mc}</td>
                    <td className="py-3 text-xs">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Body>
            <Mono>maxPositionBps</Mono> limits how large a single trade can be as a percentage of total portfolio value. <Mono>maxConcentrationBps</Mono> limits how concentrated the portfolio can become in any single asset. These are stored as basis points (BPS) on-chain — 10,000 BPS = 100%.
          </Body>

          <SubTitle>6.2 Typical Portfolio Allocation by Risk Mode</SubTitle>
          <Body>
            The chart below shows representative USDY / mETH target allocations the AI tends to recommend for each risk mode, given similar market conditions.
          </Body>

          <div className="my-6">
            <p className="text-[9px] font-bold tracking-widest text-text-muted mb-6">FIGURE 5b — REPRESENTATIVE ALLOCATION BY RISK MODE</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { label: 'Conservative', usdy: 80, meth: 20, usdyColor: '#2F6FED', methColor: '#22c55e' },
                { label: 'Moderate', usdy: 60, meth: 40, usdyColor: '#2F6FED', methColor: '#22c55e' },
                { label: 'Aggressive', usdy: 30, meth: 70, usdyColor: '#2F6FED', methColor: '#22c55e' },
              ].map(mode => (
                <div key={mode.label} className="flex flex-col items-center gap-4">
                  <PieChart
                    slices={[
                      { value: mode.usdy, color: mode.usdyColor, label: 'USDY' },
                      { value: mode.meth, color: mode.methColor, label: 'mETH' },
                    ]}
                    size={130}
                  />
                  <div className="text-center">
                    <p className="font-bold text-sm text-text-primary mb-2">{mode.label}</p>
                    <div className="flex gap-4 justify-center text-[10px] font-bold tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-accent-blue inline-block" />
                        USDY {mode.usdy}%
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-accent-success inline-block" />
                        mETH {mode.meth}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Divider />

        {/* 7. AI Engine */}
        <Section>
          <SectionTitle number="7" title="AI Engine" />

          <SubTitle>7.1 Current Model</SubTitle>
          <Body>
            Aegis currently uses a single model — <strong>Groq's Llama 3.3 70B Versatile</strong> — for all AI inference. It is accessed via a server-side proxy on Tencent Cloud SCF, so no API keys are ever exposed on the client. All AI calls route through <Mono>/api/groq-proxy</Mono>.
          </Body>
          <Body>
            Groq was chosen for its inference speed (typically under 500ms for 70B parameter responses) — fast enough to feel responsive in a browser UI while running a genuinely capable reasoning model.
          </Body>

          <SubTitle>7.2 The Four Roles Groq Handles</SubTitle>
          <Body>
            Groq runs four distinct inference tasks, each with a separate system prompt calibrated to that role:
          </Body>

          <div className="my-6 space-y-3">
            {[
              {
                n: '①', color: 'border-accent-blue/40 bg-accent-blue/5', nc: 'text-accent-blue',
                role: 'Yield Optimizer', future: null,
                desc: 'The core signal engine. Takes live APY data, wallet balances, risk profile, target allocation, and smart money signals, then returns a structured ROTATE / HOLD / COMPOUND recommendation with exact token amounts, entry condition, take-profit and stop-loss levels.',
              },
              {
                n: '②', color: 'border-accent-success/40 bg-accent-success/5', nc: 'text-accent-success',
                role: 'Wallet Intelligence', future: 'Nansen (Phase 2)',
                desc: 'Simulates on-chain wallet profiling. Analyses the wallet address and returns behavioral labels (smart_money, dex_trader, rwa_holder, whale, institutional), a 30-day net flow estimate, and a risk modifier that the Yield Optimizer uses to calibrate its signal. In Phase 2, this role will be handled by the real Nansen API for live on-chain data.',
              },
              {
                n: '③', color: 'border-accent-warning/40 bg-accent-warning/5', nc: 'text-accent-warning',
                role: 'Social Sentiment', future: 'Elfa AI (Phase 2)',
                desc: 'Scans crypto Twitter (X), Farcaster, and crypto media narratives to produce a sentiment score for USDY and mETH individually (-1.0 bearish → +1.0 bullish). Returns the dominant narrative signals being discussed. In Phase 2, this role will be replaced by Elfa AI\'s real-time social intelligence API for live social data.',
              },
              {
                n: '④', color: 'border-border-subtle bg-bg-secondary', nc: 'text-text-secondary',
                role: 'Market Brief', future: null,
                desc: 'Synthesises all three data sources (yield rates, wallet intelligence, social sentiment) into a plain-English market brief displayed on the Insights page. Covers market sentiment, yield outlook, personalised portfolio observations, and recommended action items.',
              },
            ].map(r => (
              <div key={r.n} className={`p-5 rounded-[12px] border ${r.color}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-lg font-black ${r.nc}`}>{r.n}</span>
                  <span className="font-bold text-text-primary text-sm">{r.role}</span>
                  {r.future && (
                    <span className="ml-auto text-[9px] font-bold tracking-widest text-text-muted border border-border-subtle rounded-full px-2 py-0.5">
                      → {r.future}
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>

          <SubTitle>7.3 Input Data (Yield Optimizer)</SubTitle>
          <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'USDY Balance', src: 'On-chain read — USDY ERC-20 contract' },
              { label: 'mETH Balance', src: 'On-chain read — mETH ERC-20 contract' },
              { label: 'USDY APY', src: 'Ondo Finance yield endpoint' },
              { label: 'mETH APY', src: 'Mantle staking endpoint' },
              { label: 'Risk Mode', src: 'UserRiskProfile.profiles(address)' },
              { label: 'Position Limit', src: 'UserRiskProfile.maxPositionBps' },
              { label: 'Target Allocation', src: 'User-set slider (USDY %)' },
              { label: 'Agent ID', src: 'AegisAgent.walletToAgentId(address)' },
              { label: 'Smart Money Score', src: 'Wallet Intelligence role (Groq ②)' },
              { label: 'Social Sentiment', src: 'Social Sentiment role (Groq ③)' },
            ].map(d => (
              <div key={d.label} className="p-3 bg-bg-secondary rounded-[8px] border border-border-subtle flex gap-3">
                <span className="text-[9px] font-black tracking-widest text-accent-blue w-28 shrink-0 mt-0.5">{d.label}</span>
                <span className="text-xs text-text-muted">{d.src}</span>
              </div>
            ))}
          </div>

          <SubTitle>7.4 Recommendation Output Schema</SubTitle>
          <CodeBlock>{`{
  signal:              "ROTATE" | "HOLD" | "COMPOUND"
  signal_strength:     "STRONG" | "MODERATE" | "WEAK"
  confidence:          0–100
  from_asset:          "USDY" | "mETH"
  to_asset:            "mETH" | "USDY"
  suggested_pct_shift: number     // % of from_asset balance to move
  suggested_amount:    string     // computed token amount (e.g. "312.50 USDY")
  action_detail:       string     // precise instruction with real APY numbers
  entry_condition:     string     // when to act — cites current yield spread
  take_profit:         string     // APY threshold to exit (specific numbers)
  stop_loss:           string     // APY level that invalidates the trade
  summary:             string     // 2-3 sentence rationale citing live data
  risk_note:           string     // optional caution specific to risk mode
}`}</CodeBlock>

          <SubTitle>7.5 Signal Types</SubTitle>
          <div className="my-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { s: 'ROTATE', c: 'text-accent-warning border-accent-warning/40 bg-accent-warning/5', d: 'Move a portion of portfolio from one asset to the other. APY differential or sentiment shift justifies a rebalance.' },
              { s: 'HOLD', c: 'text-accent-blue border-accent-blue/40 bg-accent-blue/5', d: 'Current allocation is optimal. No trade needed — sit tight and collect yield.' },
              { s: 'COMPOUND', c: 'text-accent-success border-accent-success/40 bg-accent-success/5', d: 'Reinvest accrued yield into the higher-returning asset to accelerate compounding.' },
            ].map(sig => (
              <div key={sig.s} className={`p-4 rounded-[10px] border ${sig.c}`}>
                <p className={`text-[11px] font-black tracking-widest mb-2 ${sig.c.split(' ')[0]}`}>{sig.s}</p>
                <p className="text-xs text-text-secondary leading-relaxed">{sig.d}</p>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* 8. YieldVault */}
        <Section>
          <SectionTitle number="8" title="YieldVault" />
          <Body>
            The <Mono>YieldVault</Mono> is an ERC-4626 compliant yield vault. Users deposit USDY and receive <Mono>aUSDY</Mono> — vault shares that appreciate over time as the underlying USDY generates T-bill yield from Ondo Finance.
          </Body>

          <div className="my-8 p-6 bg-bg-secondary rounded-[12px] border border-border-subtle font-mono text-[11px] text-text-secondary">
            <p className="text-[9px] font-bold tracking-widest text-text-muted mb-5">FIGURE 6 — VAULT DEPOSIT / WITHDRAW FLOW</p>
            <div className="space-y-2">
              <p><span className="text-accent-success">DEPOSIT:</span>  User → approve USDY for vault → deposit(assets, receiver) → receive aUSDY shares</p>
              <p><span className="text-text-muted pl-12">aUSDY amount = assets × (totalShares / totalAssets)</span></p>
              <p className="mt-3"><span className="text-accent-warning">WITHDRAW:</span> User → withdraw(assets, receiver, owner) → burn aUSDY → receive USDY + yield</p>
              <p><span className="text-text-muted pl-12">USDY amount = shares × (totalAssets / totalShares)  [always ≥ deposited]</span></p>
            </div>
            <div className="mt-5 pt-4 border-t border-border-subtle/30">
              <p className="text-text-muted">convertToAssets(shares) — read how much USDY your aUSDY is worth at any time</p>
            </div>
          </div>

          <Body>
            The vault tracks <Mono>totalAssets()</Mono> — the sum of all deposited USDY plus accrued yield. As yield accrues, each aUSDY share becomes redeemable for more USDY than it was issued for, without the holder needing to do anything.
          </Body>
        </Section>

        <Divider />

        {/* 9. Agent Identity */}
        <Section>
          <SectionTitle number="9" title="Agent Identity & Reputation" />
          <Body>
            Every wallet that registers with Aegis is issued a unique <strong>Agent NFT</strong> via the <Mono>AegisAgent</Mono> contract. This NFT is a non-transferable, on-chain identity that accumulates a permanent record of every commitment made and every execution settled.
          </Body>

          <SubTitle>9.1 Agent Stats</SubTitle>
          <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Commitments', desc: 'Total number of AI recommendations committed on-chain. Each represents a decision point — the AI gave a signal, the user chose to record it.' },
              { label: 'Executions', desc: 'Total number of swaps settled against a commitment. Ratio of Executions / Commitments shows how often a user acts on AI advice.' },
            ].map(s => (
              <div key={s.label} className="p-5 bg-bg-secondary rounded-[12px] border border-border-subtle">
                <p className="text-[10px] font-black tracking-widest text-accent-blue mb-2">{s.label.toUpperCase()}</p>
                <p className="text-xs text-text-secondary leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <SubTitle>9.2 Reputation Layer</SubTitle>
          <Body>
            Over time, an Agent accumulates a verifiable track record on Mantle. An agent with 500 commitments and 490 executions carries fundamentally different trust weight than one with zero history. This on-chain reputation is the foundation for future cross-protocol agent trust systems — where other DeFi protocols can read an agent's commitment history and adjust terms, fees, or access accordingly.
          </Body>
        </Section>

        <Divider />

        {/* 10. Execution Flow */}
        <Section>
          <SectionTitle number="10" title="Full Execution Flow" />
          <Body>
            The complete end-to-end user journey from wallet connection to settled swap:
          </Body>
          <div className="my-8 p-6 bg-bg-secondary rounded-[12px] border border-border-subtle">
            <p className="text-[9px] font-bold tracking-widest text-text-muted mb-6">FIGURE 7 — END-TO-END USER FLOW</p>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border-subtle" />
              <div className="space-y-6 pl-10">
                {[
                  { n: '01', c: 'bg-accent-blue', label: 'Connect Wallet', detail: 'ConnectKit — Mantle Sepolia. Wallet address used to read on-chain state.' },
                  { n: '02', c: 'bg-accent-blue', label: 'Mint Test Tokens', detail: 'Testnet faucet: mint 1,000 USDY and/or 1,000 mETH to your wallet.' },
                  { n: '03', c: 'bg-accent-blue', label: 'Set Risk Profile', detail: 'Choose Conservative / Moderate / Aggressive. Stored in UserRiskProfile contract.' },
                  { n: '04', c: 'bg-accent-success', label: 'Request AI Signal', detail: 'Frontend reads your balances + live APYs, sends to Groq LLM via proxy.' },
                  { n: '05', c: 'bg-accent-success', label: 'Review Recommendation', detail: 'Signal (ROTATE / HOLD / COMPOUND), confidence %, action detail, entry/TP/SL.' },
                  { n: '06', c: 'bg-accent-warning', label: 'Commit Strategy', detail: 'adviceHash + contextHash written to AdviceCommitment contract on Mantle.' },
                  { n: '07', c: 'bg-accent-warning', label: 'Approve Token', detail: 'ERC-20 approve() — sourceAsset authorised for AutoRebalancer contract.' },
                  { n: '08', c: 'bg-accent-warning', label: 'Execute Swap', detail: 'AutoRebalancer.execute() — verifies commitment, swaps via MerchantMoe router.' },
                  { n: '09', c: 'bg-accent-success', label: 'Settlement', detail: 'Commitment marked executed = true. Agent stats updated. Balances refresh.' },
                ].map(step => (
                  <div key={step.n} className="relative flex items-start gap-4">
                    <div className={`absolute -left-[2.35rem] w-5 h-5 ${step.c} rounded-full flex items-center justify-center text-[8px] font-black text-bg-primary shrink-0`}>
                      {step.n}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-text-primary">{step.label}</p>
                      <p className="text-xs text-text-muted mt-0.5">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Divider />

        {/* 11. Security Model */}
        <Section>
          <SectionTitle number="11" title="Security Model" />

          <div className="my-6 space-y-4">
            {[
              { t: 'Commitment Gate', d: 'AutoRebalancer.execute() reverts unless a matching commitment (same nonce + authority + adviceHash) exists. A rogue execution without a prior commitment is architecturally impossible.' },
              { t: 'No Client-Side Keys', d: 'All AI and data API keys are stored on the server-side proxy. The frontend never holds a secret. Compromising the client does not expose any backend credentials.' },
              { t: 'Hash Integrity', d: 'keccak256 is collision-resistant. It is computationally infeasible to forge an adviceHash that matches a commitment without having the original AI output.' },
              { t: 'Risk Policy Enforcement', d: 'The RiskPolicy contract defines global limits (maxPositionBps, maxConcentrationBps). Individual risk profiles are further constrained by these global limits. The AI is calibrated to both.' },
              { t: 'Replay Protection', d: 'Each commitment uses a nonce derived from the current timestamp. Replaying the same commitment in the same block is rejected by the contract.' },
              { t: 'Slippage Guard', d: 'AutoRebalancer.execute() accepts an amountOutMin parameter. Swaps that exceed slippage tolerance revert before settlement.' },
            ].map(s => (
              <div key={s.t} className="p-4 bg-bg-secondary rounded-[10px] border border-border-subtle flex gap-4">
                <ShieldCheck size={16} className="text-accent-success shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-text-primary mb-1">{s.t}</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* 12. Supported Assets */}
        <Section>
          <SectionTitle number="12" title="Supported Assets" />

          <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-bg-secondary rounded-[12px] border border-border-subtle">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-bg-primary rounded-[10px] border border-border-subtle flex items-center justify-center font-black text-accent-blue">U</div>
                <div>
                  <p className="font-bold text-text-primary">USDY</p>
                  <p className="text-[10px] text-text-muted tracking-widest">Ondo Finance</p>
                </div>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">US Dollar Yield token backed by short-duration US Treasury Bills and bank demand deposits. Generates ~5% APY from real-world US government debt instruments. ERC-20 on Mantle.</p>
              <div className="flex justify-between text-[10px] font-bold tracking-widest">
                <span className="text-text-muted">Risk Profile</span><span className="text-accent-success">Low</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold tracking-widest mt-1">
                <span className="text-text-muted">Yield Source</span><span className="text-text-secondary">US T-Bills</span>
              </div>
            </div>

            <div className="p-6 bg-bg-secondary rounded-[12px] border border-border-subtle">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-bg-primary rounded-[10px] border border-border-subtle flex items-center justify-center font-black text-accent-success">M</div>
                <div>
                  <p className="font-bold text-text-primary">mETH</p>
                  <p className="text-[10px] text-text-muted tracking-widest">Mantle Staked ETH</p>
                </div>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">Liquid staking token for Ethereum, issued by the Mantle protocol. Accrues Ethereum proof-of-stake staking rewards (~3-4% APY) while remaining tradeable. Carries ETH price exposure.</p>
              <div className="flex justify-between text-[10px] font-bold tracking-widest">
                <span className="text-text-muted">Risk Profile</span><span className="text-accent-warning">Moderate</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold tracking-widest mt-1">
                <span className="text-text-muted">Yield Source</span><span className="text-text-secondary">ETH Staking</span>
              </div>
            </div>
          </div>

          <Body>
            The USDY/mETH pair was chosen deliberately. They represent opposite ends of the yield-risk spectrum — USDY is a stable real-world asset, mETH is a volatile crypto yield instrument. Together they create a portfolio where the AI can make meaningful rebalancing decisions based on changing APY differentials and market conditions.
          </Body>
        </Section>

        <Divider />

        {/* 13. Roadmap */}
        <Section>
          <SectionTitle number="13" title="Roadmap" />
          <div className="my-6 space-y-4">
            {/* Phase 1 */}
            <div className="p-5 rounded-[12px] border text-accent-success border-accent-success/40 bg-accent-success/5">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-bold text-text-primary">Phase 1</span>
                <span className="text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full border text-accent-success border-accent-success/40">LIVE</span>
              </div>
              <ul className="space-y-1">
                {[
                  'Core commitment architecture (AdviceCommitment + AutoRebalancer)',
                  'AI portfolio advisor — ROTATE / HOLD / COMPOUND signals',
                  'Risk profile system (Conservative / Moderate / Aggressive)',
                  'YieldVault — ERC-4626 compliant, issues aUSDY shares',
                  'Agent identity NFT with on-chain commitment + execution history',
                  'Groq (Llama 3.3 70B) handling all four AI roles (yield, wallet, sentiment, brief)',
                ].map(item => (
                  <li key={item} className="text-xs text-text-secondary flex gap-2">
                    <span className="text-text-muted mt-0.5">·</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Phase 2 — AI integrations */}
            <div className="p-5 rounded-[12px] border text-accent-blue border-accent-blue/40 bg-accent-blue/5">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-bold text-text-primary">Phase 2</span>
                <span className="text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full border text-accent-blue border-accent-blue/40">PLANNED</span>
              </div>
              <p className="text-[10px] font-bold tracking-widest text-text-muted mb-3">AI INTEGRATIONS</p>
              <div className="space-y-3 mb-4">
                {[
                  {
                    label: 'Nansen',
                    role: 'Wallet Intelligence (replaces Groq ②)',
                    desc: 'Real-time on-chain wallet profiling — smart money labels, net flow data, institutional vs retail classification, protocol-specific holder analysis. Currently simulated by Groq. Nansen\'s live API will provide ground-truth on-chain data rather than LLM inference.',
                    c: 'border-accent-blue/30',
                  },
                  {
                    label: 'Elfa AI',
                    role: 'Social Sentiment (replaces Groq ③)',
                    desc: 'Real-time crypto social intelligence — live scanning of crypto Twitter (X), Farcaster, Telegram, and Discord for mention volume, sentiment scores, and narrative momentum. Currently simulated by Groq. Elfa\'s live API will replace LLM-generated sentiment with actual social data.',
                    c: 'border-accent-warning/30',
                  },
                  {
                    label: 'ElevenLabs',
                    role: 'Voice Briefings (new capability)',
                    desc: 'Text-to-speech conversion of the AI market brief — users will be able to listen to their daily portfolio briefing as a natural voice audio clip directly in the app. The market brief (Groq ④) output will be passed to ElevenLabs for high-quality voice synthesis.',
                    c: 'border-accent-success/30',
                  },
                ].map(ai => (
                  <div key={ai.label} className={`p-4 bg-bg-primary/60 rounded-[10px] border ${ai.c}`}>
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <span className="font-bold text-text-primary text-sm">{ai.label}</span>
                      <span className="text-[9px] font-bold tracking-widest text-text-muted">— {ai.role}</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">{ai.desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-bold tracking-widest text-text-muted mb-2">PROTOCOL</p>
              <ul className="space-y-1">
                {[
                  'Multi-asset support (expand beyond USDY/mETH)',
                  'Automated commitment scheduling (AI-triggered without manual UI interaction)',
                  'Cross-protocol agent reputation API',
                  'Historical performance analytics dashboard',
                ].map(item => (
                  <li key={item} className="text-xs text-text-secondary flex gap-2">
                    <span className="text-text-muted mt-0.5">·</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Phase 3 */}
            <div className="p-5 rounded-[12px] border text-text-muted border-border-subtle bg-bg-secondary">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-bold text-text-primary">Phase 3</span>
                <span className="text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full border text-text-muted border-border-subtle">RESEARCH</span>
              </div>
              <ul className="space-y-1">
                {[
                  'Institutional access layer (whitelist-gated vaults with KYC integration)',
                  'Agent-to-agent advisory market (agents advising other agents)',
                  'Governance token for protocol parameter voting',
                  'Mainnet deployment (Mantle mainnet)',
                ].map(item => (
                  <li key={item} className="text-xs text-text-secondary flex gap-2">
                    <span className="text-text-muted mt-0.5">·</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Divider />

        {/* 14. Conclusion */}
        <Section>
          <SectionTitle number="14" title="Conclusion" />
          <Body>
            Aegis represents a new class of DeFi protocol — one where AI advisory and on-chain execution are not merely adjacent but cryptographically coupled. The commitment architecture ensures that every trade has a verifiable, tamper-proof AI recommendation on record. The risk profile system ensures that advice is never generic. The YieldVault ensures that capital is productive at all times.
          </Body>
          <Body>
            Together these components address the three core failures of existing AI trading tools: the black-box problem, the accountability gap, and the one-size-fits-all risk model. Aegis does not ask users to trust the AI. It gives them the tools to verify it.
          </Body>

          <div className="mt-10 p-6 bg-accent-blue/5 border border-accent-blue/20 rounded-[12px]">
            <p className="text-[10px] font-bold tracking-widest text-accent-blue mb-2">GET STARTED</p>
            <p className="text-sm text-text-secondary mb-4">Launch the app, connect your wallet, and receive your first on-chain AI recommendation in under 2 minutes.</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-blue text-white rounded-[10px] text-xs font-bold tracking-widest hover:bg-accent-blue/90 transition-colors"
            >
              Launch Aegis
            </Link>
          </div>
        </Section>

        <Divider />

        {/* Footer */}
        <div className="text-center text-[10px] text-text-muted tracking-widest space-y-1">
          <p>AEGIS PROTOCOL · WHITEPAPER v1.0 · MANTLE NETWORK</p>
          <p>This document is for informational purposes. Aegis is deployed on testnet. Not financial advice.</p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white !important; color: black !important; }
          @page { margin: 2cm; }
        }
      `}</style>
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const Divider = () => <hr className="border-border-subtle my-16 print:my-8" />;

const Section = ({ children }: { children: React.ReactNode }) => (
  <section className="mb-12">{children}</section>
);

const SectionTitle = ({ number, title }: { number: string; title: string }) => (
  <div className="flex items-baseline gap-4 mb-6">
    <span className="text-[10px] font-black tracking-widest text-accent-blue font-mono w-6 shrink-0">{number}.</span>
    <h2 className="text-2xl font-bold font-heading tracking-tight text-text-primary">{title}</h2>
  </div>
);

const SubTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-bold tracking-widest text-text-primary mt-8 mb-3">{children}</h3>
);

const Body = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-text-secondary leading-relaxed mb-4">{children}</p>
);

const Mono = ({ children }: { children: React.ReactNode }) => (
  <code className="font-mono text-accent-blue text-[0.85em] bg-accent-blue/5 px-1 py-0.5 rounded">{children}</code>
);

const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <pre className="my-4 p-4 bg-bg-secondary border border-border-subtle rounded-[10px] font-mono text-[11px] text-text-secondary overflow-x-auto leading-relaxed">{children}</pre>
);

const DiagramRow = ({ label, content, color }: { label: string; content: string; color: string }) => (
  <p>
    <span className="text-text-muted w-28 inline-block">{label}</span>
    <span className={color}>{content}</span>
  </p>
);

const ArchBlock = ({ title, color, children }: { title: string; color: string; children: React.ReactNode }) => (
  <div className={`border ${color} rounded-[8px] p-3 mb-1`}>
    <p className="text-[9px] font-black tracking-widest text-text-muted mb-1">{title}</p>
    <p>{children}</p>
  </div>
);

const ArchArrow = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center my-1">
    <div className="w-px h-4 bg-border-subtle" />
    <span className="text-[9px] text-text-muted">{label}</span>
    <div className="w-px h-4 bg-border-subtle" />
  </div>
);

const FlowStep = ({ n, color, label, desc }: { n: string; color: string; label: string; desc: string }) => (
  <div className="flex gap-3 items-start">
    <span className={`${color} font-black w-4 shrink-0`}>{n}.</span>
    <div>
      <span className={`${color} font-bold`}>{label}</span>
      <span className="text-text-muted"> — {desc}</span>
    </div>
  </div>
);

const HashCard = ({ label, color, desc, purpose }: { label: string; color: string; desc: string; purpose: string }) => (
  <div className={`p-4 rounded-[10px] border ${color}`}>
    <p className="font-mono text-[11px] font-black text-accent-blue mb-2">{label}</p>
    <p className="text-xs text-text-secondary mb-2">{desc}</p>
    <p className="text-[10px] text-text-muted italic">{purpose}</p>
  </div>
);

const PieChart = ({ slices, size = 120 }: {
  slices: { value: number; color: string; label: string }[];
  size?: number;
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;
  const total = slices.reduce((sum, s) => sum + s.value, 0);

  let currentAngle = -Math.PI / 2; // start at 12 o'clock
  const paths = slices.map(slice => {
    const sliceAngle = (slice.value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    return { d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2}Z`, color: slice.color };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.color} stroke="#0d0d14" strokeWidth="2" />
      ))}
    </svg>
  );
};

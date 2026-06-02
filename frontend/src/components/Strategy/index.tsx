import { useState, useEffect, useRef } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import {
  Bot,
  ShieldCheck,
  ArrowRightLeft,
  ChevronRight,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { keccak256, toHex, parseUnits, formatUnits as viemFormatUnits } from 'viem';
import {
  CONTRACT_ADDRESSES,
  EXTERNAL_ADDRESSES,
  USER_RISK_PROFILE_ABI,
  ADVICE_COMMITMENT_ABI,
  AUTO_REBALANCER_ABI,
  AEGIS_AGENT_ABI,
  ERC20_ABI,
} from '../../lib/contracts';
import { fetchAIRecommendation, fetchYieldRates, type AIRecommendation } from '../../services/ai';
import { Card } from '../Shared/Card';
import { Badge } from '../Shared/Badge';
import { cn } from '../../lib/utils';

// Mock tokens on testnet — treat both as $1 to avoid misleading portfolio values
const METH_USD_PRICE = 1;

export const Strategy = () => {
  const { address } = useAccount();

  const [usdyWeight, setUsdyWeight] = useState(60);
  const [sourceAsset, setSourceAsset] = useState<'USDY' | 'mETH'>('USDY');
  const [swapAmount, setSwapAmount] = useState('');
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [executionStep, setExecutionStep] = useState<'idle' | 'fetching' | 'committing' | 'approving' | 'executing'>('idle');
  const [livePrice, setLivePrice] = useState<{ usdy: number; meth: number } | null>(null);
  const [savedNonce, setSavedNonce] = useState<bigint | null>(null);
  const [savedAdviceHash, setSavedAdviceHash] = useState<`0x${string}` | null>(null);
  const fetchInitiated = useRef(false);

  // Fetch live prices once on mount
  useEffect(() => {
    fetchYieldRates()
      .then(r => setLivePrice(r.prices))
      .catch(() => setLivePrice({ usdy: 1.00, meth: 3200 }));
  }, []);

  const { writeContract: writeCommitment, data: commitHash } = useWriteContract();
  const { isLoading: isCommitWaiting, isSuccess: isCommitConfirmed } = useWaitForTransactionReceipt({ hash: commitHash });

  const { writeContract: writeApprove, data: approveHash, isPending: isApprovePending } = useWriteContract();
  const { isLoading: isApproveWaiting, isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash });

  const { writeContract: writeExecute, data: executeHash, isPending: isExecutePending } = useWriteContract();
  const { isLoading: isExecuteWaiting, isSuccess: isExecuteConfirmed } = useWaitForTransactionReceipt({ hash: executeHash });

  const fromAssetAddress = (sourceAsset === 'USDY' ? EXTERNAL_ADDRESSES.USDY : EXTERNAL_ADDRESSES.mETH) as `0x${string}`;
  const toAssetAddress = (sourceAsset === 'USDY' ? EXTERNAL_ADDRESSES.mETH : EXTERNAL_ADDRESSES.USDY) as `0x${string}`;

  const { data: rebalancerAllowance, refetch: refetchRebalancerAllowance } = useReadContract({
    address: fromAssetAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACT_ADDRESSES.AutoRebalancer] : undefined,
  });

  useEffect(() => {
    if (isCommitConfirmed) setExecutionStep('idle');
  }, [isCommitConfirmed]);

  useEffect(() => {
    if (isApproveConfirmed) { void refetchRebalancerAllowance(); setExecutionStep('idle'); }
  }, [isApproveConfirmed]);

  useEffect(() => {
    if (isExecuteConfirmed) { setSavedNonce(null); setSavedAdviceHash(null); setExecutionStep('idle'); }
  }, [isExecuteConfirmed]);

  // ── On-chain reads ────────────────────────────────────────────────────────

  const { data: userProfile } = useReadContract({
    address: CONTRACT_ADDRESSES.UserRiskProfile,
    abi: USER_RISK_PROFILE_ABI,
    functionName: 'profiles',
    args: address ? [address] : undefined,
  });

  const { data: agentId } = useReadContract({
    address: CONTRACT_ADDRESSES.AegisAgent,
    abi: AEGIS_AGENT_ABI,
    functionName: 'walletToAgentId',
    args: address ? [address] : undefined,
  });

  const { data: usdyRaw } = useReadContract({
    address: EXTERNAL_ADDRESSES.USDY as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: methRaw } = useReadContract({
    address: EXTERNAL_ADDRESSES.mETH as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // ── Derived values (must come before swap quote to avoid TDZ crash) ────────

  const usdyBalance = usdyRaw ? Number(viemFormatUnits(usdyRaw as bigint, 18)) : 0;
  const methBalance = methRaw ? Number(viemFormatUnits(methRaw as bigint, 18)) : 0;
  const portfolioValueUsd = usdyBalance * 1 + methBalance * METH_USD_PRICE;
  const targetAsset = sourceAsset === 'USDY' ? 'mETH' : 'USDY';
  const sourceBalance = sourceAsset === 'USDY' ? usdyBalance : methBalance;

  // ── Swap quote ────────────────────────────────────────────────────────────

  // Safely parse the user's amount input — parseUnits throws on invalid strings
  const swapAmountBigInt = (() => {
    try {
      const n = Number(swapAmount);
      if (!swapAmount || n <= 0 || !isFinite(n)) return undefined;
      return parseUnits(String(n), 18);
    } catch {
      return undefined;
    }
  })();

  // Apply live CoinGecko prices to compute a market-rate estimate.
  // The testnet mock router executes 1:1 on-chain, but the UI shows real-world
  // equivalent amounts so the demo reflects actual market dynamics.
  const estimatedOut: bigint | undefined = (() => {
    if (!swapAmountBigInt) return undefined;
    if (!livePrice) return swapAmountBigInt; // prices still loading — show 1:1 temporarily
    const inputAmt = Number(viemFormatUnits(swapAmountBigInt, 18));
    const srcPrice  = sourceAsset === 'USDY' ? livePrice.usdy : livePrice.meth;
    const destPrice = targetAsset === 'USDY' ? livePrice.usdy : livePrice.meth;
    const outputAmt = (inputAmt * srcPrice) / destPrice;
    try {
      return parseUnits(outputAmt.toFixed(8), 18);
    } catch {
      return swapAmountBigInt;
    }
  })();

  // ── AI fetch ──────────────────────────────────────────────────────────────

  const runAIFetch = () => {
    if (!address || !userProfile) return;
    const [, riskMode, maxPositionBps, , createdAt] = userProfile as unknown as any[];
    if (!createdAt) return;

    fetchInitiated.current = true;
    setExecutionStep('fetching');
    fetchAIRecommendation(address, {
      portfolioValueUsd,
      riskMode: riskMode as 0 | 1 | 2,
      maxPositionBps: Number(maxPositionBps),
      usdyBalance,
      methBalance,
      agentId: Number(agentId ?? 0),
      targetUsdyAllocationPct: usdyWeight,
    })
      .then(res => {
        setRecommendation(res);
        setExecutionStep('idle');
      })
      .catch(err => {
        console.error('AI recommendation failed:', err);
        setExecutionStep('idle');
      });
  };

  // Auto-fetch once when profile loads
  useEffect(() => { fetchInitiated.current = false; }, [address]);

  useEffect(() => {
    if (!address || !userProfile || recommendation || fetchInitiated.current) return;
    const [, , , , createdAt] = userProfile as unknown as any[];
    if (!createdAt) return;
    runAIFetch();
  }, [address, userProfile, agentId]);

  // Pre-fill Order Builder from AI signal
  useEffect(() => {
    if (!recommendation) return;
    setSourceAsset(recommendation.from_asset);
    if (recommendation.suggested_pct_shift > 0) {
      const bal = recommendation.from_asset === 'USDY' ? usdyBalance : methBalance;
      const suggested = (bal * recommendation.suggested_pct_shift) / 100;
      setSwapAmount(suggested > 0 ? suggested.toFixed(4) : '');
    }
  }, [recommendation]);

  // Pre-fill Order Builder when slider changes — calculates how much to swap to reach the target
  useEffect(() => {
    const total = usdyBalance + methBalance;
    if (total < 0.0001) return; // no balance yet, nothing to pre-fill

    const currentUsdyPct = (usdyBalance / total) * 100;
    const gapPct = usdyWeight - currentUsdyPct;

    if (Math.abs(gapPct) < 1) {
      // Already within 1% of target — clear the field
      setSwapAmount('');
      return;
    }

    if (gapPct > 0) {
      // Need more USDY: sell mETH
      setSourceAsset('mETH');
      // How many mETH tokens to sell to cover the gap (use live price if available, else 1:1)
      const usdyValueNeeded = (gapPct / 100) * total;
      const methToSell = livePrice ? usdyValueNeeded / livePrice.meth : usdyValueNeeded;
      setSwapAmount(Math.min(methToSell, methBalance).toFixed(4));
    } else {
      // Need more mETH: sell USDY
      setSourceAsset('USDY');
      const methValueNeeded = (Math.abs(gapPct) / 100) * total;
      const usdyToSell = livePrice ? methValueNeeded * livePrice.meth : methValueNeeded;
      setSwapAmount(Math.min(usdyToSell, usdyBalance).toFixed(4));
    }
  }, [usdyWeight]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSwitch = () => {
    setSourceAsset(prev => (prev === 'USDY' ? 'mETH' : 'USDY'));
    setSwapAmount('');
  };

  const handleRefresh = () => {
    fetchInitiated.current = false;
    setRecommendation(null);
    runAIFetch();
  };

  const handleCommit = () => {
    if (!recommendation || !swapAmount || Number(swapAmount) <= 0) return;
    setExecutionStep('committing');
    const nonce = BigInt(Math.floor(Date.now() / 1000));
    const adviceHash = keccak256(toHex(JSON.stringify(recommendation)));
    const contextHash = keccak256(toHex(JSON.stringify({ wallet: address, asset: sourceAsset })));
    setSavedNonce(nonce);
    setSavedAdviceHash(adviceHash);
    writeCommitment({
      address: CONTRACT_ADDRESSES.AdviceCommitment,
      abi: ADVICE_COMMITMENT_ABI,
      functionName: 'record',
      args: [
        nonce,
        adviceHash,
        contextHash,
        parseUnits(Math.max(0, portfolioValueUsd).toFixed(4), 18),
        18,
      ],
    } as any);
  };

  const handleApprove = () => {
    if (!swapAmountBigInt) return;
    setExecutionStep('approving');
    writeApprove({
      address: fromAssetAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.AutoRebalancer, swapAmountBigInt],
    });
  };

  const handleExecuteSwap = () => {
    if (!savedNonce || !savedAdviceHash || !swapAmountBigInt || !address) return;
    setExecutionStep('executing');
    writeExecute({
      address: CONTRACT_ADDRESSES.AutoRebalancer,
      abi: AUTO_REBALANCER_ABI,
      functionName: 'execute',
      args: [
        savedNonce,
        savedAdviceHash,
        fromAssetAddress,
        toAssetAddress,
        swapAmountBigInt,
        0n,
        BigInt(Math.floor(Date.now() / 1000) + 300),
      ],
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

        {/* ── Left: Portfolio weights ── */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <Card className="bg-bg-card/40 border-border-subtle p-6 md:p-10">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-xl md:text-2xl font-bold font-heading tracking-tight text-text-primary">
                  AI Portfolio Advisor
                </h2>
                <p className="text-text-secondary text-xs md:text-sm mt-1">
                  {usdyBalance > 0 || methBalance > 0
                    ? `${usdyBalance.toFixed(2)} USDY · ${methBalance.toFixed(4)} mETH — drag the sliders to set your target allocation`
                    : 'Mint test tokens from the Dashboard faucet to receive a personalised recommendation.'}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={executionStep === 'fetching'}
                className="p-2 text-text-muted hover:text-text-primary transition-colors disabled:opacity-40 mt-1"
                title="Refresh AI recommendation"
              >
                <RefreshCw size={15} className={executionStep === 'fetching' ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="space-y-12 md:space-y-16 py-6 md:py-8">
              {/* USDY slider */}
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-bold text-xs md:text-sm tracking-widest text-text-primary">USDY Target</h3>
                    <p className="text-[10px] md:text-xs mt-1">
                      Short-term Treasury Bill Exposure
                      {usdyBalance > 0 && (
                        <span className="font-mono ml-2 text-text-muted">· {usdyBalance.toFixed(2)} held</span>
                      )}
                    </p>
                  </div>
                  <span className="text-3xl md:text-4xl font-black font-heading text-accent-blue">{usdyWeight}%</span>
                </div>
                <div className="relative pt-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={usdyWeight}
                    onChange={e => setUsdyWeight(Number(e.target.value))}
                    className="w-full h-2 bg-bg-secondary rounded-full appearance-none cursor-pointer accent-accent-blue border border-border-subtle p-[1px]"
                  />
                  <div className="flex justify-between mt-4 text-[9px] font-bold tracking-[0.2em]">
                    <span>Risk-Off</span>
                    <span className="hidden xs:block">Neutral</span>
                    <span>Growth</span>
                  </div>
                </div>
              </div>

              {/* mETH slider (display only — inverse of USDY) */}
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-bold text-xs md:text-sm tracking-widest text-text-primary">mETH Target</h3>
                    <p className="text-[10px] md:text-xs mt-1">
                      Mantle Staked ETH (Liquid Yield)
                      {methBalance > 0 && (
                        <span className="font-mono ml-2 text-text-muted">· {methBalance.toFixed(4)} held</span>
                      )}
                    </p>
                  </div>
                  <span className="text-3xl md:text-4xl font-black font-heading text-accent-success">{100 - usdyWeight}%</span>
                </div>
                <div className="w-full h-2 bg-bg-secondary rounded-full border border-border-subtle p-[1px] overflow-hidden">
                  <div
                    className="h-full bg-accent-success rounded-full transition-all"
                    style={{ width: `${100 - usdyWeight}%` }}
                  />
                </div>
              </div>
            </div>

            {/* AI signal card */}
            {recommendation ? (
              <div className="mt-8 md:mt-12 space-y-3 animate-in fade-in zoom-in-95">
                {/* Header row */}
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] border border-border-subtle bg-bg-secondary">
                    <Bot size={13} className="text-accent-blue" />
                    <span className={cn(
                      'text-[11px] font-black tracking-widest',
                      recommendation.signal === 'ROTATE' ? 'text-accent-warning' :
                      recommendation.signal === 'COMPOUND' ? 'text-accent-success' : 'text-accent-blue'
                    )}>
                      {recommendation.signal}
                    </span>
                    {recommendation.signal === 'ROTATE' && (
                      <span className="text-[10px] text-text-muted font-bold">
                        {recommendation.from_asset} → {recommendation.to_asset}
                      </span>
                    )}
                  </div>
                  <div className={cn(
                    'px-3 py-1.5 rounded-[8px] border text-[10px] font-black tracking-widest',
                    recommendation.signal_strength === 'STRONG'
                      ? 'border-accent-success/40 bg-accent-success/10 text-accent-success'
                      : recommendation.signal_strength === 'MODERATE'
                      ? 'border-accent-warning/40 bg-accent-warning/10 text-accent-warning'
                      : 'border-border-subtle bg-bg-secondary text-text-muted'
                  )}>
                    {recommendation.signal_strength}
                  </div>
                  <Badge variant="success">{recommendation.confidence}% Confidence</Badge>
                </div>

                {/* Summary */}
                <div className="p-4 bg-bg-secondary border border-border-subtle rounded-[12px]">
                  <p className="text-xs md:text-sm text-text-secondary leading-relaxed italic">
                    "{recommendation.summary}"
                  </p>
                </div>

                {/* Action detail */}
                <div className="p-4 bg-bg-secondary border border-accent-blue/20 rounded-[12px]">
                  <p className="text-[9px] font-bold tracking-widest text-accent-blue mb-2">WHAT TO DO</p>
                  {recommendation.action_detail ? (
                    <>
                      <p className="text-xs md:text-sm text-text-primary font-medium leading-relaxed">
                        {recommendation.action_detail}
                      </p>
                      {recommendation.suggested_amount && recommendation.signal !== 'HOLD' && (
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-bg-primary rounded-[8px] border border-border-subtle">
                          <span className="text-[9px] font-bold tracking-widest text-text-muted">SUGGESTED</span>
                          <span className="text-xs font-mono font-black text-text-primary">{recommendation.suggested_amount}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-text-muted italic">Hit ↻ to load a detailed signal.</p>
                  )}
                </div>

                {/* Entry / Take Profit / Stop Loss */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-3 bg-bg-secondary rounded-[10px] border border-border-subtle">
                    <p className="text-[9px] font-bold tracking-widest text-text-muted mb-1.5">ENTRY</p>
                    {recommendation.entry_condition ? (
                      <p className="text-[11px] text-text-primary leading-snug">{recommendation.entry_condition}</p>
                    ) : (
                      <p className="text-[11px] text-text-muted italic">—</p>
                    )}
                  </div>
                  <div className="p-3 bg-bg-secondary rounded-[10px] border border-accent-success/20">
                    <p className="text-[9px] font-bold tracking-widest text-accent-success mb-1.5">TAKE PROFIT</p>
                    {recommendation.take_profit ? (
                      <p className="text-[11px] text-text-primary leading-snug">{recommendation.take_profit}</p>
                    ) : (
                      <p className="text-[11px] text-text-muted italic">—</p>
                    )}
                  </div>
                  <div className="p-3 bg-bg-secondary rounded-[10px] border border-accent-warning/20">
                    <p className="text-[9px] font-bold tracking-widest text-accent-warning mb-1.5">STOP LOSS</p>
                    {recommendation.stop_loss ? (
                      <p className="text-[11px] text-text-primary leading-snug">{recommendation.stop_loss}</p>
                    ) : (
                      <p className="text-[11px] text-text-muted italic">—</p>
                    )}
                  </div>
                </div>

                {/* Risk note */}
                {recommendation.risk_note && (
                  <p className="text-[10px] text-text-muted px-1 leading-relaxed">
                    ⚠ {recommendation.risk_note}
                  </p>
                )}
              </div>
            ) : executionStep === 'fetching' ? (
              <div className="mt-8 md:mt-12 p-8 bg-bg-secondary/40 border border-border-subtle border-dashed rounded-[12px] flex items-center justify-center">
                <p className="text-[10px] font-bold tracking-[0.2em] flex items-center gap-2">
                  <Activity size={14} className="animate-spin" />
                  Analysing your portfolio...
                </p>
              </div>
            ) : (
              <div className="mt-8 md:mt-12 p-8 bg-bg-secondary/40 border border-border-subtle border-dashed rounded-[12px] flex flex-col items-center justify-center gap-4">
                <p className="text-[10px] font-bold tracking-[0.2em] text-text-muted">No recommendation loaded</p>
                <button onClick={handleRefresh} className="btn-secondary py-2 px-5 text-[10px] tracking-widest">
                  Request AI Analysis
                </button>
              </div>
            )}
          </Card>

          <div className="p-4 md:p-6 bg-bg-secondary/20 border border-border-subtle border-dashed rounded-[12px] flex items-center gap-4 hover:bg-bg-secondary/40 transition-colors">
            <ShieldCheck size={24} className="text-accent-success shrink-0" />
            <div>
              <p className="text-xs font-bold text-text-primary tracking-tight">On-Chain Verifiability</p>
              <p className="text-[9px] md:text-[10px] font-medium mt-0.5 tracking-widest">
                Every recommendation is hashed and committed for public institutional audit.
              </p>
            </div>
          </div>
        </div>

        {/* ── Right: Order Builder ── */}
        <div className="h-fit lg:sticky lg:top-28">
          <Card className="border-accent-blue/30 bg-bg-card/40 p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-bold font-heading tracking-tight text-white mb-6 border-b border-border-subtle pb-4">
              Order Builder
            </h3>

            <div className="space-y-4">
              {/* Source asset */}
              <div className="space-y-2">
                <label className="text-[10px] tracking-widest font-bold text-text-muted">Source Asset</label>
                <div className="p-4 bg-bg-secondary rounded-[10px] border border-border-subtle flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 bg-bg-card/40 rounded-[8px] flex items-center justify-center border border-border-subtle text-xs font-black',
                      sourceAsset === 'USDY' ? 'text-accent-blue' : 'text-accent-success',
                    )}>
                      {sourceAsset === 'USDY' ? 'U' : 'M'}
                    </div>
                    <span className="font-bold text-text-primary text-sm">{sourceAsset}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold block text-text-primary">
                      {sourceBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </span>
                    <span className="text-[9px] font-bold tracking-widest text-text-muted">Balance</span>
                  </div>
                </div>
              </div>

              {/* Amount input */}
              <div className="space-y-2">
                <label className="text-[10px] tracking-widest font-bold text-text-muted">Amount to Swap</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.0000"
                    value={swapAmount}
                    onChange={e => setSwapAmount(e.target.value)}
                    className="flex-1 bg-bg-secondary border border-border-subtle rounded-[10px] px-4 py-3 text-sm font-mono font-bold text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50 transition-colors"
                  />
                  <button
                    onClick={() => setSwapAmount(sourceBalance.toFixed(4))}
                    className="px-3 bg-bg-secondary border border-border-subtle rounded-[10px] text-[10px] font-bold tracking-widest text-text-secondary hover:text-text-primary hover:border-accent-blue/40 transition-colors"
                  >
                    MAX
                  </button>
                </div>
                {swapAmount && Number(swapAmount) > sourceBalance && (
                  <p className="text-[10px] text-accent-warning ml-1">Exceeds balance</p>
                )}
              </div>

              {/* Switch button */}
              <div className="flex justify-center py-1">
                <button
                  onClick={handleSwitch}
                  className="w-10 h-10 bg-bg-primary border border-border-subtle rounded-[10px] flex items-center justify-center text-text-secondary hover:text-accent-blue hover:border-accent-blue/40 hover:rotate-180 transition-all duration-300 shadow-lg"
                  title="Switch direction"
                >
                  <ArrowRightLeft size={16} />
                </button>
              </div>

              {/* Target asset — 1:1 mock router, real USD value from live price */}
              <div className="space-y-2">
                <label className="text-[10px] tracking-widest font-bold text-text-muted">You Receive</label>
                <div className={cn(
                  'p-4 rounded-[10px] border flex justify-between items-center transition-colors',
                  estimatedOut
                    ? 'bg-bg-secondary border-accent-success/30'
                    : 'bg-bg-secondary/50 border-border-subtle/50',
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 bg-bg-card/40 rounded-[8px] flex items-center justify-center border border-border-subtle text-xs font-black',
                      targetAsset === 'USDY' ? 'text-accent-blue' : 'text-accent-success',
                    )}>
                      {targetAsset === 'USDY' ? 'U' : 'M'}
                    </div>
                    <div>
                      <span className="font-bold text-text-primary text-sm">{targetAsset}</span>
                      {estimatedOut && livePrice && (
                        <span className="block text-[9px] font-bold tracking-widest text-accent-success mt-0.5">
                          LIVE PRICE
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      'font-mono text-sm font-bold block',
                      estimatedOut ? 'text-accent-success' : 'text-text-muted',
                    )}>
                      {estimatedOut
                        ? Number(viemFormatUnits(estimatedOut, 18)).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 4,
                          })
                        : '—'}
                    </span>
                    {/* Live USD equivalent */}
                    {estimatedOut && livePrice && (() => {
                      const tokenAmt = Number(viemFormatUnits(estimatedOut, 18));
                      const price = targetAsset === 'mETH' ? livePrice.meth : livePrice.usdy;
                      const usdVal = tokenAmt * price;
                      return (
                        <span className="text-[9px] font-bold tracking-widest text-accent-success/80">
                          ≈ ${usdVal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                      );
                    })()}
                    {!estimatedOut && (
                      <span className="text-[9px] font-bold tracking-widest text-text-muted">
                        Enter amount
                      </span>
                    )}
                  </div>
                </div>

                {/* Exchange rate row */}
                {livePrice && (
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] text-text-muted">
                      {sourceAsset === 'mETH'
                        ? `1 mETH ≈ ${(livePrice.meth / livePrice.usdy).toLocaleString(undefined, { maximumFractionDigits: 2 })} USDY`
                        : `1 USDY ≈ ${(livePrice.usdy / livePrice.meth).toFixed(6)} mETH`}
                      {' · '}mETH ${livePrice.meth.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] text-text-muted/60">CoinGecko live</span>
                  </div>
                )}
              </div>

              {/* Fees */}
              <div className="pt-4 border-t border-border-subtle space-y-3">
                <div className="flex justify-between text-[10px] font-bold tracking-widest">
                  <span className="text-text-muted">Slippage Guard</span>
                  <span className="text-text-secondary">0.5 bps</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold tracking-widest">
                  <span className="text-text-muted">Protocol Fee</span>
                  <span className="text-text-secondary">0.02%</span>
                </div>
              </div>

              {/* Commitment hash preview */}
              {recommendation && (
                <div className="p-3 bg-bg-primary rounded-[8px] border border-border-subtle/50">
                  <p className="text-[8px] tracking-[0.2em] font-black mb-1.5 text-text-muted">Strategy Commitment Hash</p>
                  <p className="text-[9px] font-mono text-accent-success truncate opacity-80">
                    {keccak256(toHex(JSON.stringify(recommendation)))}
                  </p>
                </div>
              )}

              {/* Step 1: Commit — only shown before a commitment is confirmed */}
              {!isCommitConfirmed && !savedNonce && (
                <button
                  onClick={handleCommit}
                  disabled={
                    !recommendation ||
                    !swapAmount ||
                    Number(swapAmount) <= 0 ||
                    Number(swapAmount) > sourceBalance ||
                    executionStep !== 'idle' ||
                    isCommitWaiting
                  }
                  className="btn-primary w-full py-4 text-xs tracking-[0.2em] flex items-center justify-center gap-3 disabled:bg-bg-secondary disabled:border-border-subtle disabled:text-text-muted group"
                >
                  {isCommitWaiting ? (
                    <><Activity className="animate-spin" size={16} /> Confirming On-Chain...</>
                  ) : executionStep === 'committing' ? (
                    <><Bot className="animate-pulse" size={16} /> Processing...</>
                  ) : (
                    <>Commit Strategy <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              )}

              {/* Step 2: Approve + Execute — shown after commitment is recorded */}
              {(isCommitConfirmed || savedNonce) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2.5 bg-accent-success/10 border border-accent-success/20 rounded-[8px]">
                    <Activity size={12} className="text-accent-success shrink-0" />
                    <p className="text-[9px] font-bold tracking-widest text-accent-success">Strategy committed on-chain</p>
                  </div>

                  {(() => {
                    const allowance = (rebalancerAllowance as bigint | undefined) ?? 0n;
                    const needsApproval = swapAmountBigInt !== undefined && allowance < swapAmountBigInt;

                    if (needsApproval) {
                      return (
                        <button
                          onClick={handleApprove}
                          disabled={!swapAmountBigInt || isApprovePending || isApproveWaiting}
                          className="btn-secondary w-full py-4 text-xs tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                          {isApproveWaiting ? (
                            <><Activity className="animate-spin" size={16} /> Confirming...</>
                          ) : isApprovePending ? (
                            <><Bot className="animate-pulse" size={16} /> Check Wallet...</>
                          ) : (
                            <>Approve {sourceAsset} <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                          )}
                        </button>
                      );
                    }

                    return (
                      <button
                        onClick={handleExecuteSwap}
                        disabled={!savedNonce || !swapAmountBigInt || isExecutePending || isExecuteWaiting || executionStep === 'executing'}
                        className="btn-primary w-full py-4 text-xs tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        {isExecuteWaiting ? (
                          <><Activity className="animate-spin" size={16} /> Confirming On-Chain...</>
                        ) : isExecutePending || executionStep === 'executing' ? (
                          <><Bot className="animate-pulse" size={16} /> Check Wallet...</>
                        ) : isExecuteConfirmed ? (
                          <>✓ Swap Executed</>
                        ) : (
                          <>Execute Swap <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                      </button>
                    );
                  })()}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { 
  Bot, 
  ShieldCheck, 
  Wallet, 
  ArrowRightLeft, 
  TrendingUp, 
  ChevronRight,
  Activity
} from 'lucide-react';
import { keccak256, toHex, parseUnits } from 'viem';
import { 
  CONTRACT_ADDRESSES, 
  USER_RISK_PROFILE_ABI, 
  ADVICE_COMMITMENT_ABI 
} from '../../lib/contracts';
import { fetchAIRecommendation, type AIRecommendation } from '../../services/ai';
import { Card } from '../Shared/Card';
import { Badge } from '../Shared/Badge';
import { cn } from '../../lib/utils';

export const Strategy = () => {
  const { address } = useAccount();
  const [usdyWeight, setUsdyWeight] = useState(60);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [executionStep, setExecutionStep] = useState<'idle' | 'fetching' | 'committing' | 'executing' | 'success'>('idle');

  const { writeContract: writeCommitment, data: hash } = useWriteContract();

  const { isLoading: isWaiting, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isConfirmed) {
      setExecutionStep('idle');
    }
  }, [isConfirmed]);

  const { data: userProfile } = useReadContract({
    address: CONTRACT_ADDRESSES.UserRiskProfile,
    abi: USER_RISK_PROFILE_ABI,
    functionName: 'profiles',
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    if (address && userProfile && !recommendation && executionStep === 'idle') {
      setExecutionStep('fetching');
      fetchAIRecommendation(address, userProfile).then(res => {
        setRecommendation(res);
        setExecutionStep('idle');
      });
    }
  }, [address, userProfile, recommendation, executionStep]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <Card className="bg-bg-card/40 border-border-subtle p-6 md:p-10">
            <h2 className="text-xl md:text-2xl font-bold font-heading tracking-tight text-text-primary mb-2">Portfolio Builder</h2>
            <p className="text-text-secondary text-xs md:text-sm mb-8 md:mb-12">Allocate target exposure for autonomous rebalancing.</p>
            
            <div className="space-y-12 md:space-y-16 py-2 md:py-4">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-bold text-xs md:text-sm tracking-widest text-text-primary">USDY Allocation</h3>
                    <p className="text-[10px] md:text-xs  mt-1">Short-term Treasury Bill Exposure</p>
                  </div>
                  <span className="text-3xl md:text-4xl font-black font-heading text-accent-blue">{usdyWeight}%</span>
                </div>
                <div className="relative pt-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={usdyWeight}
                    onChange={(e) => setUsdyWeight(Number(e.target.value))}
                    className="w-full h-2 bg-bg-secondary rounded-full appearance-none cursor-pointer accent-accent-blue border border-border-subtle p-[1px]" 
                  />
                  <div className="flex justify-between mt-4 text-[9px]  font-bold tracking-[0.2em]">
                    <span>Risk-Off</span>
                    <span className="hidden xs:block">Neutral</span>
                    <span>Growth</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-bold text-xs md:text-sm tracking-widest text-text-primary">mETH Allocation</h3>
                    <p className="text-[10px] md:text-xs  mt-1">Mantle Staked ETH (Liquid Yield)</p>
                  </div>
                  <span className="text-1xl md:text-4xl font-black font-heading text-accent-success">{100 - usdyWeight}%</span>
                </div>
                <div className="w-full h-2 bg-bg-secondary rounded-full border border-border-subtle p-[1px] opacity-40 overflow-hidden">
                  <div 
                    className="h-full bg-accent-success rounded-full transition-all"
                    style={{ width: `${100 - usdyWeight}%` }}
                  />
                </div>
              </div>
            </div>

            {recommendation ? (
              <div className="mt-8 md:mt-12 p-4 md:p-6 bg-bg-secondary border border-border-subtle rounded-[12px] flex items-start gap-4 animate-in fade-in zoom-in-95">
                <div className="w-10 h-10 rounded-[10px] bg-bg-card/40 flex items-center justify-center text-accent-blue border border-border-subtle shrink-0">
                  <Bot size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                    <p className="font-bold text-[10px] md:text-[11px] tracking-widest text-text-primary">Intelligence Recommendation</p>
                    <Badge variant="success">{recommendation.confidence}% Match</Badge>
                  </div>
                  <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-medium italic">
                    "{recommendation.summary}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-8 md:mt-12 p-8 bg-bg-secondary/40 border border-border-subtle border-dashed rounded-[12px] flex items-center justify-center">
                <p className=" text-[10px] font-bold tracking-[0.2em] flex items-center gap-2">
                  <Activity size={14} className="animate-spin" />
                  Synchronizing AI Strategy...
                </p>
              </div>
            )}
          </Card>

          <div className="p-4 md:p-6 bg-bg-secondary/20 border border-border-subtle border-dashed rounded-[12px] flex items-center gap-4 transition-colors hover:bg-bg-secondary/40">
            <ShieldCheck size={24} className="text-accent-success shrink-0" />
            <div>
              <p className="text-xs font-bold text-text-primary tracking-tight">On-Chain Verifiability</p>
              <p className="text-[9px] md:text-[10px]  font-medium mt-0.5 tracking-widest">Every recommendation is hashed and committed for public institutional audit.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8 h-fit lg:sticky lg:top-28">
          <Card className="border-accent-blue/30 bg-bg-card/40 relative p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-bold font-heading tracking-tight text-white mb-6 md:mb-8 border-b border-border-subtle pb-4">
              Order Builder
            </h3>
            <div className="space-y-6 md:space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] tracking-widest  font-bold ml-1">Source Asset</label>
                <div className="p-4 md:p-5 bg-bg-secondary rounded-[10px] border border-border-subtle flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-bg-card/40 rounded-[8px] flex items-center justify-center text-accent-blue border border-border-subtle">
                      <Wallet size={16} />
                    </div>
                    <span className="font-bold text-text-primary text-sm md:text-base">USDY</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs md:text-sm font-bold block text-text-primary">1,240.50</span>
                    <span className="text-[9px] md:text-[10px]  font-bold tracking-widest">Balance</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center -my-3 md:-my-4 relative z-10">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-bg-primary border border-border-subtle rounded-[10px] flex items-center justify-center  shadow-2xl">
                  <ArrowRightLeft size={16} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] tracking-widest  font-bold ml-1">Target Allocation</label>
                <div className="p-4 md:p-5 bg-bg-secondary rounded-[10px] border border-border-subtle flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-bg-card/40 rounded-[8px] flex items-center justify-center text-accent-success border border-border-subtle">
                      <TrendingUp size={16} />
                    </div>
                    <span className="font-bold text-text-primary text-sm md:text-base">mETH</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs md:text-sm font-bold block text-accent-success/80">0.457</span>
                    <span className="text-[9px] md:text-[10px]  font-bold tracking-widest">Estimated</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 md:pt-8 border-t border-border-subtle space-y-3 md:space-y-4">
                <div className="flex justify-between text-[10px] md:text-[11px] font-bold tracking-widest">
                  <span className="">Slippage Guard</span>
                  <span className="text-text-secondary">0.5% bps</span>
                </div>
                <div className="flex justify-between text-[10px] md:text-[11px] font-bold tracking-widest">
                  <span className="">Protocol Fee</span>
                  <span className="text-text-secondary">0.02%</span>
                </div>
              </div>

              {recommendation && (
                <div className="p-3.5 bg-bg-primary rounded-[8px] border border-border-subtle/50">
                  <p className="text-[8px] md:text-[9px]  tracking-[0.2em] font-black mb-1.5">Strategy Commitment</p>
                  <p className="text-[9px] md:text-[10px] font-mono text-accent-success truncate opacity-80">
                    {keccak256(toHex(JSON.stringify(recommendation)))}
                  </p>
                </div>
              )}

              <button 
                onClick={() => {
                  if (!recommendation) return;
                  setExecutionStep('committing');
                  const adviceHash = keccak256(toHex(JSON.stringify(recommendation)));
                  const contextHash = keccak256(toHex(JSON.stringify({ wallet: address, asset: 'USDY' })));
                  
                  writeCommitment({
                    address: CONTRACT_ADDRESSES.AdviceCommitment,
                    abi: ADVICE_COMMITMENT_ABI,
                    functionName: 'record',
                    args: [
                      BigInt(Math.floor(Date.now() / 1000)), 
                      adviceHash, 
                      contextHash, 
                      parseUnits('1240', 18), 
                      18
                    ],
                  } as any);
                }}
                disabled={!recommendation || executionStep !== 'idle' || isWaiting}
                className="btn-primary w-full py-4 md:py-5 text-xs md:text-sm tracking-[0.2em] flex items-center justify-center gap-3 disabled:bg-bg-secondary disabled:border-border-subtle disabled: group"
              >
                {isWaiting ? (
                  <>
                    <Activity className="animate-spin" size={16} />
                    Confirming...
                  </>
                ) : executionStep === 'committing' ? (
                  <>
                    <Bot className="animate-pulse" size={16} />
                    Processing...
                  </>
                ) : (
                  <>
                    Execute Build
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

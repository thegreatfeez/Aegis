import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
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

export const Strategy = () => {
  const { address } = useAccount();
  const [usdyWeight, setUsdyWeight] = useState(60);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [executionStep, setExecutionStep] = useState<'idle' | 'fetching' | 'committing' | 'executing' | 'success'>('idle');

  const { writeContract: writeCommitment } = useWriteContract();

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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <h2 className="text-2xl font-bold mb-2">Strategy Builder</h2>
            <p className="text-zinc-500 mb-8">Allocate your target exposure across Mantle RWA assets.</p>
            
            <div className="space-y-12 py-6">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-bold text-lg">USDY Weight</h3>
                    <p className="text-sm text-zinc-500">Ondo Short-term Treasury Bills</p>
                  </div>
                  <span className="text-3xl font-mono font-bold text-indigo-400">{usdyWeight}%</span>
                </div>
                <div className="relative pt-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={usdyWeight}
                    onChange={(e) => setUsdyWeight(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                  />
                  <div className="flex justify-between mt-2 text-[10px] text-zinc-600 uppercase font-bold tracking-widest">
                    <span>Conservative</span>
                    <span>Aggressive</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-bold text-lg">mETH Weight</h3>
                    <p className="text-sm text-zinc-500">Mantle Staked ETH (LST)</p>
                  </div>
                  <span className="text-3xl font-mono font-bold text-purple-400">{100 - usdyWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={100 - usdyWeight}
                  readOnly
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none opacity-50 cursor-not-allowed accent-purple-500" 
                />
              </div>
            </div>

            {recommendation ? (
              <div className="mt-8 p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-4 animate-in fade-in zoom-in-95">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Bot size={20} />
                </div>
                <div>
                  <p className="font-bold text-indigo-100 flex items-center gap-2">
                    AI Recommendation
                    <Badge variant="success">{recommendation.confidence}% Confidence</Badge>
                  </p>
                  <p className="text-sm text-indigo-200/70 leading-relaxed mt-1">
                    "{recommendation.summary}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center justify-center">
                <p className="text-zinc-500 text-sm">Fetching AI Strategy...</p>
              </div>
            )}
          </Card>

          <Card className="bg-zinc-900/30 border-dashed border-zinc-700">
            <div className="flex items-center gap-4 text-zinc-500">
              <ShieldCheck size={24} />
              <div>
                <p className="text-sm font-bold">On-Chain Advisory Commitment</p>
                <p className="text-xs">Every AI recommendation is hashed and committed on-chain for full auditability.</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-indigo-500/50 ring-1 ring-indigo-500/10 shadow-[0_0_40px_rgba(79,70,229,0.1)]">
            <h3 className="text-xl font-bold mb-6 flex items-center justify-between">
              Execution
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">From</label>
                <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                      <Wallet size={16} />
                    </div>
                    <span className="font-bold">USDY</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm block">1,240.50</span>
                    <span className="text-[10px] text-zinc-500">$1,240.50</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center -my-3 relative z-10">
                <div className="w-10 h-10 bg-black border border-zinc-800 rounded-2xl flex items-center justify-center text-indigo-400 shadow-2xl rotate-45">
                  <ArrowRightLeft size={18} className="-rotate-45" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">To (Estimated)</label>
                <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">
                      <TrendingUp size={16} />
                    </div>
                    <span className="font-bold">mETH</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm block text-emerald-400">0.457</span>
                    <span className="text-[10px] text-zinc-500">~$1,238.90</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-zinc-800 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Slippage Tolerance</span>
                  <span className="text-zinc-300 font-medium">0.5%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Network Fee</span>
                  <span className="text-zinc-300 font-medium">~0.002 MNT</span>
                </div>
              </div>

              {recommendation && (
                <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800/50">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Commitment Hash</p>
                  <p className="text-[10px] font-mono text-zinc-400 truncate text-emerald-400/80">
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
                disabled={!recommendation || executionStep !== 'idle'}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-zinc-800 disabled:to-zinc-800 text-white rounded-xl font-bold transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                {executionStep === 'committing' ? (
                  <>
                    <Bot className="animate-bounce" size={18} />
                    Committing Advice...
                  </>
                ) : executionStep === 'executing' ? (
                  <>
                    <Activity className="animate-spin" size={18} />
                    Rebalancing Assets...
                  </>
                ) : 'Confirm & Execute'}
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

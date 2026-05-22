import { useAccount, useReadContract } from 'wagmi';
import { 
  BrainCircuit, 
  Bot, 
  TrendingUp, 
  Info,
  History as HistoryIcon,
  Calendar,
  Fingerprint
} from 'lucide-react';
import { Card } from '../Shared/Card';
import { Badge } from '../Shared/Badge';
import { cn, formatUnits } from '../../lib/utils';
import { CONTRACT_ADDRESSES, ADVICE_COMMITMENT_ABI } from '../../lib/contracts';

const CommitmentItem = ({ address, nonce }: { address: `0x${string}`, nonce: bigint }) => {
  const { data: commitment } = useReadContract({
    address: CONTRACT_ADDRESSES.AdviceCommitment,
    abi: ADVICE_COMMITMENT_ABI,
    functionName: 'getCommitment',
    args: [address, nonce],
  });

  if (!commitment) return null;

  const { 
    agentId, 
    adviceHash, 
    portfolioValueWei, 
    createdAt, 
    executed 
  } = commitment as any;

  return (
    <div className="p-4 md:p-5 bg-bg-secondary rounded-[12px] hover:border-accent-blue/40 transition-all group">
      <div className="flex justify-between items-start mb-4 md:mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-bg-primary rounded-[10px] flex items-center justify-center text-text-secondary border border-border-subtle group-hover:border-accent-blue/30 transition-colors">
            <Bot size={18} />
          </div>
          <div>
            <h4 className="font-bold text-xs md:text-sm text-text-primary flex flex-wrap items-center gap-2 font-heading tracking-tight">
              Commit #{nonce.toString()}
              {executed && <Badge variant="success">Executed</Badge>}
            </h4>
            <p className="text-[9px] md:text-[10px]  font-bold tracking-widest leading-none mt-1">
              Agent ID: {agentId.toString()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] md:text-xs font-bold text-accent-blue font-mono">
            {formatUnits(portfolioValueWei)} <span className="text-[9px] md:text-[10px] ">aUSDY</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:gap-4 border-t border-border-subtle/50 pt-4 md:pt-5 mt-2">
        <div className="space-y-1.5 md:space-y-2">
          <div className="flex items-center gap-2 ">
            <Fingerprint size={10} />
            <span className="text-[9px] md:text-[10px] font-bold tracking-widest">Advice Hash</span>
          </div>
          <p className="text-[9px] md:text-[10px] font-mono text-text-secondary bg-bg-primary p-2 md:p-2.5 rounded-[8px] truncate border border-border-subtle/30">
            {adviceHash}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 ">
            <Calendar size={10} />
            <span className="text-[9px] md:text-[10px] font-bold tracking-widest">Verified At</span>
          </div>
          <p className="text-[9px] md:text-[10px] font-bold text-text-secondary tracking-tight">
            {new Date(Number(createdAt) * 1000).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export const Insights = () => {
  const { address } = useAccount();

  const { data: historyNonces } = useReadContract({
    address: CONTRACT_ADDRESSES.AdviceCommitment,
    abi: ADVICE_COMMITMENT_ABI,
    functionName: 'getCommitmentHistory',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-700 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <Card className="md:col-span-2 border-border-subtle bg-bg-card/40 overflow-hidden relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 md:mb-10 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-bg-secondary rounded-[12px] flex items-center justify-center text-accent-blue border border-border-subtle shadow-inner">
                <BrainCircuit size={28} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary font-heading">Strategic Intelligence</h2>
                <p className=" text-[10px] font-bold tracking-widest flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-success" />
                  Mantle Ecosystem Analysis
                </p>
              </div>
            </div>
            <div className="self-start sm:self-auto">
              <Badge variant="success">98% Confidence</Badge>
            </div>
          </div>

          <div className="relative z-10 space-y-6 md:space-y-8">
            <div className="p-4 md:p-6 bg-bg-secondary rounded-[12px] leading-relaxed text-text-primary">
              <p className="text-base md:text-lg italic font-medium">
                "Mantle ecosystem liquidity is shifting towards RWA-backed stability. USDY yields are currently outperforming native ETH staking when accounting for recent network activity."
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {[
                { label: 'Volatility', value: 'Minimal', color: 'text-accent-success' },
                { label: 'Liquidity', value: 'Prime', color: 'text-accent-blue' },
                { label: 'Asset Flow', value: 'Inbound', color: 'text-accent-blue' },
                { label: 'Risk Score', value: '0.08 / 1.0', color: '' },
              ].map((stat) => (
                <div key={stat.label} className="p-3 md:p-3.5 bg-bg-primary rounded-[10px] text-center">
                  <p className="text-[8px] md:text-[9px] tracking-[0.1em]  font-bold mb-1 md:mb-1.5">{stat.label}</p>
                  <p className={cn("text-xs font-bold font-heading", stat.color)}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="border-border-subtle bg-bg-card/40">
          <h3 className="text-[10px] md:text-[11px] font-bold tracking-widest mb-6 md:mb-8 flex items-center gap-2.5 ">
            <TrendingUp size={16} className="text-accent-success" />
            Market Pulse
          </h3>
          <div className="space-y-6 md:space-y-8">
            <div className="h-32 md:h-40 flex items-end justify-between gap-1 md:gap-1.5 px-1 pb-2">
              {[40, 70, 45, 90, 65, 80, 50, 85, 95, 60].map((h, i) => (
                <div 
                  key={i} 
                  className="w-full bg-accent-blue/10 rounded-t-[2px] transition-all hover:bg-accent-blue/30 cursor-pointer border-x border-t border-accent-blue/5" 
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="pt-4 md:pt-6 border-t border-border-subtle space-y-4 md:space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] md:text-xs font-bold  tracking-widest">Protocol TVL</span>
                <span className="text-xs md:text-sm font-bold text-text-primary">$42.8M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] md:text-xs font-bold  tracking-widest">Net Flow (24H)</span>
                <span className="text-xs md:text-sm font-bold text-accent-success">+$1.2M</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="md:col-span-2 lg:col-span-3 space-y-6 md:space-y-8 pt-4 md:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold flex items-center gap-3 text-text-primary font-heading tracking-tight">
              <HistoryIcon className="" size={20} />
              Commitment Audit Log
            </h2>
            <div className="text-[9px] md:text-[10px]  font-bold tracking-widest flex items-center gap-2">
              <Info size={12} />
              Cryptographically verified strategies
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {(!historyNonces || historyNonces.length === 0) ? (
              <div className="col-span-full py-20 md:py-24 text-center border-2 border-dashed border-border-subtle rounded-[20px] bg-bg-secondary/20">
                <HistoryIcon size={40} className="text-border-subtle mx-auto mb-4 md:mb-6" />
                <p className=" font-bold tracking-widest text-[10px] md:text-xs">No strategic commitments archived</p>
              </div>
            ) : (
              [...historyNonces].reverse().map((nonce) => (
                <CommitmentItem key={nonce.toString()} address={address!} nonce={nonce} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

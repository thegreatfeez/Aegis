import { useAccount, useReadContract } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  History, 
  ArrowRightLeft,
  Bot,
  Info
} from 'lucide-react';
import { 
  CONTRACT_ADDRESSES, 
  EXTERNAL_ADDRESSES,
  USER_RISK_PROFILE_ABI, 
  YIELD_VAULT_ABI,
  ERC20_ABI
} from '../../lib/contracts';
import { formatUnits } from '../../lib/utils';
import { Card } from '../Shared/Card';
import { Badge } from '../Shared/Badge';

export const Dashboard = () => {
  const { address } = useAccount();
  const navigate = useNavigate();

  const { data: userProfile } = useReadContract({
    address: CONTRACT_ADDRESSES.UserRiskProfile,
    abi: USER_RISK_PROFILE_ABI,
    functionName: 'profiles',
    args: address ? [address] : undefined,
  });

  const { data: vaultBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.YieldVault,
    abi: YIELD_VAULT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: usdyBalance } = useReadContract({
    address: EXTERNAL_ADDRESSES.USDY as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: methBalance } = useReadContract({
    address: EXTERNAL_ADDRESSES.mETH as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-2 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <TrendingUp size={24} />
              </div>
              <Badge variant="success">+4.2% APY</Badge>
            </div>
            <h3 className="text-zinc-400 text-sm font-medium mb-1">Total Vault Value</h3>
            <p className="text-3xl font-bold tracking-tight">
              {vaultBalance ? formatUnits(vaultBalance as bigint) : '0.00'} aUSDY
            </p>
          </Card>

          <Card className="hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <History size={24} />
              </div>
            </div>
            <h3 className="text-zinc-400 text-sm font-medium mb-1">On-Chain Actions</h3>
            <p className="text-3xl font-bold tracking-tight">12 <span className="text-sm font-normal text-zinc-500">Executions</span></p>
          </Card>
        </div>

        <h2 className="text-xl font-bold flex items-center gap-2">
          <ArrowRightLeft className="text-indigo-400" size={20} />
          Active Positions
        </h2>
        
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-800/30">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Asset</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Risk Level</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              <tr>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-xs">U</div>
                    <div>
                      <p className="font-bold">USDY</p>
                      <p className="text-xs text-zinc-500">Ondo RWA</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono">{usdyBalance ? formatUnits(usdyBalance as bigint) : '0.00'}</td>
                <td className="px-6 py-4"><Badge>Low Risk</Badge></td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => navigate('/strategy')}
                    className="text-indigo-400 text-sm font-semibold hover:text-indigo-300"
                  >
                    Manage
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-xs">M</div>
                    <div>
                      <p className="font-bold">mETH</p>
                      <p className="text-xs text-zinc-500">Mantle ETH</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono">{methBalance ? formatUnits(methBalance as bigint) : '0.00'}</td>
                <td className="px-6 py-4"><Badge>Moderate</Badge></td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => navigate('/strategy')}
                    className="text-indigo-400 text-sm font-semibold hover:text-indigo-300"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>

      <div className="space-y-8">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Bot className="text-purple-400" size={20} />
          AI Insights
        </h2>
        
        <div className="space-y-6">
          <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-transparent p-5">
            <div className="flex items-center gap-3 text-indigo-400 mb-4">
              <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <Bot size={18} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Live Strategy Analysis</span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-300 mb-6 italic font-medium">
              "High conviction rotation pattern detected. Capital inflows to mETH are accelerating."
            </p>
            <div className="flex items-center justify-between border-t border-indigo-500/10 pt-4">
              <Badge variant="success">92% Match</Badge>
              <button 
                onClick={() => navigate('/insights')}
                className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest hover:text-indigo-300 transition-colors"
              >
                Details →
              </button>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-bold mb-4">Risk Constraints</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-500 uppercase tracking-wider underline decoration-zinc-800 underline-offset-4">Max Concentration</span>
                  <span className="font-mono">{userProfile ? Number((userProfile as any)[3]) / 100 : '0'}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full transition-all" 
                    style={{ width: `${userProfile ? Number((userProfile as any)[3]) / 100 : 0}%` }} 
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-500 uppercase tracking-wider underline decoration-zinc-800 underline-offset-4">Position Limit</span>
                  <span className="font-mono">{userProfile ? Number((userProfile as any)[2]) / 100 : '0'}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-500 h-full transition-all" 
                    style={{ width: `${userProfile ? Number((userProfile as any)[2]) / 100 : 0}%` }} 
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

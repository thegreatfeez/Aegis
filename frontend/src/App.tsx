import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useDisconnect, useSwitchChain } from 'wagmi';
import { ConnectKitButton, useModal } from 'connectkit';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  TrendingUp, 
  ShieldCheck, 
  History, 
  Wallet,
  ArrowRightLeft,
  Bot,
  Info,
  ChevronRight,
  Activity,
  X,
} from 'lucide-react';
import { 
  CONTRACT_ADDRESSES, 
  EXTERNAL_ADDRESSES,
  USER_RISK_PROFILE_ABI, 
  AEGIS_AGENT_ABI, 
  YIELD_VAULT_ABI,
  ADVICE_COMMITMENT_ABI,
  ERC20_ABI,
} from './lib/contracts';
import { cn, formatAddress, formatUnits } from './lib/utils';
import { fetchAIRecommendation, type AIRecommendation } from './services/ai';
import { keccak256, toHex, parseUnits } from 'viem';

// --- Components ---

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl", className)}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' }) => {
  const styles = {
    default: "bg-zinc-800 text-zinc-400",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", styles[variant])}>
      {children}
    </span>
  );
};

const WalletDropdown = () => {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { chains, switchChain } = useSwitchChain();
  const [isOpen, setIsOpen] = useState(false);

  if (!isConnected) return <ConnectKitButton />;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all font-mono text-sm"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        {formatAddress(address!)}
        <ChevronRight size={14} className={cn("transition-transform", isOpen ? "rotate-90" : "rotate-0")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-[70] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2 border-b border-zinc-800 bg-zinc-900/50">
              <p className="px-3 py-1 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Network</p>
              <button 
                onClick={() => {
                  if (chains[0]) switchChain({ chainId: chains[0].id });
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-800 rounded-lg transition-colors flex items-center justify-between"
              >
                {chain?.name || 'Mantle Sepolia'}
                <Badge variant="success">Online</Badge>
              </button>
            </div>
            <div className="p-1">
              <button 
                onClick={() => {
                  disconnect();
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
              >
                <X size={14} /> Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// --- App ---

function App() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'insights' | 'strategy'>('dashboard');
  const [showInitModal, setShowInitModal] = useState(false);
  const [usdyWeight, setUsdyWeight] = useState(60);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [executionStep, setExecutionStep] = useState<'idle' | 'fetching' | 'committing' | 'executing' | 'success'>('idle');
  const [hasDismissedInit, setHasDismissedInit] = useState(false);

  // --- Contract Writes ---
  const { writeContract: writeInit, isPending: isInitializing } = useWriteContract();
  const { writeContract: writeCommitment } = useWriteContract();

  // --- Contract Reads ---
  
  // 1. User Profile
  const { data: userProfile } = useReadContract({
    address: CONTRACT_ADDRESSES.UserRiskProfile,
    abi: USER_RISK_PROFILE_ABI,
    functionName: 'profiles',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // 2. Agent Identity
  const { data: agentId } = useReadContract({
    address: CONTRACT_ADDRESSES.AegisAgent,
    abi: AEGIS_AGENT_ABI,
    functionName: 'walletToAgentId',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // 3. Vault Balances
  const { data: vaultBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.YieldVault,
    abi: YIELD_VAULT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: usdyBalance } = useReadContract({
    address: EXTERNAL_ADDRESSES.USDY as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: methBalance } = useReadContract({
    address: EXTERNAL_ADDRESSES.mETH as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const isProfileActive = userProfile ? (userProfile as any)[4] > 0n : false;

  useEffect(() => {
    if (isConnected && userProfile !== undefined && !isProfileActive && !showInitModal && !hasDismissedInit) {
      setShowInitModal(true);
    }
  }, [isConnected, userProfile, isProfileActive, showInitModal, hasDismissedInit]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="border-b border-zinc-800 sticky top-0 z-50 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover:scale-110 transition-transform">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">AEGIS</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={cn("flex items-center gap-2 text-sm font-medium transition-colors", activeTab === 'dashboard' ? "text-indigo-400" : "text-zinc-400 hover:text-zinc-200")}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('insights')}
              className={cn("flex items-center gap-2 text-sm font-medium transition-colors", activeTab === 'insights' ? "text-indigo-400" : "text-zinc-400 hover:text-zinc-200")}
            >
              <BrainCircuit size={18} /> AI Insights
            </button>
            <button 
              onClick={() => {
                setActiveTab('strategy');
                if (!recommendation) {
                  setExecutionStep('fetching');
                  fetchAIRecommendation(address!, userProfile).then(res => {
                    setRecommendation(res);
                    setExecutionStep('idle');
                  });
                }
              }}
              className={cn("flex items-center gap-2 text-sm font-medium transition-colors", activeTab === 'strategy' ? "text-indigo-400" : "text-zinc-400 hover:text-zinc-200")}
            >
              <Activity size={18} /> Strategies
            </button>
          </div>

          <WalletDropdown />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
              <Wallet className="w-10 h-10 text-zinc-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-zinc-500 max-w-sm mb-8">
              Join Aegis to manage your RWA yields with AI-guided precision on Mantle Network.
            </p>
            <WalletDropdown />
          </div>
        ) : (
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-zinc-800/50">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  Welcome back, {formatAddress(address!)}
                  {isProfileActive && <Badge variant="success">Active Profile</Badge>}
                </h1>
                <p className="text-zinc-500">Mantle Sepolia Testnet • Personal Yield Shield</p>
              </div>
              
              {isProfileActive ? (
                <div className="flex items-center gap-4">
                  <Card className="py-2 px-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                      <Bot size={16} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500">Agent ID</p>
                      <p className="text-sm font-mono font-bold">#{agentId?.toString() || '...'}</p>
                    </div>
                  </Card>
                </div>
              ) : (
                <button 
                  onClick={() => setShowInitModal(true)}
                  disabled={isInitializing}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center gap-2 group"
                >
                  {isInitializing ? 'Initializing...' : 'Initialize AI Profile'}
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>

            {/* Modal for Initialization */}
            {showInitModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => {
                  setShowInitModal(false);
                  setHasDismissedInit(true);
                }} />
                <Card className="relative w-full max-w-md border-zinc-700 shadow-2xl p-8">
                  <button 
                    onClick={() => {
                      setShowInitModal(false);
                      setHasDismissedInit(true);
                    }}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <h3 className="text-xl font-bold mb-4">Set Your Risk Profile</h3>
                  <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                    Define your risk appetite. This will shape the AI's yield strategies for your portfolio and mint your Aegis Agent NFT.
                  </p>
                  
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Risk Mode</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['Conservative', 'Moderate', 'Aggressive'].map((mode) => (
                          <button 
                            key={mode}
                            className="px-3 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-xs font-bold hover:border-indigo-500 hover:bg-indigo-500/10 transition-all"
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => {
                          writeInit({
                            address: CONTRACT_ADDRESSES.UserRiskProfile,
                            abi: USER_RISK_PROFILE_ABI,
                            functionName: 'initialize',
                            args: [1, 5000, 3000],
                          } as any);
                          setShowInitModal(false);
                        }}
                        className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] active:scale-[0.98]"
                      >
                        Confirm & Mint Agent
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Tab Routing */}
            {activeTab === 'dashboard' && (
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
                              onClick={() => setActiveTab('strategy')}
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
                              onClick={() => setActiveTab('strategy')}
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
                    <BrainCircuit className="text-purple-400" size={20} />
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
                          onClick={() => setActiveTab('insights')}
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
            )}

            {activeTab === 'insights' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="md:col-span-2 border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/5 overflow-hidden relative group">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                         <BrainCircuit size={120} className="text-indigo-500" />
                      </div>
                      
                      <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                            <Bot size={32} />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold tracking-tight">Market Strategy Engine</h2>
                            <p className="text-zinc-500 text-sm flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              AI Analysis Live • Groq Llama 3.1
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <Badge variant="success">94/100 Confidence</Badge>
                        </div>
                      </div>

                      <div className="relative z-10 space-y-6">
                        <div className="p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 leading-relaxed text-zinc-200">
                          <p className="text-lg italic">
                            "Mantle ecosystem liquidity is shifting towards RWA-backed stability. USDY yields are currently outperforming native ETH staking when accounting for the recent 12% drop in network activity. Recommendation: Maintain 60% USDY core holding but scale mETH rotation by 5% if sentiment index hits 0.85."
                          </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           {[
                             { label: 'Volatility', value: 'Low', color: 'text-emerald-400' },
                             { label: 'Liquidity', value: 'Prime', color: 'text-indigo-400' },
                             { label: 'Smart Money', value: 'Inflow', color: 'text-purple-400' },
                             { label: 'Risk Factor', value: '0.12', color: 'text-zinc-400' },
                           ].map((stat) => (
                             <div key={stat.label} className="p-3 bg-zinc-800/30 rounded-xl border border-zinc-800/50">
                               <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{stat.label}</p>
                               <p className={cn("text-sm font-bold font-mono", stat.color)}>{stat.value}</p>
                             </div>
                           ))}
                        </div>
                      </div>
                    </Card>

                    <Card className="border-purple-500/20 bg-purple-500/5">
                       <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                         <TrendingUp size={20} className="text-purple-400" />
                         Market Pulse
                       </h3>
                       <div className="space-y-6">
                         <div className="h-32 flex items-end justify-between gap-1 px-2">
                            {[40, 70, 45, 90, 65, 80, 50, 85, 95, 60].map((h, i) => (
                              <div 
                                key={i} 
                                className="w-full bg-gradient-to-t from-purple-500/20 to-purple-500/60 rounded-t-sm transition-all hover:to-purple-400 cursor-pointer" 
                                style={{ height: `${h}%` }}
                              />
                            ))}
                         </div>
                         <div className="pt-4 border-t border-zinc-800/50 space-y-4">
                            <div className="flex justify-between items-center">
                               <span className="text-sm text-zinc-400">Total RWA TVL</span>
                               <span className="text-sm font-bold text-white">$42.8M</span>
                            </div>
                            <div className="flex justify-between items-center">
                               <span className="text-sm text-zinc-400">24h Volume</span>
                               <span className="text-sm font-bold text-emerald-400">+$1.2M</span>
                            </div>
                         </div>
                       </div>
                    </Card>

                    <Card>
                       <div className="flex items-center justify-between mb-8">
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            <ShieldCheck size={20} className="text-emerald-400" />
                            Yield Intelligence
                          </h3>
                          <Info size={16} className="text-zinc-600" />
                       </div>
                       <div className="space-y-4">
                         {[
                           { name: 'USDY', apy: '5.10%', platform: 'Ondo', type: 'RWA', status: 'Optimal' },
                           { name: 'mETH', apy: '4.20%', platform: 'Mantle', type: 'LST', status: 'Stable' },
                           { name: 'cmETH', apy: '4.85%', platform: 'Mantle', type: 'LST', status: 'Trending' },
                         ].map((item) => (
                           <div key={item.name} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all group">
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center font-bold text-xs group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">{item.name[0]}</div>
                               <div>
                                 <p className="font-bold text-sm">{item.name}</p>
                                 <p className="text-[10px] text-zinc-600 uppercase tracking-tighter">{item.platform} • {item.type}</p>
                               </div>
                             </div>
                             <div className="text-right">
                               <p className="text-lg font-mono font-bold text-emerald-400">{item.apy}</p>
                               <Badge variant={item.status === 'Optimal' ? 'success' : 'default'}>{item.status}</Badge>
                             </div>
                           </div>
                         ))}
                       </div>
                    </Card>

                    <Card className="border-indigo-500/10 h-full relative overflow-hidden">
                       <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.1),transparent)]" />
                       <h3 className="text-lg font-bold mb-8 flex items-center gap-2 relative z-10">
                         <Activity size={20} className="text-indigo-400" />
                         Sentiment Radar
                       </h3>
                       <div className="space-y-8 relative z-10">
                         <div>
                            <div className="flex justify-between mb-3 items-end">
                              <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 block mb-1">Social Sentiment</span>
                                <span className="text-emerald-400 text-xl font-bold font-mono">+0.82</span>
                              </div>
                              <span className="text-[10px] text-zinc-600">Powered by Elfa AI</span>
                            </div>
                            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full w-[82%] shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                            </div>
                         </div>
                         <div>
                            <div className="flex justify-between mb-3 items-end">
                              <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 block mb-1">On-Chain Flow</span>
                                <span className="text-indigo-400 text-xl font-bold font-mono">+0.65</span>
                              </div>
                              <span className="text-[10px] text-zinc-600">Smart Money Index</span>
                            </div>
                            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full w-[65%] shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                            </div>
                         </div>
                         <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/5 text-[11px] text-zinc-500 leading-relaxed italic">
                            "Whale activity on Mantle RWA vaults has increased by 400 MNT in the last 4 hours. Social buzz is neutral, suggesting room for growth before peak saturation."
                         </div>
                       </div>
                    </Card>

                    <Card className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-black border-zinc-800">
                       <div className="absolute -right-10 -bottom-10 opacity-5">
                          <History size={150} />
                       </div>
                       <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                         <History size={20} className="text-zinc-500" />
                         Execution History
                       </h3>
                       <div className="space-y-4">
                          {[
                            { action: 'Rebalance', assets: 'USDY → mETH', time: '2h ago', status: 'Success' },
                            { action: 'Committed', assets: 'Risk Profile Mod', time: '5h ago', status: 'Success' },
                            { action: 'Executed', assets: 'mETH Compound', time: '1d ago', status: 'Success' },
                          ].map((log, i) => (
                            <div key={i} className="flex justify-between items-center py-3 border-b border-zinc-800 last:border-0">
                               <div>
                                  <p className="text-sm font-bold">{log.action}</p>
                                  <p className="text-[10px] text-zinc-500">{log.assets}</p>
                               </div>
                               <div className="text-right">
                                  <p className="text-xs font-mono">{log.time}</p>
                                  <Badge>{log.status}</Badge>
                               </div>
                            </div>
                          ))}
                       </div>
                       <button className="w-full mt-6 py-2 bg-zinc-800/50 hover:bg-zinc-800 text-xs font-bold rounded-lg border border-zinc-700 transition-colors">
                         View Full Explorer
                       </button>
                    </Card>
                 </div>
              </div>
            )}

            {activeTab === 'strategy' && (
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
                        <span className="text-[10px] text-zinc-500 font-mono">Nonce: #[COMMIT_ID]</span>
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

                    <div className="flex items-center gap-3 px-4 text-zinc-500 italic">
                       <Bot size={16} />
                       <p className="text-[10px] leading-tight">
                         AI agent #[{agentId?.toString() || '...'}] will record this advice on Mantle before execution.
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(63,66,241,0.1),transparent_50%)]" />
      <div className="fixed bottom-0 right-0 w-full h-full pointer-events-none -z-10 bg-[radial-gradient(circle_at_100%_100%,rgba(168,85,247,0.05),transparent_40%)]" />
    </div>
  );
}

export default App;
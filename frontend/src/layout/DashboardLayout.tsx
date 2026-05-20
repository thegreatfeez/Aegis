import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  ShieldCheck, 
  Activity,
  Bot,
  ChevronRight,
  X
} from 'lucide-react';
import { cn, formatAddress } from '../lib/utils';
import { 
  CONTRACT_ADDRESSES, 
  USER_RISK_PROFILE_ABI, 
  AEGIS_AGENT_ABI 
} from '../lib/contracts';
import { WalletDropdown } from '../components/Shared/WalletDropdown';
import { Badge } from '../components/Shared/Badge';
import { Card } from '../components/Shared/Card';

export const DashboardLayout = () => {
  const { address, isConnected } = useAccount();
  const location = useLocation();
  const [showInitModal, setShowInitModal] = useState(false);
  const [hasDismissedInit, setHasDismissedInit] = useState(false);

  const { writeContract: writeInit, isPending: isInitializing } = useWriteContract();

  const { data: userProfile } = useReadContract({
    address: CONTRACT_ADDRESSES.UserRiskProfile,
    abi: USER_RISK_PROFILE_ABI,
    functionName: 'profiles',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: agentId } = useReadContract({
    address: CONTRACT_ADDRESSES.AegisAgent,
    abi: AEGIS_AGENT_ABI,
    functionName: 'walletToAgentId',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const isProfileActive = userProfile ? (userProfile as any)[4] > 0n : false;

  useEffect(() => {
    if (isConnected && userProfile !== undefined && !isProfileActive && !showInitModal && !hasDismissedInit) {
      setShowInitModal(true);
    }
  }, [isConnected, userProfile, isProfileActive, showInitModal, hasDismissedInit]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Insights', path: '/insights', icon: BrainCircuit },
    { name: 'Strategies', path: '/strategy', icon: Activity },
  ];

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
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  isActive ? "text-indigo-400" : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                <item.icon size={18} /> {item.name}
              </NavLink>
            ))}
          </div>

          <WalletDropdown />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             {/* Simple Connect State */}
             <Bot size={64} className="text-zinc-700 mb-6" />
             <h2 className="text-2xl font-bold mb-2">Connect to Aegis</h2>
             <p className="text-zinc-500 mb-8 max-w-sm">Access your AI-guided yield portfolio on Mantle.</p>
             <WalletDropdown />
          </div>
        ) : (
          <div className="space-y-10">
            {/* Header */}
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

            {/* Content Slot */}
            <Outlet />
          </div>
        )}
      </main>

      {/* Modal moved here for universal access */}
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

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(63,66,241,0.1),transparent_50%)]" />
      <div className="fixed bottom-0 right-0 w-full h-full pointer-events-none -z-10 bg-[radial-gradient(circle_at_100%_100%,rgba(168,85,247,0.05),transparent_40%)]" />
    </div>
  );
};

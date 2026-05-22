import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  Bot, 
  ShieldCheck,
  Activity,
  ChevronRight,
  X,
  HelpCircle,
  Menu
} from 'lucide-react';
import { cn, formatAddress } from '../lib/utils';
import { 
  CONTRACT_ADDRESSES, 
  USER_RISK_PROFILE_ABI, 
  AEGIS_AGENT_ABI 
} from '../lib/contracts';
import { WalletDropdown } from '../components/Shared/WalletDropdown';
import { Badge } from '../components/Shared/Badge';

const RISK_PRESETS = [
  {
    label: 'Conservative',
    idx: 0 as const,
    dot: 'bg-accent-blue',
    args: [1, 3000, 1000] as const,
    maxAllocation: '30%',
    stopLoss: '10%',
    summary: 'Lower exposure caps with tighter downside protection.',
  },
  {
    label: 'Moderate',
    idx: 1 as const,
    dot: 'bg-accent-success',
    args: [2, 5000, 2000] as const,
    maxAllocation: '50%',
    stopLoss: '20%',
    summary: 'Balanced risk limits for standard automated strategy flows.',
  },
  {
    label: 'Aggressive',
    idx: 2 as const,
    dot: 'bg-accent-warning',
    args: [3, 8000, 3500] as const,
    maxAllocation: '80%',
    stopLoss: '35%',
    summary: 'Wider position limits for higher-growth strategy behavior.',
  },
] as const;

type UserProfileRecord = readonly [`0x${string}`, number, number, number, bigint, bigint];

export const DashboardLayout = () => {
  const { address, isConnected } = useAccount();
  const [showInitModal, setShowInitModal] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<0 | 1 | 2>(1);
  const [dismissedInitForAddress, setDismissedInitForAddress] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const {
    writeContract: writeInit,
    data: initHash,
    error: initError,
    isPending: isSubmittingInit,
  } = useWriteContract();

  const { data: userProfile, refetch: refetchUserProfile } = useReadContract({
    address: CONTRACT_ADDRESSES.UserRiskProfile,
    abi: USER_RISK_PROFILE_ABI,
    functionName: 'profiles',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: agentId, refetch: refetchAgentId } = useReadContract({
    address: CONTRACT_ADDRESSES.AegisAgent,
    abi: AEGIS_AGENT_ABI,
    functionName: 'walletToAgentId',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const {
    isLoading: isConfirmingInit,
    isSuccess: isInitConfirmed,
    error: initReceiptError,
  } = useWaitForTransactionReceipt({
    hash: initHash,
  });

  const profileRecord = userProfile as UserProfileRecord | undefined;
  const isProfileActive = !!profileRecord && profileRecord[4] > 0n;
  const isInitBusy = isSubmittingInit || isConfirmingInit;
  const selectedPreset = RISK_PRESETS[selectedRisk];
  const shouldPromptForInit =
    isConnected &&
    userProfile !== undefined &&
    !isProfileActive &&
    dismissedInitForAddress !== address;
  const isInitModalOpen = showInitModal || shouldPromptForInit;
  const initErrorMessage =
    (initError as { shortMessage?: string; message?: string } | null)?.shortMessage ??
    (initError as { message?: string } | null)?.message ??
    (initReceiptError as { shortMessage?: string; message?: string } | null)?.shortMessage ??
    (initReceiptError as { message?: string } | null)?.message ??
    null;

  useEffect(() => {
    if (!isInitConfirmed) return;

    const syncIdentity = window.setTimeout(() => {
      void refetchUserProfile();
      void refetchAgentId();
      setShowInitModal(false);
      setSelectedRisk(1);
      setDismissedInitForAddress(address ?? null);
    }, 0);

    return () => window.clearTimeout(syncIdentity);
  }, [address, isInitConfirmed, refetchAgentId, refetchUserProfile]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Insights', path: '/insights', icon: BrainCircuit },
    { name: 'Strategy', path: '/strategy', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans selection:bg-accent-blue/30 overflow-x-hidden">
      <nav className=" sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 md:gap-3 group">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-accent-blue rounded-[10px] flex items-center justify-center border border-white/10 transition-transform group-hover:scale-105">
              <ShieldCheck className="text-white w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base md:text-lg font-black tracking-tight leading-none font-heading uppercase">AEGIS</span>
              <span className="text-[8px] md:text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5 hidden xs:block">Asset Guardian</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-all",
                  isActive 
                    ? "text-text-primary border-b-2 border-accent-blue pb-1 -mb-[2px]" 
                    : "text-text-muted hover:text-text-secondary pb-1 -mb-[2px] border-b-2 border-transparent"
                )}
              >
                {/* {({ isActive }) => ( */}
                  <>
                    {/* <item.icon size={14} className={isActive ? "text-accent-blue" : "text-text-muted"} />  */}
                    {item.name}
                  </>
                {/* )} */}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden sm:block">
              <WalletDropdown />
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-text-muted hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-bg-primary border-b border-border-subtle overflow-hidden"
            >
              <div className="p-6 space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-4 p-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all",
                      isActive 
                        ? "bg-accent-blue/10 text-text-primary border border-accent-blue/20" 
                        : "text-text-muted hover:text-white hover:bg-bg-secondary"
                    )}
                  >
                    <item.icon size={18} />
                    {item.name}
                  </NavLink>
                ))}
                <div className="pt-4 sm:hidden">
                  <WalletDropdown />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-6 md:py-10">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
             <div className="w-16 h-16 md:w-20 md:h-20 bg-bg-secondary rounded-[20px] flex items-center justify-center border border-border-subtle mb-6 md:mb-8 relative">
                <Bot size={32} className="text-text-muted" />
             </div>
             <h2 className="text-2xl md:text-3xl font-black mb-3 md:mb-4 tracking-tight font-heading uppercase">Initialize Secure Terminal</h2>
             <p className="text-text-secondary mb-8 md:mb-10 max-w-sm text-sm font-medium">Verify your decentralized identity to access AI-driven yield strategies on Mantle.</p>
             <WalletDropdown />
          </div>
        ) : (
          <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8 pb-6 md:pb-10">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white font-heading">
                    {formatAddress(address!)}
                  </h1>
                  {isProfileActive && <Badge variant="success">Secured</Badge>}
                </div>
                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                  <p className="text-text-muted text-[10px] font-bold  tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-success" />
                    Mantle Sepolia Node
                  </p>
                  <span className="hidden xs:block w-1 h-1 rounded-full bg-border-subtle" />
                  <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">v1.2.0 Stable</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {isProfileActive ? (
                  <div className="w-full sm:w-auto py-2.5 px-4 md:px-5 flex items-center gap-4 bg-bg-secondary border border-border-subtle rounded-[12px] hover:border-accent-blue/30 transition-colors">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-[10px] bg-bg-card flex items-center justify-center border border-border-subtle">
                      <Bot size={18} className="text-text-secondary" />
                    </div>
                    <div>
                      <p className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-text-muted flex items-center gap-1.5">
                        Active Agent
                        <span title="Your unique on-chain AI representative." className="cursor-help flex items-center">
                          <HelpCircle size={10} className="text-text-muted" />
                        </span>
                      </p>
                      <p className="text-xs md:text-sm font-mono font-black text-white leading-none mt-1">ID: #{agentId?.toString() || '...'}</p>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setSelectedRisk(1);
                      setShowInitModal(true);
                    }}
                    disabled={isInitBusy}
                    className="w-full sm:w-auto btn-primary flex items-center justify-center gap-3 py-3 px-8 text-sm"
                  >
                    {isConfirmingInit ? 'Confirming Identity...' : isSubmittingInit ? 'Check Wallet...' : 'Initialize Identity'}
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="pt-2">
              <Outlet />
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {isInitModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm"
              onClick={() => {
                if (isInitBusy) return;
                setShowInitModal(false);
                setSelectedRisk(1);
                setDismissedInitForAddress(address ?? null);
              }}
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="relative w-full max-w-[22rem] bg-bg-card border-t sm:border-t-0 sm:border border-border-subtle rounded-t-[22px] sm:rounded-[18px] overflow-hidden shadow-2xl p-5 sm:p-5"
            >
              {/* Close */}
              <button
                onClick={() => {
                  if (isInitBusy) return;
                  setShowInitModal(false);
                  setSelectedRisk(1);
                  setDismissedInitForAddress(address ?? null);
                }}
                disabled={isInitBusy}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors bg-bg-secondary p-1.5 rounded-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={16} />
              </button>

              {/* Header */}
              <div className="mb-4 pr-8">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-accent-blue mb-1 block">Agent Initialization</span>
                <h3 className="text-lg font-black text-text-primary tracking-tight font-heading uppercase">Configure Identity</h3>
                <p className="text-text-muted text-xs leading-relaxed mt-1">
                  This sets your on-chain risk profile so Aegis knows how far it can allocate and rebalance for you.
                </p>
              </div>

              {/* Risk selector */}
              <div className="mb-4">
                <label className="block text-[9px] font-bold uppercase tracking-widest text-accent-blue mb-3">Risk Profile</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {RISK_PRESETS.map((item) => {
                    const isSelected = selectedRisk === item.idx;
                    return (
                      <button
                        key={item.label}
                        onClick={() => setSelectedRisk(item.idx as 0 | 1 | 2)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 px-2 py-3 rounded-[12px] border transition-all text-center',
                          isSelected
                            ? 'border-accent-blue bg-accent-blue/10'
                            : 'border-border-subtle bg-bg-secondary hover:border-accent-blue/40'
                        )}
                      >
                        <div className={cn('w-2 h-2 rounded-full', item.dot)} />
                        <span className={cn(
                          'text-[8px] font-bold uppercase tracking-widest leading-tight',
                          isSelected ? 'text-text-primary' : 'text-text-muted'
                        )}>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description chips */}
              <div className="mb-4 rounded-[14px] border border-border-subtle bg-bg-secondary/70 p-3">
                <p className="text-[10px] font-medium leading-relaxed text-text-secondary">
                  {selectedPreset.summary}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-[10px] bg-bg-primary/50 px-2 py-2">
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-text-muted">Max Alloc</p>
                    <p className="mt-1 text-sm font-black text-text-primary">{selectedPreset.maxAllocation}</p>
                  </div>
                  <div className="rounded-[10px] bg-bg-primary/50 px-2 py-2">
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-text-muted">Stop Loss</p>
                    <p className="mt-1 text-sm font-black text-text-primary">{selectedPreset.stopLoss}</p>
                  </div>
                </div>
              </div>

              {initErrorMessage && (
                <div className="mb-4 rounded-[12px] border border-accent-warning/30 bg-accent-warning/10 px-3 py-2">
                  <p className="text-[10px] leading-relaxed text-accent-warning">{initErrorMessage}</p>
                </div>
              )}

              {/* CTA */}
              <button
                disabled={isInitBusy}
                onClick={() => {
                  writeInit({
                    address: CONTRACT_ADDRESSES.UserRiskProfile,
                    abi: USER_RISK_PROFILE_ABI,
                    functionName: 'initialize',
                    args: selectedPreset.args,
                  });
                }}
                className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isConfirmingInit ? 'Confirming On-Chain...' : isSubmittingInit ? 'Awaiting Wallet...' : 'Confirm Identity'}
                <ShieldCheck size={16} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

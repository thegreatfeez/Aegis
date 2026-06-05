import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { parseUnits, formatUnits as viemFormatUnits } from 'viem';
import { fetchAIRecommendation } from '../../services/ai';
import {
  TrendingUp,
  History,
  ArrowRightLeft,
  Bot,
  Info,
  ChevronRight,
  ShieldCheck,
  Droplets,
  Vault,
} from 'lucide-react';
import {
  CONTRACT_ADDRESSES,
  EXTERNAL_ADDRESSES,
  USER_RISK_PROFILE_ABI,
  YIELD_VAULT_ABI,
  ERC20_ABI,
  MOCK_ERC20_ABI,
  AEGIS_AGENT_ABI
} from '../../lib/contracts';
import { formatUnits, cn } from '../../lib/utils';
import { Card } from '../Shared/Card';
import { Badge } from '../Shared/Badge';

export const Dashboard = () => {
  const { address } = useAccount();
  const navigate = useNavigate();
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const { data: userProfile } = useReadContract({
    address: CONTRACT_ADDRESSES.UserRiskProfile,
    abi: USER_RISK_PROFILE_ABI,
    functionName: 'profiles',
    args: address ? [address] : undefined,
  });

  const { data: vaultBalance, refetch: refetchVault } = useReadContract({
    address: CONTRACT_ADDRESSES.YieldVault,
    abi: YIELD_VAULT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const [vaultTab, setVaultTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [vaultAmount, setVaultAmount] = useState('');

  const { data: vaultAllowance, refetch: refetchVaultAllowance } = useReadContract({
    address: EXTERNAL_ADDRESSES.USDY as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACT_ADDRESSES.YieldVault] : undefined,
  });

  const { writeContract: approveVault, data: approveVaultHash, isPending: approvingVault } = useWriteContract();
  const { isLoading: confirmingVaultApprove, isSuccess: vaultApproveConfirmed } = useWaitForTransactionReceipt({ hash: approveVaultHash });

  const { writeContract: depositVault, data: depositHash, isPending: depositing } = useWriteContract();
  const { isLoading: confirmingDeposit, isSuccess: depositConfirmed } = useWaitForTransactionReceipt({ hash: depositHash });

  const { writeContract: withdrawVault, data: withdrawHash, isPending: withdrawing } = useWriteContract();
  const { isLoading: confirmingWithdraw, isSuccess: withdrawConfirmed } = useWaitForTransactionReceipt({ hash: withdrawHash });

  useEffect(() => { if (vaultApproveConfirmed) void refetchVaultAllowance(); }, [vaultApproveConfirmed]);
  useEffect(() => { if (depositConfirmed) { void refetchVault(); void refetchUsdy(); setVaultAmount(''); } }, [depositConfirmed]);
  useEffect(() => { if (withdrawConfirmed) { void refetchVault(); void refetchUsdy(); setVaultAmount(''); } }, [withdrawConfirmed]);

  const vaultAmountBigInt = (() => {
    try {
      const n = Number(vaultAmount);
      if (!vaultAmount || n <= 0 || !isFinite(n)) return undefined;
      return parseUnits(String(n), 18);
    } catch { return undefined; }
  })();

  const needsVaultApproval = vaultTab === 'deposit' && vaultAmountBigInt !== undefined &&
    ((vaultAllowance as bigint | undefined) ?? 0n) < vaultAmountBigInt;

  const { data: usdyBalance, refetch: refetchUsdy } = useReadContract({
    address: EXTERNAL_ADDRESSES.USDY as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: methBalance, refetch: refetchMeth } = useReadContract({
    address: EXTERNAL_ADDRESSES.mETH as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const MINT_AMOUNT = parseUnits('1000', 18);

  const { writeContract: mintUsdy, data: usdyMintHash, isPending: mintingUsdy } = useWriteContract();
  const { writeContract: mintMeth, data: methMintHash, isPending: mintingMeth } = useWriteContract();

  const { isLoading: confirmingUsdy, isSuccess: usdyMinted } = useWaitForTransactionReceipt({ hash: usdyMintHash });
  const { isLoading: confirmingMeth, isSuccess: methMinted } = useWaitForTransactionReceipt({ hash: methMintHash });

  useEffect(() => { if (usdyMinted) void refetchUsdy(); }, [usdyMinted, refetchUsdy]);
  useEffect(() => { if (methMinted) void refetchMeth(); }, [methMinted, refetchMeth]);

  const { data: agentId } = useReadContract({
    address: CONTRACT_ADDRESSES.AegisAgent,
    abi: AEGIS_AGENT_ABI,
    functionName: 'walletToAgentId',
    args: address ? [address] : undefined,
  });

  const { data: stats } = useReadContract({
    address: CONTRACT_ADDRESSES.AegisAgent,
    abi: AEGIS_AGENT_ABI,
    functionName: 'getAgentStats',
    args: agentId ? [agentId as bigint] : undefined,
    query: { enabled: !!agentId }
  });

  const [commitmentCount, executionCount] = stats as [bigint, bigint] || [0n, 0n];

  useEffect(() => {
    if (!address || !userProfile) return;
    const [, riskMode, maxPositionBps, , createdAt] = userProfile as unknown as any[];
    if (!createdAt) return;
    const usdyBal = usdyBalance ? Number(usdyBalance as bigint) / 1e18 : 0;
    const methBal = methBalance ? Number(methBalance as bigint) / 1e18 : 0;
    fetchAIRecommendation(address, {
      portfolioValueUsd: usdyBal + methBal,
      riskMode: Number(riskMode) as 0 | 1 | 2,
      maxPositionBps: Number(maxPositionBps),
      usdyBalance: usdyBal,
      methBalance: methBal,
      agentId: Number(agentId ?? 0),
    })
      .then(rec => setAiSummary(rec.summary))
      .catch(() => {});
  }, [userProfile, address]); 

  const assets = [
    { name: 'USDY', detail: 'Ondo Finance RWA', balance: usdyBalance, risk: 'Low Risk', initial: 'U' },
    { name: 'mETH', detail: 'Mantle Staked ETH', balance: methBalance, risk: 'Moderate', initial: 'M' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-2 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:border-accent-blue/30 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-2.5 bg-bg-secondary rounded-[10px] text-accent-blue border border-border-subtle">
                <TrendingUp size={22} />
              </div>
              <Badge variant="success">Active Strategy</Badge>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest mb-2">
              Managed Vault Value
              <span title="Combined value across all RWA-yield vaults." className="cursor-help">
                <Info size={10} />
              </span>
            </div>
            <p className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary font-heading mb-5">
              {vaultBalance ? formatUnits(vaultBalance as bigint) : '0.00'} <span className="text-xs md:text-sm font-bold">aUSDY</span>
            </p>

            {/* Vault deposit / withdraw */}
            <div className="border-t border-border-subtle pt-4 space-y-3">
              <div className="flex gap-1 p-1 bg-bg-secondary rounded-[8px] border border-border-subtle">
                {(['deposit', 'withdraw'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => { setVaultTab(tab); setVaultAmount(''); }}
                    className={cn(
                      'flex-1 py-1.5 text-[9px] font-bold tracking-widest rounded-[6px] transition-colors',
                      vaultTab === tab ? 'bg-bg-primary text-text-primary' : 'text-text-muted hover:text-text-secondary'
                    )}
                  >
                    {tab === 'deposit' ? 'DEPOSIT' : 'WITHDRAW'}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={vaultAmount}
                  onChange={e => setVaultAmount(e.target.value)}
                  className="flex-1 bg-bg-secondary border border-border-subtle rounded-[8px] px-3 py-2 text-xs font-mono font-bold text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50 transition-colors"
                />
                <button
                  onClick={() => {
                    const bal = vaultTab === 'deposit' ? usdyBalance : vaultBalance;
                    if (bal) setVaultAmount(viemFormatUnits(bal as bigint, 18));
                  }}
                  className="px-2.5 bg-bg-secondary border border-border-subtle rounded-[8px] text-[9px] font-bold tracking-widest text-text-secondary hover:text-text-primary transition-colors"
                >
                  MAX
                </button>
              </div>

              <p className="text-[9px] text-text-muted">
                {vaultTab === 'deposit'
                  ? `Wallet: ${usdyBalance ? formatUnits(usdyBalance as bigint) : '0.00'} USDY`
                  : `Vault: ${vaultBalance ? formatUnits(vaultBalance as bigint) : '0.00'} aUSDY`}
              </p>

              {vaultTab === 'deposit' ? (
                needsVaultApproval ? (
                  <button
                    onClick={() => approveVault({
                      address: EXTERNAL_ADDRESSES.USDY as `0x${string}`,
                      abi: ERC20_ABI,
                      functionName: 'approve',
                      args: [CONTRACT_ADDRESSES.YieldVault, vaultAmountBigInt!],
                    })}
                    disabled={!vaultAmountBigInt || approvingVault || confirmingVaultApprove}
                    className="btn-secondary w-full py-2.5 text-[9px] tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Vault size={12} />
                    {approvingVault ? 'Check Wallet...' : confirmingVaultApprove ? 'Confirming...' : 'Approve USDY'}
                  </button>
                ) : (
                  <button
                    onClick={() => depositVault({
                      address: CONTRACT_ADDRESSES.YieldVault,
                      abi: YIELD_VAULT_ABI,
                      functionName: 'deposit',
                      args: [vaultAmountBigInt!, address!],
                    })}
                    disabled={!vaultAmountBigInt || depositing || confirmingDeposit || !address}
                    className="btn-primary w-full py-2.5 text-[9px] tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Vault size={12} />
                    {depositing ? 'Check Wallet...' : confirmingDeposit ? 'Confirming...' : depositConfirmed ? '✓ Deposited' : 'Deposit USDY'}
                  </button>
                )
              ) : (
                <button
                  onClick={() => withdrawVault({
                    address: CONTRACT_ADDRESSES.YieldVault,
                    abi: YIELD_VAULT_ABI,
                    functionName: 'withdraw',
                    args: [vaultAmountBigInt!, address!, address!],
                  })}
                  disabled={!vaultAmountBigInt || withdrawing || confirmingWithdraw || !address}
                  className="btn-secondary w-full py-2.5 text-[9px] tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Vault size={12} />
                  {withdrawing ? 'Check Wallet...' : confirmingWithdraw ? 'Confirming...' : withdrawConfirmed ? '✓ Withdrawn' : 'Withdraw USDY'}
                </button>
              )}
            </div>
          </Card>

          <Card className="hover:border-accent-blue/30 transition-all group ">
            <div className="flex justify-between items-start mb-6">
              <div className="p-2.5 bg-bg-secondary rounded-[10px] text-accent-blue border border-border-subtle">
                <History size={22} />
              </div>
            </div>
            <div className="text-[10px] font-bold tracking-widest mb-2">Execution Status</div>
            <div className="flex items-baseline gap-2.5">
              <p className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary font-heading">{executionCount.toString()}</p>
              <span className="text-[10px] font-bold tracking-widest">Settled</span>
              <span className="text-border-subtle">/</span>
              <p className="text-xl md:text-2xl font-bold text-text-secondary font-heading">{commitmentCount.toString()}</p>
              <span className="text-[10px] font-bold tracking-widest">Commits</span>
            </div>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
          <h2 className="text-xl font-bold flex items-center gap-2.5 text-text-primary font-heading tracking-tight">
            <ArrowRightLeft className="text-accent-blue" size={20} />
            Asset Portfolio
          </h2>
          <span className="text-[9px] font-bold tracking-[0.2em] inline-block self-start sm:self-auto">Mantle Sepolia Network</span>
        </div>
        
        <div className="hidden sm:block">
          <Card className="p-0 overflow-hidden ">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-secondary/50 border-b border-border-subtle">
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest">Asset Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-right">Position</th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest">Security Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold tracking-widest text-center">Protocol</th>
                </tr>
              </thead>
              <tbody className="">
                {assets.map((row) => (
                  <tr key={row.name} className="hover:bg-bg-secondary/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 bg-bg-secondary rounded-[10px] flex items-center justify-center font-bold text-sm border border-border-subtle text-text-secondary group-hover:border-accent-blue/50 transition-colors">{row.initial}</div>
                        <div>
                          <p className="font-bold text-text-primary text-sm">{row.name}</p>
                          <p className="text-[10px] font-bold tracking-tight">{row.detail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-right font-bold text-text-primary">
                      {row.balance ? formatUnits(row.balance as bigint) : '0.00'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={row.risk === 'Low Risk' ? 'success' : 'default'}>{row.risk}</Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => navigate('/strategy')}
                        className="btn-secondary py-1.5 px-4 text-[10px] tracking-widest flex items-center gap-2 mx-auto"
                      >
                        Audit <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="sm:hidden space-y-4">
          {assets.map((asset) => (
            <Card key={asset.name} className="bg-bg-card border-border-subtle p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-bg-secondary rounded-[10px] flex items-center justify-center font-bold border border-border-subtle text-text-secondary">{asset.initial}</div>
                  <div>
                    <p className="font-bold text-text-primary">{asset.name}</p>
                    <p className="text-[10px] font-bold tracking-tight">{asset.detail}</p>
                  </div>
                </div>
                <Badge variant={asset.risk === 'Low Risk' ? 'success' : 'default'}>{asset.risk}</Badge>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold tracking-widest mb-1">Your Position</p>
                  <p className="text-xl font-bold text-text-primary font-mono">{asset.balance ? formatUnits(asset.balance as bigint) : '0.00'}</p>
                </div>
                <button 
                  onClick={() => navigate('/strategy')}
                  className="btn-secondary py-2 px-6 text-[10px] tracking-widest flex items-center gap-2"
                >
                  Manage <ChevronRight size={12} />
                </button>
              </div>
            </Card>
          ))}
        </div>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-bg-secondary rounded-[10px] border border-border-subtle">
                <Droplets size={16} className="text-accent-blue" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest text-text-primary">Testnet Faucet</p>
                <p className="text-xs text-text-muted mt-0.5">Mint test tokens on Mantle Sepolia</p>
              </div>
            </div>
            <Badge variant="default">Testnet Only</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => mintUsdy({
                address: EXTERNAL_ADDRESSES.USDY as `0x${string}`,
                abi: MOCK_ERC20_ABI,
                functionName: 'mint',
                args: [address!, MINT_AMOUNT],
              })}
              disabled={mintingUsdy || confirmingUsdy || !address}
              className="btn-secondary py-2.5 text-[10px] tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Droplets size={12} />
              {mintingUsdy ? 'Check Wallet...' : confirmingUsdy ? 'Confirming...' : usdyMinted ? '✓ 1,000 USDY Minted' : 'Mint 1,000 USDY'}
            </button>
            <button
              onClick={() => mintMeth({
                address: EXTERNAL_ADDRESSES.mETH as `0x${string}`,
                abi: MOCK_ERC20_ABI,
                functionName: 'mint',
                args: [address!, MINT_AMOUNT],
              })}
              disabled={mintingMeth || confirmingMeth || !address}
              className="btn-secondary py-2.5 text-[10px] tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Droplets size={12} />
              {mintingMeth ? 'Check Wallet...' : confirmingMeth ? 'Confirming...' : methMinted ? '✓ 1,000 mETH Minted' : 'Mint 1,000 mETH'}
            </button>
          </div>
        </Card>
      </div>

      <div className="space-y-8">
        <h2 className="text-xl font-bold flex items-center gap-2.5 text-text-primary font-heading tracking-tight">
          <Bot className="text-accent-blue" size={20} />
          Agent Intelligence
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          <Card className=" p-6 group h-fit">
            <div className="flex items-center gap-3 text-text-primary mb-5 border-b border-border-subtle pb-4">
              <div className="w-10 h-10 bg-bg-secondary rounded-[10px] flex items-center justify-center border border-border-subtle group-hover:border-accent-blue/50 transition-all">
                <Bot size={22} className="text-text-secondary" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest block">Market Alpha Signal</span>
                <span className="text-xs text-text-secondary">Ecosystem Liquidity Flow</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-text-secondary mb-8 font-medium italic bg-bg-secondary/40 p-4 rounded-[12px] border border-border-subtle">
              {aiSummary ?? 'Analysing live market conditions and yield dynamics…'}
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="success">92% Match</Badge>
              <button 
                onClick={() => navigate('/insights')}
                className="text-accent-blue text-[10px] font-bold tracking-widest hover:underline transition-all"
              >
                Open Insights →
              </button>
            </div>
          </Card>

          <Card className=" h-fit">
            <h3 className="text-[10px] font-bold tracking-widest mb-8 flex items-center gap-2">
              <ShieldCheck size={14} className="text-accent-success" />
              Autonomous Constraints
            </h3>
            <div className="space-y-10">
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-bold tracking-widest">
                  <span className="text-text-secondary">Concentration Guard</span>
                  <span className="text-accent-blue font-mono font-bold">{userProfile ? Number((userProfile as any)[3]) / 100 : '0'}%</span>
                </div>
                <div className="w-full bg-bg-secondary h-1.5 rounded-full overflow-hidden p-[1px] border border-border-subtle">
                  <div 
                    className="bg-accent-blue h-full rounded-full transition-all" 
                    style={{ width: `${userProfile ? Number((userProfile as any)[3]) / 100 : 0}%` }} 
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-bold tracking-widest">
                  <span className="text-text-secondary">Position Limit</span>
                  <span className="text-accent-success font-mono font-bold">{userProfile ? Number((userProfile as any)[2]) / 100 : '0'}%</span>
                </div>
                <div className="w-full bg-bg-secondary h-1.5 rounded-full overflow-hidden p-[1px] border border-border-subtle">
                  <div 
                    className="bg-accent-success h-full rounded-full transition-all" 
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

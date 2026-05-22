import { useState } from 'react';
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { ChevronRight, X } from 'lucide-react';
import { cn, formatAddress } from '../../lib/utils';
import { Badge } from './Badge';

export const WalletDropdown = () => {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { chains, switchChain } = useSwitchChain();
  const [isOpen, setIsOpen] = useState(false);

  if (!isConnected) return <ConnectKitButton />;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-bg-secondary border border-border-subtle rounded-[10px] hover:border-text-muted transition-all font-mono text-xs font-bold text-text-primary"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-accent-success" />
        {formatAddress(address!)}
        <ChevronRight size={14} className={cn("transition-transform text-text-muted", isOpen ? "rotate-90" : "rotate-0")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-56 bg-bg-card rounded-[12px] z-[70] overflow-hidden animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
            <div className="p-3 border-b border-border-subtle bg-bg-primary/30">
              <p className="px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-text-muted font-black">Environment</p>
              <button 
                onClick={() => {
                  if (chains[0]) switchChain({ chainId: chains[0].id });
                  setIsOpen(false);
                }}
                className="w-full text-left px-2 py-2.5 text-[11px] font-bold text-text-secondary hover:bg-bg-secondary rounded-[8px] transition-colors flex items-center justify-between group"
              >
                <span className="group-hover:text-text-primary">{chain?.name || 'Mantle Sepolia'}</span>
                <Badge variant="success">Online</Badge>
              </button>
            </div>
            <div className="p-1.5">
              <button 
                onClick={() => {
                  disconnect();
                  setIsOpen(false);
                }}
                className="w-full text-left px-2 py-2.5 text-[11px] font-bold text-accent-danger hover:bg-accent-danger/10 rounded-[8px] transition-colors flex items-center gap-3"
              >
                <X size={14} /> Kill Session
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

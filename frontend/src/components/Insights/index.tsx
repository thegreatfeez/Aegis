import { 
  BrainCircuit, 
  Bot, 
  TrendingUp, 
  ShieldCheck, 
  Info,
  Activity,
  History
} from 'lucide-react';
import { Card } from '../Shared/Card';
import { Badge } from '../Shared/Badge';
import { cn } from '../../lib/utils';

export const Insights = () => {
  return (
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
            <Badge variant="success">94/100 Confidence</Badge>
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
        </Card>
      </div>
    </div>
  );
};

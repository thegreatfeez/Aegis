import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Activity, BrainCircuit, Zap, BookOpen, Users, Layout, Database, Bot as Robot, Shield, Menu, X, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import './Landing.css';

const descriptions = [
  "Aegis watches your USDY and mETH holdings, reads live market rates, and tells you exactly when to move your money — how much, at what price, and when to take profit. Like a financial advisor that runs on the blockchain.",
  "Most DeFi users leave yield on the table by staying in the wrong asset. Aegis analyses the live APY gap between USDY and mETH and gives you a precise, actionable signal — not vague advice.",
  "Every recommendation Aegis gives is permanently recorded on Mantle before your trade executes. You can verify the AI's exact reasoning on-chain, any time. No black box — full transparency."
];

const AnimatedText = ({ text, className }: { text: string; className?: string }) => {
  const words = text.split(" ");
  
  return (
    <motion.h1 
      className={className}
      variants={{
        animate: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
      initial="initial"
      animate="animate"
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block whitespace-nowrap mr-[0.3em]">
          {word.split("").map((char, charIndex) => (
            <motion.span
              key={charIndex}
              className="inline-block"
              variants={{
                initial: { y: -100, opacity: 0 },
                animate: { 
                  y: 0, 
                  opacity: 1,
                  transition: {
                    type: "spring",
                    damping: 12,
                    stiffness: 100,
                  }
                },
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.h1>
  );
};

export const Landing = () => {
  const [descIndex, setDescIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'none' | 'about' | 'how-to'>('none');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setDescIndex((prev) => (prev + 1) % descriptions.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const toggleSection = (tab: 'about' | 'how-to') => {
    setActiveTab(prev => prev === tab ? 'none' : tab);
    setIsMobileMenuOpen(false);
    // Smooth scroll to the new content after a short delay for animation
    setTimeout(() => {
      const element = document.getElementById('extra-content');
      if (element && activeTab !== tab) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans selection:bg-accent-blue/30 overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 bg-bg-primary/50 ">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-accent-blue rounded-[12px] flex items-center justify-center border border-white/10 shadow-sm shadow-accent-blue/20">
              <ShieldCheck className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tight font-heading">AEGIS</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => toggleSection('about')}
              className={cn("text-xs font-bold tracking-widest transition-all px-4 py-2 rounded-full", activeTab === 'about' ? 'bg-accent-blue/10 text-accent-blue' : 'text-white hover:text-accent-blue')}
            >
              About
            </button>
            <button
              onClick={() => toggleSection('how-to')}
              className={cn("text-xs font-bold tracking-widest transition-all px-4 py-2 rounded-full", activeTab === 'how-to' ? 'bg-accent-success/10 text-accent-success' : 'text-white hover:text-accent-success')}
            >
              How to Use
            </button>
            <Link
              to="/whitepaper"
              className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-text-muted hover:text-white transition-colors px-4 py-2"
            >
              <FileText size={13} /> Whitepaper
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard"
              className="hidden sm:flex px-6 py-2.5 bg-text-primary text-bg-primary rounded-[20px] font-bold text-sm hover:bg-white transition-all items-center gap-2 group"
            >
              Launch Terminal
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-text-muted hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden bg-bg-primary border-b border-border-subtle p-6 space-y-4"
            >
              <button 
                onClick={() => toggleSection('about')}
                className="block w-full text-left p-4 text-sm font-bold tracking-widest text-text-muted hover:text-white hover:bg-bg-secondary rounded-xl transition-all"
              >
                About
              </button>
              <button 
                onClick={() => toggleSection('how-to')}
                className="block w-full text-left p-4 text-sm font-bold tracking-widest text-text-muted hover:text-white hover:bg-bg-secondary rounded-xl transition-all"
              >
                How to Use
              </button>
              <Link
                to="/whitepaper"
                className="block w-full p-4 text-sm font-bold tracking-widest text-text-muted hover:text-white hover:bg-bg-secondary rounded-xl transition-all flex items-center gap-2"
              >
                <FileText size={15} /> Whitepaper
              </Link>
              <Link
                to="/dashboard"
                className="flex sm:hidden w-full items-center justify-between p-4 bg-text-primary text-bg-primary rounded-xl font-bold text-sm"
              >
                Launch Terminal
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 md:pt-38 pb-20 md:pb-32 px-6">
        {/* Animated Background Colors */}
        <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-accent-blue/10 blur-[80px] md:blur-[120px] rounded-full animate-pulse pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-accent-success/5 blur-[70px] md:blur-[100px] rounded-full animate-bounce duration-[10s] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-6">
            <AnimatedText 
              text="THE AUTONOMOUS"
              className="text-4xl sm:text-6xl md:text-[4rem] font-bold leading-[0.95] tracking-tight font-heading inline-block bg-gradient-to-r from-white via-text-primary to-accent-blue bg-clip-text text-transparent"
            />
            <br />
            <AnimatedText 
              text="YIELD GUARDIAN."
              className="text-4xl sm:text-6xl md:text-[4rem] font-bold leading-[0.95] tracking-tight font-heading text-accent-blue inline-block"
            />
          </div>
          
          <div className="h-52 md:h-32 mb-12 md:mb-16 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={descIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="max-w-2xl mx-auto text-lg md:text-xl text-center text-text-secondary font-medium leading-relaxed px-4 absolute inset-0"
              >
                {descriptions[descIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-6 md:px-10 py-4 md:py-5 bg-accent-blue hover:brightness-110 text-white rounded-[40px] font-bold text-lg transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-accent-blue/10"
            >
              Access Terminal
              <Zap size={20} fill="currentColor" />
            </Link>
            <Link
              to="/whitepaper"
              className="w-full sm:w-auto px-6 md:px-10 py-4 md:py-5 bg-bg-secondary hover:bg-bg-card text-text-primary rounded-[40px] font-bold text-lg transition-all flex items-center justify-center gap-3"
            >
              <FileText size={18} /> Read Whitepaper
            </Link>
          </div>
        </div>

        {/* Hero Illustration Placeholder - Subtle Grid */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(47,111,237,0.06),transparent)]" />
        <div className="absolute inset-0 -z-10 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#2F6FED 1px, transparent 1px), linear-gradient(90deg, #2F6FED 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </main>

      <div id="extra-content" className="max-w-7xl mx-auto px-6">
        <AnimatePresence>
          {activeTab === 'about' && (
            <motion.section
              initial={{ opacity: 0, height: 0, y: 50 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 50 }}
              transition={{ duration: 0.6, ease: "circOut" }}
              className="py-16 md:py-32 overflow-hidden"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                  <div className="space-y-8 md:space-y-10">
                    <div className="space-y-4 text-center lg:text-left">
                      <span className="text-[10px] font-bold tracking-[0.3em] text-accent-blue">What Aegis Does</span>
                      <h2 className="text-4xl md:text-5xl font-black font-heading tracking-tighter">YOUR CRYPTO,<br className="hidden md:block" /><span className="text-accent-blue/80">WORKING HARDER.</span></h2>
                    </div>
                    <p className="text-base md:text-lg text-text-secondary leading-relaxed font-medium text-center lg:text-left">
                      Think of USDY and mETH as two different savings accounts on the Mantle blockchain. USDY earns a steady yield backed by real US Treasury Bills — stable, dollar-pegged, predictable. mETH earns ETH staking rewards plus any growth in ETH's price — higher potential, more movement. The catch is that the better option changes constantly as rates shift and markets move. Aegis tracks both in real time and tells you which one you should be in right now, how much to move, at what price to take profit, and when to cut your losses — all derived from your actual balances and live on-chain data.
                    </p>
                    <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-sm mx-auto lg:mx-0">
                       <div className="space-y-2 text-center lg:text-left">
                          <p className="text-2xl md:text-3xl font-black font-heading text-white">Live</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">APY Monitoring</p>
                       </div>
                       <div className="space-y-2 text-center lg:text-left">
                          <p className="text-2xl md:text-3xl font-black font-heading text-white">100%</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">On-Chain Verified</p>
                       </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 about-feature-icon rounded-full blur-3xl opacity-20" />
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                      {[
                        { icon: Users, label: "No Sign-Up", color: "text-accent-blue" },
                        { icon: Layout, label: "Your Keys", color: "text-accent-success" },
                        { icon: Database, label: "On-Chain Proof", color: "text-accent-warning" },
                        { icon: Shield, label: "Risk-Gated", color: "text-accent-danger" }
                      ].map((item, i) => (
                        <div key={i} className="p-6 md:p-8 bg-bg-secondary border border-border-subtle rounded-3xl flex flex-col items-center justify-center gap-3 md:gap-4 hover:border-white/20 transition-all animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                          <item.icon className={item.color} size={28} />
                          <span className="text-[9px] md:text-[10px] font-bold  tracking-widest">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
            </motion.section>
          )}

          {activeTab === 'how-to' && (
            <motion.section
              initial={{ opacity: 0, height: 0, y: 50 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 50 }}
              transition={{ duration: 0.6, ease: "circOut" }}
              className="py-16 md:py-32 overflow-hidden"
            >
                <div className="text-center mb-12 md:mb-20 space-y-4">
                  <span className="text-[10px] font-bold tracking-[0.3em] text-accent-success">Onboarding Guide</span>
                  <h2 className="text-4xl md:text-5xl font-black font-heading tracking-tighter">GETTING <span className="text-accent-success">STARTED.</span></h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {[
                    {
                      step: "01",
                      title: "Connect Your Wallet",
                      desc: "Open Aegis and connect your Mantle-compatible wallet — MetaMask, Rabby, or any WalletConnect wallet works. No sign-up, no email, no KYC. Aegis reads your token balances directly from the blockchain.",
                      icon: ShieldCheck,
                      color: "border-accent-blue/30"
                    },
                    {
                      step: "02",
                      title: "Set Your Risk Level",
                      desc: "Choose how aggressively you want to manage yield: Conservative, Moderate, or Aggressive. This creates your AI Agent — a unique identity on Mantle that keeps a permanent, verifiable record of every recommendation and trade in your name.",
                      icon: Robot,
                      color: "border-accent-success/30"
                    },
                    {
                      step: "03",
                      title: "Get Your AI Signal",
                      desc: "Aegis reads your live USDY and mETH balances, fetches the current yield rates from both protocols, and runs them through AI. You get a specific signal: what to buy, how much, at what level to take profit, and where to set your stop-loss. Actual numbers — not vague suggestions.",
                      icon: Activity,
                      color: "border-accent-warning/30"
                    },
                    {
                      step: "04",
                      title: "Approve & Trade",
                      desc: "Review the signal in the Order Builder. When you're ready, approve the commitment — this records the AI's advice permanently on Mantle — then confirm the swap. Your trade settles through Merchant Moe's DEX and your portfolio updates instantly.",
                      icon: Zap,
                      color: "border-accent-danger/30"
                    }
                  ].map((item, i) => (
                    <div key={i} className={cn("how-to-card p-6 md:p-8 rounded-3xl space-y-4 md:space-y-6 relative overflow-hidden group", item.color)}>
                      <div className="step-number-pill text-3xl md:text-4xl font-black opacity-40 group-hover:opacity-100 transition-opacity">
                        {item.step}
                      </div>
                      <div className="space-y-3 md:space-y-4">
                        <h3 className="text-lg md:text-xl font-bold font-heading">{item.title}</h3>
                        <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-medium">
                          {item.desc}
                        </p>
                      </div>
                      <item.icon className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity" size={80} />
                    </div>
                  ))}
                </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Feature Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
          {[
            {
              icon: BrainCircuit,
              title: "Precise AI Signals",
              desc: "Aegis doesn't just say 'buy mETH'. It tells you the exact amount to move, why the yield spread justifies it right now, what price to take profit at, and what level would prove the trade wrong. Every signal is grounded in your real balance and live market APYs.",
              color: "text-accent-blue"
            },
            {
              icon: ShieldCheck,
              title: "Every Trade Proven On-Chain",
              desc: "Before any swap happens, Aegis records the AI's full recommendation on the Mantle blockchain as a tamper-proof hash. This means you — or anyone — can look up any past signal and verify exactly what the AI advised and what data it had at that moment. No one can change it after the fact.",
              color: "text-accent-success"
            },
            {
              icon: Activity,
              title: "Risk Limits You Control",
              desc: "You set how much of your portfolio Aegis can advise moving in a single trade. These limits live in a smart contract — not a preference that can be quietly overridden. The AI always works within the bounds you choose, and your wallet always stays in your control.",
              color: "text-accent-warning"
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="group text-center sm:text-left"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-bg-secondary rounded-[16px] flex items-center justify-center border border-border-subtle mb-6 md:mb-8 mx-auto sm:mx-0 group-hover:border-accent-blue transition-colors text-white">
                <feature.icon className={feature.color} size={24} md:size={28} />
              </div>
              <h3 className="text-lg md:text-xl font-bold tracking-tight mb-3 md:mb-4 font-heading uppercase tracking-tighter">{feature.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed font-medium">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 md:py-24 bg-bg-primary ">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
             <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-accent-blue" size={24} />
                <span className="text-xl font-black font-heading tracking-tight">AEGIS</span>
             </div>
             <p className="text-text-muted text-[10px] md:text-xs font-bold uppercase tracking-widest">
                Built on Mantle • Secured by Aegis AI
             </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-text-muted text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-text-primary transition-colors">Documentation</a>
            <a href="#" className="hover:text-text-primary transition-colors">Security Audit</a>
            <a href="#" className="hover:text-text-primary transition-colors">Github</a>
            <a href="#" className="hover:text-text-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

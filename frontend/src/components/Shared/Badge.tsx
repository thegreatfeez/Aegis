import React from 'react';
import { cn } from '../../lib/utils';

export const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' }) => {
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

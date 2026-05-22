import React from 'react';
import { cn } from '../../lib/utils';

export const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' }) => {
  const styles = {
    default: "bg-bg-secondary text-text-muted",
    success: "bg-accent-success/10 text-accent-success",
    warning: "bg-accent-warning/10 text-accent-warning border border-accent-warning/30",
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest", styles[variant])}>
      {children}
    </span>
  );
};

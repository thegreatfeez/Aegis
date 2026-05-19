import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl", className)}>
    {children}
  </div>
);

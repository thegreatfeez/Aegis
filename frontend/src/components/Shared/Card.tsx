import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-bg-card/40 rounded-[12px] p-6 shadow-sm shadow-black/70", className)}>
    {children}
  </div>
);

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatUnits(value: bigint, decimals: number = 18): string {
  // Avoid Number() overflow for large token amounts (> 2^53)
  const d = BigInt(decimals);
  const factor = 10n ** d;
  const whole = value / factor;
  const frac = value % factor;
  const fracStr = frac.toString().padStart(decimals, '0').slice(0, 4).replace(/0+$/, '') || '00';
  const wholeFormatted = Number(whole).toLocaleString();
  return `${wholeFormatted}.${fracStr.padEnd(2, '0')}`;
}

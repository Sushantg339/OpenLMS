import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  if (typeof price !== 'number' || isNaN(price)) return '₹0';
  return `₹${price.toLocaleString('en-IN')}`;
}

export function formatDuration(seconds?: number | null): string {
  if (!seconds) return '0m';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
  }
  if (secs > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${mins}m`;
}

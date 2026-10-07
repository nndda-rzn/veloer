import { cn } from '@/lib/utils';

/**
 * Shared styling for native <select> elements.
 * Kept in one place so every dropdown in the app matches the input tokens.
 */
export const selectClass = cn(
  'flex h-9 w-full items-center justify-between rounded-lg border border-input bg-card px-2.5 py-1 text-sm text-foreground',
  'transition-colors outline-none',
  'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

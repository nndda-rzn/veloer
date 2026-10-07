import { cn } from '@/lib/utils';

/**
 * Loading placeholders with the same shape as the content they replace, so the
 * page does not jump when data arrives. The app previously had 38 ad-hoc
 * `animate-pulse` blocks of arbitrary heights, which caused layout shift.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('animate-pulse rounded-lg bg-secondary', className)} />
  );
}

/** A block of text lines. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

/** A card-sized block, matching the Card primitive's padding. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border border-border bg-card p-4', className)}>
      <Skeleton className="h-4 w-1/3" />
      <SkeletonText lines={2} className="mt-4" />
    </div>
  );
}

/** Rows for a table or list, matching a typical row height. */
export function SkeletonTable({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12" />
      ))}
    </div>
  );
}

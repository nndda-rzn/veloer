import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Optional trailing element rendered on the heading row. */
  action?: ReactNode;
}

/**
 * A page section separated by a hairline rule rather than wrapped in a card.
 *
 * Settings is a form, not a dashboard: stacking bordered cards for each group
 * produced a "card wall" and inconsistent radius/padding across pages. This
 * keeps grouping without the boxes.
 */
export function Section({ title, description, children, className, action }: SectionProps) {
  return (
    <section className={cn('border-t border-border pt-6 first:border-t-0 first:pt-0', className)}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-h3 font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

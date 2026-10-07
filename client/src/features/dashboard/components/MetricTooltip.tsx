import type { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/** Plain-language explanations for the training acronyms shown on the dashboard. */
export const METRIC_EXPLANATIONS: Record<string, string> = {
  CTL: 'Chronic Training Load, your fitness. A 42-day average of daily training stress.',
  ATL: 'Acute Training Load, your fatigue. A 7-day average, so it rises and falls fast.',
  TSB: 'Training Stress Balance, your form. Fitness minus fatigue. Negative means you are absorbing work; very negative means it is time to rest.',
  TSS: 'Training Stress Score. How hard a session was, combining duration and intensity. One hour at threshold is about 100.',
  IF: 'Intensity Factor. How hard a ride was relative to your FTP. 1.0 means you held threshold.',
};

/**
 * A small info affordance that explains a metric acronym in place, so the
 * dashboard does not leave the rider "blinking into the abyss" at CTL/ATL/TSB.
 * The label itself is always visible; the tooltip only adds the definition.
 */
export function MetricTooltip({ metric, children }: { metric: string; children?: ReactNode }) {
  const explanation = METRIC_EXPLANATIONS[metric];
  if (!explanation) return <>{children ?? metric}</>;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-sm text-inherit underline decoration-dotted underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`What is ${metric}?`}
          >
            {children ?? metric}
            <Info className="h-3 w-3 opacity-60" aria-hidden="true" />
          </button>
        }
      />
      <TooltipContent>
        <span className="font-medium">{metric}</span> · {explanation}
      </TooltipContent>
    </Tooltip>
  );
}

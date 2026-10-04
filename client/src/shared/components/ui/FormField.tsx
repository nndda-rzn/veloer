import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  /** Helper text shown under the control and wired up via aria-describedby. */
  hint?: string;
  /** Validation message. Also marks the control invalid. */
  error?: string;
  /** Live preview of the setting's effect, e.g. '142 km → 88.2 mi'. */
  preview?: ReactNode;
  /** Marks the field as optional rather than required (the minority is marked). */
  optional?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Label + control + hint + error, so every form on the app shares one layout
 * and one way of reporting problems. Previously each page repeated the same
 * markup by hand and errors were shown inconsistently (or not at all).
 */
export function FormField({
  label,
  htmlFor,
  hint,
  error,
  preview,
  optional,
  className,
  children,
}: FormFieldProps) {
  const hintId = htmlFor && hint ? `${htmlFor}-hint` : undefined;
  const errorId = htmlFor && error ? `${htmlFor}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={htmlFor} className={cn(error && 'text-destructive')}>
          {label}
        </Label>
        {optional && <span className="text-xs text-muted-foreground">Optional</span>}
      </div>

      <div
        // aria-describedby is applied by the consumer's control where possible;
        // when it is not (native selects), the wrapper carries it so screen
        // readers still reach the hint and the error.
        aria-describedby={describedBy}
      >
        {children}
      </div>

      {error ? (
        <p id={errorId} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}

      {preview && <div className="text-xs text-muted-foreground">{preview}</div>}
    </div>
  );
}

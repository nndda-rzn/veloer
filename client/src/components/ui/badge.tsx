import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a]:hover:bg-primary-dark',
        secondary: 'bg-secondary text-secondary-foreground [a]:hover:bg-stone-200',
        destructive:
          'bg-destructive/10 text-destructive focus-visible:ring-destructive/25 [a]:hover:bg-destructive/15',
        outline: 'border-border text-foreground [a]:hover:bg-secondary',
        ghost: 'hover:bg-secondary hover:text-muted-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        success: 'bg-emerald-50 text-emerald-800 [a]:hover:bg-emerald-100',
        warning: 'bg-amber-50 text-amber-800 [a]:hover:bg-amber-100',
        info: 'bg-blue-50 text-blue-800 [a]:hover:bg-blue-100',
        neutral: 'bg-secondary text-muted-foreground [a]:hover:bg-stone-200',
        danger: 'bg-red-50 text-red-700 [a]:hover:bg-red-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant = 'default',
  render,
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: 'badge',
      variant,
    },
  });
}

export { Badge, badgeVariants };

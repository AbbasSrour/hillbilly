import { cn } from '@hillbilly/ui/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, Loader2 } from 'lucide-react';
import type * as React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 focus-visible:ring-4 focus-visible:outline-1 aria-invalid:focus-visible:ring-0",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  error = false,
  tooltip,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
    error?: boolean;
    tooltip?: string;
  }) {
  const Comp = asChild ? Slot : 'button';

  const buttonContent = (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, className }),
        'relative',
        (loading || error) && 'pr-9',
      )}
      disabled={loading || error || props.disabled}
      {...props}
    >
      {props.children}
      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
        </span>
      )}
      {!loading && error && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          <AlertCircle className="h-4 w-4 text-destructive" />
        </span>
      )}
    </Comp>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
}

export { Button, buttonVariants };

import { cn } from '@hillbilly/ui/lib/utils';
import { Ban, Loader2 } from 'lucide-react';
import type * as React from 'react';

function Input({
  className,
  type,
  icon: Icon,
  containerClassName,
  loading = false,
  ...props
}: React.ComponentProps<'input'> & {
  icon?: React.ElementType;
  containerClassName?: string;
  loading?: boolean;
}) {
  return (
    <div className={cn('relative', containerClassName)}>
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          Icon && 'pl-9',
          (props.disabled || loading) && 'pr-9',
          className,
        )}
        disabled={props.disabled || loading}
        {...props}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
        </div>
      )}
      {!loading && props.disabled && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Ban className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
Input.displayName = 'Input';

export { Input };

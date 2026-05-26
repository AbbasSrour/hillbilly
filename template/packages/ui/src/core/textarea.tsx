import { cn } from '@hillbilly/ui/lib/utils';
import type * as React from 'react';

function Textarea({
  className,
  icon: Icon,
  containerClassName,
  ...props
}: React.ComponentProps<'textarea'> & {
  icon?: React.ElementType;
  containerClassName?: string;
}) {
  return (
    <div className={cn('relative', containerClassName)}>
      {Icon && (
        <div className="absolute left-3 top-5 -translate-y-1/2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <textarea
        data-slot="textarea"
        className={cn(
          'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          Icon && 'pl-9',
          className,
        )}
        {...props}
      />
    </div>
  );
}

export { Textarea };

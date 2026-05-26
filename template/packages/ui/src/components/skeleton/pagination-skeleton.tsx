import { Skeleton } from '@hillbilly/ui/core/skeleton';
import { cn } from '@hillbilly/ui/lib/utils';
import type { ComponentProps } from 'react';

export function PaginationSkeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-center justify-between overflow-clip px-2', className)}
      style={{ overflowClipMargin: 1 }}
      {...props}
    >
      <div className="text-muted-foreground hidden flex-1 text-sm sm:block">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex items-center sm:space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <Skeleton className="hidden h-4 w-24 sm:block" />
          <Skeleton className="h-8 w-[70px]" />
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="hidden h-8 w-8 lg:flex" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="hidden h-8 w-8 lg:flex" />
        </div>
      </div>
    </div>
  );
}

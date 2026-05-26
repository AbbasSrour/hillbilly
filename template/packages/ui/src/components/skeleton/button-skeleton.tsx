import { Skeleton } from '@hillbilly/ui/core/skeleton';
import { cn } from '@hillbilly/ui/lib/utils';
import type { ComponentProps } from 'react';

export function ButtonSkeleton({ className, ...props }: ComponentProps<'div'>) {
  return <Skeleton className={cn('h-9 w-24 rounded-md', className)} {...props} />;
}

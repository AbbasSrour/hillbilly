import { cn } from '@hillbilly/ui/lib/utils';
import type { PropsWithChildren } from 'react';

interface InsightGridProps extends PropsWithChildren {
  className?: string;
}

export const InsightGrid = ({ children, className }: InsightGridProps) => {
  return (
    <div className={cn('grid gap-4 md:grid-cols-3 lg:grid-cols-3 mb-6', className)}>{children}</div>
  );
};

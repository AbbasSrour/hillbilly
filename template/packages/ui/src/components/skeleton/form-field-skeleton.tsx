import { Skeleton } from '@hillbilly/ui/core/skeleton';
import { cn } from '@hillbilly/ui/lib/utils';
import type { ComponentProps, PropsWithChildren } from 'react';

interface FormFieldSkeletonProps extends PropsWithChildren {
  className?: string;
}

export function FormFieldSkeleton({ children, className }: FormFieldSkeletonProps) {
  return <div className={cn('grid gap-2', className)}>{children}</div>;
}

FormFieldSkeleton.Label = function FormFieldSkeletonLabel({
  className,
  ...props
}: ComponentProps<'div'>) {
  return <Skeleton className={cn('h-4 w-24', className)} {...props} />;
};

FormFieldSkeleton.Description = function FormFieldSkeletonDescription({
  className,
  ...props
}: ComponentProps<'div'>) {
  return <Skeleton className={cn('h-3 w-40', className)} {...props} />;
};

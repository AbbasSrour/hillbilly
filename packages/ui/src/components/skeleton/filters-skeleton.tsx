import { cn } from "@hillbilly/ui/lib/utils";
import type { PropsWithChildren } from "react";

interface FiltersSkeletonProps extends PropsWithChildren {
  className?: string;
}

export function FiltersSkeleton({ children, className }: FiltersSkeletonProps) {
  return <div className={cn("flex flex-wrap items-center gap-2", className)}>{children}</div>;
}

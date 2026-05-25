import { Skeleton } from "@hillbilly/ui/core/skeleton";
import { cn } from "@hillbilly/ui/lib/utils";
import type { ComponentProps } from "react";

export function InputSkeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <Skeleton
      className={cn("h-9 w-full rounded-md border border-input/50", className)}
      {...props}
    />
  );
}

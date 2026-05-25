import { Card, CardContent, CardHeader } from "@hillbilly/ui/core/card";
import { Skeleton } from "@hillbilly/ui/core/skeleton";
import { cn } from "@hillbilly/ui/lib/utils";
import type { ComponentProps } from "react";

export function CardSkeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border border-border bg-card shadow-none transition-colors",
        className,
      )}
      {...props}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-muted/40 blur-2xl" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent className="relative z-10">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="mt-1 h-3 w-28" />
      </CardContent>
    </Card>
  );
}

import { useTopLoader } from "nextjs-toploader";
import { useEffect } from "react";
import { Skeleton } from "../../core/skeleton";

export interface TabsLoadingSkeletonProps {
  columns?: number;
  rows?: number;
  showSearch?: boolean;
  showAction?: boolean;
  showPagination?: boolean;
  tabLabels?: string[];
  activeTabIndex?: number;
}

export function TabsLoadingSkeleton({
  columns = 5,
  rows = 10,
  showSearch = true,
  showAction = true,
  showPagination = true,
  tabLabels = ["Tab 1", "Tab 2"],
  activeTabIndex = 0,
}: TabsLoadingSkeletonProps) {
  const topLoader = useTopLoader();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    topLoader.start();
  }, []);

  return (
    <div className="flex flex-row w-full h-full">
      {/* Tabs sidebar skeleton */}
      <div className="w-48 shrink-0 border-r border-border rounded-none pr-4 mr-6 flex flex-col justify-start bg-transparent space-y-1 h-full">
        {tabLabels.map((label, index) => (
          <div
            key={label}
            className={`justify-start w-full px-4 py-2 text-left h-fit flex-initial ${index === activeTabIndex ? "bg-muted text-foreground" : ""}`}
          >
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Active tab content skeleton */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Section header skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <Skeleton className="h-6 w-40 mb-1" />
            <Skeleton className="h-4 w-72" />
          </div>
          {showAction && (
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-[100px]" />
            </div>
          )}
        </div>

        {/* Toolbar skeleton */}
        <div className="flex items-center justify-between">
          {showSearch && (
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-[250px]" />
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-[90px]" />
                <Skeleton className="h-8 w-[80px]" />
              </div>
            </div>
          )}
          {showAction && (
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-[100px]" />
            </div>
          )}
        </div>

        {/* Table skeleton */}
        <div className="rounded-md border">
          <div className="border-b">
            <div className="flex h-10 items-center gap-4 px-4">
              <Skeleton className="h-4 w-4" />
              {Array.from({ length: columns - 1 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <Skeleton key={i} className="h-4 w-[150px]" />
              ))}
            </div>
          </div>
          <div>
            {Array.from({ length: rows }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={i}
                className="flex h-16 items-center gap-4 border-b px-4"
              >
                <Skeleton className="h-4 w-4" />
                {Array.from({ length: columns - 1 }).map((_, j) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  <Skeleton key={j} className="h-4 w-[150px]" />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Pagination skeleton */}
        {showPagination && (
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-[100px]" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

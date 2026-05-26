import { useTopLoader } from 'nextjs-toploader';
import { useEffect } from 'react';
import { Skeleton } from '../../core/skeleton';

export interface ListLoadingSkeletonProps {
  columns?: number;
  rows?: number;
  showSearch?: boolean;
  showAction?: boolean;
  showPagination?: boolean;
}

export function ListLoadingSkeleton({
  columns = 5,
  rows = 10,
  showSearch = true,
  showAction = true,
  showPagination = true,
}: ListLoadingSkeletonProps) {
  const topLoader = useTopLoader();

  // Start the top loader when the component mounts
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    topLoader.start();
  }, []);

  return (
    <div className="space-y-4">
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between">
        {showSearch && (
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-[250px]" />
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
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <div key={i} className="flex h-16 items-center gap-4 border-b px-4">
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
  );
}

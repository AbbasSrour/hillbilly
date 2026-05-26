import {
  HydrationBoundary,
  UseInfiniteQueryOptions,
  UseQueryOptions,
  dehydrate,
} from '@tanstack/react-query';
import { ReactNode } from 'react';
import { getQueryClient } from '../../lib/query-client-factory';

interface PrefetchDataProps {
  children: ReactNode;
  queries?: object[];
}

/**
 * Prefetches data for queries and infinite queries and returns a hydration boundary.
 *
 * @param queries - Optional array of query options to prefetch
 * @param children - Child components to wrap with hydration boundary
 */
export async function PrefetchData({ children, queries }: PrefetchDataProps) {
  const queryClient = getQueryClient();

  if (queries) {
    await Promise.all(
      queries.map(async (query) => {
        if ('getNextPageParam' in query && 'initialPageParam' in query) {
          await queryClient.prefetchInfiniteQuery(query as UseInfiniteQueryOptions);
        } else {
          await queryClient.prefetchQuery(query as UseQueryOptions);
        }
      }),
    );
  }

  const dehydratedState = dehydrate(queryClient);

  return <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>;
}

import {
  HydrationBoundary,
  UseInfiniteQueryOptions,
  UseQueryOptions,
  dehydrate,
} from '@tanstack/react-query';
import { ReactNode } from 'react';
import { getQueryClient } from '../../lib/query-client-factory';

/**
 * Prefetches data for queries and infinite queries and returns a hydration boundary.
 *
 * @param queries - Array of query options to prefetch
 * @returns A component with the dehydrated state
 */
export async function prefetchQueries(...queries: object[]) {
  const queryClient = getQueryClient();

  await Promise.all(
    queries.map(async (query) => {
      if ('getNextPageParam' in query && 'initialPageParam' in query) {
        await queryClient.prefetchInfiniteQuery(query as UseInfiniteQueryOptions);
      } else {
        await queryClient.prefetchQuery(query as UseQueryOptions);
      }
    }),
  );

  const dehydratedState = dehydrate(queryClient);

  return function PrefetchedQueryComponent({ children }: { children: ReactNode }) {
    return <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>;
  };
}

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientConfig,
  isServer,
} from "@tanstack/react-query";
import { cache } from "react";

/**
 * Creates a QueryClient with optional custom cache handlers.
 * Provides sensible defaults for both server and browser environments.
 */
export function makeQueryClient(config?: QueryClientConfig) {
  const queryCache = new QueryCache({
    ...config?.queryCache?.config,
  });

  const mutationCache = new MutationCache({
    ...config?.mutationCache?.config,
  });

  return new QueryClient({
    defaultOptions: {
      ...config?.defaultOptions,
      queries: {
        staleTime: 6000,
        retry: 1,
        refetchOnWindowFocus: false,
        throwOnError: true,
        ...config?.defaultOptions?.queries,
      },
      mutations: {
        ...config?.defaultOptions?.mutations,
        meta: {
          showToast: true,
          ...config?.defaultOptions?.mutations?.meta,
        },
      },
    },
    queryCache,
    mutationCache,
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Gets or creates a QueryClient instance.
 * On server: creates a new instance per request with extended stale time.
 * On browser: reuses a singleton instance.
 */
export function getQueryClient(config?: QueryClientConfig) {
  if (isServer) {
    const serverQueryClient = makeQueryClient(config);
    serverQueryClient.setDefaultOptions({
      ...serverQueryClient.getDefaultOptions(),
      queries: {
        ...serverQueryClient.getDefaultOptions().queries,
        retry: false,
        staleTime: 5 * 60 * 1000,
      },
    });

    return cache(() => serverQueryClient)();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient(config);
  }

  return browserQueryClient;
}

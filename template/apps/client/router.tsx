import { createRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { createQueryClient } from '@/lib/query-client';
import { deLocalizeUrl, localizeUrl } from '@/paraglide/runtime';
import { routeTree } from '@/routeTree.gen';

export const getRouter = () => {
  const queryClient = createQueryClient();

  const router = createRouter({
    routeTree,
    context: {
      queryClient,
    },

    // Paraglide URL rewrite docs: https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#rewrite-url
    rewrite: {
      input: ({ url }: { url: URL }) => deLocalizeUrl(url),
      output: ({ url }: { url: URL }) => localizeUrl(url),
    },

    defaultPreload: 'intent',
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
};

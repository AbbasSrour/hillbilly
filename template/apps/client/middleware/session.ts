// middleware/session.ts
import { createMiddleware } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { authClient } from '@/lib/auth';

export const sessionMiddleware = createMiddleware().server(async ({ next }) => {
  const headers = getRequestHeaders();
  const result = await authClient.getSession({
    fetchOptions: {
      headers,
    },
  });

  const data = result?.data ?? null;

  return next({
    context: {
      session: data?.session ?? null,
      user: data?.user ?? null,
    },
  });
});

import { createFileRoute } from '@tanstack/react-router';
import { env } from '@/config/env.ts';
import { sessionMiddleware } from '@/middleware/session.ts';

export const Route = createFileRoute('/api/auth/admin/$')({
  ssr: true,
  server: {
    middleware: [sessionMiddleware],
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const apiUrl =
          env.API_URL || process.env.API_URL || 'http://localhost:4000';
        const backendUrl = `${apiUrl}${url.pathname}${url.search}`;

        // Forward only specific headers
        const forwardHeaders: Record<string, string> = {
          'content-type':
            request.headers.get('content-type') || 'application/json',
        };

        const originHeader = request.headers.get('origin');
        if (originHeader) {
          forwardHeaders['origin'] = originHeader;
        }

        const cookie = request.headers.get('cookie');
        if (cookie) {
          forwardHeaders['cookie'] = cookie;
        }

        const response = await fetch(backendUrl, {
          method: 'GET',
          headers: forwardHeaders,
        });

        // Create new response without compression headers
        const responseHeaders = new Headers(response.headers);
        responseHeaders.delete('content-encoding');
        responseHeaders.delete('content-length');

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
      },
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const apiUrl =
          env.API_URL || process.env.API_URL || 'http://localhost:4000';
        const backendUrl = `${apiUrl}${url.pathname}${url.search}`;

        // Forward only specific headers
        const forwardHeaders: Record<string, string> = {
          'content-type':
            request.headers.get('content-type') || 'application/json',
        };

        const originHeader = request.headers.get('origin');
        if (originHeader) {
          forwardHeaders['origin'] = originHeader;
        }

        const cookie = request.headers.get('cookie');
        if (cookie) {
          forwardHeaders['cookie'] = cookie;
        }

        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: forwardHeaders,
          body: await request.text(),
        });

        // Create new response without compression headers
        const responseHeaders = new Headers(response.headers);
        responseHeaders.delete('content-encoding');
        responseHeaders.delete('content-length');

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
      },
    },
  },
});

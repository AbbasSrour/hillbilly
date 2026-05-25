import { createFileRoute } from '@tanstack/react-router';
import { env } from '@/config/env.ts';

export const Route = createFileRoute('/api/auth/$')({
  ssr: true,
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const apiUrl = env.API_URL || process.env.API_URL || 'http://localhost:4000';
        const backendUrl = `${apiUrl}${url.pathname}${url.search}`;

        // Forward only specific headers
        const forwardHeaders: Record<string, string> = {
          'content-type': request.headers.get('content-type') || 'application/json',
        };

        const cookie = request.headers.get('cookie');
        if (cookie) {
          forwardHeaders['cookie'] = cookie;
        }

        const origin = request.headers.get('origin');
        if (origin) {
          forwardHeaders['origin'] = origin;
        }

        const response = await fetch(backendUrl, {
          method: 'GET',
          headers: forwardHeaders,
        });

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
        const apiUrl = env.API_URL || process.env.API_URL || 'http://localhost:4000';
        const backendUrl = `${apiUrl}${url.pathname}${url.search}`;

        const forwardHeaders: Record<string, string> = {
          'content-type': request.headers.get('content-type') || 'application/json',
        };

        const cookie = request.headers.get('cookie');
        if (cookie) {
          forwardHeaders['cookie'] = cookie;
        }

        const origin = request.headers.get('origin');
        if (origin) {
          forwardHeaders['origin'] = origin;
        }

        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: forwardHeaders,
          body: await request.text(),
        });

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

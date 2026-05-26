import { createFileRoute, redirect } from '@tanstack/react-router';
import { sessionMiddleware } from '@/middleware/session';

export const Route = createFileRoute('/')({
  server: {
    middleware: [sessionMiddleware],
  },
  beforeLoad: async ({ serverContext }) => {
    if (!serverContext?.user) {
      throw redirect({ to: '/auth/login' });
    }

    const to = serverContext.user.organizationMember ? '/org/dashboard' : '/admin/dashboard';

    throw redirect({ to });
  },
});

import { redirect } from '@tanstack/react-router';
import { createMiddleware } from '@tanstack/react-start';
import { sessionMiddleware } from './session';

export const requireAdmin = createMiddleware()
  .middleware([sessionMiddleware])
  .server(async ({ next, context }) => {
    if (!context.user) {
      throw redirect({ to: '/auth/login' });
    }

    if (context.user.organizationMember) {
      throw redirect({ to: '/org/dashboard' });
    }

    return next();
  });

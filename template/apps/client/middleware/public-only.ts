import { redirect } from '@tanstack/react-router';
import { createMiddleware } from '@tanstack/react-start';
import { sessionMiddleware } from './session';

export const publicOnly = createMiddleware()
  .middleware([sessionMiddleware])
  .server(async ({ next, context }) => {
    if (context.user) {
      const to = context.user.organizationMember
        ? '/org/dashboard'
        : '/admin/dashboard';
      throw redirect({ to });
    }

    return next();
  });

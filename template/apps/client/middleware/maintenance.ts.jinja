import { redirect } from '@tanstack/react-router';
import { createMiddleware } from '@tanstack/react-start';
import { getRequestUrl } from '@tanstack/react-start/server';
import { env } from '@/config/env.ts';

export const maintenanceMiddleware = createMiddleware().server(async ({ next }) => {
  const url = getRequestUrl();
  const pathname = url.pathname;

  const isMaintenanceMode = env.VITE_MAINTENANCE === 'true';
  const isMaintenancePage = pathname === '/maintenance';

  if (isMaintenanceMode && !isMaintenancePage) {
    throw redirect({ to: '/maintenance' });
  }

  if (!isMaintenanceMode && isMaintenancePage) {
    throw redirect({ to: '/' });
  }

  return next();
});

import { rbacClient } from '@hillbilly/rbac/client';
import { adminClient, phoneNumberClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { env } from '@/config/env.ts';

export const authClient = createAuthClient({
  baseURL: env.VITE_APP_URL,
  basePath: '/api/auth',
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [adminClient(), phoneNumberClient(), rbacClient()],
});

export const { signIn, useSession, getSession, admin } = authClient;

export type AuthClient = typeof authClient;

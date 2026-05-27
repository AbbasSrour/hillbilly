import { type Mock, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { type MockAdapter, createMockAdapter } from './test-utils';

/**
 * User type for session hook testing
 */
interface SessionUser {
  id: string;
  role?: string;
  email?: string;
  name?: string;
  permissions?: string[];
  [key: string]: unknown;
}

/**
 * Mock context for session hook testing
 */
interface SessionHookContext {
  context: {
    adapter: MockAdapter;
    returned?: {
      session: unknown;
      user?: SessionUser;
    };
  };
  json: (data: unknown) => { type: 'json'; data: unknown };
}

/**
 * Result type from session hook handler
 */
type SessionHookResult =
  | {
      type: 'json';
      data: {
        session: unknown;
        user: SessionUser;
      };
    }
  | undefined;

/**
 * Helper to get endpoint response from context (mirrors server implementation)
 */
async function getEndpointResponse<T>(ctx: { context: { returned?: unknown } }): Promise<T | null> {
  const returned = ctx.context.returned;
  if (!returned) return null;
  if (returned instanceof Response) {
    if (returned.status !== 200) return null;
    return (await returned.clone().json()) as T;
  }
  return returned as T;
}

/**
 * Creates a session hook handler that uses a provided permission fetcher.
 * This mirrors the logic in src/server.ts hooks.after handler.
 *
 * @param getPermissionsFn - Function to fetch permissions for a user
 */
function createSessionHookHandler(
  getPermissionsFn: (ctx: SessionHookContext, user: SessionUser) => Promise<string[]>,
) {
  return async function sessionHookHandler(ctx: SessionHookContext): Promise<SessionHookResult> {
    // Get the original response from the endpoint
    const response = await getEndpointResponse<{
      session: unknown;
      user: SessionUser;
    }>(ctx);

    // If no response or no user, don't modify
    if (!response?.user) {
      return undefined;
    }

    // Fetch permissions for the user's role
    const permissions = await getPermissionsFn(ctx, response.user);

    // Return modified response with permissions added to user
    return ctx.json({
      ...response,
      user: {
        ...response.user,
        permissions,
      },
    }) as SessionHookResult;
  };
}

describe('Session Hook', () => {
  let mockAdapter: MockAdapter;
  let mockGetSessionPermissions: Mock<
    (ctx: SessionHookContext, user: SessionUser) => Promise<string[]>
  >;
  let sessionHookHandler: ReturnType<typeof createSessionHookHandler>;

  beforeEach(() => {
    mockAdapter = createMockAdapter();
    mockGetSessionPermissions = vi.fn();
    sessionHookHandler = createSessionHookHandler(mockGetSessionPermissions);
  });

  describe('matcher function', () => {
    it('should match /get-session path', () => {
      const matcher = (context: { path: string }) => context.path === '/get-session';

      expect(matcher({ path: '/get-session' })).toBe(true);
      expect(matcher({ path: '/login' })).toBe(false);
      expect(matcher({ path: '/get-sessions' })).toBe(false);
      expect(matcher({ path: '/api/get-session' })).toBe(false);
    });
  });

  describe('no session handling', () => {
    it('should return undefined when response is null', async () => {
      const ctx: SessionHookContext = {
        context: {
          adapter: mockAdapter,
          returned: undefined,
        },
        json: vi.fn((data) => ({ type: 'json' as const, data })),
      };

      const result = await sessionHookHandler(ctx);

      expect(result).toBeUndefined();
      expect(mockGetSessionPermissions).not.toHaveBeenCalled();
    });

    it('should return undefined when response has no user', async () => {
      const ctx: SessionHookContext = {
        context: {
          adapter: mockAdapter,
          returned: { session: {}, user: undefined },
        },
        json: vi.fn((data) => ({ type: 'json' as const, data })),
      };

      const result = await sessionHookHandler(ctx);

      expect(result).toBeUndefined();
      expect(mockGetSessionPermissions).not.toHaveBeenCalled();
    });
  });

  describe('permission injection', () => {
    it('should add permissions to session user from getSessionPermissions', async () => {
      const ctx: SessionHookContext = {
        context: {
          adapter: mockAdapter,
          returned: {
            session: {},
            user: {
              id: 'user_1',
              role: 'admin',
              email: 'admin@example.com',
            },
          },
        },
        json: vi.fn((data) => ({ type: 'json' as const, data })),
      };

      mockGetSessionPermissions.mockResolvedValueOnce(['user.view', 'user.create', 'user.delete']);

      const result = await sessionHookHandler(ctx);

      expect(result).toBeDefined();
      expect(result?.data.user.permissions).toEqual(['user.view', 'user.create', 'user.delete']);
      expect(mockGetSessionPermissions).toHaveBeenCalledWith(
        ctx,
        expect.objectContaining({
          id: 'user_1',
          role: 'admin',
          email: 'admin@example.com',
        }),
      );
    });

    it('should add empty permissions array when utility returns empty', async () => {
      const ctx: SessionHookContext = {
        context: {
          adapter: mockAdapter,
          returned: {
            session: {},
            user: {
              id: 'user_2',
              email: 'noone@example.com',
            },
          },
        },
        json: vi.fn((data) => ({ type: 'json' as const, data })),
      };

      mockGetSessionPermissions.mockResolvedValueOnce([]);

      const result = await sessionHookHandler(ctx);

      expect(result?.data.user.permissions).toEqual([]);
      expect(mockGetSessionPermissions).toHaveBeenCalledWith(
        ctx,
        expect.objectContaining({
          id: 'user_2',
          email: 'noone@example.com',
        }),
      );
    });

    it('should preserve other user properties when adding permissions', async () => {
      const ctx: SessionHookContext = {
        context: {
          adapter: mockAdapter,
          returned: {
            session: {},
            user: {
              id: 'user_3',
              role: 'admin',
              email: 'admin@example.com',
              name: 'Admin User',
            },
          },
        },
        json: vi.fn((data) => ({ type: 'json' as const, data })),
      };

      mockGetSessionPermissions.mockResolvedValueOnce(['admin.access']);

      const result = await sessionHookHandler(ctx);

      const user = result?.data.user;
      expect(user?.id).toBe('user_3');
      expect(user?.role).toBe('admin');
      expect(user?.email).toBe('admin@example.com');
      expect(user?.name).toBe('Admin User');
      expect(user?.permissions).toEqual(['admin.access']);
    });
  });
});

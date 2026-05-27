import { APIError } from 'better-auth/api';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  requireAdmin,
  requireAllPermissions,
  requireAllSessionPermissions,
  requireAnyPermission,
  requireAnySessionPermission,
  requireDynamicPermission,
  requirePermission,
  requireRole,
  requireRoleAndPermission,
  requireSessionPermission,
} from '../src/middleware/index';
import { type MockAdapter, createMockAdapter, createMockContext } from './test-utils';

// Type for middleware handler to avoid explicit any
type MiddlewareHandler = (ctx: unknown) => Promise<{ context: unknown }>;

describe('RBAC Middleware', () => {
  let mockAdapter: MockAdapter;

  beforeEach(() => {
    mockAdapter = createMockAdapter();
    vi.clearAllMocks();
  });

  describe('requirePermission', () => {
    it('should throw UNAUTHORIZED when no session', async () => {
      const middleware = requirePermission('users:read') as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, { session: null });

      await expect(middleware(ctx)).rejects.toMatchObject({
        body: { message: 'Authentication required' },
      });
    });

    it('should throw FORBIDDEN when user has no role', async () => {
      const middleware = requirePermission('users:read') as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: '' } },
      });

      await expect(middleware(ctx)).rejects.toMatchObject({
        body: { message: 'User has no role assigned' },
      });
    });

    it('should throw FORBIDDEN when role not found in database', async () => {
      const middleware = requirePermission('users:read') as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'unknown' } },
      });
      mockAdapter.findOne.mockResolvedValue(null);

      await expect(middleware(ctx)).rejects.toMatchObject({
        body: { message: 'User role not found' },
      });
    });

    it('should throw FORBIDDEN when user lacks permission', async () => {
      const middleware = requirePermission('users:delete') as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'editor' } },
      });
      mockAdapter.findOne.mockResolvedValue({ id: 'role1', name: 'editor' });
      mockAdapter.findMany
        .mockResolvedValueOnce([{ roleId: 'role1', permissionId: 'perm1' }])
        .mockResolvedValueOnce([{ id: 'perm1', code: 'users:read' }]);

      await expect(middleware(ctx)).rejects.toMatchObject({
        body: { message: 'Missing required permission(s): users:delete' },
      });
    });

    it('should pass when user has required permission', async () => {
      const middleware = requirePermission('users:read') as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'editor' } },
      });
      mockAdapter.findOne.mockResolvedValue({ id: 'role1', name: 'editor' });
      mockAdapter.findMany
        .mockResolvedValueOnce([{ roleId: 'role1', permissionId: 'perm1' }])
        .mockResolvedValueOnce([{ id: 'perm1', code: 'users:read' }]);

      const result = await middleware(ctx);
      expect(result).toHaveProperty('context');
    });

    it('should attach rbac info to context when permission check passes', async () => {
      const middleware = requirePermission('users:read') as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'editor' } },
      });
      mockAdapter.findOne.mockResolvedValue({ id: 'role1', name: 'editor' });
      mockAdapter.findMany
        .mockResolvedValueOnce([{ roleId: 'role1', permissionId: 'perm1' }])
        .mockResolvedValueOnce([{ id: 'perm1', code: 'users:read' }]);

      const result = await middleware(ctx);
      expect((result.context as { rbac: unknown }).rbac).toEqual({
        permissions: ['users:read'],
        role: 'editor',
      });
    });

    it('should require all permissions by default', async () => {
      const middleware = requirePermission([
        'users:read',
        'users:write',
      ]) as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'editor' } },
      });
      mockAdapter.findOne.mockResolvedValue({ id: 'role1', name: 'editor' });
      mockAdapter.findMany
        .mockResolvedValueOnce([{ roleId: 'role1', permissionId: 'perm1' }])
        .mockResolvedValueOnce([{ id: 'perm1', code: 'users:read' }]);

      await expect(middleware(ctx)).rejects.toThrow(APIError);
    });

    it('should pass with mode: any when user has one permission', async () => {
      const middleware = requirePermission(['users:read', 'users:write'], {
        mode: 'any',
      }) as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'editor' } },
      });
      mockAdapter.findOne.mockResolvedValue({ id: 'role1', name: 'editor' });
      mockAdapter.findMany
        .mockResolvedValueOnce([{ roleId: 'role1', permissionId: 'perm1' }])
        .mockResolvedValueOnce([{ id: 'perm1', code: 'users:read' }]);

      const result = await middleware(ctx);
      expect(result).toHaveProperty('context');
    });

    it('should use custom error message', async () => {
      const middleware = requirePermission('admin:access', {
        message: 'Admins only!',
      }) as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'user' } },
      });
      mockAdapter.findOne.mockResolvedValue({ id: 'role1', name: 'user' });
      mockAdapter.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      await expect(middleware(ctx)).rejects.toMatchObject({
        body: { message: 'Admins only!' },
      });
    });
  });

  describe('requireAllPermissions', () => {
    it('should require all permissions', async () => {
      const middleware = requireAllPermissions(['a', 'b', 'c']) as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'partial' } },
      });
      mockAdapter.findOne.mockResolvedValue({ id: 'role1', name: 'partial' });
      mockAdapter.findMany
        .mockResolvedValueOnce([
          { roleId: 'role1', permissionId: 'p1' },
          { roleId: 'role1', permissionId: 'p2' },
        ])
        .mockResolvedValueOnce([
          { id: 'p1', code: 'a' },
          { id: 'p2', code: 'b' },
        ]);

      await expect(middleware(ctx)).rejects.toThrow(APIError);
    });
  });

  describe('requireAnyPermission', () => {
    it('should pass when user has any of the permissions', async () => {
      const middleware = requireAnyPermission([
        'admin',
        'super-admin',
      ]) as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'admin' } },
      });
      mockAdapter.findOne.mockResolvedValue({ id: 'role1', name: 'admin' });
      mockAdapter.findMany
        .mockResolvedValueOnce([{ roleId: 'role1', permissionId: 'p1' }])
        .mockResolvedValueOnce([{ id: 'p1', code: 'admin' }]);

      const result = await middleware(ctx);
      expect(result).toHaveProperty('context');
    });

    it('should fail when user has none of the permissions', async () => {
      const middleware = requireAnyPermission([
        'admin',
        'super-admin',
      ]) as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'user' } },
      });
      mockAdapter.findOne.mockResolvedValue({ id: 'role1', name: 'user' });
      mockAdapter.findMany
        .mockResolvedValueOnce([{ roleId: 'role1', permissionId: 'p1' }])
        .mockResolvedValueOnce([{ id: 'p1', code: 'users:read' }]);

      await expect(middleware(ctx)).rejects.toThrow(APIError);
    });
  });

  describe('requireRole', () => {
    it('should throw UNAUTHORIZED when no session', async () => {
      const middleware = requireRole('admin') as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, { session: null });

      await expect(middleware(ctx)).rejects.toMatchObject({
        body: { message: 'Authentication required' },
      });
    });

    it('should throw FORBIDDEN when user has wrong role', async () => {
      const middleware = requireRole('admin') as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'user' } },
      });

      await expect(middleware(ctx)).rejects.toMatchObject({
        body: { message: 'Required role(s): admin' },
      });
    });

    it('should pass when user has correct role', async () => {
      const middleware = requireRole('admin') as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'admin' } },
      });

      const result = await middleware(ctx);
      expect(result).toHaveProperty('context');
    });

    it('should accept array of roles', async () => {
      const middleware = requireRole(['admin', 'moderator']) as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'moderator' } },
      });

      const result = await middleware(ctx);
      expect(result).toHaveProperty('context');
    });

    it('should use custom error message', async () => {
      const middleware = requireRole('admin', {
        message: 'You need admin privileges',
      }) as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'user' } },
      });

      await expect(middleware(ctx)).rejects.toMatchObject({
        body: { message: 'You need admin privileges' },
      });
    });
  });

  describe('requireAdmin', () => {
    it('should pass for admin role', async () => {
      const middleware = requireAdmin() as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'admin' } },
      });

      const result = await middleware(ctx);
      expect(result).toHaveProperty('context');
    });

    it('should fail for non-admin role with default message', async () => {
      const middleware = requireAdmin() as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'user' } },
      });

      await expect(middleware(ctx)).rejects.toMatchObject({
        body: { message: 'Admin access required' },
      });
    });

    it('should use custom error message', async () => {
      const middleware = requireAdmin({
        message: 'Only admins can do this',
      }) as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'user' } },
      });

      await expect(middleware(ctx)).rejects.toMatchObject({
        body: { message: 'Only admins can do this' },
      });
    });
  });

  describe('requireSessionPermission', () => {
    it('should throw UNAUTHORIZED when no session', async () => {
      const middleware = requireSessionPermission('users:read') as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, { session: null });

      await expect(middleware(ctx)).rejects.toMatchObject({
        body: { message: 'Authentication required' },
      });
    });

    it('should throw FORBIDDEN when session has no permissions array', async () => {
      const middleware = requireSessionPermission('users:read') as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'user' } },
      });

      await expect(middleware(ctx)).rejects.toMatchObject({
        body: {
          message: 'Session permissions not available. Ensure session enhancement is enabled.',
        },
      });
    });

    it('should pass when session has required permission', async () => {
      const middleware = requireSessionPermission('users:read') as unknown as MiddlewareHandler;
      const ctx = {
        ...createMockContext(mockAdapter),
        context: {
          adapter: mockAdapter,
          session: {
            user: {
              id: 'user1',
              role: 'editor',
              permissions: ['users:read', 'users:write'],
            },
          },
        },
      };

      const result = await middleware(ctx);
      expect(result).toHaveProperty('context');
    });

    it('should fail when session lacks required permission', async () => {
      const middleware = requireSessionPermission('users:delete') as unknown as MiddlewareHandler;
      const ctx = {
        ...createMockContext(mockAdapter),
        context: {
          adapter: mockAdapter,
          session: {
            user: {
              id: 'user1',
              role: 'editor',
              permissions: ['users:read', 'users:write'],
            },
          },
        },
      };

      await expect(middleware(ctx)).rejects.toMatchObject({
        body: { message: 'Missing required permission(s): users:delete' },
      });
    });

    it('should require all permissions by default', async () => {
      const middleware = requireSessionPermission([
        'users:read',
        'users:delete',
      ]) as unknown as MiddlewareHandler;
      const ctx = {
        ...createMockContext(mockAdapter),
        context: {
          adapter: mockAdapter,
          session: {
            user: {
              id: 'user1',
              role: 'editor',
              permissions: ['users:read', 'users:write'],
            },
          },
        },
      };

      await expect(middleware(ctx)).rejects.toThrow(APIError);
    });

    it('should pass with mode: any when user has one permission', async () => {
      const middleware = requireSessionPermission(['users:read', 'admin:access'], {
        mode: 'any',
      }) as unknown as MiddlewareHandler;
      const ctx = {
        ...createMockContext(mockAdapter),
        context: {
          adapter: mockAdapter,
          session: {
            user: {
              id: 'user1',
              role: 'editor',
              permissions: ['users:read'],
            },
          },
        },
      };

      const result = await middleware(ctx);
      expect(result).toHaveProperty('context');
    });

    it('should fallback to database when fallbackToDatabase is true', async () => {
      const middleware = requireSessionPermission('users:read', {
        fallbackToDatabase: true,
      }) as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'editor' } },
      });
      mockAdapter.findOne.mockResolvedValue({ id: 'role1', name: 'editor' });
      mockAdapter.findMany
        .mockResolvedValueOnce([{ roleId: 'role1', permissionId: 'perm1' }])
        .mockResolvedValueOnce([{ id: 'perm1', code: 'users:read' }]);

      const result = await middleware(ctx);
      expect(result).toHaveProperty('context');
      expect((result.context as { rbac: unknown }).rbac).toEqual({
        permissions: ['users:read'],
        role: 'editor',
      });
    });

    it('should fail when fallbackToDatabase is true but user has no role', async () => {
      const middleware = requireSessionPermission('users:read', {
        fallbackToDatabase: true,
      }) as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: '' } },
      });

      await expect(middleware(ctx)).rejects.toMatchObject({
        body: {
          message: 'Session permissions not available. Ensure session enhancement is enabled.',
        },
      });
    });
  });

  describe('requireAllSessionPermissions', () => {
    it('should require all permissions from session', async () => {
      const middleware = requireAllSessionPermissions([
        'a',
        'b',
        'c',
      ]) as unknown as MiddlewareHandler;
      const ctx = {
        ...createMockContext(mockAdapter),
        context: {
          adapter: mockAdapter,
          session: {
            user: {
              id: 'user1',
              role: 'partial',
              permissions: ['a', 'b'],
            },
          },
        },
      };

      await expect(middleware(ctx)).rejects.toThrow(APIError);
    });

    it('should pass when session has all permissions', async () => {
      const middleware = requireAllSessionPermissions(['a', 'b']) as unknown as MiddlewareHandler;
      const ctx = {
        ...createMockContext(mockAdapter),
        context: {
          adapter: mockAdapter,
          session: {
            user: {
              id: 'user1',
              role: 'full',
              permissions: ['a', 'b', 'c'],
            },
          },
        },
      };

      const result = await middleware(ctx);
      expect(result).toHaveProperty('context');
    });
  });

  describe('requireAnySessionPermission', () => {
    it('should pass when session has any of the permissions', async () => {
      const middleware = requireAnySessionPermission([
        'admin',
        'super-admin',
      ]) as unknown as MiddlewareHandler;
      const ctx = {
        ...createMockContext(mockAdapter),
        context: {
          adapter: mockAdapter,
          session: {
            user: {
              id: 'user1',
              role: 'admin',
              permissions: ['admin'],
            },
          },
        },
      };

      const result = await middleware(ctx);
      expect(result).toHaveProperty('context');
    });

    it('should fail when session has none of the permissions', async () => {
      const middleware = requireAnySessionPermission([
        'admin',
        'super-admin',
      ]) as unknown as MiddlewareHandler;
      const ctx = {
        ...createMockContext(mockAdapter),
        context: {
          adapter: mockAdapter,
          session: {
            user: {
              id: 'user1',
              role: 'user',
              permissions: ['users:read'],
            },
          },
        },
      };

      await expect(middleware(ctx)).rejects.toThrow(APIError);
    });
  });

  describe('requireRoleAndPermission', () => {
    it('should pass when user has correct role only', async () => {
      const middleware = requireRoleAndPermission({
        roles: 'admin',
      }) as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'admin' } },
      });

      const result = await middleware(ctx);
      expect(result).toHaveProperty('context');
    });

    it('should fail when user has wrong role', async () => {
      const middleware = requireRoleAndPermission({
        roles: 'admin',
      }) as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'user' } },
      });

      await expect(middleware(ctx)).rejects.toMatchObject({
        body: { message: 'Required role(s): admin' },
      });
    });

    it('should check both role and permissions', async () => {
      const middleware = requireRoleAndPermission({
        roles: 'admin',
        permissions: 'system:reset',
      }) as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'admin' } },
      });
      mockAdapter.findOne.mockResolvedValue({ id: 'role1', name: 'admin' });
      mockAdapter.findMany
        .mockResolvedValueOnce([{ roleId: 'role1', permissionId: 'perm1' }])
        .mockResolvedValueOnce([{ id: 'perm1', code: 'system:reset' }]);

      const result = await middleware(ctx);
      expect(result).toHaveProperty('context');
    });

    it('should fail when role matches but permission missing', async () => {
      const middleware = requireRoleAndPermission({
        roles: 'admin',
        permissions: 'system:reset',
      }) as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'admin' } },
      });
      mockAdapter.findOne.mockResolvedValue({ id: 'role1', name: 'admin' });
      mockAdapter.findMany
        .mockResolvedValueOnce([{ roleId: 'role1', permissionId: 'perm1' }])
        .mockResolvedValueOnce([{ id: 'perm1', code: 'users:read' }]);

      await expect(middleware(ctx)).rejects.toMatchObject({
        body: { message: 'Missing required permission(s): system:reset' },
      });
    });

    it('should use session permissions when useSessionPermissions is true', async () => {
      const middleware = requireRoleAndPermission({
        roles: 'admin',
        permissions: 'system:reset',
        useSessionPermissions: true,
      }) as unknown as MiddlewareHandler;
      const ctx = {
        ...createMockContext(mockAdapter),
        context: {
          adapter: mockAdapter,
          session: {
            user: {
              id: 'user1',
              role: 'admin',
              permissions: ['system:reset', 'users:read'],
            },
          },
        },
      };

      const result = await middleware(ctx);
      expect(result).toHaveProperty('context');
    });

    it('should accept multiple roles', async () => {
      const middleware = requireRoleAndPermission({
        roles: ['admin', 'moderator'],
      }) as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'moderator' } },
      });

      const result = await middleware(ctx);
      expect(result).toHaveProperty('context');
    });
  });

  describe('requireDynamicPermission', () => {
    it('should compute permission from context params', async () => {
      const middleware = requireDynamicPermission(
        (ctx) => `posts:${ctx.params?.postId}:edit`,
      ) as unknown as MiddlewareHandler;
      const ctx = {
        ...createMockContext(mockAdapter, {
          session: { user: { id: 'user1', role: 'editor' } },
        }),
        params: { postId: '123' },
      };
      mockAdapter.findOne.mockResolvedValue({ id: 'role1', name: 'editor' });
      mockAdapter.findMany
        .mockResolvedValueOnce([{ roleId: 'role1', permissionId: 'perm1' }])
        .mockResolvedValueOnce([{ id: 'perm1', code: 'posts:123:edit' }]);

      const result = await middleware(ctx);
      expect(result).toHaveProperty('context');
      expect(
        (result.context as { rbac: { checkedPermissions: string[] } }).rbac.checkedPermissions,
      ).toEqual(['posts:123:edit']);
    });

    it('should fail when dynamic permission not satisfied', async () => {
      const middleware = requireDynamicPermission(
        (ctx) => `posts:${ctx.params?.postId}:edit`,
      ) as unknown as MiddlewareHandler;
      const ctx = {
        ...createMockContext(mockAdapter, {
          session: { user: { id: 'user1', role: 'viewer' } },
        }),
        params: { postId: '123' },
      };
      mockAdapter.findOne.mockResolvedValue({ id: 'role1', name: 'viewer' });
      mockAdapter.findMany
        .mockResolvedValueOnce([{ roleId: 'role1', permissionId: 'perm1' }])
        .mockResolvedValueOnce([{ id: 'perm1', code: 'posts:view' }]);

      await expect(middleware(ctx)).rejects.toMatchObject({
        body: { message: 'Missing required permission(s): posts:123:edit' },
      });
    });

    it('should use session permissions when configured', async () => {
      const middleware = requireDynamicPermission((ctx) => `posts:${ctx.params?.postId}:edit`, {
        useSessionPermissions: true,
      }) as unknown as MiddlewareHandler;
      const ctx = {
        ...createMockContext(mockAdapter),
        context: {
          adapter: mockAdapter,
          session: {
            user: {
              id: 'user1',
              role: 'editor',
              permissions: ['posts:123:edit', 'posts:view'],
            },
          },
        },
        params: { postId: '123' },
      };

      const result = await middleware(ctx);
      expect(result).toHaveProperty('context');
    });

    it('should support array of permissions from dynamic function', async () => {
      const middleware = requireDynamicPermission(
        (ctx) => [`posts:${ctx.params?.postId}:read`, 'posts:list'],
        { mode: 'all' },
      ) as unknown as MiddlewareHandler;
      const ctx = {
        ...createMockContext(mockAdapter, {
          session: { user: { id: 'user1', role: 'editor' } },
        }),
        params: { postId: '456' },
      };
      mockAdapter.findOne.mockResolvedValue({ id: 'role1', name: 'editor' });
      mockAdapter.findMany
        .mockResolvedValueOnce([
          { roleId: 'role1', permissionId: 'perm1' },
          { roleId: 'role1', permissionId: 'perm2' },
        ])
        .mockResolvedValueOnce([
          { id: 'perm1', code: 'posts:456:read' },
          { id: 'perm2', code: 'posts:list' },
        ]);

      const result = await middleware(ctx);
      expect(result).toHaveProperty('context');
    });

    it('should fallback to database when session permissions not available', async () => {
      const middleware = requireDynamicPermission(() => 'posts:view', {
        useSessionPermissions: true,
        fallbackToDatabase: true,
      }) as unknown as MiddlewareHandler;
      const ctx = createMockContext(mockAdapter, {
        session: { user: { id: 'user1', role: 'viewer' } },
      });
      mockAdapter.findOne.mockResolvedValue({ id: 'role1', name: 'viewer' });
      mockAdapter.findMany
        .mockResolvedValueOnce([{ roleId: 'role1', permissionId: 'perm1' }])
        .mockResolvedValueOnce([{ id: 'perm1', code: 'posts:view' }]);

      const result = await middleware(ctx);
      expect(result).toHaveProperty('context');
    });
  });
});

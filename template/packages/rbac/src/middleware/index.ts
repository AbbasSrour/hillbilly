import { APIError, createAuthMiddleware, sessionMiddleware } from 'better-auth/api';
import type { Role as RoleModel } from '../types/schema';
import {
  type EnhancedSessionUser,
  hasPermissions,
  userHasAllPermissions,
  userHasAnyPermission,
} from '../types/session';
import { getRolePermissions } from '../utils/get-role-permissions';

// ============================================================================
// Types
// ============================================================================

/**
 * Options for permission middleware factory functions
 */
export interface PermissionMiddlewareOptions {
  /** Custom error message when permission check fails */
  message?: string;
  /** Permission check mode: 'all' requires all permissions, 'any' requires at least one */
  mode?: 'all' | 'any';
}

/**
 * Options for role middleware factory functions
 */
export interface RoleMiddlewareOptions {
  /** Custom error message when role check fails */
  message?: string;
}

/**
 * Options for session permission middleware with optional fallback
 */
export interface SessionPermissionMiddlewareOptions extends PermissionMiddlewareOptions {
  /**
   * If true, falls back to database lookup when session doesn't have permissions.
   * Useful during migration or when session enhancement might not be enabled.
   * @default false
   */
  fallbackToDatabase?: boolean;
}

/**
 * Combined options for role and permission checks
 */
export interface RoleAndPermissionOptions {
  /** Role(s) the user must have */
  roles?: string | string[];
  /** Permission(s) the user must have */
  permissions?: string | string[];
  /** Permission check mode */
  permissionMode?: 'all' | 'any';
  /** Custom error message */
  message?: string;
  /** Use session permissions instead of database lookup */
  useSessionPermissions?: boolean;
}

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Validates session exists and returns it, throwing UNAUTHORIZED if missing
 */
function assertSession(session: unknown): asserts session is {
  user: { id: string; role?: string; permissions?: string[] };
} {
  if (!session) {
    throw new APIError('UNAUTHORIZED', {
      message: 'Authentication required',
    });
  }
}

/**
 * Checks if user permissions satisfy the required permissions based on mode
 */
function checkPermissionsSatisfied(
  userPermissions: string[],
  requiredPermissions: string[],
  mode: 'all' | 'any',
): boolean {
  return mode === 'all'
    ? requiredPermissions.every((p) => userPermissions.includes(p))
    : requiredPermissions.some((p) => userPermissions.includes(p));
}

/**
 * Generates default error message for permission failures
 */
function getPermissionErrorMessage(permissions: string[]): string {
  return `Missing required permission(s): ${permissions.join(', ')}`;
}

/**
 * Fetches user permissions from database based on role name
 */
async function fetchUserPermissionsFromDatabase(
  ctx: {
    context: {
      adapter: {
        findOne: (params: unknown) => Promise<unknown>;
        findMany: (params: unknown) => Promise<unknown[]>;
      };
    };
  },
  roleName: string,
): Promise<string[]> {
  const role = (await ctx.context.adapter.findOne({
    model: 'role',
    where: [{ field: 'name', value: roleName }],
  })) as RoleModel | null;

  if (!role) {
    throw new APIError('FORBIDDEN', {
      message: 'User role not found',
    });
  }

  const permsMap = await getRolePermissions(ctx as Parameters<typeof getRolePermissions>[0], [
    role.id,
  ]);
  const rolePerms = permsMap[role.id] || [];
  return rolePerms.map((p) => p.code);
}

// ============================================================================
// Core Middleware
// ============================================================================

/**
 * Middleware that requires the user to be authenticated.
 * This is a re-export convenience wrapper around Better Auth's sessionMiddleware.
 *
 * @example
 * ```typescript
 * const endpoint = createAuthEndpoint('/api/protected', {
 *   method: 'GET',
 *   use: [requireAuth],
 * }, handler);
 * ```
 */
export const requireAuth = sessionMiddleware;

/**
 * Middleware factory that requires the user to have specific permission(s).
 * Fetches permissions from the database based on the user's role.
 *
 * By default requires ALL permissions (use mode: 'any' to require just one).
 *
 * @param permission - Single permission code or array of permission codes to check
 * @param options - Configuration options for the middleware
 * @returns Better Auth middleware that enforces the permission check
 *
 * @example
 * ```typescript
 * // Require single permission
 * const endpoint = createAuthEndpoint('/api/users', {
 *   method: 'GET',
 *   use: [sessionMiddleware, requirePermission('users:read')],
 * }, handler);
 *
 * // Require all permissions
 * const endpoint = createAuthEndpoint('/api/users', {
 *   method: 'DELETE',
 *   use: [sessionMiddleware, requirePermission(['users:read', 'users:delete'])],
 * }, handler);
 *
 * // Require any permission
 * const endpoint = createAuthEndpoint('/api/content', {
 *   method: 'GET',
 *   use: [sessionMiddleware, requirePermission(['content:read', 'admin:read'], { mode: 'any' })],
 * }, handler);
 * ```
 */
export const requirePermission = (
  permission: string | string[],
  options?: PermissionMiddlewareOptions,
) => {
  const permissions = Array.isArray(permission) ? permission : [permission];
  const mode = options?.mode ?? 'all';
  const message = options?.message ?? getPermissionErrorMessage(permissions);

  return createAuthMiddleware(async (ctx) => {
    const session = ctx.context.session;
    assertSession(session);

    const userRoleName = session.user.role;

    if (!userRoleName) {
      throw new APIError('FORBIDDEN', {
        message: 'User has no role assigned',
      });
    }

    const userPermCodes = await fetchUserPermissionsFromDatabase(ctx, userRoleName);

    if (!checkPermissionsSatisfied(userPermCodes, permissions, mode)) {
      throw new APIError('FORBIDDEN', { message });
    }

    // Attach fetched permissions to context for downstream use
    return {
      context: {
        ...ctx.context,
        rbac: {
          permissions: userPermCodes,
          role: userRoleName,
        },
      },
    };
  });
};

/**
 * Middleware factory that requires ALL specified permissions.
 * Convenience wrapper around requirePermission with mode: 'all'.
 *
 * @param permissions - Array of permission codes that are all required
 * @param options - Configuration options (excluding mode)
 * @returns Better Auth middleware that enforces all permissions
 *
 * @example
 * ```typescript
 * const endpoint = createAuthEndpoint('/api/users', {
 *   method: 'DELETE',
 *   use: [sessionMiddleware, requireAllPermissions(['users:read', 'users:delete'])],
 * }, handler);
 * ```
 */
export const requireAllPermissions = (
  permissions: string[],
  options?: Omit<PermissionMiddlewareOptions, 'mode'>,
) => requirePermission(permissions, { ...options, mode: 'all' });

/**
 * Middleware factory that requires ANY of the specified permissions.
 * Convenience wrapper around requirePermission with mode: 'any'.
 *
 * @param permissions - Array of permission codes where at least one is required
 * @param options - Configuration options (excluding mode)
 * @returns Better Auth middleware that enforces any permission
 *
 * @example
 * ```typescript
 * const endpoint = createAuthEndpoint('/api/reports', {
 *   method: 'GET',
 *   use: [sessionMiddleware, requireAnyPermission(['reports:read', 'admin:access'])],
 * }, handler);
 * ```
 */
export const requireAnyPermission = (
  permissions: string[],
  options?: Omit<PermissionMiddlewareOptions, 'mode'>,
) => requirePermission(permissions, { ...options, mode: 'any' });

/**
 * Middleware factory that requires the user to have a specific role.
 * Checks the role directly from the session without database lookup.
 *
 * @param role - Single role name or array of allowed role names
 * @param options - Configuration options for the middleware
 * @returns Better Auth middleware that enforces the role check
 *
 * @example
 * ```typescript
 * // Require single role
 * const endpoint = createAuthEndpoint('/api/admin', {
 *   method: 'GET',
 *   use: [sessionMiddleware, requireRole('admin')],
 * }, handler);
 *
 * // Allow multiple roles
 * const endpoint = createAuthEndpoint('/api/manage', {
 *   method: 'GET',
 *   use: [sessionMiddleware, requireRole(['admin', 'manager'])],
 * }, handler);
 * ```
 */
export const requireRole = (role: string | string[], options?: RoleMiddlewareOptions) => {
  const allowedRoles = Array.isArray(role) ? role : [role];
  const message = options?.message ?? `Required role(s): ${allowedRoles.join(', ')}`;

  return createAuthMiddleware(async (ctx) => {
    const session = ctx.context.session;
    assertSession(session);

    const userRole = session.user.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new APIError('FORBIDDEN', { message });
    }

    return { context: ctx.context };
  });
};

/**
 * Middleware factory that requires the user to be an admin.
 * Convenience wrapper around requireRole('admin').
 *
 * @param options - Configuration options for the middleware
 * @returns Better Auth middleware that enforces admin role
 *
 * @example
 * ```typescript
 * const endpoint = createAuthEndpoint('/api/admin/settings', {
 *   method: 'POST',
 *   use: [sessionMiddleware, requireAdmin()],
 * }, handler);
 * ```
 */
export const requireAdmin = (options?: RoleMiddlewareOptions) =>
  requireRole('admin', {
    message: options?.message ?? 'Admin access required',
  });

/**
 * Middleware factory that uses pre-loaded permissions from enhanced session.
 * More efficient when session already has permissions array (from session enhancement hook).
 *
 * Use this instead of requirePermission when:
 * - Session enhancement is enabled (permissions are already loaded)
 * - You want to avoid additional database queries
 *
 * @param permission - Single permission code or array of permission codes to check
 * @param options - Configuration options for the middleware
 * @returns Better Auth middleware that enforces the permission check
 *
 * @example
 * ```typescript
 * // When session enhancement is enabled, permissions are already on session.user
 * const endpoint = createAuthEndpoint('/api/users', {
 *   method: 'GET',
 *   use: [sessionMiddleware, requireSessionPermission('users:read')],
 * }, handler);
 *
 * // With fallback to database if session permissions not available
 * const endpoint = createAuthEndpoint('/api/users', {
 *   method: 'GET',
 *   use: [sessionMiddleware, requireSessionPermission('users:read', { fallbackToDatabase: true })],
 * }, handler);
 * ```
 */
export const requireSessionPermission = (
  permission: string | string[],
  options?: SessionPermissionMiddlewareOptions,
) => {
  const permissions = Array.isArray(permission) ? permission : [permission];
  const mode = options?.mode ?? 'all';
  const message = options?.message ?? getPermissionErrorMessage(permissions);
  const fallbackToDatabase = options?.fallbackToDatabase ?? false;

  return createAuthMiddleware(async (ctx) => {
    const session = ctx.context.session;
    assertSession(session);

    const user = session.user as unknown as EnhancedSessionUser | undefined;

    // Check if permissions are available on session (from session enhancement)
    if (!user || !hasPermissions(user)) {
      // Fallback to database if enabled
      if (fallbackToDatabase && session.user.role) {
        const userPermCodes = await fetchUserPermissionsFromDatabase(ctx, session.user.role);

        if (!checkPermissionsSatisfied(userPermCodes, permissions, mode)) {
          throw new APIError('FORBIDDEN', { message });
        }

        return {
          context: {
            ...ctx.context,
            rbac: {
              permissions: userPermCodes,
              role: session.user.role,
            },
          },
        };
      }

      throw new APIError('FORBIDDEN', {
        message: 'Session permissions not available. Ensure session enhancement is enabled.',
      });
    }

    // Check permissions based on mode using existing helpers
    const hasRequiredPermission =
      mode === 'all'
        ? userHasAllPermissions(user, permissions)
        : userHasAnyPermission(user, permissions);

    if (!hasRequiredPermission) {
      throw new APIError('FORBIDDEN', { message });
    }

    return { context: ctx.context };
  });
};

/**
 * Middleware factory that uses pre-loaded permissions and requires ALL specified permissions.
 * Convenience wrapper around requireSessionPermission with mode: 'all'.
 *
 * @param permissions - Array of permission codes that are all required
 * @param options - Configuration options (excluding mode)
 * @returns Better Auth middleware that enforces all permissions from session
 */
export const requireAllSessionPermissions = (
  permissions: string[],
  options?: Omit<SessionPermissionMiddlewareOptions, 'mode'>,
) => requireSessionPermission(permissions, { ...options, mode: 'all' });

/**
 * Middleware factory that uses pre-loaded permissions and requires ANY of the specified permissions.
 * Convenience wrapper around requireSessionPermission with mode: 'any'.
 *
 * @param permissions - Array of permission codes where at least one is required
 * @param options - Configuration options (excluding mode)
 * @returns Better Auth middleware that enforces any permission from session
 */
export const requireAnySessionPermission = (
  permissions: string[],
  options?: Omit<SessionPermissionMiddlewareOptions, 'mode'>,
) => requireSessionPermission(permissions, { ...options, mode: 'any' });

// ============================================================================
// Advanced Middleware
// ============================================================================

/**
 * Middleware factory for combined role and permission checks.
 * Useful when you need to verify both role AND permissions in a single middleware.
 *
 * @param options - Configuration for role and permission requirements
 * @returns Better Auth middleware that enforces both role and permission checks
 *
 * @example
 * ```typescript
 * // Require admin role AND specific permission
 * const endpoint = createAuthEndpoint('/api/system/reset', {
 *   method: 'POST',
 *   use: [sessionMiddleware, requireRoleAndPermission({
 *     roles: 'admin',
 *     permissions: 'system:reset',
 *   })],
 * }, handler);
 *
 * // Require one of multiple roles AND any of multiple permissions
 * const endpoint = createAuthEndpoint('/api/content/moderate', {
 *   method: 'POST',
 *   use: [sessionMiddleware, requireRoleAndPermission({
 *     roles: ['admin', 'moderator'],
 *     permissions: ['content:moderate', 'content:delete'],
 *     permissionMode: 'any',
 *   })],
 * }, handler);
 * ```
 */
export const requireRoleAndPermission = (options: RoleAndPermissionOptions) => {
  const roles = options.roles
    ? Array.isArray(options.roles)
      ? options.roles
      : [options.roles]
    : [];
  const permissions = options.permissions
    ? Array.isArray(options.permissions)
      ? options.permissions
      : [options.permissions]
    : [];
  const permissionMode = options.permissionMode ?? 'all';
  const useSessionPermissions = options.useSessionPermissions ?? false;

  return createAuthMiddleware(async (ctx) => {
    const session = ctx.context.session;
    assertSession(session);

    const userRole = session.user.role;

    // Check role if specified
    if (roles.length > 0) {
      if (!userRole || !roles.includes(userRole)) {
        throw new APIError('FORBIDDEN', {
          message: options.message ?? `Required role(s): ${roles.join(', ')}`,
        });
      }
    }

    // Check permissions if specified
    if (permissions.length > 0) {
      let userPermCodes: string[];

      if (useSessionPermissions) {
        const user = session.user as unknown as EnhancedSessionUser | undefined;
        if (!user || !hasPermissions(user)) {
          throw new APIError('FORBIDDEN', {
            message: 'Session permissions not available. Ensure session enhancement is enabled.',
          });
        }
        userPermCodes = user.permissions;
      } else {
        if (!userRole) {
          throw new APIError('FORBIDDEN', {
            message: 'User has no role assigned',
          });
        }
        userPermCodes = await fetchUserPermissionsFromDatabase(ctx, userRole);
      }

      if (!checkPermissionsSatisfied(userPermCodes, permissions, permissionMode)) {
        throw new APIError('FORBIDDEN', {
          message: options.message ?? getPermissionErrorMessage(permissions),
        });
      }

      return {
        context: {
          ...ctx.context,
          rbac: {
            permissions: userPermCodes,
            role: userRole,
          },
        },
      };
    }

    return { context: ctx.context };
  });
};

/**
 * Middleware factory for dynamic/resource-based permission checks.
 * Allows computing the required permission at runtime based on request parameters.
 *
 * @param getPermission - Function that returns the required permission(s) based on context
 * @param options - Configuration options for the middleware
 * @returns Better Auth middleware that enforces the dynamic permission check
 *
 * @example
 * ```typescript
 * // Check permission based on resource ID
 * const endpoint = createAuthEndpoint('/api/posts/:postId', {
 *   method: 'PUT',
 *   use: [sessionMiddleware, requireDynamicPermission(
 *     (ctx) => `posts:${ctx.params.postId}:edit`
 *   )],
 * }, handler);
 *
 * // Check permission based on request body
 * const endpoint = createAuthEndpoint('/api/documents', {
 *   method: 'POST',
 *   use: [sessionMiddleware, requireDynamicPermission(
 *     (ctx) => `documents:${ctx.body.type}:create`,
 *     { useSessionPermissions: true }
 *   )],
 * }, handler);
 * ```
 */
export const requireDynamicPermission = (
  getPermission: (ctx: {
    params?: Record<string, string>;
    body?: unknown;
    query?: Record<string, string>;
  }) => string | string[],
  options?: SessionPermissionMiddlewareOptions & {
    useSessionPermissions?: boolean;
  },
) => {
  const mode = options?.mode ?? 'all';
  const useSessionPermissions = options?.useSessionPermissions ?? false;
  const fallbackToDatabase = options?.fallbackToDatabase ?? false;

  return createAuthMiddleware(async (ctx) => {
    const session = ctx.context.session;
    assertSession(session);

    // Compute required permissions dynamically
    const requiredPermission = getPermission({
      params: (ctx as { params?: Record<string, string> }).params,
      body: (ctx as { body?: unknown }).body,
      query: (ctx as { query?: Record<string, string> }).query,
    });
    const permissions = Array.isArray(requiredPermission)
      ? requiredPermission
      : [requiredPermission];
    const message = options?.message ?? getPermissionErrorMessage(permissions);

    let userPermCodes: string[];

    if (useSessionPermissions) {
      const user = session.user as unknown as EnhancedSessionUser | undefined;

      if (!user || !hasPermissions(user)) {
        if (fallbackToDatabase && session.user.role) {
          userPermCodes = await fetchUserPermissionsFromDatabase(ctx, session.user.role);
        } else {
          throw new APIError('FORBIDDEN', {
            message: 'Session permissions not available. Ensure session enhancement is enabled.',
          });
        }
      } else {
        userPermCodes = user.permissions;
      }
    } else {
      const userRole = session.user.role;
      if (!userRole) {
        throw new APIError('FORBIDDEN', {
          message: 'User has no role assigned',
        });
      }
      userPermCodes = await fetchUserPermissionsFromDatabase(ctx, userRole);
    }

    if (!checkPermissionsSatisfied(userPermCodes, permissions, mode)) {
      throw new APIError('FORBIDDEN', { message });
    }

    return {
      context: {
        ...ctx.context,
        rbac: {
          permissions: userPermCodes,
          role: session.user.role,
          checkedPermissions: permissions,
        },
      },
    };
  });
};

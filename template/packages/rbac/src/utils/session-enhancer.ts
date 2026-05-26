import type { AuthContext, BetterAuthOptions } from 'better-auth';
import type { RBACPluginConfig } from '../types/config';
import type { RBACSchemaConfig, Role as RoleModel } from '../types/schema';
import { getRolePermissions } from './get-role-permissions';

/**
 * Context type for session enhancement operations.
 * Requires access to the Better Auth adapter for database queries.
 */
export interface SessionEnhancerContext {
  context: AuthContext<BetterAuthOptions>;
}

/**
 * User type with optional role for session enhancement.
 */
export interface SessionUser {
  role?: string;
  [key: string]: unknown;
}

/**
 * Checks if a role name is valid (non-empty, non-whitespace string).
 *
 * @param role - The role value to validate
 * @returns true if the role is a valid non-empty string
 */
function isValidRole(role: unknown): role is string {
  return typeof role === 'string' && role.trim().length > 0;
}

/**
 * Enhances a session user with their role's permissions.
 *
 * This utility fetches the permissions associated with a user's role from the database
 * and returns an array of permission codes. It handles various edge cases gracefully:
 * - Empty string role: returns empty array
 * - Whitespace-only role: returns empty array
 * - Null/undefined role: returns empty array
 * - Role not found in database: returns empty array
 * - Database errors: returns empty array (graceful degradation)
 *
 * @param ctx - The auth context with adapter access for database queries
 * @param user - The session user object containing an optional role property
 * @returns Promise resolving to array of permission codes, empty array on any error
 *
 * @example
 * ```typescript
 * const permissions = await getSessionPermissions(ctx, session.user);
 * // Returns: ['user.view', 'user.create'] or [] on error
 * ```
 */
export async function getSessionPermissions(
  ctx: SessionEnhancerContext,
  user: SessionUser | null | undefined,
  pluginConfig?: RBACPluginConfig<RBACSchemaConfig>,
): Promise<string[]> {
  // If no user provided, return empty permissions
  if (!user) {
    return [];
  }

  try {
    const userRoleName = user.role;

    // Validate role - must be non-empty, non-whitespace string
    if (!isValidRole(userRoleName)) {
      return [];
    }

    console.log(userRoleName);

    // Find the role entity by name
    // biome-ignore lint/suspicious/noExplicitAny: Adapter model map is not typed
    const adapter = ctx.context.adapter as any;
    const roleModelName =
      pluginConfig?.schema?.role?.modelName || adapter?.modelMap?.role || 'role';
    const role = (await ctx.context.adapter.findOne({
      model: roleModelName,
      where: [{ field: 'name', value: userRoleName }],
    })) as RoleModel | null;

    // Role not found in database
    if (!role) {
      return [];
    }

    // Get permissions for this role
    const permsMap = await getRolePermissions(ctx, [role.id], pluginConfig);
    const rolePerms = permsMap[role.id] || [];
    console.log(rolePerms, permsMap);

    // Extract and return permission codes
    return rolePerms.map((p) => p.code);
  } catch (error) {
    // Log error using Better Auth logger if available, otherwise use console
    const logger = ctx.context.logger;
    if (logger?.error) {
      logger.error('[RBAC] Error fetching permissions for session:', error);
    } else {
      console.error('[RBAC] Error fetching permissions for session:', error);
    }

    // Graceful degradation - return empty array to avoid breaking the app
    return [];
  }
}

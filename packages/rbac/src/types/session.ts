/**
 * Session types with RBAC permissions
 */

/**
 * User object enhanced with RBAC permissions.
 * This extends the base user with permission codes fetched from the user's role.
 */
export interface EnhancedSessionUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  /**
   * Array of permission codes the user has based on their role.
   * Empty array if user has no role or role has no permissions.
   */
  permissions: string[];
}

/**
 * Session object with enhanced user containing permissions.
 */
export interface EnhancedSession {
  user: EnhancedSessionUser;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
}

/**
 * Type guard to check if a user object has permissions attached.
 * Validates that permissions is an array and all elements are strings.
 */
export function hasPermissions(user: unknown): user is EnhancedSessionUser {
  return (
    typeof user === "object" &&
    user !== null &&
    "permissions" in user &&
    Array.isArray((user as EnhancedSessionUser).permissions) &&
    (user as EnhancedSessionUser).permissions.every((p) => typeof p === "string")
  );
}

/**
 * Helper to check if a user has a specific permission.
 */
export function userHasPermission(
  user: EnhancedSessionUser | null | undefined,
  permission: string,
): boolean {
  if (!user || !hasPermissions(user)) {
    return false;
  }
  return user.permissions.includes(permission);
}

/**
 * Helper to check if a user has all specified permissions.
 */
export function userHasAllPermissions(
  user: EnhancedSessionUser | null | undefined,
  permissions: string[],
): boolean {
  if (!user || !hasPermissions(user)) {
    return false;
  }
  return permissions.every((p) => user.permissions.includes(p));
}

/**
 * Helper to check if a user has any of the specified permissions.
 */
export function userHasAnyPermission(
  user: EnhancedSessionUser | null | undefined,
  permissions: string[],
): boolean {
  if (!user || !hasPermissions(user)) {
    return false;
  }
  return permissions.some((p) => user.permissions.includes(p));
}

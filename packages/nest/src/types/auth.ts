import type { EnhancedSessionUser } from "@hillbilly/rbac";

/**
 * Authenticated user type. Extends RBAC permissions by default.
 * Augment in your app to add entity fields:
 *
 * ```ts
 * declare module '@hillbilly/nest' {
 *   interface AuthUser extends UserEntity {}
 * }
 * ```
 */
export interface AuthUser extends EnhancedSessionUser {
  [key: symbol]: unknown;
}

/**
 * Auth session type. Augment in your app to add
 * Better Auth session fields:
 *
 * ```ts
 * declare module '@hillbilly/nest' {
 *   interface AuthSession extends BetterAuthSession {}
 * }
 * ```
 */
export interface AuthSession {
  user?: AuthUser | null;
  session?: unknown;
}

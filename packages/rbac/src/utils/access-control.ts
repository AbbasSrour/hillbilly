import type { PermissionDefinition } from "../types";

/**
 * Check if a role is static (from Admin plugin)
 */
export function isStaticRole(roleName: string, staticRoles: Record<string, string[]>): boolean {
  return roleName in staticRoles;
}

/**
 * Permission definition with role assignments
 */
export interface PermissionWithRoles extends PermissionDefinition {
  users?: string[];
}

/**
 * Build the access control statement from permission definitions
 * Parses "resource.action" format into { resource: [action1, action2, ...] }
 */
export function buildStatementFromPermissions(
  permissions: PermissionWithRoles[],
): Record<string, string[]> {
  const statement: Record<string, string[]> = {};

  for (const permission of permissions) {
    const parts = permission.code.split(".");
    const resource = parts[0];

    if (!resource) continue;

    const action = parts.slice(1).join(".");

    if (!statement[resource]) {
      statement[resource] = [];
    }
    if (!statement[resource].includes(action)) {
      statement[resource].push(action);
    }
  }

  return statement;
}

/**
 * Build role permissions from permission definitions
 * Returns permissions for a specific role based on the `users` field
 */
export function buildRolePermissions(
  permissions: PermissionWithRoles[],
  role: string,
): Record<string, string[]> {
  const rolePerms: Record<string, string[]> = {};

  for (const permission of permissions) {
    if (permission.users?.includes(role)) {
      const parts = permission.code.split(".");
      const resource = parts[0];

      if (!resource) continue;

      const action = parts.slice(1).join(".");

      if (!rolePerms[resource]) {
        rolePerms[resource] = [];
      }
      if (!rolePerms[resource].includes(action)) {
        rolePerms[resource].push(action);
      }
    }
  }

  return rolePerms;
}

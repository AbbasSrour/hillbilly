import type { BetterAuthClientPlugin, BetterFetchOption } from "better-auth/client";
import type { rbac } from "./server";
import type {
  CheckPermissionResponse,
  PermissionListResponse,
  RBACSchemaConfig,
  RoleListResponse,
  RoleResponse,
  SyncResponse,
  UserPermissionsResponse,
} from "./types";

// ============================================================================
// Type Inference Utility
// ============================================================================

/**
 * Infer RBAC additional fields from the server auth configuration.
 *
 * This function helps with type inference on the client side when you have
 * additional fields defined in your RBAC schema.
 *
 * @example
 * ```typescript
 * // When you can import the auth type directly (monorepo/same project)
 * import { inferRbacAdditionalFields } from "@hillbilly/rbac";
 * import type { auth } from "./auth";
 *
 * const client = createAuthClient({
 *   plugins: [
 *     rbacClient({
 *       schema: inferRbacAdditionalFields<typeof auth>()
 *     })
 *   ]
 * });
 * ```
 *
 * @example
 * ```typescript
 * // When you can't import auth type (separate projects)
 * import { inferRbacAdditionalFields } from "@hillbilly/rbac";
 *
 * const client = createAuthClient({
 *   plugins: [
 *     rbacClient({
 *       schema: inferRbacAdditionalFields({
 *         role: {
 *           additionalFields: {
 *             color: { type: "string" },
 *             priority: { type: "number" }
 *           }
 *         }
 *       })
 *     })
 *   ]
 * });
 * ```
 */
export function inferRbacAdditionalFields<
  Auth extends { options?: { plugins?: unknown[] } } | undefined = undefined,
>(): Auth extends { options: { plugins: infer P } }
  ? P extends Array<infer Plugin>
    ? Plugin extends { id: "rbac"; schema: infer S }
      ? S extends RBACSchemaConfig
        ? S
        : RBACSchemaConfig
      : RBACSchemaConfig
    : RBACSchemaConfig
  : RBACSchemaConfig;

export function inferRbacAdditionalFields<S extends RBACSchemaConfig>(schema: S): S;

export function inferRbacAdditionalFields(schema?: RBACSchemaConfig) {
  return schema ?? ({} as RBACSchemaConfig);
}

// ============================================================================
// Input Types
// ============================================================================

/**
 * Pagination query parameters for list endpoints
 */
export interface PaginationQuery {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

/**
 * Input for creating a new role
 */
export interface CreateRoleInput {
  name: string;
  description?: string;
  permissionIds?: string[];
}

/**
 * Input for updating an existing role
 */
export interface UpdateRoleInput {
  roleId: string;
  name?: string;
  description?: string;
  permissionIds?: string[];
}

/**
 * Input for getting a single role by ID
 */
export interface GetRoleInput {
  roleId: string;
}

/**
 * Input for deleting a role
 */
export interface DeleteRoleInput {
  roleId: string;
}

/**
 * Input for getting role permissions
 */
export interface ListRolePermissionsInput {
  roleId: string;
}

/**
 * Input for assigning a permission to a role
 */
export interface AssignPermissionInput {
  roleId: string;
  permissionId: string;
}

/**
 * Input for removing a permission from a role
 */
export interface RemovePermissionInput {
  roleId: string;
  permissionId: string;
}

/**
 * Input for checking if user has permission(s)
 */
export interface CheckPermissionInput {
  permission: string | string[];
}

// ============================================================================
// Helper to convert pagination query to URL params
// ============================================================================

function buildQueryString(query?: PaginationQuery): string {
  if (!query) return "";

  const params = new URLSearchParams();
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  if (query.offset !== undefined) params.set("offset", String(query.offset));
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.sortDirection) params.set("sortDirection", query.sortDirection);

  const str = params.toString();
  return str ? `?${str}` : "";
}

// ============================================================================
// Client Plugin Options
// ============================================================================

/**
 * Options for the RBAC client plugin
 */
export interface RBACClientOptions<S extends RBACSchemaConfig = RBACSchemaConfig> {
  /**
   * Schema configuration for type inference.
   * Use `inferRbacAdditionalFields` to automatically infer from server config.
   *
   * @example
   * ```typescript
   * rbacClient({
   *   schema: inferRbacAdditionalFields<typeof auth>()
   * })
   * ```
   */
  schema?: S;
}

// ============================================================================
// Client Plugin
// ============================================================================

/**
 * RBAC Client Plugin for Better Auth
 *
 * Provides client-side methods to interact with the RBAC server endpoints.
 * All methods are namespaced under `client.rbac.*` following Better Auth conventions.
 *
 * @example
 * ```typescript
 * import { createAuthClient } from "better-auth/client";
 * import { rbacClient } from "@hillbilly/rbac";
 *
 * const client = createAuthClient({
 *   plugins: [rbacClient()]
 * });
 *
 * // List all roles
 * const { data, error } = await client.rbac.listRoles();
 *
 * // Check user permission
 * const { data } = await client.rbac.checkPermission({
 *   permission: "users:read"
 * });
 *
 * // Get current user's permissions
 * const { data } = await client.rbac.getUserPermissions();
 * ```
 *
 * @example
 * ```typescript
 * // With schema inference for additional fields
 * import { rbacClient, inferRbacAdditionalFields } from "@hillbilly/rbac";
 * import type { auth } from "./auth";
 *
 * const client = createAuthClient({
 *   plugins: [
 *     rbacClient({
 *       schema: inferRbacAdditionalFields<typeof auth>()
 *     })
 *   ]
 * });
 * ```
 */
export const rbacClient = <S extends RBACSchemaConfig = RBACSchemaConfig>(
  _options?: RBACClientOptions<S>,
) => {
  return {
    id: "rbac",
    $InferServerPlugin: {} as ReturnType<typeof rbac>,
    getActions: ($fetch) => ({
      rbac: {
        /**
         * Sync permissions and roles from configuration
         * Requires admin access
         */
        sync: async (fetchOptions?: BetterFetchOption) => {
          return await $fetch<SyncResponse>("/rbac/sync", {
            method: "POST",
            ...fetchOptions,
          });
        },

        /**
         * List all roles with optional pagination
         */
        listRoles: async (query?: PaginationQuery, fetchOptions?: BetterFetchOption) => {
          const queryString = buildQueryString(query);
          return await $fetch<RoleListResponse>(`/rbac/roles${queryString}`, {
            method: "GET",
            ...fetchOptions,
          });
        },

        /**
         * Get a single role by ID
         */
        getRole: async (data: GetRoleInput, fetchOptions?: BetterFetchOption) => {
          const params = new URLSearchParams({ roleId: data.roleId });
          return await $fetch<RoleResponse>(`/rbac/role?${params.toString()}`, {
            method: "GET",
            ...fetchOptions,
          });
        },

        /**
         * Create a new role
         * Requires admin access
         */
        createRole: async (data: CreateRoleInput, fetchOptions?: BetterFetchOption) => {
          return await $fetch<RoleResponse>("/rbac/roles", {
            method: "POST",
            body: data,
            ...fetchOptions,
          });
        },

        /**
         * Update an existing role
         * Requires admin access
         */
        updateRole: async (data: UpdateRoleInput, fetchOptions?: BetterFetchOption) => {
          return await $fetch<RoleResponse>("/rbac/role", {
            method: "PUT",
            body: data,
            ...fetchOptions,
          });
        },

        /**
         * Delete a role
         * Requires admin access
         */
        deleteRole: async (data: DeleteRoleInput, fetchOptions?: BetterFetchOption) => {
          return await $fetch<{ success: boolean }>("/rbac/role", {
            method: "DELETE",
            body: data,
            ...fetchOptions,
          });
        },

        /**
         * List all permissions with optional pagination
         */
        listPermissions: async (query?: PaginationQuery, fetchOptions?: BetterFetchOption) => {
          const queryString = buildQueryString(query);
          return await $fetch<PermissionListResponse>(`/rbac/permissions${queryString}`, {
            method: "GET",
            ...fetchOptions,
          });
        },

        /**
         * Get permissions assigned to a specific role
         */
        listRolePermissions: async (
          data: ListRolePermissionsInput,
          fetchOptions?: BetterFetchOption,
        ) => {
          const params = new URLSearchParams({ roleId: data.roleId });
          return await $fetch<PermissionListResponse>(
            `/rbac/role-permissions?${params.toString()}`,
            {
              method: "GET",
              ...fetchOptions,
            },
          );
        },

        /**
         * Assign a permission to a role
         * Requires admin access
         */
        assignPermission: async (data: AssignPermissionInput, fetchOptions?: BetterFetchOption) => {
          return await $fetch<{ success: boolean; message?: string }>(
            "/rbac/role-permissions/assign",
            {
              method: "POST",
              body: data,
              ...fetchOptions,
            },
          );
        },

        /**
         * Remove a permission from a role
         * Requires admin access
         */
        removePermission: async (data: RemovePermissionInput, fetchOptions?: BetterFetchOption) => {
          return await $fetch<{ success: boolean }>("/rbac/role-permissions/remove", {
            method: "POST",
            body: data,
            ...fetchOptions,
          });
        },

        /**
         * Check if the current user has the specified permission(s)
         * Returns true only if user has ALL specified permissions
         */
        checkPermission: async (data: CheckPermissionInput, fetchOptions?: BetterFetchOption) => {
          return await $fetch<CheckPermissionResponse>("/rbac/check-permission", {
            method: "POST",
            body: data,
            ...fetchOptions,
          });
        },

        /**
         * Get the current user's role and permissions
         */
        getUserPermissions: async (fetchOptions?: BetterFetchOption) => {
          return await $fetch<UserPermissionsResponse>("/rbac/user-permissions", {
            method: "GET",
            ...fetchOptions,
          });
        },
      },
    }),
    pathMethods: {
      "/rbac/roles": "GET",
      "/rbac/role": ["GET", "PUT", "DELETE"] as unknown as "GET",
      "/rbac/permissions": "GET",
      "/rbac/role-permissions": "GET",
      "/rbac/role-permissions/assign": "POST",
      "/rbac/role-permissions/remove": "POST",
      "/rbac/user-permissions": "GET",
    },
  } satisfies BetterAuthClientPlugin;
};

// ============================================================================
// Re-export Types for Client Usage
// ============================================================================

// Re-export API response types
export type {
  CheckPermissionResponse,
  PermissionListResponse,
  RoleListResponse,
  RoleResponse,
  SyncResponse,
  UserPermissionsResponse,
} from "./types/api";

// Re-export schema types
export type { RBACSchemaConfig } from "./types/schema";

import { createAuthMiddleware } from "better-auth/api";
import {
  assignPermissionEndpoint,
  checkPermissionEndpoint,
  createRoleEndpoint,
  deleteRoleEndpoint,
  getRoleEndpoint,
  listPermissionsEndpoint,
  listRolePermissionsEndpoint,
  listRolesEndpoint,
  removePermissionEndpoint,
  syncEndpoint,
  updateRoleEndpoint,
  userPermissionsEndpoint,
} from "./endpoints";
import { buildSchema } from "./schema";
import type { RBACPluginConfig, RBACSchemaConfig } from "./types";
import { getSessionPermissions } from "./utils";

/**
 * Helper to get the endpoint response from context.
 * This is used in after hooks to modify the response.
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

export const rbac = <S extends RBACSchemaConfig = RBACSchemaConfig>(
  config: RBACPluginConfig<S> = {},
) => {
  const staticRoles: Record<string, string[]> = {};
  const permissions = config.permissions ?? [];

  // Build the schema with any customizations from config
  const pluginSchema = buildSchema(config.schema);

  // Store permission codes for OpenAPI schema generation
  const permissionCodes = permissions.map((p) => p.code);

  const endpoints = {
    sync: syncEndpoint({ ...config, permissions }, staticRoles),
    listRoles: listRolesEndpoint(staticRoles),
    getRole: getRoleEndpoint(staticRoles),
    createRole: createRoleEndpoint(staticRoles),
    updateRole: updateRoleEndpoint(staticRoles),
    deleteRole: deleteRoleEndpoint(staticRoles),
    listPermissions: listPermissionsEndpoint(permissionCodes),
    listRolePermissions: listRolePermissionsEndpoint(permissionCodes),
    assignPermission: assignPermissionEndpoint(staticRoles),
    removePermission: removePermissionEndpoint(staticRoles),
    checkPermission: checkPermissionEndpoint(permissionCodes),
    userPermissions: userPermissionsEndpoint(permissionCodes),
  };

  /**
   * Session Enhancement Hooks
   *
   * The after hook for /get-session enhances the session user object with
   * an array of permission codes based on the user's role. This allows
   * client-side permission checks without additional API calls.
   *
   * The hook uses graceful degradation - if any error occurs during
   * permission fetching, an empty permissions array is returned rather
   * than failing the session request.
   */
  const hooks = {
    after: [
      {
        matcher: (context) => context.path === "/get-session",
        handler: createAuthMiddleware(async (ctx) => {
          // Get the original response from the endpoint
          const response = await getEndpointResponse<{
            session: unknown;
            user: { role?: string };
          }>(ctx);

          // If no response or no user, don't modify
          if (!response?.user) {
            return;
          }

          // Fetch permissions for the user's role
          const permissions = await getSessionPermissions(ctx, response.user, config);

          // Return a modified response with permissions added to the user
          return ctx.json({
            ...response,
            user: {
              ...response.user,
              permissions,
            },
          });
        }),
      },
    ],
  };

  return {
    id: "rbac",
    schema: pluginSchema,
    endpoints,
    hooks,
  };
};

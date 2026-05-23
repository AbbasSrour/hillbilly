import type { AuthContext, BetterAuthOptions, EndpointContext, EndpointOptions } from "better-auth";
import { APIError, createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import { checkPermissionSchema } from "../schemas";
import type { RBACPluginConfig } from "../types/config";
import type { RBACSchemaConfig, Role as RoleModel } from "../types/schema";
import { getRolePermissions } from "../utils";

const checkPermissionPath = "/rbac/check-permission" as const;
const checkPermissionConfig = (permissionCodes?: string[]) => {
  const permissionCodeSchema = {
    type: "string",
    ...(permissionCodes && permissionCodes.length > 0 ? { enum: permissionCodes } : {}),
  } as const;

  return {
    method: "POST",
    use: [sessionMiddleware],
    body: checkPermissionSchema,
    metadata: {
      openapi: {
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  permission: {
                    oneOf: [permissionCodeSchema, { type: "array", items: permissionCodeSchema }],
                  },
                },
                required: ["permission"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Permission check result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    hasPermission: { type: "boolean" },
                    checked: { type: "array", items: permissionCodeSchema },
                    userPermissions: {
                      type: "array",
                      items: permissionCodeSchema,
                    },
                  },
                  required: ["hasPermission", "checked", "userPermissions"],
                },
              },
            },
          },
        },
      },
    },
  } satisfies EndpointOptions;
};

type CheckPermissionConfig = ReturnType<typeof checkPermissionConfig>;

export const checkPermissionHandler =
  (pluginConfig?: RBACPluginConfig<RBACSchemaConfig>) =>
  async (
    ctx: EndpointContext<
      typeof checkPermissionPath,
      CheckPermissionConfig,
      AuthContext<BetterAuthOptions>
    >,
  ) => {
    const session = ctx.context.session;
    if (!session) {
      throw new APIError("UNAUTHORIZED", {
        message: "Session required",
      });
    }

    const { permission } = ctx.body;
    const permissionsToCheck = Array.isArray(permission) ? permission : [permission];

    const userRoleName = session.user.role;
    let userPermissions: string[] = [];

    if (userRoleName) {
      const role = (await ctx.context.adapter.findOne({
        model: "role",
        where: [{ field: "name", value: userRoleName }],
      })) as RoleModel | null;

      if (role) {
        const permsMap = await getRolePermissions(ctx, [role.id], pluginConfig);
        const rolePerms = permsMap[role.id] || [];
        userPermissions = rolePerms.map((p) => p.code);
      }
    }

    const hasPermission = permissionsToCheck.every((p) => userPermissions.includes(p));

    return ctx.json({
      hasPermission,
      checked: permissionsToCheck,
      userPermissions,
    });
  };

export const checkPermissionEndpoint = (
  permissionCodes?: string[],
  pluginConfig?: RBACPluginConfig<RBACSchemaConfig>,
) => {
  return createAuthEndpoint(
    checkPermissionPath,
    checkPermissionConfig(permissionCodes),
    checkPermissionHandler(pluginConfig),
  );
};

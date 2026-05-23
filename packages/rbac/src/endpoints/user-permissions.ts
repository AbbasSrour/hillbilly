import { AuthContext, BetterAuthOptions, EndpointContext, EndpointOptions } from "better-auth";
import { APIError, createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import type { RBACPluginConfig } from "../types/config";
import type { Permission, RBACSchemaConfig, Role as RoleModel } from "../types/schema";
import { getRolePermissions } from "../utils";

const userPermissionsPath = "/rbac/user-permissions" as const;
const userPermissionsConfig = (permissionCodes?: string[]) => {
  const permissionCodeSchema = {
    type: "string",
    ...(permissionCodes && permissionCodes.length > 0 ? { enum: permissionCodes } : {}),
  } as const;

  const permissionSchema = {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      code: permissionCodeSchema,
      description: { type: "string", nullable: true },
    },
    required: ["id", "name", "code"],
    additionalProperties: true,
  } as const;

  return {
    method: "GET",
    use: [sessionMiddleware],
    metadata: {
      openapi: {
        responses: {
          200: {
            description: "User permissions",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    role: {
                      anyOf: [
                        {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                          },
                          required: ["id", "name"],
                        },
                        { type: "null" },
                      ],
                    },
                    permissions: {
                      type: "array",
                      items: permissionSchema,
                    },
                  },
                  required: ["role", "permissions"],
                },
              },
            },
          },
        },
      },
    },
  } satisfies EndpointOptions;
};

type UserPermissionsConfig = ReturnType<typeof userPermissionsConfig>;

export const userPermissionsHandler =
  (pluginConfig?: RBACPluginConfig<RBACSchemaConfig>) =>
  async (
    ctx: EndpointContext<
      typeof userPermissionsPath,
      UserPermissionsConfig,
      AuthContext<BetterAuthOptions>
    >,
  ) => {
    const session = ctx.context.session;
    if (!session) {
      throw new APIError("UNAUTHORIZED", {
        message: "Session required",
      });
    }

    const userRoleName = session.user.role;
    let role: RoleModel | null = null;
    let permissions: Permission[] = [];

    if (userRoleName) {
      // Find the role entity
      role = (await ctx.context.adapter.findOne({
        model: "role",
        where: [{ field: "name", value: userRoleName }],
      })) as RoleModel | null;

      if (role) {
        const permsMap = await getRolePermissions(ctx, [role.id], pluginConfig);
        permissions = permsMap[role.id] || [];
      }
    }

    return ctx.json({
      role: role ? { id: role.id, name: role.name } : null,
      permissions,
    });
  };

export const userPermissionsEndpoint = (
  permissionCodes?: string[],
  pluginConfig?: RBACPluginConfig<RBACSchemaConfig>,
) => {
  return createAuthEndpoint(
    userPermissionsPath,
    userPermissionsConfig(permissionCodes),
    userPermissionsHandler(pluginConfig),
  );
};

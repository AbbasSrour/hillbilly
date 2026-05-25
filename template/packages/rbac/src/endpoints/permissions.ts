import { AuthContext, BetterAuthOptions, EndpointContext, EndpointOptions } from "better-auth";
import { APIError, createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import {
  paginationQuerySchema,
  listRolePermissionsQuerySchema,
  assignPermissionSchema,
  removePermissionSchema,
} from "../schemas";
import type { Permission, Role as RoleModel } from "../types/schema";
import { isStaticRole } from "../utils";

const listPermissionsPath = "/rbac/permissions" as const;
const listPermissionsConfig = (permissionCodes?: string[]) => {
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
    query: paginationQuerySchema,
    metadata: {
      openapi: {
        responses: {
          200: {
            description: "Permissions list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    permissions: {
                      type: "array",
                      items: permissionSchema,
                    },
                    total: { type: "number" },
                  },
                  required: ["permissions", "total"],
                },
              },
            },
          },
        },
      },
    },
  } satisfies EndpointOptions;
};

type ListPermissionsConfig = ReturnType<typeof listPermissionsConfig>;

export const listPermissionsHandler = async (
  ctx: EndpointContext<
    typeof listPermissionsPath,
    ListPermissionsConfig,
    AuthContext<BetterAuthOptions>
  >,
) => {
  const query = ctx.query;
  const limit = query.limit ? Number.parseInt(query.limit) : 100;
  const offset = query.offset ? Number.parseInt(query.offset) : 0;

  // Count total
  const permissionsCount = await ctx.context.adapter.count({
    model: "permission",
  });

  // Get permissions
  const permissions = await ctx.context.adapter.findMany<Permission>({
    model: "permission",
    limit,
    offset,
    sortBy: {
      field: query.sortBy || "name",
      direction: query.sortDirection || "asc",
    },
  });

  return ctx.json({
    permissions,
    total: permissionsCount,
  });
};

export const listPermissionsEndpoint = (permissionCodes?: string[]) => {
  return createAuthEndpoint(
    listPermissionsPath,
    listPermissionsConfig(permissionCodes),
    listPermissionsHandler,
  );
};

const listRolePermissionsPath = "/rbac/role-permissions" as const;
const listRolePermissionsConfig = (permissionCodes?: string[]) => {
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
    query: listRolePermissionsQuerySchema,
    metadata: {
      openapi: {
        responses: {
          200: {
            description: "Role permissions list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    permissions: {
                      type: "array",
                      items: permissionSchema,
                    },
                    total: { type: "number" },
                  },
                  required: ["permissions", "total"],
                },
              },
            },
          },
        },
      },
    },
  } satisfies EndpointOptions;
};

type ListRolePermissionsConfig = ReturnType<typeof listRolePermissionsConfig>;

export const listRolePermissionsHandler = async (
  ctx: EndpointContext<
    typeof listRolePermissionsPath,
    ListRolePermissionsConfig,
    AuthContext<BetterAuthOptions>
  >,
) => {
  const { roleId } = ctx.query;

  // Get role permissions
  const rolePermissions = (await ctx.context.adapter.findMany({
    model: "rolePermission",
    where: [{ field: "roleId", value: roleId }],
  })) as { permissionId: string }[];

  const permissionIds = rolePermissions.map((rp) => rp.permissionId);

  if (permissionIds.length === 0) {
    return ctx.json({ permissions: [], total: 0 });
  }

  const permissions = (await ctx.context.adapter.findMany({
    model: "permission",
    where: [{ field: "id", operator: "in", value: permissionIds }],
  })) as Permission[];

  return ctx.json({
    permissions,
    total: permissions.length,
  });
};

export const listRolePermissionsEndpoint = (permissionCodes?: string[]) => {
  return createAuthEndpoint(
    listRolePermissionsPath,
    listRolePermissionsConfig(permissionCodes),
    listRolePermissionsHandler,
  );
};

const assignPermissionPath = "/rbac/role-permissions/assign" as const;
const assignPermissionConfig = {
  method: "POST",
  use: [sessionMiddleware],
  body: assignPermissionSchema,
} satisfies EndpointOptions;

export const assignPermissionHandler =
  (staticRoles: Record<string, string[]>) =>
  async (
    ctx: EndpointContext<
      typeof assignPermissionPath,
      typeof assignPermissionConfig,
      AuthContext<BetterAuthOptions>
    >,
  ) => {
    const session = ctx.context.session;
    if (!session) {
      throw new APIError("UNAUTHORIZED", {
        message: "Session required",
      });
    }

    if (session.user.role !== "admin") {
      throw new APIError("FORBIDDEN", {
        message: "Admin access required",
      });
    }

    const { roleId, permissionId } = ctx.body;

    const role = (await ctx.context.adapter.findOne({
      model: "role",
      where: [{ field: "id", value: roleId }],
    })) as RoleModel;

    if (!role) {
      throw new APIError("NOT_FOUND", {
        message: "Role not found",
      });
    }

    if (isStaticRole(role.name, staticRoles)) {
      throw new APIError("FORBIDDEN", {
        message: "Cannot modify permissions of a static role",
      });
    }

    // Check if permission exists
    const permission = await ctx.context.adapter.findOne({
      model: "permission",
      where: [{ field: "id", value: permissionId }],
    });

    if (!permission) {
      throw new APIError("NOT_FOUND", {
        message: "Permission not found",
      });
    }

    // Check if already assigned
    const existing = await ctx.context.adapter.findOne({
      model: "rolePermission",
      where: [
        { field: "roleId", value: roleId },
        { field: "permissionId", value: permissionId },
      ],
    });

    if (existing) {
      return ctx.json({ success: true, message: "Already assigned" });
    }

    await ctx.context.adapter.create({
      model: "rolePermission",
      data: { roleId, permissionId },
    });

    return ctx.json({ success: true });
  };

export const assignPermissionEndpoint = (staticRoles: Record<string, string[]>) => {
  return createAuthEndpoint(
    assignPermissionPath,
    assignPermissionConfig,
    assignPermissionHandler(staticRoles),
  );
};

const removePermissionPath = "/rbac/role-permissions/remove" as const;
const removePermissionConfig = {
  method: "POST",
  use: [sessionMiddleware],
  body: removePermissionSchema,
} satisfies EndpointOptions;

export const removePermissionHandler =
  (staticRoles: Record<string, string[]>) =>
  async (
    ctx: EndpointContext<
      typeof removePermissionPath,
      typeof removePermissionConfig,
      AuthContext<BetterAuthOptions>
    >,
  ) => {
    const session = ctx.context.session;
    if (!session) {
      throw new APIError("UNAUTHORIZED", {
        message: "Session required",
      });
    }

    if (session.user.role !== "admin") {
      throw new APIError("FORBIDDEN", {
        message: "Admin access required",
      });
    }

    const { roleId, permissionId } = ctx.body;

    const role = (await ctx.context.adapter.findOne({
      model: "role",
      where: [{ field: "id", value: roleId }],
    })) as RoleModel;

    if (!role) {
      throw new APIError("NOT_FOUND", {
        message: "Role not found",
      });
    }

    if (isStaticRole(role.name, staticRoles)) {
      throw new APIError("FORBIDDEN", {
        message: "Cannot modify permissions of a static role",
      });
    }

    await ctx.context.adapter.deleteMany({
      model: "rolePermission",
      where: [
        { field: "roleId", value: roleId },
        { field: "permissionId", value: permissionId },
      ],
    });

    return ctx.json({ success: true });
  };

export const removePermissionEndpoint = (staticRoles: Record<string, string[]>) => {
  return createAuthEndpoint(
    removePermissionPath,
    removePermissionConfig,
    removePermissionHandler(staticRoles),
  );
};

import { AuthContext, BetterAuthOptions, EndpointContext, EndpointOptions } from "better-auth";
import { APIError, createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import {
  createRoleSchema,
  deleteRoleSchema,
  getRoleQuerySchema,
  paginationQuerySchema,
  updateRoleWithIdSchema,
} from "../schemas";
import type { RBACPluginConfig } from "../types/config";
import type { Role } from "../types";
import type { RBACSchemaConfig } from "../types/schema";
import type { Permission, Role as RoleModel } from "../types/schema";
import { isStaticRole } from "../utils";
import { getRolePermissions } from "../utils";

const listRolesPath = "/rbac/roles" as const;
const listRolesConfig = {
  method: "GET",
  use: [sessionMiddleware],
  query: paginationQuerySchema,
} satisfies EndpointOptions;

export const listRolesHandler =
  (staticRoles: Record<string, string[]>, pluginConfig?: RBACPluginConfig<RBACSchemaConfig>) =>
  async (
    ctx: EndpointContext<
      typeof listRolesPath,
      typeof listRolesConfig,
      AuthContext<BetterAuthOptions>
    >,
  ) => {
    const query = ctx.query;
    const limit = query.limit ? Number.parseInt(query.limit) : 100;
    const offset = query.offset ? Number.parseInt(query.offset) : 0;

    // Count total
    const rolesCount = await ctx.context.adapter.count({ model: "role" });

    // Get roles
    const roles = (await ctx.context.adapter.findMany({
      model: "role",
      limit,
      offset,
      sortBy: {
        field: query.sortBy || "name",
        direction: query.sortDirection || "asc",
      },
    })) as RoleModel[];

    // Get permissions for these roles
    const roleIds = roles.map((r) => r.id);
    const permissionsMap = await getRolePermissions(ctx, roleIds, pluginConfig);

    const rolesWithPermissions: Role[] = roles.map((role) => ({
      ...role,
      permissions: permissionsMap[role.id] || [],
      isStatic: isStaticRole(role.name, staticRoles),
    }));

    return ctx.json({
      roles: rolesWithPermissions,
      total: rolesCount,
    });
  };

export const listRolesEndpoint = (
  staticRoles: Record<string, string[]>,
  pluginConfig?: RBACPluginConfig<RBACSchemaConfig>,
) => {
  return createAuthEndpoint(
    listRolesPath,
    listRolesConfig,
    listRolesHandler(staticRoles, pluginConfig),
  );
};

const getRolePath = "/rbac/role" as const;
const getRoleConfig = {
  method: "GET",
  use: [sessionMiddleware],
  query: getRoleQuerySchema,
} satisfies EndpointOptions;

export const getRoleHandler =
  (staticRoles: Record<string, string[]>, pluginConfig?: RBACPluginConfig<RBACSchemaConfig>) =>
  async (
    ctx: EndpointContext<typeof getRolePath, typeof getRoleConfig, AuthContext<BetterAuthOptions>>,
  ) => {
    const query = ctx.query;
    const roleId = query.roleId || "";

    const role = (await ctx.context.adapter.findOne({
      model: "role",
      where: [{ field: "id", value: roleId }],
    })) as RoleModel | null;

    if (!role) {
      throw new APIError("NOT_FOUND", {
        message: "Role not found",
      });
    }

    // Get permissions for this role
    const permissionsMap = await getRolePermissions(ctx, [roleId], pluginConfig);

    const roleResponse: Role = {
      ...role,
      permissions: permissionsMap[roleId] || [],
      isStatic: isStaticRole(role.name, staticRoles),
    };

    return ctx.json({ role: roleResponse });
  };

export const getRoleEndpoint = (
  staticRoles: Record<string, string[]>,
  pluginConfig?: RBACPluginConfig<RBACSchemaConfig>,
) => {
  return createAuthEndpoint(getRolePath, getRoleConfig, getRoleHandler(staticRoles, pluginConfig));
};

const createRolePath = "/rbac/roles" as const;
const createRoleConfig = {
  method: "POST",
  use: [sessionMiddleware],
  body: createRoleSchema,
} satisfies EndpointOptions;

export const createRoleHandler =
  (staticRoles: Record<string, string[]>) =>
  async (
    ctx: EndpointContext<
      typeof createRolePath,
      typeof createRoleConfig,
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

    const { name, description, permissionIds } = ctx.body;

    // Check if role name conflicts with static roles
    if (isStaticRole(name, staticRoles)) {
      throw new APIError("BAD_REQUEST", {
        message: "Cannot create role with same name as static role",
      });
    }

    // Check for duplicate name
    const existing = await ctx.context.adapter.findOne({
      model: "role",
      where: [{ field: "name", value: name }],
    });
    if (existing) {
      throw new APIError("CONFLICT", {
        message: "Role with this name already exists",
      });
    }

    // Create role in database
    const role = (await ctx.context.adapter.create({
      model: "role",
      data: { name, description },
    })) as RoleModel;

    // Assign permissions if provided
    const permissions: Permission[] = [];
    if (permissionIds && permissionIds.length > 0) {
      for (const permissionId of permissionIds) {
        // Verify permission exists
        const perm = (await ctx.context.adapter.findOne({
          model: "permission",
          where: [{ field: "id", value: permissionId }],
        })) as Permission | null;

        if (perm) {
          await ctx.context.adapter.create({
            model: "rolePermission",
            data: { roleId: role.id, permissionId },
          });
          permissions.push(perm);
        }
      }
    }

    const roleResponse: Role = {
      ...role,
      permissions,
      isStatic: false,
    };

    return ctx.json({ role: roleResponse }, { status: 201 });
  };

export const createRoleEndpoint = (staticRoles: Record<string, string[]>) => {
  return createAuthEndpoint(createRolePath, createRoleConfig, createRoleHandler(staticRoles));
};

const updateRolePath = "/rbac/role" as const;
const updateRoleConfig = {
  method: "PUT",
  use: [sessionMiddleware],
  body: updateRoleWithIdSchema,
} satisfies EndpointOptions;

export const updateRoleHandler =
  (staticRoles: Record<string, string[]>, pluginConfig?: RBACPluginConfig<RBACSchemaConfig>) =>
  async (
    ctx: EndpointContext<
      typeof updateRolePath,
      typeof updateRoleConfig,
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

    const { roleId, name, description, permissionIds } = ctx.body;

    const role = (await ctx.context.adapter.findOne({
      model: "role",
      where: [{ field: "id", value: roleId }],
    })) as RoleModel | null;

    if (!role) {
      throw new APIError("NOT_FOUND", {
        message: "Role not found",
      });
    }

    if (isStaticRole(role.name, staticRoles)) {
      throw new APIError("FORBIDDEN", {
        message: "Cannot modify static role from Admin plugin",
      });
    }

    // Check for duplicate name if the name is being changed
    if (name && name !== role.name) {
      // Check if the new name is a static role
      if (isStaticRole(name, staticRoles)) {
        throw new APIError("BAD_REQUEST", {
          message: "Cannot rename role to a static role name",
        });
      }

      const existing = await ctx.context.adapter.findOne({
        model: "role",
        where: [{ field: "name", value: name }],
      });
      if (existing) {
        throw new APIError("CONFLICT", {
          message: "Role with this name already exists",
        });
      }
    }

    // Update role
    const updatedRole = (await ctx.context.adapter.update({
      model: "role",
      where: [{ field: "id", value: roleId }],
      update: {
        name: name || role.name,
        description,
        updatedAt: new Date(),
      },
    })) as RoleModel;

    // Update permissions if provided
    if (permissionIds !== undefined) {
      // Remove existing
      await ctx.context.adapter.deleteMany({
        model: "rolePermission",
        where: [{ field: "roleId", value: roleId }],
      });

      // Add new
      for (const permissionId of permissionIds) {
        // Verify permission exists
        const perm = await ctx.context.adapter.findOne({
          model: "permission",
          where: [{ field: "id", value: permissionId }],
        });

        if (perm) {
          await ctx.context.adapter.create({
            model: "rolePermission",
            data: { roleId, permissionId },
          });
        }
      }
    }

    // Fetch updated permissions
    const permsMap = await getRolePermissions(ctx, [roleId], pluginConfig);

    const roleResponse: Role = {
      ...updatedRole,
      permissions: permsMap[roleId] || [],
      isStatic: false,
    };

    return ctx.json({ role: roleResponse });
  };

export const updateRoleEndpoint = (
  staticRoles: Record<string, string[]>,
  pluginConfig?: RBACPluginConfig<RBACSchemaConfig>,
) => {
  return createAuthEndpoint(
    updateRolePath,
    updateRoleConfig,
    updateRoleHandler(staticRoles, pluginConfig),
  );
};

const deleteRolePath = "/rbac/role" as const;
const deleteRoleConfig = {
  method: "DELETE",
  use: [sessionMiddleware],
  body: deleteRoleSchema,
} satisfies EndpointOptions;

export const deleteRoleHandler =
  (staticRoles: Record<string, string[]>) =>
  async (
    ctx: EndpointContext<
      typeof deleteRolePath,
      typeof deleteRoleConfig,
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

    const { roleId } = ctx.body;

    const role = (await ctx.context.adapter.findOne({
      model: "role",
      where: [{ field: "id", value: roleId }],
    })) as RoleModel | null;

    if (!role) {
      throw new APIError("NOT_FOUND", {
        message: "Role not found",
      });
    }

    if (isStaticRole(role.name, staticRoles)) {
      throw new APIError("FORBIDDEN", {
        message: "Cannot delete static role from Admin plugin",
      });
    }

    await ctx.context.adapter.delete({
      model: "role",
      where: [{ field: "id", value: roleId }],
    });

    return ctx.json({ success: true });
  };

export const deleteRoleEndpoint = (staticRoles: Record<string, string[]>) => {
  return createAuthEndpoint(deleteRolePath, deleteRoleConfig, deleteRoleHandler(staticRoles));
};

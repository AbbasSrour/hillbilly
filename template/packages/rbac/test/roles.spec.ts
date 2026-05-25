import { APIError } from "better-auth/api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createRoleHandler,
  deleteRoleHandler,
  listRolesHandler,
  updateRoleHandler,
} from "../src/endpoints/roles";

interface MockAdapter {
  findMany: ReturnType<typeof vi.fn>;
  findOne: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  deleteMany: ReturnType<typeof vi.fn>;
  count: ReturnType<typeof vi.fn>;
}

interface MockContext {
  context: {
    adapter: MockAdapter;
    session: {
      user: {
        id: string;
        role: string;
      };
    } | null;
  };
  body: Record<string, unknown>;
  query: Record<string, unknown>;
  params: Record<string, string>;
  json: ReturnType<typeof vi.fn>;
}

describe("Role Endpoints", () => {
  let mockAdapter: MockAdapter;
  let mockCtx: MockContext;
  let staticRoles: Record<string, string[]>;

  beforeEach(() => {
    mockAdapter = {
      findMany: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    };
    mockCtx = {
      context: {
        adapter: mockAdapter,
        session: {
          user: {
            id: "admin_id",
            role: "admin",
          },
        },
      },
      body: {},
      query: {},
      params: {},
      json: vi.fn((data) => data),
    };
    staticRoles = {
      admin: ["user.view", "user.create"],
    };
  });

  describe("listRolesEndpoint", () => {
    it("should list roles with permissions and correct isStatic flag", async () => {
      const handler = listRolesHandler(staticRoles);

      // Mock roles
      mockAdapter.count.mockResolvedValue(2);
      mockAdapter.findMany.mockImplementation(async ({ model }: { model: string }) => {
        if (model === "role") {
          return [
            { id: "role_admin", name: "admin", description: "Static Admin" },
            { id: "role_mod", name: "moderator", description: "Dynamic Mod" },
          ];
        }
        if (model === "rolePermission") {
          return [
            { roleId: "role_admin", permissionId: "perm_1" },
            { roleId: "role_mod", permissionId: "perm_2" },
          ];
        }
        if (model === "permission") {
          return [
            { id: "perm_1", code: "user.view", name: "View Users" },
            { id: "perm_2", code: "post.moderate", name: "Moderate Posts" },
          ];
        }
        return [];
      });

      const result = await handler(mockCtx as never);

      expect(result.total).toBe(2);
      expect(result.roles).toHaveLength(2);

      const adminRole = result.roles.find((r) => r.name === "admin");
      if (!adminRole) throw new Error("Admin role not found");
      expect(adminRole.isStatic).toBe(true);
      expect(adminRole.permissions).toHaveLength(1);
      if (adminRole.permissions[0]) {
        expect(adminRole.permissions[0].code).toBe("user.view");
      }

      const modRole = result.roles.find((r) => r.name === "moderator");
      if (!modRole) throw new Error("Moderator role not found");
      expect(modRole.isStatic).toBe(false);
      expect(modRole.permissions).toHaveLength(1);
      if (modRole.permissions[0]) {
        expect(modRole.permissions[0].code).toBe("post.moderate");
      }
    });

    it("should respect pagination parameters", async () => {
      mockCtx.query = { limit: "5", offset: "10" };
      const handler = listRolesHandler(staticRoles);

      mockAdapter.count.mockResolvedValue(50);
      mockAdapter.findMany.mockResolvedValue([]);

      await handler(mockCtx as never);

      expect(mockAdapter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "role",
          limit: 5,
          offset: 10,
        }),
      );
    });

    it("should respect sorting parameters", async () => {
      mockCtx.query = { sortBy: "createdAt", sortDirection: "desc" };
      const handler = listRolesHandler(staticRoles);

      mockAdapter.count.mockResolvedValue(0);
      mockAdapter.findMany.mockResolvedValue([]);

      await handler(mockCtx as never);

      expect(mockAdapter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "role",
          sortBy: { field: "createdAt", direction: "desc" },
        }),
      );
    });
  });

  describe("createRoleEndpoint", () => {
    it("should throw UNAUTHORIZED if no session", async () => {
      mockCtx.context.session = null;
      const handler = createRoleHandler(staticRoles);

      await expect(handler(mockCtx as never)).rejects.toThrow("Session required");
    });

    it("should throw FORBIDDEN if user is not admin", async () => {
      if (mockCtx.context.session) {
        mockCtx.context.session.user.role = "user";
      }
      const handler = createRoleHandler(staticRoles);

      await expect(handler(mockCtx as never)).rejects.toThrow(APIError);
    });

    it("should throw BAD_REQUEST if role name conflicts with static role", async () => {
      mockCtx.body = { name: "admin" };
      const handler = createRoleHandler(staticRoles);

      await expect(handler(mockCtx as never)).rejects.toThrow(
        "Cannot create role with same name as static role",
      );
    });

    it("should throw CONFLICT if role name already exists", async () => {
      mockCtx.body = { name: "existing" };
      mockAdapter.findOne.mockResolvedValue({ id: "role_1", name: "existing" });
      const handler = createRoleHandler(staticRoles);

      await expect(handler(mockCtx as never)).rejects.toThrow("Role with this name already exists");
    });

    it("should create role and assign permissions", async () => {
      mockCtx.body = {
        name: "new_role",
        description: "New Role",
        permissionIds: ["perm_1"],
      };

      // Mock not found for duplicate check
      mockAdapter.findOne.mockResolvedValueOnce(null);
      // Mock create role
      mockAdapter.create.mockResolvedValueOnce({
        id: "role_new",
        name: "new_role",
        description: "New Role",
      });
      // Mock find permission
      mockAdapter.findOne.mockResolvedValueOnce({ id: "perm_1", code: "p1" });

      const handler = createRoleHandler(staticRoles);
      const result = await handler(mockCtx as never);

      expect(mockAdapter.create).toHaveBeenCalledTimes(2); // Role + RolePermission
      expect(mockAdapter.create).toHaveBeenCalledWith({
        model: "role",
        data: { name: "new_role", description: "New Role" },
      });
      expect(mockAdapter.create).toHaveBeenCalledWith({
        model: "rolePermission",
        data: { roleId: "role_new", permissionId: "perm_1" },
      });

      expect(result.role.isStatic).toBe(false);
      expect(result.role.permissions).toHaveLength(1);
    });

    it("should create role without permissions", async () => {
      mockCtx.body = {
        name: "basic_role",
        description: "Basic Role",
      };

      mockAdapter.findOne.mockResolvedValueOnce(null);
      mockAdapter.create.mockResolvedValueOnce({
        id: "role_basic",
        name: "basic_role",
        description: "Basic Role",
      });

      const handler = createRoleHandler(staticRoles);
      const result = await handler(mockCtx as never);

      expect(mockAdapter.create).toHaveBeenCalledTimes(1); // Only Role
      expect(result.role.permissions).toHaveLength(0);
    });

    it("should skip non-existent permissions", async () => {
      mockCtx.body = {
        name: "new_role",
        permissionIds: ["perm_1", "perm_nonexistent"],
      };

      mockAdapter.findOne.mockResolvedValueOnce(null);
      mockAdapter.create.mockResolvedValueOnce({
        id: "role_new",
        name: "new_role",
      });
      // First permission exists
      mockAdapter.findOne.mockResolvedValueOnce({ id: "perm_1", code: "p1" });
      // Second permission doesn't exist
      mockAdapter.findOne.mockResolvedValueOnce(null);

      const handler = createRoleHandler(staticRoles);
      const result = await handler(mockCtx as never);

      expect(result.role.permissions).toHaveLength(1);
    });
  });

  describe("updateRoleEndpoint", () => {
    it("should throw UNAUTHORIZED if no session", async () => {
      mockCtx.context.session = null;
      const handler = updateRoleHandler(staticRoles);

      await expect(handler(mockCtx as never)).rejects.toThrow("Session required");
    });

    it("should throw FORBIDDEN if user is not admin", async () => {
      if (mockCtx.context.session) {
        mockCtx.context.session.user.role = "user";
      }
      const handler = updateRoleHandler(staticRoles);

      await expect(handler(mockCtx as never)).rejects.toThrow(APIError);
    });

    it("should throw NOT_FOUND if role does not exist", async () => {
      mockCtx.params = { roleId: "nonexistent" };
      mockAdapter.findOne.mockResolvedValue(null);

      const handler = updateRoleHandler(staticRoles);
      await expect(handler(mockCtx as never)).rejects.toThrow("Role not found");
    });

    it("should throw FORBIDDEN if attempting to update static role", async () => {
      mockCtx.params = { roleId: "role_admin" };
      mockAdapter.findOne.mockResolvedValue({
        id: "role_admin",
        name: "admin",
      });

      const handler = updateRoleHandler(staticRoles);
      await expect(handler(mockCtx as never)).rejects.toThrow("Cannot modify static role");
    });

    it("should throw BAD_REQUEST when renaming to static role name", async () => {
      mockCtx.params = { roleId: "role_mod" };
      mockCtx.body = { name: "admin" };
      mockAdapter.findOne.mockResolvedValue({
        id: "role_mod",
        name: "moderator",
      });

      const handler = updateRoleHandler(staticRoles);
      await expect(handler(mockCtx as never)).rejects.toThrow(
        "Cannot rename role to a static role name",
      );
    });

    it("should throw CONFLICT when renaming to existing role name", async () => {
      mockCtx.params = { roleId: "role_mod" };
      mockCtx.body = { name: "existing_role" };

      // First call: find role to update
      mockAdapter.findOne.mockResolvedValueOnce({
        id: "role_mod",
        name: "moderator",
      });
      // Second call: check for duplicate name
      mockAdapter.findOne.mockResolvedValueOnce({
        id: "role_existing",
        name: "existing_role",
      });

      const handler = updateRoleHandler(staticRoles);
      await expect(handler(mockCtx as never)).rejects.toThrow("Role with this name already exists");
    });

    it("should update dynamic role", async () => {
      mockCtx.params = { roleId: "role_mod" };
      mockCtx.body = { description: "Updated" };

      mockAdapter.findOne.mockResolvedValue({
        id: "role_mod",
        name: "moderator",
      });
      mockAdapter.update.mockResolvedValue({
        id: "role_mod",
        name: "moderator",
        description: "Updated",
      });
      // Mock getRolePermissions calls
      mockAdapter.findMany.mockResolvedValue([]);

      const handler = updateRoleHandler(staticRoles);
      const result = await handler(mockCtx as never);

      expect(mockAdapter.update).toHaveBeenCalledWith({
        model: "role",
        where: [{ field: "id", value: "role_mod" }],
        update: expect.objectContaining({ description: "Updated" }),
      });

      expect(result.role.description).toBe("Updated");
    });

    it("should update role permissions when permissionIds provided", async () => {
      mockCtx.params = { roleId: "role_mod" };
      mockCtx.body = { permissionIds: ["perm_1", "perm_2"] };

      mockAdapter.findOne.mockResolvedValueOnce({
        id: "role_mod",
        name: "moderator",
      });
      mockAdapter.update.mockResolvedValue({
        id: "role_mod",
        name: "moderator",
      });
      // Permission exists checks
      mockAdapter.findOne.mockResolvedValueOnce({ id: "perm_1" });
      mockAdapter.findOne.mockResolvedValueOnce({ id: "perm_2" });
      mockAdapter.findMany.mockResolvedValue([]);

      const handler = updateRoleHandler(staticRoles);
      await handler(mockCtx as never);

      expect(mockAdapter.deleteMany).toHaveBeenCalledWith({
        model: "rolePermission",
        where: [{ field: "roleId", value: "role_mod" }],
      });
      expect(mockAdapter.create).toHaveBeenCalledWith({
        model: "rolePermission",
        data: { roleId: "role_mod", permissionId: "perm_1" },
      });
    });
  });

  describe("deleteRoleEndpoint", () => {
    it("should throw UNAUTHORIZED if no session", async () => {
      mockCtx.context.session = null;
      const handler = deleteRoleHandler(staticRoles);

      await expect(handler(mockCtx as never)).rejects.toThrow("Session required");
    });

    it("should throw FORBIDDEN if user is not admin", async () => {
      if (mockCtx.context.session) {
        mockCtx.context.session.user.role = "user";
      }
      const handler = deleteRoleHandler(staticRoles);

      await expect(handler(mockCtx as never)).rejects.toThrow(APIError);
    });

    it("should throw NOT_FOUND if role does not exist", async () => {
      mockCtx.params = { roleId: "nonexistent" };
      mockAdapter.findOne.mockResolvedValue(null);

      const handler = deleteRoleHandler(staticRoles);
      await expect(handler(mockCtx as never)).rejects.toThrow("Role not found");
    });

    it("should throw FORBIDDEN if attempting to delete static role", async () => {
      mockCtx.params = { roleId: "role_admin" };
      mockAdapter.findOne.mockResolvedValue({
        id: "role_admin",
        name: "admin",
      });

      const handler = deleteRoleHandler(staticRoles);
      await expect(handler(mockCtx as never)).rejects.toThrow("Cannot delete static role");
    });

    it("should delete dynamic role", async () => {
      mockCtx.params = { roleId: "role_mod" };
      mockAdapter.findOne.mockResolvedValue({
        id: "role_mod",
        name: "moderator",
      });

      const handler = deleteRoleHandler(staticRoles);
      const result = await handler(mockCtx as never);

      expect(mockAdapter.delete).toHaveBeenCalledWith({
        model: "role",
        where: [{ field: "id", value: "role_mod" }],
      });

      expect(result.success).toBe(true);
    });
  });
});

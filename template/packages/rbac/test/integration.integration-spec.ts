/**
 * Integration Tests for RBAC Plugin
 *
 * These tests verify that multiple components work together correctly.
 * They test cross-endpoint interactions and shared utility usage.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkPermissionHandler } from "../src/endpoints/check-permission";
import { assignPermissionHandler, listRolePermissionsHandler } from "../src/endpoints/permissions";
import {
  createRoleHandler,
  deleteRoleHandler,
  listRolesHandler,
  updateRoleHandler,
} from "../src/endpoints/roles";
import { syncHandler } from "../src/endpoints/sync";
import { userPermissionsHandler } from "../src/endpoints/user-permissions";
import type { RBACPluginConfig } from "../src/types/config";
import {
  type AdapterArgs,
  type MockAdapter,
  createMockAdapter,
  createMockContext,
} from "./test-utils";

/**
 * Simulated in-memory database for integration tests
 */
interface InMemoryDB {
  roles: Map<string, { id: string; name: string; description?: string }>;
  permissions: Map<string, { id: string; code: string; name: string }>;
  rolePermissions: Map<string, { id: string; roleId: string; permissionId: string }>;
}

/**
 * Creates a mock adapter that uses an in-memory database for realistic integration testing
 */
function createIntegrationMockAdapter(db: InMemoryDB): MockAdapter {
  const mockAdapter = createMockAdapter();

  mockAdapter.findOne.mockImplementation(async ({ model, where = [] }: AdapterArgs) => {
    const condition = where[0];
    if (!condition) return null;
    if (typeof condition.value !== "string") return null;

    if (model === "permission") {
      if (condition.field === "code") {
        for (const [, perm] of db.permissions) {
          if (perm.code === condition.value) return perm;
        }
      } else if (condition.field === "id") {
        return db.permissions.get(condition.value) ?? null;
      }
    }

    if (model === "role") {
      if (condition.field === "name") {
        for (const [, role] of db.roles) {
          if (role.name === condition.value) return role;
        }
      } else if (condition.field === "id") {
        return db.roles.get(condition.value) ?? null;
      }
    }

    if (model === "rolePermission") {
      for (const [, rp] of db.rolePermissions) {
        const matches = where.every((w) => {
          if (w.field === "roleId") return rp.roleId === w.value;
          if (w.field === "permissionId") return rp.permissionId === w.value;
          return false;
        });
        if (matches) return rp;
      }
    }

    return null;
  });

  mockAdapter.findMany.mockImplementation(
    async ({
      model,
      where,
    }: {
      model: string;
      where?: { field: string; operator?: string; value: string | string[] }[];
    }) => {
      if (model === "role") {
        return Array.from(db.roles.values());
      }

      if (model === "permission") {
        if (where?.[0]?.operator === "in") {
          const ids = where[0].value as string[];
          return Array.from(db.permissions.values()).filter((p) => ids.includes(p.id));
        }
        return Array.from(db.permissions.values());
      }

      if (model === "rolePermission") {
        if (where?.[0]?.operator === "in") {
          const roleIds = where[0].value as string[];
          return Array.from(db.rolePermissions.values()).filter((rp) =>
            roleIds.includes(rp.roleId),
          );
        }
        if (where?.[0]?.field === "roleId") {
          return Array.from(db.rolePermissions.values()).filter(
            (rp) => rp.roleId === where[0]?.value,
          );
        }
        return Array.from(db.rolePermissions.values());
      }

      return [];
    },
  );

  mockAdapter.create.mockImplementation(async ({ model, data = {} }: AdapterArgs) => {
    const id = `${model}_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    if (model === "permission") {
      const perm = { id, ...data } as {
        id: string;
        code: string;
        name: string;
      };
      db.permissions.set(id, perm);
      return perm;
    }

    if (model === "role") {
      const role = { id, ...data } as {
        id: string;
        name: string;
        description?: string;
      };
      db.roles.set(id, role);
      return role;
    }

    if (model === "rolePermission") {
      const rp = { id, ...data } as {
        id: string;
        roleId: string;
        permissionId: string;
      };
      db.rolePermissions.set(id, rp);
      return rp;
    }

    return { id, ...data };
  });

  mockAdapter.update.mockImplementation(async ({ model, where = [], update = {} }: AdapterArgs) => {
    if (model === "role" && where[0]?.field === "id") {
      const roleId = where[0].value;
      if (typeof roleId !== "string") return null;
      const role = db.roles.get(roleId);
      if (role) {
        const updated = { ...role, ...update };
        db.roles.set(role.id, updated as typeof role);
        return updated;
      }
    }
    return null;
  });

  mockAdapter.delete.mockImplementation(async ({ model, where = [] }: AdapterArgs) => {
    if (model === "role" && where[0]?.field === "id") {
      const roleId = where[0].value;
      if (typeof roleId !== "string") return { success: true };
      db.roles.delete(roleId);
      // Cascade delete role permissions
      for (const [id, rp] of db.rolePermissions) {
        if (rp.roleId === roleId) {
          db.rolePermissions.delete(id);
        }
      }
    }
    return { success: true };
  });

  mockAdapter.deleteMany.mockImplementation(async ({ model, where = [] }: AdapterArgs) => {
    if (model === "rolePermission") {
      for (const [id, rp] of db.rolePermissions) {
        // Wait, 'every' returns true for empty array.
        // And if I have unhandled fields, they return undefined -> false (in my previous logic).

        // Let's use specific logic for rolePermission
        const roleIdCondition = where.find((w) => w.field === "roleId");
        const permissionIdCondition = where.find((w) => w.field === "permissionId");

        let matches = true;
        if (roleIdCondition && rp.roleId !== roleIdCondition.value) matches = false;
        if (permissionIdCondition && rp.permissionId !== permissionIdCondition.value)
          matches = false;

        // If we have conditions and they match
        if (matches && (roleIdCondition || permissionIdCondition)) {
          db.rolePermissions.delete(id);
        }
      }
    }
    return { count: 0 };
  });

  mockAdapter.count.mockImplementation(async ({ model }: { model: string }) => {
    if (model === "role") return db.roles.size;
    if (model === "permission") return db.permissions.size;
    return 0;
  });

  return mockAdapter;
}

describe("Integration: Sync → Role Management → Permission Check", () => {
  let mockAdapter: MockAdapter;
  let staticRoles: Record<string, string[]>;
  let config: RBACPluginConfig;
  let db: InMemoryDB;

  beforeEach(() => {
    db = {
      roles: new Map(),
      permissions: new Map(),
      rolePermissions: new Map(),
    };

    staticRoles = {};
    config = {
      permissions: [
        { code: "user.view", name: "View Users" },
        { code: "user.create", name: "Create Users" },
        { code: "post.view", name: "View Posts" },
        { code: "post.create", name: "Create Posts" },
        { code: "post.delete", name: "Delete Posts" },
      ],
    };

    mockAdapter = createIntegrationMockAdapter(db);
  });

  describe("Complete Sync and Role Management Flow", () => {
    it("should sync permissions, then allow role creation with those permissions", async () => {
      // Step 1: Sync permissions
      const syncCtx = {
        context: {
          adapter: mockAdapter,
          options: {
            plugins: [
              {
                id: "admin",
                ac: {
                  admin: ["user.view", "user.create"],
                },
              },
            ],
          },
        },
        json: vi.fn((data) => data),
      };

      const syncResult = await syncHandler(syncCtx as never, config, staticRoles);

      expect(syncResult.permissions.created).toBe(5);
      expect(syncResult.roles.created).toBe(1);
      expect(db.permissions.size).toBe(5);
      expect(db.roles.size).toBe(1);

      // Step 2: Create a new dynamic role
      const createRoleCtx = createMockContext(mockAdapter, {
        session: { user: { id: "admin_user", role: "admin" } },
        body: { name: "editor", description: "Content Editor" },
      });

      const handler = createRoleHandler(staticRoles);
      const createResult = await handler(createRoleCtx as never);

      expect(createResult.role.name).toBe("editor");
      expect(createResult.role.isStatic).toBe(false);
      expect(db.roles.size).toBe(2);

      // Step 3: Assign permissions to the new role
      const postViewPerm = Array.from(db.permissions.values()).find((p) => p.code === "post.view");
      const postCreatePerm = Array.from(db.permissions.values()).find(
        (p) => p.code === "post.create",
      );

      expect(postViewPerm).toBeDefined();
      expect(postCreatePerm).toBeDefined();

      const editorRole = Array.from(db.roles.values()).find((r) => r.name === "editor");
      expect(editorRole).toBeDefined();

      if (!postViewPerm || !postCreatePerm || !editorRole) {
        throw new Error("Required entities not found");
      }

      // Assign first permission
      const assignCtx1 = createMockContext(mockAdapter, {
        session: { user: { id: "admin_user", role: "admin" } },
        params: { roleId: editorRole.id, permissionId: postViewPerm.id },
      });

      const assignHandler = assignPermissionHandler(staticRoles);
      await assignHandler(assignCtx1 as never);

      // Assign second permission
      const assignCtx2 = createMockContext(mockAdapter, {
        session: { user: { id: "admin_user", role: "admin" } },
        params: { roleId: editorRole.id, permissionId: postCreatePerm.id },
      });

      await assignHandler(assignCtx2 as never);

      expect(db.rolePermissions.size).toBeGreaterThanOrEqual(2);

      // Step 4: List role permissions to verify
      const listPermsCtx = createMockContext(mockAdapter, {
        params: { roleId: editorRole.id },
      });

      const listResult = await listRolePermissionsHandler(listPermsCtx as never);

      expect(listResult.permissions).toHaveLength(2);
      expect(listResult.permissions.map((p) => p.code)).toContain("post.view");
      expect(listResult.permissions.map((p) => p.code)).toContain("post.create");
    });

    it("should sync and then check permissions correctly for a user", async () => {
      // Step 1: Sync with editor having specific permissions
      const syncCtx = {
        context: {
          adapter: mockAdapter,
          options: {
            plugins: [
              {
                id: "admin",
                ac: {
                  editor: ["post.view", "post.create"],
                },
              },
            ],
          },
        },
        json: vi.fn((data) => data),
      };

      await syncHandler(syncCtx as never, config, staticRoles);

      // Verify editor role was created
      const editorRole = Array.from(db.roles.values()).find((r) => r.name === "editor");
      expect(editorRole).toBeDefined();

      // Step 2: Check permissions for a user with editor role
      const checkCtx = createMockContext(mockAdapter, {
        session: { user: { id: "user_1", role: "editor" } },
        body: { permission: "post.view" },
      });

      const checkHandler = checkPermissionHandler();
      const checkResult = await checkHandler(checkCtx as never);

      expect(checkResult.hasPermission).toBe(true);
      expect(checkResult.userPermissions).toContain("post.view");
      expect(checkResult.userPermissions).toContain("post.create");

      // Step 3: Check permission user doesn't have
      const checkCtx2 = createMockContext(mockAdapter, {
        session: { user: { id: "user_1", role: "editor" } },
        body: { permission: "post.delete" },
      });

      const checkResult2 = await checkHandler(checkCtx2 as never);

      expect(checkResult2.hasPermission).toBe(false);
    });
  });

  describe("Role Lifecycle Integration", () => {
    it("should create role, update it, verify changes, then delete it", async () => {
      // First sync to populate staticRoles
      const syncCtx = {
        context: {
          adapter: mockAdapter,
          options: {
            plugins: [{ id: "admin", ac: { admin: ["user.view"] } }],
          },
        },
        json: vi.fn((data) => data),
      };
      await syncHandler(syncCtx as never, config, staticRoles);

      // Step 1: Create role
      const createCtx = createMockContext(mockAdapter, {
        session: { user: { id: "admin_user", role: "admin" } },
        body: { name: "moderator", description: "Forum Moderator" },
      });

      const createHandler = createRoleHandler(staticRoles);
      const created = await createHandler(createCtx as never);

      expect(created.role.name).toBe("moderator");
      const roleId = created.role.id;

      // Step 2: Update role
      const updateCtx = createMockContext(mockAdapter, {
        session: { user: { id: "admin_user", role: "admin" } },
        params: { roleId },
        body: { description: "Updated Moderator Role" },
      });

      const updateHandler = updateRoleHandler(staticRoles);
      const updated = await updateHandler(updateCtx as never);

      expect(updated.role.description).toBe("Updated Moderator Role");

      // Step 3: Verify role appears in list
      const listCtx = createMockContext(mockAdapter, {
        query: {},
      });

      const listHandler = listRolesHandler(staticRoles);
      const listResult = await listHandler(listCtx as never);

      const modRole = listResult.roles.find((r: { name: string }) => r.name === "moderator");
      expect(modRole).toBeDefined();
      expect(modRole?.description).toBe("Updated Moderator Role");

      // Step 4: Delete role
      const deleteCtx = createMockContext(mockAdapter, {
        session: { user: { id: "admin_user", role: "admin" } },
        params: { roleId },
      });

      const deleteHandler = deleteRoleHandler(staticRoles);
      const deleteResult = await deleteHandler(deleteCtx as never);

      expect(deleteResult.success).toBe(true);
      expect(db.roles.has(roleId)).toBe(false);
    });

    it("should prevent modification of static roles throughout lifecycle", async () => {
      // Sync to create static admin role
      const syncCtx = {
        context: {
          adapter: mockAdapter,
          options: {
            plugins: [{ id: "admin", ac: { admin: ["user.view"] } }],
          },
        },
        json: vi.fn((data) => data),
      };
      await syncHandler(syncCtx as never, config, staticRoles);

      const adminRole = Array.from(db.roles.values()).find((r) => r.name === "admin");
      expect(adminRole).toBeDefined();

      if (!adminRole) {
        throw new Error("Admin role not found");
      }

      // Try to update static role - should fail
      const updateCtx = createMockContext(mockAdapter, {
        session: { user: { id: "admin_user", role: "admin" } },
        params: { roleId: adminRole.id },
        body: { description: "Trying to modify static role" },
      });

      const updateHandler = updateRoleHandler(staticRoles);
      await expect(updateHandler(updateCtx as never)).rejects.toThrow("Cannot modify static role");

      // Try to delete static role - should fail
      const deleteCtx = createMockContext(mockAdapter, {
        session: { user: { id: "admin_user", role: "admin" } },
        params: { roleId: adminRole.id },
      });

      const deleteHandler = deleteRoleHandler(staticRoles);
      await expect(deleteHandler(deleteCtx as never)).rejects.toThrow("Cannot delete static role");

      // Try to assign permission to static role - should fail
      const perm = Array.from(db.permissions.values())[0];
      if (!perm) {
        throw new Error("Permission not found");
      }

      const assignCtx = createMockContext(mockAdapter, {
        session: { user: { id: "admin_user", role: "admin" } },
        params: { roleId: adminRole.id, permissionId: perm.id },
      });

      const assignHandler = assignPermissionHandler(staticRoles);
      await expect(assignHandler(assignCtx as never)).rejects.toThrow(
        "Cannot modify permissions of a static role",
      );
    });
  });

  describe("User Permissions Integration", () => {
    it("should return correct permissions for user after sync", async () => {
      // Sync with viewer role
      const syncCtx = {
        context: {
          adapter: mockAdapter,
          options: {
            plugins: [
              {
                id: "admin",
                ac: {
                  viewer: ["post.view", "user.view"],
                },
              },
            ],
          },
        },
        json: vi.fn((data) => data),
      };
      await syncHandler(syncCtx as never, config, staticRoles);

      // Get user permissions
      const userPermsCtx = createMockContext(mockAdapter, {
        session: { user: { id: "user_1", role: "viewer" } },
      });

      const handler = userPermissionsHandler();
      const result = await handler(userPermsCtx as never);

      expect(result.role).not.toBeNull();
      expect(result.role?.name).toBe("viewer");
      expect(result.permissions).toHaveLength(2);
      expect(result.permissions.map((p) => p.code)).toContain("post.view");
      expect(result.permissions.map((p) => p.code)).toContain("user.view");
    });

    it("should return updated permissions after role permission changes", async () => {
      // Sync initial state
      const syncCtx = {
        context: {
          adapter: mockAdapter,
          options: { plugins: [] },
        },
        json: vi.fn((data) => data),
      };
      await syncHandler(syncCtx as never, config, staticRoles);

      // Need to add admin to staticRoles for auth check
      staticRoles.admin = ["*"];

      // Create dynamic role
      const createCtx = createMockContext(mockAdapter, {
        session: { user: { id: "admin_user", role: "admin" } },
        body: { name: "tester" },
      });

      const createHandler = createRoleHandler(staticRoles);
      const created = await createHandler(createCtx as never);
      const roleId = created.role.id;

      // Initially no permissions
      const userPermsCtx1 = createMockContext(mockAdapter, {
        session: { user: { id: "user_1", role: "tester" } },
      });

      const userPermsHandler = userPermissionsHandler();
      const result1 = await userPermsHandler(userPermsCtx1 as never);

      expect(result1.permissions).toHaveLength(0);

      // Add permission
      const perm = Array.from(db.permissions.values()).find((p) => p.code === "post.view");

      if (!perm) {
        throw new Error("Permission not found");
      }

      const assignCtx = createMockContext(mockAdapter, {
        session: { user: { id: "admin_user", role: "admin" } },
        params: { roleId, permissionId: perm.id },
      });

      const assignHandler = assignPermissionHandler(staticRoles);
      await assignHandler(assignCtx as never);

      // Now check permissions again
      const userPermsCtx2 = createMockContext(mockAdapter, {
        session: { user: { id: "user_1", role: "tester" } },
      });

      const result2 = await userPermsHandler(userPermsCtx2 as never);

      expect(result2.permissions).toHaveLength(1);
      expect(result2.permissions[0]?.code).toBe("post.view");
    });
  });

  describe("Admin Plugin Detection Integration", () => {
    it("should work without admin plugin (standalone mode)", async () => {
      const syncCtx = {
        context: {
          adapter: mockAdapter,
          options: { plugins: [] },
        },
        json: vi.fn((data) => data),
      };

      const result = await syncHandler(syncCtx as never, config, staticRoles);

      expect(result.permissions.created).toBe(5);
      expect(result.roles.created).toBe(0);
      expect(Object.keys(staticRoles)).toHaveLength(0);
    });

    it("should detect and sync multiple static roles from admin plugin", async () => {
      const syncCtx = {
        context: {
          adapter: mockAdapter,
          options: {
            plugins: [
              {
                id: "admin",
                ac: {
                  superadmin: ["user.view", "user.create", "post.delete"],
                  admin: ["user.view", "post.view"],
                  moderator: ["post.view", "post.create"],
                },
              },
            ],
          },
        },
        json: vi.fn((data) => data),
      };

      const result = await syncHandler(syncCtx as never, config, staticRoles);

      expect(result.roles.created).toBe(3);
      expect(staticRoles.superadmin).toEqual(["user.view", "user.create", "post.delete"]);
      expect(staticRoles.admin).toEqual(["user.view", "post.view"]);
      expect(staticRoles.moderator).toEqual(["post.view", "post.create"]);
    });
  });

  describe("Session Hook Integration", () => {
    /**
     * Simulates session hook handler logic for integration testing.
     * This mirrors the logic from src/server.ts hooks.after handler.
     */
    async function simulateSessionHook(
      adapter: MockAdapter,
      userRoleName: string | undefined,
    ): Promise<string[]> {
      if (!userRoleName) {
        return [];
      }

      // Find the role entity by name
      const role = (await adapter.findOne({
        model: "role",
        where: [{ field: "name", value: userRoleName }],
      })) as { id: string; name: string } | null;

      if (!role) {
        return [];
      }

      // Get role permissions
      const rolePermissions = (await adapter.findMany({
        model: "rolePermission",
        where: [{ field: "roleId", operator: "in", value: [role.id] }],
      })) as { roleId: string; permissionId: string }[];

      if (rolePermissions.length === 0) {
        return [];
      }

      const permissionIds = rolePermissions.map((rp) => rp.permissionId);
      const permissions = (await adapter.findMany({
        model: "permission",
        where: [{ field: "id", operator: "in", value: permissionIds }],
      })) as { id: string; code: string }[];

      return permissions.map((p) => p.code);
    }

    it("should integrate session hook with getRolePermissions utility", async () => {
      // Sync to create roles and permissions
      const syncCtx = {
        context: {
          adapter: mockAdapter,
          options: {
            plugins: [
              {
                id: "admin",
                ac: {
                  editor: ["post.view", "post.create"],
                },
              },
            ],
          },
        },
        json: vi.fn((data) => data),
      };
      await syncHandler(syncCtx as never, config, staticRoles);

      // Simulate session hook for a user with editor role
      const permissions = await simulateSessionHook(mockAdapter, "editor");

      expect(permissions).toContain("post.view");
      expect(permissions).toContain("post.create");
      expect(permissions).toHaveLength(2);
    });

    it("should work with roles created via createRole endpoint", async () => {
      // Initial sync to create permissions
      const syncCtx = {
        context: {
          adapter: mockAdapter,
          options: { plugins: [{ id: "admin", ac: { admin: ["user.view"] } }] },
        },
        json: vi.fn((data) => data),
      };
      await syncHandler(syncCtx as never, config, staticRoles);

      // Create a dynamic role
      const createRoleCtx = createMockContext(mockAdapter, {
        session: { user: { id: "admin_user", role: "admin" } },
        body: { name: "reviewer", description: "Content Reviewer" },
      });

      const createHandler = createRoleHandler(staticRoles);
      const created = await createHandler(createRoleCtx as never);
      const reviewerRoleId = created.role.id;

      // Assign permissions to the new role
      const postViewPerm = Array.from(db.permissions.values()).find((p) => p.code === "post.view");
      expect(postViewPerm).toBeDefined();

      if (postViewPerm) {
        const assignCtx = createMockContext(mockAdapter, {
          session: { user: { id: "admin_user", role: "admin" } },
          params: { roleId: reviewerRoleId, permissionId: postViewPerm.id },
        });
        const assignHandler = assignPermissionHandler(staticRoles);
        await assignHandler(assignCtx as never);
      }

      // Simulate session hook for a user with the new dynamic role
      const permissions = await simulateSessionHook(mockAdapter, "reviewer");

      expect(permissions).toContain("post.view");
      expect(permissions).toHaveLength(1);
    });

    it("should reflect permission changes after assignPermission", async () => {
      // Initial sync
      const syncCtx = {
        context: {
          adapter: mockAdapter,
          options: { plugins: [{ id: "admin", ac: { admin: ["user.view"] } }] },
        },
        json: vi.fn((data) => data),
      };
      await syncHandler(syncCtx as never, config, staticRoles);

      // Create dynamic role without permissions
      const createRoleCtx = createMockContext(mockAdapter, {
        session: { user: { id: "admin_user", role: "admin" } },
        body: { name: "contributor" },
      });

      const createHandler = createRoleHandler(staticRoles);
      const created = await createHandler(createRoleCtx as never);
      const contributorRoleId = created.role.id;

      // Initially, session hook should return empty permissions
      let permissions = await simulateSessionHook(mockAdapter, "contributor");
      expect(permissions).toHaveLength(0);

      // Assign a permission
      const userViewPerm = Array.from(db.permissions.values()).find((p) => p.code === "user.view");
      const postViewPerm = Array.from(db.permissions.values()).find((p) => p.code === "post.view");

      if (userViewPerm && postViewPerm) {
        const assignHandler = assignPermissionHandler(staticRoles);

        // Assign first permission
        const assignCtx1 = createMockContext(mockAdapter, {
          session: { user: { id: "admin_user", role: "admin" } },
          params: {
            roleId: contributorRoleId,
            permissionId: userViewPerm.id,
          },
        });
        await assignHandler(assignCtx1 as never);

        // Session hook should now return the permission
        permissions = await simulateSessionHook(mockAdapter, "contributor");
        expect(permissions).toContain("user.view");
        expect(permissions).toHaveLength(1);

        // Assign second permission
        const assignCtx2 = createMockContext(mockAdapter, {
          session: { user: { id: "admin_user", role: "admin" } },
          params: {
            roleId: contributorRoleId,
            permissionId: postViewPerm.id,
          },
        });
        await assignHandler(assignCtx2 as never);

        // Session hook should now return both permissions
        permissions = await simulateSessionHook(mockAdapter, "contributor");
        expect(permissions).toContain("user.view");
        expect(permissions).toContain("post.view");
        expect(permissions).toHaveLength(2);
      }
    });

    it("should reflect permission removal after removePermission", async () => {
      // Initial sync with a role that has permissions
      const syncCtx = {
        context: {
          adapter: mockAdapter,
          options: {
            plugins: [
              {
                id: "admin",
                ac: {
                  admin: ["user.view"],
                  writer: ["post.view", "post.create"],
                },
              },
            ],
          },
        },
        json: vi.fn((data) => data),
      };
      await syncHandler(syncCtx as never, config, staticRoles);

      // Verify initial permissions via session hook
      let permissions = await simulateSessionHook(mockAdapter, "writer");
      expect(permissions).toContain("post.view");
      expect(permissions).toContain("post.create");
      expect(permissions).toHaveLength(2);

      // Since writer is a static role, we can't remove permissions from it.
      // Let's create a dynamic role instead and test with that.
      const createRoleCtx = createMockContext(mockAdapter, {
        session: { user: { id: "admin_user", role: "admin" } },
        body: { name: "dynamicWriter" },
      });

      const createHandler = createRoleHandler(staticRoles);
      const created = await createHandler(createRoleCtx as never);
      const dynamicWriterRoleId = created.role.id;

      // Assign permissions to the dynamic role
      const postViewPerm = Array.from(db.permissions.values()).find((p) => p.code === "post.view");
      const postCreatePerm = Array.from(db.permissions.values()).find(
        (p) => p.code === "post.create",
      );

      if (postViewPerm && postCreatePerm) {
        const assignHandler = assignPermissionHandler(staticRoles);

        const assignCtx1 = createMockContext(mockAdapter, {
          session: { user: { id: "admin_user", role: "admin" } },
          params: {
            roleId: dynamicWriterRoleId,
            permissionId: postViewPerm.id,
          },
        });
        await assignHandler(assignCtx1 as never);

        const assignCtx2 = createMockContext(mockAdapter, {
          session: { user: { id: "admin_user", role: "admin" } },
          params: {
            roleId: dynamicWriterRoleId,
            permissionId: postCreatePerm.id,
          },
        });
        await assignHandler(assignCtx2 as never);

        // Verify both permissions are present
        permissions = await simulateSessionHook(mockAdapter, "dynamicWriter");
        expect(permissions).toHaveLength(2);

        // Remove one permission
        const removeCtx = createMockContext(mockAdapter, {
          session: { user: { id: "admin_user", role: "admin" } },
          params: {
            roleId: dynamicWriterRoleId,
            permissionId: postCreatePerm.id,
          },
        });

        const { removePermissionHandler } = await import("../src/endpoints/permissions.js");
        const removeHandler = removePermissionHandler(staticRoles);
        await removeHandler(removeCtx as never);

        // Session hook should now only return one permission
        permissions = await simulateSessionHook(mockAdapter, "dynamicWriter");
        expect(permissions).toContain("post.view");
        expect(permissions).not.toContain("post.create");
        expect(permissions).toHaveLength(1);
      }
    });

    it("should work with synced static roles", async () => {
      // Sync with multiple static roles
      const syncCtx = {
        context: {
          adapter: mockAdapter,
          options: {
            plugins: [
              {
                id: "admin",
                ac: {
                  superadmin: [
                    "user.view",
                    "user.create",
                    "post.view",
                    "post.create",
                    "post.delete",
                  ],
                  admin: ["user.view", "post.view", "post.create"],
                  viewer: ["post.view"],
                },
              },
            ],
          },
        },
        json: vi.fn((data) => data),
      };
      await syncHandler(syncCtx as never, config, staticRoles);

      // Test session hook for each static role
      const superadminPerms = await simulateSessionHook(mockAdapter, "superadmin");
      expect(superadminPerms).toHaveLength(5);
      expect(superadminPerms).toContain("user.view");
      expect(superadminPerms).toContain("user.create");
      expect(superadminPerms).toContain("post.view");
      expect(superadminPerms).toContain("post.create");
      expect(superadminPerms).toContain("post.delete");

      const adminPerms = await simulateSessionHook(mockAdapter, "admin");
      expect(adminPerms).toHaveLength(3);
      expect(adminPerms).toContain("user.view");
      expect(adminPerms).toContain("post.view");
      expect(adminPerms).toContain("post.create");

      const viewerPerms = await simulateSessionHook(mockAdapter, "viewer");
      expect(viewerPerms).toHaveLength(1);
      expect(viewerPerms).toContain("post.view");
    });
  });
});

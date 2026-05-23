import { beforeEach, describe, expect, it } from "vitest";
import { checkPermissionHandler } from "../src/endpoints/check-permission";
import {
  type MockAdapter,
  type MockContext,
  createMockAdapter,
  createMockContext,
} from "./test-utils";

describe("Check Permission Endpoint", () => {
  let mockAdapter: MockAdapter;
  let mockCtx: MockContext;

  beforeEach(() => {
    mockAdapter = createMockAdapter();
    mockCtx = createMockContext(mockAdapter, {
      session: {
        user: {
          id: "user_id",
          role: "editor",
        },
      },
    });
  });

  it("should throw UNAUTHORIZED if no session", async () => {
    mockCtx.context.session = null;
    const handler = checkPermissionHandler();

    await expect(handler(mockCtx as never)).rejects.toThrow("Session required");
  });

  it("should return true if user has single permission", async () => {
    mockCtx.body = { permission: "post.create" };
    const handler = checkPermissionHandler();

    // Mock finding role
    mockAdapter.findOne.mockResolvedValue({
      id: "role_editor",
      name: "editor",
    });

    // Mock finding permissions
    mockAdapter.findMany.mockImplementation(async ({ model }) => {
      if (model === "rolePermission") {
        return [{ roleId: "role_editor", permissionId: "perm_create" }];
      }
      if (model === "permission") {
        return [{ id: "perm_create", name: "Create Post", code: "post.create" }];
      }
      return [];
    });

    const result = await handler(mockCtx as never);

    expect(result.hasPermission).toBe(true);
    expect(result.checked).toEqual(["post.create"]);
    expect(result.userPermissions).toEqual(["post.create"]);
  });

  it("should return false if user missing permission", async () => {
    mockCtx.body = { permission: "post.delete" };
    const handler = checkPermissionHandler();

    mockAdapter.findOne.mockResolvedValue({
      id: "role_editor",
      name: "editor",
    });

    mockAdapter.findMany.mockImplementation(async ({ model }) => {
      if (model === "rolePermission") {
        return [{ roleId: "role_editor", permissionId: "perm_create" }];
      }
      if (model === "permission") {
        return [{ id: "perm_create", name: "Create Post", code: "post.create" }];
      }
      return [];
    });

    const result = await handler(mockCtx as never);

    expect(result.hasPermission).toBe(false);
    expect(result.checked).toEqual(["post.delete"]);
  });

  it("should check multiple permissions (all required)", async () => {
    mockCtx.body = { permission: ["post.create", "post.view"] };
    const handler = checkPermissionHandler();

    mockAdapter.findOne.mockResolvedValue({
      id: "role_editor",
      name: "editor",
    });

    mockAdapter.findMany.mockImplementation(async ({ model }) => {
      if (model === "rolePermission") {
        return [
          { roleId: "role_editor", permissionId: "perm_create" },
          { roleId: "role_editor", permissionId: "perm_view" },
        ];
      }
      if (model === "permission") {
        return [
          { id: "perm_create", name: "Create Post", code: "post.create" },
          { id: "perm_view", name: "View Post", code: "post.view" },
        ];
      }
      return [];
    });

    const result = await handler(mockCtx as never);

    expect(result.hasPermission).toBe(true);
    expect(result.checked).toEqual(["post.create", "post.view"]);
  });

  it("should fail multiple permissions if one is missing", async () => {
    mockCtx.body = { permission: ["post.create", "post.delete"] };
    const handler = checkPermissionHandler();

    mockAdapter.findOne.mockResolvedValue({
      id: "role_editor",
      name: "editor",
    });

    mockAdapter.findMany.mockImplementation(async ({ model }) => {
      if (model === "rolePermission") {
        return [{ roleId: "role_editor", permissionId: "perm_create" }];
      }
      if (model === "permission") {
        return [{ id: "perm_create", name: "Create Post", code: "post.create" }];
      }
      return [];
    });

    const result = await handler(mockCtx as never);

    expect(result.hasPermission).toBe(false);
  });

  it("should return empty permissions for user without role", async () => {
    mockCtx.context.session = {
      user: {
        id: "user_id",
        role: "", // Empty role
      },
    };
    mockCtx.body = { permission: "post.create" };
    const handler = checkPermissionHandler();

    const result = await handler(mockCtx as never);

    expect(result.hasPermission).toBe(false);
    expect(result.userPermissions).toEqual([]);
  });

  it("should return empty permissions when role not found in database", async () => {
    mockCtx.body = { permission: "post.create" };
    const handler = checkPermissionHandler();

    // Role doesn't exist
    mockAdapter.findOne.mockResolvedValue(null);

    const result = await handler(mockCtx as never);

    expect(result.hasPermission).toBe(false);
    expect(result.userPermissions).toEqual([]);
  });

  it("should be case-sensitive for permission checks", async () => {
    mockCtx.body = { permission: "Post.Create" }; // Different case
    const handler = checkPermissionHandler();

    mockAdapter.findOne.mockResolvedValue({
      id: "role_editor",
      name: "editor",
    });

    mockAdapter.findMany.mockImplementation(async ({ model }) => {
      if (model === "rolePermission") {
        return [{ roleId: "role_editor", permissionId: "perm_create" }];
      }
      if (model === "permission") {
        return [{ id: "perm_create", name: "Create Post", code: "post.create" }]; // lowercase code
      }
      return [];
    });

    const result = await handler(mockCtx as never);

    expect(result.hasPermission).toBe(false); // Case mismatch
    expect(result.checked).toEqual(["Post.Create"]);
    expect(result.userPermissions).toEqual(["post.create"]);
  });
});

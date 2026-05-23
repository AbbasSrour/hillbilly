import { beforeEach, describe, expect, it } from "vitest";
import { getRolePermissions } from "../src/utils/get-role-permissions";
import { type MockAdapter, createMockAdapter } from "./test-utils";

describe("getRolePermissions", () => {
  let mockAdapter: MockAdapter;
  let mockCtx: { context: { adapter: MockAdapter } };

  beforeEach(() => {
    mockAdapter = createMockAdapter();
    mockCtx = {
      context: {
        adapter: mockAdapter,
      },
    };
  });

  it("should return empty object for empty roleIds array", async () => {
    const result = await getRolePermissions(mockCtx as never, []);

    expect(result).toEqual({});
    expect(mockAdapter.findMany).not.toHaveBeenCalled();
  });

  it("should return permissions mapped by roleId", async () => {
    const roleIds = ["role_1", "role_2"];

    // Mock rolePermission findMany
    mockAdapter.findMany.mockImplementation(async ({ model }) => {
      if (model === "rolePermission") {
        return [
          { roleId: "role_1", permissionId: "perm_1" },
          { roleId: "role_1", permissionId: "perm_2" },
          { roleId: "role_2", permissionId: "perm_3" },
        ];
      }
      if (model === "permission") {
        return [
          { id: "perm_1", name: "user.view", code: "user.view" },
          { id: "perm_2", name: "user.create", code: "user.create" },
          { id: "perm_3", name: "post.view", code: "post.view" },
        ];
      }
      return [];
    });

    const result = await getRolePermissions(mockCtx as never, roleIds);

    expect(result.role_1).toHaveLength(2);
    expect(result.role_2).toHaveLength(1);
    expect(result.role_1?.[0]?.code).toBe("user.view");
    expect(result.role_2?.[0]?.code).toBe("post.view");
  });

  it("should return empty object when no rolePermissions exist", async () => {
    mockAdapter.findMany.mockResolvedValue([]);

    const result = await getRolePermissions(mockCtx as never, ["role_1"]);

    expect(result).toEqual({});
  });

  it("should handle roles with no matching permissions", async () => {
    // Role has mappings but permissions don't exist
    mockAdapter.findMany.mockImplementation(async ({ model }) => {
      if (model === "rolePermission") {
        return [{ roleId: "role_1", permissionId: "nonexistent_perm" }];
      }
      if (model === "permission") {
        return []; // Permission doesn't exist
      }
      return [];
    });

    const result = await getRolePermissions(mockCtx as never, ["role_1"]);

    // Role exists in result but with empty permissions array
    expect(result.role_1).toEqual([]);
  });

  it("should deduplicate permission IDs when fetching", async () => {
    // Same permission assigned to multiple roles
    mockAdapter.findMany.mockImplementation(async ({ model, where }) => {
      if (model === "rolePermission") {
        return [
          { roleId: "role_1", permissionId: "shared_perm" },
          { roleId: "role_2", permissionId: "shared_perm" },
        ];
      }
      if (model === "permission") {
        // Verify we're fetching with deduplicated IDs
        expect(where?.[0]?.value).toEqual(["shared_perm"]);
        return [{ id: "shared_perm", name: "shared", code: "shared" }];
      }
      return [];
    });

    const result = await getRolePermissions(mockCtx as never, ["role_1", "role_2"]);

    expect(result.role_1).toHaveLength(1);
    expect(result.role_2).toHaveLength(1);
    expect(result.role_1?.[0]?.id).toBe("shared_perm");
    expect(result.role_2?.[0]?.id).toBe("shared_perm");
  });

  it("should use IN operator for multiple roleIds", async () => {
    mockAdapter.findMany.mockResolvedValue([]);

    await getRolePermissions(mockCtx as never, ["role_1", "role_2", "role_3"]);

    expect(mockAdapter.findMany).toHaveBeenCalledWith({
      model: "rolePermission",
      where: [
        {
          field: "roleId",
          operator: "in",
          value: ["role_1", "role_2", "role_3"],
        },
      ],
    });
  });
});

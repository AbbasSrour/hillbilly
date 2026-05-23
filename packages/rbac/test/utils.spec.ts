import { describe, expect, it } from "vitest";
import { isStaticRole } from "../src/utils/access-control";
import { adminPluginPermissions } from "../src/utils/admin-permissions";

describe("RBAC Utils", () => {
  describe("isStaticRole", () => {
    it("should return true for static roles", () => {
      const staticRoles = { admin: ["*"] };
      expect(isStaticRole("admin", staticRoles)).toBe(true);
    });

    it("should return false for non-static roles", () => {
      const staticRoles = { admin: ["*"] };
      expect(isStaticRole("user", staticRoles)).toBe(false);
    });
  });

  describe("adminPluginPermissions", () => {
    it("should be an array", () => {
      expect(Array.isArray(adminPluginPermissions)).toBe(true);
    });

    it("should have correct structure", () => {
      for (const permission of adminPluginPermissions) {
        expect(permission).toHaveProperty("code");
        expect(permission).toHaveProperty("name");
        expect(permission).toHaveProperty("description");
        expect(typeof permission.code).toBe("string");
        expect(typeof permission.name).toBe("string");
        expect(typeof permission.description).toBe("string");
      }
    });

    it("should contain key permissions", () => {
      const codes = adminPluginPermissions.map((p) => p.code);
      expect(codes).toContain("user.view");
      expect(codes).toContain("user.create");
      expect(codes).toContain("user.delete");
    });
  });
});

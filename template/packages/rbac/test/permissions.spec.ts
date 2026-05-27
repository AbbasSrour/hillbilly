import { APIError } from 'better-auth/api';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  assignPermissionHandler,
  listPermissionsHandler,
  listRolePermissionsHandler,
  removePermissionHandler,
} from '../src/endpoints/permissions';

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

describe('Permission Endpoints', () => {
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
            id: 'admin_id',
            role: 'admin',
          },
        },
      },
      body: {},
      query: {},
      params: {},
      json: vi.fn((data) => data),
    };
    staticRoles = {
      admin: ['user.view', 'user.create'],
    };
  });

  describe('listPermissionsHandler', () => {
    it('should list all permissions', async () => {
      mockAdapter.count.mockResolvedValue(2);
      mockAdapter.findMany.mockResolvedValue([
        { id: 'p1', code: 'view' },
        { id: 'p2', code: 'edit' },
      ]);

      const result = await listPermissionsHandler(mockCtx as never);

      expect(result.total).toBe(2);
      expect(result.permissions).toHaveLength(2);
      expect(mockAdapter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'permission' }),
      );
    });

    it('should respect pagination parameters', async () => {
      mockCtx.query = { limit: '10', offset: '20' };
      mockAdapter.count.mockResolvedValue(50);
      mockAdapter.findMany.mockResolvedValue([]);

      await listPermissionsHandler(mockCtx as never);

      expect(mockAdapter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'permission',
          limit: 10,
          offset: 20,
        }),
      );
    });

    it('should respect sorting parameters', async () => {
      mockCtx.query = { sortBy: 'code', sortDirection: 'desc' };
      mockAdapter.count.mockResolvedValue(0);
      mockAdapter.findMany.mockResolvedValue([]);

      await listPermissionsHandler(mockCtx as never);

      expect(mockAdapter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'permission',
          sortBy: { field: 'code', direction: 'desc' },
        }),
      );
    });
  });

  describe('listRolePermissionsHandler', () => {
    it('should throw BAD_REQUEST if roleId is missing', async () => {
      mockCtx.params = {};

      await expect(listRolePermissionsHandler(mockCtx as never)).rejects.toThrow(
        'Role ID is required',
      );
    });

    it('should list permissions for a specific role', async () => {
      mockCtx.params = { roleId: 'role_1' };

      // Mock RolePermission findMany
      mockAdapter.findMany.mockImplementationOnce(async () => [
        { roleId: 'role_1', permissionId: 'p1' },
      ]);
      // Mock Permission findMany
      mockAdapter.findMany.mockImplementationOnce(async () => [{ id: 'p1', code: 'view' }]);

      const result = await listRolePermissionsHandler(mockCtx as never);

      expect(result.total).toBe(1);
      if (result.permissions[0]) {
        expect(result.permissions[0].code).toBe('view');
      }
    });

    it('should return empty list if role has no permissions', async () => {
      mockCtx.params = { roleId: 'role_empty' };
      mockAdapter.findMany.mockResolvedValue([]); // RolePermission

      const result = await listRolePermissionsHandler(mockCtx as never);

      expect(result.permissions).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('assignPermissionHandler', () => {
    it('should throw UNAUTHORIZED if no session', async () => {
      mockCtx.context.session = null;
      const handler = assignPermissionHandler(staticRoles);
      await expect(handler(mockCtx as never)).rejects.toThrow('Session required');
    });

    it('should throw FORBIDDEN if user is not admin', async () => {
      if (mockCtx.context.session) {
        mockCtx.context.session.user.role = 'user';
      }
      const handler = assignPermissionHandler(staticRoles);
      await expect(handler(mockCtx as never)).rejects.toThrow(APIError);
    });

    it('should throw BAD_REQUEST if roleId or permissionId missing', async () => {
      mockCtx.params = { roleId: 'role_1' };
      const handler = assignPermissionHandler(staticRoles);
      await expect(handler(mockCtx as never)).rejects.toThrow(
        'Role ID and Permission ID are required',
      );
    });

    it('should throw NOT_FOUND if role does not exist', async () => {
      mockCtx.params = { roleId: 'role_nonexistent', permissionId: 'p1' };
      mockAdapter.findOne.mockResolvedValue(null);

      const handler = assignPermissionHandler(staticRoles);
      await expect(handler(mockCtx as never)).rejects.toThrow('Role not found');
    });

    it('should throw NOT_FOUND if permission does not exist', async () => {
      mockCtx.params = { roleId: 'role_mod', permissionId: 'p_nonexistent' };
      // Role exists
      mockAdapter.findOne.mockResolvedValueOnce({
        id: 'role_mod',
        name: 'moderator',
      });
      // Permission doesn't exist
      mockAdapter.findOne.mockResolvedValueOnce(null);

      const handler = assignPermissionHandler(staticRoles);
      await expect(handler(mockCtx as never)).rejects.toThrow('Permission not found');
    });

    it('should throw FORBIDDEN if role is static', async () => {
      mockCtx.params = { roleId: 'role_admin', permissionId: 'p1' };
      mockAdapter.findOne.mockResolvedValue({
        id: 'role_admin',
        name: 'admin',
      });

      const handler = assignPermissionHandler(staticRoles);
      await expect(handler(mockCtx as never)).rejects.toThrow(
        'Cannot modify permissions of a static role',
      );
    });

    it('should return success with message if already assigned', async () => {
      mockCtx.params = { roleId: 'role_mod', permissionId: 'p1' };
      // Role exists
      mockAdapter.findOne.mockResolvedValueOnce({
        id: 'role_mod',
        name: 'moderator',
      });
      // Permission exists
      mockAdapter.findOne.mockResolvedValueOnce({ id: 'p1', code: 'view' });
      // Already assigned
      mockAdapter.findOne.mockResolvedValueOnce({
        roleId: 'role_mod',
        permissionId: 'p1',
      });

      const handler = assignPermissionHandler(staticRoles);
      const result = await handler(mockCtx as never);

      expect(result.success).toBe(true);
      expect((result as { message?: string }).message).toBe('Already assigned');
      expect(mockAdapter.create).not.toHaveBeenCalled();
    });

    it('should assign permission if valid', async () => {
      mockCtx.params = { roleId: 'role_mod', permissionId: 'p1' };
      // Role exists
      mockAdapter.findOne.mockResolvedValueOnce({
        id: 'role_mod',
        name: 'moderator',
      });
      // Permission exists
      mockAdapter.findOne.mockResolvedValueOnce({ id: 'p1', code: 'view' });
      // Not already assigned
      mockAdapter.findOne.mockResolvedValueOnce(null);

      const handler = assignPermissionHandler(staticRoles);
      const result = await handler(mockCtx as never);

      expect(mockAdapter.create).toHaveBeenCalledWith({
        model: 'rolePermission',
        data: { roleId: 'role_mod', permissionId: 'p1' },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('removePermissionHandler', () => {
    it('should throw UNAUTHORIZED if no session', async () => {
      mockCtx.context.session = null;
      const handler = removePermissionHandler(staticRoles);
      await expect(handler(mockCtx as never)).rejects.toThrow('Session required');
    });

    it('should throw FORBIDDEN if user is not admin', async () => {
      if (mockCtx.context.session) {
        mockCtx.context.session.user.role = 'user';
      }
      const handler = removePermissionHandler(staticRoles);
      await expect(handler(mockCtx as never)).rejects.toThrow(APIError);
    });

    it('should throw BAD_REQUEST if roleId or permissionId missing', async () => {
      mockCtx.params = { permissionId: 'p1' };
      const handler = removePermissionHandler(staticRoles);
      await expect(handler(mockCtx as never)).rejects.toThrow(
        'Role ID and Permission ID are required',
      );
    });

    it('should throw NOT_FOUND if role does not exist', async () => {
      mockCtx.params = { roleId: 'role_nonexistent', permissionId: 'p1' };
      mockAdapter.findOne.mockResolvedValue(null);

      const handler = removePermissionHandler(staticRoles);
      await expect(handler(mockCtx as never)).rejects.toThrow('Role not found');
    });

    it('should throw FORBIDDEN if role is static', async () => {
      mockCtx.params = { roleId: 'role_admin', permissionId: 'p1' };
      mockAdapter.findOne.mockResolvedValue({
        id: 'role_admin',
        name: 'admin',
      });

      const handler = removePermissionHandler(staticRoles);
      await expect(handler(mockCtx as never)).rejects.toThrow(
        'Cannot modify permissions of a static role',
      );
    });

    it('should remove permission', async () => {
      mockCtx.params = { roleId: 'role_mod', permissionId: 'p1' };
      mockAdapter.findOne.mockResolvedValue({
        id: 'role_mod',
        name: 'moderator',
      });

      const handler = removePermissionHandler(staticRoles);
      const result = await handler(mockCtx as never);

      expect(mockAdapter.deleteMany).toHaveBeenCalledWith({
        model: 'rolePermission',
        where: [
          { field: 'roleId', value: 'role_mod' },
          { field: 'permissionId', value: 'p1' },
        ],
      });
      expect(result.success).toBe(true);
    });
  });
});

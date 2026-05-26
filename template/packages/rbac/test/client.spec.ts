import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type AssignPermissionInput,
  type CheckPermissionInput,
  type CreateRoleInput,
  type DeleteRoleInput,
  type ListRolePermissionsInput,
  type PaginationQuery,
  type RemovePermissionInput,
  type UpdateRoleInput,
  rbacClient,
} from '../src/client';

describe('RBAC Client Plugin', () => {
  describe('plugin structure', () => {
    it('returns plugin with id "rbac"', () => {
      const plugin = rbacClient();
      expect(plugin.id).toBe('rbac');
    });

    it('has getActions function', () => {
      const plugin = rbacClient();
      expect(typeof plugin.getActions).toBe('function');
    });

    it('has pathMethods property', () => {
      const plugin = rbacClient();
      expect(plugin).toHaveProperty('pathMethods');
      expect(plugin.pathMethods).toEqual({
        '/rbac/roles': 'GET',
        '/rbac/role': ['GET', 'PUT', 'DELETE'],
        '/rbac/permissions': 'GET',
        '/rbac/role-permissions': 'GET',
        '/rbac/role-permissions/assign': 'POST',
        '/rbac/role-permissions/remove': 'POST',
        '/rbac/user-permissions': 'GET',
      });
    });

    it('getActions returns an object with rbac namespace', () => {
      const plugin = rbacClient();
      const mockFetch = vi.fn();
      const actions = plugin.getActions(mockFetch);

      expect(actions).toHaveProperty('rbac');
      expect(typeof actions.rbac).toBe('object');
    });

    it('rbac namespace contains all expected methods', () => {
      const plugin = rbacClient();
      const mockFetch = vi.fn();
      const actions = plugin.getActions(mockFetch);

      expect(actions.rbac).toHaveProperty('sync');
      expect(actions.rbac).toHaveProperty('listRoles');
      expect(actions.rbac).toHaveProperty('getRole');
      expect(actions.rbac).toHaveProperty('createRole');
      expect(actions.rbac).toHaveProperty('updateRole');
      expect(actions.rbac).toHaveProperty('deleteRole');
      expect(actions.rbac).toHaveProperty('listPermissions');
      expect(actions.rbac).toHaveProperty('listRolePermissions');
      expect(actions.rbac).toHaveProperty('assignPermission');
      expect(actions.rbac).toHaveProperty('removePermission');
      expect(actions.rbac).toHaveProperty('checkPermission');
      expect(actions.rbac).toHaveProperty('getUserPermissions');
    });
  });

  describe('input types', () => {
    it('PaginationQuery type is exported and usable', () => {
      const query: PaginationQuery = {
        limit: 10,
        offset: 5,
        sortBy: 'name',
        sortDirection: 'asc',
      };
      expect(query.limit).toBe(10);
      expect(query.offset).toBe(5);
      expect(query.sortBy).toBe('name');
      expect(query.sortDirection).toBe('asc');
    });

    it('CreateRoleInput type is exported and usable', () => {
      const input: CreateRoleInput = {
        name: 'test-role',
        description: 'Test description',
        permissionIds: ['perm-1', 'perm-2'],
      };
      expect(input.name).toBe('test-role');
      expect(input.description).toBe('Test description');
      expect(input.permissionIds).toEqual(['perm-1', 'perm-2']);
    });

    it('UpdateRoleInput type is exported and usable', () => {
      const input: UpdateRoleInput = {
        roleId: 'role-123',
        name: 'updated-role',
        description: 'Updated description',
        permissionIds: ['perm-3'],
      };
      expect(input.roleId).toBe('role-123');
      expect(input.name).toBe('updated-role');
    });

    it('DeleteRoleInput type is exported and usable', () => {
      const input: DeleteRoleInput = {
        roleId: 'role-123',
      };
      expect(input.roleId).toBe('role-123');
    });

    it('ListRolePermissionsInput type is exported and usable', () => {
      const input: ListRolePermissionsInput = {
        roleId: 'role-123',
      };
      expect(input.roleId).toBe('role-123');
    });

    it('AssignPermissionInput type is exported and usable', () => {
      const input: AssignPermissionInput = {
        roleId: 'role-123',
        permissionId: 'perm-456',
      };
      expect(input.roleId).toBe('role-123');
      expect(input.permissionId).toBe('perm-456');
    });

    it('RemovePermissionInput type is exported and usable', () => {
      const input: RemovePermissionInput = {
        roleId: 'role-123',
        permissionId: 'perm-456',
      };
      expect(input.roleId).toBe('role-123');
      expect(input.permissionId).toBe('perm-456');
    });

    it('CheckPermissionInput type is exported and usable with string', () => {
      const input: CheckPermissionInput = {
        permission: 'users:read',
      };
      expect(input.permission).toBe('users:read');
    });

    it('CheckPermissionInput type is exported and usable with string array', () => {
      const input: CheckPermissionInput = {
        permission: ['users:read', 'users:write'],
      };
      expect(input.permission).toEqual(['users:read', 'users:write']);
    });
  });

  describe('client methods', () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
      mockFetch.mockClear();
      mockFetch.mockResolvedValue({ data: {}, error: null });
    });

    describe('sync', () => {
      it('calls POST /rbac/sync', async () => {
        const plugin = rbacClient();
        const actions = plugin.getActions(mockFetch);
        await actions.rbac.sync();

        expect(mockFetch).toHaveBeenCalledWith(
          '/rbac/sync',
          expect.objectContaining({
            method: 'POST',
          }),
        );
      });

      it('passes fetch options', async () => {
        const plugin = rbacClient();
        const actions = plugin.getActions(mockFetch);
        const fetchOptions = { headers: { 'X-Custom': 'header' } };
        await actions.rbac.sync(fetchOptions);

        expect(mockFetch).toHaveBeenCalledWith(
          '/rbac/sync',
          expect.objectContaining({
            method: 'POST',
            headers: { 'X-Custom': 'header' },
          }),
        );
      });
    });

    describe('listRoles', () => {
      it('calls GET /rbac/roles without query params', async () => {
        const plugin = rbacClient();
        const actions = plugin.getActions(mockFetch);
        await actions.rbac.listRoles();

        expect(mockFetch).toHaveBeenCalledWith(
          '/rbac/roles',
          expect.objectContaining({
            method: 'GET',
          }),
        );
      });

      it('calls GET /rbac/roles with pagination query params', async () => {
        const plugin = rbacClient();
        const actions = plugin.getActions(mockFetch);
        await actions.rbac.listRoles({ limit: 10, offset: 5 });

        expect(mockFetch).toHaveBeenCalledWith(
          '/rbac/roles?limit=10&offset=5',
          expect.objectContaining({
            method: 'GET',
          }),
        );
      });

      it('calls GET /rbac/roles with all pagination params', async () => {
        const plugin = rbacClient();
        const actions = plugin.getActions(mockFetch);
        await actions.rbac.listRoles({
          limit: 10,
          offset: 5,
          sortBy: 'name',
          sortDirection: 'desc',
        });

        expect(mockFetch).toHaveBeenCalledWith(
          '/rbac/roles?limit=10&offset=5&sortBy=name&sortDirection=desc',
          expect.objectContaining({
            method: 'GET',
          }),
        );
      });

      it('passes fetch options', async () => {
        const plugin = rbacClient();
        const actions = plugin.getActions(mockFetch);
        await actions.rbac.listRoles(undefined, {
          headers: { 'X-Custom': 'header' },
        });

        expect(mockFetch).toHaveBeenCalledWith(
          '/rbac/roles',
          expect.objectContaining({
            method: 'GET',
            headers: { 'X-Custom': 'header' },
          }),
        );
      });
    });

    describe('createRole', () => {
      it('calls POST /rbac/roles with body', async () => {
        const plugin = rbacClient();
        const actions = plugin.getActions(mockFetch);
        await actions.rbac.createRole({ name: 'test-role' });

        expect(mockFetch).toHaveBeenCalledWith(
          '/rbac/roles',
          expect.objectContaining({
            method: 'POST',
            body: { name: 'test-role' },
          }),
        );
      });

      it('calls POST /rbac/roles with full body', async () => {
        const plugin = rbacClient();
        const actions = plugin.getActions(mockFetch);
        await actions.rbac.createRole({
          name: 'test-role',
          description: 'Test description',
          permissionIds: ['perm-1', 'perm-2'],
        });

        expect(mockFetch).toHaveBeenCalledWith(
          '/rbac/roles',
          expect.objectContaining({
            method: 'POST',
            body: {
              name: 'test-role',
              description: 'Test description',
              permissionIds: ['perm-1', 'perm-2'],
            },
          }),
        );
      });
    });

    describe('updateRole', () => {
      it('calls PUT /rbac/role with body', async () => {
        const plugin = rbacClient();
        const actions = plugin.getActions(mockFetch);
        await actions.rbac.updateRole({ roleId: '123', name: 'new-name' });

        expect(mockFetch).toHaveBeenCalledWith(
          '/rbac/role',
          expect.objectContaining({
            method: 'PUT',
            body: { roleId: '123', name: 'new-name' },
          }),
        );
      });

      it('includes roleId in body with other fields', async () => {
        const plugin = rbacClient();
        const actions = plugin.getActions(mockFetch);
        await actions.rbac.updateRole({
          roleId: '123',
          name: 'new-name',
          description: 'new-description',
          permissionIds: ['perm-1'],
        });

        expect(mockFetch).toHaveBeenCalledWith(
          '/rbac/role',
          expect.objectContaining({
            method: 'PUT',
            body: {
              roleId: '123',
              name: 'new-name',
              description: 'new-description',
              permissionIds: ['perm-1'],
            },
          }),
        );
      });
    });

    describe('deleteRole', () => {
      it('calls DELETE /rbac/role with body', async () => {
        const plugin = rbacClient();
        const actions = plugin.getActions(mockFetch);
        await actions.rbac.deleteRole({ roleId: '123' });

        expect(mockFetch).toHaveBeenCalledWith(
          '/rbac/role',
          expect.objectContaining({
            method: 'DELETE',
            body: { roleId: '123' },
          }),
        );
      });
    });

    describe('listPermissions', () => {
      it('calls GET /rbac/permissions without query params', async () => {
        const plugin = rbacClient();
        const actions = plugin.getActions(mockFetch);
        await actions.rbac.listPermissions();

        expect(mockFetch).toHaveBeenCalledWith(
          '/rbac/permissions',
          expect.objectContaining({
            method: 'GET',
          }),
        );
      });

      it('calls GET /rbac/permissions with pagination query params', async () => {
        const plugin = rbacClient();
        const actions = plugin.getActions(mockFetch);
        await actions.rbac.listPermissions({ limit: 20, offset: 10 });

        expect(mockFetch).toHaveBeenCalledWith(
          '/rbac/permissions?limit=20&offset=10',
          expect.objectContaining({
            method: 'GET',
          }),
        );
      });
    });

    describe('listRolePermissions', () => {
      it('calls GET /rbac/role-permissions with roleId query', async () => {
        const plugin = rbacClient();
        const actions = plugin.getActions(mockFetch);
        await actions.rbac.listRolePermissions({ roleId: '123' });

        expect(mockFetch).toHaveBeenCalledWith(
          '/rbac/role-permissions?roleId=123',
          expect.objectContaining({
            method: 'GET',
          }),
        );
      });
    });

    describe('assignPermission', () => {
      it('calls POST /rbac/role-permissions/assign with body', async () => {
        const plugin = rbacClient();
        const actions = plugin.getActions(mockFetch);
        await actions.rbac.assignPermission({ roleId: '123', permissionId: '456' });

        expect(mockFetch).toHaveBeenCalledWith(
          '/rbac/role-permissions/assign',
          expect.objectContaining({
            method: 'POST',
            body: { roleId: '123', permissionId: '456' },
          }),
        );
      });
    });

    describe('removePermission', () => {
      it('calls POST /rbac/role-permissions/remove with body', async () => {
        const plugin = rbacClient();
        const actions = plugin.getActions(mockFetch);
        await actions.rbac.removePermission({ roleId: '123', permissionId: '456' });

        expect(mockFetch).toHaveBeenCalledWith(
          '/rbac/role-permissions/remove',
          expect.objectContaining({
            method: 'POST',
            body: { roleId: '123', permissionId: '456' },
          }),
        );
      });
    });

    describe('checkPermission', () => {
      it('calls POST /rbac/check-permission with single permission', async () => {
        const plugin = rbacClient();
        const actions = plugin.getActions(mockFetch);
        await actions.rbac.checkPermission({ permission: 'users:read' });

        expect(mockFetch).toHaveBeenCalledWith(
          '/rbac/check-permission',
          expect.objectContaining({
            method: 'POST',
            body: { permission: 'users:read' },
          }),
        );
      });

      it('calls POST /rbac/check-permission with multiple permissions', async () => {
        const plugin = rbacClient();
        const actions = plugin.getActions(mockFetch);
        await actions.rbac.checkPermission({
          permission: ['users:read', 'users:write'],
        });

        expect(mockFetch).toHaveBeenCalledWith(
          '/rbac/check-permission',
          expect.objectContaining({
            method: 'POST',
            body: { permission: ['users:read', 'users:write'] },
          }),
        );
      });
    });

    describe('getUserPermissions', () => {
      it('calls GET /rbac/user-permissions', async () => {
        const plugin = rbacClient();
        const actions = plugin.getActions(mockFetch);
        await actions.rbac.getUserPermissions();

        expect(mockFetch).toHaveBeenCalledWith(
          '/rbac/user-permissions',
          expect.objectContaining({
            method: 'GET',
          }),
        );
      });

      it('passes fetch options', async () => {
        const plugin = rbacClient();
        const actions = plugin.getActions(mockFetch);
        await actions.rbac.getUserPermissions({ headers: { 'X-Custom': 'header' } });

        expect(mockFetch).toHaveBeenCalledWith(
          '/rbac/user-permissions',
          expect.objectContaining({
            method: 'GET',
            headers: { 'X-Custom': 'header' },
          }),
        );
      });
    });
  });

  describe('buildQueryString helper (tested via listRoles)', () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
      mockFetch.mockClear();
      mockFetch.mockResolvedValue({ data: {}, error: null });
    });

    it('returns empty string for undefined query', async () => {
      const plugin = rbacClient();
      const actions = plugin.getActions(mockFetch);
      await actions.rbac.listRoles(undefined);

      expect(mockFetch).toHaveBeenCalledWith(
        '/rbac/roles',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('returns empty string for empty object', async () => {
      const plugin = rbacClient();
      const actions = plugin.getActions(mockFetch);
      await actions.rbac.listRoles({});

      expect(mockFetch).toHaveBeenCalledWith(
        '/rbac/roles',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('builds correct query string with limit only', async () => {
      const plugin = rbacClient();
      const actions = plugin.getActions(mockFetch);
      await actions.rbac.listRoles({ limit: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        '/rbac/roles?limit=10',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('builds correct query string with offset only', async () => {
      const plugin = rbacClient();
      const actions = plugin.getActions(mockFetch);
      await actions.rbac.listRoles({ offset: 5 });

      expect(mockFetch).toHaveBeenCalledWith(
        '/rbac/roles?offset=5',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('builds correct query string with sortBy only', async () => {
      const plugin = rbacClient();
      const actions = plugin.getActions(mockFetch);
      await actions.rbac.listRoles({ sortBy: 'name' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/rbac/roles?sortBy=name',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('builds correct query string with sortDirection only', async () => {
      const plugin = rbacClient();
      const actions = plugin.getActions(mockFetch);
      await actions.rbac.listRoles({ sortDirection: 'desc' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/rbac/roles?sortDirection=desc',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('builds correct query string with all params', async () => {
      const plugin = rbacClient();
      const actions = plugin.getActions(mockFetch);
      await actions.rbac.listRoles({
        limit: 10,
        offset: 5,
        sortBy: 'name',
        sortDirection: 'asc',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/rbac/roles?limit=10&offset=5&sortBy=name&sortDirection=asc',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('handles zero values for limit and offset', async () => {
      const plugin = rbacClient();
      const actions = plugin.getActions(mockFetch);
      await actions.rbac.listRoles({ limit: 0, offset: 0 });

      expect(mockFetch).toHaveBeenCalledWith(
        '/rbac/roles?limit=0&offset=0',
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });

  describe('return values', () => {
    it('returns the result from $fetch', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        data: { roles: [{ id: '1', name: 'admin' }] },
        error: null,
      });

      const plugin = rbacClient();
      const actions = plugin.getActions(mockFetch);
      const result = await actions.rbac.listRoles();

      expect(result).toEqual({
        data: { roles: [{ id: '1', name: 'admin' }] },
        error: null,
      });
    });

    it('returns error from $fetch', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Unauthorized' },
      });

      const plugin = rbacClient();
      const actions = plugin.getActions(mockFetch);
      const result = await actions.rbac.checkPermission({
        permission: 'users:read',
      });

      expect(result).toEqual({
        data: null,
        error: { message: 'Unauthorized' },
      });
    });
  });
});

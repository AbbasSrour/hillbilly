/**
 * E2E Tests for RBAC Plugin
 *
 * These tests simulate complete user flows from start to finish,
 * testing the full lifecycle of RBAC operations.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkPermissionHandler } from '../src/endpoints/check-permission';
import {
  assignPermissionHandler,
  listPermissionsHandler,
  removePermissionHandler,
} from '../src/endpoints/permissions';
import {
  createRoleHandler,
  deleteRoleHandler,
  listRolesHandler,
  updateRoleHandler,
} from '../src/endpoints/roles';
import { syncHandler } from '../src/endpoints/sync';
import { userPermissionsHandler } from '../src/endpoints/user-permissions';
import type { RBACPluginConfig } from '../src/types/config';
import {
  type AdapterArgs,
  type MockAdapter,
  createMockAdapter,
  createMockContext,
} from './test-utils';

/**
 * Simulated in-memory database for E2E tests
 */
interface InMemoryDB {
  roles: Map<string, { id: string; name: string; description?: string }>;
  permissions: Map<string, { id: string; code: string; name: string }>;
  rolePermissions: Map<string, { id: string; roleId: string; permissionId: string }>;
  users: Map<string, { id: string; email: string; role: string }>;
}

/**
 * Creates a mock adapter with in-memory database for E2E testing
 */
function createE2EMockAdapter(db: InMemoryDB): MockAdapter {
  const mockAdapter = createMockAdapter();

  mockAdapter.findOne.mockImplementation(async ({ model, where = [] }: AdapterArgs) => {
    const condition = where[0];
    if (!condition) return null;
    if (typeof condition.value !== 'string') return null;

    if (model === 'permission') {
      if (condition.field === 'code') {
        for (const [, perm] of db.permissions) {
          if (perm.code === condition.value) return perm;
        }
      } else if (condition.field === 'id') {
        return db.permissions.get(condition.value) ?? null;
      }
    }

    if (model === 'role') {
      if (condition.field === 'name') {
        for (const [, role] of db.roles) {
          if (role.name === condition.value) return role;
        }
      } else if (condition.field === 'id') {
        return db.roles.get(condition.value) ?? null;
      }
    }

    if (model === 'rolePermission') {
      for (const [, rp] of db.rolePermissions) {
        const matches = where.every((w) => {
          if (w.field === 'roleId') return rp.roleId === w.value;
          if (w.field === 'permissionId') return rp.permissionId === w.value;
          return false;
        });
        if (matches) return rp;
      }
    }

    if (model === 'user') {
      if (condition.field === 'id') {
        return db.users.get(condition.value) ?? null;
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
      if (model === 'role') {
        return Array.from(db.roles.values());
      }

      if (model === 'permission') {
        if (where?.[0]?.operator === 'in') {
          const ids = where[0].value as string[];
          return Array.from(db.permissions.values()).filter((p) => ids.includes(p.id));
        }
        return Array.from(db.permissions.values());
      }

      if (model === 'rolePermission') {
        if (where?.[0]?.operator === 'in') {
          const roleIds = where[0].value as string[];
          return Array.from(db.rolePermissions.values()).filter((rp) =>
            roleIds.includes(rp.roleId),
          );
        }
        if (where?.[0]?.field === 'roleId') {
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

    if (model === 'permission') {
      const perm = { id, ...data } as {
        id: string;
        code: string;
        name: string;
      };
      db.permissions.set(id, perm);
      return perm;
    }

    if (model === 'role') {
      const role = { id, ...data } as {
        id: string;
        name: string;
        description?: string;
      };
      db.roles.set(id, role);
      return role;
    }

    if (model === 'rolePermission') {
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
    if (model === 'role' && where[0]?.field === 'id') {
      const roleId = where[0].value;
      if (typeof roleId !== 'string') return null;
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
    if (model === 'role' && where[0]?.field === 'id') {
      const roleId = where[0].value;
      if (typeof roleId !== 'string') return { success: true };
      db.roles.delete(roleId);
      for (const [id, rp] of db.rolePermissions) {
        if (rp.roleId === roleId) {
          db.rolePermissions.delete(id);
        }
      }
    }
    return { success: true };
  });

  mockAdapter.deleteMany.mockImplementation(async ({ model, where = [] }: AdapterArgs) => {
    if (model === 'rolePermission') {
      const roleIdCondition = where.find((w) => w.field === 'roleId');
      const permIdCondition = where.find((w) => w.field === 'permissionId');

      for (const [id, rp] of db.rolePermissions) {
        const matchesRole = roleIdCondition ? rp.roleId === roleIdCondition.value : true;
        const matchesPerm = permIdCondition ? rp.permissionId === permIdCondition.value : true;

        if (matchesRole && matchesPerm) {
          db.rolePermissions.delete(id);
        }
      }
    }
    return { count: 0 };
  });

  mockAdapter.count.mockImplementation(async ({ model }: { model: string }) => {
    if (model === 'role') return db.roles.size;
    if (model === 'permission') return db.permissions.size;
    return 0;
  });

  return mockAdapter;
}

describe('E2E: Application Startup Flow', () => {
  let mockAdapter: MockAdapter;
  let staticRoles: Record<string, string[]>;
  let config: RBACPluginConfig;
  let db: InMemoryDB;

  beforeEach(() => {
    db = {
      roles: new Map(),
      permissions: new Map(),
      rolePermissions: new Map(),
      users: new Map(),
    };

    staticRoles = {};
    config = {
      permissions: [
        {
          code: 'user.view',
          name: 'View Users',
          description: 'View user list',
        },
        {
          code: 'user.create',
          name: 'Create Users',
          description: 'Create new users',
        },
        {
          code: 'user.delete',
          name: 'Delete Users',
          description: 'Delete users',
        },
        { code: 'post.view', name: 'View Posts', description: 'View posts' },
        {
          code: 'post.create',
          name: 'Create Posts',
          description: 'Create posts',
        },
        {
          code: 'post.delete',
          name: 'Delete Posts',
          description: 'Delete posts',
        },
        {
          code: 'comment.moderate',
          name: 'Moderate Comments',
          description: 'Moderate comments',
        },
      ],
    };

    mockAdapter = createE2EMockAdapter(db);

    // Seed test users
    db.users.set('admin_user', {
      id: 'admin_user',
      email: 'admin@example.com',
      role: 'admin',
    });
    db.users.set('regular_user', {
      id: 'regular_user',
      email: 'user@example.com',
      role: 'user',
    });
  });

  it('should complete full application startup: sync → verify state → user access', async () => {
    // Step 1: Application starts and calls sync
    const syncCtx = {
      context: {
        adapter: mockAdapter,
        options: {
          plugins: [
            {
              id: 'admin',
              ac: {
                admin: [
                  'user.view',
                  'user.create',
                  'user.delete',
                  'post.view',
                  'post.create',
                  'post.delete',
                ],
                user: ['post.view', 'post.create'],
              },
            },
          ],
        },
      },
      json: vi.fn((data) => data),
    };

    const syncResult = await syncHandler(syncCtx as never, config, staticRoles);

    // Verify sync completed successfully
    expect(syncResult.permissions.created).toBe(7);
    expect(syncResult.roles.created).toBe(2);
    expect(syncResult.mappings.synced).toBe(8); // 6 for admin + 2 for user

    // Step 2: Verify all permissions are in database
    const listPermsCtx = createMockContext(mockAdapter, {
      query: {},
    });
    const permsResult = await listPermissionsHandler(listPermsCtx as never);
    expect(permsResult.total).toBe(7);

    // Step 3: Verify roles are in database with correct permissions
    const listRolesCtx = createMockContext(mockAdapter, {
      query: {},
    });
    const listHandler = listRolesHandler(staticRoles);
    const rolesResult = await listHandler(listRolesCtx as never);

    expect(rolesResult.total).toBe(2);

    const adminRole = rolesResult.roles.find((r: { name: string }) => r.name === 'admin');
    const userRole = rolesResult.roles.find((r: { name: string }) => r.name === 'user');

    expect(adminRole).toBeDefined();
    expect(adminRole?.permissions).toHaveLength(6);
    expect(adminRole?.isStatic).toBe(true);

    expect(userRole).toBeDefined();
    expect(userRole?.permissions).toHaveLength(2);
    expect(userRole?.isStatic).toBe(true);

    // Step 4: Regular user checks their permissions
    const userPermsCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'regular_user', role: 'user' } },
    });
    const userPermsHandler = userPermissionsHandler();
    const userPermsResult = await userPermsHandler(userPermsCtx as never);

    expect(userPermsResult.role?.name).toBe('user');
    expect(userPermsResult.permissions.map((p) => p.code)).toContain('post.view');
    expect(userPermsResult.permissions.map((p) => p.code)).toContain('post.create');

    // Step 5: User tries to access a resource
    const checkHandler = checkPermissionHandler();

    // Can view posts
    const canViewCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'regular_user', role: 'user' } },
      body: { permission: 'post.view' },
    });
    const canViewResult = await checkHandler(canViewCtx as never);
    expect(canViewResult.hasPermission).toBe(true);

    // Cannot delete posts
    const canDeleteCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'regular_user', role: 'user' } },
      body: { permission: 'post.delete' },
    });
    const canDeleteResult = await checkHandler(canDeleteCtx as never);
    expect(canDeleteResult.hasPermission).toBe(false);
  });
});

describe('E2E: Admin Creates Custom Role Flow', () => {
  let mockAdapter: MockAdapter;
  let staticRoles: Record<string, string[]>;
  let config: RBACPluginConfig;
  let db: InMemoryDB;

  beforeEach(() => {
    db = {
      roles: new Map(),
      permissions: new Map(),
      rolePermissions: new Map(),
      users: new Map(),
    };

    staticRoles = {};
    config = {
      permissions: [
        { code: 'user.view', name: 'View Users' },
        { code: 'post.view', name: 'View Posts' },
        { code: 'post.create', name: 'Create Posts' },
        { code: 'post.delete', name: 'Delete Posts' },
        { code: 'comment.moderate', name: 'Moderate Comments' },
      ],
    };

    mockAdapter = createE2EMockAdapter(db);
  });

  it('should complete admin workflow: create role → assign permissions → verify user access', async () => {
    // Step 1: Initial sync to set up system
    const syncCtx = {
      context: {
        adapter: mockAdapter,
        options: {
          plugins: [{ id: 'admin', ac: { admin: ['user.view'] } }],
        },
      },
      json: vi.fn((data) => data),
    };
    await syncHandler(syncCtx as never, config, staticRoles);

    expect(db.permissions.size).toBe(5);

    // Step 2: Admin creates a new "moderator" role
    const createRoleCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'admin_user', role: 'admin' } },
      body: {
        name: 'moderator',
        description: 'Content Moderator - can moderate posts and comments',
      },
    });

    const createHandler = createRoleHandler(staticRoles);
    const createResult = await createHandler(createRoleCtx as never);

    expect(createResult.role.name).toBe('moderator');
    expect(createResult.role.isStatic).toBe(false);

    const moderatorRoleId = createResult.role.id;

    // Step 3: Admin assigns permissions to moderator role
    const assignHandler = assignPermissionHandler(staticRoles);

    // Find permissions
    const postViewPerm = Array.from(db.permissions.values()).find((p) => p.code === 'post.view');
    const commentModPerm = Array.from(db.permissions.values()).find(
      (p) => p.code === 'comment.moderate',
    );

    if (!postViewPerm || !commentModPerm) {
      throw new Error('Required permissions not found');
    }

    // Assign post.view
    const assignCtx1 = createMockContext(mockAdapter, {
      session: { user: { id: 'admin_user', role: 'admin' } },
      params: { roleId: moderatorRoleId, permissionId: postViewPerm.id },
    });
    await assignHandler(assignCtx1 as never);

    // Assign comment.moderate
    const assignCtx2 = createMockContext(mockAdapter, {
      session: { user: { id: 'admin_user', role: 'admin' } },
      params: { roleId: moderatorRoleId, permissionId: commentModPerm.id },
    });
    await assignHandler(assignCtx2 as never);

    // Step 4: Verify moderator role has correct permissions
    const userPermsCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'mod_user', role: 'moderator' } },
    });
    const userPermsHandler = userPermissionsHandler();
    const userPermsResult = await userPermsHandler(userPermsCtx as never);

    expect(userPermsResult.role?.name).toBe('moderator');
    expect(userPermsResult.permissions).toHaveLength(2);
    expect(userPermsResult.permissions.map((p) => p.code)).toContain('post.view');
    expect(userPermsResult.permissions.map((p) => p.code)).toContain('comment.moderate');

    // Step 5: Verify moderator can moderate comments but not delete posts
    const checkHandler = checkPermissionHandler();

    const canModerateCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'mod_user', role: 'moderator' } },
      body: { permission: 'comment.moderate' },
    });
    expect((await checkHandler(canModerateCtx as never)).hasPermission).toBe(true);

    const canDeleteCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'mod_user', role: 'moderator' } },
      body: { permission: 'post.delete' },
    });
    expect((await checkHandler(canDeleteCtx as never)).hasPermission).toBe(false);
  });
});

describe('E2E: Role Permission Management Flow', () => {
  let mockAdapter: MockAdapter;
  let staticRoles: Record<string, string[]>;
  let config: RBACPluginConfig;
  let db: InMemoryDB;

  beforeEach(() => {
    db = {
      roles: new Map(),
      permissions: new Map(),
      rolePermissions: new Map(),
      users: new Map(),
    };

    staticRoles = {};
    config = {
      permissions: [
        { code: 'post.view', name: 'View Posts' },
        { code: 'post.create', name: 'Create Posts' },
        { code: 'post.delete', name: 'Delete Posts' },
      ],
    };

    mockAdapter = createE2EMockAdapter(db);
  });

  it('should handle permission add → check → remove → check cycle', async () => {
    // Setup: sync and create dynamic role
    const syncCtx = {
      context: {
        adapter: mockAdapter,
        options: { plugins: [{ id: 'admin', ac: { admin: ['post.delete'] } }] },
      },
      json: vi.fn((data) => data),
    };
    await syncHandler(syncCtx as never, config, staticRoles);

    // Create editor role
    const createRoleCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'admin_user', role: 'admin' } },
      body: { name: 'editor' },
    });
    const createHandler = createRoleHandler(staticRoles);
    const created = await createHandler(createRoleCtx as never);
    const editorRoleId = created.role.id;

    // Get permission
    const postCreatePerm = Array.from(db.permissions.values()).find(
      (p) => p.code === 'post.create',
    );
    if (!postCreatePerm) throw new Error('Permission not found');

    const checkHandler = checkPermissionHandler();
    const assignHandler = assignPermissionHandler(staticRoles);
    const removeHandler = removePermissionHandler(staticRoles);

    // Step 1: Initially editor cannot create posts
    const checkCtx1 = createMockContext(mockAdapter, {
      session: { user: { id: 'editor_user', role: 'editor' } },
      body: { permission: 'post.create' },
    });
    expect((await checkHandler(checkCtx1 as never)).hasPermission).toBe(false);

    // Step 2: Add permission
    const assignCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'admin_user', role: 'admin' } },
      params: { roleId: editorRoleId, permissionId: postCreatePerm.id },
    });
    await assignHandler(assignCtx as never);

    // Step 3: Now editor can create posts
    const checkCtx2 = createMockContext(mockAdapter, {
      session: { user: { id: 'editor_user', role: 'editor' } },
      body: { permission: 'post.create' },
    });
    expect((await checkHandler(checkCtx2 as never)).hasPermission).toBe(true);

    // Step 4: Remove permission
    const removeCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'admin_user', role: 'admin' } },
      params: { roleId: editorRoleId, permissionId: postCreatePerm.id },
    });
    await removeHandler(removeCtx as never);

    // Step 5: Editor can no longer create posts
    const checkCtx3 = createMockContext(mockAdapter, {
      session: { user: { id: 'editor_user', role: 'editor' } },
      body: { permission: 'post.create' },
    });
    expect((await checkHandler(checkCtx3 as never)).hasPermission).toBe(false);
  });

  it('should handle role update flow with permission replacement', async () => {
    // Setup
    const syncCtx = {
      context: {
        adapter: mockAdapter,
        options: { plugins: [{ id: 'admin', ac: { admin: ['post.delete'] } }] },
      },
      json: vi.fn((data) => data),
    };
    await syncHandler(syncCtx as never, config, staticRoles);

    // Create role with initial permissions
    const postViewPerm = Array.from(db.permissions.values()).find((p) => p.code === 'post.view');
    const postCreatePerm = Array.from(db.permissions.values()).find(
      (p) => p.code === 'post.create',
    );
    if (!postViewPerm || !postCreatePerm) throw new Error('Permissions not found');

    const createRoleCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'admin_user', role: 'admin' } },
      body: {
        name: 'contributor',
        permissionIds: [postViewPerm.id],
      },
    });
    const createHandler = createRoleHandler(staticRoles);
    const created = await createHandler(createRoleCtx as never);

    // Verify initial state
    const userPermsHandler = userPermissionsHandler();
    const permsCtx1 = createMockContext(mockAdapter, {
      session: { user: { id: 'contrib_user', role: 'contributor' } },
    });
    const perms1 = await userPermsHandler(permsCtx1 as never);
    expect(perms1.permissions.map((p) => p.code)).toContain('post.view');
    expect(perms1.permissions.map((p) => p.code)).not.toContain('post.create');

    // Update role with new permissions
    const updateRoleCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'admin_user', role: 'admin' } },
      params: { roleId: created.role.id },
      body: {
        description: 'Updated contributor role',
        permissionIds: [postViewPerm.id, postCreatePerm.id],
      },
    });
    const updateHandler = updateRoleHandler(staticRoles);
    await updateHandler(updateRoleCtx as never);

    // Verify updated state
    const permsCtx2 = createMockContext(mockAdapter, {
      session: { user: { id: 'contrib_user', role: 'contributor' } },
    });
    const perms2 = await userPermsHandler(permsCtx2 as never);
    expect(perms2.permissions).toHaveLength(2);
    expect(perms2.permissions.map((p) => p.code)).toContain('post.view');
    expect(perms2.permissions.map((p) => p.code)).toContain('post.create');
  });
});

describe('E2E: Role Deletion Flow', () => {
  let mockAdapter: MockAdapter;
  let staticRoles: Record<string, string[]>;
  let config: RBACPluginConfig;
  let db: InMemoryDB;

  beforeEach(() => {
    db = {
      roles: new Map(),
      permissions: new Map(),
      rolePermissions: new Map(),
      users: new Map(),
    };

    staticRoles = {};
    config = {
      permissions: [{ code: 'post.view', name: 'View Posts' }],
    };

    mockAdapter = createE2EMockAdapter(db);
  });

  it('should delete dynamic role and cascade to role permissions', async () => {
    // Setup
    const syncCtx = {
      context: {
        adapter: mockAdapter,
        options: { plugins: [{ id: 'admin', ac: { admin: ['post.view'] } }] },
      },
      json: vi.fn((data) => data),
    };
    await syncHandler(syncCtx as never, config, staticRoles);

    // Create role
    const createRoleCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'admin_user', role: 'admin' } },
      body: { name: 'temporary' },
    });
    const createHandler = createRoleHandler(staticRoles);
    const created = await createHandler(createRoleCtx as never);
    const roleId = created.role.id;

    // Assign permission
    const perm = Array.from(db.permissions.values())[0];
    if (!perm) throw new Error('Permission not found');

    const assignCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'admin_user', role: 'admin' } },
      params: { roleId, permissionId: perm.id },
    });
    await assignPermissionHandler(staticRoles)(assignCtx as never);

    // Verify role and permissions exist
    expect(db.roles.has(roleId)).toBe(true);
    const rpCount = Array.from(db.rolePermissions.values()).filter(
      (rp) => rp.roleId === roleId,
    ).length;
    expect(rpCount).toBe(1);

    // Delete role
    const deleteCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'admin_user', role: 'admin' } },
      params: { roleId },
    });
    const deleteHandler = deleteRoleHandler(staticRoles);
    const deleteResult = await deleteHandler(deleteCtx as never);

    expect(deleteResult.success).toBe(true);

    // Verify role and its permissions are deleted
    expect(db.roles.has(roleId)).toBe(false);
    const rpCountAfter = Array.from(db.rolePermissions.values()).filter(
      (rp) => rp.roleId === roleId,
    ).length;
    expect(rpCountAfter).toBe(0);
  });

  it('should not allow deletion of static roles', async () => {
    // Setup with static role
    const syncCtx = {
      context: {
        adapter: mockAdapter,
        options: {
          plugins: [
            {
              id: 'admin',
              ac: {
                superadmin: ['post.view'],
              },
            },
          ],
        },
      },
      json: vi.fn((data) => data),
    };
    await syncHandler(syncCtx as never, config, staticRoles);

    const superadminRole = Array.from(db.roles.values()).find((r) => r.name === 'superadmin');
    if (!superadminRole) throw new Error('Superadmin role not found');

    // Try to delete static role
    const deleteCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'admin_user', role: 'admin' } },
      params: { roleId: superadminRole.id },
    });

    const deleteHandler = deleteRoleHandler(staticRoles);
    await expect(deleteHandler(deleteCtx as never)).rejects.toThrow('Cannot delete static role');

    // Verify role still exists
    expect(db.roles.has(superadminRole.id)).toBe(true);
  });
});

describe('E2E: Multiple Permission Check Flow', () => {
  let mockAdapter: MockAdapter;
  let staticRoles: Record<string, string[]>;
  let config: RBACPluginConfig;
  let db: InMemoryDB;

  beforeEach(() => {
    db = {
      roles: new Map(),
      permissions: new Map(),
      rolePermissions: new Map(),
      users: new Map(),
    };

    staticRoles = {};
    config = {
      permissions: [
        { code: 'resource.view', name: 'View Resource' },
        { code: 'resource.create', name: 'Create Resource' },
        { code: 'resource.update', name: 'Update Resource' },
        { code: 'resource.delete', name: 'Delete Resource' },
      ],
    };

    mockAdapter = createE2EMockAdapter(db);
  });

  it('should correctly check multiple permissions at once', async () => {
    // Setup with role that has partial permissions
    const syncCtx = {
      context: {
        adapter: mockAdapter,
        options: {
          plugins: [
            {
              id: 'admin',
              ac: {
                editor: ['resource.view', 'resource.create', 'resource.update'],
              },
            },
          ],
        },
      },
      json: vi.fn((data) => data),
    };
    await syncHandler(syncCtx as never, config, staticRoles);

    const checkHandler = checkPermissionHandler();

    // Check permissions user HAS
    const hasAllCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'editor_user', role: 'editor' } },
      body: { permission: ['resource.view', 'resource.create'] },
    });
    const hasAll = await checkHandler(hasAllCtx as never);
    expect(hasAll.hasPermission).toBe(true);
    expect(hasAll.checked).toEqual(['resource.view', 'resource.create']);

    // Check mix of permissions (has some, missing one)
    const hasSomeCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'editor_user', role: 'editor' } },
      body: { permission: ['resource.view', 'resource.delete'] },
    });
    const hasSome = await checkHandler(hasSomeCtx as never);
    expect(hasSome.hasPermission).toBe(false); // Missing resource.delete

    // Check all permissions user has
    const hasAllThreeCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'editor_user', role: 'editor' } },
      body: {
        permission: ['resource.view', 'resource.create', 'resource.update'],
      },
    });
    const hasAllThree = await checkHandler(hasAllThreeCtx as never);
    expect(hasAllThree.hasPermission).toBe(true);
  });
});

describe('E2E: Session Permission Flow', () => {
  let mockAdapter: MockAdapter;
  let staticRoles: Record<string, string[]>;
  let config: RBACPluginConfig;
  let db: InMemoryDB;

  /**
   * Simulates session hook handler logic for E2E testing.
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
      model: 'role',
      where: [{ field: 'name', value: userRoleName }],
    })) as { id: string; name: string } | null;

    if (!role) {
      return [];
    }

    // Get role permissions
    const rolePermissions = (await adapter.findMany({
      model: 'rolePermission',
      where: [{ field: 'roleId', operator: 'in', value: [role.id] }],
    })) as { roleId: string; permissionId: string }[];

    if (rolePermissions.length === 0) {
      return [];
    }

    const permissionIds = rolePermissions.map((rp) => rp.permissionId);
    const permissions = (await adapter.findMany({
      model: 'permission',
      where: [{ field: 'id', operator: 'in', value: permissionIds }],
    })) as { id: string; code: string }[];

    return permissions.map((p) => p.code);
  }

  beforeEach(() => {
    db = {
      roles: new Map(),
      permissions: new Map(),
      rolePermissions: new Map(),
      users: new Map(),
    };

    staticRoles = {};
    config = {
      permissions: [
        { code: 'user.view', name: 'View Users' },
        { code: 'user.create', name: 'Create Users' },
        { code: 'user.delete', name: 'Delete Users' },
        { code: 'post.view', name: 'View Posts' },
        { code: 'post.create', name: 'Create Posts' },
        { code: 'post.delete', name: 'Delete Posts' },
      ],
    };

    mockAdapter = createE2EMockAdapter(db);
  });

  it('should complete flow: create role -> assign permissions -> user session includes permissions', async () => {
    // Step 1: Sync permissions and create initial state
    const syncCtx = {
      context: {
        adapter: mockAdapter,
        options: {
          plugins: [{ id: 'admin', ac: { admin: ['user.view', 'user.create'] } }],
        },
      },
      json: vi.fn((data) => data),
    };
    await syncHandler(syncCtx as never, config, staticRoles);

    // Step 2: Create a new custom role
    const createRoleCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'admin_user', role: 'admin' } },
      body: { name: 'content_manager', description: 'Manages content' },
    });

    const createHandler = createRoleHandler(staticRoles);
    const createResult = await createHandler(createRoleCtx as never);
    const contentManagerRoleId = createResult.role.id;

    expect(createResult.role.name).toBe('content_manager');

    // Step 3: Assign permissions to the new role
    const postViewPerm = Array.from(db.permissions.values()).find((p) => p.code === 'post.view');
    const postCreatePerm = Array.from(db.permissions.values()).find(
      (p) => p.code === 'post.create',
    );

    if (!postViewPerm || !postCreatePerm) {
      throw new Error('Required permissions not found');
    }

    const assignHandler = assignPermissionHandler(staticRoles);

    const assignCtx1 = createMockContext(mockAdapter, {
      session: { user: { id: 'admin_user', role: 'admin' } },
      params: { roleId: contentManagerRoleId, permissionId: postViewPerm.id },
    });
    await assignHandler(assignCtx1 as never);

    const assignCtx2 = createMockContext(mockAdapter, {
      session: { user: { id: 'admin_user', role: 'admin' } },
      params: { roleId: contentManagerRoleId, permissionId: postCreatePerm.id },
    });
    await assignHandler(assignCtx2 as never);

    // Step 4: Simulate session hook - user session should include permissions
    const sessionPermissions = await simulateSessionHook(mockAdapter, 'content_manager');

    expect(sessionPermissions).toHaveLength(2);
    expect(sessionPermissions).toContain('post.view');
    expect(sessionPermissions).toContain('post.create');
  });

  it('should update flow: user session reflects updated permissions after role modification', async () => {
    // Step 1: Setup with initial permissions
    const syncCtx = {
      context: {
        adapter: mockAdapter,
        options: {
          plugins: [{ id: 'admin', ac: { admin: ['user.view'] } }],
        },
      },
      json: vi.fn((data) => data),
    };
    await syncHandler(syncCtx as never, config, staticRoles);

    // Step 2: Create dynamic role with one permission
    const postViewPerm = Array.from(db.permissions.values()).find((p) => p.code === 'post.view');
    if (!postViewPerm) throw new Error('Permission not found');

    const createRoleCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'admin_user', role: 'admin' } },
      body: { name: 'editor', permissionIds: [postViewPerm.id] },
    });

    const createHandler = createRoleHandler(staticRoles);
    const createResult = await createHandler(createRoleCtx as never);
    const editorRoleId = createResult.role.id;

    // Step 3: Verify initial session permissions
    let sessionPermissions = await simulateSessionHook(mockAdapter, 'editor');
    expect(sessionPermissions).toHaveLength(1);
    expect(sessionPermissions).toContain('post.view');

    // Step 4: Add more permissions
    const postCreatePerm = Array.from(db.permissions.values()).find(
      (p) => p.code === 'post.create',
    );
    const postDeletePerm = Array.from(db.permissions.values()).find(
      (p) => p.code === 'post.delete',
    );

    if (!postCreatePerm || !postDeletePerm) {
      throw new Error('Required permissions not found');
    }

    const assignHandler = assignPermissionHandler(staticRoles);

    const assignCtx1 = createMockContext(mockAdapter, {
      session: { user: { id: 'admin_user', role: 'admin' } },
      params: { roleId: editorRoleId, permissionId: postCreatePerm.id },
    });
    await assignHandler(assignCtx1 as never);

    const assignCtx2 = createMockContext(mockAdapter, {
      session: { user: { id: 'admin_user', role: 'admin' } },
      params: { roleId: editorRoleId, permissionId: postDeletePerm.id },
    });
    await assignHandler(assignCtx2 as never);

    // Step 5: Verify updated session permissions
    sessionPermissions = await simulateSessionHook(mockAdapter, 'editor');
    expect(sessionPermissions).toHaveLength(3);
    expect(sessionPermissions).toContain('post.view');
    expect(sessionPermissions).toContain('post.create');
    expect(sessionPermissions).toContain('post.delete');

    // Step 6: Remove a permission
    const removeCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'admin_user', role: 'admin' } },
      params: { roleId: editorRoleId, permissionId: postDeletePerm.id },
    });
    await removePermissionHandler(staticRoles)(removeCtx as never);

    // Step 7: Verify session reflects the removal
    sessionPermissions = await simulateSessionHook(mockAdapter, 'editor');
    expect(sessionPermissions).toHaveLength(2);
    expect(sessionPermissions).toContain('post.view');
    expect(sessionPermissions).toContain('post.create');
    expect(sessionPermissions).not.toContain('post.delete');
  });

  it('should return empty permissions for new user without role', async () => {
    // Setup: sync permissions
    const syncCtx = {
      context: {
        adapter: mockAdapter,
        options: {
          plugins: [{ id: 'admin', ac: { admin: ['user.view'] } }],
        },
      },
      json: vi.fn((data) => data),
    };
    await syncHandler(syncCtx as never, config, staticRoles);

    // User has no role (undefined)
    const sessionPermissions = await simulateSessionHook(mockAdapter, undefined);
    expect(sessionPermissions).toHaveLength(0);

    // User has a role that doesn't exist
    const nonExistentRolePermissions = await simulateSessionHook(mockAdapter, 'nonexistent_role');
    expect(nonExistentRolePermissions).toHaveLength(0);
  });

  it('should persist session permissions across multiple getSession simulations', async () => {
    // Setup: sync with static role
    const syncCtx = {
      context: {
        adapter: mockAdapter,
        options: {
          plugins: [
            {
              id: 'admin',
              ac: {
                viewer: ['post.view', 'user.view'],
              },
            },
          ],
        },
      },
      json: vi.fn((data) => data),
    };
    await syncHandler(syncCtx as never, config, staticRoles);

    // Simulate multiple session retrievals for the same user
    const session1 = await simulateSessionHook(mockAdapter, 'viewer');
    const session2 = await simulateSessionHook(mockAdapter, 'viewer');
    const session3 = await simulateSessionHook(mockAdapter, 'viewer');

    // All sessions should return the same permissions
    expect(session1).toHaveLength(2);
    expect(session2).toHaveLength(2);
    expect(session3).toHaveLength(2);

    expect(session1).toContain('post.view');
    expect(session1).toContain('user.view');
    expect(session2).toContain('post.view');
    expect(session2).toContain('user.view');
    expect(session3).toContain('post.view');
    expect(session3).toContain('user.view');

    // Verify consistency across calls
    expect(session1.sort()).toEqual(session2.sort());
    expect(session2.sort()).toEqual(session3.sort());
  });

  it('should return empty permissions for user with role that has no permissions', async () => {
    // Setup: sync permissions
    const syncCtx = {
      context: {
        adapter: mockAdapter,
        options: {
          plugins: [{ id: 'admin', ac: { admin: ['user.view'] } }],
        },
      },
      json: vi.fn((data) => data),
    };
    await syncHandler(syncCtx as never, config, staticRoles);

    // Create a role without any permissions
    const createRoleCtx = createMockContext(mockAdapter, {
      session: { user: { id: 'admin_user', role: 'admin' } },
      body: { name: 'empty_role', description: 'Role with no permissions' },
    });

    const createHandler = createRoleHandler(staticRoles);
    await createHandler(createRoleCtx as never);

    // Simulate session hook for user with empty role
    const sessionPermissions = await simulateSessionHook(mockAdapter, 'empty_role');

    expect(sessionPermissions).toHaveLength(0);
    expect(sessionPermissions).toEqual([]);
  });
});

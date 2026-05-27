import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import type { RBACPluginConfig } from '../src';
import { syncHandler } from '../src/endpoints/sync';

interface MockAdapter {
  findOne: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  deleteMany: ReturnType<typeof vi.fn>;
}

interface MockContext {
  context: {
    adapter: MockAdapter;
    options: {
      plugins: unknown[];
    };
  };
  json: ReturnType<typeof vi.fn>;
}

describe('syncHandler', () => {
  let mockAdapter: MockAdapter;
  let mockCtx: MockContext;
  let config: RBACPluginConfig;
  let staticRoles: Record<string, string[]>;

  beforeEach(() => {
    mockAdapter = {
      findOne: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    };
    mockCtx = {
      context: {
        adapter: mockAdapter,
        options: {
          plugins: [],
        },
      },
      json: vi.fn((data) => data),
    };
    config = {
      permissions: [],
    };
    staticRoles = {};
  });

  it('should sync permissions correctly when they do not exist', async () => {
    config.permissions = [
      {
        name: 'create_user',
        code: 'create_user',
        description: 'Create a new user',
      },
    ];

    // Mock permission not found
    mockAdapter.findOne.mockResolvedValue(null);
    mockAdapter.create.mockResolvedValue({ id: 'perm_1', code: 'create_user' });

    const result = await syncHandler(mockCtx as never, config, staticRoles);

    expect(mockAdapter.findOne).toHaveBeenCalledWith({
      model: 'permission',
      where: [
        {
          field: 'code',
          value: 'create_user',
        },
      ],
    });

    expect(mockAdapter.create).toHaveBeenCalledWith({
      model: 'permission',
      data: {
        code: 'create_user',
        name: 'create_user',
        description: 'Create a new user',
      },
    });

    expect(result.permissions.created).toBe(1);
    expect(result.permissions.existing).toBe(0);
  });

  it('should count existing permissions correctly', async () => {
    config.permissions = [
      {
        name: 'view_user',
        code: 'view_user',
        description: 'View a user',
      },
    ];

    // Mock permission found
    mockAdapter.findOne.mockResolvedValue({ id: 'perm_1', code: 'view_user' });

    const result = await syncHandler(mockCtx as never, config, staticRoles);

    expect(mockAdapter.create).not.toHaveBeenCalled();
    expect(result.permissions.created).toBe(0);
    expect(result.permissions.existing).toBe(1);
  });

  it('should sync static roles from admin plugin', async () => {
    // Setup admin plugin in context
    mockCtx.context.options.plugins = [
      {
        id: 'admin',
        ac: {
          admin: ['user.view'],
        },
      },
    ];

    // Mock responses
    // 1. Role lookup (admin) -> null (to trigger create)
    // 2. Permission lookup (user.view) -> found
    mockAdapter.findOne.mockImplementation(
      async ({ model, where }: { model: string; where: { value: string }[] }) => {
        if (model === 'role' && where[0] && where[0].value === 'admin') {
          return null;
        }
        if (model === 'permission' && where[0] && where[0].value === 'user.view') {
          return { id: 'perm_view', code: 'user.view' };
        }
        return null;
      },
    );

    mockAdapter.create.mockImplementation(
      async ({ model, data }: { model: string; data: Record<string, unknown> }) => {
        if (model === 'role') {
          return { id: 'role_admin', ...data };
        }
        if (model === 'rolePermission') {
          return { id: 'rp_1', ...data };
        }
        return { id: 'unknown', ...data };
      },
    );

    const result = await syncHandler(mockCtx as never, config, staticRoles);

    // Verify Role Creation
    expect(mockAdapter.create).toHaveBeenCalledWith({
      model: 'role',
      data: { name: 'admin', description: 'Static role: admin' },
    });

    // Verify existing mappings deletion
    expect(mockAdapter.deleteMany).toHaveBeenCalledWith({
      model: 'rolePermission',
      where: [{ field: 'roleId', value: 'role_admin' }],
    });

    // Verify new mapping creation
    expect(mockAdapter.create).toHaveBeenCalledWith({
      model: 'rolePermission',
      data: { roleId: 'role_admin', permissionId: 'perm_view' },
    });

    expect(result.roles.created).toBe(1);
    expect(result.mappings.synced).toBe(1);
    expect(staticRoles.admin).toEqual(['user.view']);
  });

  it('should skip mappings if permission does not exist', async () => {
    mockCtx.context.options.plugins = [
      {
        id: 'admin',
        ac: {
          editor: ['post.delete'],
        },
      },
    ];

    mockAdapter.findOne.mockImplementation(async ({ model }: { model: string }) => {
      if (model === 'role') return { id: 'role_editor', name: 'editor' };
      if (model === 'permission') return null; // Permission not found
      return null;
    });

    const result = await syncHandler(mockCtx as never, config, staticRoles);

    expect(result.roles.existing).toBe(1);
    expect(result.mappings.synced).toBe(0);
    expect(result.mappings.skipped).toBe(1);
  });

  it('should handle empty permissions config', async () => {
    config.permissions = [];

    const result = await syncHandler(mockCtx as never, config, staticRoles);

    expect(result.permissions.created).toBe(0);
    expect(result.permissions.existing).toBe(0);
    expect(mockAdapter.create).not.toHaveBeenCalled();
  });

  it('should work without admin plugin (standalone mode)', async () => {
    config.permissions = [
      {
        name: 'view_user',
        code: 'view_user',
        description: 'View a user',
      },
    ];
    mockCtx.context.options.plugins = []; // No admin plugin

    mockAdapter.findOne.mockResolvedValue(null);
    mockAdapter.create.mockResolvedValue({ id: 'perm_1', code: 'view_user' });

    const result = await syncHandler(mockCtx as never, config, staticRoles);

    expect(result.permissions.created).toBe(1);
    expect(result.roles.created).toBe(0);
    expect(result.roles.existing).toBe(0);
    // No static roles populated
    expect(Object.keys(staticRoles)).toHaveLength(0);
  });

  it('should handle multiple permissions and roles', async () => {
    config.permissions = [
      { name: 'view', code: 'user.view' },
      { name: 'create', code: 'user.create' },
    ];
    mockCtx.context.options.plugins = [
      {
        id: 'admin',
        ac: {
          admin: ['user.view', 'user.create'],
          user: ['user.view'],
        },
      },
    ];

    mockAdapter.findOne.mockImplementation(
      async ({ model }: { model: string; where: { value: string }[] }) => {
        if (model === 'permission') {
          // All permissions don't exist initially
          return null;
        }
        if (model === 'role') {
          // Roles don't exist
          return null;
        }
        return null;
      },
    );

    let roleIdCounter = 0;
    let permIdCounter = 0;
    mockAdapter.create.mockImplementation(
      async ({ model, data }: { model: string; data: Record<string, unknown> }) => {
        if (model === 'permission') {
          return { id: `perm_${++permIdCounter}`, ...data };
        }
        if (model === 'role') {
          return { id: `role_${++roleIdCounter}`, ...data };
        }
        return { id: 'rp_1', ...data };
      },
    );

    const result = await syncHandler(mockCtx as never, config, staticRoles);

    expect(result.permissions.created).toBe(2);
    expect(result.roles.created).toBe(2);
  });
});

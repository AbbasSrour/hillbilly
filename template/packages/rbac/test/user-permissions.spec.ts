import { beforeEach, describe, expect, it } from 'vite-plus/test';
import { userPermissionsHandler } from '../src/endpoints/user-permissions';
import {
  type MockAdapter,
  type MockContext,
  createMockAdapter,
  createMockContext,
} from './test-utils';

describe('User Permissions Endpoint', () => {
  let mockAdapter: MockAdapter;
  let mockCtx: MockContext;

  beforeEach(() => {
    mockAdapter = createMockAdapter();
    mockCtx = createMockContext(mockAdapter, {
      session: {
        user: {
          id: 'user_id',
          role: 'editor',
        },
      },
    });
  });

  it('should throw UNAUTHORIZED if no session', async () => {
    mockCtx.context.session = null;
    const handler = userPermissionsHandler();

    await expect(handler(mockCtx as never)).rejects.toThrow('Session required');
  });

  it('should return role and permissions', async () => {
    const handler = userPermissionsHandler();

    // Mock finding role
    mockAdapter.findOne.mockResolvedValue({
      id: 'role_editor',
      name: 'editor',
    });

    // Mock finding permissions
    mockAdapter.findMany.mockImplementation(async ({ model }) => {
      if (model === 'rolePermission') {
        return [
          { roleId: 'role_editor', permissionId: 'perm_1' },
          { roleId: 'role_editor', permissionId: 'perm_2' },
        ];
      }
      if (model === 'permission') {
        return [
          { id: 'perm_1', code: 'p1', name: 'Perm 1' },
          { id: 'perm_2', code: 'p2', name: 'Perm 2' },
        ];
      }
      return [];
    });

    const result = await handler(mockCtx as never);

    expect(result.role).toEqual({ id: 'role_editor', name: 'editor' });
    expect(result.permissions).toHaveLength(2);
    expect(result.permissions[0].code).toBe('p1');
    expect(result.permissions[1].code).toBe('p2');
  });

  it('should return empty permissions if role not found', async () => {
    const handler = userPermissionsHandler();

    mockAdapter.findOne.mockResolvedValue(null);

    const result = await handler(mockCtx as never);

    expect(result.role).toBeNull();
    expect(result.permissions).toEqual([]);
  });

  it('should return empty permissions if role has no permissions', async () => {
    const handler = userPermissionsHandler();

    mockAdapter.findOne.mockResolvedValue({ id: 'role_empty', name: 'empty' });
    mockAdapter.findMany.mockResolvedValue([]);

    const result = await handler(mockCtx as never);

    expect(result.role).toEqual({ id: 'role_empty', name: 'empty' });
    expect(result.permissions).toEqual([]);
  });

  it('should return null role for user without role assigned', async () => {
    mockCtx.context.session = {
      user: {
        id: 'user_id',
        role: '', // Empty role
      },
    };
    const handler = userPermissionsHandler();

    const result = await handler(mockCtx as never);

    expect(result.role).toBeNull();
    expect(result.permissions).toEqual([]);
  });
});

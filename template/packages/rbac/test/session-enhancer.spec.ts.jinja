import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { getSessionPermissions } from '../src/utils/session-enhancer';
import { type MockAdapter, createMockAdapter } from './test-utils';

/**
 * Mock context for session enhancer testing.
 * Uses `unknown` casting to satisfy TypeScript while testing with mock adapters.
 */
interface MockSessionContext {
  context: {
    adapter: MockAdapter;
    logger?: {
      error: ReturnType<typeof vi.fn>;
    };
  };
}

describe('getSessionPermissions', () => {
  let mockAdapter: MockAdapter;
  let mockContext: MockSessionContext;

  beforeEach(() => {
    mockAdapter = createMockAdapter();
    mockContext = {
      context: {
        adapter: mockAdapter,
      },
    };
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('edge cases - invalid user input', () => {
    it('should return empty array for null user', async () => {
      const result = await getSessionPermissions(
        mockContext as unknown as Parameters<typeof getSessionPermissions>[0],
        null,
      );

      expect(result).toEqual([]);
      expect(mockAdapter.findOne).not.toHaveBeenCalled();
    });

    it('should return empty array for undefined user', async () => {
      const result = await getSessionPermissions(
        mockContext as unknown as Parameters<typeof getSessionPermissions>[0],
        undefined,
      );

      expect(result).toEqual([]);
      expect(mockAdapter.findOne).not.toHaveBeenCalled();
    });

    it('should return empty array for user without role property', async () => {
      const result = await getSessionPermissions(
        mockContext as unknown as Parameters<typeof getSessionPermissions>[0],
        { id: 'user_1' },
      );

      expect(result).toEqual([]);
      expect(mockAdapter.findOne).not.toHaveBeenCalled();
    });

    it('should return empty array for user with undefined role', async () => {
      const result = await getSessionPermissions(
        mockContext as unknown as Parameters<typeof getSessionPermissions>[0],
        { role: undefined },
      );

      expect(result).toEqual([]);
      expect(mockAdapter.findOne).not.toHaveBeenCalled();
    });
  });

  describe('edge cases - invalid role values', () => {
    it('should return empty array for empty string role', async () => {
      const result = await getSessionPermissions(
        mockContext as unknown as Parameters<typeof getSessionPermissions>[0],
        { role: '' },
      );

      expect(result).toEqual([]);
      expect(mockAdapter.findOne).not.toHaveBeenCalled();
    });

    it('should return empty array for whitespace-only role', async () => {
      const result = await getSessionPermissions(
        mockContext as unknown as Parameters<typeof getSessionPermissions>[0],
        { role: '   ' },
      );

      expect(result).toEqual([]);
      expect(mockAdapter.findOne).not.toHaveBeenCalled();
    });

    it('should return empty array for tab-only role', async () => {
      const result = await getSessionPermissions(
        mockContext as unknown as Parameters<typeof getSessionPermissions>[0],
        { role: '\t\t' },
      );

      expect(result).toEqual([]);
      expect(mockAdapter.findOne).not.toHaveBeenCalled();
    });

    it('should return empty array for newline-only role', async () => {
      const result = await getSessionPermissions(
        mockContext as unknown as Parameters<typeof getSessionPermissions>[0],
        { role: '\n\n' },
      );

      expect(result).toEqual([]);
      expect(mockAdapter.findOne).not.toHaveBeenCalled();
    });
  });

  describe('successful permission fetching', () => {
    it('should use role model name from plugin config', async () => {
      mockAdapter.findOne.mockResolvedValueOnce({
        id: 'role_admin',
        name: 'admin',
      });

      mockAdapter.findMany
        .mockResolvedValueOnce([
          { roleId: 'role_admin', permissionId: 'perm_1' },
          { roleId: 'role_admin', permissionId: 'perm_2' },
        ])
        .mockResolvedValueOnce([
          { id: 'perm_1', code: 'user.view' },
          { id: 'perm_2', code: 'user.create' },
        ]);

      await getSessionPermissions(
        mockContext as unknown as Parameters<typeof getSessionPermissions>[0],
        { role: 'admin' },
        { schema: { role: { modelName: 'roles' } } } as Parameters<typeof getSessionPermissions>[2],
      );

      expect(mockAdapter.findOne).toHaveBeenCalledWith({
        model: 'roles',
        where: [{ field: 'name', value: 'admin' }],
      });
    });

    it('should return permission codes for user with valid role', async () => {
      mockAdapter.findOne.mockResolvedValueOnce({
        id: 'role_admin',
        name: 'admin',
      });

      mockAdapter.findMany
        // rolePermission query
        .mockResolvedValueOnce([
          { roleId: 'role_admin', permissionId: 'perm_1' },
          { roleId: 'role_admin', permissionId: 'perm_2' },
        ])
        // permission query
        .mockResolvedValueOnce([
          { id: 'perm_1', code: 'user.view' },
          { id: 'perm_2', code: 'user.create' },
        ]);

      const result = await getSessionPermissions(
        mockContext as unknown as Parameters<typeof getSessionPermissions>[0],
        { role: 'admin' },
      );

      expect(result).toEqual(['user.view', 'user.create']);
      expect(mockAdapter.findOne).toHaveBeenCalledWith({
        model: 'role',
        where: [{ field: 'name', value: 'admin' }],
      });
    });

    it('should handle role with whitespace padding (trimmed for validation only)', async () => {
      // Note: The role is validated by trimming, but the actual query uses the original value
      // This test verifies the role passes validation when it has content after trimming
      mockAdapter.findOne.mockResolvedValueOnce({
        id: 'role_admin',
        name: 'admin',
      });

      mockAdapter.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      await getSessionPermissions(
        mockContext as unknown as Parameters<typeof getSessionPermissions>[0],
        { role: '  admin  ' },
      );

      // The role with spaces passes validation but query uses original value
      expect(mockAdapter.findOne).toHaveBeenCalledWith({
        model: 'role',
        where: [{ field: 'name', value: '  admin  ' }],
      });
    });

    it('should return empty array when role not found in database', async () => {
      mockAdapter.findOne.mockResolvedValueOnce(null);

      const result = await getSessionPermissions(
        mockContext as unknown as Parameters<typeof getSessionPermissions>[0],
        { role: 'nonexistent' },
      );

      expect(result).toEqual([]);
      expect(mockAdapter.findOne).toHaveBeenCalledWith({
        model: 'role',
        where: [{ field: 'name', value: 'nonexistent' }],
      });
    });

    it('should return empty array when role has no permissions', async () => {
      mockAdapter.findOne.mockResolvedValueOnce({
        id: 'role_guest',
        name: 'guest',
      });

      // getRolePermissions returns empty when no rolePermissions found
      mockAdapter.findMany.mockResolvedValueOnce([]);

      const result = await getSessionPermissions(
        mockContext as unknown as Parameters<typeof getSessionPermissions>[0],
        { role: 'guest' },
      );

      expect(result).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should return empty array and log error on database failure', async () => {
      mockAdapter.findOne.mockRejectedValueOnce(new Error('Database connection failed'));

      const result = await getSessionPermissions(
        mockContext as unknown as Parameters<typeof getSessionPermissions>[0],
        { role: 'admin' },
      );

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        '[RBAC] Error fetching permissions for session:',
        expect.any(Error),
      );
    });

    it('should return empty array on permission fetch failure', async () => {
      mockAdapter.findOne.mockResolvedValueOnce({
        id: 'role_admin',
        name: 'admin',
      });

      mockAdapter.findMany.mockRejectedValueOnce(new Error('Permission query failed'));

      const result = await getSessionPermissions(
        mockContext as unknown as Parameters<typeof getSessionPermissions>[0],
        { role: 'admin' },
      );

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        '[RBAC] Error fetching permissions for session:',
        expect.any(Error),
      );
    });

    it('should use Better Auth logger when available', async () => {
      // Track console.error call count before this test
      const callCountBefore = (console.error as ReturnType<typeof vi.fn>).mock.calls.length;

      const mockLogger = { error: vi.fn() };
      const contextWithLogger: MockSessionContext = {
        context: {
          adapter: mockAdapter,
          logger: mockLogger,
        },
      };

      mockAdapter.findOne.mockRejectedValueOnce(new Error('Test error'));

      await getSessionPermissions(
        contextWithLogger as unknown as Parameters<typeof getSessionPermissions>[0],
        { role: 'admin' },
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        '[RBAC] Error fetching permissions for session:',
        expect.any(Error),
      );
      // Should not fall back to console.error when logger is available
      // Check that no NEW calls were made during this test
      const callCountAfter = (console.error as ReturnType<typeof vi.fn>).mock.calls.length;
      expect(callCountAfter).toBe(callCountBefore);
    });
  });
});

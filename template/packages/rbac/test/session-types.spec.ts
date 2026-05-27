import { describe, expect, it } from 'vite-plus/test';
import {
  type EnhancedSessionUser,
  hasPermissions,
  userHasAllPermissions,
  userHasAnyPermission,
  userHasPermission,
} from '../src/types/session';

describe('Session Type Helpers', () => {
  describe('hasPermissions', () => {
    it('should return true for user with permissions array', () => {
      const user: EnhancedSessionUser = {
        id: 'user_1',
        email: 'test@example.com',
        permissions: ['user.view', 'user.create'],
      };

      expect(hasPermissions(user)).toBe(true);
    });

    it('should return true for user with empty permissions array', () => {
      const user: EnhancedSessionUser = {
        id: 'user_2',
        email: 'test@example.com',
        permissions: [],
      };

      expect(hasPermissions(user)).toBe(true);
    });

    it('should return false for user without permissions property', () => {
      const user = {
        id: 'user_3',
        email: 'test@example.com',
      };

      expect(hasPermissions(user)).toBe(false);
    });

    it('should return false for null', () => {
      expect(hasPermissions(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(hasPermissions(undefined)).toBe(false);
    });

    it('should return false for non-object values', () => {
      expect(hasPermissions('string')).toBe(false);
      expect(hasPermissions(123)).toBe(false);
      expect(hasPermissions(true)).toBe(false);
    });

    it('should return false when permissions is not an array', () => {
      const user = {
        id: 'user_4',
        email: 'test@example.com',
        permissions: 'not-an-array',
      };

      expect(hasPermissions(user)).toBe(false);
    });

    it('should return false when permissions contains non-string values', () => {
      const user = {
        id: 'user_1',
        email: 'test@example.com',
        permissions: [1, 2, 3],
      };
      expect(hasPermissions(user)).toBe(false);
    });

    it('should return false when permissions contains mixed types', () => {
      const user = {
        id: 'user_1',
        email: 'test@example.com',
        permissions: ['valid', 123, 'also-valid'],
      };
      expect(hasPermissions(user)).toBe(false);
    });

    it('should return false when permissions contains null', () => {
      const user = {
        id: 'user_1',
        email: 'test@example.com',
        permissions: [null, 'valid'],
      };
      expect(hasPermissions(user)).toBe(false);
    });

    it('should return false when permissions contains objects', () => {
      const user = {
        id: 'user_1',
        email: 'test@example.com',
        permissions: [{ code: 'perm' }],
      };
      expect(hasPermissions(user)).toBe(false);
    });
  });

  describe('userHasPermission', () => {
    it('should return true when user has the permission', () => {
      const user: EnhancedSessionUser = {
        id: 'user_1',
        email: 'test@example.com',
        permissions: ['user.view', 'user.create', 'user.delete'],
      };

      expect(userHasPermission(user, 'user.view')).toBe(true);
      expect(userHasPermission(user, 'user.create')).toBe(true);
      expect(userHasPermission(user, 'user.delete')).toBe(true);
    });

    it('should return false when user does not have the permission', () => {
      const user: EnhancedSessionUser = {
        id: 'user_2',
        email: 'test@example.com',
        permissions: ['user.view'],
      };

      expect(userHasPermission(user, 'user.create')).toBe(false);
      expect(userHasPermission(user, 'admin.access')).toBe(false);
    });

    it('should return false for null user', () => {
      expect(userHasPermission(null, 'user.view')).toBe(false);
    });

    it('should return false for undefined user', () => {
      expect(userHasPermission(undefined, 'user.view')).toBe(false);
    });

    it('should return false for user without permissions property', () => {
      const user = {
        id: 'user_3',
        email: 'test@example.com',
      } as EnhancedSessionUser;

      expect(userHasPermission(user, 'user.view')).toBe(false);
    });

    it('should return false for user with empty permissions array', () => {
      const user: EnhancedSessionUser = {
        id: 'user_4',
        email: 'test@example.com',
        permissions: [],
      };

      expect(userHasPermission(user, 'user.view')).toBe(false);
    });

    it('should be case-sensitive for permission checks', () => {
      const user: EnhancedSessionUser = {
        id: 'user_5',
        email: 'test@example.com',
        permissions: ['User.View'],
      };

      expect(userHasPermission(user, 'User.View')).toBe(true);
      expect(userHasPermission(user, 'user.view')).toBe(false);
    });
  });

  describe('userHasAllPermissions', () => {
    it('should return true when user has all permissions', () => {
      const user: EnhancedSessionUser = {
        id: 'user_1',
        email: 'test@example.com',
        permissions: ['user.view', 'user.create', 'user.delete', 'user.update'],
      };

      expect(userHasAllPermissions(user, ['user.view', 'user.create'])).toBe(true);
      expect(
        userHasAllPermissions(user, ['user.view', 'user.create', 'user.delete', 'user.update']),
      ).toBe(true);
    });

    it('should return true for empty permissions array check', () => {
      const user: EnhancedSessionUser = {
        id: 'user_2',
        email: 'test@example.com',
        permissions: ['user.view'],
      };

      expect(userHasAllPermissions(user, [])).toBe(true);
    });

    it('should return false when user is missing one permission', () => {
      const user: EnhancedSessionUser = {
        id: 'user_3',
        email: 'test@example.com',
        permissions: ['user.view', 'user.create'],
      };

      expect(userHasAllPermissions(user, ['user.view', 'user.create', 'user.delete'])).toBe(false);
    });

    it('should return false when user has none of the permissions', () => {
      const user: EnhancedSessionUser = {
        id: 'user_4',
        email: 'test@example.com',
        permissions: ['user.view'],
      };

      expect(userHasAllPermissions(user, ['admin.access', 'admin.delete'])).toBe(false);
    });

    it('should return false for null user', () => {
      expect(userHasAllPermissions(null, ['user.view'])).toBe(false);
    });

    it('should return false for undefined user', () => {
      expect(userHasAllPermissions(undefined, ['user.view'])).toBe(false);
    });

    it('should return false for user without permissions property', () => {
      const user = {
        id: 'user_5',
        email: 'test@example.com',
      } as EnhancedSessionUser;

      expect(userHasAllPermissions(user, ['user.view'])).toBe(false);
    });
  });

  describe('userHasAnyPermission', () => {
    it('should return true when user has at least one permission', () => {
      const user: EnhancedSessionUser = {
        id: 'user_1',
        email: 'test@example.com',
        permissions: ['user.view'],
      };

      expect(userHasAnyPermission(user, ['user.view', 'user.create', 'user.delete'])).toBe(true);
    });

    it('should return true when user has multiple matching permissions', () => {
      const user: EnhancedSessionUser = {
        id: 'user_2',
        email: 'test@example.com',
        permissions: ['user.view', 'user.create', 'user.delete'],
      };

      expect(userHasAnyPermission(user, ['user.view', 'user.create'])).toBe(true);
    });

    it('should return false when user has none of the permissions', () => {
      const user: EnhancedSessionUser = {
        id: 'user_3',
        email: 'test@example.com',
        permissions: ['user.view'],
      };

      expect(userHasAnyPermission(user, ['admin.access', 'admin.delete'])).toBe(false);
    });

    it('should return false for empty permissions array check', () => {
      const user: EnhancedSessionUser = {
        id: 'user_4',
        email: 'test@example.com',
        permissions: ['user.view'],
      };

      expect(userHasAnyPermission(user, [])).toBe(false);
    });

    it('should return false for null user', () => {
      expect(userHasAnyPermission(null, ['user.view'])).toBe(false);
    });

    it('should return false for undefined user', () => {
      expect(userHasAnyPermission(undefined, ['user.view'])).toBe(false);
    });

    it('should return false for user without permissions property', () => {
      const user = {
        id: 'user_5',
        email: 'test@example.com',
      } as EnhancedSessionUser;

      expect(userHasAnyPermission(user, ['user.view'])).toBe(false);
    });

    it('should return false for user with empty permissions array', () => {
      const user: EnhancedSessionUser = {
        id: 'user_6',
        email: 'test@example.com',
        permissions: [],
      };

      expect(userHasAnyPermission(user, ['user.view', 'user.create'])).toBe(false);
    });
  });
});

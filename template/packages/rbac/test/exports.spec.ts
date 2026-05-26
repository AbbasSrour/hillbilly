import { describe, expect, it } from 'vitest';
import { adminPluginPermissions, isStaticRole, schema } from '../src';
import { rbac } from '../src/server';
import { rbacClient } from '../src/client';

describe('RBAC Exports', () => {
  it('should export rbac function', () => {
    expect(rbac).toBeDefined();
    expect(typeof rbac).toBe('function');
  });

  it('should export rbacClient function', () => {
    expect(rbacClient).toBeDefined();
    expect(typeof rbacClient).toBe('function');

    // Test that it returns a valid client plugin structure
    const client = rbacClient();
    expect(client.id).toBe('rbac');
    expect(client.$InferServerPlugin).toBeDefined();
    expect(client.getActions).toBeDefined();
    expect(typeof client.getActions).toBe('function');
  });

  it('should export schema object', () => {
    expect(schema).toBeDefined();
    expect(typeof schema).toBe('object');
    expect(schema).toHaveProperty('role');
    expect(schema).toHaveProperty('permission');
    expect(schema).toHaveProperty('rolePermission');
  });

  it('should export adminPluginPermissions array', () => {
    expect(adminPluginPermissions).toBeDefined();
    expect(Array.isArray(adminPluginPermissions)).toBe(true);
    expect(adminPluginPermissions.length).toBeGreaterThan(0);
  });

  it('should export isStaticRole function', () => {
    expect(isStaticRole).toBeDefined();
    expect(typeof isStaticRole).toBe('function');
  });
});

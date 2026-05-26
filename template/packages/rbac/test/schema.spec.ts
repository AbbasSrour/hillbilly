import { describe, expect, it } from 'vitest';
import { baseSchema, buildSchema, schema } from '../src/schema';
import type { RBACSchemaConfig } from '../src/types/schema';

// Helper type for field access
type FieldDef = Record<string, unknown>;
type TableDef = { fields: Record<string, FieldDef>; modelName?: string };

describe('RBAC Schema', () => {
  it('should have the correct tables defined', () => {
    expect(schema).toHaveProperty('role');
    expect(schema).toHaveProperty('permission');
    expect(schema).toHaveProperty('rolePermission');
  });

  describe('role table', () => {
    const roleTable = schema.role as NonNullable<typeof schema.role>;

    it('should have correct fields', () => {
      const roleFields = roleTable.fields;
      expect(roleFields).toHaveProperty('name');
      expect(roleFields).toHaveProperty('description');
    });

    it('should have unique name', () => {
      expect(roleTable.fields.name.unique).toBe(true);
    });
  });

  describe('permission table', () => {
    const permissionTable = schema.permission as NonNullable<typeof schema.permission>;

    it('should have correct fields', () => {
      const permissionFields = permissionTable.fields;
      expect(permissionFields).toHaveProperty('name');
      expect(permissionFields).toHaveProperty('code');
      expect(permissionFields).toHaveProperty('description');
    });

    it('should have unique code', () => {
      expect(permissionTable.fields.code.unique).toBe(true);
    });
  });

  describe('rolePermission junction table', () => {
    const rpTable = schema.rolePermission as NonNullable<typeof schema.rolePermission>;

    it('should have correct fields', () => {
      const rpFields = rpTable.fields;
      expect(rpFields).toHaveProperty('roleId');
      expect(rpFields).toHaveProperty('permissionId');
    });

    it('should reference role table with cascade delete', () => {
      const roleId = rpTable.fields.roleId;
      expect(roleId.references).toEqual({
        model: 'role',
        field: 'id',
        onDelete: 'cascade',
      });
    });

    it('should reference permission table with cascade delete', () => {
      const permissionId = rpTable.fields.permissionId;
      expect(permissionId.references).toEqual({
        model: 'permission',
        field: 'id',
        onDelete: 'cascade',
      });
    });
  });
});

describe('buildSchema', () => {
  it('should return base schema when no config is provided', () => {
    const result = buildSchema();
    expect(result).toEqual(baseSchema);
  });

  it('should return base schema when empty config is provided', () => {
    const result = buildSchema({});
    expect(result).toEqual(baseSchema);
  });

  describe('modelName customization', () => {
    it('should set custom modelName for role table', () => {
      const config: RBACSchemaConfig = {
        role: { modelName: 'roles' },
      };
      const result = buildSchema(config);
      const roleTable = result?.role as TableDef;
      expect(roleTable.modelName).toBe('roles');
    });

    it('should set custom modelName for permission table', () => {
      const config: RBACSchemaConfig = {
        permission: { modelName: 'permissions' },
      };
      const result = buildSchema(config);
      const permissionTable = result?.permission as TableDef;
      expect(permissionTable.modelName).toBe('permissions');
    });

    it('should set custom modelName for rolePermission table', () => {
      const config: RBACSchemaConfig = {
        rolePermission: { modelName: 'role_permissions' },
      };
      const result = buildSchema(config);
      const rpTable = result?.rolePermission as TableDef;
      expect(rpTable.modelName).toBe('role_permissions');
    });
  });

  describe('additionalFields customization', () => {
    it('should add additional fields to role table', () => {
      const config: RBACSchemaConfig = {
        role: {
          additionalFields: {
            color: { type: 'string', required: false },
            priority: { type: 'number', defaultValue: 0 },
          },
        },
      };
      const result = buildSchema(config);
      const roleTable = result?.role as TableDef;
      const roleFields = roleTable.fields;

      // Original fields should still exist
      expect(roleFields).toHaveProperty('name');
      expect(roleFields).toHaveProperty('description');

      // Additional fields should be added
      expect(roleFields).toHaveProperty('color');
      expect(roleFields).toHaveProperty('priority');

      const colorField = roleFields.color as FieldDef;
      const priorityField = roleFields.priority as FieldDef;

      expect(colorField.type).toBe('string');
      expect(colorField.required).toBe(false);
      expect(priorityField.type).toBe('number');
      expect(priorityField.defaultValue).toBe(0);
    });

    it('should add additional fields to permission table', () => {
      const config: RBACSchemaConfig = {
        permission: {
          additionalFields: {
            category: { type: 'string', required: true },
            isSystem: { type: 'boolean', defaultValue: false },
          },
        },
      };
      const result = buildSchema(config);
      const permissionTable = result?.permission as TableDef;
      const permissionFields = permissionTable.fields;

      // Original fields should still exist
      expect(permissionFields).toHaveProperty('name');
      expect(permissionFields).toHaveProperty('code');
      expect(permissionFields).toHaveProperty('description');

      // Additional fields should be added
      expect(permissionFields).toHaveProperty('category');
      expect(permissionFields).toHaveProperty('isSystem');

      const categoryField = permissionFields.category as FieldDef;
      const isSystemField = permissionFields.isSystem as FieldDef;

      expect(categoryField.type).toBe('string');
      expect(categoryField.required).toBe(true);
      expect(isSystemField.type).toBe('boolean');
      expect(isSystemField.defaultValue).toBe(false);
    });

    it('should add additional fields to rolePermission table', () => {
      const config: RBACSchemaConfig = {
        rolePermission: {
          additionalFields: {
            grantedBy: { type: 'string', required: false },
            expiresAt: { type: 'date' },
          },
        },
      };
      const result = buildSchema(config);
      const rpTable = result?.rolePermission as TableDef;
      const rpFields = rpTable.fields;

      // Original fields should still exist
      expect(rpFields).toHaveProperty('roleId');
      expect(rpFields).toHaveProperty('permissionId');

      // Additional fields should be added
      expect(rpFields).toHaveProperty('grantedBy');
      expect(rpFields).toHaveProperty('expiresAt');

      const grantedByField = rpFields.grantedBy as FieldDef;
      const expiresAtField = rpFields.expiresAt as FieldDef;

      expect(grantedByField.type).toBe('string');
      expect(expiresAtField.type).toBe('date');
    });

    it('should handle unique constraint on additional fields', () => {
      const config: RBACSchemaConfig = {
        role: {
          additionalFields: {
            slug: { type: 'string', required: true, unique: true },
          },
        },
      };
      const result = buildSchema(config);
      const roleTable = result?.role as TableDef;
      const slugField = roleTable.fields.slug as FieldDef;

      expect(slugField.unique).toBe(true);
      expect(slugField.required).toBe(true);
    });

    it('should handle input flag on additional fields', () => {
      const config: RBACSchemaConfig = {
        role: {
          additionalFields: {
            internalId: { type: 'string', input: false },
            displayName: { type: 'string', input: true },
          },
        },
      };
      const result = buildSchema(config);
      const roleTable = result?.role as TableDef;
      const internalIdField = roleTable.fields.internalId as FieldDef;
      const displayNameField = roleTable.fields.displayName as FieldDef;

      expect(internalIdField.input).toBe(false);
      expect(displayNameField.input).toBe(true);
    });
  });

  describe('combined customizations', () => {
    it('should handle modelName and additionalFields together', () => {
      const config: RBACSchemaConfig = {
        role: {
          modelName: 'user_roles',
          additionalFields: {
            color: { type: 'string' },
          },
        },
        permission: {
          modelName: 'system_permissions',
          additionalFields: {
            category: { type: 'string' },
          },
        },
      };
      const result = buildSchema(config);
      const roleTable = result?.role as TableDef;
      const permissionTable = result?.permission as TableDef;

      expect(roleTable.modelName).toBe('user_roles');
      expect(roleTable.fields).toHaveProperty('color');

      expect(permissionTable.modelName).toBe('system_permissions');
      expect(permissionTable.fields).toHaveProperty('category');
    });
  });

  describe('isolation', () => {
    it('should not mutate the base schema', () => {
      const originalFieldCount = Object.keys(baseSchema.role.fields).length;

      buildSchema({
        role: {
          additionalFields: {
            newField: { type: 'string' },
          },
        },
      });

      expect(Object.keys(baseSchema.role.fields).length).toBe(originalFieldCount);
      expect(baseSchema.role.fields).not.toHaveProperty('newField');
    });

    it('should create independent schema instances', () => {
      const config1: RBACSchemaConfig = {
        role: { additionalFields: { field1: { type: 'string' } } },
      };
      const config2: RBACSchemaConfig = {
        role: { additionalFields: { field2: { type: 'number' } } },
      };

      const result1 = buildSchema(config1);
      const result2 = buildSchema(config2);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      if (!result1 || !result2) return;

      const fields1 = result1.role.fields;
      const fields2 = result2.role.fields;

      expect(fields1).toHaveProperty('field1');
      expect(fields1).not.toHaveProperty('field2');

      expect(fields2).toHaveProperty('field2');
      expect(fields2).not.toHaveProperty('field1');
    });
  });
});

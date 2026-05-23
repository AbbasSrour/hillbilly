// ============================================================================
// Field Attribute Types (matching Better Auth's schema field types)
// ============================================================================

/**
 * Supported field types for additional fields
 */
export type FieldType = "string" | "number" | "boolean" | "date";

/**
 * Field attributes for defining additional fields on RBAC tables
 * Follows Better Auth's schema field definition pattern
 */
export interface FieldAttribute {
  /**
   * The type of the field
   */
  type: FieldType;
  /**
   * Whether the field is required when creating a record
   * @default false
   */
  required?: boolean;
  /**
   * Default value for the field (applied at the JavaScript layer)
   */
  defaultValue?: string | number | boolean | Date;
  /**
   * Whether this field should be accepted as input when creating/updating records
   * @default true
   */
  input?: boolean;
  /**
   * Whether the field should be unique
   * @default false
   */
  unique?: boolean;
}

/**
 * Configuration for customizing a single table in the RBAC schema
 */
export interface TableSchemaConfig {
  /**
   * Custom table name in the database
   * @example "roles" instead of "role"
   */
  modelName?: string;
  /**
   * Field name mapping (original field name -> custom column name)
   * @example { name: "title" } to store 'name' in a 'title' column
   */
  fields?: Record<string, string>;
  /**
   * Additional fields to add to the table
   * These fields will be included in API request/response payloads
   */
  additionalFields?: Record<string, FieldAttribute>;
}

/**
 * Schema configuration for the RBAC plugin
 * Allows customizing table names, field mappings, and additional fields
 */
export interface RBACSchemaConfig {
  /**
   * Configuration for the role table
   */
  role?: TableSchemaConfig;
  /**
   * Configuration for the permission table
   */
  permission?: TableSchemaConfig;
  /**
   * Configuration for the rolePermission junction table
   */
  rolePermission?: TableSchemaConfig;
}

// ============================================================================
// Base Entity Types
// ============================================================================

export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  createdAt: Date;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface UserWithRole {
  id: string;
  email: string;
  name?: string;
  role?: string; // Stored as string in user table
}

// ============================================================================
// Type Inference Utilities
// ============================================================================

/**
 * Infer TypeScript type from FieldType
 */
export type InferFieldType<T extends FieldType> = T extends "string"
  ? string
  : T extends "number"
    ? number
    : T extends "boolean"
      ? boolean
      : T extends "date"
        ? Date
        : never;

/**
 * Infer additional fields type from a TableSchemaConfig
 */
export type InferAdditionalFields<T extends TableSchemaConfig | undefined> = T extends {
  additionalFields: infer F;
}
  ? F extends Record<string, FieldAttribute>
    ? {
        [K in keyof F]: F[K]["required"] extends true
          ? InferFieldType<F[K]["type"]>
          : InferFieldType<F[K]["type"]> | undefined;
      }
    : object
  : object;

/**
 * Role type with additional fields
 */
export type RoleWithAdditionalFields<S extends RBACSchemaConfig | undefined> = Role &
  InferAdditionalFields<S extends { role: infer R } ? R : undefined>;

/**
 * Permission type with additional fields
 */
export type PermissionWithAdditionalFields<S extends RBACSchemaConfig | undefined> = Permission &
  InferAdditionalFields<S extends { permission: infer P } ? P : undefined>;

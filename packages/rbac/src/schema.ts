import type { BetterAuthPlugin } from "better-auth";
import type { FieldAttribute, RBACSchemaConfig, TableSchemaConfig } from "./types";

// ============================================================================
// Base Schema Definition
// ============================================================================

/**
 * Base schema for the RBAC plugin.
 * This is the default schema without any customizations.
 */
export const baseSchema = {
  role: {
    fields: {
      name: {
        type: "string" as const,
        required: true,
        unique: true,
      },
      description: {
        type: "string" as const,
        required: false,
      },
    },
  },
  permission: {
    fields: {
      name: {
        type: "string" as const,
        required: true,
      },
      code: {
        type: "string" as const,
        required: true,
        unique: true,
      },
      description: {
        type: "string" as const,
        required: false,
      },
    },
  },
  rolePermission: {
    fields: {
      roleId: {
        type: "string" as const,
        required: true,
        references: {
          model: "role",
          field: "id",
          onDelete: "cascade" as const,
        },
      },
      permissionId: {
        type: "string" as const,
        required: true,
        references: {
          model: "permission",
          field: "id",
          onDelete: "cascade" as const,
        },
      },
    },
  },
} satisfies BetterAuthPlugin["schema"];

// ============================================================================
// Schema Builder Types
// ============================================================================

type DBFieldType = "string" | "number" | "boolean" | "date";
type DBPrimitive = string | number | boolean | Date | null | undefined;

interface DBFieldAttributeBase {
  type: DBFieldType;
  required?: boolean;
  unique?: boolean;
  references?: {
    model: string;
    field: string;
    onDelete?: "cascade" | "set null" | "restrict" | "no action";
  };
  defaultValue?: DBPrimitive | (() => DBPrimitive);
  input?: boolean;
}

interface DBTableSchemaBase {
  fields: Record<string, DBFieldAttributeBase>;
  modelName?: string;
  disableMigration?: boolean;
}

// ============================================================================
// Schema Builder
// ============================================================================

/**
 * Convert FieldAttribute to Better Auth schema field format
 */
function convertAdditionalField(field: FieldAttribute): DBFieldAttributeBase {
  const result: DBFieldAttributeBase = {
    type: field.type,
    required: field.required ?? false,
  };

  if (field.unique) {
    result.unique = true;
  }

  if (field.defaultValue !== undefined) {
    result.defaultValue = field.defaultValue as DBPrimitive;
  }

  if (field.input !== undefined) {
    result.input = field.input;
  }

  return result;
}

/**
 * Build table schema with customizations
 */
function buildTableSchema<T extends DBTableSchemaBase>(
  baseTableSchema: T,
  tableConfig?: TableSchemaConfig,
): DBTableSchemaBase {
  if (!tableConfig) {
    return baseTableSchema;
  }

  // Deep clone the base fields
  const newFields: Record<string, DBFieldAttributeBase> = {};
  for (const [key, value] of Object.entries(baseTableSchema.fields)) {
    newFields[key] = { ...value };
  }

  const result: DBTableSchemaBase = {
    fields: newFields,
  };

  // Apply modelName if provided
  if (tableConfig.modelName) {
    result.modelName = tableConfig.modelName;
  }

  // Add additional fields if provided
  if (tableConfig.additionalFields) {
    for (const [fieldName, fieldAttr] of Object.entries(tableConfig.additionalFields)) {
      result.fields[fieldName] = convertAdditionalField(fieldAttr);
    }
  }

  return result;
}

/**
 * Build the complete RBAC schema with customizations.
 *
 * This function merges the base schema with user-provided customizations,
 * supporting:
 * - Custom table names via `modelName`
 * - Field name mappings via `fields`
 * - Additional fields via `additionalFields`
 *
 * @param schemaConfig - Optional schema configuration
 * @returns The complete schema for the RBAC plugin
 *
 * @example
 * ```typescript
 * const customSchema = buildSchema({
 *   role: {
 *     modelName: "roles",
 *     additionalFields: {
 *       color: { type: "string", required: false },
 *       priority: { type: "number", defaultValue: 0 }
 *     }
 *   }
 * });
 * ```
 */
export function buildSchema(schemaConfig?: RBACSchemaConfig): BetterAuthPlugin["schema"] {
  if (!schemaConfig) {
    return baseSchema;
  }

  const result: Record<string, DBTableSchemaBase> = {
    role: buildTableSchema(baseSchema.role, schemaConfig.role),
    permission: buildTableSchema(baseSchema.permission, schemaConfig.permission),
    rolePermission: buildTableSchema(baseSchema.rolePermission, schemaConfig.rolePermission),
  };

  return result as BetterAuthPlugin["schema"];
}

/**
 * Default schema export for backward compatibility.
 * New code should use `buildSchema()` with configuration.
 *
 * @deprecated Use `buildSchema()` instead for custom schema configurations
 */
export const schema = baseSchema;

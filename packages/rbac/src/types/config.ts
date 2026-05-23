import type { RBACSchemaConfig } from "./schema";

export interface PermissionDefinition {
  code: string;
  name: string;
  description?: string;
}

export interface RBACPluginConfig<S extends RBACSchemaConfig = RBACSchemaConfig> {
  /**
   * List of permissions to sync to the database.
   * Defaults to an empty list when omitted.
   */
  permissions?: PermissionDefinition[];

  /**
   * Whether to sync permissions and static roles on startup.
   * Defaults to true.
   */
  sync?: boolean;

  /**
   * Optional callback when a permission check is performed.
   */
  onPermissionCheck?: (data: {
    userId: string;
    permission: string;
    hasPermission: boolean;
  }) => Promise<void>;

  /**
   * Schema customization options.
   * Allows customizing table names, field mappings, and adding additional fields
   * to the role, permission, and rolePermission tables.
   *
   * @example
   * ```typescript
   * rbac({
   *   permissions: [...],
   *   schema: {
   *     role: {
   *       modelName: "roles",
   *       fields: { name: "title" },
   *       additionalFields: {
   *         color: { type: "string", required: false },
   *         priority: { type: "number", defaultValue: 0 }
   *       }
   *     }
   *   }
   * })
   * ```
   */
  schema?: S;

  /**
   * Optional MikroORM instance for querying role-permission relationships.
   *
   * This is required when using MikroORM's ManyToMany relationships between
   * roles and permissions, as the junction table is not exposed as a queryable
   * model through Better Auth's adapter interface.
   *
   * @example
   * ```typescript
   * rbac({
   *   permissions: [...],
   *   orm: mikroOrmInstance,  // Pass the same ORM instance used for the adapter
   * })
   * ```
   */
  orm?: any;
}

import type { AuthContext, BetterAuthOptions } from "better-auth";
import type { Permission, RBACPluginConfig, RBACSchemaConfig } from "../types";

/**
 * Fetches permissions for a list of role IDs
 * Returns a map of roleId -> Permission[]
 *
 * This function works with MikroORM's ManyToMany relationship between roles and permissions.
 * Since the junction table is auto-generated and not exposed as a queryable model through
 * Better Auth's adapter, we use the internal ORM instance to populate the relationship.
 */
export const getRolePermissions = async (
  ctx: { context: AuthContext<BetterAuthOptions> },
  roleIds: string[],
  pluginConfig?: RBACPluginConfig<RBACSchemaConfig>,
): Promise<Record<string, Permission[]>> => {
  if (roleIds.length === 0) return {};

  try {
    // Access the internal adapter to get the ORM instance
    // biome-ignore lint/suspicious/noExplicitAny: Adapter type doesn't expose ORM instance
    const adapter = ctx.context.adapter as any;

    const orm = pluginConfig?.orm ?? adapter.orm;

    // Check if this is the MikroORM adapter and has access to the EntityManager
    if (!orm?.em?.fork) {
      // Fallback: log warning and return empty
      const logger = ctx.context.logger;
      if (logger?.warn) {
        logger.warn("[RBAC] MikroORM instance not available in adapter");
      }
      return {};
    }

    const em = orm.em.fork();

    // Get the actual entity name from the adapter's model map
    // Default to the Better Auth model name 'role' if not mapped
    const roleEntityName =
      pluginConfig?.schema?.role?.modelName || adapter.modelMap?.role || "role";

    // Fetch roles with their permissions populated using the actual entity name
    const roles = await em.find(
      roleEntityName,
      { id: { $in: roleIds } },
      { populate: ["permissions"] },
    );

    // Build the result map
    const result: Record<string, Permission[]> = {};
    for (const role of roles) {
      const permissions = role.permissions?.getItems() || [];
      result[role.id] = permissions as Permission[];
    }

    return result;
  } catch (error) {
    const logger = ctx.context.logger;
    if (logger?.error) {
      logger.error("[RBAC] Error fetching role permissions:", error);
    }
    return {};
  }
};

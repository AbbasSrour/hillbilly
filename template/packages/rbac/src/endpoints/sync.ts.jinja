import type { AuthContext, BetterAuthOptions, EndpointContext, EndpointOptions } from 'better-auth';
import { createAuthEndpoint } from 'better-auth/api';
import type { PermissionDefinition, RBACPluginConfig, Role } from '../types';
import type { AdminPlugin } from '../types/admin-plugin';

const path = '/rbac/sync' as const;

const config = {
  method: 'POST',
} satisfies EndpointOptions;

export const syncHandler = async (
  ctx: EndpointContext<typeof path, typeof config, AuthContext<BetterAuthOptions>>,
  pluginConfig: RBACPluginConfig,
  staticRoles: Record<string, string[]>,
) => {
  const rbacConfig = pluginConfig;
  const adminPlugin = ctx.context.getPlugin('admin') as unknown as AdminPlugin | undefined;

  // Track sync stats
  let permissionsCreated = 0;
  let permissionsExisting = 0;
  let rolesCreated = 0;
  let rolesExisting = 0;
  let mappingsSynced = 0;
  let mappingsSkipped = 0;

  const permissionModelName = rbacConfig.schema?.permission?.modelName || 'permission';
  const roleModelName = rbacConfig.schema?.role?.modelName || 'role';

  const ensurePermission = async (perm: PermissionDefinition) => {
    const exists = await ctx.context.adapter.findOne({
      model: permissionModelName,
      where: [{ field: 'code', value: perm.code }],
    });

    if (!exists) {
      await ctx.context.adapter.create({
        model: permissionModelName,
        data: {
          code: perm.code,
          name: perm.name,
          description: perm.description,
        },
      });
      permissionsCreated++;
    } else {
      permissionsExisting++;
    }
  };

  const statementPermission = (resource: string, action: string): PermissionDefinition => {
    const code = `${resource}.${action}`;
    return {
      code,
      name: `${resource} ${action}`,
      description: `Allows ${action} on ${resource}.`,
    };
  };

  // Sync permissions from RBAC config
  if (rbacConfig.permissions) {
    for (const perm of rbacConfig.permissions) {
      await ensurePermission(perm);
    }
  }

  // Sync static roles from the Admin plugin
  // @ts-expect-error
  const accessControlRoles = adminPlugin?.options.roles as any;
  if (accessControlRoles) {
    Object.assign(staticRoles, accessControlRoles);
    for (const [roleName, roleData] of Object.entries(accessControlRoles)) {
      // Create or update role
      let role = (await ctx.context.adapter.findOne({
        model: roleModelName,
        where: [{ field: 'name', value: roleName }],
      })) as Role | null;

      if (!role) {
        role = (await ctx.context.adapter.create({
          model: roleModelName,
          data: {
            name: roleName,
            description: `Static role: ${roleName}`,
          },
        })) as Role;
        rolesCreated++;
      } else {
        rolesExisting++;
      }

      if (role) {
        const statements = ((roleData as any).statements as Record<string, string[]>) || {};
        const permissionCodes: string[] = [];
        const statementPermissions: PermissionDefinition[] = [];

        for (const [resource, actions] of Object.entries(statements)) {
          for (const action of actions) {
            const permission = statementPermission(resource, action);
            permissionCodes.push(permission.code);
            statementPermissions.push(permission);
          }
        }

        const uniquePermissionCodes = Array.from(new Set(permissionCodes));
        const uniqueStatementPermissions: PermissionDefinition[] = [];
        const seenPermissionCodes = new Set<string>();
        for (const perm of statementPermissions) {
          if (seenPermissionCodes.has(perm.code)) {
            continue;
          }
          seenPermissionCodes.add(perm.code);
          uniqueStatementPermissions.push(perm);
        }

        for (const perm of uniqueStatementPermissions) {
          await ensurePermission(perm);
        }

        if (uniquePermissionCodes.length > 0) {
          const orm = pluginConfig.orm;
          if (!orm) {
            mappingsSkipped += uniquePermissionCodes.length;
            continue;
          }

          const em = orm.em.fork();
          const roleEntityName = roleModelName;
          const permissionEntityName = permissionModelName;

          const roleEntity = await em.findOne(
            roleEntityName,
            { id: role.id },
            { populate: ['permissions'] },
          );

          if (!roleEntity) {
            mappingsSkipped += uniquePermissionCodes.length;
            continue;
          }

          const permissions = await em.find(permissionEntityName, {
            code: { $in: uniquePermissionCodes },
          });
          roleEntity.permissions.set(permissions as any);
          await em.flush();

          mappingsSynced += permissions.length;
          mappingsSkipped += uniquePermissionCodes.length - permissions.length;
        }
      }
    }
  }

  return ctx.json({
    permissions: {
      created: permissionsCreated,
      existing: permissionsExisting,
    },
    roles: {
      created: rolesCreated,
      existing: rolesExisting,
    },
    mappings: {
      synced: mappingsSynced,
      skipped: mappingsSkipped,
    },
  });
};

export const syncEndpoint = (
  pluginConfig: RBACPluginConfig,
  staticRoles: Record<string, string[]>,
) => {
  return createAuthEndpoint(path, config, async (ctx) =>
    syncHandler(ctx, pluginConfig, staticRoles),
  );
};

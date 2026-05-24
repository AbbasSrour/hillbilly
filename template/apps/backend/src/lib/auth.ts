/* @hillbilly-sync */
import { AccountEntity } from '@module/auth/entity/account.entity';
import { PermissionEntity } from '@module/auth/entity/permission.entity';
import { RoleEntity } from '@module/auth/entity/role.entity';
import { SessionEntity } from '@module/auth/entity/session.entity';
import { VerificationEntity } from '@module/auth/entity/verification.entity';
import { UserEntity } from '@module/user/entity/user.entity';
import { rbac } from '@hillbilly/rbac/server';
import { BetterAuthOptions, betterAuth } from 'better-auth';
import { phoneNumber } from 'better-auth/plugins';
import { admin } from 'better-auth/plugins/admin';

export const authConfig = {
  user: {
    modelName: UserEntity.name,
  },
  account: {
    modelName: AccountEntity.name,
  },
  verification: {
    modelName: VerificationEntity.name,
  },
  session: {
    modelName: SessionEntity.name,
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
  plugins: [
    admin({
      schema: {
        user: {
          modelName: UserEntity.name,
        },
        session: {
          modelName: SessionEntity.name,
        },
      },
    }),
    phoneNumber(),
    rbac({
      schema: {
        role: {
          modelName: RoleEntity.name,
        },
        permission: {
          modelName: PermissionEntity.name,
        },
      },
    }),
  ],
} satisfies BetterAuthOptions;

export const auth = betterAuth(authConfig);

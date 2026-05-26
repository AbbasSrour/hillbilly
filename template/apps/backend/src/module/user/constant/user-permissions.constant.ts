import { RoleType } from '@constant/role-type.constant';

export enum UserPermissions {
  VIEW = 'user.view',
  CREATE = 'user.create',
  UPDATE = 'user.update',
  DELETE = 'user.delete',
  BLOCK = 'user.block',
}

export const UserPermissionConfig = [
  {
    name: 'View Users',
    code: UserPermissions.VIEW,
    description: 'Users with this permission can view all users and view their details.',
    users: [RoleType.ADMIN, RoleType.USER],
  },
  {
    name: 'Create Users',
    code: UserPermissions.CREATE,
    description: 'Users with this permission can create new users.',
    users: [RoleType.ADMIN],
  },
  {
    name: 'Update Users',
    code: UserPermissions.UPDATE,
    description: 'Users with this permission can update users.',
    users: [RoleType.ADMIN],
  },
  {
    name: 'Delete Users',
    code: UserPermissions.DELETE,
    description: 'Users with this permission can delete users.',
    users: [RoleType.ADMIN],
  },
  {
    name: 'Block/Unblock Users',
    code: UserPermissions.BLOCK,
    description: 'Users with this permission can block and unblock users.',
    users: [RoleType.ADMIN],
  },
];

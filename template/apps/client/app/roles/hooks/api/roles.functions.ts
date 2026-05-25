import { userRoleTypes } from '@/app/users/constants/user-role-types.ts';
import { createIsomorphicFn } from '@tanstack/react-start';

export const listRolesFn = async () => {
  return userRoleTypes;
};

export const listRolesServerFn = createIsomorphicFn()
  .client(() => listRolesFn())
  .server(() => listRolesFn());

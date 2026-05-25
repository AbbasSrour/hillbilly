import { listRolesServerFn } from '@/app/roles/hooks/api/roles.functions.ts';
import { queryOptions } from '@tanstack/react-query';

export const rolesQueries = {
  list: () =>
    queryOptions({
      queryKey: ['roles', 'list'],
      queryFn: listRolesServerFn,
    }),
};

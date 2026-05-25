import type { User } from '@hillbilly/sdk';
import type { ColumnFiltersState } from '@tanstack/react-table';
import {
  createFilterDefinition,
  type FacetContext,
} from '@hillbilly/ui/components/data-table/utils/facets';
import { userRoleTypes } from '@/app/users/constants/user-role-types';
import type { ListUsersParams } from '@/app/users/hooks/api/users.queries';

type RoleConditions = Pick<ListUsersParams, 'role'>;

export const userRoleFilter = createFilterDefinition({
  id: 'role',
  title: 'Role',
  options: userRoleTypes,
  searchParam: 'role',
  multi: false,
  getValue: (user: User) => user.role ?? '',
  toConditions: (columnFilters: ColumnFiltersState): RoleConditions => {
    const roleFilter = columnFilters.find((filter) => filter.id === 'role')
      ?.value as string[];
    const role = Array.isArray(roleFilter) ? roleFilter?.[0] : roleFilter;
    return role ? { role } : {};
  },
  buildFacetQuery: (ctx: FacetContext<ListUsersParams, RoleConditions>) => ({
    search: ctx.searchValue,
    pageSize: 1,
    role: ctx.optionValue,
    ...ctx.conditions,
  }),
});

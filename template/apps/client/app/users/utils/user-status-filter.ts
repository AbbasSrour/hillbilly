import {
  createFilterDefinition,
  type FacetContext,
} from '@hillbilly/ui/components/data-table/utils/facets';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { userStatusType } from '@/app/users/constants/user-status-type';
import type { ListUsersParams } from '@/app/users/hooks/api/users.queries';

type UserStatusSource = {
  banned?: boolean | null;
  emailVerified?: boolean | null;
};

type StatusConditions = Pick<ListUsersParams, 'banned' | 'emailVerified'>;

export const userStatusFilter = createFilterDefinition({
  id: 'status',
  title: 'Status',
  options: userStatusType,
  searchParam: 'status',
  multi: true,
  getValue: (user: UserStatusSource) => {
    if (user.banned) {
      return 'suspended';
    }
    if (!user.emailVerified) {
      return 'invited';
    }

    return 'active';
  },
  toConditions: (columnFilters: ColumnFiltersState): StatusConditions => {
    const statusFilter = columnFilters.find((filter) => filter.id === 'status')?.value as string[];

    return (
      statusFilter?.reduce<StatusConditions>((acc, status) => {
        if (status === 'active') {
          acc.banned = false;
          acc.emailVerified = true;
        } else if (status === 'invited') {
          acc.banned = false;
          acc.emailVerified = false;
        } else if (status === 'suspended') {
          acc.banned = true;
        }

        return acc;
      }, {}) || {}
    );
  },
  buildFacetQuery: (ctx: FacetContext<ListUsersParams, StatusConditions>) => ({
    search: ctx.searchValue,
    pageSize: 1,
    role: ctx.otherFilters.role,
    ...ctx.conditions,
  }),
});

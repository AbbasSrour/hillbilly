import { Main } from '@hillbilly/ui/components/layout/main';
import { PageHeader } from '@hillbilly/ui/components/layout/page-header';
import { Button } from '@hillbilly/ui/core/button';
import { parseSortParamSingle } from '@hillbilly/ui/hooks/sort';
import { IconUserPlus } from '@tabler/icons-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { fallback } from '@tanstack/zod-adapter';
import { z } from 'zod';
import { UserInsights } from '@/app/users/components/insights/user-insights';
import { UserDataTable } from '@/app/users/components/list/user-data-table';
import { UsersListSkeleton } from '@/app/users/components/loading/users-list-skeleton';
import { userQueries } from '@/app/users/hooks/api/users.queries.ts';
import { userRoleFilter } from '@/app/users/utils/user-role-filter';
import { userStatusFilter } from '@/app/users/utils/user-status-filter';

export const Route = createFileRoute('/admin/users/')({
  pendingComponent: UsersListSkeleton,
  validateSearch: z.object({
    search: fallback(z.string(), '').default(''),
    page: fallback(z.coerce.number(), 1).default(1),
    pageSize: fallback(z.coerce.number(), 10).default(10),
    sort: z.string().optional(),
    role: z.string().optional(),
    status: z.array(z.string()).optional(),
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    const sortValue = parseSortParamSingle(deps.sort);

    const roleConditions = userRoleFilter.toConditions(
      deps.role ? [userRoleFilter.toColumnFilter([deps.role])] : [],
    );
    const statusConditions = userStatusFilter.toConditions(
      deps.status?.length ? [userStatusFilter.toColumnFilter(deps.status)] : [],
    );

    const baseListQuery = userQueries.list({
      ...deps,
      ...sortValue,
      ...roleConditions,
      ...statusConditions,
    });

    const insightQueries = userQueries.insights.all({
      search: deps.search,
    });

    const facetQueries = [
      ...userStatusFilter
        .facetQueries({
          searchValue: deps.search,
          otherFilters: roleConditions,
        })
        .map((query) => userQueries.list(query)),
      ...userRoleFilter
        .facetQueries({
          searchValue: deps.search,
          otherFilters: statusConditions,
        })
        .map((query) => userQueries.list(query)),
    ];

    await Promise.all([
      context.queryClient.ensureQueryData(baseListQuery),
      ...insightQueries.map((query) =>
        context.queryClient.ensureQueryData(query),
      ),
      ...facetQueries.map((query) =>
        context.queryClient.ensureQueryData(query),
      ),
    ]);
  },
  head: () => ({
    meta: [
      {
        title: 'Users - [[ project_name ]]',
      },
      {
        name: 'description',
        content: 'Manage system users and their information here.',
      },
      {
        property: 'og:title',
        content: 'Users - [[ project_name ]]',
      },
      {
        property: 'og:description',
        content: 'Manage system users and their information here.',
      },
    ],
  }),
  component: UserListPage,
});

function UserListPage() {
  return (
    <Main>
      <PageHeader
        title="Users List"
        description="Manage system users and their information here."
      >
        <Link to="/admin/users/create">
          <Button className="space-x-1">
            <span>Add User</span>
            <IconUserPlus size={18} />
          </Button>
        </Link>
      </PageHeader>
      <UserInsights />
      <UserDataTable />
    </Main>
  );
}

import type { User } from '@hillbilly/sdk';
import { buildFacetCountsMap } from '@hillbilly/ui/components/data-table/utils/facets';
import { useSearch } from '@hillbilly/ui/hooks/search';
import { useQueries } from '@tanstack/react-query';
import type { ColumnFiltersState, Table } from '@tanstack/react-table';
import { getFacetedUniqueValues } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { userQueries } from '@/app/users/hooks/api/users.queries';
import { userRoleFilter } from '@/app/users/utils/user-role-filter';
import { userStatusFilter } from '@/app/users/utils/user-status-filter';

type UseUserFacetsValueArgs = {
  columnFilters: ColumnFiltersState;
};

export const useUserFacetsValue = ({
  columnFilters,
}: UseUserFacetsValueArgs) => {
  const { searchValue } = useSearch();
  const statusConditions = userStatusFilter.toConditions(columnFilters);
  const roleConditions = userRoleFilter.toConditions(columnFilters);

  const facetQueries = useQueries({
    queries: [
      ...userStatusFilter
        .facetQueries({
          searchValue,
          otherFilters: roleConditions,
        })
        .map((query) => userQueries.list(query)),
      ...userRoleFilter
        .facetQueries({
          searchValue,
          otherFilters: statusConditions,
        })
        .map((query) => userQueries.list(query)),
    ],
  });

  const facetedUniqueValuesReady = facetQueries.every(
    (query) => !query.isPending,
  );

  const facetCountsMap = useMemo(
    () =>
      buildFacetCountsMap(
        [
          {
            columnId: userStatusFilter.id,
            options: userStatusFilter.options,
          },
          {
            columnId: userRoleFilter.id,
            options: userRoleFilter.options,
          },
        ],
        facetQueries,
      ),
    [facetQueries],
  );

  const getServerFacetedUniqueValues = useCallback(
    (_: Table<User>, columnId: string) => () =>
      facetCountsMap.get(columnId) ?? new Map<string, number>(),
    [facetCountsMap],
  );

  const getCoreFacetedUniqueValues = useMemo(
    () => getFacetedUniqueValues<User>(),
    [],
  );

  return useCallback(
    () =>
      facetedUniqueValuesReady
        ? getServerFacetedUniqueValues
        : getCoreFacetedUniqueValues,
    [
      facetedUniqueValuesReady,
      getServerFacetedUniqueValues,
      getCoreFacetedUniqueValues,
    ],
  );
};

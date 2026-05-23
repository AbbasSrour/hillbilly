import type { UseQueryResult } from "@tanstack/react-query";
import type { ColumnFiltersState } from "@tanstack/react-table";

type FacetQueryData = {
  meta?: {
    itemCount?: number;
  };
};

type FacetQueryResult = UseQueryResult<FacetQueryData>;

export type FacetContext<TFullType, TConditions extends Partial<TFullType>> = {
  searchValue: string;
  otherFilters: Omit<TFullType, keyof TConditions>;
  conditions: TConditions;
  optionValue: string;
};

export type FilterDefinition<
  TOption extends { value: string },
  TValue,
  TFullType,
  TConditions extends Partial<TFullType>,
  TRow,
  TQueryOptions = Record<string, unknown>,
> = {
  id: string;
  title: string;
  options: ReadonlyArray<TOption>;
  getValue: (row: TRow) => TValue;
  toConditions: (columnFilters: ColumnFiltersState) => TConditions;
  buildFacetQuery: (ctx: FacetContext<TFullType, TConditions>) => TQueryOptions;
  facetQueries?: (ctx: {
    searchValue: string;
    otherFilters: Omit<TFullType, keyof TConditions>;
  }) => Array<TQueryOptions>;
  searchParam?: string;
  multi?: boolean;
};

export type FilterDefinitionWithHelpers<
  TOption extends { value: string },
  TValue,
  TFullType,
  TConditions extends Partial<TFullType>,
  TRow,
  TQueryOptions = Record<string, unknown>,
> = FilterDefinition<TOption, TValue, TFullType, TConditions, TRow, TQueryOptions> & {
  toColumnFilter: (value: ColumnFiltersState[number]["value"]) => {
    id: string;
    value: ColumnFiltersState[number]["value"];
  };
  facetQueries: (ctx: {
    searchValue: string;
    otherFilters: Omit<TFullType, keyof TConditions>;
  }) => Array<TQueryOptions>;
};

export function createFilterDefinition<
  TOption extends { value: string },
  TValue,
  TFullType,
  TConditions extends Partial<TFullType>,
  TRow,
  TQueryOptions = Record<string, unknown>,
>(
  def: FilterDefinition<TOption, TValue, TFullType, TConditions, TRow, TQueryOptions>,
): FilterDefinitionWithHelpers<TOption, TValue, TFullType, TConditions, TRow, TQueryOptions> {
  return {
    ...def,
    toColumnFilter: (value: ColumnFiltersState[number]["value"]) => ({
      id: def.id,
      value,
    }),
    facetQueries:
      def.facetQueries ??
      ((ctx) =>
        def.options.map((option) =>
          def.buildFacetQuery({
            searchValue: ctx.searchValue,
            optionValue: option.value,
            conditions: def.toConditions([
              {
                id: def.id,
                value: [option.value],
              },
            ]),
            otherFilters: ctx.otherFilters,
          }),
        )),
  };
}

export const buildFacetCountsMap = (
  filters: ReadonlyArray<{
    columnId: string;
    options: ReadonlyArray<{ value: string }>;
  }>,
  queries: FacetQueryResult[],
) => {
  const facetCountsMap = new Map<string, Map<string, number>>();
  let offset = 0;

  for (const filter of filters) {
    const counts = new Map<string, number>();

    filter.options.forEach((option, index) => {
      const data = queries[offset + index]?.data as FacetQueryData | undefined;
      const count = data?.meta?.itemCount ?? 0;
      counts.set(option.value, count);
    });

    facetCountsMap.set(filter.columnId, counts);
    offset += filter.options.length;
  }

  return facetCountsMap;
};

export const getFilterValue = (columnFilters: ColumnFiltersState, id: string) =>
  columnFilters.find((filter) => filter.id === id)?.value as string[] | undefined;

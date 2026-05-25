import { useNavigate, useSearch as useRouterSearch } from "@tanstack/react-router";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { useCallback, useMemo, useRef, useState } from "react";
import type { FilterDefinitionWithHelpers } from "../components/data-table/utils/facets";

export const useFilters = <
  TFilterDefinitions extends ReadonlyArray<
    FilterDefinitionWithHelpers<any, any, any, any, any, any>
  >,
>(
  filterDefinitions: TFilterDefinitions,
) => {
  const navigate = useNavigate();
  const searchParams = useRouterSearch({ strict: false }) as Record<
    string,
    string | string[] | undefined
  >;

  const initialFiltersRef = useRef<ColumnFiltersState>([]);
  const hasInitializedRef = useRef(false);

  if (!hasInitializedRef.current) {
    initialFiltersRef.current = filterDefinitions.reduce<ColumnFiltersState>((acc, filter) => {
      const paramName = filter.searchParam ?? filter.id;
      const paramValue = searchParams[paramName];

      if (paramValue === undefined) {
        return acc;
      }

      const isMulti = filter.multi ?? false;

      if (isMulti) {
        const values = Array.isArray(paramValue) ? paramValue : [paramValue].filter(Boolean);
        if (values.length > 0) {
          acc.push(filter.toColumnFilter(values));
        }
      } else {
        const value = Array.isArray(paramValue) ? paramValue[0] : paramValue;
        if (value) {
          acc.push(filter.toColumnFilter([value]));
        }
      }

      return acc;
    }, []);
    hasInitializedRef.current = true;
  }

  const [columnFilters, setColumnFiltersState] = useState<ColumnFiltersState>(
    initialFiltersRef.current,
  );

  const setColumnFilters = useCallback(
    (updater: ColumnFiltersState | ((state: ColumnFiltersState) => ColumnFiltersState)) => {
      const newFilters = typeof updater === "function" ? updater(columnFilters) : updater;

      setColumnFiltersState(newFilters);

      const searchUpdate = filterDefinitions.reduce<Record<string, string | string[] | undefined>>(
        (acc, filter) => {
          const paramName = filter.searchParam ?? filter.id;
          const filterState = newFilters.find((f) => f.id === filter.id);
          const isMulti = filter.multi ?? false;

          if (!filterState?.value) {
            acc[paramName] = undefined;
            return acc;
          }

          const values = Array.isArray(filterState.value)
            ? filterState.value
            : [filterState.value].filter(Boolean);

          if (values.length === 0) {
            acc[paramName] = undefined;
          } else if (isMulti) {
            acc[paramName] = values as string[];
          } else {
            acc[paramName] = values[0] as string;
          }

          return acc;
        },
        {},
      );

      void navigate({
        // @ts-expect-error
        search: (prev) => ({
          ...prev,
          ...searchUpdate,
        }),
        replace: true,
      });
    },
    [columnFilters, filterDefinitions, navigate],
  );

  return useMemo(
    () => ({
      columnFilters,
      setColumnFilters,
    }),
    [columnFilters, setColumnFilters],
  );
};

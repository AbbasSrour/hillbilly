import { useNavigate, useSearch as useRouterSearch } from "@tanstack/react-router";
import type { SortingState } from "@tanstack/react-table";
import { useCallback, useMemo, useRef, useState } from "react";

export type SortDirection = "ASC" | "DESC";

export interface SortValue {
  sort: string;
  order: SortDirection;
}

export type SortUpdater = SortingState | ((state: SortingState) => SortingState);

export interface UseSortOptionsBase {
  /**
   * The URL search parameter name for sorting.
   * @default "sort"
   */
  searchParam?: string;
  /**
   * Whether to support multi-column sorting in the URL.
   * When true, multiple sort columns are stored as an array.
   * @default false
   */
  multi?: boolean;
}

export type UseSortOptions<TMulti extends boolean = false> = UseSortOptionsBase &
  (TMulti extends true ? { multi: true } : { multi?: false });

export type UseSortResult<TMulti extends boolean> = TMulti extends true
  ? UseSortMultiResult
  : UseSortSingleResult;

export interface UseSortSingleResult {
  sorting: SortingState;
  setSorting: (updater: SortUpdater) => void;
  sortValue: SortValue;
}

export interface UseSortMultiResult {
  sorting: SortingState;
  setSorting: (updater: SortUpdater) => void;
  sortValues: SortValue[] | undefined;
}

/**
 * Parses a sort value from URL format to TanStack Table format.
 * Supports formats like:
 * - "email" -> { id: "email", desc: false }
 * - "-email" -> { id: "email", desc: true }
 * - "email:asc" -> { id: "email", desc: false }
 * - "email:desc" -> { id: "email", desc: true }
 */
type SortItem = { id: string; desc: boolean };

const sortItemToValue = (sort: SortItem): SortValue => ({
  sort: sort.id,
  order: sort.desc ? "DESC" : "ASC",
});

export const parseSortValue = (value: string): SortItem | null => {
  if (!value) return null;

  // Handle "-column" format (descending)
  if (value.startsWith("-")) {
    return { id: value.slice(1), desc: true };
  }

  // Handle "column:asc" or "column:desc" format
  const colonIndex = value.indexOf(":");
  if (colonIndex !== -1) {
    const id = value.slice(0, colonIndex);
    const direction = value.slice(colonIndex + 1).toLowerCase();
    return { id, desc: direction === "desc" };
  }

  // Default: ascending
  return { id: value, desc: false };
};

/**
 * Converts a sort item to URL format string.
 */
export const formatSortValue = (sort: SortItem): string => {
  // Use "-column" format for descending (shorter URL)
  if (sort.desc) {
    return `-${sort.id}`;
  }
  // Use plain "column" format for ascending (default)
  return sort.id;
};

export const parseSortParamSingle = (
  value: string | string[] | undefined,
): SortValue | undefined => {
  if (value === undefined) {
    return undefined;
  }

  const stringValue = Array.isArray(value) ? value[0] : value;
  const parsed = parseSortValue(stringValue!);
  return parsed ? sortItemToValue(parsed) : undefined;
};

export const parseSortParamMulti = (
  value: string | string[] | undefined,
): SortValue[] | undefined => {
  if (value === undefined) {
    return undefined;
  }

  const values = (Array.isArray(value) ? value : [value])
    .map(parseSortValue)
    .filter((sort): sort is SortItem => sort !== null)
    .map(sortItemToValue);

  return values.length > 0 ? values : undefined;
};

export const toSortValueSingle = (sorting: SortingState): SortValue => {
  if (sorting.length === 0) return {} as SortValue;
  return sortItemToValue(sorting[0]!);
};

export const toSortValueMulti = (sorting: SortingState): SortValue[] | undefined => {
  if (sorting.length === 0) return undefined;
  return sorting.map(sortItemToValue);
};

export function useSort<TMulti extends boolean = false>(
  options?: UseSortOptions<TMulti>,
): UseSortResult<TMulti> {
  const { searchParam = "sort", multi = false } = (options ?? {}) as UseSortOptionsBase;
  const navigate = useNavigate();
  const searchParams = useRouterSearch({ strict: false }) as Record<
    string,
    string | string[] | undefined
  >;

  const initialSortingRef = useRef<SortingState>([]);
  const hasInitializedRef = useRef(false);

  if (!hasInitializedRef.current) {
    const paramValue = searchParams[searchParam];

    if (paramValue !== undefined) {
      if (multi && Array.isArray(paramValue)) {
        // Multiple sort columns
        initialSortingRef.current = paramValue
          .map(parseSortValue)
          .filter((sort): sort is SortItem => sort !== null);
      } else if (typeof paramValue === "string") {
        // Single sort column (or single value in multi mode)
        const parsed = parseSortValue(paramValue);
        if (parsed) {
          initialSortingRef.current = [parsed];
        }
      }
    }

    hasInitializedRef.current = true;
  }

  const [sorting, setSortingState] = useState<SortingState>(initialSortingRef.current);

  const setSorting = useCallback(
    (updater: SortUpdater) => {
      const newSorting = typeof updater === "function" ? updater(sorting) : updater;

      setSortingState(newSorting);

      // Update URL
      let searchUpdate: Record<string, string | string[] | undefined>;

      if (newSorting.length === 0) {
        // Clear sort from URL
        searchUpdate = { [searchParam]: undefined };
      } else if (multi) {
        // Multiple sort columns
        searchUpdate = {
          [searchParam]: newSorting.map(formatSortValue),
        };
      } else {
        // Single sort column - only use the first one
        searchUpdate = {
          [searchParam]: formatSortValue(newSorting[0]!),
        };
      }

      void navigate({
        // @ts-expect-error
        search: (prev) => ({
          ...prev,
          ...searchUpdate,
        }),
        replace: true,
      });
    },
    [sorting, searchParam, multi, navigate],
  );

  const sortValue = useMemo(
    () => (multi ? undefined : toSortValueSingle(sorting)),
    [sorting, multi],
  );

  const sortValues = useMemo(
    () => (multi ? toSortValueMulti(sorting) : undefined),
    [sorting, multi],
  );

  return useMemo(() => {
    if (multi) {
      return {
        sorting,
        setSorting,
        sortValues,
      };
    }

    return {
      sorting,
      setSorting,
      sortValue,
    };
  }, [sorting, setSorting, sortValue, sortValues, multi]) as UseSortResult<TMulti>;
}

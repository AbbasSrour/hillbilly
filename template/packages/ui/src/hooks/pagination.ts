import { useNavigate, useSearch } from '@tanstack/react-router';
import type { PaginationState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useRef } from 'react';

interface UsePaginationOptions {
  onPaginationChange?: (pagination: PaginationState) => void;
}

export const usePagination = (options: UsePaginationOptions = {}, dependencies: unknown[] = []) => {
  const { onPaginationChange } = options;
  const searchParams = useSearch({ strict: false }) as {
    page?: number;
    pageSize?: number;
  };
  const navigate = useNavigate();

  // URL uses 1-based page numbers, TanStack Table uses 0-based pageIndex
  // Convert: URL page 1 -> pageIndex 0, URL page 2 -> pageIndex 1, etc.
  const urlPage = searchParams.page ?? 1;
  const pageIndex = urlPage - 1;
  const pageSize = searchParams.pageSize ?? 10;

  const setPageIndex = useCallback(
    (index: number) => {
      // Convert 0-based index back to 1-based page for URL
      const urlPage = index + 1;
      void navigate({
        // @ts-expect-error - dynamic search params
        search: (prev) => ({
          ...prev,
          page: urlPage === 1 ? undefined : urlPage,
        }),
        replace: true,
      });
    },
    [navigate],
  );

  const setPageSize = useCallback(
    (size: number) => {
      void navigate({
        // @ts-expect-error - dynamic search params
        search: (prev) => ({
          ...prev,
          pageSize: size === 10 ? undefined : size,
        }),
        replace: true,
      });
    },
    [navigate],
  );

  const setPagination = useCallback(
    (updater: PaginationState | ((state: PaginationState) => PaginationState)) => {
      const currentState = { pageIndex, pageSize };
      const newPagination = typeof updater === 'function' ? updater(currentState) : updater;

      // Convert 0-based pageIndex back to a 1-based page for URL
      const urlPage = newPagination.pageIndex + 1;
      void navigate({
        // @ts-expect-error - dynamic search params
        search: (prev) => ({
          ...prev,
          page: urlPage === 1 ? undefined : urlPage,
          pageSize: newPagination.pageSize === 10 ? undefined : newPagination.pageSize,
        }),
        replace: true,
      });

      onPaginationChange?.(newPagination);
    },
    [pageIndex, pageSize, navigate, onPaginationChange],
  );

  const pagination = useMemo(() => {
    return {
      page: urlPage,
      pageIndex,
      pageSize,
    };
  }, [pageSize, pageIndex, urlPage]);

  const resetPagination = useCallback(() => {
    void navigate({
      // @ts-expect-error - dynamic search params
      search: (prev) => ({
        ...prev,
        page: undefined,
        pageSize: undefined,
      }),
      replace: true,
    });
  }, [navigate]);

  const initialDepsRef = useRef<string | null>(null);

  useEffect(() => {
    const depsKey = JSON.stringify(dependencies);

    if (initialDepsRef.current === null) {
      initialDepsRef.current = depsKey;
      return;
    }

    if (depsKey !== initialDepsRef.current) {
      resetPagination();
      initialDepsRef.current = depsKey;
    }
  }, [dependencies, resetPagination]);

  return {
    pagination,
    setPagination,
    resetPagination,
    setPageIndex,
    setPageSize,
  };
};

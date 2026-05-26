import { useThrottledCallback } from '@tanstack/react-pacer';
import { useNavigate, useSearch as useRouterSearch } from '@tanstack/react-router';
import { useDeferredValue, useEffect, useState } from 'react';

export const useSearch = () => {
  const navigate = useNavigate();

  const searchParam = useRouterSearch({
    strict: false,
    select: (state) => (state.search || '') as string,
  });
  const deferredSearchParam = useDeferredValue(searchParam);

  const [inputValue, setInputValue] = useState(searchParam);
  useEffect(() => {
    setInputValue(searchParam);
  }, [searchParam]);

  const throttledNavigate = useThrottledCallback(
    (value: string) => {
      void navigate({
        // @ts-expect-error
        search: (prev) => ({
          ...prev,
          search: value || undefined,
        }),
        replace: true,
      });
    },
    { wait: 1000 },
  );

  const setSearchValue = (value: string) => {
    setInputValue(value);
    throttledNavigate(value);
  };

  return {
    searchValue: deferredSearchParam,
    setSearchValue,
    rawSearchValue: inputValue,
  };
};

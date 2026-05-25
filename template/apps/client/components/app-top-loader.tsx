import { useProgress } from '@bprogress/react';
import { useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';

export function AppTopLoader() {
  const isLoading = useRouterState({
    select: (state) => state.isLoading,
  });
  const { start, stop } = useProgress();

  useEffect(() => {
    if (isLoading) {
      start();
      return;
    }

    stop();
  }, [isLoading, start, stop]);

  return null;
}

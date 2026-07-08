import { useQueries, useQuery } from '@tanstack/react-query';

import { fetchDailyMemos } from './client';
import { dailyMemoQueryKeys } from './query-keys';

import type { DailyMemo } from '../model';
import type { UseQueryOptions } from '@tanstack/react-query';

type DailyMemoQueryOptions<TData> = Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>;

export function useDailyMemosQuery(date: string, options?: DailyMemoQueryOptions<DailyMemo[]>) {
  return useQuery({
    queryKey: dailyMemoQueryKeys.byDate(date),
    queryFn: () => fetchDailyMemos(date),
    enabled: date.length > 0,
    ...options,
  });
}

export function useDailyMemosByDatesQuery(dates: string[]) {
  return useQueries({
    queries: dates.map((date) => ({
      queryKey: dailyMemoQueryKeys.byDate(date),
      queryFn: () => fetchDailyMemos(date),
      enabled: date.length > 0,
      staleTime: 5 * 60 * 1000,
    })),
  });
}

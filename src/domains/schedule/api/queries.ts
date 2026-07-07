import { useQuery } from '@tanstack/react-query';

import {
  fetchScheduleDetail,
  fetchSchedulesByDate,
  fetchSchedulesByMonth,
  fetchSchedulesByWeek,
  searchSchedules,
} from './client';
import { scheduleQueryKeys } from './query-keys';

import type { SearchSchedulesInput } from './client';
import type {
  DailyScheduleGroup,
  ScheduleDetail,
  ScheduleListItem,
  ScheduleMonthlyOverview,
} from '../model';
import type { UseQueryOptions } from '@tanstack/react-query';

type ScheduleQueryOptions<TData> = Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>;

export function useSchedulesByDateQuery(
  date: string,
  options?: ScheduleQueryOptions<ScheduleListItem[]>,
) {
  return useQuery({
    queryKey: scheduleQueryKeys.byDate(date),
    queryFn: () => fetchSchedulesByDate({ date }),
    enabled: date.length > 0,
    ...options,
  });
}

export function useScheduleSearchQuery(
  input: SearchSchedulesInput,
  options?: ScheduleQueryOptions<ScheduleListItem[]>,
) {
  return useQuery({
    queryKey: scheduleQueryKeys.search(input),
    queryFn: () => searchSchedules(input),
    ...options,
  });
}

export function useScheduleDetailQuery(
  scheduleId: number | null,
  options?: ScheduleQueryOptions<ScheduleDetail>,
) {
  return useQuery({
    queryKey:
      scheduleId == null ? scheduleQueryKeys.details() : scheduleQueryKeys.detail(scheduleId),
    queryFn: () => {
      if (scheduleId == null) {
        throw new Error('scheduleId is required');
      }

      return fetchScheduleDetail(scheduleId);
    },
    enabled: scheduleId != null,
    ...options,
  });
}

export function useSchedulesByWeekQuery(
  date: string,
  options?: ScheduleQueryOptions<DailyScheduleGroup[]>,
) {
  return useQuery({
    queryKey: scheduleQueryKeys.byWeek(date),
    queryFn: () => fetchSchedulesByWeek({ date }),
    enabled: date.length > 0,
    ...options,
  });
}

export function useSchedulesByMonthQuery(
  month: string,
  options?: ScheduleQueryOptions<ScheduleMonthlyOverview>,
) {
  return useQuery({
    queryKey: scheduleQueryKeys.byMonth(month),
    queryFn: () => fetchSchedulesByMonth({ month }),
    enabled: month.length > 0,
    ...options,
  });
}

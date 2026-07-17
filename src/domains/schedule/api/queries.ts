/**
 * schedule 조회 hook 모음입니다.
 * 날짜/주/월/검색/상세 조회를 화면 단위에 맞는 query key로 분리합니다.
 */
import { useQuery } from '@tanstack/react-query';

import {
  fetchDailyMessage,
  fetchScheduleDetail,
  fetchSchedulesByDate,
  fetchSchedulesByMonth,
  fetchSchedulesByWeek,
  searchSchedules,
} from './client';
import { scheduleQueryKeys } from './query-keys';

import type { SearchSchedulesInput } from './client';
import type {
  DailyMessage,
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

export function useDailyMessageQuery(date: string, options?: ScheduleQueryOptions<DailyMessage>) {
  return useQuery({
    queryKey: scheduleQueryKeys.dailyMessage(date),
    queryFn: () => fetchDailyMessage({ date }),
    enabled: date.length > 0,
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

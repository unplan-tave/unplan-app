/**
 * schedule 조회 hook 모음입니다.
 * 날짜/주/월/검색/상세 조회를 화면 단위에 맞는 query key로 분리합니다.
 */
import { useInfiniteQuery, useQueries, useQuery } from '@tanstack/react-query';

import {
  fetchDailyMessage,
  fetchPersonalTags,
  fetchTagRecommendation,
  fetchScheduleDetail,
  fetchSchedulesByDate,
  fetchSchedulesByMonth,
  fetchSchedulesByWeek,
  searchSchedules,
  searchSchedulesPage,
} from './client';
import { scheduleQueryKeys } from './query-keys';

import type { SearchSchedulesInput } from './client';
import type {
  DailyMessage,
  DailyScheduleGroup,
  ScheduleDetail,
  ScheduleListItem,
  ScheduleMonthlyOverview,
  ScheduleSearchPage,
  PersonalTagOption,
  TagRecommendation,
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
    ...options,
    enabled: date.length > 0 && (options?.enabled ?? true),
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

/** 서버 페이지 정보를 이용해 카드 검색 결과를 끝까지 불러옵니다. */
export function useInfiniteScheduleSearchQuery(
  input: Omit<SearchSchedulesInput, 'page'>,
  options?: { enabled?: boolean },
) {
  return useInfiniteQuery<ScheduleSearchPage>({
    queryKey: scheduleQueryKeys.infiniteSearch(input),
    queryFn: ({ pageParam }) =>
      searchSchedulesPage({ ...input, page: typeof pageParam === 'number' ? pageParam : 0 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    enabled: options?.enabled ?? true,
  });
}

export function useDailyMessageQuery(date: string, options?: ScheduleQueryOptions<DailyMessage>) {
  return useQuery({
    queryKey: scheduleQueryKeys.dailyMessage(date),
    queryFn: () => fetchDailyMessage({ date }),
    ...options,
    enabled: date.length > 0 && (options?.enabled ?? true),
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
    ...options,
    enabled: scheduleId != null && (options?.enabled ?? true),
  });
}

/** 목록 응답에 없는 개인 태그를 일정 상세 응답으로 보강합니다. */
export function useScheduleDetailQueries(scheduleIds: number[], enabled = true) {
  const uniqueScheduleIds = [...new Set(scheduleIds)];

  return useQueries({
    queries: uniqueScheduleIds.map((scheduleId) => ({
      queryKey: scheduleQueryKeys.detail(scheduleId),
      queryFn: () => fetchScheduleDetail(scheduleId),
      enabled,
    })),
  });
}

export function useSchedulesByWeekQuery(
  date: string,
  options?: ScheduleQueryOptions<DailyScheduleGroup[]>,
) {
  return useQuery({
    queryKey: scheduleQueryKeys.byWeek(date),
    queryFn: () => fetchSchedulesByWeek({ date }),
    ...options,
    enabled: date.length > 0 && (options?.enabled ?? true),
  });
}

export function useSchedulesByMonthQuery(
  month: string,
  options?: ScheduleQueryOptions<ScheduleMonthlyOverview>,
) {
  return useQuery({
    queryKey: scheduleQueryKeys.byMonth(month),
    queryFn: () => fetchSchedulesByMonth({ month }),
    ...options,
    enabled: month.length > 0 && (options?.enabled ?? true),
  });
}

/** 개인 태그 목록을 조회합니다. */
export function usePersonalTagsQuery(options?: ScheduleQueryOptions<PersonalTagOption[]>) {
  return useQuery({
    queryKey: scheduleQueryKeys.personalTags(),
    queryFn: fetchPersonalTags,
    ...options,
  });
}

/** 제목 입력이 있을 때 태그 추천을 조회합니다. */
export function useTagRecommendationQuery(
  title: string,
  options?: ScheduleQueryOptions<TagRecommendation | null>,
) {
  return useQuery({
    queryKey: scheduleQueryKeys.tagRecommendation(title),
    queryFn: () => fetchTagRecommendation(title),
    ...options,
    enabled: title.trim().length > 0 && (options?.enabled ?? true),
  });
}

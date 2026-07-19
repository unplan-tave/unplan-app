/**
 * ai-recommendation 조회 hook 모음입니다.
 * settings 화면의 추천 기준 설정과 condition 화면의 날짜별 추천 목록을
 * TanStack Query 캐시 키로 분리해 관리합니다.
 */
import { useQuery } from '@tanstack/react-query';

import {
  fetchConditionRecommendations,
  fetchQueueTimeRecommendations,
  fetchRecommendationCriteriaSettings,
  fetchScheduleRecommendations,
} from './client';
import { aiRecommendationQueryKeys, recommendationCriteriaQueryKeys } from './query-keys';

import type { ConditionRecommendationResult } from './client';
import type { QueueTimeRecommendationResult, ScheduleRecommendation } from '../model';
import type { RecommendationCriteriaSettings } from '../model';
import type { UseQueryOptions } from '@tanstack/react-query';

type AiRecommendationQueryOptions<TData> = Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>;

export function useRecommendationCriteriaSettingsQuery(
  options?: AiRecommendationQueryOptions<RecommendationCriteriaSettings>,
) {
  return useQuery({
    queryKey: recommendationCriteriaQueryKeys.settings(),
    queryFn: fetchRecommendationCriteriaSettings,
    ...options,
  });
}

export function useConditionRecommendationsQuery(
  date: string,
  options?: AiRecommendationQueryOptions<ConditionRecommendationResult>,
) {
  return useQuery({
    ...options,
    queryKey: aiRecommendationQueryKeys.condition(date),
    queryFn: () => fetchConditionRecommendations(date),
    enabled: date.length > 0 && (options?.enabled ?? true),
  });
}

/** 특정 날짜의 일반 일정 추천을 조회합니다. */
export function useScheduleRecommendationsQuery(date: string) {
  return useQuery<ScheduleRecommendation[]>({
    queryKey: aiRecommendationQueryKeys.schedules(date),
    queryFn: () => fetchScheduleRecommendations(date),
    enabled: date.length > 0,
  });
}

/** 큐 카드별 추천 시간대를 조회합니다. */
export function useQueueTimeRecommendationsQuery(scheduleId: number | null, days = 7) {
  return useQuery<QueueTimeRecommendationResult>({
    queryKey:
      scheduleId == null
        ? aiRecommendationQueryKeys.all
        : aiRecommendationQueryKeys.queueTimes(scheduleId, days),
    queryFn: () => {
      if (scheduleId == null) throw new Error('scheduleId is required');

      return fetchQueueTimeRecommendations(scheduleId, days);
    },
    enabled: scheduleId != null,
  });
}

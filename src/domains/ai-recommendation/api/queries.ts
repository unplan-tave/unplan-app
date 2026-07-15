/**
 * ai-recommendation 조회 hook 모음입니다.
 * settings 화면의 추천 기준 설정과 condition 화면의 날짜별 추천 목록을
 * TanStack Query 캐시 키로 분리해 관리합니다.
 */
import { useQuery } from '@tanstack/react-query';

import { fetchConditionRecommendations, fetchRecommendationCriteriaSettings } from './client';
import { aiRecommendationQueryKeys, recommendationCriteriaQueryKeys } from './query-keys';

import type { ConditionRecommendationResult } from './client';
import type { RecommendationCriteriaSettings } from '../model';
import type { UseQueryOptions } from '@tanstack/react-query';

type RecommendationCriteriaQueryOptions<TData> = Omit<
  UseQueryOptions<TData>,
  'queryKey' | 'queryFn'
>;

export function useRecommendationCriteriaSettingsQuery(
  options?: RecommendationCriteriaQueryOptions<RecommendationCriteriaSettings>,
) {
  return useQuery({
    queryKey: recommendationCriteriaQueryKeys.settings(),
    queryFn: fetchRecommendationCriteriaSettings,
    ...options,
  });
}

export function useConditionRecommendationsQuery(
  date: string,
  options?: RecommendationCriteriaQueryOptions<ConditionRecommendationResult>,
) {
  return useQuery({
    ...options,
    queryKey: aiRecommendationQueryKeys.condition(date),
    queryFn: () => fetchConditionRecommendations(date),
    enabled: date.length > 0 && (options?.enabled ?? true),
  });
}

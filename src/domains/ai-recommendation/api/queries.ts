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

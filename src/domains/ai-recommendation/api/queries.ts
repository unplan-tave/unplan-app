import { useQuery } from '@tanstack/react-query';

import { fetchRecommendationCriteriaSettings } from './client';
import { recommendationCriteriaQueryKeys } from './query-keys';

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

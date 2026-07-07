import { useOptimisticQueryMutation } from '@/lib/api/optimistic-query-mutation';

import { submitRecommendationCriteriaSettings } from './client';
import { recommendationCriteriaQueryKeys } from './query-keys';

import type { RecommendationCriteriaSettings } from '../model';
import type { OptimisticQueryMutationContext } from '@/lib/api/optimistic-query-mutation';
import type { UseMutationOptions } from '@tanstack/react-query';

type RecommendationCriteriaMutationOptions = Omit<
  UseMutationOptions<
    void,
    Error,
    RecommendationCriteriaSettings,
    OptimisticQueryMutationContext<RecommendationCriteriaSettings>
  >,
  'mutationFn' | 'onMutate'
>;

export function useUpdateRecommendationCriteriaSettingsMutation(
  options?: RecommendationCriteriaMutationOptions,
) {
  return useOptimisticQueryMutation({
    mutationFn: submitRecommendationCriteriaSettings,
    queryKey: recommendationCriteriaQueryKeys.settings(),
    ...options,
  });
}

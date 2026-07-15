import { useMutation, useQueryClient } from '@tanstack/react-query';

import { scheduleQueryKeys } from '@/domains/schedule/api/query-keys';
import { useOptimisticQueryMutation } from '@/lib/api/optimistic-query-mutation';

import {
  submitAcceptConditionRecommendation,
  submitRecommendationCriteriaSettings,
} from './client';
import { aiRecommendationQueryKeys, recommendationCriteriaQueryKeys } from './query-keys';

import type { AcceptConditionRecommendationInput, RecommendationCriteriaSettings } from '../model';
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

type AcceptConditionRecommendationMutationOptions = Omit<
  UseMutationOptions<void, Error, AcceptConditionRecommendationInput>,
  'mutationFn'
>;

export function useAcceptConditionRecommendationMutation(
  options?: AcceptConditionRecommendationMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitAcceptConditionRecommendation,
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: aiRecommendationQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.all });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

/**
 * ai-recommendation 서버 상태를 변경하는 mutation hook 모음입니다.
 * 성공 후 추천/일정 캐시를 무효화해 추천 수락이나 기준 설정 변경이
 * condition, schedule 화면에 다시 반영되도록 합니다.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { scheduleQueryKeys } from '@/domains/schedule/api/query-keys';
import { useOptimisticQueryMutation } from '@/lib/api/optimistic-query-mutation';

import {
  submitAcceptRecommendation,
  submitPassRecommendation,
  submitRecommendationCriteriaSettings,
} from './client';
import { aiRecommendationQueryKeys, recommendationCriteriaQueryKeys } from './query-keys';

import type {
  AcceptConditionRecommendationInput,
  AcceptRecommendationResult,
  RecommendationCriteriaSettings,
} from '../model';
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
  UseMutationOptions<AcceptRecommendationResult, Error, AcceptConditionRecommendationInput>,
  'mutationFn'
>;

export function useAcceptRecommendationMutation(
  options?: AcceptConditionRecommendationMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitAcceptRecommendation,
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: aiRecommendationQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.all });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

type PassRecommendationMutationOptions = Omit<
  UseMutationOptions<void, Error, number>,
  'mutationFn'
>;

/** 추천을 건너뛴 뒤 추천 목록 캐시를 갱신합니다. */
export function usePassRecommendationMutation(options?: PassRecommendationMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitPassRecommendation,
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: aiRecommendationQueryKeys.all });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

/** 컨디션 추천 화면에서 사용하는 추천 수락 mutation의 호환 별칭입니다. */
export const useAcceptConditionRecommendationMutation = useAcceptRecommendationMutation;

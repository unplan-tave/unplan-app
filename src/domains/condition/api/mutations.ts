/**
 * condition 기록 저장 mutation hook입니다.
 * 저장 성공 후 measurement와 추천 캐시를 무효화해 요약 점수와 추천 결과가 최신 기록으로 재계산되게 합니다.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { aiRecommendationQueryKeys } from '@/domains/ai-recommendation/api/query-keys';
import { measurementQueryKeys } from '@/domains/measurement/api/query-keys';

import { submitConditionRecord, submitConditionRecordDelete } from './client';
import { conditionQueryKeys } from './query-keys';

import type { ConditionRecordEntry, ConditionRecordInput } from '../model';
import type { UseMutationOptions } from '@tanstack/react-query';

type ConditionRecordMutationOptions = Omit<
  UseMutationOptions<ConditionRecordEntry, Error, ConditionRecordInput>,
  'mutationFn'
>;

export function useSaveConditionRecordMutation(options?: ConditionRecordMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitConditionRecord,
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: measurementQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: aiRecommendationQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: conditionQueryKeys.all });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

/** 컨디션 기록 삭제와 관련 캐시 갱신을 처리합니다. */
export function useDeleteConditionRecordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitConditionRecordDelete,
    onSuccess: (_, conditionId) => {
      void queryClient.invalidateQueries({ queryKey: measurementQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: aiRecommendationQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: conditionQueryKeys.all });
      queryClient.removeQueries({ queryKey: conditionQueryKeys.detail(conditionId) });
    },
  });
}

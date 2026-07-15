import { useMutation, useQueryClient } from '@tanstack/react-query';

import { aiRecommendationQueryKeys } from '@/domains/ai-recommendation/api/query-keys';
import { measurementQueryKeys } from '@/domains/measurement/api/query-keys';

import { submitConditionRecord } from './client';

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
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

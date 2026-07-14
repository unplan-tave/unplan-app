import { useMutation, useQueryClient } from '@tanstack/react-query';

import { submitDailyMemo, submitDailyMemoDelete } from './client';
import { dailyMemoQueryKeys } from './query-keys';

import type { CreateDailyMemoInput, DailyMemo } from '../model';
import type { UseMutationOptions } from '@tanstack/react-query';

type DailyMemoMutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<TData, Error, TVariables>,
  'mutationFn'
>;

export function useCreateDailyMemoMutation(
  options?: DailyMemoMutationOptions<DailyMemo, CreateDailyMemoInput>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitDailyMemo,
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: dailyMemoQueryKeys.byDate(variables.date),
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteDailyMemoMutation(
  options?: DailyMemoMutationOptions<void, { date: string; id: number }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }) => submitDailyMemoDelete(id),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({
        queryKey: dailyMemoQueryKeys.byDate(variables.date),
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

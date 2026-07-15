/**
 * daily-memo 생성/삭제 mutation hook입니다.
 * 저장 성공 후 해당 날짜 메모 캐시를 갱신해 홈 bottom sheet와 요약 패널이 같은 데이터를 보게 합니다.
 */
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

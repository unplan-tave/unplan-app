import { useMutation, useQueryClient } from '@tanstack/react-query';

import { submitScheduleCreate, submitScheduleDelete, submitScheduleUpdate } from './client';
import { scheduleQueryKeys } from './query-keys';

import type {
  ScheduleCreateInput,
  ScheduleCreateResult,
  ScheduleDetail,
  ScheduleUpdateInput,
} from '../model';
import type { UseMutationOptions } from '@tanstack/react-query';

type ScheduleMutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<TData, Error, TVariables>,
  'mutationFn'
>;

export function useCreateScheduleMutation(
  options?: ScheduleMutationOptions<ScheduleCreateResult, ScheduleCreateInput>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitScheduleCreate,
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.lists() });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateScheduleMutation(
  options?: ScheduleMutationOptions<
    ScheduleDetail,
    { scheduleId: number; data: ScheduleUpdateInput }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scheduleId, data }) => submitScheduleUpdate(scheduleId, data),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: scheduleQueryKeys.detail(variables.scheduleId),
      });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteScheduleMutation(
  options?: ScheduleMutationOptions<void, { scheduleId: number }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scheduleId }) => submitScheduleDelete(scheduleId),
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      void queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.lists() });
      void queryClient.removeQueries({ queryKey: scheduleQueryKeys.detail(variables.scheduleId) });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

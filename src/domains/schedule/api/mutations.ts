/**
 * schedule 생성/수정/삭제 mutation hook 모음입니다.
 * 성공 시 schedule 조회를 무효화해 화면이 서버 상태를 다시 조회하게 합니다.
 */
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
    onSuccess: async (data, variables, onMutateResult, context) => {
      // 생성 응답은 상세 응답의 축약본이므로, 입력값으로 상세 캐시를 조립하지 않습니다.
      // 상세 화면은 다음 마운트에서 반드시 서버 상세 엔드포인트를 조회합니다.
      await queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.all });
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
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.all });
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
      void queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.all });
      void queryClient.removeQueries({ queryKey: scheduleQueryKeys.detail(variables.scheduleId) });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

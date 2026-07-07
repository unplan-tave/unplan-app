import { useMutation, useQueryClient } from '@tanstack/react-query';

import { submitScheduleCreate, submitScheduleDelete, submitScheduleUpdate } from './client';
import { scheduleQueryKeys } from './query-keys';

import type {
  ScheduleCreateInput,
  ScheduleCreateResult,
  ScheduleDetail,
  ScheduleListItem,
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
      updateScheduleListCacheAfterCreate(queryClient, data, variables);
      updateScheduleDetailCacheAfterCreate(queryClient, data, variables);
      void queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.lists() });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

function updateScheduleDetailCacheAfterCreate(
  queryClient: ReturnType<typeof useQueryClient>,
  result: ScheduleCreateResult,
  input: ScheduleCreateInput,
) {
  const date = result.date || input.date || '';
  const detail: ScheduleDetail = {
    id: result.id,
    title: result.title || input.title,
    date,
    startTime: result.startTime || input.startTime || '',
    endTime: result.endTime || input.endTime || '',
    estimatedMinutes: result.estimatedMinutes ?? input.estimatedMinutes ?? null,
    isQueue: result.isQueue,
    status: 'todo',
    conditionTagId: input.conditionTagId,
    memo: input.memo ?? '',
    location: '',
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    isReminderEnabled: input.isReminderEnabled ?? false,
    reminderMinutes: input.reminderMinutes ?? null,
    reminderType: input.reminderType ?? null,
    reminderSoundType: input.reminderSoundType ?? null,
    isRecurring: input.recurrence != null,
    isConflict: false,
  };

  queryClient.setQueryData<ScheduleDetail>(scheduleQueryKeys.detail(result.id), detail);
}

function updateScheduleListCacheAfterCreate(
  queryClient: ReturnType<typeof useQueryClient>,
  result: ScheduleCreateResult,
  input: ScheduleCreateInput,
) {
  const date = result.date || input.date;

  if (date == null || date.length === 0) {
    return;
  }

  const listItem: ScheduleListItem = {
    id: result.id,
    title: result.title || input.title,
    date,
    startTime: result.startTime || input.startTime || '',
    endTime: result.endTime || input.endTime || '',
    estimatedMinutes: result.estimatedMinutes ?? input.estimatedMinutes ?? null,
    isQueue: result.isQueue,
    status: 'todo',
    conditionTagId: input.conditionTagId,
  };

  queryClient.setQueryData<ScheduleListItem[]>(scheduleQueryKeys.byDate(date), (current = []) => {
    const withoutDuplicate = current.filter((item) => item.id !== listItem.id);

    return [listItem, ...withoutDuplicate];
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

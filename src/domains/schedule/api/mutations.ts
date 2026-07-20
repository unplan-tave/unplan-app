/**
 * schedule 생성/수정/삭제 mutation hook 모음입니다.
 * 성공 시 list/detail 캐시를 갱신해 card create/view/list 화면이 같은 서버 상태를 보게 합니다.
 */
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
      // 생성 응답에는 상세의 선택 필드(반복·위치 등)가 아직 모두 포함되지 않는다.
      // 방금 조립한 상세 캐시를 무효화하면 상세 조회 응답이 이를 즉시 덮어쓰므로,
      // 목록과 검색 결과만 갱신하고 상세는 다음 stale 주기에 서버 값으로 동기화한다.
      void queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.searches() });
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
    personalTags: input.personalTags ?? [],
    memo: input.memo ?? '',
    location: result.location || input.location || '',
    locationDetail: result.locationDetail || input.locationDetail || '',
    isReminderEnabled: input.isReminderEnabled ?? false,
    reminderMinutes: input.reminderMinutes ?? null,
    reminderType: input.reminderType ?? null,
    reminderSoundType: input.reminderSoundType ?? null,
    isRecurring: result.isRecurring || input.recurrence != null,
    recurrence: result.recurrence ?? input.recurrence ?? null,
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
    personalTags: input.personalTags ?? [],
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
      void queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.all });
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

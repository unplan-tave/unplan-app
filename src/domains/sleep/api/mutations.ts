/** 수면 기록 생성·수정·삭제 hook입니다. */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { submitSleepRecord, submitSleepRecordDelete, submitSleepRecordUpdate } from './client';
import { sleepQueryKeys } from './query-keys';

import type { SleepRecordInput } from '../model';

/** 수면 기록을 생성하고 수면 캐시를 갱신합니다. */
export function useCreateSleepRecordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitSleepRecord,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: sleepQueryKeys.all }),
  });
}

/** 수면 기록을 수정하고 detail 캐시를 갱신합니다. */
export function useUpdateSleepRecordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sleepId, input }: { sleepId: number; input: SleepRecordInput }) =>
      submitSleepRecordUpdate(sleepId, input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: sleepQueryKeys.all }),
  });
}

/** 수면 기록을 삭제하고 detail 캐시를 제거합니다. */
export function useDeleteSleepRecordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitSleepRecordDelete,
    onSuccess: (_, sleepId) => {
      void queryClient.invalidateQueries({ queryKey: sleepQueryKeys.all });
      queryClient.removeQueries({ queryKey: sleepQueryKeys.detail(sleepId) });
    },
  });
}

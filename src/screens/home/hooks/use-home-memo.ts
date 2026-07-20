import { useCallback, useState } from 'react';

import {
  useCreateDailyMemoMutation,
  useDeleteDailyMemoMutation,
} from '@/domains/daily-memo/api/mutations';

/** 일일 메모 sheet 노출 상태와 생성·삭제 mutation을 소유합니다. */
export function useHomeMemo(selectedDateValue: string) {
  const [isMemoSheetVisible, setIsMemoSheetVisible] = useState(false);
  const [deletingMemoId, setDeletingMemoId] = useState<number | null>(null);
  const createDailyMemoMutation = useCreateDailyMemoMutation();
  const deleteDailyMemoMutation = useDeleteDailyMemoMutation();

  /** 메모 sheet를 엽니다. */
  const openMemoSheet = useCallback(() => setIsMemoSheetVisible(true), []);
  /** 메모 sheet를 닫습니다. */
  const closeMemoSheet = useCallback(() => setIsMemoSheetVisible(false), []);
  /** 선택 날짜의 메모를 생성합니다. */
  const createDailyMemo = useCallback(
    async (content: string) => {
      if (!createDailyMemoMutation.isPending)
        await createDailyMemoMutation.mutateAsync({ date: selectedDateValue, content });
    },
    [createDailyMemoMutation, selectedDateValue],
  );
  /** 선택한 메모를 삭제합니다. */
  const deleteDailyMemo = useCallback(
    (id: number) => {
      if (deleteDailyMemoMutation.isPending) return;
      setDeletingMemoId(id);
      deleteDailyMemoMutation.mutate(
        { date: selectedDateValue, id },
        { onSettled: () => setDeletingMemoId(null) },
      );
    },
    [deleteDailyMemoMutation, selectedDateValue],
  );

  return {
    isMemoSheetVisible,
    deletingMemoId,
    isCreatingMemo: createDailyMemoMutation.isPending,
    hasMemoMutationError: createDailyMemoMutation.isError || deleteDailyMemoMutation.isError,
    openMemoSheet,
    closeMemoSheet,
    createDailyMemo,
    deleteDailyMemo,
  };
}

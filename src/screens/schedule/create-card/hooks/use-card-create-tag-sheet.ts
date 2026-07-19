import { useCallback, useEffect } from 'react';

import { usePersonalTagsQuery } from '@/domains/schedule/api/queries';
import {
  type CardFormValues,
  type CardTagTab,
  type ConditionTagId,
} from '@/domains/schedule/model';
import { useScheduleStore } from '@/domains/schedule/use-schedule-store';

import type { CardCreateSheetState } from './card-create-sheet-state';
import type { Dispatch, SetStateAction } from 'react';
import type { UseFormSetValue } from 'react-hook-form';

interface UseCardCreateTagSheetParams {
  sheet: CardCreateSheetState;
  conditionTagId: ConditionTagId;
  setValue: UseFormSetValue<CardFormValues>;
  updateDraftValues: (values: Partial<CardFormValues>) => void;
  setSheet: Dispatch<SetStateAction<CardCreateSheetState>>;
}

/** 태그 선택 sheet의 선택·편집 상태를 관리합니다. */
export function useCardCreateTagSheet({
  sheet,
  conditionTagId,
  setValue,
  updateDraftValues,
  setSheet,
}: UseCardCreateTagSheetParams) {
  const setPersonalTags = useScheduleStore((store) => store.setPersonalTags);
  const tagSheetTab: CardTagTab | null = sheet.kind === 'tagPicker' ? sheet.tab : null;
  const tagSheetSelectedId: ConditionTagId | null =
    sheet.kind === 'tagPicker' ? sheet.selectedConditionTagId : null;
  const isPersonalTab = tagSheetTab === 'personal';

  // 개인 태그 탭이 열릴 때만 조회합니다. (버튼으로 바로 열기 / 컨디션→개인 탭 전환)
  const personalTagsQuery = usePersonalTagsQuery({
    enabled: isPersonalTab,
  });

  useEffect(() => {
    if (personalTagsQuery.data == null) {
      return;
    }

    // 서버 목록만 카탈로그로 둡니다. 로컬 생성 태그는 카드 저장 payload(labels)로만 전달합니다.
    setPersonalTags(personalTagsQuery.data);
  }, [personalTagsQuery.data, setPersonalTags]);

  const openConditionTagSheet = useCallback(() => {
    setSheet({ kind: 'tagPicker', tab: 'condition', selectedConditionTagId: conditionTagId });
  }, [conditionTagId, setSheet]);

  const openPersonalTagSheet = useCallback(() => {
    setSheet({ kind: 'tagPicker', tab: 'personal', selectedConditionTagId: conditionTagId });
  }, [conditionTagId, setSheet]);

  const switchTagTab = useCallback(
    (tab: CardTagTab) => {
      setSheet((prev) => (prev.kind === 'tagPicker' ? { ...prev, tab } : prev));
    },
    [setSheet],
  );

  const selectConditionTag = useCallback(
    (tagId: ConditionTagId) => {
      setSheet((prev) =>
        prev.kind === 'tagPicker'
          ? {
              ...prev,
              selectedConditionTagId: prev.selectedConditionTagId === tagId ? null : tagId,
            }
          : prev,
      );
    },
    [setSheet],
  );

  const confirmConditionTag = useCallback(() => {
    if (sheet.kind !== 'tagPicker' || sheet.selectedConditionTagId == null) {
      return;
    }

    setValue('conditionTagId', sheet.selectedConditionTagId, { shouldDirty: true });
    updateDraftValues({ conditionTagId: sheet.selectedConditionTagId });
    setSheet({ kind: 'none' });
  }, [setSheet, setValue, sheet, updateDraftValues]);

  const confirmPersonalTags = useCallback(
    (nextPersonalTagIds: string[], nextPersonalTagLabels: string[]) => {
      setValue('personalTagIds', nextPersonalTagIds, { shouldDirty: true });
      setValue('personalTagLabels', nextPersonalTagLabels, { shouldDirty: true });
      updateDraftValues({
        personalTagIds: nextPersonalTagIds,
        personalTagLabels: nextPersonalTagLabels,
      });
      setSheet({ kind: 'none' });
    },
    [setSheet, setValue, updateDraftValues],
  );

  const closeTagSheet = useCallback(() => setSheet({ kind: 'none' }), [setSheet]);

  const syncTagSheetSelectedId = useCallback(
    (tagId: ConditionTagId) => {
      setSheet((prev) =>
        prev.kind === 'tagPicker' ? { ...prev, selectedConditionTagId: tagId } : prev,
      );
    },
    [setSheet],
  );

  return {
    tagSheetTab,
    tagSheetSelectedId,
    /** 시트 목록은 서버 응답만 사용합니다. */
    personalTagsForPicker: personalTagsQuery.data ?? [],
    isPersonalTagsLoading: isPersonalTab && personalTagsQuery.isLoading,
    isPersonalTagsError: isPersonalTab && personalTagsQuery.isError,
    openConditionTagSheet,
    openPersonalTagSheet,
    switchTagTab,
    selectConditionTag,
    confirmConditionTag,
    confirmPersonalTags,
    closeTagSheet,
    syncTagSheetSelectedId,
  };
}

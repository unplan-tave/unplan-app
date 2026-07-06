import { useCallback } from 'react';

import {
  type CardFormValues,
  type CardTagTab,
  type ConditionTagId,
} from '@/domains/schedule/model';

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

export function useCardCreateTagSheet({
  sheet,
  conditionTagId,
  setValue,
  updateDraftValues,
  setSheet,
}: UseCardCreateTagSheetParams) {
  const tagSheetTab: CardTagTab | null = sheet.kind === 'tagPicker' ? sheet.tab : null;
  const tagSheetSelectedId: ConditionTagId | null =
    sheet.kind === 'tagPicker' ? sheet.selectedConditionTagId : null;

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
    (nextPersonalTagIds: string[]) => {
      setValue('personalTagIds', nextPersonalTagIds, { shouldDirty: true });
      updateDraftValues({ personalTagIds: nextPersonalTagIds });
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

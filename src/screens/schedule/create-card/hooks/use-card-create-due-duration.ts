import { useCallback } from 'react';

import type { CardCreateSheetState } from './card-create-sheet-state';
import type { CardFormValues } from '@/domains/schedule/model';
import type { DueDurationDraft } from '@/domains/schedule/queue';
import type { Dispatch, SetStateAction } from 'react';
import type { UseFormSetValue } from 'react-hook-form';

interface UseCardCreateDueDurationParams {
  hasSubmitted: boolean;
  setValue: UseFormSetValue<CardFormValues>;
  updateDraftValues: (values: Partial<CardFormValues>) => void;
  setSheet: Dispatch<SetStateAction<CardCreateSheetState>>;
}

export function useCardCreateDueDuration({
  hasSubmitted,
  setValue,
  updateDraftValues,
  setSheet,
}: UseCardCreateDueDurationParams) {
  const openDueDurationSheet = useCallback(() => setSheet({ kind: 'dueDuration' }), [setSheet]);

  const saveDueDuration = useCallback(
    (draft: DueDurationDraft) => {
      setValue('dueDate', draft.dueDate, { shouldDirty: true, shouldValidate: hasSubmitted });
      setValue('durationHours', draft.durationHours, {
        shouldDirty: true,
        shouldValidate: hasSubmitted,
      });
      setValue('durationMinutes', draft.durationMinutes, {
        shouldDirty: true,
        shouldValidate: hasSubmitted,
      });
      setValue('durationUnknown', draft.durationUnknown, {
        shouldDirty: true,
        shouldValidate: hasSubmitted,
      });
      updateDraftValues({
        dueDate: draft.dueDate,
        durationHours: draft.durationHours,
        durationMinutes: draft.durationMinutes,
        durationUnknown: draft.durationUnknown,
      });
      setSheet({ kind: 'none' });
    },
    [hasSubmitted, setSheet, setValue, updateDraftValues],
  );

  return {
    openDueDurationSheet,
    saveDueDuration,
  };
}

import { useCallback } from 'react';

import {
  type CardFormValues,
  type CardTab,
  type DateTimeDraft,
  hasCompleteTime,
  type TimeFocus,
} from '@/domains/schedule/model';

import type { CardCreateSheetState } from './card-create-sheet-state';
import type { Dispatch, SetStateAction } from 'react';
import type { UseFormSetValue } from 'react-hook-form';

interface UseCardCreateDateTimeParams {
  activeTab: CardTab;
  hasSubmitted: boolean;
  setValue: UseFormSetValue<CardFormValues>;
  updateDraftValues: (values: Partial<CardFormValues>) => void;
  setSheet: Dispatch<SetStateAction<CardCreateSheetState>>;
}

/** 카드 생성 form의 날짜·시간 입력 상태를 관리합니다. */
export function useCardCreateDateTime({
  activeTab,
  hasSubmitted,
  setValue,
  updateDraftValues,
  setSheet,
}: UseCardCreateDateTimeParams) {
  const openDateTimeSheet = useCallback(
    (focus: TimeFocus = 'start') => setSheet({ kind: 'dateTime', focus }),
    [setSheet],
  );

  const saveDateTime = useCallback(
    (draft: DateTimeDraft) => {
      const nextTimeFilled = hasCompleteTime(draft);

      setValue('dateMode', draft.dateMode, { shouldDirty: true, shouldValidate: hasSubmitted });
      setValue('dateStart', draft.dateStart, { shouldDirty: true });
      setValue('dateEnd', draft.dateEnd, { shouldDirty: true });
      setValue('timeFilled', nextTimeFilled, { shouldDirty: true, shouldValidate: hasSubmitted });
      setValue('timeStart', draft.timeStart, { shouldDirty: true });
      setValue('timeEnd', draft.timeEnd, { shouldDirty: true });
      updateDraftValues({
        dateMode: draft.dateMode,
        dateStart: draft.dateStart,
        dateEnd: draft.dateEnd,
        timeFilled: nextTimeFilled,
        timeStart: draft.timeStart,
        timeEnd: draft.timeEnd,
      });

      if (activeTab === 'pin' && draft.dateMode !== 'empty' && !nextTimeFilled) {
        setSheet({ kind: 'dateOnlyGuide' });
        return;
      }

      setSheet({ kind: 'none' });
    },
    [activeTab, hasSubmitted, setSheet, setValue, updateDraftValues],
  );

  return {
    openDateTimeSheet,
    saveDateTime,
  };
}

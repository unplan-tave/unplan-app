import { useCallback } from 'react';

import type { CardCreateSheetState } from './card-create-sheet-state';
import type { CardFormValues, CardTab } from '@/domains/schedule/model';
import type { Dispatch, SetStateAction } from 'react';
import type { UseFormSetValue } from 'react-hook-form';

interface UseCardCreateDateOnlyGuideParams {
  changeDraftCardType: (cardType: CardTab) => void;
  setActiveTab: (cardType: CardTab) => void;
  dateMode: CardFormValues['dateMode'];
  dateStart: string;
  dateEnd: string;
  setValue: UseFormSetValue<CardFormValues>;
  updateDraftValues: (values: Partial<CardFormValues>) => void;
  setSheet: Dispatch<SetStateAction<CardCreateSheetState>>;
}

/** 날짜만 입력된 카드의 안내 문구와 sheet 상태를 관리합니다. */
export function useCardCreateDateOnlyGuide({
  changeDraftCardType,
  setActiveTab,
  dateMode,
  dateStart,
  dateEnd,
  setValue,
  updateDraftValues,
  setSheet,
}: UseCardCreateDateOnlyGuideParams) {
  const openTimeFromGuide = useCallback(() => {
    setSheet({ kind: 'dateTime', focus: 'start' });
  }, [setSheet]);

  const keepDateOnly = useCallback(() => setSheet({ kind: 'none' }), [setSheet]);

  const changeToQueueCard = useCallback(() => {
    const dueDate = dateMode === 'range' && dateEnd.length > 0 ? dateEnd : dateStart;

    if (dueDate.length > 0) {
      setValue('dueDate', dueDate, { shouldDirty: true });
      updateDraftValues({ dueDate });
    }
    setActiveTab('queue');
    changeDraftCardType('queue');
    setSheet({ kind: 'none' });
  }, [
    changeDraftCardType,
    dateEnd,
    dateMode,
    dateStart,
    setActiveTab,
    setSheet,
    setValue,
    updateDraftValues,
  ]);

  return {
    openTimeFromGuide,
    keepDateOnly,
    changeToQueueCard,
  };
}

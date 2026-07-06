import { useCallback } from 'react';

import type { CardCreateSheetState } from './card-create-sheet-state';
import type { CardTab } from '@/domains/schedule/model';
import type { Dispatch, SetStateAction } from 'react';

interface UseCardCreateDateOnlyGuideParams {
  changeDraftCardType: (cardType: CardTab) => void;
  setSheet: Dispatch<SetStateAction<CardCreateSheetState>>;
}

export function useCardCreateDateOnlyGuide({
  changeDraftCardType,
  setSheet,
}: UseCardCreateDateOnlyGuideParams) {
  const openTimeFromGuide = useCallback(() => {
    setSheet({ kind: 'dateTime', focus: 'start' });
  }, [setSheet]);

  const keepDateOnly = useCallback(() => setSheet({ kind: 'none' }), [setSheet]);

  const changeToQueueCard = useCallback(() => {
    changeDraftCardType('queue');
    setSheet({ kind: 'none' });
  }, [changeDraftCardType, setSheet]);

  return {
    openTimeFromGuide,
    keepDateOnly,
    changeToQueueCard,
  };
}

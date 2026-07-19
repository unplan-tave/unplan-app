import { useCallback, useState } from 'react';

import {
  type CardFormValues,
  type CardTab,
  type ConditionTagId,
  type TimeFocus,
} from '@/domains/schedule/model';

import { useCardCreateDateOnlyGuide } from './use-card-create-date-only-guide';
import { useCardCreateDateTime } from './use-card-create-date-time';
import { useCardCreateDueDuration } from './use-card-create-due-duration';
import { useCardCreateLocation } from './use-card-create-location';
import { useCardCreateRepeat } from './use-card-create-repeat';
import { useCardCreateTagSheet } from './use-card-create-tag-sheet';

import type { CardCreateSheetState } from './card-create-sheet-state';
import type { RecurrenceValue } from '@/domains/schedule/recurrence';
import type { UseFormSetValue } from 'react-hook-form';

export type { SheetState } from './card-create-sheet-state';

interface UseCardCreateSheetsParams {
  setValue: UseFormSetValue<CardFormValues>;
  updateDraftValues: (values: Partial<CardFormValues>) => void;
  changeDraftCardType: (cardType: CardTab) => void;
  setActiveTab: (cardType: CardTab) => void;
  addLocationRecentSearch: (query: string) => void;
  hasSubmitted: boolean;
  activeTab: CardTab;
  conditionTagId: ConditionTagId;
  repeatEnabled: boolean;
  recurrence: RecurrenceValue | null;
  dateMode: CardFormValues['dateMode'];
  dateStart: string;
}

/** 카드 생성 화면의 보조 sheet 열림 상태를 관리합니다. */
export function useCardCreateSheets(params: UseCardCreateSheetsParams) {
  const {
    setValue,
    updateDraftValues,
    changeDraftCardType,
    setActiveTab,
    addLocationRecentSearch,
    hasSubmitted,
    activeTab,
    conditionTagId,
    repeatEnabled,
    recurrence,
    dateMode,
    dateStart,
  } = params;
  const [sheet, setSheet] = useState<CardCreateSheetState>({ kind: 'none' });

  const isDateTimeVisible = sheet.kind === 'dateTime';
  const dateTimeFocus: TimeFocus = sheet.kind === 'dateTime' ? sheet.focus : 'start';
  const isDueDurationVisible = sheet.kind === 'dueDuration';
  const isLocationVisible = sheet.kind === 'location';
  const isDateOnlyGuideVisible = sheet.kind === 'dateOnlyGuide';
  const closeSheet = useCallback(() => setSheet({ kind: 'none' }), []);
  const dateTime = useCardCreateDateTime({
    activeTab,
    hasSubmitted,
    setValue,
    updateDraftValues,
    setSheet,
  });
  const dueDuration = useCardCreateDueDuration({
    hasSubmitted,
    setValue,
    updateDraftValues,
    setSheet,
  });
  const repeat = useCardCreateRepeat({
    sheet,
    repeatEnabled,
    recurrence,
    dateMode,
    dateStart,
    setValue,
    updateDraftValues,
    setSheet,
  });
  const location = useCardCreateLocation({
    setValue,
    updateDraftValues,
    addLocationRecentSearch,
    setSheet,
  });
  const tagSheet = useCardCreateTagSheet({
    sheet,
    conditionTagId,
    setValue,
    updateDraftValues,
    setSheet,
  });
  const dateOnlyGuide = useCardCreateDateOnlyGuide({
    changeDraftCardType,
    setActiveTab,
    setSheet,
  });

  return {
    sheet,
    isDateTimeVisible,
    dateTimeFocus,
    isDueDurationVisible,
    isLocationVisible,
    isDateOnlyGuideVisible,
    closeSheet,
    ...dateTime,
    ...dueDuration,
    ...repeat,
    ...location,
    ...tagSheet,
    ...dateOnlyGuide,
  };
}

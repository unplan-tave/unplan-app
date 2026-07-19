import { useCallback } from 'react';

import { type CardFormValues, getScheduleDate } from '@/domains/schedule/model';
import {
  cloneRecurrenceValue,
  createDefaultCustomRecurrence,
  createPresetRecurrence,
  type RecurrencePreset,
  type RecurrenceValue,
} from '@/domains/schedule/recurrence';

import type { CardCreateSheetState, RepeatOrigin } from './card-create-sheet-state';
import type { Dispatch, SetStateAction } from 'react';
import type { UseFormSetValue } from 'react-hook-form';

interface UseCardCreateRepeatParams {
  sheet: CardCreateSheetState;
  repeatEnabled: boolean;
  recurrence: RecurrenceValue | null;
  dateMode: CardFormValues['dateMode'];
  dateStart: string;
  setValue: UseFormSetValue<CardFormValues>;
  updateDraftValues: (values: Partial<CardFormValues>) => void;
  setSheet: Dispatch<SetStateAction<CardCreateSheetState>>;
}

/** 카드 반복 설정의 입력·검증·sheet 상태를 관리합니다. */
export function useCardCreateRepeat({
  sheet,
  repeatEnabled,
  recurrence,
  dateMode,
  dateStart,
  setValue,
  updateDraftValues,
  setSheet,
}: UseCardCreateRepeatParams) {
  const scheduleDate = getScheduleDate(dateMode, dateStart);
  const repeatSheetMode =
    sheet.kind === 'repeatPreset' ? 'preset' : sheet.kind === 'repeatCustom' ? 'custom' : 'none';
  const repeatOrigin: RepeatOrigin =
    sheet.kind === 'repeatPreset' || sheet.kind === 'repeatCustom' ? sheet.origin : 'new';
  const repeatCustomDefaultValue = recurrence ?? createDefaultCustomRecurrence(scheduleDate);

  const saveRecurrence = useCallback(
    (nextRecurrence: RecurrenceValue) => {
      const nextValue = cloneRecurrenceValue(nextRecurrence);

      setValue('repeatEnabled', true, { shouldDirty: true });
      setValue('recurrence', nextValue, { shouldDirty: true });
      updateDraftValues({ repeatEnabled: true, recurrence: nextValue });
      setSheet({ kind: 'none' });
    },
    [setSheet, setValue, updateDraftValues],
  );

  const toggleRepeat = useCallback(() => {
    if (repeatEnabled) {
      setValue('repeatEnabled', false, { shouldDirty: true });
      updateDraftValues({ repeatEnabled: false });
      return;
    }

    setValue('repeatEnabled', true, { shouldDirty: true });
    updateDraftValues({ repeatEnabled: true });

    if (recurrence == null) {
      setSheet({ kind: 'repeatPreset', origin: 'new' });
    }
  }, [recurrence, repeatEnabled, setSheet, setValue, updateDraftValues]);

  const removeRepeat = useCallback(() => {
    setValue('repeatEnabled', false, { shouldDirty: true });
    setValue('recurrence', null, { shouldDirty: true });
    updateDraftValues({ repeatEnabled: false, recurrence: null });
    setSheet({ kind: 'none' });
  }, [setSheet, setValue, updateDraftValues]);

  const pressRepeatChip = useCallback(() => {
    setSheet({ kind: 'repeatCustom', origin: 'edit' });
  }, [setSheet]);

  const closeRepeatSheet = useCallback(() => {
    setSheet({ kind: 'none' });

    if (repeatOrigin === 'new' && recurrence == null) {
      setValue('repeatEnabled', false, { shouldDirty: true });
      updateDraftValues({ repeatEnabled: false });
    }
  }, [recurrence, repeatOrigin, setSheet, setValue, updateDraftValues]);

  const doneRepeatPreset = useCallback(
    (preset: Exclude<RecurrencePreset, 'custom'>) => {
      saveRecurrence(createPresetRecurrence(preset, scheduleDate));
    },
    [saveRecurrence, scheduleDate],
  );

  const openRepeatCustomSheet = useCallback(() => {
    setSheet((prev) => ({
      kind: 'repeatCustom',
      origin: prev.kind === 'repeatPreset' ? prev.origin : 'edit',
    }));
  }, [setSheet]);

  return {
    scheduleDate,
    repeatSheetMode,
    repeatCustomDefaultValue,
    toggleRepeat,
    removeRepeat,
    pressRepeatChip,
    closeRepeatSheet,
    doneRepeatPreset,
    doneRepeatCustom: saveRecurrence,
    openRepeatCustomSheet,
  };
}

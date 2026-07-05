import { useCallback, useState } from 'react';

import {
  type CardFormValues,
  type CardTab,
  type CardTagTab,
  type ConditionTagId,
  type DateTimeDraft,
  getScheduleDate,
  hasCompleteTime,
  type TimeFocus,
} from '@/domains/schedule/model';
import {
  cloneRecurrenceValue,
  createDefaultCustomRecurrence,
  createPresetRecurrence,
  type RecurrencePreset,
  type RecurrenceValue,
} from '@/domains/schedule/recurrence';

import type { DueDurationDraft } from '@/domains/schedule/queue';
import type { UseFormSetValue } from 'react-hook-form';

type RepeatOrigin = 'new' | 'edit';

type SheetState =
  | { kind: 'none' }
  | { kind: 'dateTime'; focus: TimeFocus }
  | { kind: 'dueDuration' }
  | { kind: 'repeatPreset'; origin: RepeatOrigin }
  | { kind: 'repeatCustom'; origin: RepeatOrigin }
  | { kind: 'location' }
  | { kind: 'tagPicker'; tab: CardTagTab; selectedConditionTagId: ConditionTagId | null }
  | { kind: 'dateOnlyGuide' };

export type { SheetState };

interface UseCardSheetsParams {
  setValue: UseFormSetValue<CardFormValues>;
  updateDraftValues: (values: Partial<CardFormValues>) => void;
  changeDraftCardType: (cardType: CardTab) => void;
  addLocationRecentSearch: (query: string) => void;
  hasSubmitted: boolean;
  activeTab: CardTab;
  conditionTagId: ConditionTagId;
  repeatEnabled: boolean;
  recurrence: RecurrenceValue | null;
  dateMode: CardFormValues['dateMode'];
  dateStart: string;
}

export function useCardSheets(params: UseCardSheetsParams) {
  const {
    setValue,
    updateDraftValues,
    changeDraftCardType,
    addLocationRecentSearch,
    hasSubmitted,
    activeTab,
    conditionTagId,
    repeatEnabled,
    recurrence,
    dateMode,
    dateStart,
  } = params;

  const [sheet, setSheet] = useState<SheetState>({ kind: 'none' });

  const scheduleDate = getScheduleDate(dateMode, dateStart);

  // ── visibility helpers ──

  const isDateTimeVisible = sheet.kind === 'dateTime';
  const dateTimeFocus: TimeFocus = sheet.kind === 'dateTime' ? sheet.focus : 'start';
  const isDueDurationVisible = sheet.kind === 'dueDuration';
  const isLocationVisible = sheet.kind === 'location';
  const repeatSheetMode =
    sheet.kind === 'repeatPreset' ? 'preset' : sheet.kind === 'repeatCustom' ? 'custom' : 'none';
  const tagSheetTab: CardTagTab | null = sheet.kind === 'tagPicker' ? sheet.tab : null;
  const tagSheetSelectedId: ConditionTagId | null =
    sheet.kind === 'tagPicker' ? sheet.selectedConditionTagId : null;
  const isDateOnlyGuideVisible = sheet.kind === 'dateOnlyGuide';
  const repeatOrigin: RepeatOrigin =
    sheet.kind === 'repeatPreset' || sheet.kind === 'repeatCustom' ? sheet.origin : 'new';

  // ── dateTime ──

  const openDateTimeSheet = useCallback(
    (focus: TimeFocus = 'start') => setSheet({ kind: 'dateTime', focus }),
    [],
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
      } else {
        setSheet({ kind: 'none' });
      }
    },
    [activeTab, hasSubmitted, setValue, updateDraftValues],
  );

  // ── dueDuration ──

  const openDueDurationSheet = useCallback(() => setSheet({ kind: 'dueDuration' }), []);

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
    [hasSubmitted, setValue, updateDraftValues],
  );

  // ── repeat ──

  const saveRecurrence = useCallback(
    (nextRecurrence: RecurrenceValue) => {
      const nextValue = cloneRecurrenceValue(nextRecurrence);

      setValue('repeatEnabled', true, { shouldDirty: true });
      setValue('recurrence', nextValue, { shouldDirty: true });
      updateDraftValues({ repeatEnabled: true, recurrence: nextValue });
      setSheet({ kind: 'none' });
    },
    [setValue, updateDraftValues],
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
  }, [recurrence, repeatEnabled, setValue, updateDraftValues]);

  const removeRepeat = useCallback(() => {
    setValue('repeatEnabled', false, { shouldDirty: true });
    setValue('recurrence', null, { shouldDirty: true });
    updateDraftValues({ repeatEnabled: false, recurrence: null });
    setSheet({ kind: 'none' });
  }, [setValue, updateDraftValues]);

  const pressRepeatChip = useCallback(() => {
    setSheet({ kind: 'repeatCustom', origin: 'edit' });
  }, []);

  const closeRepeatSheet = useCallback(() => {
    setSheet({ kind: 'none' });

    if (repeatOrigin === 'new' && recurrence == null) {
      setValue('repeatEnabled', false, { shouldDirty: true });
      updateDraftValues({ repeatEnabled: false });
    }
  }, [recurrence, repeatOrigin, setValue, updateDraftValues]);

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
  }, []);

  const repeatCustomDefaultValue = recurrence ?? createDefaultCustomRecurrence(scheduleDate);

  // ── location ──

  const openLocationSheet = useCallback(() => setSheet({ kind: 'location' }), []);

  const selectLocation = useCallback(
    (nextLocation: string) => {
      setValue('location', nextLocation, { shouldDirty: true });
      setValue('locationDetail', '', { shouldDirty: true });
      updateDraftValues({ location: nextLocation, locationDetail: '' });
      addLocationRecentSearch(nextLocation);
      setSheet({ kind: 'none' });
    },
    [addLocationRecentSearch, setValue, updateDraftValues],
  );

  const closeSheet = useCallback(() => setSheet({ kind: 'none' }), []);

  // ── tag picker ──

  const openConditionTagSheet = useCallback(() => {
    setSheet({ kind: 'tagPicker', tab: 'condition', selectedConditionTagId: conditionTagId });
  }, [conditionTagId]);

  const openPersonalTagSheet = useCallback(() => {
    setSheet({ kind: 'tagPicker', tab: 'personal', selectedConditionTagId: conditionTagId });
  }, [conditionTagId]);

  const switchTagTab = useCallback((tab: CardTagTab) => {
    setSheet((prev) => (prev.kind === 'tagPicker' ? { ...prev, tab } : prev));
  }, []);

  const selectConditionTag = useCallback((tagId: ConditionTagId) => {
    setSheet((prev) =>
      prev.kind === 'tagPicker'
        ? {
            ...prev,
            selectedConditionTagId: prev.selectedConditionTagId === tagId ? null : tagId,
          }
        : prev,
    );
  }, []);

  const confirmConditionTag = useCallback(() => {
    if (sheet.kind !== 'tagPicker' || sheet.selectedConditionTagId == null) {
      return;
    }

    setValue('conditionTagId', sheet.selectedConditionTagId, { shouldDirty: true });
    updateDraftValues({ conditionTagId: sheet.selectedConditionTagId });
    setSheet({ kind: 'none' });
  }, [setValue, sheet, updateDraftValues]);

  const confirmPersonalTags = useCallback(
    (nextPersonalTagIds: string[]) => {
      setValue('personalTagIds', nextPersonalTagIds, { shouldDirty: true });
      updateDraftValues({ personalTagIds: nextPersonalTagIds });
      setSheet({ kind: 'none' });
    },
    [setValue, updateDraftValues],
  );

  const closeTagSheet = useCallback(() => setSheet({ kind: 'none' }), []);

  // ── dateOnlyGuide ──

  const openTimeFromGuide = useCallback(() => {
    setSheet({ kind: 'dateTime', focus: 'start' });
  }, []);

  const keepDateOnly = useCallback(() => setSheet({ kind: 'none' }), []);

  const changeToQueueCard = useCallback(() => {
    changeDraftCardType('queue');
    setSheet({ kind: 'none' });
  }, [changeDraftCardType]);

  // ── sync tag sheet selectedId when conditionTagId changes from auto-suggest ──

  const syncTagSheetSelectedId = useCallback((tagId: ConditionTagId) => {
    setSheet((prev) =>
      prev.kind === 'tagPicker' ? { ...prev, selectedConditionTagId: tagId } : prev,
    );
  }, []);

  return {
    sheet,
    scheduleDate,

    // visibility
    isDateTimeVisible,
    dateTimeFocus,
    isDueDurationVisible,
    isLocationVisible,
    repeatSheetMode,
    tagSheetTab,
    tagSheetSelectedId,
    isDateOnlyGuideVisible,
    repeatCustomDefaultValue,

    // dateTime
    openDateTimeSheet,
    saveDateTime,

    // dueDuration
    openDueDurationSheet,
    saveDueDuration,

    // repeat
    toggleRepeat,
    removeRepeat,
    pressRepeatChip,
    closeRepeatSheet,
    doneRepeatPreset,
    doneRepeatCustom: saveRecurrence,
    openRepeatCustomSheet,

    // location
    openLocationSheet,
    selectLocation,

    // general
    closeSheet,

    // tag picker
    openConditionTagSheet,
    openPersonalTagSheet,
    switchTagTab,
    selectConditionTag,
    confirmConditionTag,
    confirmPersonalTags,
    closeTagSheet,

    // dateOnlyGuide
    openTimeFromGuide,
    keepDateOnly,
    changeToQueueCard,

    // sync
    syncTagSheetSelectedId,
  };
}

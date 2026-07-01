import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, type KeyboardEvent, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { DateOnlyGuideModal } from '@/components/pin-card/date-only-guide-modal';
import { DateTimeBottomSheet } from '@/components/pin-card/date-time-bottom-sheet';
import { DueDurationBottomSheet } from '@/components/pin-card/due-duration-bottom-sheet';
import { LocationBottomSheet } from '@/components/pin-card/location-bottom-sheet';
import { PinCardCreateHeader } from '@/components/pin-card/pin-card-create-header';
import { PinCardForm } from '@/components/pin-card/pin-card-form';
import { PinCardToast } from '@/components/pin-card/pin-card-required-toast';
import { RepeatCustomBottomSheet } from '@/components/pin-card/repeat-custom-bottom-sheet';
import { RepeatPresetBottomSheet } from '@/components/pin-card/repeat-preset-bottom-sheet';
import { TagPickerSheet, type TagTab } from '@/components/pin-card/tag-picker-sheet';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { colors, spacing } from '@/constants/theme';
import { MEMO_MAX_LENGTH } from '@/state/pin-card/model';
import {
  type CardTab,
  type ConditionTagId,
  createDefaultPinCardFormValues,
  type DateTimeDraft,
  getConditionTagById,
  getDateValue,
  getSuggestedConditionTag,
  getTimeValue,
  hasCompleteTime,
  type PinCardFormValues,
  type TimeFocus,
} from '@/state/pin-card/model';
import {
  type DueDurationDraft,
  hasDueDate,
  hasQueueDurationOrUnknown,
  isQueueFormComplete,
} from '@/state/pin-card/queue';
import {
  cloneRecurrenceValue,
  createDefaultCustomRecurrence,
  createPresetRecurrence,
  type RecurrencePreset,
  type RecurrenceValue,
} from '@/state/pin-card/recurrence';
import { usePinCardStore } from '@/state/pin-card/use-pin-card-store';

type ToastState = {
  message: string;
  variant: 'warning' | 'confirm';
} | null;

type RepeatSheetMode = 'none' | 'preset' | 'custom';
type RepeatSheetOrigin = 'new' | 'edit';

const SCREEN_MAX_WIDTH = 393;
const CONTENT_MAX_WIDTH = 353;
const CONTENT_TOP = 100;
const FORM_GAP = spacing[6];

export function PinCardCreateScreen() {
  const { cardId, type } = useLocalSearchParams<{ cardId?: string; type?: 'queue' }>();
  const initialCardType: CardTab = type === 'queue' ? 'queue' : 'pin';
  const initialValues = useMemo(() => createDefaultPinCardFormValues(), []);
  const [activeTab, setActiveTab] = useState<CardTab>(initialCardType);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [showTagFeedback, setShowTagFeedback] = useState(false);
  const [showTagErrorFeedback, setShowTagErrorFeedback] = useState(false);
  const [tagSheetTab, setTagSheetTab] = useState<TagTab | null>(null);
  const [tagSheetSelectedId, setTagSheetSelectedId] = useState<ConditionTagId | null>(
    initialValues.conditionTagId,
  );
  const [isDateTimeSheetVisible, setIsDateTimeSheetVisible] = useState(false);
  const [isDueDurationSheetVisible, setIsDueDurationSheetVisible] = useState(false);
  const [dateTimeFocus, setDateTimeFocus] = useState<TimeFocus>('start');
  const [dateOnlyGuideVisible, setDateOnlyGuideVisible] = useState(false);
  const [repeatSheetMode, setRepeatSheetMode] = useState<RepeatSheetMode>('none');
  const [repeatSheetOrigin, setRepeatSheetOrigin] = useState<RepeatSheetOrigin>('new');
  const [isLocationSheetVisible, setIsLocationSheetVisible] = useState(false);
  const beginCreate = usePinCardStore((store) => store.beginCreate);
  const beginEdit = usePinCardStore((store) => store.beginEdit);
  const updateDraftValues = usePinCardStore((store) => store.updateDraftValues);
  const changeDraftCardType = usePinCardStore((store) => store.changeDraftCardType);
  const personalTags = usePinCardStore((store) => store.personalTags);
  const createPersonalTag = usePinCardStore((store) => store.createPersonalTag);
  const locationRecentSearches = usePinCardStore((store) => store.locationRecentSearches);
  const addLocationRecentSearch = usePinCardStore((store) => store.addLocationRecentSearch);
  const deleteLocationRecentSearch = usePinCardStore((store) => store.deleteLocationRecentSearch);
  const deleteAllLocationRecentSearches = usePinCardStore(
    (store) => store.deleteAllLocationRecentSearches,
  );
  const saveDraft = usePinCardStore((store) => store.saveDraft);
  const deleteCard = usePinCardStore((store) => store.deleteCard);
  const discardDraft = usePinCardStore((store) => store.discardDraft);
  const draftMode = usePinCardStore((store) => store.draft?.mode ?? 'create');
  const scrollRef = useRef<ScrollView>(null);
  const isMemoFocusedRef = useRef(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PinCardFormValues>({
    mode: 'onSubmit',
    defaultValues: initialValues,
  });
  const title = watch('title');
  const conditionTagId = watch('conditionTagId');
  const personalTagIds = watch('personalTagIds');
  const dateMode = watch('dateMode');
  const dateStart = watch('dateStart');
  const dateEnd = watch('dateEnd');
  const timeFilled = watch('timeFilled');
  const timeStart = watch('timeStart');
  const timeEnd = watch('timeEnd');
  const repeatEnabled = watch('repeatEnabled');
  const recurrence = watch('recurrence');
  const location = watch('location');
  const locationDetail = watch('locationDetail');
  const memo = watch('memo');
  const dueDate = watch('dueDate');
  const durationHours = watch('durationHours');
  const durationMinutes = watch('durationMinutes');
  const durationUnknown = watch('durationUnknown');
  const primaryTag = getConditionTagById(conditionTagId);
  const selectedPersonalTags = personalTags.filter((tag) => personalTagIds.includes(tag.id));
  const previousTitleRef = useRef(title);
  const dateValue = getDateValue(dateMode, dateStart, dateEnd);
  const timeValue = getTimeValue(timeFilled, timeStart, timeEnd);
  const isTitleMissing = title.trim().length === 0;
  const isDateMissing = dateMode === 'empty';
  const isTimeMissing = !timeFilled;
  const isDueMissing = !hasDueDate(dueDate);
  const isDurationMissing = !hasQueueDurationOrUnknown(
    durationHours,
    durationMinutes,
    durationUnknown,
  );
  const isPinRequiredComplete = !isTitleMissing && !isDateMissing && !isTimeMissing;
  const isQueueRequiredComplete = isQueueFormComplete({
    title,
    dueDate,
    durationHours,
    durationMinutes,
    durationUnknown,
  });
  const isRequiredComplete =
    activeTab === 'queue' ? isQueueRequiredComplete : isPinRequiredComplete;
  const shouldShowTitleError = hasSubmitted && (Boolean(errors.title) || isTitleMissing);
  const shouldShowDateError =
    activeTab === 'pin' && hasSubmitted && (Boolean(errors.dateMode) || isDateMissing);
  const shouldShowTimeError =
    activeTab === 'pin' && hasSubmitted && (Boolean(errors.timeFilled) || isTimeMissing);
  const shouldShowDueError = activeTab === 'queue' && hasSubmitted && isDueMissing;
  const shouldShowDurationError = activeTab === 'queue' && hasSubmitted && isDurationMissing;
  const tagFeedback = showTagErrorFeedback ? 'error' : showTagFeedback ? 'success' : 'none';

  useEffect(() => {
    const nextDraft =
      cardId == null ? beginCreate(initialValues, initialCardType) : beginEdit(cardId);

    if (nextDraft == null) {
      router.back();
      return;
    }

    setActiveTab(nextDraft.cardType);
    setTagSheetSelectedId(nextDraft.values.conditionTagId);
    previousTitleRef.current = nextDraft.values.title;
    reset(nextDraft.values);
  }, [beginCreate, beginEdit, cardId, initialCardType, initialValues, reset]);

  useEffect(() => {
    updateDraftValues({
      title,
      conditionTagId,
      personalTagIds,
      dateMode,
      dateStart,
      dateEnd,
      timeFilled,
      timeStart,
      timeEnd,
      location,
      locationDetail,
      memo,
      repeatEnabled,
      recurrence,
      dueDate,
      durationHours,
      durationMinutes,
      durationUnknown,
    });
  }, [
    conditionTagId,
    dateEnd,
    dateMode,
    dateStart,
    dueDate,
    durationHours,
    durationMinutes,
    durationUnknown,
    location,
    locationDetail,
    memo,
    personalTagIds,
    repeatEnabled,
    recurrence,
    timeEnd,
    timeFilled,
    timeStart,
    title,
    updateDraftValues,
  ]);

  useEffect(() => {
    if (toast == null) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setToast(null);
    }, 3_000);

    return () => clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    if (title === previousTitleRef.current) {
      return;
    }

    previousTitleRef.current = title;

    if (title.trim().length === 0) {
      setShowTagFeedback(false);
      setShowTagErrorFeedback(false);
      setValue('conditionTagId', 'daily', { shouldDirty: true });
      updateDraftValues({ conditionTagId: 'daily' });
      setTagSheetSelectedId('daily');
      return;
    }

    const nextTag = getSuggestedConditionTag(title);

    if (nextTag == null) {
      setValue('conditionTagId', 'daily', { shouldDirty: true });
      updateDraftValues({ conditionTagId: 'daily' });
      setTagSheetSelectedId('daily');
      setShowTagFeedback(false);
      setShowTagErrorFeedback(true);
      setTagSheetTab('condition');
      return;
    }

    if (conditionTagId !== nextTag.id) {
      setValue('conditionTagId', nextTag.id, { shouldDirty: true });
      updateDraftValues({ conditionTagId: nextTag.id });
      setTagSheetSelectedId(nextTag.id);
      setShowTagErrorFeedback(false);
      setShowTagFeedback(true);
    }
  }, [conditionTagId, setValue, title, updateDraftValues]);

  useEffect(() => {
    if (!showTagFeedback) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setShowTagFeedback(false);
    }, 3_000);

    return () => clearTimeout(timeoutId);
  }, [showTagFeedback]);

  useEffect(() => {
    if (!showTagErrorFeedback) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setShowTagErrorFeedback(false);
    }, 3_000);

    return () => clearTimeout(timeoutId);
  }, [showTagErrorFeedback]);

  const handleClose = useCallback(() => {
    discardDraft();
    router.replace('/(tabs)');
  }, [discardDraft]);

  const handleValidSubmit = useCallback(
    (values: PinCardFormValues) => {
      const saved = saveDraft(values);

      if (saved != null) {
        router.replace(`/pin-card/view?cardId=${saved.id}`);
        return;
      }

      router.back();
    },
    [saveDraft],
  );

  const handleInvalidSubmit = useCallback(() => {
    setHasSubmitted(true);
    setToast({ message: '아직 입력되지 않은 필수 정보가 있어요!', variant: 'warning' });
  }, []);

  const handleOpenDateTimeSheet = useCallback((focus: TimeFocus = 'start') => {
    setDateTimeFocus(focus);
    setIsDateTimeSheetVisible(true);
  }, []);

  const handleConfirmPersonalTags = useCallback(
    (nextPersonalTagIds: string[]) => {
      setValue('personalTagIds', nextPersonalTagIds, { shouldDirty: true });
      updateDraftValues({ personalTagIds: nextPersonalTagIds });
      setTagSheetTab(null);
    },
    [setValue, updateDraftValues],
  );

  const handleSaveDateTime = useCallback(
    (draft: DateTimeDraft) => {
      const nextTimeFilled = hasCompleteTime(draft);

      setValue('dateMode', draft.dateMode, {
        shouldDirty: true,
        shouldValidate: hasSubmitted,
      });
      setValue('dateStart', draft.dateStart, { shouldDirty: true });
      setValue('dateEnd', draft.dateEnd, { shouldDirty: true });
      setValue('timeFilled', nextTimeFilled, {
        shouldDirty: true,
        shouldValidate: hasSubmitted,
      });
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
      setIsDateTimeSheetVisible(false);

      if (activeTab === 'pin' && draft.dateMode !== 'empty' && !nextTimeFilled) {
        setDateOnlyGuideVisible(true);
      }
    },
    [activeTab, hasSubmitted, setValue, updateDraftValues],
  );

  const handleSaveDueDuration = useCallback(
    (draft: DueDurationDraft) => {
      setValue('dueDate', draft.dueDate, {
        shouldDirty: true,
        shouldValidate: hasSubmitted,
      });
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
      setIsDueDurationSheetVisible(false);
    },
    [hasSubmitted, setValue, updateDraftValues],
  );

  const handleOpenDueDurationSheet = useCallback(() => {
    setIsDueDurationSheetVisible(true);
  }, []);

  const handleDurationUnknown = useCallback(() => {
    setToast({
      message: '시간대 추천이 어려울 수 있어요!',
      variant: 'confirm',
    });
  }, []);

  const scheduleDate = getScheduleDate(dateMode, dateStart);

  const saveRecurrence = useCallback(
    (nextRecurrence: RecurrenceValue) => {
      const nextValue = cloneRecurrenceValue(nextRecurrence);

      setValue('repeatEnabled', true, { shouldDirty: true });
      setValue('recurrence', nextValue, { shouldDirty: true });
      updateDraftValues({ repeatEnabled: true, recurrence: nextValue });
      setRepeatSheetMode('none');
    },
    [setValue, updateDraftValues],
  );

  const handleToggleRepeat = useCallback(() => {
    if (repeatEnabled) {
      setValue('repeatEnabled', false, { shouldDirty: true });
      updateDraftValues({ repeatEnabled: false });
      return;
    }

    setValue('repeatEnabled', true, { shouldDirty: true });
    updateDraftValues({ repeatEnabled: true });

    if (recurrence != null) {
      return;
    }

    setRepeatSheetOrigin('new');
    setRepeatSheetMode('preset');
  }, [recurrence, repeatEnabled, setValue, updateDraftValues]);

  const handleRemoveRepeat = useCallback(() => {
    setValue('repeatEnabled', false, { shouldDirty: true });
    setValue('recurrence', null, { shouldDirty: true });
    updateDraftValues({ repeatEnabled: false, recurrence: null });
    setRepeatSheetMode('none');
  }, [setValue, updateDraftValues]);

  const handlePressRepeatChip = useCallback(() => {
    setRepeatSheetOrigin('edit');
    setRepeatSheetMode('custom');
  }, []);

  const handleCloseRepeatPresetSheet = useCallback(() => {
    setRepeatSheetMode('none');

    if (repeatSheetOrigin === 'new' && recurrence == null) {
      setValue('repeatEnabled', false, { shouldDirty: true });
      updateDraftValues({ repeatEnabled: false });
    }
  }, [recurrence, repeatSheetOrigin, setValue, updateDraftValues]);

  const handleCloseRepeatCustomSheet = useCallback(() => {
    setRepeatSheetMode('none');

    if (repeatSheetOrigin === 'new' && recurrence == null) {
      setValue('repeatEnabled', false, { shouldDirty: true });
      updateDraftValues({ repeatEnabled: false });
    }
  }, [recurrence, repeatSheetOrigin, setValue, updateDraftValues]);

  const handleDoneRepeatPreset = useCallback(
    (preset: Exclude<RecurrencePreset, 'custom'>) => {
      saveRecurrence(createPresetRecurrence(preset, scheduleDate));
    },
    [saveRecurrence, scheduleDate],
  );

  const handleOpenRepeatCustomSheet = useCallback(() => {
    setRepeatSheetMode('custom');
  }, []);

  const handleDoneRepeatCustom = useCallback(
    (nextRecurrence: RecurrenceValue) => {
      saveRecurrence(nextRecurrence);
    },
    [saveRecurrence],
  );

  const handleOpenLocationSheet = useCallback(() => {
    setIsLocationSheetVisible(true);
  }, []);

  const handleSelectLocation = useCallback(
    (nextLocation: string) => {
      setValue('location', nextLocation, { shouldDirty: true });
      setValue('locationDetail', '', { shouldDirty: true });
      updateDraftValues({ location: nextLocation, locationDetail: '' });
      addLocationRecentSearch(nextLocation);
      setIsLocationSheetVisible(false);
    },
    [addLocationRecentSearch, setValue, updateDraftValues],
  );

  // const handleToggleReminder = useCallback(() => {
  //   const nextReminderEnabled = !reminderEnabled;
  //   setValue('reminderEnabled', nextReminderEnabled, { shouldDirty: true });
  //   updateDraftValues({ reminderEnabled: nextReminderEnabled });
  // }, [reminderEnabled, setValue, updateDraftValues]);

  const handleSelectConditionTag = useCallback((tagId: ConditionTagId) => {
    setTagSheetSelectedId((prev) => (prev === tagId ? null : tagId));
  }, []);

  const handleConfirmConditionTag = useCallback(() => {
    if (tagSheetSelectedId == null) {
      return;
    }

    setValue('conditionTagId', tagSheetSelectedId, { shouldDirty: true });
    updateDraftValues({ conditionTagId: tagSheetSelectedId });
    setTagSheetTab(null);
    setShowTagErrorFeedback(false);
  }, [setValue, tagSheetSelectedId, updateDraftValues]);

  const handleCloseConditionTagSheet = useCallback(() => {
    setTagSheetSelectedId(conditionTagId);
    setTagSheetTab(null);
  }, [conditionTagId]);

  const handleOpenTimeFromGuide = useCallback(() => {
    setDateOnlyGuideVisible(false);
    setDateTimeFocus('start');
    setIsDateTimeSheetVisible(true);
  }, []);

  const handleKeepDateOnly = useCallback(() => {
    setDateOnlyGuideVisible(false);
  }, []);

  const handleChangeToQueueCard = useCallback(() => {
    setActiveTab('queue');
    changeDraftCardType('queue');
    setDateOnlyGuideVisible(false);
  }, [changeDraftCardType]);

  const handleChangeTab = useCallback(
    (tab: CardTab) => {
      setActiveTab(tab);
      changeDraftCardType(tab);
    },
    [changeDraftCardType],
  );

  const handleDelete = useCallback(() => {
    if (cardId == null) {
      return;
    }

    deleteCard(cardId);
    router.back();
  }, [cardId, deleteCard]);

  const handleDone = handleSubmit(handleValidSubmit, handleInvalidSubmit);

  const scrollMemoIntoView = useCallback(() => {
    const scroll = () => scrollRef.current?.scrollToEnd({ animated: true });
    requestAnimationFrame(scroll);
    setTimeout(scroll, 100);
  }, []);

  const handleMemoFocus = useCallback(() => {
    isMemoFocusedRef.current = true;
    scrollMemoIntoView();
  }, [scrollMemoIntoView]);

  const handleMemoBlur = useCallback(() => {
    isMemoFocusedRef.current = false;
  }, []);

  const handleMemoReachLimit = useCallback(() => {
    setToast({ message: `${MEMO_MAX_LENGTH}자까지만 입력 가능해요!`, variant: 'warning' });
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const handleKeyboardShow = (event: KeyboardEvent) => {
      setKeyboardHeight(event.endCoordinates.height);

      if (!isMemoFocusedRef.current) {
        return;
      }

      const delay = Platform.OS === 'ios' ? (event.duration ?? 250) : 100;
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), delay);
    };

    const handleKeyboardHide = () => {
      setKeyboardHeight(0);
    };

    const showSubscription = Keyboard.addListener(showEvent, handleKeyboardShow);
    const hideSubscription = Keyboard.addListener(hideEvent, handleKeyboardHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const toastBottomOffset = keyboardHeight > 0 ? keyboardHeight + spacing[3] : 70.5;

  return (
    <ScreenLayout
      backgroundColor={colors.surface}
      contentStyle={styles.screenContent}
      useSafeArea={false}
    >
      <StatusBar style="light" />
      <View style={styles.canvas}>
        <PinCardCreateHeader
          deleteVisible={draftMode === 'edit'}
          doneEnabled={isRequiredComplete}
          onClose={handleClose}
          onDelete={handleDelete}
          onDone={handleDone}
        />

        <ScrollView
          ref={scrollRef}
          automaticallyAdjustKeyboardInsets
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <PinCardForm
            control={control}
            activeTab={activeTab}
            primaryTag={primaryTag}
            personalTags={selectedPersonalTags}
            dateMode={dateMode}
            dateValue={dateValue}
            timeFilled={timeFilled}
            timeValue={timeValue}
            repeatEnabled={repeatEnabled}
            recurrence={recurrence}
            // reminderEnabled={reminderEnabled}
            showTitleError={shouldShowTitleError}
            showDateError={shouldShowDateError}
            showTimeError={shouldShowTimeError}
            showDueError={shouldShowDueError}
            showDurationError={shouldShowDurationError}
            dueDate={dueDate}
            durationHours={durationHours}
            durationMinutes={durationMinutes}
            durationUnknown={durationUnknown}
            tagFeedback={tagFeedback}
            onChangeTab={handleChangeTab}
            onOpenConditionTag={() => setTagSheetTab('condition')}
            onOpenPersonalTags={() => setTagSheetTab('personal')}
            onOpenDateTime={handleOpenDateTimeSheet}
            onOpenDueDuration={handleOpenDueDurationSheet}
            onOpenLocation={handleOpenLocationSheet}
            onToggleRepeat={handleToggleRepeat}
            onPressRepeatChip={handlePressRepeatChip}
            onRemoveRepeat={handleRemoveRepeat}
            onMemoBlur={handleMemoBlur}
            onMemoFocus={handleMemoFocus}
            onMemoReachLimit={handleMemoReachLimit}
            // onToggleReminder={handleToggleReminder}
          />
        </ScrollView>

        <TagPickerSheet
          visible={tagSheetTab !== null}
          activeTab={tagSheetTab ?? 'condition'}
          selectedConditionTagId={tagSheetSelectedId}
          personalTags={personalTags}
          selectedPersonalTagIds={personalTagIds}
          onSwitchTab={setTagSheetTab}
          onClose={handleCloseConditionTagSheet}
          onSelectConditionTag={handleSelectConditionTag}
          onDoneConditionTag={handleConfirmConditionTag}
          onCreatePersonalTag={createPersonalTag}
          onDonePersonalTags={handleConfirmPersonalTags}
        />
        <DateTimeBottomSheet
          visible={isDateTimeSheetVisible}
          focus={dateTimeFocus}
          value={{
            dateMode,
            dateStart,
            dateEnd,
            timeStart,
            timeEnd,
          }}
          onClose={() => setIsDateTimeSheetVisible(false)}
          onDone={handleSaveDateTime}
        />
        <DateOnlyGuideModal
          visible={dateOnlyGuideVisible && activeTab === 'pin'}
          onChangeToQueue={handleChangeToQueueCard}
          onOpenTime={handleOpenTimeFromGuide}
          onKeep={handleKeepDateOnly}
        />
        <DueDurationBottomSheet
          visible={isDueDurationSheetVisible}
          value={{
            dueDate,
            durationHours,
            durationMinutes,
            durationUnknown,
          }}
          onClose={() => setIsDueDurationSheetVisible(false)}
          onDone={handleSaveDueDuration}
          onDurationUnknown={handleDurationUnknown}
        />
        <RepeatPresetBottomSheet
          visible={repeatSheetMode === 'preset'}
          value={recurrence}
          onClose={handleCloseRepeatPresetSheet}
          onOpenCustom={handleOpenRepeatCustomSheet}
          onDone={handleDoneRepeatPreset}
        />
        <RepeatCustomBottomSheet
          visible={repeatSheetMode === 'custom'}
          value={recurrence ?? createDefaultCustomRecurrence(scheduleDate)}
          scheduleDate={scheduleDate}
          onClose={handleCloseRepeatCustomSheet}
          onDone={handleDoneRepeatCustom}
        />
        <LocationBottomSheet
          visible={isLocationSheetVisible}
          recentSearches={locationRecentSearches}
          onClose={() => setIsLocationSheetVisible(false)}
          onSelect={handleSelectLocation}
          onDeleteSearch={deleteLocationRecentSearch}
          onDeleteAllSearches={deleteAllLocationRecentSearches}
        />
      </View>
      {toast != null ? (
        <PinCardToast
          bottomOffset={toastBottomOffset}
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
          onConfirm={() => setToast(null)}
        />
      ) : null}
    </ScreenLayout>
  );
}

function getScheduleDate(dateMode: PinCardFormValues['dateMode'], dateStart: string) {
  if (dateMode === 'single' || dateMode === 'range') {
    return dateStart;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
    position: 'relative',
  },
  scroll: {
    flex: 1,
  },
  canvas: {
    width: '100%',
    maxWidth: SCREEN_MAX_WIDTH,
    flex: 1,
    alignSelf: 'center',
  },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    gap: FORM_GAP,
    paddingTop: CONTENT_TOP,
    paddingBottom: spacing[16],
  },
});

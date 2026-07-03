import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { CardCreateHeader } from '@/components/features/card/card-create-header';
import { CardToast } from '@/components/features/card/card-toast';
import { CardForm } from '@/components/features/card/form/card-form';
import { DateOnlyGuideModal } from '@/components/features/card/modals/date-only-guide-modal';
import { DateTimeSheet } from '@/components/features/card/sheets/date-time-sheet';
import { DueDurationSheet } from '@/components/features/card/sheets/due-duration-sheet';
import { LocationSheet } from '@/components/features/card/sheets/location-sheet';
import { RepeatCustomSheet } from '@/components/features/card/sheets/repeat-custom-sheet';
import { RepeatPresetSheet } from '@/components/features/card/sheets/repeat-preset-sheet';
import { TagPickerSheet } from '@/components/features/card/sheets/tag-picker-sheet';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { colors, spacing } from '@/constants/theme';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';
import {
  type CardFormValues,
  type CardTab,
  createDefaultCardFormValues,
  getConditionTagById,
  getDateValue,
  getSuggestedConditionTag,
  getTimeValue,
  MEMO_MAX_LENGTH,
} from '@/state/card/model';
import { hasDueDate, hasQueueDurationOrUnknown, isQueueFormComplete } from '@/state/card/queue';

import { useCardPageData, useCardInit } from './hooks/use-card-page-data';
import { useCardSheets } from './hooks/use-card-sheets';

type ToastState = {
  message: string;
  variant: 'warning' | 'confirm';
} | null;

const SCREEN_MAX_WIDTH = 393;
const CONTENT_MAX_WIDTH = 353;
const CONTENT_TOP = 100;
const FORM_GAP = spacing[6];

export function CardCreateScreen() {
  const { cardId, type } = useLocalSearchParams<{ cardId?: string; type?: 'queue' }>();
  const initialCardType: CardTab = type === 'queue' ? 'queue' : 'pin';
  const initialValues = useMemo(() => createDefaultCardFormValues(), []);

  const [activeTab, setActiveTab] = useState<CardTab>(initialCardType);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [showTagFeedback, setShowTagFeedback] = useState(false);
  const [showTagErrorFeedback, setShowTagErrorFeedback] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const isMemoFocusedRef = useRef(false);
  const previousTitleRef = useRef('');

  const keyboardHeight = useKeyboardHeight();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CardFormValues>({ mode: 'onSubmit', defaultValues: initialValues });

  const title = watch('title') ?? '';
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

  const {
    updateDraftValues,
    changeDraftCardType,
    personalTags,
    createPersonalTag,
    locationRecentSearches,
    addLocationRecentSearch,
    deleteLocationRecentSearch,
    deleteAllLocationRecentSearches,
    saveDraft,
    deleteCard,
    discardDraft,
    draftMode,
  } = useCardPageData();

  const sheets = useCardSheets({
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
  });

  // ── derived ──

  const primaryTag = getConditionTagById(conditionTagId);
  const selectedPersonalTags = personalTags.filter((tag) => personalTagIds.includes(tag.id));
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
  const toastBottomOffset = keyboardHeight > 0 ? keyboardHeight + spacing[3] : 70.5;

  // ── init ──

  const { syncTagSheetSelectedId } = sheets;
  const handleInit = useCallback(
    (cardType: CardTab, values: CardFormValues) => {
      setActiveTab(cardType);
      syncTagSheetSelectedId(values.conditionTagId);
      previousTitleRef.current = values.title;
    },
    [syncTagSheetSelectedId],
  );

  useCardInit({
    cardId,
    initialCardType,
    initialValues,
    reset,
    onInit: handleInit,
  });

  // ── draft sync ──

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

  // ── toast auto-dismiss ──

  useEffect(() => {
    if (toast == null) return;
    const id = setTimeout(() => setToast(null), 3_000);
    return () => clearTimeout(id);
  }, [toast]);

  // ── tag auto-suggest ──

  useEffect(() => {
    if (title === previousTitleRef.current) return;
    previousTitleRef.current = title;

    if (title.trim().length === 0) {
      setShowTagFeedback(false);
      setShowTagErrorFeedback(false);
      setValue('conditionTagId', 'daily', { shouldDirty: true });
      updateDraftValues({ conditionTagId: 'daily' });
      sheets.syncTagSheetSelectedId('daily');
      return;
    }

    const nextTag = getSuggestedConditionTag(title);

    if (nextTag == null) {
      setValue('conditionTagId', 'daily', { shouldDirty: true });
      updateDraftValues({ conditionTagId: 'daily' });
      sheets.syncTagSheetSelectedId('daily');
      setShowTagFeedback(false);
      setShowTagErrorFeedback(true);
      return;
    }

    if (conditionTagId !== nextTag.id) {
      setValue('conditionTagId', nextTag.id, { shouldDirty: true });
      updateDraftValues({ conditionTagId: nextTag.id });
      sheets.syncTagSheetSelectedId(nextTag.id);
      setShowTagErrorFeedback(false);
      setShowTagFeedback(true);
    }
  }, [conditionTagId, setValue, title, updateDraftValues, sheets]);

  // ── tag feedback auto-dismiss ──

  useEffect(() => {
    if (!showTagFeedback) return;
    const id = setTimeout(() => setShowTagFeedback(false), 3_000);
    return () => clearTimeout(id);
  }, [showTagFeedback]);

  useEffect(() => {
    if (!showTagErrorFeedback) return;
    const id = setTimeout(() => setShowTagErrorFeedback(false), 3_000);
    return () => clearTimeout(id);
  }, [showTagErrorFeedback]);

  // ── memo scroll on keyboard ──

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';

    const sub = Keyboard.addListener(showEvent, (e) => {
      if (!isMemoFocusedRef.current) return;
      const delay = Platform.OS === 'ios' ? (e.duration ?? 250) : 100;
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), delay);
    });

    return () => sub.remove();
  }, []);

  // ── screen handlers ──

  const handleClose = useCallback(() => {
    discardDraft();
    router.replace('/(tabs)');
  }, [discardDraft]);

  const handleValidSubmit = useCallback(
    (values: CardFormValues) => {
      const saved = saveDraft(values);
      if (saved != null) {
        router.replace(`/card/view?cardId=${saved.id}`);
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

  const handleDurationUnknown = useCallback(() => {
    setToast({ message: '시간대 추천이 어려울 수 있어요!', variant: 'confirm' });
  }, []);

  const handleChangeTab = useCallback(
    (tab: CardTab) => {
      setActiveTab(tab);
      changeDraftCardType(tab);
    },
    [changeDraftCardType],
  );

  const handleDelete = useCallback(() => {
    if (cardId == null) return;
    deleteCard(cardId);
    router.back();
  }, [cardId, deleteCard]);

  const handleDone = useCallback(() => {
    if (!isRequiredComplete) {
      handleInvalidSubmit();
      return;
    }
    void handleSubmit(handleValidSubmit, handleInvalidSubmit)();
  }, [handleInvalidSubmit, handleSubmit, handleValidSubmit, isRequiredComplete]);

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

  return (
    <ScreenLayout
      backgroundColor={colors.surface}
      contentStyle={styles.screenContent}
      useSafeArea={false}
    >
      <StatusBar style="light" />
      <View style={styles.canvas}>
        <CardCreateHeader
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
          <CardForm
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
            onOpenConditionTag={sheets.openConditionTagSheet}
            onOpenPersonalTags={sheets.openPersonalTagSheet}
            onOpenDateTime={sheets.openDateTimeSheet}
            onOpenDueDuration={sheets.openDueDurationSheet}
            onOpenLocation={sheets.openLocationSheet}
            onToggleRepeat={sheets.toggleRepeat}
            onPressRepeatChip={sheets.pressRepeatChip}
            onRemoveRepeat={sheets.removeRepeat}
            onMemoBlur={handleMemoBlur}
            onMemoFocus={handleMemoFocus}
            onMemoReachLimit={handleMemoReachLimit}
          />
        </ScrollView>

        <TagPickerSheet
          visible={sheets.tagSheetTab !== null}
          activeTab={sheets.tagSheetTab ?? 'condition'}
          selectedConditionTagId={sheets.tagSheetSelectedId}
          personalTags={personalTags}
          selectedPersonalTagIds={personalTagIds}
          onSwitchTab={sheets.switchTagTab}
          onClose={sheets.closeTagSheet}
          onSelectConditionTag={sheets.selectConditionTag}
          onDoneConditionTag={sheets.confirmConditionTag}
          onCreatePersonalTag={createPersonalTag}
          onDonePersonalTags={sheets.confirmPersonalTags}
        />
        <DateTimeSheet
          visible={sheets.isDateTimeVisible}
          focus={sheets.dateTimeFocus}
          value={{ dateMode, dateStart, dateEnd, timeStart, timeEnd }}
          onClose={sheets.closeSheet}
          onDone={sheets.saveDateTime}
        />
        <DateOnlyGuideModal
          visible={sheets.isDateOnlyGuideVisible && activeTab === 'pin'}
          onChangeToQueue={sheets.changeToQueueCard}
          onOpenTime={sheets.openTimeFromGuide}
          onKeep={sheets.keepDateOnly}
        />
        <DueDurationSheet
          visible={sheets.isDueDurationVisible}
          value={{ dueDate, durationHours, durationMinutes, durationUnknown }}
          onClose={sheets.closeSheet}
          onDone={sheets.saveDueDuration}
          onDurationUnknown={handleDurationUnknown}
        />
        <RepeatPresetSheet
          visible={sheets.repeatSheetMode === 'preset'}
          value={recurrence}
          onClose={sheets.closeRepeatSheet}
          onOpenCustom={sheets.openRepeatCustomSheet}
          onDone={sheets.doneRepeatPreset}
        />
        <RepeatCustomSheet
          visible={sheets.repeatSheetMode === 'custom'}
          value={sheets.repeatCustomDefaultValue}
          scheduleDate={sheets.scheduleDate}
          onClose={sheets.closeRepeatSheet}
          onDone={sheets.doneRepeatCustom}
        />
        <LocationSheet
          visible={sheets.isLocationVisible}
          recentSearches={locationRecentSearches}
          onClose={sheets.closeSheet}
          onSelect={sheets.selectLocation}
          onDeleteSearch={deleteLocationRecentSearch}
          onDeleteAllSearches={deleteAllLocationRecentSearches}
        />
      </View>
      {toast != null ? (
        <CardToast
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

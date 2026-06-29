import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ConditionTagBottomSheet } from '@/components/pin-card/condition-tag-bottom-sheet';
import { DateOnlyGuideModal } from '@/components/pin-card/date-only-guide-modal';
import { DateTimeBottomSheet } from '@/components/pin-card/date-time-bottom-sheet';
import { PersonalTagBottomSheet } from '@/components/pin-card/personal-tag-bottom-sheet';
import { PinCardCreateHeader } from '@/components/pin-card/pin-card-create-header';
import { PinCardForm } from '@/components/pin-card/pin-card-form';
import { PinCardRequiredToast } from '@/components/pin-card/pin-card-required-toast';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { colors, spacing } from '@/constants/theme';
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
import { usePinCardStore } from '@/state/pin-card/use-pin-card-store';

const SCREEN_MAX_WIDTH = 393;
const CONTENT_MAX_WIDTH = 353;
const CONTENT_TOP = 100;
const FORM_GAP = spacing[6];

export function PinCardCreateScreen() {
  const { cardId } = useLocalSearchParams<{ cardId?: string }>();
  const initialValues = useMemo(() => createDefaultPinCardFormValues(), []);
  const [activeTab, setActiveTab] = useState<CardTab>('pin');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showTagFeedback, setShowTagFeedback] = useState(false);
  const [showTagErrorFeedback, setShowTagErrorFeedback] = useState(false);
  const [isTagSheetVisible, setIsTagSheetVisible] = useState(false);
  const [tagSheetSelectedId, setTagSheetSelectedId] = useState<ConditionTagId | null>(
    initialValues.conditionTagId,
  );
  const [isDateTimeSheetVisible, setIsDateTimeSheetVisible] = useState(false);
  const [isPersonalTagSheetVisible, setIsPersonalTagSheetVisible] = useState(false);
  const [dateTimeFocus, setDateTimeFocus] = useState<TimeFocus>('start');
  const [dateOnlyGuideVisible, setDateOnlyGuideVisible] = useState(false);
  const beginCreate = usePinCardStore((store) => store.beginCreate);
  const beginEdit = usePinCardStore((store) => store.beginEdit);
  const updateDraftValues = usePinCardStore((store) => store.updateDraftValues);
  const changeDraftCardType = usePinCardStore((store) => store.changeDraftCardType);
  const personalTags = usePinCardStore((store) => store.personalTags);
  const createPersonalTag = usePinCardStore((store) => store.createPersonalTag);
  const saveDraft = usePinCardStore((store) => store.saveDraft);
  const deleteCard = usePinCardStore((store) => store.deleteCard);
  const discardDraft = usePinCardStore((store) => store.discardDraft);
  const draftMode = usePinCardStore((store) => store.draft?.mode ?? 'create');
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
  const reminderEnabled = watch('reminderEnabled');
  const location = watch('location');
  const memo = watch('memo');
  const primaryTag = getConditionTagById(conditionTagId);
  const selectedPersonalTags = personalTags.filter((tag) => personalTagIds.includes(tag.id));
  const previousTitleRef = useRef(title);
  const dateValue = getDateValue(dateMode, dateStart, dateEnd);
  const timeValue = getTimeValue(timeFilled, timeStart, timeEnd);
  const isTitleMissing = title.trim().length === 0;
  const isDateMissing = dateMode === 'empty';
  const isTimeMissing = !timeFilled;
  const isRequiredComplete = !isTitleMissing && !isDateMissing && !isTimeMissing;
  const shouldShowTitleError = hasSubmitted && (Boolean(errors.title) || isTitleMissing);
  const shouldShowDateError = hasSubmitted && (Boolean(errors.dateMode) || isDateMissing);
  const shouldShowTimeError = hasSubmitted && (Boolean(errors.timeFilled) || isTimeMissing);
  const tagFeedback = showTagErrorFeedback ? 'error' : showTagFeedback ? 'success' : 'none';

  useEffect(() => {
    const nextDraft = cardId == null ? beginCreate(initialValues, 'pin') : beginEdit(cardId);

    if (nextDraft == null) {
      router.back();
      return;
    }

    setActiveTab(nextDraft.cardType);
    setTagSheetSelectedId(nextDraft.values.conditionTagId);
    previousTitleRef.current = nextDraft.values.title;
    reset(nextDraft.values);
  }, [beginCreate, beginEdit, cardId, initialValues, reset]);

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
      memo,
      repeatEnabled,
      reminderEnabled,
    });
  }, [
    conditionTagId,
    dateEnd,
    dateMode,
    dateStart,
    location,
    memo,
    personalTagIds,
    reminderEnabled,
    repeatEnabled,
    timeEnd,
    timeFilled,
    timeStart,
    title,
    updateDraftValues,
  ]);

  useEffect(() => {
    if (!showToast) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setShowToast(false);
    }, 3_000);

    return () => clearTimeout(timeoutId);
  }, [showToast]);

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
      setIsTagSheetVisible(true);
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
      saveDraft(values);
      router.back();
    },
    [saveDraft],
  );

  const handleInvalidSubmit = useCallback(() => {
    setHasSubmitted(true);
    setShowToast(true);
  }, []);

  const handleOpenDateTimeSheet = useCallback((focus: TimeFocus = 'start') => {
    setDateTimeFocus(focus);
    setIsDateTimeSheetVisible(true);
  }, []);

  const handleClosePersonalTagSheet = useCallback(() => {
    setIsPersonalTagSheetVisible(false);
  }, []);

  const handleConfirmPersonalTags = useCallback(
    (nextPersonalTagIds: string[]) => {
      setValue('personalTagIds', nextPersonalTagIds, { shouldDirty: true });
      updateDraftValues({ personalTagIds: nextPersonalTagIds });
      setIsPersonalTagSheetVisible(false);
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

      if (draft.dateMode !== 'empty' && !nextTimeFilled) {
        setDateOnlyGuideVisible(true);
      }
    },
    [hasSubmitted, setValue, updateDraftValues],
  );

  const handleToggleRepeat = useCallback(() => {
    const nextRepeatEnabled = !repeatEnabled;

    setValue('repeatEnabled', nextRepeatEnabled, {
      shouldDirty: true,
    });
    updateDraftValues({ repeatEnabled: nextRepeatEnabled });
  }, [repeatEnabled, setValue, updateDraftValues]);

  const handleToggleReminder = useCallback(() => {
    const nextReminderEnabled = !reminderEnabled;

    setValue('reminderEnabled', nextReminderEnabled, {
      shouldDirty: true,
    });
    updateDraftValues({ reminderEnabled: nextReminderEnabled });
  }, [reminderEnabled, setValue, updateDraftValues]);

  const handleSelectConditionTag = useCallback((tagId: ConditionTagId) => {
    setTagSheetSelectedId((prev) => (prev === tagId ? null : tagId));
  }, []);

  const handleConfirmConditionTag = useCallback(() => {
    if (tagSheetSelectedId == null) {
      return;
    }

    setValue('conditionTagId', tagSheetSelectedId, { shouldDirty: true });
    updateDraftValues({ conditionTagId: tagSheetSelectedId });
    setIsTagSheetVisible(false);
    setShowTagErrorFeedback(false);
  }, [setValue, tagSheetSelectedId, updateDraftValues]);

  const handleCloseConditionTagSheet = useCallback(() => {
    setTagSheetSelectedId(conditionTagId);
    setIsTagSheetVisible(false);
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
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
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
            reminderEnabled={reminderEnabled}
            location={location}
            showTitleError={shouldShowTitleError}
            showDateError={shouldShowDateError}
            showTimeError={shouldShowTimeError}
            tagFeedback={tagFeedback}
            onChangeTab={handleChangeTab}
            onOpenPersonalTags={() => setIsPersonalTagSheetVisible(true)}
            onOpenDateTime={handleOpenDateTimeSheet}
            onToggleRepeat={handleToggleRepeat}
            onToggleReminder={handleToggleReminder}
          />
        </ScrollView>

        {showToast ? <PinCardRequiredToast onClose={() => setShowToast(false)} /> : null}
        <ConditionTagBottomSheet
          visible={isTagSheetVisible}
          selectedTagId={tagSheetSelectedId}
          onClose={handleCloseConditionTagSheet}
          onSelect={handleSelectConditionTag}
          onDone={handleConfirmConditionTag}
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
        <PersonalTagBottomSheet
          visible={isPersonalTagSheetVisible}
          personalTags={personalTags}
          selectedTagIds={personalTagIds}
          onClose={handleClosePersonalTagSheet}
          onCreateTag={createPersonalTag}
          onDone={handleConfirmPersonalTags}
        />
        <DateOnlyGuideModal
          visible={dateOnlyGuideVisible}
          onChangeToQueue={handleChangeToQueueCard}
          onOpenTime={handleOpenTimeFromGuide}
          onKeep={handleKeepDateOnly}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  screenContent: {
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

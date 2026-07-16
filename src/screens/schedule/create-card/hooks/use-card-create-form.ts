import { useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useScheduleDetailQuery } from '@/domains/schedule/api/queries';
import { toCardItemFromScheduleDetail } from '@/domains/schedule/card-mapper';
import { getCardCreateValidation } from '@/domains/schedule/create/validation';
import {
  type CardFormValues,
  type CardTab,
  createDefaultCardFormValues,
} from '@/domains/schedule/model';
import { useScheduleStore } from '@/domains/schedule/use-schedule-store';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';

import { createCardCreateScreenProps } from './card-create-screen-props';
import { useCardCreateActions } from './use-card-create-actions';
import { useCardCreateDraft } from './use-card-create-draft';
import { useCardCreateScroll } from './use-card-create-scroll';
import { useCardCreateSheets } from './use-card-create-sheets';
import { useCardCreateTags } from './use-card-create-tags';

export function useCardCreateForm() {
  const { cardId, type } = useLocalSearchParams<{ cardId?: string; type?: 'queue' }>();
  const numericCardId = useMemo(() => parseNumericCardId(cardId), [cardId]);
  const initialCardType: CardTab = type === 'queue' ? 'queue' : 'pin';
  const initialValues = useMemo(() => createDefaultCardFormValues(), []);
  const [activeTab, setActiveTab] = useState<CardTab>(initialCardType);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [initializedTitle, setInitializedTitle] = useState<string | null>(null);
  const personalTags = useScheduleStore((store) => store.personalTags);
  const keyboardHeight = useKeyboardHeight();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CardFormValues>({ mode: 'onSubmit', defaultValues: initialValues });
  const scheduleDetailQuery = useScheduleDetailQuery(numericCardId, {
    enabled: numericCardId != null,
  });
  const editCard = useMemo(
    () =>
      scheduleDetailQuery.data == null
        ? null
        : toCardItemFromScheduleDetail(scheduleDetailQuery.data, personalTags),
    [personalTags, scheduleDetailQuery.data],
  );

  const title = watch('title') ?? '';
  const conditionTagId = watch('conditionTagId');
  const personalTagIds = watch('personalTagIds');
  const personalTagLabels = watch('personalTagLabels');
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
  const reminderEnabled = watch('reminderEnabled');
  const recommendationAcknowledged = watch('recommendationAcknowledged');
  const values = useMemo(
    () => ({
      title,
      conditionTagId,
      personalTagIds,
      personalTagLabels,
      dateMode,
      dateStart,
      dateEnd,
      timeFilled,
      timeStart,
      timeEnd,
      repeatEnabled,
      recurrence,
      location,
      locationDetail,
      memo,
      dueDate,
      durationHours,
      durationMinutes,
      durationUnknown,
      reminderEnabled,
      recommendationAcknowledged,
    }),
    [
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
      personalTagLabels,
      personalTagIds,
      recommendationAcknowledged,
      recurrence,
      reminderEnabled,
      repeatEnabled,
      timeEnd,
      timeFilled,
      timeStart,
      title,
    ],
  );

  const handleInitRef = useCallback((cardType: CardTab, nextValues: CardFormValues) => {
    setActiveTab(cardType);
    setInitializedTitle(nextValues.title);
  }, []);

  const draft = useCardCreateDraft({
    cardId,
    initialCardType,
    initialValues,
    editCard,
    reset,
    onInit: handleInitRef,
    values,
  });

  const sheets = useCardCreateSheets({
    setValue,
    updateDraftValues: draft.updateDraftValues,
    changeDraftCardType: draft.changeDraftCardType,
    setActiveTab,
    addLocationRecentSearch: draft.addLocationRecentSearch,
    hasSubmitted,
    activeTab,
    conditionTagId: values.conditionTagId,
    repeatEnabled: values.repeatEnabled,
    recurrence: values.recurrence,
    dateMode: values.dateMode,
    dateStart: values.dateStart,
  });

  const { tagFeedback } = useCardCreateTags({
    title: values.title,
    initializedTitle,
    conditionTagId: values.conditionTagId,
    setValue,
    updateDraftValues: draft.updateDraftValues,
    syncTagSheetSelectedId: sheets.syncTagSheetSelectedId,
  });

  const validation = getCardCreateValidation({
    activeTab,
    hasSubmitted,
    title: values.title,
    dateMode: values.dateMode,
    timeFilled: values.timeFilled,
    dueDate: values.dueDate,
    durationHours: values.durationHours,
    durationMinutes: values.durationMinutes,
    durationUnknown: values.durationUnknown,
    hasTitleError: Boolean(errors.title),
    hasDateModeError: Boolean(errors.dateMode),
    hasTimeFilledError: Boolean(errors.timeFilled),
  });
  const scroll = useCardCreateScroll();
  const actions = useCardCreateActions({
    cardId,
    activeTab,
    personalTags: draft.personalTags,
    isRequiredComplete: validation.isRequiredComplete,
    handleSubmit,
    saveDraft: draft.saveDraft,
    deleteCard: draft.deleteCard,
    discardDraft: draft.discardDraft,
    changeDraftCardType: draft.changeDraftCardType,
    setActiveTab,
    setHasSubmitted,
  });

  return createCardCreateScreenProps({
    control,
    activeTab,
    values,
    keyboardHeight,
    validation,
    draft,
    sheets,
    actions,
    scroll,
    tagFeedback,
  });
}

function parseNumericCardId(cardId: string | undefined) {
  if (cardId == null) {
    return null;
  }

  const parsed = Number(cardId);

  return Number.isFinite(parsed) ? parsed : null;
}

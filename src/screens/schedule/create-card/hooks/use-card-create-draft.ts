import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useScheduleStore } from '@/domains/schedule/use-schedule-store';

import type { CardFormValues, CardTab } from '@/domains/schedule/model';
import type { UseFormReset } from 'react-hook-form';

interface UseCardCreateDraftParams {
  cardId: string | undefined;
  initialCardType: CardTab;
  initialValues: CardFormValues;
  reset: UseFormReset<CardFormValues>;
  onInit: (cardType: CardTab, values: CardFormValues) => void;
  values: CardFormValues;
}

export function useCardCreateDraft({
  cardId,
  initialCardType,
  initialValues,
  reset,
  onInit,
  values,
}: UseCardCreateDraftParams) {
  const beginCreate = useScheduleStore((store) => store.beginCreate);
  const beginEdit = useScheduleStore((store) => store.beginEdit);
  const updateDraftValues = useScheduleStore((store) => store.updateDraftValues);
  const changeDraftCardType = useScheduleStore((store) => store.changeDraftCardType);
  const personalTags = useScheduleStore((store) => store.personalTags);
  const createPersonalTag = useScheduleStore((store) => store.createPersonalTag);
  const locationRecentSearches = useScheduleStore((store) => store.locationRecentSearches);
  const addLocationRecentSearch = useScheduleStore((store) => store.addLocationRecentSearch);
  const deleteLocationRecentSearch = useScheduleStore((store) => store.deleteLocationRecentSearch);
  const deleteAllLocationRecentSearches = useScheduleStore(
    (store) => store.deleteAllLocationRecentSearches,
  );
  const saveDraft = useScheduleStore((store) => store.saveDraft);
  const deleteCard = useScheduleStore((store) => store.deleteCard);
  const discardDraft = useScheduleStore((store) => store.discardDraft);
  const draftMode = useScheduleStore((store) => store.draft?.mode ?? 'create');

  const initialValuesRef = useRef(initialValues);
  const onInitRef = useRef(onInit);
  const resetRef = useRef(reset);

  initialValuesRef.current = initialValues;
  onInitRef.current = onInit;
  resetRef.current = reset;

  useEffect(() => {
    const nextDraft =
      cardId == null ? beginCreate(initialValuesRef.current, initialCardType) : beginEdit(cardId);

    if (nextDraft == null) {
      router.back();
      return;
    }

    onInitRef.current(nextDraft.cardType, nextDraft.values);
    resetRef.current(nextDraft.values);
  }, [beginCreate, beginEdit, cardId, initialCardType]);

  useEffect(() => {
    updateDraftValues(values);
  }, [updateDraftValues, values]);

  return {
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
  };
}

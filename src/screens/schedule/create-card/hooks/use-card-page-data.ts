import { router } from 'expo-router';
import { useEffect } from 'react';

import { type CardFormValues, type CardTab } from '@/domains/schedule/model';
import { useScheduleStore } from '@/domains/schedule/use-schedule-store';

import type { UseFormReset } from 'react-hook-form';

interface InitParams {
  cardId: string | undefined;
  initialCardType: CardTab;
  initialValues: CardFormValues;
  reset: UseFormReset<CardFormValues>;
  onInit: (cardType: CardTab, values: CardFormValues) => void;
}

export function useCardPageData() {
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

  return {
    beginCreate,
    beginEdit,
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

export function useCardInit({ cardId, initialCardType, initialValues, reset, onInit }: InitParams) {
  const beginCreate = useScheduleStore((store) => store.beginCreate);
  const beginEdit = useScheduleStore((store) => store.beginEdit);

  useEffect(() => {
    const nextDraft =
      cardId == null ? beginCreate(initialValues, initialCardType) : beginEdit(cardId);

    if (nextDraft == null) {
      router.back();
      return;
    }

    onInit(nextDraft.cardType, nextDraft.values);
    reset(nextDraft.values);
  }, [beginCreate, beginEdit, cardId, initialCardType, initialValues, onInit, reset]);
}

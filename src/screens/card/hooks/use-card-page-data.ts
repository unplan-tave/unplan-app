import { router } from 'expo-router';
import { useEffect } from 'react';

import { type CardFormValues, type CardTab } from '@/domains/card/model';
import { useCardStore } from '@/domains/card/use-card-store';

import type { UseFormReset } from 'react-hook-form';

interface InitParams {
  cardId: string | undefined;
  initialCardType: CardTab;
  initialValues: CardFormValues;
  reset: UseFormReset<CardFormValues>;
  onInit: (cardType: CardTab, values: CardFormValues) => void;
}

export function useCardPageData() {
  const beginCreate = useCardStore((store) => store.beginCreate);
  const beginEdit = useCardStore((store) => store.beginEdit);
  const updateDraftValues = useCardStore((store) => store.updateDraftValues);
  const changeDraftCardType = useCardStore((store) => store.changeDraftCardType);
  const personalTags = useCardStore((store) => store.personalTags);
  const createPersonalTag = useCardStore((store) => store.createPersonalTag);
  const locationRecentSearches = useCardStore((store) => store.locationRecentSearches);
  const addLocationRecentSearch = useCardStore((store) => store.addLocationRecentSearch);
  const deleteLocationRecentSearch = useCardStore((store) => store.deleteLocationRecentSearch);
  const deleteAllLocationRecentSearches = useCardStore(
    (store) => store.deleteAllLocationRecentSearches,
  );
  const saveDraft = useCardStore((store) => store.saveDraft);
  const deleteCard = useCardStore((store) => store.deleteCard);
  const discardDraft = useCardStore((store) => store.discardDraft);
  const draftMode = useCardStore((store) => store.draft?.mode ?? 'create');

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
  const beginCreate = useCardStore((store) => store.beginCreate);
  const beginEdit = useCardStore((store) => store.beginEdit);

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

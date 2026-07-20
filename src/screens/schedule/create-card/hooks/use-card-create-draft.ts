import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useScheduleStore } from '@/domains/schedule/use-schedule-store';

import type { CardFormValues, CardItem, CardTab } from '@/domains/schedule/model';
import type { UseFormReset } from 'react-hook-form';

interface UseCardCreateDraftParams {
  cardId: string | undefined;
  initialCardType: CardTab;
  initialValues: CardFormValues;
  editCard: CardItem | null;
  reset: UseFormReset<CardFormValues>;
  onInit: (cardType: CardTab, values: CardFormValues) => void;
  values: CardFormValues;
}

/** 카드 생성 draft의 필드 입력 상태를 관리합니다. */
export function useCardCreateDraft({
  cardId,
  initialCardType,
  initialValues,
  editCard,
  reset,
  onInit,
  values,
}: UseCardCreateDraftParams) {
  const beginCreate = useScheduleStore((store) => store.beginCreate);
  const beginEdit = useScheduleStore((store) => store.beginEdit);
  const beginEditFromCard = useScheduleStore((store) => store.beginEditFromCard);
  const updateDraftValues = useScheduleStore((store) => store.updateDraftValues);
  const changeDraftCardType = useScheduleStore((store) => store.changeDraftCardType);
  const personalTags = useScheduleStore((store) => store.personalTags);
  const createPersonalTag = useScheduleStore((store) => store.createPersonalTag);
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
    if (cardId != null && editCard == null) {
      return;
    }

    const nextDraft =
      cardId == null
        ? beginCreate(initialValuesRef.current, initialCardType)
        : editCard == null
          ? beginEdit(cardId)
          : beginEditFromCard(editCard);

    if (nextDraft == null) {
      router.back();
      return;
    }

    onInitRef.current(nextDraft.cardType, nextDraft.values);
    resetRef.current(nextDraft.values);
  }, [beginCreate, beginEdit, beginEditFromCard, cardId, editCard, initialCardType]);

  useEffect(() => {
    updateDraftValues(values);
  }, [updateDraftValues, values]);

  return {
    updateDraftValues,
    changeDraftCardType,
    personalTags,
    createPersonalTag,
    saveDraft,
    deleteCard,
    discardDraft,
    draftMode,
  };
}

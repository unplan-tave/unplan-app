import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { type CardFormValues, getConditionTagById } from '@/domains/schedule/model';
import { useScheduleStore } from '@/domains/schedule/use-schedule-store';

type ToastState = {
  message: string;
  variant: 'warning' | 'confirm';
} | null;

export function useCardViewScreen() {
  const { cardId, toast: toastParam } = useLocalSearchParams<{ cardId: string; toast?: string }>();
  const card = useScheduleStore((store) => store.cards.find((c) => c.id === cardId));
  const personalTags = useScheduleStore((store) => store.personalTags);
  const createCard = useScheduleStore((store) => store.createCard);
  const convertQueueToPinCard = useScheduleStore((store) => store.convertQueueToPinCard);
  const [isConvertSheetVisible, setIsConvertSheetVisible] = useState(false);
  const [toast, setToast] = useState<ToastState>(() =>
    toastParam === 'created' ? { message: '핀카드가 생성됐어요!', variant: 'confirm' } : null,
  );

  const conditionTag = card == null ? null : getConditionTagById(card.conditionTagId);
  const cardPersonalTags = useMemo(
    () => (card == null ? [] : personalTags.filter((tag) => card.personalTagIds.includes(tag.id))),
    [card, personalTags],
  );

  const handleBack = useCallback(() => {
    router.replace('/(tabs)');
  }, []);

  const handleEdit = useCallback(() => {
    router.push(`/card/card-detail?cardId=${cardId}`);
  }, [cardId]);

  const openConvertSheet = useCallback(() => {
    setIsConvertSheetVisible(true);
  }, []);

  const closeConvertSheet = useCallback(() => {
    setIsConvertSheetVisible(false);
  }, []);

  const handleConvert = useCallback(
    (values: CardFormValues, keepOriginal: boolean) => {
      if (cardId == null) return;

      setIsConvertSheetVisible(false);

      if (keepOriginal) {
        const newCard = createCard('pin', values);
        router.push(`/card/view?cardId=${newCard.id}&toast=created`);
      } else {
        convertQueueToPinCard(cardId, values);
        setToast({ message: '핀카드로 전환됐어요!', variant: 'confirm' });
      }
    },
    [cardId, createCard, convertQueueToPinCard],
  );

  const handleEditDuration = useCallback(() => {
    setIsConvertSheetVisible(false);
    router.push(`/card/card-detail?cardId=${cardId}`);
  }, [cardId]);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

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
    if (card == null) {
      router.replace('/(tabs)');
    }
  }, [card]);

  return {
    card,
    conditionTag,
    cardPersonalTags,
    isConvertSheetVisible,
    toast,
    handleBack,
    handleEdit,
    openConvertSheet,
    closeConvertSheet,
    handleConvert,
    handleEditDuration,
    closeToast,
  };
}

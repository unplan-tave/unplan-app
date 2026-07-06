import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { MEMO_MAX_LENGTH, type CardFormValues, type CardTab } from '@/domains/schedule/model';

import type { UseFormHandleSubmit } from 'react-hook-form';

type ToastState = {
  message: string;
  variant: 'warning' | 'confirm';
} | null;

interface UseCardCreateActionsParams {
  cardId: string | undefined;
  isRequiredComplete: boolean;
  handleSubmit: UseFormHandleSubmit<CardFormValues>;
  saveDraft: (values: CardFormValues) => { id: string } | null;
  deleteCard: (cardId: string) => void;
  discardDraft: () => void;
  changeDraftCardType: (cardType: CardTab) => void;
  setActiveTab: (tab: CardTab) => void;
  setHasSubmitted: (value: boolean) => void;
}

export function useCardCreateActions({
  cardId,
  isRequiredComplete,
  handleSubmit,
  saveDraft,
  deleteCard,
  discardDraft,
  changeDraftCardType,
  setActiveTab,
  setHasSubmitted,
}: UseCardCreateActionsParams) {
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (toast == null) return;
    const id = setTimeout(() => setToast(null), 3_000);
    return () => clearTimeout(id);
  }, [toast]);

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
  }, [setHasSubmitted]);

  const handleDone = useCallback(() => {
    if (!isRequiredComplete) {
      handleInvalidSubmit();
      return;
    }
    void handleSubmit(handleValidSubmit, handleInvalidSubmit)();
  }, [handleInvalidSubmit, handleSubmit, handleValidSubmit, isRequiredComplete]);

  const handleChangeTab = useCallback(
    (tab: CardTab) => {
      setActiveTab(tab);
      changeDraftCardType(tab);
    },
    [changeDraftCardType, setActiveTab],
  );

  const handleDelete = useCallback(() => {
    if (cardId == null) return;
    deleteCard(cardId);
    router.back();
  }, [cardId, deleteCard]);

  const handleDurationUnknown = useCallback(() => {
    setToast({ message: '시간대 추천이 어려울 수 있어요!', variant: 'confirm' });
  }, []);

  const handleMemoReachLimit = useCallback(() => {
    setToast({ message: `${MEMO_MAX_LENGTH}자까지만 입력 가능해요!`, variant: 'warning' });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    handleClose,
    handleDelete,
    handleDone,
    handleChangeTab,
    handleDurationUnknown,
    handleMemoReachLimit,
    closeToast,
  };
}

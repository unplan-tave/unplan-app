import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import {
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
} from '@/domains/schedule/api/mutations';
import { toScheduleCreateInput, toScheduleUpdateInput } from '@/domains/schedule/card-mapper';
import {
  MEMO_MAX_LENGTH,
  type CardFormValues,
  type CardTab,
  type PersonalTagOption,
} from '@/domains/schedule/model';

import type { UseFormHandleSubmit } from 'react-hook-form';

type ToastState = {
  message: string;
  variant: 'warning' | 'confirm';
} | null;

interface UseCardCreateActionsParams {
  cardId: string | undefined;
  activeTab: CardTab;
  personalTags: PersonalTagOption[];
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
  activeTab,
  personalTags,
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
  const createScheduleMutation = useCreateScheduleMutation();
  const updateScheduleMutation = useUpdateScheduleMutation();
  const isSubmitting = createScheduleMutation.isPending || updateScheduleMutation.isPending;
  const numericCardId = cardId == null ? null : Number(cardId);
  const canSubmitUpdate = numericCardId != null && Number.isFinite(numericCardId);

  useEffect(() => {
    if (toast == null) return;
    const id = setTimeout(() => setToast(null), 3_000);
    return () => clearTimeout(id);
  }, [toast]);

  const handleClose = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    discardDraft();
    router.replace('/(tabs)');
  }, [discardDraft, isSubmitting]);

  const handleValidSubmit = useCallback(
    (values: CardFormValues) => {
      if (isSubmitting) {
        return;
      }

      if (cardId != null && canSubmitUpdate && numericCardId != null) {
        updateScheduleMutation.mutate(
          {
            scheduleId: numericCardId,
            data: toScheduleUpdateInput(values, personalTags),
          },
          {
            onSuccess: () => {
              discardDraft();
              router.replace(`/card/view?cardId=${numericCardId}`);
            },
            onError: () => {
              setToast({
                message: '카드 저장에 실패했어요. 다시 시도해 주세요.',
                variant: 'warning',
              });
            },
          },
        );
        return;
      }

      if (cardId == null) {
        let createInput;

        try {
          createInput = toScheduleCreateInput(activeTab, values, personalTags);
        } catch {
          setToast({
            message: '핀카드 날짜와 시간을 다시 확인해 주세요.',
            variant: 'warning',
          });
          return;
        }

        createScheduleMutation.mutate(createInput, {
          onSuccess: (created) => {
            discardDraft();
            router.replace(`/card/view?cardId=${created.id}`);
          },
          onError: () => {
            setToast({
              message: '카드 저장에 실패했어요. 다시 시도해 주세요.',
              variant: 'warning',
            });
          },
        });
        return;
      }

      const saved = saveDraft(values);
      if (saved != null) {
        router.replace(`/card/view?cardId=${saved.id}`);
        return;
      }
      router.back();
    },
    [
      activeTab,
      canSubmitUpdate,
      cardId,
      createScheduleMutation,
      discardDraft,
      isSubmitting,
      numericCardId,
      personalTags,
      saveDraft,
      updateScheduleMutation,
    ],
  );

  const handleInvalidSubmit = useCallback(() => {
    setHasSubmitted(true);
    setToast({ message: '아직 입력되지 않은 필수 정보가 있어요!', variant: 'warning' });
  }, [setHasSubmitted]);

  const handleDone = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    if (!isRequiredComplete) {
      handleInvalidSubmit();
      return;
    }
    void handleSubmit(handleValidSubmit, handleInvalidSubmit)();
  }, [handleInvalidSubmit, handleSubmit, handleValidSubmit, isRequiredComplete, isSubmitting]);

  const handleChangeTab = useCallback(
    (tab: CardTab) => {
      setActiveTab(tab);
      changeDraftCardType(tab);
    },
    [changeDraftCardType, setActiveTab],
  );

  const handleDelete = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    if (cardId == null) return;
    deleteCard(cardId);
    router.back();
  }, [cardId, deleteCard, isSubmitting]);

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
    isSubmitting,
    handleClose,
    handleDelete,
    handleDone,
    handleChangeTab,
    handleDurationUnknown,
    handleMemoReachLimit,
    closeToast,
  };
}

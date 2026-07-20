import { router } from 'expo-router';
import { useCallback } from 'react';

import {
  useCreateScheduleMutation,
  useDeleteScheduleMutation,
  useUpdateScheduleMutation,
} from '@/domains/schedule/api/mutations';
import { toScheduleCreateInput, toScheduleUpdateInput } from '@/domains/schedule/card-mapper';
import {
  MEMO_MAX_LENGTH,
  type CardFormValues,
  type CardTab,
  type PersonalTagOption,
} from '@/domains/schedule/model';
import { useGoBack } from '@/hooks/use-go-back';

import { useCardCreateFeedback } from './use-card-create-feedback';

import type { UseFormHandleSubmit } from 'react-hook-form';

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

/** 카드 생성 form의 저장·취소·라우팅 이벤트를 관리합니다. */
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
  const goBack = useGoBack();
  const { toast, showToast, closeToast } = useCardCreateFeedback();
  const createScheduleMutation = useCreateScheduleMutation();
  const updateScheduleMutation = useUpdateScheduleMutation();
  const deleteScheduleMutation = useDeleteScheduleMutation();
  const isSubmitting =
    createScheduleMutation.isPending ||
    updateScheduleMutation.isPending ||
    deleteScheduleMutation.isPending;
  const numericCardId = cardId == null ? null : Number(cardId);
  const canSubmitUpdate = numericCardId != null && Number.isFinite(numericCardId);

  const handleClose = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    discardDraft();
    goBack();
  }, [discardDraft, goBack, isSubmitting]);

  const handleValidSubmit = useCallback(
    (values: CardFormValues) => {
      if (isSubmitting) {
        return;
      }

      if (cardId != null && canSubmitUpdate && numericCardId != null) {
        let updateInput;

        try {
          updateInput = toScheduleUpdateInput(activeTab, values, personalTags);
        } catch {
          showToast({
            message:
              activeTab === 'queue'
                ? '큐카드 소요 시간을 다시 확인해 주세요.'
                : '핀카드 날짜와 시간을 다시 확인해 주세요.',
            variant: 'warning',
          });
          return;
        }

        updateScheduleMutation.mutate(
          {
            scheduleId: numericCardId,
            data: updateInput,
          },
          {
            onSuccess: () => {
              discardDraft();
              goBack();
            },
            onError: () => {
              showToast({
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
          showToast({
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
            showToast({
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
      goBack,
      isSubmitting,
      numericCardId,
      personalTags,
      saveDraft,
      updateScheduleMutation,
      showToast,
    ],
  );

  const handleInvalidSubmit = useCallback(() => {
    setHasSubmitted(true);
    showToast({ message: '아직 입력되지 않은 필수 정보가 있어요!', variant: 'warning' });
  }, [setHasSubmitted, showToast]);

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

    if (canSubmitUpdate && numericCardId != null) {
      deleteScheduleMutation.mutate(
        { scheduleId: numericCardId },
        {
          onSuccess: () => {
            discardDraft();
            router.replace('/schedule');
          },
          onError: () => {
            showToast({
              message: '카드 삭제에 실패했어요. 다시 시도해 주세요.',
              variant: 'warning',
            });
          },
        },
      );
      return;
    }

    deleteCard(cardId);
    router.back();
  }, [
    canSubmitUpdate,
    cardId,
    deleteCard,
    deleteScheduleMutation,
    discardDraft,
    isSubmitting,
    numericCardId,
    showToast,
  ]);

  const handleDurationUnknown = useCallback(() => {
    showToast({ message: '시간대 추천이 어려울 수 있어요!', variant: 'confirm' });
  }, [showToast]);

  const handleMemoReachLimit = useCallback(() => {
    showToast({ message: `${MEMO_MAX_LENGTH}자까지만 입력 가능해요!`, variant: 'warning' });
  }, [showToast]);

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

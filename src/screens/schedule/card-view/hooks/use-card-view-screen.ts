import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
} from '@/domains/schedule/api/mutations';
import { useScheduleDetailQuery } from '@/domains/schedule/api/queries';
import {
  toCardItemFromScheduleDetail,
  toScheduleCreateInput,
  toScheduleUpdateInput,
} from '@/domains/schedule/card-mapper';
import { type CardFormValues, getConditionTagById } from '@/domains/schedule/model';
import { useScheduleStore } from '@/domains/schedule/use-schedule-store';

type ToastState = {
  message: string;
  variant: 'warning' | 'confirm';
} | null;

export function useCardViewScreen() {
  const { cardId, toast: toastParam } = useLocalSearchParams<{ cardId: string; toast?: string }>();
  const numericCardId = parseNumericCardId(cardId);
  const personalTags = useScheduleStore((store) => store.personalTags);
  const scheduleDetailQuery = useScheduleDetailQuery(numericCardId, {
    enabled: numericCardId != null,
  });
  const createScheduleMutation = useCreateScheduleMutation();
  const updateScheduleMutation = useUpdateScheduleMutation();
  const [isConvertSheetVisible, setIsConvertSheetVisible] = useState(false);
  const [toast, setToast] = useState<ToastState>(() =>
    toastParam === 'created' ? { message: '핀카드가 생성됐어요!', variant: 'confirm' } : null,
  );
  const apiCard = useMemo(
    () =>
      scheduleDetailQuery.data == null
        ? null
        : toCardItemFromScheduleDetail(scheduleDetailQuery.data),
    [scheduleDetailQuery.data],
  );
  const card = apiCard;
  const isConverting = createScheduleMutation.isPending || updateScheduleMutation.isPending;

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
    if (isConverting) {
      return;
    }

    setIsConvertSheetVisible(false);
  }, [isConverting]);

  const handleConvert = useCallback(
    (values: CardFormValues, keepOriginal: boolean) => {
      if (cardId == null || isConverting) return;

      setIsConvertSheetVisible(false);

      if (numericCardId != null) {
        let pinInput: ReturnType<typeof toScheduleCreateInput>;

        try {
          pinInput = toScheduleCreateInput('pin', values, personalTags);
        } catch {
          setToast({
            message: '핀카드 날짜와 시간을 다시 확인해 주세요.',
            variant: 'warning',
          });
          return;
        }

        if (keepOriginal) {
          createScheduleMutation.mutate(pinInput, {
            onSuccess: (created) => {
              router.push(`/card/view?cardId=${created.id}&toast=created`);
            },
            onError: () => {
              setToast({
                message: '핀카드 생성에 실패했어요. 다시 시도해 주세요.',
                variant: 'warning',
              });
            },
          });
          return;
        }

        updateScheduleMutation.mutate(
          {
            scheduleId: numericCardId,
            data: toScheduleUpdateInput(values, personalTags),
          },
          {
            onSuccess: () => {
              setToast({ message: '핀카드로 전환됐어요!', variant: 'confirm' });
            },
            onError: () => {
              setToast({
                message: '핀카드 전환에 실패했어요. 다시 시도해 주세요.',
                variant: 'warning',
              });
            },
          },
        );
        return;
      }
    },
    [
      cardId,
      createScheduleMutation,
      isConverting,
      numericCardId,
      personalTags,
      updateScheduleMutation,
    ],
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
    if (numericCardId == null) {
      router.replace('/(tabs)');
    }
  }, [numericCardId]);

  return {
    card,
    conditionTag,
    cardPersonalTags,
    isLoading: scheduleDetailQuery.isLoading,
    isError: scheduleDetailQuery.isError,
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

function parseNumericCardId(cardId: string | undefined) {
  if (cardId == null) {
    return null;
  }

  const parsed = Number(cardId);

  return Number.isFinite(parsed) ? parsed : null;
}

import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import {
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
} from '@/domains/schedule/api/mutations';
import { toScheduleCreateInput, toScheduleUpdateInput } from '@/domains/schedule/card-mapper';

import type { CardFormValues, PersonalTagOption } from '@/domains/schedule/model';

export type CardViewToast = {
  message: string;
  variant: 'warning' | 'confirm';
} | null;

interface UseCardViewConversionParams {
  cardId: string | undefined;
  numericCardId: number | null;
  personalTags: PersonalTagOption[];
  initialToast: CardViewToast;
}

/** 큐 카드를 핀 카드로 바꾸는 sheet 상태와 mutation을 관리합니다. */
export function useCardViewConversion({
  cardId,
  numericCardId,
  personalTags,
  initialToast,
}: UseCardViewConversionParams) {
  const createScheduleMutation = useCreateScheduleMutation();
  const updateScheduleMutation = useUpdateScheduleMutation();
  const [isConvertSheetVisible, setIsConvertSheetVisible] = useState(false);
  const [toast, setToast] = useState<CardViewToast>(initialToast);
  const isConverting = createScheduleMutation.isPending || updateScheduleMutation.isPending;

  useEffect(() => {
    if (toast == null) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setToast(null);
    }, 3_000);

    return () => clearTimeout(timeoutId);
  }, [toast]);

  const openConvertSheet = useCallback(() => {
    setIsConvertSheetVisible(true);
  }, []);
  const closeConvertSheet = useCallback(() => {
    if (!isConverting) {
      setIsConvertSheetVisible(false);
    }
  }, [isConverting]);
  const handleConvert = useCallback(
    (values: CardFormValues, keepOriginal: boolean) => {
      if (numericCardId == null || isConverting) {
        return;
      }

      setIsConvertSheetVisible(false);

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
    },
    [createScheduleMutation, isConverting, numericCardId, personalTags, updateScheduleMutation],
  );
  const handleEditDuration = useCallback(() => {
    setIsConvertSheetVisible(false);
    router.push(`/card/card-detail?cardId=${cardId}`);
  }, [cardId]);
  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    isConvertSheetVisible,
    toast,
    openConvertSheet,
    closeConvertSheet,
    handleConvert,
    handleEditDuration,
    closeToast,
  };
}

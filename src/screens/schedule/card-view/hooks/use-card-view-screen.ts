import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';

import { useScheduleDetailQuery } from '@/domains/schedule/api/queries';
import { toCardItemFromScheduleDetail } from '@/domains/schedule/card-mapper';
import { getCardPersonalTagLabels } from '@/domains/schedule/list';
import { getConditionTagById } from '@/domains/schedule/model';
import { useScheduleStore } from '@/domains/schedule/use-schedule-store';

import { useCardViewConversion } from './use-card-view-conversion';

/** 카드 상세 화면의 조회 결과와 화면 이벤트를 조합합니다. */
export function useCardViewScreen() {
  const { cardId, toast: toastParam } = useLocalSearchParams<{ cardId: string; toast?: string }>();
  const numericCardId = parseNumericCardId(cardId);
  const personalTags = useScheduleStore((store) => store.personalTags);
  const scheduleDetailQuery = useScheduleDetailQuery(numericCardId, {
    enabled: numericCardId != null,
  });
  const apiCard = useMemo(
    () =>
      scheduleDetailQuery.data == null
        ? null
        : toCardItemFromScheduleDetail(scheduleDetailQuery.data, personalTags),
    [personalTags, scheduleDetailQuery.data],
  );
  const card = apiCard;
  const conversion = useCardViewConversion({
    cardId,
    numericCardId,
    personalTags,
    initialToast:
      toastParam === 'created' ? { message: '핀카드가 생성됐어요!', variant: 'confirm' } : null,
  });

  const conditionTag = card == null ? null : getConditionTagById(card.conditionTagId);
  const cardPersonalTagLabels = useMemo(
    () => (card == null ? [] : getCardPersonalTagLabels(card, personalTags)),
    [card, personalTags],
  );

  const handleBack = useCallback(() => {
    router.replace('/(tabs)');
  }, []);

  const handleEdit = useCallback(() => {
    router.push(`/card/card-detail?cardId=${cardId}`);
  }, [cardId]);

  useEffect(() => {
    if (numericCardId == null) {
      router.replace('/(tabs)');
    }
  }, [numericCardId]);

  return {
    card,
    conditionTag,
    cardPersonalTagLabels,
    isLoading: scheduleDetailQuery.isLoading,
    isError: scheduleDetailQuery.isError,
    ...conversion,
    handleBack,
    handleEdit,
  };
}

function parseNumericCardId(cardId: string | undefined) {
  if (cardId == null) {
    return null;
  }

  const parsed = Number(cardId);

  return Number.isFinite(parsed) ? parsed : null;
}

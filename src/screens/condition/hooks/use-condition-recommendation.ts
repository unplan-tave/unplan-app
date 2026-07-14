import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { type ConditionRecommendation } from '@/domains/condition/model';
import {
  findFreeSlot,
  formatFreeSlotMessage,
  isRecoveryRecommendation,
  toQueueRecommendations,
  toRecoveryOptions,
  toRecoveryRecommendation,
} from '@/domains/condition/recommendation';
import { useOnboardingStore } from '@/domains/onboarding/use-onboarding-store';
import { createQueueToPinValuesFromCandidate } from '@/domains/schedule/queue';
import { useScheduleStore } from '@/domains/schedule/use-schedule-store';
import { formatDateValue } from '@/lib/utils/date';

/** `parseTimeToMinutes`는 24시를 허용하지 않으므로 하루의 끝을 23:59로 둡니다. */
const DAY_END_TIME = '23:59';
const MINIMUM_SLOT_MINUTES = 30;
const NO_SLOT_DESCRIPTION = '여유 시간이 생기면 추천해 드릴게요';
const NO_CANDIDATE_DESCRIPTION = '여유 시간에 딱 맞는 큐 카드가 없어요';

/**
 * "컨디션 기반 추천 일정" 바텀시트의 상태와 액션.
 *
 * TODO(condition-api): 추천 후보와 빈 시간대는 ai-recommendation API가 나오면 그 응답으로 교체합니다.
 * 지금은 클라이언트가 이미 가지고 있는 큐 카드와 회복 수단 설정만으로 후보를 만듭니다.
 */
export function useConditionRecommendation(selectedDate: Date, now: Date) {
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedRecoveryOptionId, setSelectedRecoveryOptionId] = useState<string | null>(null);
  const cards = useScheduleStore((store) => store.cards);
  const convertQueueToPinCard = useScheduleStore((store) => store.convertQueueToPinCard);
  const recoveryOptionIds = useOnboardingStore((store) => store.preferences.recoveryOptionIds);
  const customRecoveryLabel = useOnboardingStore((store) => store.preferences.customRecoveryLabel);

  const freeSlot = useMemo(
    () => findFreeSlot(cards, formatTimeLabel(now), DAY_END_TIME, MINIMUM_SLOT_MINUTES),
    [cards, now],
  );
  const recommendations = useMemo<ConditionRecommendation[]>(() => {
    if (freeSlot == null) {
      return [];
    }

    const recovery = toRecoveryRecommendation(
      toRecoveryOptions(recoveryOptionIds, customRecoveryLabel),
    );

    return [...toQueueRecommendations(cards, freeSlot), ...(recovery == null ? [] : [recovery])];
  }, [cards, customRecoveryLabel, freeSlot, recoveryOptionIds]);
  const slotMessage = freeSlot == null ? null : formatFreeSlotMessage(freeSlot);
  const emptyDescription = freeSlot == null ? NO_SLOT_DESCRIPTION : NO_CANDIDATE_DESCRIPTION;
  const activeRecommendation = recommendations[activeIndex];

  const openSheet = useCallback(() => {
    setActiveIndex(0);
    setSelectedRecoveryOptionId(null);
    setIsSheetVisible(true);
  }, []);

  const closeSheet = useCallback(() => {
    setIsSheetVisible(false);
  }, []);

  const showPrevious = useCallback(() => {
    setActiveIndex((prev) => Math.max(0, prev - 1));
    setSelectedRecoveryOptionId(null);
  }, []);

  const showNext = useCallback(() => {
    setActiveIndex((prev) => Math.min(recommendations.length - 1, prev + 1));
    setSelectedRecoveryOptionId(null);
  }, [recommendations.length]);

  const acceptRecommendation = useCallback(() => {
    if (activeRecommendation == null || freeSlot == null) {
      return;
    }

    if (isRecoveryRecommendation(activeRecommendation)) {
      if (selectedRecoveryOptionId == null) {
        return;
      }

      setIsSheetVisible(false);
      return;
    }

    const card = cards.find((item) => item.id === activeRecommendation.id);

    if (card == null) {
      return;
    }

    convertQueueToPinCard(
      card.id,
      createQueueToPinValuesFromCandidate(card, {
        id: card.id,
        date: formatDateValue(selectedDate),
        startTime: freeSlot.startTime,
        endTime: freeSlot.endTime,
        description: activeRecommendation.reason,
      }),
    );
    setIsSheetVisible(false);
  }, [
    activeRecommendation,
    cards,
    convertQueueToPinCard,
    freeSlot,
    selectedRecoveryOptionId,
    selectedDate,
  ]);

  /** 추천 시간 대신 사용자가 직접 시간을 정하는 경로. */
  const openManualTime = useCallback(() => {
    setIsSheetVisible(false);

    if (activeRecommendation == null || isRecoveryRecommendation(activeRecommendation)) {
      router.push('/card/new');
      return;
    }

    router.push(`/card/view?cardId=${activeRecommendation.id}`);
  }, [activeRecommendation]);

  /** "기존 큐 카드 유지하기" — 아무것도 바꾸지 않고 시트를 닫습니다. */
  const keepQueueCard = useCallback(() => {
    setIsSheetVisible(false);
  }, []);

  return {
    isSheetVisible,
    activeIndex,
    recommendations,
    selectedRecoveryOptionId,
    slotMessage,
    emptyDescription,
    openSheet,
    closeSheet,
    showPrevious,
    showNext,
    selectRecoveryOption: setSelectedRecoveryOptionId,
    acceptRecommendation,
    openManualTime,
    keepQueueCard,
  };
}

function formatTimeLabel(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAcceptConditionRecommendationMutation } from '@/domains/ai-recommendation/api/mutations';
import { useConditionRecommendationsQuery } from '@/domains/ai-recommendation/api/queries';
import {
  formatFreeSlotMessage,
  isRecoveryRecommendation,
} from '@/domains/condition/recommendation';
import { t } from '@/lib/i18n';
import { formatDateValue } from '@/lib/utils/date';

/** "컨디션 기반 추천 일정" 바텀시트의 상태와 액션. */
export function useConditionRecommendation(selectedDate: Date) {
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedRecoveryOptionId, setSelectedRecoveryOptionId] = useState<string | null>(null);
  const selectedDateValue = formatDateValue(selectedDate);

  const recommendationQuery = useConditionRecommendationsQuery(selectedDateValue, {
    enabled: isSheetVisible,
  });
  const acceptMutation = useAcceptConditionRecommendationMutation({
    onSuccess: () => {
      setIsSheetVisible(false);
    },
  });
  const recommendations = useMemo(
    () => recommendationQuery.data?.recommendations ?? [],
    [recommendationQuery.data?.recommendations],
  );
  const freeSlot = recommendationQuery.data?.freeSlot ?? null;
  const slotMessage =
    recommendationQuery.data?.summaryMessage ??
    (freeSlot == null ? null : formatFreeSlotMessage(freeSlot));
  const emptyDescription = recommendationQuery.isError
    ? t('condition.recommendation.empty.noCandidate')
    : freeSlot == null
      ? t('condition.recommendation.empty.noSlot')
      : t('condition.recommendation.empty.noCandidate');
  const activeRecommendation = recommendations[activeIndex];

  useEffect(() => {
    setActiveIndex((currentIndex) =>
      recommendations.length === 0 ? 0 : Math.min(currentIndex, recommendations.length - 1),
    );
  }, [recommendations.length]);

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

    if (activeRecommendation.recommendId == null) {
      return;
    }

    if (isRecoveryRecommendation(activeRecommendation)) {
      if (selectedRecoveryOptionId == null) {
        return;
      }

      acceptMutation.mutate({
        recommendId: activeRecommendation.recommendId,
        recoveryMean: selectedRecoveryOptionId,
      });
      return;
    }

    acceptMutation.mutate({
      recommendId: activeRecommendation.recommendId,
      keepQueueCard: false,
    });
  }, [acceptMutation, activeRecommendation, freeSlot, selectedRecoveryOptionId]);

  /** 추천 시간 대신 사용자가 직접 시간을 정하는 경로. */
  const openManualTime = useCallback(() => {
    setIsSheetVisible(false);

    router.push('/card/new');
  }, []);

  /** "기존 큐 카드 유지하기" — 원본 큐 카드는 유지하고 핀 카드를 복제 생성합니다. */
  const keepQueueCard = useCallback(() => {
    if (
      activeRecommendation == null ||
      isRecoveryRecommendation(activeRecommendation) ||
      activeRecommendation.recommendId == null
    ) {
      return;
    }

    acceptMutation.mutate({
      recommendId: activeRecommendation.recommendId,
      keepQueueCard: true,
    });
  }, [acceptMutation, activeRecommendation]);

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

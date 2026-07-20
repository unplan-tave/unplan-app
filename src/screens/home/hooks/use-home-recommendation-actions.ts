import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getRecommendationAcceptErrorKind } from '@/domains/ai-recommendation/api/client';
import {
  useAcceptRecommendationMutation,
  usePassRecommendationMutation,
} from '@/domains/ai-recommendation/api/mutations';
import { t } from '@/lib/i18n';

import type { ScheduleRecommendation } from '@/domains/ai-recommendation/model';

/** 추천 카드 추가 sheet와 추천 숨김·수락, 카드 생성/큐 이동을 소유합니다. */
export function useHomeRecommendationActions({
  recommendations,
  onError,
}: {
  recommendations: ScheduleRecommendation[];
  onError: (message: string) => void;
}) {
  const params = useLocalSearchParams<{ openAddSheet?: string }>();
  const [isAddSheetVisible, setIsAddSheetVisible] = useState(false);
  const [dismissedRecommendationIds, setDismissedRecommendationIds] = useState<Set<number>>(
    () => new Set(),
  );
  const acceptRecommendationMutation = useAcceptRecommendationMutation();
  const passRecommendationMutation = usePassRecommendationMutation();

  useEffect(() => {
    if (params.openAddSheet !== '1') {
      return;
    }

    setIsAddSheetVisible(true);
    router.setParams({ openAddSheet: undefined });
  }, [params.openAddSheet]);

  const visibleRecommendations = useMemo(
    () => recommendations.filter((item) => !dismissedRecommendationIds.has(item.recommendId)),
    [dismissedRecommendationIds, recommendations],
  );

  /** 카드 생성 화면을 엽니다. */
  const handleCreateCard = useCallback(() => {
    setIsAddSheetVisible(false);
    router.push('/card/card-detail');
  }, []);
  /** 카드 추가 sheet를 엽니다. */
  const handleOpenAddSheet = useCallback(() => setIsAddSheetVisible(true), []);
  /** 카드 추가 sheet를 닫습니다. */
  const handleCloseAddSheet = useCallback(() => setIsAddSheetVisible(false), []);
  /** 추천을 서버에 건너뛰기 처리하고, 성공 시 목록에서 숨깁니다. */
  const handleDismissRecommendation = useCallback(
    async (recommendId: number) => {
      if (passRecommendationMutation.isPending) return;

      try {
        await passRecommendationMutation.mutateAsync(recommendId);
        setDismissedRecommendationIds((previous) => new Set(previous).add(recommendId));
      } catch {
        onError('추천 삭제에 실패했어요. 다시 시도해 주세요.');
      }
    },
    [onError, passRecommendationMutation],
  );
  /** 서버가 계산한 추천을 수락해 실제 핀 카드로 반영합니다. */
  const handleAddRecommendation = useCallback(
    async (recommendId: number) => {
      if (acceptRecommendationMutation.isPending) return;

      try {
        await acceptRecommendationMutation.mutateAsync({ recommendId });
        setIsAddSheetVisible(false);
      } catch (error) {
        const errorKind = getRecommendationAcceptErrorKind(error);

        if (errorKind === 'expired') {
          setDismissedRecommendationIds((previous) => new Set(previous).add(recommendId));
          onError('추천 일정이 만료되었어요. 새 추천을 확인해 주세요.');
          return;
        }

        if (errorKind === 'conflict') {
          setDismissedRecommendationIds((previous) => new Set(previous).add(recommendId));
          onError('추천 시간이 더 이상 비어 있지 않아요. 새 추천을 확인해 주세요.');
          return;
        }

        if (errorKind === 'network') {
          onError('네트워크 연결을 확인한 뒤 다시 시도해 주세요.');
          return;
        }

        onError(t('home.recommendation.addError'));
      }
    },
    [acceptRecommendationMutation, onError],
  );
  /** 카드 목록 화면으로 이동합니다. */
  const handleViewQueue = useCallback(() => {
    setIsAddSheetVisible(false);
    router.navigate('/schedule');
  }, []);

  return {
    visibleRecommendations,
    isAddSheetVisible,
    handleCreateCard,
    handleOpenAddSheet,
    handleCloseAddSheet,
    handleDismissRecommendation,
    handleAddRecommendation,
    handleViewQueue,
  };
}

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useUpdateScheduleMutation } from '@/domains/schedule/api/mutations';
import { useScheduleDetailQuery } from '@/domains/schedule/api/queries';
import { toCardItemFromScheduleDetail } from '@/domains/schedule/card-mapper';
import { getCardPersonalTagLabels, progressStatusToScheduleStatus } from '@/domains/schedule/list';
import { getConditionTagById, type CardProgressStatus } from '@/domains/schedule/model';
import { useScheduleStore } from '@/domains/schedule/use-schedule-store';

/** 홈 상세 sheet에 표시할 카드 상세를 조회하고 진행 상태 변경을 처리합니다. */
export function useHomeCardDetail({
  cardId,
  visible,
}: {
  cardId: number | null;
  visible: boolean;
}) {
  const personalTags = useScheduleStore((store) => store.personalTags);
  // 바텀시트를 열 때마다 최신 상세 값을 받아야 하므로 자동 실행 대신 아래 effect에서 명시적으로 조회합니다.
  const detailQuery = useScheduleDetailQuery(cardId, { enabled: false });
  const { refetch: refetchScheduleDetail } = detailQuery;
  const updateScheduleMutation = useUpdateScheduleMutation();
  const [statusOverride, setStatusOverride] = useState<CardProgressStatus | null>(null);

  const card = useMemo(
    () =>
      detailQuery.data == null
        ? null
        : toCardItemFromScheduleDetail(detailQuery.data, personalTags),
    [detailQuery.data, personalTags],
  );
  const conditionTag = card == null ? null : getConditionTagById(card.conditionTagId);
  const personalTagLabels = useMemo(
    () => (card == null ? [] : getCardPersonalTagLabels(card, personalTags)),
    [card, personalTags],
  );

  // 카드가 바뀌거나 sheet를 다시 열면 낙관적 상태 override를 초기화합니다.
  useEffect(() => {
    setStatusOverride(null);
  }, [cardId, visible]);

  useEffect(() => {
    if (!visible || cardId == null) return;

    void refetchScheduleDetail();
  }, [cardId, refetchScheduleDetail, visible]);

  // 홈 상세 sheet는 카드의 저장 상태와 관계없이 항상 '시작전'에서 시작합니다.
  const status = statusOverride ?? 'incomplete';

  /** 진행 상태 세그먼트 변경을 저장합니다. */
  const changeStatus = useCallback(
    (next: CardProgressStatus) => {
      if (card == null || updateScheduleMutation.isPending) return;

      setStatusOverride(next);
      updateScheduleMutation.mutate(
        { scheduleId: Number(card.id), data: { status: progressStatusToScheduleStatus(next) } },
        { onError: () => setStatusOverride(null) },
      );
    },
    [card, updateScheduleMutation],
  );

  return {
    card,
    conditionTag,
    personalTagLabels,
    isLoading: detailQuery.isLoading,
    isError: detailQuery.isError,
    status,
    changeStatus,
  };
}

/** 진행 확인·시간 연장·큐 전환·재일정 sheet를 하나의 상태 기계로 소유합니다. */
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { getQueueTimeRecommendationErrorMode } from '@/domains/ai-recommendation/api/client';
import { useAcceptRecommendationMutation } from '@/domains/ai-recommendation/api/mutations';
import { useQueueTimeRecommendationsQuery } from '@/domains/ai-recommendation/api/queries';
import { isUpcomingScheduleRecommendation } from '@/domains/ai-recommendation/model';
import {
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
} from '@/domains/schedule/api/mutations';
import {
  toQueueConversionUpdateInput,
  toScheduleCreateInput,
  toScheduleUpdateInput,
} from '@/domains/schedule/card-mapper';
import { progressStatusToScheduleStatus } from '@/domains/schedule/list';
import {
  type CardFormValues,
  type CardItem,
  type CardProgressStatus,
  type PersonalTagOption,
} from '@/domains/schedule/model';
import { createQueueCardForReschedule, type DueDurationDraft } from '@/domains/schedule/queue';

import {
  createHomeQueueDraft,
  getHomeExtendState,
  getHomeProgressTimeSummary,
  isHomeScheduleEnded,
} from '../home-screen-logic';

const EXTEND_STEP_MINUTES = 10;
const RESCHEDULE_INITIAL_DAYS = 7;
const RESCHEDULE_EXTENDED_DAYS = 14;

type ProgressSheetStep = 'status' | 'action';

type ProgressFlow = {
  kind: 'progress';
  card: CardItem;
  status: CardProgressStatus;
  step: ProgressSheetStep;
};
type RescheduleFlow = { kind: 'reschedule'; card: CardItem; recommendationDays: number };
type ExtendFlow = { kind: 'extend'; card: CardItem; origin: ProgressFlow };
type QueueFlow = { kind: 'queue'; card: CardItem; origin: ProgressFlow | RescheduleFlow };
type DetailFlow = { kind: 'detail'; card: CardItem };
type HomeScheduleFlow =
  | { kind: 'none' }
  | ProgressFlow
  | RescheduleFlow
  | ExtendFlow
  | QueueFlow
  | DetailFlow;

/** 진행/연장/큐/재일정 sheet 상태와 관련 mutation·query를 소유합니다. */
export function useHomeScheduleFlow({
  selectedDate,
  now,
  timelineCards,
  personalTags,
  onError,
}: {
  selectedDate: Date;
  now: Date;
  timelineCards: CardItem[];
  personalTags: PersonalTagOption[];
  onError: (message: string) => void;
}) {
  const [flow, setFlow] = useState<HomeScheduleFlow>({ kind: 'none' });
  const [extensionMinutes, setExtensionMinutes] = useState(EXTEND_STEP_MINUTES);
  const [isConflictToastDismissed, setIsConflictToastDismissed] = useState(false);

  const createScheduleMutation = useCreateScheduleMutation();
  const updateScheduleMutation = useUpdateScheduleMutation();
  const acceptRecommendationMutation = useAcceptRecommendationMutation();

  // 재일정 카드는 reschedule sheet뿐 아니라 그 위에 큐 sheet가 겹쳐 있을 때도 유지됩니다.
  const activeRescheduleCard =
    flow.kind === 'reschedule'
      ? flow.card
      : flow.kind === 'queue' && flow.origin.kind === 'reschedule'
        ? flow.origin.card
        : null;
  const activeRescheduleDays =
    flow.kind === 'reschedule'
      ? flow.recommendationDays
      : flow.kind === 'queue' && flow.origin.kind === 'reschedule'
        ? flow.origin.recommendationDays
        : RESCHEDULE_INITIAL_DAYS;
  const rescheduleRecommendationQuery = useQueueTimeRecommendationsQuery(
    activeRescheduleCard == null ? null : Number(activeRescheduleCard.id),
    activeRescheduleDays,
    {
      enabled: activeRescheduleCard != null,
      retry: false,
    },
  );

  const progressCard = flow.kind === 'progress' ? flow.card : null;
  const progressOrExtendCard =
    flow.kind === 'progress' || flow.kind === 'extend' ? flow.card : null;
  // 큐 sheet는 progress/extend/reschedule 어디서든 열릴 수 있으므로 그 아래의 카드를 계속 마운트합니다.
  const activeCard = flow.kind === 'none' ? null : flow.card;

  const extendState = useMemo(
    () =>
      getHomeExtendState(
        flow.kind === 'extend' ? flow.card : null,
        extensionMinutes,
        now,
        timelineCards,
      ),
    [extensionMinutes, flow, now, timelineCards],
  );
  const rescheduleCandidates = useMemo(
    () =>
      (rescheduleRecommendationQuery.data?.candidates ?? []).filter((recommendation) =>
        isUpcomingScheduleRecommendation(recommendation, now),
      ),
    [now, rescheduleRecommendationQuery.data?.candidates],
  );
  const queueDraftValue = useMemo(() => createHomeQueueDraft(activeCard), [activeCard]);

  /** 종료된 카드는 진행 sheet를, 그 외 카드는 상세 sheet를 엽니다. */
  const handleCardPress = useCallback(
    (card: CardItem) => {
      if (isHomeScheduleEnded(card, selectedDate, now)) {
        setFlow({
          kind: 'progress',
          card,
          // 종료 여부와 무관하게 사용자가 sheet에서 처음 보는 값은 '시작전'입니다.
          status: 'incomplete',
          step: 'status',
        });
        return;
      }
      setFlow({ kind: 'detail', card });
    },
    [now, selectedDate],
  );
  /** 상세 sheet를 닫습니다. */
  const handleCloseDetail = useCallback(() => setFlow({ kind: 'none' }), []);
  /** 상세 sheet에서 편집 화면으로 이동합니다. */
  const handleEditDetail = useCallback(() => {
    if (flow.kind !== 'detail') return;
    router.push(`/card/card-detail?cardId=${flow.card.id}`);
    setFlow({ kind: 'none' });
  }, [flow]);
  /** 진행 상태 선택값을 갱신합니다. */
  const setProgressStatus = useCallback((status: CardProgressStatus) => {
    setFlow((previous) => (previous.kind === 'progress' ? { ...previous, status } : previous));
  }, []);
  /** 진행 관련 sheet를 모두 닫습니다. */
  const handleCloseProgressSheet = useCallback(() => setFlow({ kind: 'none' }), []);
  const handleBackProgressSheet = useCallback(() => {
    setFlow((previous) =>
      previous.kind === 'progress' ? { ...previous, step: 'status' } : previous,
    );
  }, []);
  /** 선택한 상태에 따라 완료하거나 후속 처리 단계를 엽니다. */
  const handleCompleteProgress = useCallback(() => {
    if (flow.kind !== 'progress' || updateScheduleMutation.isPending) return;

    const { card, status } = flow;

    if (status !== 'complete') {
      updateScheduleMutation.mutate(
        {
          scheduleId: Number(card.id),
          data: { status: progressStatusToScheduleStatus(status) },
        },
        {
          onSuccess: () =>
            setFlow((previous) =>
              previous.kind === 'progress' ? { ...previous, step: 'action' } : previous,
            ),
        },
      );
      return;
    }

    updateScheduleMutation.mutate(
      {
        scheduleId: Number(card.id),
        data: { status: progressStatusToScheduleStatus(status) },
      },
      { onSuccess: () => setFlow({ kind: 'none' }) },
    );
  }, [flow, updateScheduleMutation]);
  /** 종료된 핀 카드를 같은 소요 시간의 큐 카드로 바꾼 뒤 추천 시간대를 찾습니다. */
  const handleReschedule = useCallback(() => {
    if (flow.kind !== 'progress' || updateScheduleMutation.isPending) return;

    const { card } = flow;
    const queueDraft = createHomeQueueDraft(card);

    updateScheduleMutation.mutate(
      {
        scheduleId: Number(card.id),
        data: toQueueConversionUpdateInput(queueDraft),
      },
      {
        onSuccess: () =>
          setFlow({
            kind: 'reschedule',
            card: createQueueCardForReschedule(card, queueDraft),
            recommendationDays: RESCHEDULE_INITIAL_DAYS,
          }),
        onError: () => onError('일정을 다시 배치하지 못했어요. 다시 시도해 주세요.'),
      },
    );
  }, [flow, onError, updateScheduleMutation]);
  const handleCloseReschedule = useCallback(() => setFlow({ kind: 'none' }), []);
  const handleSearchReschedule14Days = useCallback(() => {
    setFlow((previous) =>
      previous.kind === 'reschedule'
        ? { ...previous, recommendationDays: RESCHEDULE_EXTENDED_DAYS }
        : previous,
    );
  }, []);
  const handleEditRescheduleDuration = useCallback(
    (durationMinutes: number) => {
      if (flow.kind !== 'reschedule') return;

      const { card } = flow;

      updateScheduleMutation.mutate(
        {
          scheduleId: Number(card.id),
          data: { estimatedMinutes: durationMinutes },
        },
        {
          onSuccess: () => {
            setFlow((previous) =>
              previous.kind === 'reschedule'
                ? {
                    ...previous,
                    card: {
                      ...previous.card,
                      durationHours: Math.floor(durationMinutes / 60),
                      durationMinutes: durationMinutes % 60,
                      durationUnknown: false,
                    },
                  }
                : previous,
            );
            void rescheduleRecommendationQuery.refetch();
          },
          onError: () => onError('소요 시간을 변경하지 못했어요. 다시 시도해 주세요.'),
        },
      );
    },
    [flow, onError, rescheduleRecommendationQuery, updateScheduleMutation],
  );
  const handleRescheduleConvert = useCallback(
    (values: CardFormValues, keepOriginal: boolean) => {
      if (
        flow.kind !== 'reschedule' ||
        updateScheduleMutation.isPending ||
        createScheduleMutation.isPending
      ) {
        return;
      }

      const { card } = flow;
      let pinInput: ReturnType<typeof toScheduleCreateInput>;

      try {
        pinInput = toScheduleCreateInput('pin', values, personalTags);
      } catch {
        onError('추천 시간을 다시 확인해 주세요.');
        return;
      }

      if (keepOriginal) {
        createScheduleMutation.mutate(pinInput, {
          onSuccess: () => setFlow({ kind: 'none' }),
          onError: () => onError('추천 일정 추가에 실패했어요. 다시 시도해 주세요.'),
        });
        return;
      }

      updateScheduleMutation.mutate(
        {
          scheduleId: Number(card.id),
          data: toScheduleUpdateInput('pin', values, personalTags),
        },
        {
          onSuccess: () => setFlow({ kind: 'none' }),
          onError: () => onError('일정을 다시 배치하지 못했어요. 다시 시도해 주세요.'),
        },
      );
    },
    [createScheduleMutation, flow, onError, personalTags, updateScheduleMutation],
  );
  const handleAcceptRescheduleRecommendation = useCallback(
    (recommendId: number, keepOriginal: boolean) => {
      if (acceptRecommendationMutation.isPending) return;

      acceptRecommendationMutation.mutate(
        { recommendId, keepQueueCard: keepOriginal },
        {
          onSuccess: () => setFlow({ kind: 'none' }),
          onError: () => onError('추천 일정 추가에 실패했어요. 다시 시도해 주세요.'),
        },
      );
    },
    [acceptRecommendationMutation, onError],
  );
  /** 큐 전환 sheet를 엽니다. */
  const handleOpenQueueSheet = useCallback(() => {
    setFlow((previous) =>
      previous.kind === 'progress' || previous.kind === 'reschedule'
        ? { kind: 'queue', card: previous.card, origin: previous }
        : previous,
    );
  }, []);
  /** 큐 전환 sheet를 닫고 이전 sheet로 돌아갑니다. */
  const handleCloseQueueSheet = useCallback(() => {
    setFlow((previous) => (previous.kind === 'queue' ? previous.origin : previous));
  }, []);
  /** 핀 카드를 큐 카드로 변경합니다. */
  const handleConfirmQueueConversion = useCallback(
    (draft: DueDurationDraft) => {
      if (flow.kind !== 'queue' || updateScheduleMutation.isPending) return;

      const { card } = flow;

      updateScheduleMutation.mutate(
        { scheduleId: Number(card.id), data: toQueueConversionUpdateInput(draft) },
        { onSuccess: () => setFlow({ kind: 'none' }) },
      );
    },
    [flow, updateScheduleMutation],
  );
  /** 시간 연장 sheet를 초기화해 엽니다. */
  const handleOpenExtendSheet = useCallback(() => {
    setFlow((previous) =>
      previous.kind === 'progress'
        ? { kind: 'extend', card: previous.card, origin: previous }
        : previous,
    );
    setExtensionMinutes(EXTEND_STEP_MINUTES);
    setIsConflictToastDismissed(false);
  }, []);
  /** 시간 연장 sheet를 닫고 진행 sheet로 돌아갑니다. */
  const handleCloseExtendSheet = useCallback(() => {
    setFlow((previous) => (previous.kind === 'extend' ? previous.origin : previous));
  }, []);
  /** 연장 시간을 줄입니다. */
  const handleDecreaseExtension = useCallback(() => {
    setIsConflictToastDismissed(false);
    setExtensionMinutes((previous) => Math.max(0, previous - EXTEND_STEP_MINUTES));
  }, []);
  /** 연장 시간을 늘립니다. */
  const handleIncreaseExtension = useCallback(() => {
    setIsConflictToastDismissed(false);
    setExtensionMinutes((previous) => previous + EXTEND_STEP_MINUTES);
  }, []);
  /** 연장 충돌 안내를 숨깁니다. */
  const dismissConflictToast = useCallback(() => setIsConflictToastDismissed(true), []);
  /** 충돌이 없을 때 종료 시각 연장을 저장합니다. */
  const handleCompleteExtension = useCallback(() => {
    if (flow.kind !== 'extend' || extendState.hasConflict || updateScheduleMutation.isPending)
      return;

    const { card } = flow;

    updateScheduleMutation.mutate(
      { scheduleId: Number(card.id), data: { endTime: extendState.newEndTime } },
      { onSuccess: () => setFlow({ kind: 'none' }) },
    );
  }, [extendState, flow, updateScheduleMutation]);

  const isUpdatingSchedule = updateScheduleMutation.isPending;

  return {
    isUpdatingSchedule,
    onCardPress: handleCardPress,
    detail: {
      visible: flow.kind === 'detail',
      cardId: flow.kind === 'detail' ? Number(flow.card.id) : null,
      onClose: handleCloseDetail,
      onEdit: handleEditDetail,
    },
    progress: {
      visible: flow.kind === 'progress',
      title: progressCard?.title ?? '',
      timeSummary: progressCard ? getHomeProgressTimeSummary(progressCard) : '',
      status: flow.kind === 'progress' ? flow.status : ('incomplete' as CardProgressStatus),
      step: flow.kind === 'progress' ? flow.step : ('status' as ProgressSheetStep),
      setStatus: setProgressStatus,
      onCancel: handleCloseProgressSheet,
      onBack: handleBackProgressSheet,
      onComplete: handleCompleteProgress,
      onReschedule: handleReschedule,
      onLeaveAsQueue: handleOpenQueueSheet,
      onExtend: handleOpenExtendSheet,
    },
    queue: {
      mounted: activeCard != null,
      visible: flow.kind === 'queue',
      value: queueDraftValue,
      scheduleTitle: activeCard?.title,
      onClose: handleCloseQueueSheet,
      onDone: handleConfirmQueueConversion,
    },
    reschedule: {
      mounted: activeRescheduleCard != null,
      visible: flow.kind === 'reschedule',
      card: activeRescheduleCard,
      candidates: rescheduleCandidates,
      isRecommendationLoading: rescheduleRecommendationQuery.isFetching,
      recommendationErrorMode: getQueueTimeRecommendationErrorMode(
        rescheduleRecommendationQuery.error,
      ),
      onClose: handleCloseReschedule,
      onConvert: handleRescheduleConvert,
      onAcceptRecommendation: handleAcceptRescheduleRecommendation,
      onSearch14Days: handleSearchReschedule14Days,
      onEditDuration: handleEditRescheduleDuration,
      onLeaveAsQueue: handleOpenQueueSheet,
    },
    extend: {
      mounted: progressOrExtendCard != null,
      visible: flow.kind === 'extend',
      title: progressOrExtendCard?.title ?? '',
      dateLabel: progressOrExtendCard?.dateStart
        ? progressOrExtendCard.dateStart.slice(5).replace(/[.-]/g, '/')
        : '',
      startTime: progressOrExtendCard?.timeStart ?? '',
      state: extendState,
      addedMinutes: extensionMinutes,
      showConflictToast: extendState.hasConflict && !isConflictToastDismissed,
      completeDisabled: extendState.hasConflict || isUpdatingSchedule,
      onBack: handleCloseExtendSheet,
      onComplete: handleCompleteExtension,
      onDecrease: handleDecreaseExtension,
      onIncrease: handleIncreaseExtension,
      onDismissConflict: dismissConflictToast,
    },
  };
}

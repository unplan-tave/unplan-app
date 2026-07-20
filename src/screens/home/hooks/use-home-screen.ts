/** 홈 화면의 서버 상태, 로컬 interaction, 라우팅, mutation을 조합합니다. */
import { isAxiosError } from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { useAcceptRecommendationMutation } from '@/domains/ai-recommendation/api/mutations';
import { useQueueTimeRecommendationsQuery } from '@/domains/ai-recommendation/api/queries';
import {
  useCreateDailyMemoMutation,
  useDeleteDailyMemoMutation,
} from '@/domains/daily-memo/api/mutations';
import { useUpdateAlarmSettingsMutation } from '@/domains/member/api/mutations';
import {
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
} from '@/domains/schedule/api/mutations';
import {
  toQueueConversionUpdateInput,
  toScheduleCreateInput,
  toScheduleUpdateInput,
} from '@/domains/schedule/card-mapper';
import { getCardProgressStatus, progressStatusToScheduleStatus } from '@/domains/schedule/list';
import {
  type CardFormValues,
  type CardItem,
  type CardProgressStatus,
} from '@/domains/schedule/model';
import { type DueDurationDraft } from '@/domains/schedule/queue';
import { useScheduleStore } from '@/domains/schedule/use-schedule-store';
import { useConditionCalendar } from '@/hooks/use-condition-calendar';
import { t } from '@/lib/i18n';
import { addDays, getWeekStart, isSameDate } from '@/lib/utils/date';

import {
  formatDateValue,
  getHomeDateLabel,
  getNextHomeViewMode,
  getZoomedHomeViewMode,
  type HomeViewMode,
} from '../home-calendar';
import {
  createHomeQueueDraft,
  formatHomeDailyMemoDate,
  formatHomeCurrentTime,
  getHomeExtendState,
  getHomeHeaderMessage,
  getHomeProgressTimeSummary,
  isHomeScheduleEnded,
  toHomeRecommendationTimelineCardViewModel,
  toHomeTimelineCardViewModel,
} from '../home-screen-logic';

import { useHomeConditionPrompt } from './use-home-condition-prompt';
import { useHomePageData } from './use-home-page-data';

import type { AlarmSettings } from '@/domains/member/model';

const EXTEND_STEP_MINUTES = 10;
const HOME_TIMELINE_TOP_PLACEHOLDER_COUNT = 2;
const HOME_TIMELINE_TOP_HALF_PLACEHOLDER_HEIGHT = 54;
const HOME_TIMELINE_EMPTY_ADD_MARKER_OFFSET_RATIO = 1.1;
type ProgressSheetStep = 'status' | 'action';

/** 홈 화면 컴포넌트가 렌더링에 사용할 값과 이벤트를 반환합니다. */
export function useHomeScreen() {
  const params = useLocalSearchParams<{
    onboardingNotification?: string;
    openAddSheet?: string;
  }>();
  const [now, setNow] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<HomeViewMode>('daily');
  const [isAddSheetVisible, setIsAddSheetVisible] = useState(false);
  const [isDailyMemoSheetVisible, setIsDailyMemoSheetVisible] = useState(false);
  const [deletingMemoId, setDeletingMemoId] = useState<number | null>(null);
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(
    () => params.onboardingNotification === '1',
  );
  const [notificationErrorMessage, setNotificationErrorMessage] = useState<string | null>(null);
  const [dismissedRecommendationIds, setDismissedRecommendationIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [progressCard, setProgressCard] = useState<CardItem | null>(null);
  const [progressStatus, setProgressStatus] = useState<CardProgressStatus>('incomplete');
  const [progressSheetStep, setProgressSheetStep] = useState<ProgressSheetStep>('status');
  const [isExtendSheetVisible, setIsExtendSheetVisible] = useState(false);
  const [isQueueSheetVisible, setIsQueueSheetVisible] = useState(false);
  const [isRescheduleSheetVisible, setIsRescheduleSheetVisible] = useState(false);
  const [rescheduleCard, setRescheduleCard] = useState<CardItem | null>(null);
  const [rescheduleRecommendationDays, setRescheduleRecommendationDays] = useState(7);
  const [extensionMinutes, setExtensionMinutes] = useState(EXTEND_STEP_MINUTES);
  const [isConflictToastDismissed, setIsConflictToastDismissed] = useState(false);
  const [recommendationErrorMessage, setRecommendationErrorMessage] = useState<string | null>(null);
  const personalTags = useScheduleStore((store) => store.personalTags);
  const updateAlarmSettingsMutation = useUpdateAlarmSettingsMutation();
  const createScheduleMutation = useCreateScheduleMutation();
  const updateScheduleMutation = useUpdateScheduleMutation();
  const createDailyMemoMutation = useCreateDailyMemoMutation();
  const deleteDailyMemoMutation = useDeleteDailyMemoMutation();
  const acceptRecommendationMutation = useAcceptRecommendationMutation();
  const rescheduleRecommendationQuery = useQueueTimeRecommendationsQuery(
    rescheduleCard == null ? null : Number(rescheduleCard.id),
    rescheduleRecommendationDays,
    {
      enabled: isRescheduleSheetVisible && rescheduleCard != null,
      retry: false,
    },
  );
  const selectedDateValue = useMemo(() => formatDateValue(selectedDate), [selectedDate]);
  const todayValue = useMemo(() => formatDateValue(now), [now]);
  const pageData = useHomePageData({ personalTags, selectedDate, viewMode });
  const conditionPrompt = useHomeConditionPrompt(todayValue, !isNotificationModalVisible);
  const visibleRecommendations = useMemo(
    () =>
      pageData.recommendations.filter((item) => !dismissedRecommendationIds.has(item.recommendId)),
    [dismissedRecommendationIds, pageData.recommendations],
  );
  const timelineItems = useMemo(
    () =>
      [
        ...pageData.timelineCards.map((card) => ({ kind: 'schedule' as const, card })),
        ...visibleRecommendations.map((recommendation) => ({
          kind: 'recommendation' as const,
          recommendation,
        })),
      ].sort((first, second) => {
        const firstStartTime =
          first.kind === 'schedule' ? first.card.timeStart : first.recommendation.startTime;
        const secondStartTime =
          second.kind === 'schedule' ? second.card.timeStart : second.recommendation.startTime;

        return firstStartTime.localeCompare(secondStartTime);
      }),
    [pageData.timelineCards, visibleRecommendations],
  );
  const extendState = useMemo(
    () => getHomeExtendState(progressCard, extensionMinutes, now, pageData.timelineCards),
    [extensionMinutes, now, pageData.timelineCards, progressCard],
  );
  const queueSheetCard = progressCard ?? rescheduleCard;
  const queueDraftValue = useMemo(() => createHomeQueueDraft(queueSheetCard), [queueSheetCard]);

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(intervalId);
  }, []);
  useEffect(() => {
    if (params.onboardingNotification === '1') setIsNotificationModalVisible(true);
  }, [params.onboardingNotification]);
  useEffect(() => {
    if (params.openAddSheet !== '1') {
      return;
    }

    setIsAddSheetVisible(true);
    router.setParams({ openAddSheet: undefined });
  }, [params.openAddSheet]);

  /** pinch 방향에 맞춰 홈 보기 단위를 변경합니다. */
  const changeViewModeByZoom = useCallback(
    (direction: 'in' | 'out') =>
      setViewMode((previous) => getZoomedHomeViewMode(previous, direction)),
    [],
  );
  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch().onEnd((event) => {
        if (event.scale < 0.92) runOnJS(changeViewModeByZoom)('out');
        if (event.scale > 1.08) runOnJS(changeViewModeByZoom)('in');
      }),
    [changeViewModeByZoom],
  );
  /** 보기 단위에 따라 선택 날짜를 이전·다음 기간으로 이동합니다. */
  const movePeriod = useCallback(
    (direction: 'previous' | 'next') => {
      const amount = direction === 'previous' ? -1 : 1;

      setSelectedDate((previous) => {
        if (viewMode === 'daily') return addDays(previous, amount);
        if (viewMode === 'weekly') return addDays(getWeekStart(previous), amount * 7);

        return new Date(previous.getFullYear(), previous.getMonth() + amount, 1);
      });
    },
    [viewMode],
  );
  const periodSwipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-20, 20])
        .failOffsetY([-20, 20])
        .onEnd((event) => {
          if (event.translationX <= -40) runOnJS(movePeriod)('next');
          if (event.translationX >= 40) runOnJS(movePeriod)('previous');
        }),
    [movePeriod],
  );
  const homeGesture = useMemo(
    () => Gesture.Simultaneous(pinchGesture, periodSwipeGesture),
    [periodSwipeGesture, pinchGesture],
  );
  /** 알림 안내 모달을 닫고 홈 route를 정리합니다. */
  const closeNotificationModal = useCallback(() => {
    setIsNotificationModalVisible(false);
    setNotificationErrorMessage(null);
    router.replace('/(tabs)');
  }, []);
  /** 알림 설정을 저장합니다. */
  const updateNotificationSettings = useCallback(
    (enabled: boolean) => {
      if (updateAlarmSettingsMutation.isPending) return;
      const settings: AlarmSettings = {
        scheduleEndAlarmOn: enabled,
        conditionRecordAlarmOn: enabled,
        recommendAlarmOn: enabled,
      };
      setNotificationErrorMessage(null);
      updateAlarmSettingsMutation.mutate(settings, {
        onSuccess: closeNotificationModal,
        onError: () => setNotificationErrorMessage(t('onboarding.notification.saveError')),
      });
    },
    [closeNotificationModal, updateAlarmSettingsMutation],
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
  /** 선택 날짜의 메모를 생성합니다. */
  const handleCreateDailyMemo = useCallback(
    async (content: string) => {
      if (!createDailyMemoMutation.isPending)
        await createDailyMemoMutation.mutateAsync({ date: selectedDateValue, content });
    },
    [createDailyMemoMutation, selectedDateValue],
  );
  /** 선택한 메모를 삭제합니다. */
  const handleDeleteDailyMemo = useCallback(
    (id: number) => {
      if (deleteDailyMemoMutation.isPending) return;
      setDeletingMemoId(id);
      deleteDailyMemoMutation.mutate(
        { date: selectedDateValue, id },
        { onSettled: () => setDeletingMemoId(null) },
      );
    },
    [deleteDailyMemoMutation, selectedDateValue],
  );
  /** 추천 카드를 현재 세션에서 숨깁니다. */
  const handleDismissRecommendation = useCallback(
    (recommendId: number) =>
      setDismissedRecommendationIds((previous) => new Set(previous).add(recommendId)),
    [],
  );
  /** 서버가 계산한 추천을 수락해 실제 핀 카드로 반영합니다. */
  const handleAddRecommendation = useCallback(
    async (recommendId: number) => {
      if (acceptRecommendationMutation.isPending) return;

      try {
        await acceptRecommendationMutation.mutateAsync({ recommendId });
        setIsAddSheetVisible(false);
      } catch (error) {
        const status = getHttpErrorStatus(error);

        if (status === 404) {
          setDismissedRecommendationIds((previous) => new Set(previous).add(recommendId));
          setRecommendationErrorMessage('추천 일정이 만료되었어요. 새 추천을 확인해 주세요.');
          return;
        }

        if (status === 409) {
          setDismissedRecommendationIds((previous) => new Set(previous).add(recommendId));
          setRecommendationErrorMessage(
            '추천 시간이 더 이상 비어 있지 않아요. 새 추천을 확인해 주세요.',
          );
          return;
        }

        if (status == null) {
          setRecommendationErrorMessage('네트워크 연결을 확인한 뒤 다시 시도해 주세요.');
          return;
        }

        setRecommendationErrorMessage(t('home.recommendation.addError'));
      }
    },
    [acceptRecommendationMutation],
  );
  /** 카드 목록 화면으로 이동합니다. */
  const handleViewQueue = useCallback(() => {
    setIsAddSheetVisible(false);
    router.navigate('/schedule');
  }, []);
  /** 알림 화면으로 이동합니다. */
  const openNotifications = useCallback(() => {
    router.push('/notifications');
  }, []);
  /** 홈 헤더의 컨디션 점수에서 컨디션 탭으로 이동합니다. */
  const openConditionTab = useCallback(() => {
    router.navigate('/condition');
  }, []);
  /** 종료된 카드는 진행 sheet를, 그 외 카드는 상세를 엽니다. */
  const handleCardPress = useCallback(
    (card: CardItem) => {
      if (isHomeScheduleEnded(card, selectedDate, now)) {
        setProgressCard(card);
        setProgressStatus(getCardProgressStatus(card));
        setProgressSheetStep('status');
        return;
      }
      router.push(`/card/view?cardId=${card.id}`);
    },
    [now, selectedDate],
  );
  /** 진행 관련 sheet 상태를 모두 닫습니다. */
  const handleCloseProgressSheet = useCallback(() => {
    setProgressCard(null);
    setProgressSheetStep('status');
    setIsExtendSheetVisible(false);
    setIsQueueSheetVisible(false);
  }, []);
  /** 종료된 핀 카드를 같은 소요 시간의 큐 카드로 바꾼 뒤 추천 시간대를 찾습니다. */
  const handleReschedule = useCallback(() => {
    if (!progressCard || updateScheduleMutation.isPending) return;

    const queueDraft = createHomeQueueDraft(progressCard);

    updateScheduleMutation.mutate(
      {
        scheduleId: Number(progressCard.id),
        data: toQueueConversionUpdateInput(queueDraft),
      },
      {
        onSuccess: () => {
          setRescheduleCard(createRescheduleQueueCard(progressCard, queueDraft));
          setRescheduleRecommendationDays(7);
          setProgressCard(null);
          setIsRescheduleSheetVisible(true);
        },
        onError: () => {
          setRecommendationErrorMessage('일정을 다시 배치하지 못했어요. 다시 시도해 주세요.');
        },
      },
    );
  }, [progressCard, updateScheduleMutation]);
  const handleCloseReschedule = useCallback(() => {
    setIsRescheduleSheetVisible(false);
    setRescheduleCard(null);
  }, []);
  const handleSearchReschedule14Days = useCallback(() => {
    setRescheduleRecommendationDays(14);
  }, []);
  const handleEditRescheduleDuration = useCallback(
    (durationMinutes: number) => {
      if (rescheduleCard == null) return;

      updateScheduleMutation.mutate(
        {
          scheduleId: Number(rescheduleCard.id),
          data: { estimatedMinutes: durationMinutes },
        },
        {
          onSuccess: () => {
            setRescheduleCard((previous) =>
              previous == null
                ? null
                : {
                    ...previous,
                    durationHours: Math.floor(durationMinutes / 60),
                    durationMinutes: durationMinutes % 60,
                    durationUnknown: false,
                  },
            );
            void rescheduleRecommendationQuery.refetch();
          },
          onError: () =>
            setRecommendationErrorMessage('소요 시간을 변경하지 못했어요. 다시 시도해 주세요.'),
        },
      );
    },
    [rescheduleCard, rescheduleRecommendationQuery, updateScheduleMutation],
  );
  const handleRescheduleConvert = useCallback(
    (values: CardFormValues, keepOriginal: boolean) => {
      if (
        rescheduleCard == null ||
        updateScheduleMutation.isPending ||
        createScheduleMutation.isPending
      ) {
        return;
      }

      let pinInput: ReturnType<typeof toScheduleCreateInput>;

      try {
        pinInput = toScheduleCreateInput('pin', values, personalTags);
      } catch {
        setRecommendationErrorMessage('추천 시간을 다시 확인해 주세요.');
        return;
      }

      if (keepOriginal) {
        createScheduleMutation.mutate(pinInput, {
          onSuccess: () => handleCloseReschedule(),
          onError: () =>
            setRecommendationErrorMessage('추천 일정 추가에 실패했어요. 다시 시도해 주세요.'),
        });
        return;
      }

      updateScheduleMutation.mutate(
        {
          scheduleId: Number(rescheduleCard.id),
          data: toScheduleUpdateInput('pin', values, personalTags),
        },
        {
          onSuccess: () => handleCloseReschedule(),
          onError: () =>
            setRecommendationErrorMessage('일정을 다시 배치하지 못했어요. 다시 시도해 주세요.'),
        },
      );
    },
    [
      createScheduleMutation,
      handleCloseReschedule,
      personalTags,
      rescheduleCard,
      updateScheduleMutation,
    ],
  );
  const handleAcceptRescheduleRecommendation = useCallback(
    (recommendId: number, keepOriginal: boolean) => {
      if (acceptRecommendationMutation.isPending) return;

      acceptRecommendationMutation.mutate(
        { recommendId, keepQueueCard: keepOriginal },
        {
          onSuccess: () => handleCloseReschedule(),
          onError: () =>
            setRecommendationErrorMessage('추천 일정 추가에 실패했어요. 다시 시도해 주세요.'),
        },
      );
    },
    [acceptRecommendationMutation, handleCloseReschedule],
  );
  const handleBackProgressSheet = useCallback(() => {
    setProgressSheetStep('status');
  }, []);
  /** 선택한 상태에 따라 완료하거나 후속 처리 단계를 엽니다. */
  const handleCompleteProgress = useCallback(() => {
    if (!progressCard || updateScheduleMutation.isPending) return;

    if (progressStatus !== 'complete') {
      updateScheduleMutation.mutate(
        {
          scheduleId: Number(progressCard.id),
          data: { status: progressStatusToScheduleStatus(progressStatus) },
        },
        { onSuccess: () => setProgressSheetStep('action') },
      );
      return;
    }

    updateScheduleMutation.mutate(
      {
        scheduleId: Number(progressCard.id),
        data: { status: progressStatusToScheduleStatus(progressStatus) },
      },
      { onSuccess: () => setProgressCard(null) },
    );
  }, [progressCard, progressStatus, updateScheduleMutation]);
  /** 큐 전환 sheet를 엽니다. */
  const handleOpenQueueSheet = useCallback(() => setIsQueueSheetVisible(true), []);
  /** 큐 전환 sheet를 닫습니다. */
  const handleCloseQueueSheet = useCallback(() => setIsQueueSheetVisible(false), []);
  /** 핀 카드를 큐 카드로 변경합니다. */
  const handleConfirmQueueConversion = useCallback(
    (draft: DueDurationDraft) => {
      const card = progressCard ?? rescheduleCard;
      if (!card || updateScheduleMutation.isPending) return;
      updateScheduleMutation.mutate(
        { scheduleId: Number(card.id), data: toQueueConversionUpdateInput(draft) },
        {
          onSuccess: () => {
            setIsQueueSheetVisible(false);
            setProgressCard(null);
            setRescheduleCard(null);
            setIsRescheduleSheetVisible(false);
          },
        },
      );
    },
    [progressCard, rescheduleCard, updateScheduleMutation],
  );
  /** 시간 연장 sheet를 초기화해 엽니다. */
  const handleOpenExtendSheet = useCallback(() => {
    setExtensionMinutes(EXTEND_STEP_MINUTES);
    setIsConflictToastDismissed(false);
    setIsExtendSheetVisible(true);
  }, []);
  /** 시간 연장 sheet를 닫습니다. */
  const handleCloseExtendSheet = useCallback(() => setIsExtendSheetVisible(false), []);
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
    if (!progressCard || extendState.hasConflict || updateScheduleMutation.isPending) return;
    updateScheduleMutation.mutate(
      { scheduleId: Number(progressCard.id), data: { endTime: extendState.newEndTime } },
      {
        onSuccess: () => {
          setIsExtendSheetVisible(false);
          setProgressCard(null);
        },
      },
    );
  }, [extendState, progressCard, updateScheduleMutation]);
  /** 캘린더 선택 날짜를 바꿉니다. */
  const handleSelectDate = useCallback((date: Date) => setSelectedDate(date), []);
  const handleCalendarDateSelect = useCallback((date: Date) => setSelectedDate(date), []);
  const calendar = useConditionCalendar({
    selectedDate,
    periodMode: 'daily',
    onSelectDate: handleCalendarDateSelect,
  });
  /** 일·주·월 보기를 순환합니다. */
  const handleCycleViewMode = useCallback(
    () => setViewMode((previous) => getNextHomeViewMode(previous)),
    [],
  );
  /** 메모 sheet를 엽니다. */
  const handleOpenMemoSheet = useCallback(() => setIsDailyMemoSheetVisible(true), []);
  /** 메모 sheet를 닫습니다. */
  const handleCloseMemoSheet = useCallback(() => setIsDailyMemoSheetVisible(false), []);
  const dismissRecommendationErrorToast = useCallback(
    () => setRecommendationErrorMessage(null),
    [],
  );
  /** 타임라인 렌더링에 필요한 카드 props와 이벤트를 조합합니다. */
  const timelineCardsForView = useMemo(() => {
    const cards = timelineItems.map((item) => {
      if (item.kind === 'recommendation') {
        return {
          ...toHomeRecommendationTimelineCardViewModel(item.recommendation),
          helperText: '잠깐 쉬는 게 어떨까요?',
          onAddPress: () => void handleAddRecommendation(item.recommendation.recommendId),
          onDismissPress: () => handleDismissRecommendation(item.recommendation.recommendId),
        };
      }

      return {
        ...toHomeTimelineCardViewModel(item.card, personalTags, false),
        onPress: () => handleCardPress(item.card),
      };
    });

    const placeholders = Array.from(
      { length: HOME_TIMELINE_TOP_PLACEHOLDER_COUNT },
      (_, index) => ({
        id: `placeholder-${index}`,
        kind: 'placeholder' as const,
        time: '00:00',
        title: '',
        range: '',
        placeholderHeight:
          cards.length > 0 && index === HOME_TIMELINE_TOP_PLACEHOLDER_COUNT - 1
            ? HOME_TIMELINE_TOP_HALF_PLACEHOLDER_HEIGHT
            : undefined,
      }),
    );

    const addCard =
      cards.length === 0
        ? [
            {
              id: 'add-schedule',
              kind: 'add' as const,
              time: '00:00',
              title: '일정을 추가해 볼까요?',
              range: '00:00 - 00:00',
              tags: [
                {
                  label: '일상 작업',
                  variant: 'condition' as const,
                  condition: 'daily' as const,
                },
              ],
              onPress: handleOpenAddSheet,
            },
          ]
        : [];

    return [...placeholders, ...cards, ...addCard];
  }, [
    handleAddRecommendation,
    handleCardPress,
    handleDismissRecommendation,
    handleOpenAddSheet,
    personalTags,
    timelineItems,
  ]);
  const currentTimeMarker = useMemo(() => {
    if (!isSameDate(selectedDate, now)) return null;

    if (timelineItems.length === 0) {
      return { cardId: 'add-schedule', offsetRatio: HOME_TIMELINE_EMPTY_ADD_MARKER_OFFSET_RATIO };
    }

    const currentTime = formatHomeCurrentTime(now);
    const currentItemIndex = timelineItems.findIndex((item) => {
      const startTime =
        item.kind === 'schedule' ? item.card.timeStart : item.recommendation.startTime;
      const endTime = item.kind === 'schedule' ? item.card.timeEnd : item.recommendation.endTime;

      return startTime <= currentTime && currentTime < endTime;
    });

    if (currentItemIndex >= 0) {
      const item = timelineItems[currentItemIndex];
      const startTime =
        item.kind === 'schedule' ? item.card.timeStart : item.recommendation.startTime;
      const endTime = item.kind === 'schedule' ? item.card.timeEnd : item.recommendation.endTime;
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      const [currentHour, currentMinute] = currentTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      const currentMinutes = currentHour * 60 + currentMinute;

      return {
        cardId:
          item.kind === 'schedule'
            ? item.card.id
            : `recommendation-${item.recommendation.recommendId}`,
        offsetRatio: (currentMinutes - startMinutes) / (endMinutes - startMinutes),
      };
    }

    const passedScheduleCount = timelineItems.filter(
      (item) =>
        (item.kind === 'schedule' ? item.card.timeStart : item.recommendation.startTime) <=
        currentTime,
    ).length;

    const previousItem = timelineItems[passedScheduleCount - 1] ?? timelineItems[0];

    return {
      cardId:
        previousItem.kind === 'schedule'
          ? previousItem.card.id
          : `recommendation-${previousItem.recommendation.recommendId}`,
      offsetRatio: passedScheduleCount === 0 ? 0 : 1,
    };
  }, [now, selectedDate, timelineItems]);

  return {
    ...pageData,
    personalTags,
    selectedDate,
    selectedDateValue,
    viewMode,
    now,
    homeDate: getHomeDateLabel(selectedDate),
    dailyMemoDateLabel: formatHomeDailyMemoDate(selectedDate),
    headerMessage: getHomeHeaderMessage({
      dailyMessage: pageData.dailyMessage?.message,
      isError: pageData.isError,
      isLoading: pageData.isLoading,
    }),
    currentTimeLabel: formatHomeCurrentTime(now),
    timelineCardsForView,
    currentTimeMarker,
    visibleRecommendations,
    homeGesture,
    extendState,
    queueDraftValue,
    progressCard,
    rescheduleCard,
    progressTimeSummary: progressCard ? getHomeProgressTimeSummary(progressCard) : '',
    progressDateLabel: progressCard?.dateStart
      ? progressCard.dateStart.slice(5).replace(/[.-]/g, '/')
      : '',
    progressStatus,
    progressSheetStep,
    setProgressStatus,
    extensionMinutes,
    isAddSheetVisible,
    isDailyMemoSheetVisible,
    calendar: calendar.calendar,
    deletingMemoId,
    isNotificationModalVisible,
    isConditionPromptVisible: conditionPrompt.isVisible,
    notificationErrorMessage,
    recommendationErrorMessage,
    isExtendSheetVisible,
    isQueueSheetVisible,
    isRescheduleSheetVisible,
    isConflictToastDismissed,
    isCreatingMemo: createDailyMemoMutation.isPending,
    hasMemoMutationError: createDailyMemoMutation.isError || deleteDailyMemoMutation.isError,
    isUpdatingSchedule: updateScheduleMutation.isPending,
    isRescheduleRecommendationLoading: rescheduleRecommendationQuery.isFetching,
    rescheduleRecommendationCandidates: rescheduleRecommendationQuery.data?.candidates ?? [],
    rescheduleRecommendationErrorMode: getQueueRecommendationErrorMode(
      rescheduleRecommendationQuery.error,
      rescheduleRecommendationDays,
    ),
    isUpdatingNotification: updateAlarmSettingsMutation.isPending,
    handleCreateCard,
    handleOpenAddSheet,
    handleCloseAddSheet,
    handleCreateDailyMemo,
    handleDeleteDailyMemo,
    handleDismissRecommendation,
    handleAddRecommendation,
    handleViewQueue,
    openNotifications,
    openConditionTab,
    handleCardPress,
    handleCloseProgressSheet,
    handleCompleteProgress,
    handleBackProgressSheet,
    handleReschedule,
    handleCloseReschedule,
    handleSearchReschedule14Days,
    handleEditRescheduleDuration,
    handleRescheduleConvert,
    handleAcceptRescheduleRecommendation,
    handleOpenQueueSheet,
    handleCloseQueueSheet,
    handleConfirmQueueConversion,
    handleOpenExtendSheet,
    handleCloseExtendSheet,
    handleDecreaseExtension,
    handleIncreaseExtension,
    handleCompleteExtension,
    handleSelectDate,
    handleOpenCalendar: calendar.openCalendar,
    handleCloseCalendar: calendar.closeCalendar,
    handleMoveCalendarMonth: calendar.moveCalendarMonth,
    handleCalendarDateSelect: calendar.selectCalendarDate,
    handleCycleViewMode,
    handleOpenMemoSheet,
    handleCloseMemoSheet,
    updateNotificationSettings,
    closeNotificationModal,
    closeConditionPrompt: conditionPrompt.close,
    openConditionMeasureFromPrompt: conditionPrompt.openConditionMeasure,
    dismissConflictToast,
    dismissRecommendationErrorToast,
  };
}

function getHttpErrorStatus(error: unknown): number | null {
  if (typeof error !== 'object' || error == null || !('response' in error)) {
    return null;
  }

  const response = error.response;
  if (typeof response !== 'object' || response == null || !('status' in response)) {
    return null;
  }

  return typeof response.status === 'number' ? response.status : null;
}

function createRescheduleQueueCard(card: CardItem, draft: DueDurationDraft): CardItem {
  return {
    ...card,
    cardType: 'queue',
    dateMode: 'empty',
    dateStart: '',
    dateEnd: '',
    timeFilled: false,
    timeStart: '',
    timeEnd: '',
    dueDate: draft.dueDate,
    durationHours: draft.durationHours,
    durationMinutes: draft.durationMinutes,
    durationUnknown: draft.durationUnknown,
  };
}

function getQueueRecommendationErrorMode(
  error: unknown,
  days: number,
): 'error-no-duration' | 'error-7day' | 'error-14day' | null {
  if (!isAxiosError(error) || error.response?.status !== 409) {
    return null;
  }

  const data = error.response.data;
  if (typeof data !== 'object' || data == null) {
    return days === 7 ? 'error-7day' : 'error-14day';
  }

  const { canExtendTo14Days, mustChangeDuration } = data as {
    canExtendTo14Days?: unknown;
    mustChangeDuration?: unknown;
  };

  if (mustChangeDuration === true) return 'error-no-duration';
  if (days === 7 && canExtendTo14Days === true) return 'error-7day';

  return 'error-14day';
}

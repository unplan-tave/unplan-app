/** 홈 화면의 서버 상태, 로컬 interaction, 라우팅, mutation을 조합합니다. */
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import {
  useCreateDailyMemoMutation,
  useDeleteDailyMemoMutation,
} from '@/domains/daily-memo/api/mutations';
import { useUpdateAlarmSettingsMutation } from '@/domains/member/api/mutations';
import { useUpdateScheduleMutation } from '@/domains/schedule/api/mutations';
import { toQueueConversionUpdateInput } from '@/domains/schedule/card-mapper';
import { getCardProgressStatus, progressStatusToScheduleStatus } from '@/domains/schedule/list';
import { type CardItem, type CardProgressStatus } from '@/domains/schedule/model';
import { type DueDurationDraft } from '@/domains/schedule/queue';
import { useScheduleStore } from '@/domains/schedule/use-schedule-store';
import { t } from '@/lib/i18n';

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
  toHomeTimelineCardViewModel,
} from '../home-screen-logic';

import { useHomePageData } from './use-home-page-data';

import type { AlarmSettings } from '@/domains/member/model';

const EXTEND_STEP_MINUTES = 10;

/** 홈 화면 컴포넌트가 렌더링에 사용할 값과 이벤트를 반환합니다. */
export function useHomeScreen() {
  const params = useLocalSearchParams<{ onboardingNotification?: string }>();
  const [now, setNow] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<HomeViewMode>('daily');
  const [isAddSheetVisible, setIsAddSheetVisible] = useState(false);
  const [isDailyMemoSheetVisible, setIsDailyMemoSheetVisible] = useState(false);
  const [deletingMemoId, setDeletingMemoId] = useState<number | null>(null);
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const [notificationErrorMessage, setNotificationErrorMessage] = useState<string | null>(null);
  const [dismissedRecommendationIds, setDismissedRecommendationIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [progressCard, setProgressCard] = useState<CardItem | null>(null);
  const [progressStatus, setProgressStatus] = useState<CardProgressStatus>('incomplete');
  const [isExtendSheetVisible, setIsExtendSheetVisible] = useState(false);
  const [isQueueSheetVisible, setIsQueueSheetVisible] = useState(false);
  const [extensionMinutes, setExtensionMinutes] = useState(EXTEND_STEP_MINUTES);
  const [isConflictToastDismissed, setIsConflictToastDismissed] = useState(false);
  const personalTags = useScheduleStore((store) => store.personalTags);
  const updateAlarmSettingsMutation = useUpdateAlarmSettingsMutation();
  const updateScheduleMutation = useUpdateScheduleMutation();
  const createDailyMemoMutation = useCreateDailyMemoMutation();
  const deleteDailyMemoMutation = useDeleteDailyMemoMutation();
  const selectedDateValue = useMemo(() => formatDateValue(selectedDate), [selectedDate]);
  const pageData = useHomePageData({ personalTags, selectedDate, viewMode });
  const visibleRecommendations = useMemo(
    () => pageData.recommendations.filter((item) => !dismissedRecommendationIds.has(item.card.id)),
    [dismissedRecommendationIds, pageData.recommendations],
  );
  const timelineItems = useMemo(
    () =>
      [
        ...pageData.timelineCards.map((card) => ({ card, isRecommendation: false })),
        ...visibleRecommendations.map((item) => ({ card: item.card, isRecommendation: true })),
      ].sort((first, second) => first.card.timeStart.localeCompare(second.card.timeStart)),
    [pageData.timelineCards, visibleRecommendations],
  );
  const extendState = useMemo(
    () =>
      getHomeExtendState(
        progressCard,
        extensionMinutes,
        pageData.timelineCards,
        EXTEND_STEP_MINUTES,
      ),
    [extensionMinutes, pageData.timelineCards, progressCard],
  );
  const queueDraftValue = useMemo(() => createHomeQueueDraft(progressCard), [progressCard]);

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(intervalId);
  }, []);
  useEffect(() => {
    if (params.onboardingNotification === '1') setIsNotificationModalVisible(true);
  }, [params.onboardingNotification]);

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
    (cardId: string) => setDismissedRecommendationIds((previous) => new Set(previous).add(cardId)),
    [],
  );
  /** 추천 카드 상세로 이동합니다. */
  const handleAddRecommendation = useCallback((cardId: string) => {
    setIsAddSheetVisible(false);
    router.push(`/card/view?cardId=${cardId}`);
  }, []);
  /** 카드 목록 화면으로 이동합니다. */
  const handleViewQueue = useCallback(() => {
    setIsAddSheetVisible(false);
    router.navigate('/schedule');
  }, []);
  /** 종료된 카드는 진행 sheet를, 그 외 카드는 상세를 엽니다. */
  const handleCardPress = useCallback(
    (card: CardItem) => {
      if (isHomeScheduleEnded(card, selectedDate, now)) {
        setProgressCard(card);
        setProgressStatus(getCardProgressStatus(card));
        return;
      }
      router.push(`/card/view?cardId=${card.id}`);
    },
    [now, selectedDate],
  );
  /** 진행 관련 sheet 상태를 모두 닫습니다. */
  const handleCloseProgressSheet = useCallback(() => {
    setProgressCard(null);
    setIsExtendSheetVisible(false);
    setIsQueueSheetVisible(false);
  }, []);
  /** 선택 카드의 진행 상태를 저장합니다. */
  const handleCompleteProgress = useCallback(() => {
    if (!progressCard || updateScheduleMutation.isPending) return;
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
      if (!progressCard || updateScheduleMutation.isPending) return;
      updateScheduleMutation.mutate(
        { scheduleId: Number(progressCard.id), data: toQueueConversionUpdateInput(draft) },
        {
          onSuccess: () => {
            setIsQueueSheetVisible(false);
            setProgressCard(null);
          },
        },
      );
    },
    [progressCard, updateScheduleMutation],
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
    setExtensionMinutes((previous) =>
      Math.max(EXTEND_STEP_MINUTES, previous - EXTEND_STEP_MINUTES),
    );
  }, []);
  /** 연장 시간을 늘립니다. */
  const handleIncreaseExtension = useCallback(() => {
    setIsConflictToastDismissed(false);
    setExtensionMinutes((previous) => previous + EXTEND_STEP_MINUTES);
  }, []);
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
  /** 일·주·월 보기를 순환합니다. */
  const handleCycleViewMode = useCallback(
    () => setViewMode((previous) => getNextHomeViewMode(previous)),
    [],
  );
  /** 메모 sheet를 엽니다. */
  const handleOpenMemoSheet = useCallback(() => setIsDailyMemoSheetVisible(true), []);
  /** 메모 sheet를 닫습니다. */
  const handleCloseMemoSheet = useCallback(() => setIsDailyMemoSheetVisible(false), []);
  /** 연장 충돌 안내 토스트를 닫습니다. */
  const dismissConflictToast = useCallback(() => setIsConflictToastDismissed(true), []);
  /** 타임라인 렌더링에 필요한 카드 props와 이벤트를 조합합니다. */
  const timelineCardsForView = useMemo(
    () =>
      timelineItems.map(({ card, isRecommendation }) => ({
        ...toHomeTimelineCardViewModel(card, personalTags, isRecommendation),
        helperText: isRecommendation ? '잠깐 쉬는 게 어떨까요?' : undefined,
        onPress: isRecommendation ? undefined : () => handleCardPress(card),
        onAddPress: isRecommendation ? () => handleAddRecommendation(card.id) : undefined,
        onDismissPress: isRecommendation ? () => handleDismissRecommendation(card.id) : undefined,
      })),
    [
      handleAddRecommendation,
      handleCardPress,
      handleDismissRecommendation,
      personalTags,
      timelineItems,
    ],
  );

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
      selectedDateValue,
    }),
    currentTimeLabel: formatHomeCurrentTime(now),
    timelineCardsForView,
    visibleRecommendations,
    pinchGesture,
    extendState,
    queueDraftValue,
    progressCard,
    progressTimeSummary: progressCard ? getHomeProgressTimeSummary(progressCard) : '',
    progressDateLabel: progressCard?.dateStart
      ? progressCard.dateStart.slice(5).replace(/[.-]/g, '/')
      : '',
    progressStatus,
    setProgressStatus,
    extensionMinutes,
    isAddSheetVisible,
    isDailyMemoSheetVisible,
    deletingMemoId,
    isNotificationModalVisible,
    notificationErrorMessage,
    isExtendSheetVisible,
    isQueueSheetVisible,
    isConflictToastDismissed,
    isCreatingMemo: createDailyMemoMutation.isPending,
    hasMemoMutationError: createDailyMemoMutation.isError || deleteDailyMemoMutation.isError,
    isUpdatingSchedule: updateScheduleMutation.isPending,
    isUpdatingNotification: updateAlarmSettingsMutation.isPending,
    handleCreateCard,
    handleOpenAddSheet,
    handleCloseAddSheet,
    handleCreateDailyMemo,
    handleDeleteDailyMemo,
    handleDismissRecommendation,
    handleAddRecommendation,
    handleViewQueue,
    handleCardPress,
    handleCloseProgressSheet,
    handleCompleteProgress,
    handleOpenQueueSheet,
    handleCloseQueueSheet,
    handleConfirmQueueConversion,
    handleOpenExtendSheet,
    handleCloseExtendSheet,
    handleDecreaseExtension,
    handleIncreaseExtension,
    handleCompleteExtension,
    handleSelectDate,
    handleCycleViewMode,
    handleOpenMemoSheet,
    handleCloseMemoSheet,
    updateNotificationSettings,
    closeNotificationModal,
    dismissConflictToast,
  };
}

/** 홈 화면의 concern별 hook을 조합하고 화면 props를 구성합니다. */
import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { useScheduleStore } from '@/domains/schedule/use-schedule-store';

import {
  formatHomeCurrentTime,
  formatHomeDailyMemoDate,
  getHomeHeaderMessage,
} from '../home-screen-logic';

import { useHomeCardDetail } from './use-home-card-detail';
import { useHomeConditionPrompt } from './use-home-condition-prompt';
import { useHomeMemo } from './use-home-memo';
import { useHomeNotification } from './use-home-notification';
import { useHomePageData } from './use-home-page-data';
import { useHomePageState } from './use-home-page-state';
import { useHomeRecommendationActions } from './use-home-recommendation-actions';
import { useHomeScheduleFlow } from './use-home-schedule-flow';
import { useHomeTimelineViewModel } from './use-home-timeline-view-model';

/** 홈 화면 컴포넌트가 렌더링에 사용할 값과 이벤트를 반환합니다. */
export function useHomeScreen() {
  const personalTags = useScheduleStore((store) => store.personalTags);
  const [recommendationErrorMessage, setRecommendationErrorMessage] = useState<string | null>(null);

  const page = useHomePageState();
  const { now, selectedDate, selectedDateValue, todayValue, viewMode } = page;
  const pageData = useHomePageData({ personalTags, selectedDate, viewMode });
  const notification = useHomeNotification();
  const conditionPrompt = useHomeConditionPrompt(
    todayValue,
    !notification.isNotificationModalVisible,
  );
  const memo = useHomeMemo(selectedDateValue);
  const recommendationActions = useHomeRecommendationActions({
    recommendations: pageData.recommendations,
    onError: setRecommendationErrorMessage,
  });
  const scheduleFlow = useHomeScheduleFlow({
    selectedDate,
    now,
    timelineCards: pageData.timelineCards,
    personalTags,
    onError: setRecommendationErrorMessage,
  });
  const cardDetail = useHomeCardDetail({
    cardId: scheduleFlow.detail.cardId,
    visible: scheduleFlow.detail.visible,
  });
  const timeline = useHomeTimelineViewModel({
    timelineCards: pageData.timelineCards,
    visibleRecommendations: recommendationActions.visibleRecommendations,
    personalTags,
    selectedDate,
    now,
    onCardPress: scheduleFlow.onCardPress,
    onAddRecommendation: recommendationActions.handleAddRecommendation,
    onDismissRecommendation: recommendationActions.handleDismissRecommendation,
    onOpenAddSheet: recommendationActions.handleOpenAddSheet,
  });

  /** 알림 화면으로 이동합니다. */
  const openNotifications = useCallback(() => {
    router.push('/notifications');
  }, []);
  /** 홈 헤더의 컨디션 점수에서 컨디션 탭으로 이동합니다. */
  const openConditionTab = useCallback(() => {
    router.navigate('/condition');
  }, []);
  const dismissRecommendationErrorToast = useCallback(
    () => setRecommendationErrorMessage(null),
    [],
  );

  return {
    page: {
      now,
      selectedDate,
      viewMode,
      homeDate: page.homeDate,
      homeGesture: page.homeGesture,
      calendarDays: pageData.calendarDays,
      calendar: page.calendar.calendar,
      handleSelectDate: page.handleSelectDate,
      handleCycleViewMode: page.handleCycleViewMode,
      handleOpenCalendar: page.calendar.openCalendar,
      handleCloseCalendar: page.calendar.closeCalendar,
      handleMoveCalendarMonth: page.calendar.moveCalendarMonth,
      handleCalendarDateSelect: page.calendar.selectCalendarDate,
    },
    header: {
      message: getHomeHeaderMessage({
        dailyMessage: pageData.dailyMessage?.message,
        isError: pageData.isError,
        isLoading: pageData.isLoading,
      }),
      conditionScore: pageData.conditionScore,
      conditionSummary: pageData.conditionSummary,
      dailyMemos: pageData.dailyMemos,
      openConditionTab,
      openNotifications,
    },
    timeline: {
      cards: timeline.timelineCardsForView,
      currentTimeLabel: formatHomeCurrentTime(now),
      currentTimeMarker: timeline.currentTimeMarker,
    },
    addSheet: {
      visible: recommendationActions.isAddSheetVisible,
      recommendations: recommendationActions.visibleRecommendations,
      onClose: recommendationActions.handleCloseAddSheet,
      onCreatePress: recommendationActions.handleCreateCard,
      onDismissRecommendation: recommendationActions.handleDismissRecommendation,
      onRecommendationAddPress: recommendationActions.handleAddRecommendation,
      onViewQueuePress: recommendationActions.handleViewQueue,
    },
    memo: {
      visible: memo.isMemoSheetVisible,
      dateLabel: formatHomeDailyMemoDate(selectedDate),
      memos: pageData.dailyMemos,
      query: pageData.dailyMemosQuery,
      hasMutationError: memo.hasMemoMutationError,
      isCreating: memo.isCreatingMemo,
      deletingMemoId: memo.deletingMemoId,
      onOpen: memo.openMemoSheet,
      onClose: memo.closeMemoSheet,
      onCreate: memo.createDailyMemo,
      onDelete: memo.deleteDailyMemo,
    },
    scheduleFlow,
    cardDetail: {
      visible: scheduleFlow.detail.visible,
      card: cardDetail.card,
      conditionTag: cardDetail.conditionTag,
      personalTagLabels: cardDetail.personalTagLabels,
      isLoading: cardDetail.isLoading,
      isError: cardDetail.isError,
      status: cardDetail.status,
      onChangeStatus: cardDetail.changeStatus,
      onClose: scheduleFlow.detail.onClose,
      onEdit: scheduleFlow.detail.onEdit,
    },
    notification: {
      visible: notification.isNotificationModalVisible,
      isSubmitting: notification.isUpdatingNotification,
      errorMessage: notification.notificationErrorMessage,
      updateSettings: notification.updateNotificationSettings,
    },
    conditionPrompt: {
      visible: conditionPrompt.isVisible,
      onClose: conditionPrompt.close,
      onConditionPress: conditionPrompt.openConditionMeasure,
    },
    feedback: {
      recommendationErrorMessage,
      dismissRecommendationErrorToast,
    },
  };
}

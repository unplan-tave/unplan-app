import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { ConditionSummaryPanel } from '@/components/domain/condition/condition-summary-panel';
import { HomeAddBottomSheet } from '@/components/features/home/home-add-bottom-sheet';
import { HomeBackground } from '@/components/features/home/home-background';
import { HomeBottomNav } from '@/components/features/home/home-bottom-nav';
import { HomeCalendarView } from '@/components/features/home/home-calendar-view';
import { HomeProgressSheet } from '@/components/features/home/home-progress-sheet';
import { TimelineCard } from '@/components/features/home/timeline-card';
import { OnboardingNotificationModal } from '@/components/features/onboarding/onboarding-notification-modal';
import { Icon } from '@/components/ui/Icon';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { ViewModeButton } from '@/components/ui/ViewModeButton';
import { colors, radius, spacing } from '@/constants/theme';
import { getConditionCommentByDate } from '@/domains/condition/comment';
import { useUpdateAlarmSettingsMutation } from '@/domains/member/api/mutations';
import { useUpdateScheduleMutation } from '@/domains/schedule/api/mutations';
import {
  getCardPersonalTagLabels,
  getCardProgressStatus,
  progressStatusToScheduleStatus,
} from '@/domains/schedule/list';
import {
  getConditionTagById,
  type CardItem,
  type CardProgressStatus,
} from '@/domains/schedule/model';
import { useScheduleStore } from '@/domains/schedule/use-schedule-store';
import { t } from '@/lib/i18n';

import {
  formatDateValue,
  getHomeDateLabel,
  getNextHomeViewMode,
  getZoomedHomeViewMode,
  type HomeViewMode,
} from './home-calendar';
import { useHomePageData } from './hooks/use-home-page-data';

import type { AlarmSettings } from '@/domains/member/model';

const HOME_STATUS_COLUMN_WIDTH = 112;
const HOME_MESSAGE_BOX_WIDTH = 226;
const HOME_TIMELINE_LEFT = 108;
const HOME_TIMELINE_LINE_LEFT = 43;
const HOME_TIMELINE_CARD_LIST_TOP = 107;
const HOME_TIMELINE_CARD_LIST_BOTTOM = 160;
const HOME_CURRENT_TIME_TOP = 252;
const HOME_CURRENT_TIME_LINE_WIDTH = 13;
const RECOMMENDATION_HELPER_TEXT = '잠깐 쉬는 게 어떨까요?';

export function HomeScreen() {
  const params = useLocalSearchParams<{ onboardingNotification?: string }>();
  const [now, setNow] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<HomeViewMode>('daily');
  const [isAddSheetVisible, setIsAddSheetVisible] = useState(false);
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const [notificationErrorMessage, setNotificationErrorMessage] = useState<string | null>(null);
  const [dismissedRecommendationIds, setDismissedRecommendationIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [progressCard, setProgressCard] = useState<CardItem | null>(null);
  const [progressStatus, setProgressStatus] = useState<CardProgressStatus>('incomplete');
  const updateAlarmSettingsMutation = useUpdateAlarmSettingsMutation();
  const updateScheduleMutation = useUpdateScheduleMutation();
  const personalTags = useScheduleStore((store) => store.personalTags);
  const homeDate = useMemo(() => getHomeDateLabel(selectedDate), [selectedDate]);
  const selectedDateValue = useMemo(() => formatDateValue(selectedDate), [selectedDate]);
  const currentTimeLabel = useMemo(() => formatTimeLabel(now), [now]);
  const { calendarDays, conditionSummary, isError, isLoading, recommendations, timelineCards } =
    useHomePageData({
      personalTags,
      selectedDate,
      viewMode,
    });
  const visibleRecommendations = useMemo(
    () => recommendations.filter((item) => !dismissedRecommendationIds.has(item.card.id)),
    [dismissedRecommendationIds, recommendations],
  );
  const timelineItems = useMemo(
    () =>
      [
        ...timelineCards.map((card) => ({ card, isRecommendation: false })),
        ...visibleRecommendations.map((item) => ({ card: item.card, isRecommendation: true })),
      ].sort((first, second) => first.card.timeStart.localeCompare(second.card.timeStart)),
    [timelineCards, visibleRecommendations],
  );
  const changeViewModeByZoom = useCallback((direction: 'in' | 'out') => {
    setViewMode((prev) => getZoomedHomeViewMode(prev, direction));
  }, []);
  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch().onEnd((event) => {
        if (event.scale < 0.92) {
          runOnJS(changeViewModeByZoom)('out');
        }

        if (event.scale > 1.08) {
          runOnJS(changeViewModeByZoom)('in');
        }
      }),
    [changeViewModeByZoom],
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (params.onboardingNotification === '1') {
      setIsNotificationModalVisible(true);
    }
  }, [params.onboardingNotification]);

  const closeNotificationModal = useCallback(() => {
    setIsNotificationModalVisible(false);
    setNotificationErrorMessage(null);
    router.replace('/(tabs)');
  }, []);

  const updateNotificationSettings = useCallback(
    (enabled: boolean) => {
      if (updateAlarmSettingsMutation.isPending) {
        return;
      }

      const nextSettings: AlarmSettings = {
        scheduleEndAlarmOn: enabled,
        conditionRecordAlarmOn: enabled,
        recommendAlarmOn: enabled,
      };

      setNotificationErrorMessage(null);
      updateAlarmSettingsMutation.mutate(nextSettings, {
        onSuccess: closeNotificationModal,
        onError: () => setNotificationErrorMessage(t('onboarding.notification.saveError')),
      });
    },
    [closeNotificationModal, updateAlarmSettingsMutation],
  );

  const handleCreateCard = useCallback(() => {
    setIsAddSheetVisible(false);
    router.push('/card/card-detail');
  }, []);

  const handleOpenAddSheet = useCallback(() => {
    setIsAddSheetVisible(true);
  }, []);

  const handleCloseAddSheet = useCallback(() => {
    setIsAddSheetVisible(false);
  }, []);

  const handleDismissRecommendation = useCallback((cardId: string) => {
    setDismissedRecommendationIds((prev) => {
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
  }, []);

  const handleAddRecommendation = useCallback((cardId: string) => {
    setIsAddSheetVisible(false);
    router.push(`/card/view?cardId=${cardId}`);
  }, []);

  const handleViewQueue = useCallback(() => {
    setIsAddSheetVisible(false);
    router.navigate('/schedule');
  }, []);

  const handleCardPress = useCallback(
    (card: CardItem) => {
      // 종료 시각이 지난 일정만 진행도 확인 시트를 띄웁니다. (Figma: "종료 시각이 지난 일정")
      if (isScheduleEnded(card, selectedDate, now)) {
        setProgressCard(card);
        setProgressStatus(getCardProgressStatus(card));
        return;
      }

      router.push(`/card/view?cardId=${card.id}`);
    },
    [now, selectedDate],
  );

  const handleCloseProgressSheet = useCallback(() => {
    setProgressCard(null);
  }, []);

  const handleCompleteProgress = useCallback(() => {
    if (progressCard == null || updateScheduleMutation.isPending) {
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

  // TODO(home-progress): "큐 카드로 남겨두기"(핀 → 큐 전환) 시트 연동 예정.
  const handleLeaveAsQueue = useCallback(() => {}, []);

  // TODO(home-progress): "종료 시간 연장" 스텝퍼 시트 연동 예정.
  const handleExtendTime = useCallback(() => {}, []);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleCycleViewMode = useCallback(() => {
    setViewMode((prev) => getNextHomeViewMode(prev));
  }, []);

  const handleNavItemPress = useCallback((value: string) => {
    if (value === 'home') {
      router.navigate('/(tabs)');
      return;
    }

    if (value === 'setting') {
      router.navigate('/settings');
      return;
    }

    router.navigate('/schedule');
  }, []);

  return (
    <ScreenLayout
      backgroundColor={colors.onboardingMutedBackground}
      contentStyle={styles.content}
      useSafeArea={false}
    >
      <StatusBar style="light" />
      <HomeBackground />
      <GestureDetector gesture={pinchGesture}>
        <View style={styles.canvas}>
          {viewMode === 'daily' ? (
            <View style={styles.timeline}>
              <View style={styles.timelineLine} />
              <ScrollView
                contentContainerStyle={styles.timelineContent}
                showsVerticalScrollIndicator={false}
              >
                {timelineItems.map(({ card, isRecommendation }) => {
                  const conditionTag = getConditionTagById(card.conditionTagId);
                  const cardPersonalTagLabels = getCardPersonalTagLabels(card, personalTags);

                  return (
                    <TimelineCard
                      key={card.id}
                      time={getTimelineTime(card)}
                      title={card.title}
                      range={getTimelineRange(card)}
                      status={getTimelineCardStatus(card, isRecommendation)}
                      helperText={isRecommendation ? RECOMMENDATION_HELPER_TEXT : undefined}
                      tags={[
                        {
                          label: conditionTag.label,
                          variant: 'condition' as const,
                          condition: card.conditionTagId,
                        },
                        ...cardPersonalTagLabels.map((label) => ({
                          label,
                          variant: 'personal' as const,
                        })),
                      ]}
                      onPress={isRecommendation ? undefined : () => handleCardPress(card)}
                      onAddPress={
                        isRecommendation ? () => handleAddRecommendation(card.id) : undefined
                      }
                      onDismissPress={
                        isRecommendation ? () => handleDismissRecommendation(card.id) : undefined
                      }
                    />
                  );
                })}
              </ScrollView>

              <View style={styles.currentTime}>
                <View style={styles.currentTimeBadge}>
                  <Typography variant="caption" color={colors.gray.white}>
                    {currentTimeLabel}
                  </Typography>
                </View>
                <View style={styles.currentLine} />
              </View>
            </View>
          ) : (
            <HomeCalendarView mode={viewMode} days={calendarDays} onSelectDate={handleSelectDate} />
          )}

          <View style={styles.header}>
            <View style={styles.statusColumn}>
              <ViewModeButton
                mode={viewMode}
                accessibilityLabel="보기 방식 변경"
                style={styles.viewModeButton}
                onPress={handleCycleViewMode}
              />
              <ConditionSummaryPanel
                year={homeDate.year}
                dateLabel={homeDate.date}
                summary={conditionSummary}
              />
            </View>
            <View style={styles.messageBox}>
              <Icon name="bell" size={24} color={colors.gray.white} />
              <Typography
                variant="titleM"
                color={colors.gray.white}
                align="right"
                style={styles.message}
              >
                {getHomeMessage({
                  isError,
                  isLoading,
                  selectedDateValue,
                })}
              </Typography>
            </View>
          </View>

          <View style={styles.footer}>
            <HomeBottomNav onAddPress={handleOpenAddSheet} onItemPress={handleNavItemPress} />
          </View>
        </View>
      </GestureDetector>
      <HomeAddBottomSheet
        visible={isAddSheetVisible}
        recommendations={visibleRecommendations}
        onClose={handleCloseAddSheet}
        onCreatePress={handleCreateCard}
        onDismissRecommendation={handleDismissRecommendation}
        onRecommendationAddPress={handleAddRecommendation}
        onViewQueuePress={handleViewQueue}
      />
      <HomeProgressSheet
        visible={progressCard != null}
        timeSummary={progressCard ? getProgressTimeSummary(progressCard) : ''}
        status={progressStatus}
        onChangeStatus={setProgressStatus}
        onCancel={handleCloseProgressSheet}
        onComplete={handleCompleteProgress}
        completeDisabled={updateScheduleMutation.isPending}
        onLeaveAsQueuePress={handleLeaveAsQueue}
        onExtendTimePress={handleExtendTime}
      />
      <OnboardingNotificationModal
        visible={isNotificationModalVisible}
        isSubmitting={updateAlarmSettingsMutation.isPending}
        errorMessage={notificationErrorMessage}
        onAllow={() => updateNotificationSettings(true)}
        onDeny={() => updateNotificationSettings(false)}
      />
    </ScreenLayout>
  );
}

function formatTimeLabel(date: Date) {
  return `${padTimeUnit(date.getHours())}:${padTimeUnit(date.getMinutes())}`;
}

function padTimeUnit(value: number) {
  return String(value).padStart(2, '0');
}

function getTimelineTime(card: CardItem) {
  return card.timeStart || '00:00';
}

function getTimelineRange(card: CardItem) {
  if (!card.timeFilled) {
    return '00:00 - 00:00';
  }

  return `${card.timeStart || '00:00'} - ${card.timeEnd || '00:00'}`;
}

function isScheduleEnded(card: CardItem, selectedDate: Date, now: Date) {
  if (card.cardType === 'queue' || !card.timeFilled || !card.timeEnd) {
    return false;
  }

  const [hours, minutes] = card.timeEnd.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return false;
  }

  const endAt = new Date(selectedDate);
  endAt.setHours(hours, minutes, 0, 0);

  return endAt.getTime() <= now.getTime();
}

function getProgressTimeSummary(card: CardItem) {
  const monthDay = card.dateStart ? card.dateStart.slice(5).replace(/[.-]/g, '/') : '';
  const range = card.timeFilled ? `${card.timeStart} - ${card.timeEnd}` : '';

  return [monthDay, range].filter(Boolean).join('  ');
}

function getTimelineCardStatus(card: CardItem, isRecommendation: boolean) {
  if (isRecommendation) {
    return 'recommendation' as const;
  }

  return card.progressStatus === 'complete' ? ('complete' as const) : ('default' as const);
}

function getHomeMessage({
  isError,
  isLoading,
  selectedDateValue,
}: {
  isError: boolean;
  isLoading: boolean;
  selectedDateValue: string;
}) {
  if (isError) {
    return '홈 데이터를 불러오지 못했어요. 잠시 후 다시 확인해 주세요.';
  }

  if (isLoading) {
    return '오늘의 컨디션과 일정을 불러오고 있어요.';
  }

  return getConditionCommentByDate(selectedDateValue);
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    overflow: 'hidden',
  },
  canvas: {
    width: '100%',
    maxWidth: 393,
    flex: 1,
    alignSelf: 'center',
  },
  header: {
    position: 'absolute',
    top: spacing[16],
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[3],
  },
  statusColumn: {
    width: HOME_STATUS_COLUMN_WIDTH,
  },
  viewModeButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing[1],
  },
  messageBox: {
    width: HOME_MESSAGE_BOX_WIDTH,
    alignItems: 'flex-end',
    gap: spacing[2],
  },
  message: {
    width: '100%',
  },
  timeline: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: HOME_TIMELINE_LEFT,
    right: 0,
  },
  timelineLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: HOME_TIMELINE_LINE_LEFT,
    width: 1,
    backgroundColor: colors.gray[300],
  },
  timelineContent: {
    alignItems: 'flex-end',
    gap: spacing[2],
    paddingTop: HOME_TIMELINE_CARD_LIST_TOP,
    paddingRight: spacing[3],
    paddingBottom: HOME_TIMELINE_CARD_LIST_BOTTOM,
  },
  currentTime: {
    position: 'absolute',
    top: HOME_CURRENT_TIME_TOP,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 4,
  },
  currentTimeBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[1],
    borderRadius: radius.sm,
    backgroundColor: colors.secondary,
  },
  currentLine: {
    width: HOME_CURRENT_TIME_LINE_WIDTH,
    height: 2,
    backgroundColor: colors.secondary,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing[2],
    zIndex: 3,
    paddingHorizontal: spacing[5],
  },
});

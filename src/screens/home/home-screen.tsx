import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { ConditionSummaryPanel } from '@/components/domain/condition/condition-summary-panel';
import { CardToast } from '@/components/domain/schedule/card-toast';
import { DueDurationSheet } from '@/components/domain/schedule/due-duration-sheet';
import { HomeAddBottomSheet } from '@/components/features/home/home-add-bottom-sheet';
import { HomeBottomNav } from '@/components/features/home/home-bottom-nav';
import { HomeCalendarView } from '@/components/features/home/home-calendar-view';
import { HomeExtendTimeSheet } from '@/components/features/home/home-extend-time-sheet';
import { HomeProgressSheet } from '@/components/features/home/home-progress-sheet';
import { TimelineCard } from '@/components/features/home/timeline-card';
import { OnboardingNotificationModal } from '@/components/features/onboarding/onboarding-notification-modal';
import { AppBackground } from '@/components/ui/AppBackground';
import { Icon } from '@/components/ui/Icon';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { ViewModeButton } from '@/components/ui/ViewModeButton';
import { colors, radius, spacing } from '@/constants/theme';
import { getConditionCommentByDate } from '@/domains/condition/comment';
import { useUpdateAlarmSettingsMutation } from '@/domains/member/api/mutations';
import { useUpdateScheduleMutation } from '@/domains/schedule/api/mutations';
import { toQueueConversionUpdateInput } from '@/domains/schedule/card-mapper';
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
import { type DueDurationDraft } from '@/domains/schedule/queue';
import { addMinutesToTime, parseTimeToMinutes } from '@/domains/schedule/time';
import { useScheduleStore } from '@/domains/schedule/use-schedule-store';
import { useTabNavigation } from '@/hooks/use-tab-navigation';
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
const EXTEND_STEP_MINUTES = 10;

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
  const [isExtendSheetVisible, setIsExtendSheetVisible] = useState(false);
  const [isQueueSheetVisible, setIsQueueSheetVisible] = useState(false);
  const [extensionMinutes, setExtensionMinutes] = useState(EXTEND_STEP_MINUTES);
  const [isConflictToastDismissed, setIsConflictToastDismissed] = useState(false);
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
  const extendComputation = useMemo(
    () => computeExtendState(progressCard, extensionMinutes, timelineCards),
    [extensionMinutes, progressCard, timelineCards],
  );
  const queueDraftValue = useMemo(() => createQueueDraftFromCard(progressCard), [progressCard]);
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
    setIsExtendSheetVisible(false);
    setIsQueueSheetVisible(false);
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

  const handleOpenQueueSheet = useCallback(() => {
    setIsQueueSheetVisible(true);
  }, []);

  const handleCloseQueueSheet = useCallback(() => {
    setIsQueueSheetVisible(false);
  }, []);

  const handleConfirmQueueConversion = useCallback(
    (draft: DueDurationDraft) => {
      if (progressCard == null || updateScheduleMutation.isPending) {
        return;
      }

      updateScheduleMutation.mutate(
        {
          scheduleId: Number(progressCard.id),
          data: toQueueConversionUpdateInput(draft),
        },
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

  const handleOpenExtendSheet = useCallback(() => {
    setExtensionMinutes(EXTEND_STEP_MINUTES);
    setIsConflictToastDismissed(false);
    setIsExtendSheetVisible(true);
  }, []);

  const handleCloseExtendSheet = useCallback(() => {
    setIsExtendSheetVisible(false);
  }, []);

  const handleDecreaseExtension = useCallback(() => {
    setIsConflictToastDismissed(false);
    setExtensionMinutes((prev) => Math.max(EXTEND_STEP_MINUTES, prev - EXTEND_STEP_MINUTES));
  }, []);

  const handleIncreaseExtension = useCallback(() => {
    setIsConflictToastDismissed(false);
    setExtensionMinutes((prev) => prev + EXTEND_STEP_MINUTES);
  }, []);

  const handleCompleteExtension = useCallback(() => {
    if (progressCard == null || extendComputation.hasConflict || updateScheduleMutation.isPending) {
      return;
    }

    updateScheduleMutation.mutate(
      {
        scheduleId: Number(progressCard.id),
        data: { endTime: extendComputation.newEndTime },
      },
      {
        onSuccess: () => {
          setIsExtendSheetVisible(false);
          setProgressCard(null);
        },
      },
    );
  }, [extendComputation, progressCard, updateScheduleMutation]);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleCycleViewMode = useCallback(() => {
    setViewMode((prev) => getNextHomeViewMode(prev));
  }, []);

  const handleNavItemPress = useTabNavigation();

  return (
    <ScreenLayout
      backgroundColor={colors.onboardingMutedBackground}
      contentStyle={styles.content}
      useSafeArea={false}
    >
      <StatusBar style="light" />
      <AppBackground />
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
        visible={progressCard != null && !isExtendSheetVisible && !isQueueSheetVisible}
        timeSummary={progressCard ? getProgressTimeSummary(progressCard) : ''}
        status={progressStatus}
        onChangeStatus={setProgressStatus}
        onCancel={handleCloseProgressSheet}
        onComplete={handleCompleteProgress}
        completeDisabled={updateScheduleMutation.isPending}
        onLeaveAsQueuePress={handleOpenQueueSheet}
        onExtendTimePress={handleOpenExtendSheet}
      />
      {progressCard ? (
        <DueDurationSheet
          visible={isQueueSheetVisible}
          value={queueDraftValue}
          title="큐 카드로 남겨두기"
          subtitle={'일정을 수행할 시간을 나중에 찾아볼게요\n마감일과 소요 시간을 확인해 주세요'}
          scheduleTitle={progressCard.title}
          leftAction="back"
          allowClearDueDate
          onClose={handleCloseQueueSheet}
          onDone={handleConfirmQueueConversion}
        />
      ) : null}
      {progressCard ? (
        <HomeExtendTimeSheet
          visible={isExtendSheetVisible}
          title={progressCard.title}
          dateLabel={getScheduleMonthDay(progressCard)}
          startTime={progressCard.timeStart}
          newEndTime={extendComputation.newEndTime}
          addedMinutes={extensionMinutes}
          decreaseDisabled={extendComputation.decreaseDisabled}
          hasConflict={extendComputation.hasConflict}
          onBack={handleCloseExtendSheet}
          onComplete={handleCompleteExtension}
          onDecrease={handleDecreaseExtension}
          onIncrease={handleIncreaseExtension}
          completeDisabled={extendComputation.hasConflict || updateScheduleMutation.isPending}
        />
      ) : null}
      {isExtendSheetVisible && extendComputation.hasConflict && !isConflictToastDismissed ? (
        <CardToast
          message="다음 일정과 겹쳐요!"
          onClose={() => setIsConflictToastDismissed(true)}
        />
      ) : null}
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

function getScheduleMonthDay(card: CardItem) {
  return card.dateStart ? card.dateStart.slice(5).replace(/[.-]/g, '/') : '';
}

function getProgressTimeSummary(card: CardItem) {
  const range = card.timeFilled ? `${card.timeStart} - ${card.timeEnd}` : '';

  return [getScheduleMonthDay(card), range].filter(Boolean).join('  ');
}

/** 큐 전환 시트 초기값: 마감일은 미지정, 소요시간은 기존 핀 일정의 시간 범위(종료-시작)에서 가져옵니다. */
function createQueueDraftFromCard(card: CardItem | null): DueDurationDraft {
  if (card == null) {
    return { dueDate: '', durationHours: 0, durationMinutes: 0, durationUnknown: false };
  }

  const startMinutes = parseTimeToMinutes(card.timeStart);
  const endMinutes = parseTimeToMinutes(card.timeEnd);
  const rangeMinutes =
    card.timeFilled && startMinutes != null && endMinutes != null && endMinutes > startMinutes
      ? endMinutes - startMinutes
      : card.durationHours * 60 + card.durationMinutes;

  return {
    dueDate: '',
    durationHours: Math.floor(rangeMinutes / 60),
    durationMinutes: rangeMinutes % 60,
    durationUnknown: false,
  };
}

interface ExtendState {
  newEndTime: string;
  hasConflict: boolean;
  decreaseDisabled: boolean;
}

function computeExtendState(
  card: CardItem | null,
  extensionMinutes: number,
  cards: CardItem[],
): ExtendState {
  if (card == null) {
    return { newEndTime: '', hasConflict: false, decreaseDisabled: true };
  }

  const newEndTime = addMinutesToTime(card.timeEnd, extensionMinutes);
  const newEndMinutes = parseTimeToMinutes(newEndTime);
  const originalEndMinutes = parseTimeToMinutes(card.timeEnd);
  const nextStartMinutes = getNextScheduleStartMinutes(card, originalEndMinutes, cards);
  const hasConflict =
    newEndMinutes != null && nextStartMinutes != null && newEndMinutes > nextStartMinutes;

  return {
    newEndTime,
    hasConflict,
    decreaseDisabled: extensionMinutes <= EXTEND_STEP_MINUTES,
  };
}

/** 연장 대상 일정 종료 이후 가장 먼저 시작하는 핀 일정의 시작 분. 없으면 null. */
function getNextScheduleStartMinutes(
  card: CardItem,
  originalEndMinutes: number | null,
  cards: CardItem[],
): number | null {
  if (originalEndMinutes == null) {
    return null;
  }

  let nextStart: number | null = null;
  for (const other of cards) {
    if (other.id === card.id || other.cardType === 'queue' || !other.timeFilled) {
      continue;
    }

    const startMinutes = parseTimeToMinutes(other.timeStart);
    if (startMinutes == null || startMinutes < originalEndMinutes) {
      continue;
    }

    if (nextStart == null || startMinutes < nextStart) {
      nextStart = startMinutes;
    }
  }

  return nextStart;
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

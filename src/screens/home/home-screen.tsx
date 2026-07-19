import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

import { ConditionScoreBackground } from '@/components/domain/condition/condition-score-background';
import { ConditionSummaryPanel } from '@/components/domain/condition/condition-summary-panel';
import { CardToast } from '@/components/domain/schedule/card-toast';
import { DueDurationSheet } from '@/components/domain/schedule/due-duration-sheet';
import { DailyMemoBottomSheet } from '@/components/features/home/daily-memo-bottom-sheet';
import { HomeAddBottomSheet } from '@/components/features/home/home-add-bottom-sheet';
import { HomeCalendarView } from '@/components/features/home/home-calendar-view';
import { HomeExtendTimeSheet } from '@/components/features/home/home-extend-time-sheet';
import { HomeProgressSheet } from '@/components/features/home/home-progress-sheet';
import { TimelineCard } from '@/components/features/home/timeline-card';
import { OnboardingNotificationModal } from '@/components/features/onboarding/onboarding-notification-modal';
import { Icon } from '@/components/ui/Icon';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { ViewModeButton } from '@/components/ui/ViewModeButton';
import { colors, radius, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';

import { useHomeScreen } from './hooks/use-home-screen';

const HOME_STATUS_COLUMN_WIDTH = 112;
const HOME_MESSAGE_BOX_WIDTH = 226;
const HOME_TIMELINE_LEFT = 108;
const HOME_TIMELINE_LINE_LEFT = 43;
const HOME_TIMELINE_CARD_LIST_TOP = 107;
const HOME_TIMELINE_CARD_LIST_BOTTOM = 160;
const HOME_CURRENT_TIME_TOP = 252;
const HOME_CURRENT_TIME_LINE_WIDTH = 13;

/** 홈 화면의 JSX와 화면 전용 스타일만 렌더링합니다. */
export function HomeScreen() {
  const home = useHomeScreen();

  return (
    <ScreenLayout
      backgroundColor={colors.onboardingMutedBackground}
      contentStyle={styles.content}
      useSafeArea={false}
    >
      <StatusBar style="light" />
      <ConditionScoreBackground score={home.conditionSummary.finalScore} />
      <GestureDetector gesture={home.pinchGesture}>
        <View style={styles.canvas}>
          {home.viewMode === 'daily' ? (
            <View style={styles.timeline}>
              <View style={styles.timelineLine} />
              <ScrollView
                contentContainerStyle={styles.timelineContent}
                showsVerticalScrollIndicator={false}
              >
                {home.timelineCardsForView.map((card) => (
                  <TimelineCard key={card.id} {...card} />
                ))}
              </ScrollView>
              <View style={styles.currentTime}>
                <View style={styles.currentTimeBadge}>
                  <Typography variant="caption" color={colors.gray.white}>
                    {home.currentTimeLabel}
                  </Typography>
                </View>
                <View style={styles.currentLine} />
              </View>
            </View>
          ) : (
            <HomeCalendarView
              mode={home.viewMode}
              days={home.calendarDays}
              onSelectDate={home.handleSelectDate}
            />
          )}
          <View style={styles.header}>
            <View style={styles.statusColumn}>
              <ViewModeButton
                mode={home.viewMode}
                accessibilityLabel="보기 방식 변경"
                style={styles.viewModeButton}
                onPress={home.handleCycleViewMode}
              />
              <ConditionSummaryPanel
                year={home.homeDate.year}
                dateLabel={home.homeDate.date}
                summary={home.conditionSummary}
                memoLabel={home.dailyMemos[0]?.content ?? t('home.dailyMemo.emptyLabel')}
                memoCount={home.dailyMemos.length}
                onMemoPress={home.handleOpenMemoSheet}
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
                {home.headerMessage}
              </Typography>
            </View>
          </View>
        </View>
      </GestureDetector>
      <HomeAddBottomSheet
        visible={home.isAddSheetVisible}
        recommendations={home.visibleRecommendations}
        onClose={home.handleCloseAddSheet}
        onCreatePress={home.handleCreateCard}
        onDismissRecommendation={home.handleDismissRecommendation}
        onRecommendationAddPress={home.handleAddRecommendation}
        onViewQueuePress={home.handleViewQueue}
      />
      <DailyMemoBottomSheet
        visible={home.isDailyMemoSheetVisible}
        dateLabel={home.dailyMemoDateLabel}
        memos={home.dailyMemos}
        isLoading={home.dailyMemosQuery.isLoading}
        isError={home.dailyMemosQuery.isError}
        hasMutationError={home.hasMemoMutationError}
        isCreating={home.isCreatingMemo}
        deletingMemoId={home.deletingMemoId}
        onClose={home.handleCloseMemoSheet}
        onRetry={() => void home.dailyMemosQuery.refetch()}
        onCreate={home.handleCreateDailyMemo}
        onDelete={home.handleDeleteDailyMemo}
      />
      <HomeProgressSheet
        visible={
          home.progressCard != null && !home.isExtendSheetVisible && !home.isQueueSheetVisible
        }
        timeSummary={home.progressTimeSummary}
        status={home.progressStatus}
        onChangeStatus={home.setProgressStatus}
        onCancel={home.handleCloseProgressSheet}
        onComplete={home.handleCompleteProgress}
        completeDisabled={home.isUpdatingSchedule}
        onLeaveAsQueuePress={home.handleOpenQueueSheet}
        onExtendTimePress={home.handleOpenExtendSheet}
      />
      {home.progressCard ? (
        <DueDurationSheet
          visible={home.isQueueSheetVisible}
          value={home.queueDraftValue}
          title="큐 카드로 남겨두기"
          subtitle={'일정을 수행할 시간을 나중에 찾아볼게요\n마감일과 소요 시간을 확인해 주세요'}
          scheduleTitle={home.progressCard.title}
          leftAction="back"
          allowClearDueDate
          onClose={home.handleCloseQueueSheet}
          onDone={home.handleConfirmQueueConversion}
        />
      ) : null}
      {home.progressCard ? (
        <HomeExtendTimeSheet
          visible={home.isExtendSheetVisible}
          title={home.progressCard.title}
          dateLabel={home.progressDateLabel}
          startTime={home.progressCard.timeStart}
          newEndTime={home.extendState.newEndTime}
          addedMinutes={home.extensionMinutes}
          decreaseDisabled={home.extendState.decreaseDisabled}
          hasConflict={home.extendState.hasConflict}
          onBack={home.handleCloseExtendSheet}
          onComplete={home.handleCompleteExtension}
          onDecrease={home.handleDecreaseExtension}
          onIncrease={home.handleIncreaseExtension}
          completeDisabled={home.extendState.hasConflict || home.isUpdatingSchedule}
        />
      ) : null}
      {home.isExtendSheetVisible &&
      home.extendState.hasConflict &&
      !home.isConflictToastDismissed ? (
        <CardToast message="다음 일정과 겹쳐요!" onClose={home.dismissConflictToast} />
      ) : null}
      <OnboardingNotificationModal
        visible={home.isNotificationModalVisible}
        isSubmitting={home.isUpdatingNotification}
        errorMessage={home.notificationErrorMessage}
        onAllow={() => home.updateNotificationSettings(true)}
        onDeny={() => home.updateNotificationSettings(false)}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, overflow: 'hidden' },
  canvas: { width: '100%', maxWidth: 393, flex: 1, alignSelf: 'center' },
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
  statusColumn: { width: HOME_STATUS_COLUMN_WIDTH },
  viewModeButton: { alignSelf: 'flex-start', marginBottom: spacing[1] },
  messageBox: { width: HOME_MESSAGE_BOX_WIDTH, alignItems: 'flex-end', gap: spacing[2] },
  message: { width: '100%' },
  timeline: { position: 'absolute', top: 0, bottom: 0, left: HOME_TIMELINE_LEFT, right: 0 },
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
});

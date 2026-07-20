import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { ConditionCalendarModal } from '@/components/domain/condition/condition-calendar-modal';
import { ConditionScoreBackground } from '@/components/domain/condition/condition-score-background';
import { ConditionSummaryPanel } from '@/components/domain/condition/condition-summary-panel';
import { CardToast } from '@/components/domain/schedule/card-toast';
import { DueDurationSheet } from '@/components/domain/schedule/due-duration-sheet';
import { DailyMemoBottomSheet } from '@/components/features/home/daily-memo-bottom-sheet';
import { HomeAddBottomSheet } from '@/components/features/home/home-add-bottom-sheet';
import { HomeCalendarView } from '@/components/features/home/home-calendar-view';
import { HomeConditionPromptModal } from '@/components/features/home/home-condition-prompt-modal';
import { HomeExtendTimeSheet } from '@/components/features/home/home-extend-time-sheet';
import { HomeProgressSheet } from '@/components/features/home/home-progress-sheet';
import { TimelineCard } from '@/components/features/home/timeline-card';
import { OnboardingNotificationModal } from '@/components/features/onboarding/onboarding-notification-modal';
import { ConvertToPinBottomSheet } from '@/components/features/queue-to-pin/convert-to-pin-sheet';
import { Icon } from '@/components/ui/Icon';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { ViewModeButton } from '@/components/ui/ViewModeButton';
import { colors, radius, spacing } from '@/constants/theme';
import { getConditionScoreTheme } from '@/domains/condition/score-theme';
import { t } from '@/lib/i18n';

import { useFocusTimelineCurrentTime } from './hooks/use-focus-timeline-current-time';
import { useHomeScreen } from './hooks/use-home-screen';

const HOME_STATUS_COLUMN_WIDTH = 112;
const HOME_MESSAGE_BOX_MAX_WIDTH = 248;
const HOME_TIMELINE_LEFT = 108;
const HOME_TIMELINE_LINE_LEFT = 43;
const HOME_TIMELINE_CARD_LIST_BOTTOM = 160;
// 스크롤된 카드가 헤더 멘트 영역을 침범해도 읽히지 않도록, 카드 시작 지점까지 불투명도를 유지합니다.
const HOME_HEADER_OVERLAY_HEIGHT = 248;

/** 홈 화면의 JSX와 화면 전용 스타일만 렌더링합니다. */
export function HomeScreen() {
  const home = useHomeScreen();
  const scoreTheme = getConditionScoreTheme(home.conditionScore);
  const timelineFocus = useFocusTimelineCurrentTime(
    home.currentTimeMarker != null,
    home.currentTimeMarker?.offsetRatio ?? null,
  );

  return (
    <ScreenLayout
      backgroundColor={colors.onboardingMutedBackground}
      contentStyle={styles.content}
      useSafeArea={false}
    >
      <StatusBar style="light" />
      <ConditionScoreBackground score={home.conditionScore} />
      <GestureDetector gesture={home.homeGesture}>
        <View style={styles.canvas}>
          {home.viewMode === 'daily' ? (
            <View style={styles.timeline}>
              <Svg pointerEvents="none" width="1" height="100%" style={styles.timelineLine}>
                <Defs>
                  <LinearGradient id="homeTimelineLine" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={colors.gray[400]} stopOpacity="0.25" />
                    <Stop offset="1" stopColor={colors.gray[400]} stopOpacity="0.65" />
                  </LinearGradient>
                </Defs>
                <Rect width="1" height="100%" fill="url(#homeTimelineLine)" />
              </Svg>
              <ScrollView
                style={styles.timelineScroll}
                contentContainerStyle={styles.timelineContent}
                showsVerticalScrollIndicator={false}
              >
                {timelineFocus.markerTop != null ? (
                  <HomeCurrentTimeMarker
                    time={home.currentTimeLabel}
                    top={timelineFocus.markerTop}
                  />
                ) : null}
                {home.timelineCardsForView.map((card) => (
                  <View
                    key={card.id}
                    style={styles.timelineCardSlot}
                    onLayout={
                      home.currentTimeMarker?.cardId === card.id
                        ? timelineFocus.handleMarkerLayout
                        : undefined
                    }
                  >
                    <TimelineCard {...card} />
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : (
            <HomeCalendarView
              mode={home.viewMode}
              days={home.calendarDays}
              onSelectDate={home.handleSelectDate}
            />
          )}
        </View>
      </GestureDetector>
      {home.viewMode === 'daily' ? (
        <Svg
          pointerEvents="none"
          preserveAspectRatio="none"
          viewBox={`0 0 393 ${HOME_HEADER_OVERLAY_HEIGHT}`}
          width="100%"
          height={HOME_HEADER_OVERLAY_HEIGHT}
          style={styles.headerOverlay}
        >
          <Defs>
            <LinearGradient id="homeHeaderOverlay" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={scoreTheme.primary} stopOpacity="0.92" />
              <Stop offset="0.76" stopColor={scoreTheme.primary} stopOpacity="0.86" />
              <Stop offset="1" stopColor={scoreTheme.primary} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect width={393} height={HOME_HEADER_OVERLAY_HEIGHT} fill="url(#homeHeaderOverlay)" />
        </Svg>
      ) : null}
      <View pointerEvents="box-none" style={styles.header}>
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
            showMeters={home.viewMode === 'daily'}
            onDatePress={home.handleOpenCalendar}
            onScorePress={home.openConditionTab}
            onMemoPress={home.handleOpenMemoSheet}
          />
        </View>
        <View pointerEvents="box-none" style={styles.messageBox}>
          <Pressable
            accessibilityLabel={t('home.notification')}
            accessibilityRole="button"
            hitSlop={spacing[2]}
            style={({ pressed }) => pressed && styles.pressed}
            onPress={() => home.openNotifications()}
          >
            <Icon name="bell" size={24} color={colors.gray.white} />
          </Pressable>
          <Typography
            pointerEvents="none"
            lineBreakStrategyIOS="hangul-word"
            variant="titleM"
            color={colors.gray.white}
            align="right"
            style={styles.message}
          >
            {home.headerMessage}
          </Typography>
        </View>
      </View>
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
          home.progressCard != null &&
          !home.isExtendSheetVisible &&
          !home.isQueueSheetVisible &&
          !home.isRescheduleSheetVisible
        }
        title={home.progressCard?.title ?? ''}
        timeSummary={home.progressTimeSummary}
        status={home.progressStatus}
        step={home.progressSheetStep}
        onChangeStatus={home.setProgressStatus}
        onCancel={home.handleCloseProgressSheet}
        onBack={home.handleBackProgressSheet}
        onComplete={home.handleCompleteProgress}
        completeDisabled={home.isUpdatingSchedule}
        onReschedulePress={home.handleReschedule}
        onLeaveAsQueuePress={home.handleOpenQueueSheet}
        onExtendTimePress={home.handleOpenExtendSheet}
      />
      {home.progressCard || home.rescheduleCard ? (
        <DueDurationSheet
          visible={home.isQueueSheetVisible}
          value={home.queueDraftValue}
          title="큐 카드로 남겨두기"
          subtitle={'일정을 수행할 시간을 나중에 찾아볼게요\n마감일과 소요 시간을 확인해 주세요'}
          scheduleTitle={(home.progressCard ?? home.rescheduleCard)?.title}
          leftAction="back"
          allowClearDueDate
          onClose={home.handleCloseQueueSheet}
          onDone={home.handleConfirmQueueConversion}
        />
      ) : null}
      {home.rescheduleCard ? (
        <ConvertToPinBottomSheet
          visible={home.isRescheduleSheetVisible && !home.isQueueSheetVisible}
          card={home.rescheduleCard}
          candidates={home.rescheduleRecommendationCandidates}
          isRecommendationLoading={home.isRescheduleRecommendationLoading}
          recommendationErrorMode={home.rescheduleRecommendationErrorMode}
          defaultKeepOriginal={false}
          presentation="reschedule"
          onClose={home.handleCloseReschedule}
          onConvert={home.handleRescheduleConvert}
          onAcceptRecommendation={home.handleAcceptRescheduleRecommendation}
          onEditDuration={home.handleEditRescheduleDuration}
          onLeaveAsQueue={home.handleOpenQueueSheet}
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
          showConflictToast={home.extendState.hasConflict && !home.isConflictToastDismissed}
          onBack={home.handleCloseExtendSheet}
          onComplete={home.handleCompleteExtension}
          onDecrease={home.handleDecreaseExtension}
          onIncrease={home.handleIncreaseExtension}
          onDismissConflict={home.dismissConflictToast}
          completeDisabled={home.extendState.hasConflict || home.isUpdatingSchedule}
        />
      ) : null}
      {home.recommendationErrorMessage ? (
        <CardToast
          message={home.recommendationErrorMessage}
          onClose={home.dismissRecommendationErrorToast}
        />
      ) : null}
      <OnboardingNotificationModal
        visible={home.isNotificationModalVisible}
        isSubmitting={home.isUpdatingNotification}
        errorMessage={home.notificationErrorMessage}
        onAllow={() => home.updateNotificationSettings(true)}
        onDeny={() => home.updateNotificationSettings(false)}
      />
      <HomeConditionPromptModal
        visible={home.isConditionPromptVisible}
        onClose={home.closeConditionPrompt}
        onConditionPress={home.openConditionMeasureFromPrompt}
      />
      <ConditionCalendarModal
        visible={home.calendar.visible}
        title={home.calendar.title}
        days={home.calendar.days}
        selectedDate={home.selectedDate}
        periodMode="daily"
        canGoNext={home.calendar.canGoNext}
        onSelectDate={home.handleCalendarDateSelect}
        onPreviousMonth={() => home.handleMoveCalendarMonth('previous')}
        onNextMonth={() => home.handleMoveCalendarMonth('next')}
        onClose={home.handleCloseCalendar}
      />
    </ScreenLayout>
  );
}

function HomeCurrentTimeMarker({ time, top }: { time: string; top: number }) {
  return (
    <View style={[styles.currentTime, { top }]} pointerEvents="none">
      <View style={styles.currentTimeBadge}>
        <Typography variant="caption" color={colors.gray.white}>
          {time}
        </Typography>
      </View>
      <Svg
        width="100%"
        height="2"
        viewBox="0 0 247 2"
        preserveAspectRatio="none"
        style={styles.currentLine}
      >
        <Defs>
          <LinearGradient
            id="homeCurrentTimeLine"
            x1="0"
            y1="0.5"
            x2="247"
            y2="0.5"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor={colors.secondary} />
            <Stop offset="1" stopColor={colors.secondary} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path d="M247 1L0 1" stroke="url(#homeCurrentTimeLine)" strokeWidth="2" />
      </Svg>
    </View>
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
    zIndex: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[3],
  },
  statusColumn: { width: HOME_STATUS_COLUMN_WIDTH },
  viewModeButton: { alignSelf: 'flex-start', marginBottom: spacing[1] },
  messageBox: {
    flexGrow: 1,
    flexShrink: 1,
    maxWidth: HOME_MESSAGE_BOX_MAX_WIDTH,
    marginLeft: spacing[3],
    alignItems: 'flex-end',
    gap: spacing[2],
  },
  message: { width: '100%', zIndex: 1 },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HOME_HEADER_OVERLAY_HEIGHT,
    zIndex: 0,
  },
  timeline: { position: 'absolute', top: 0, bottom: 0, left: HOME_TIMELINE_LEFT, right: 0 },
  timelineLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: HOME_TIMELINE_LINE_LEFT,
  },
  timelineContent: {
    alignItems: 'flex-end',
    gap: spacing[2],
    paddingRight: spacing[3],
    paddingBottom: HOME_TIMELINE_CARD_LIST_BOTTOM,
    position: 'relative',
  },
  timelineScroll: { flex: 1 },
  timelineCardSlot: {
    position: 'relative',
    width: '100%',
    maxWidth: 273,
  },
  currentTime: {
    position: 'absolute',
    left: 0,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    transform: [{ translateY: -spacing[3] }],
  },
  currentTimeBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[1],
    borderRadius: radius.sm,
    backgroundColor: colors.secondary,
  },
  currentLine: {
    flex: 1,
    height: 2,
  },
  pressed: { opacity: 0.72 },
});

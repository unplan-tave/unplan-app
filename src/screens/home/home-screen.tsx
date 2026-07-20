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
import { HomeCardDetailSheet } from '@/components/features/home/home-card-detail-sheet';
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
  const {
    page,
    header,
    timeline,
    addSheet,
    memo,
    scheduleFlow,
    cardDetail,
    notification,
    conditionPrompt,
    feedback,
  } = home;
  const scoreTheme = getConditionScoreTheme(header.conditionScore);
  const timelineFocus = useFocusTimelineCurrentTime(
    timeline.currentTimeMarker != null,
    timeline.currentTimeMarker?.offsetRatio ?? null,
  );

  return (
    <ScreenLayout
      backgroundColor={colors.onboardingMutedBackground}
      contentStyle={styles.content}
      useSafeArea={false}
    >
      <StatusBar style="light" />
      <ConditionScoreBackground score={header.conditionScore} />
      <GestureDetector gesture={page.homeGesture}>
        <View style={styles.canvas}>
          {page.viewMode === 'daily' ? (
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
                    time={timeline.currentTimeLabel}
                    top={timelineFocus.markerTop}
                  />
                ) : null}
                {timeline.cards.map((card) => (
                  <View
                    key={card.id}
                    style={styles.timelineCardSlot}
                    onLayout={
                      timeline.currentTimeMarker?.cardId === card.id
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
              mode={page.viewMode}
              days={page.calendarDays}
              onSelectDate={page.handleSelectDate}
            />
          )}
        </View>
      </GestureDetector>
      {page.viewMode === 'daily' ? (
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
            mode={page.viewMode}
            accessibilityLabel="보기 방식 변경"
            style={styles.viewModeButton}
            onPress={page.handleCycleViewMode}
          />
          <ConditionSummaryPanel
            year={page.homeDate.year}
            dateLabel={page.homeDate.date}
            summary={header.conditionSummary}
            memoLabel={header.dailyMemos[0]?.content ?? t('home.dailyMemo.emptyLabel')}
            memoCount={header.dailyMemos.length}
            showMeters={page.viewMode === 'daily'}
            onDatePress={page.handleOpenCalendar}
            onScorePress={header.openConditionTab}
            onMemoPress={memo.onOpen}
          />
        </View>
        <View pointerEvents="box-none" style={styles.messageBox}>
          <Pressable
            accessibilityLabel={t('home.notification')}
            accessibilityRole="button"
            hitSlop={spacing[2]}
            style={({ pressed }) => pressed && styles.pressed}
            onPress={() => header.openNotifications()}
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
            {header.message}
          </Typography>
        </View>
      </View>
      <HomeAddBottomSheet
        visible={addSheet.visible}
        recommendations={addSheet.recommendations}
        onClose={addSheet.onClose}
        onCreatePress={addSheet.onCreatePress}
        onDismissRecommendation={addSheet.onDismissRecommendation}
        onRecommendationAddPress={addSheet.onRecommendationAddPress}
        onViewQueuePress={addSheet.onViewQueuePress}
      />
      <DailyMemoBottomSheet
        visible={memo.visible}
        dateLabel={memo.dateLabel}
        memos={memo.memos}
        isLoading={memo.query.isLoading}
        isError={memo.query.isError}
        hasMutationError={memo.hasMutationError}
        isCreating={memo.isCreating}
        deletingMemoId={memo.deletingMemoId}
        onClose={memo.onClose}
        onRetry={() => void memo.query.refetch()}
        onCreate={memo.onCreate}
        onDelete={memo.onDelete}
      />
      <HomeProgressSheet
        visible={scheduleFlow.progress.visible}
        title={scheduleFlow.progress.title}
        timeSummary={scheduleFlow.progress.timeSummary}
        status={scheduleFlow.progress.status}
        step={scheduleFlow.progress.step}
        onChangeStatus={scheduleFlow.progress.setStatus}
        onCancel={scheduleFlow.progress.onCancel}
        onBack={scheduleFlow.progress.onBack}
        onComplete={scheduleFlow.progress.onComplete}
        completeDisabled={scheduleFlow.isUpdatingSchedule}
        onReschedulePress={scheduleFlow.progress.onReschedule}
        onLeaveAsQueuePress={scheduleFlow.progress.onLeaveAsQueue}
        onExtendTimePress={scheduleFlow.progress.onExtend}
      />
      <HomeCardDetailSheet
        visible={cardDetail.visible}
        card={cardDetail.card}
        conditionTag={cardDetail.conditionTag}
        personalTagLabels={cardDetail.personalTagLabels}
        isLoading={cardDetail.isLoading}
        isError={cardDetail.isError}
        status={cardDetail.status}
        onChangeStatus={cardDetail.onChangeStatus}
        onClose={cardDetail.onClose}
        onEdit={cardDetail.onEdit}
      />
      {scheduleFlow.queue.mounted ? (
        <DueDurationSheet
          visible={scheduleFlow.queue.visible}
          value={scheduleFlow.queue.value}
          title="큐 카드로 남겨두기"
          subtitle={'일정을 수행할 시간을 나중에 찾아볼게요\n마감일과 소요 시간을 확인해 주세요'}
          scheduleTitle={scheduleFlow.queue.scheduleTitle}
          leftAction="back"
          allowClearDueDate
          onClose={scheduleFlow.queue.onClose}
          onDone={scheduleFlow.queue.onDone}
        />
      ) : null}
      {scheduleFlow.reschedule.mounted && scheduleFlow.reschedule.card ? (
        <ConvertToPinBottomSheet
          visible={scheduleFlow.reschedule.visible}
          card={scheduleFlow.reschedule.card}
          candidates={scheduleFlow.reschedule.candidates}
          isRecommendationLoading={scheduleFlow.reschedule.isRecommendationLoading}
          recommendationErrorMode={scheduleFlow.reschedule.recommendationErrorMode}
          defaultKeepOriginal={false}
          presentation="reschedule"
          onClose={scheduleFlow.reschedule.onClose}
          onConvert={scheduleFlow.reschedule.onConvert}
          onAcceptRecommendation={scheduleFlow.reschedule.onAcceptRecommendation}
          onSearch14Days={scheduleFlow.reschedule.onSearch14Days}
          onEditDuration={scheduleFlow.reschedule.onEditDuration}
          onLeaveAsQueue={scheduleFlow.reschedule.onLeaveAsQueue}
        />
      ) : null}
      {scheduleFlow.extend.mounted ? (
        <HomeExtendTimeSheet
          visible={scheduleFlow.extend.visible}
          title={scheduleFlow.extend.title}
          dateLabel={scheduleFlow.extend.dateLabel}
          startTime={scheduleFlow.extend.startTime}
          newEndTime={scheduleFlow.extend.state.newEndTime}
          addedMinutes={scheduleFlow.extend.addedMinutes}
          decreaseDisabled={scheduleFlow.extend.state.decreaseDisabled}
          hasConflict={scheduleFlow.extend.state.hasConflict}
          showConflictToast={scheduleFlow.extend.showConflictToast}
          onBack={scheduleFlow.extend.onBack}
          onComplete={scheduleFlow.extend.onComplete}
          onDecrease={scheduleFlow.extend.onDecrease}
          onIncrease={scheduleFlow.extend.onIncrease}
          onDismissConflict={scheduleFlow.extend.onDismissConflict}
          completeDisabled={scheduleFlow.extend.completeDisabled}
        />
      ) : null}
      {feedback.recommendationErrorMessage ? (
        <CardToast
          message={feedback.recommendationErrorMessage}
          onClose={feedback.dismissRecommendationErrorToast}
        />
      ) : null}
      <OnboardingNotificationModal
        visible={notification.visible}
        isSubmitting={notification.isSubmitting}
        errorMessage={notification.errorMessage}
        onAllow={() => notification.updateSettings(true)}
        onDeny={() => notification.updateSettings(false)}
      />
      <HomeConditionPromptModal
        visible={conditionPrompt.visible}
        onClose={conditionPrompt.onClose}
        onConditionPress={conditionPrompt.onConditionPress}
      />
      <ConditionCalendarModal
        visible={page.calendar.visible}
        title={page.calendar.title}
        days={page.calendar.days}
        selectedDate={page.selectedDate}
        periodMode="daily"
        canGoNext={page.calendar.canGoNext}
        onSelectDate={page.handleCalendarDateSelect}
        onPreviousMonth={() => page.handleMoveCalendarMonth('previous')}
        onNextMonth={() => page.handleMoveCalendarMonth('next')}
        onClose={page.handleCloseCalendar}
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

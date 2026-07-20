import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

import { ConditionCalendarModal } from '@/components/domain/condition/condition-calendar-modal';
import { ConditionScoreBackground } from '@/components/domain/condition/condition-score-background';
import { ConditionGraphCard } from '@/components/features/condition/condition-graph-card';
import { ConditionGraphModeToggle } from '@/components/features/condition/condition-graph-mode-toggle';
import { ConditionHero } from '@/components/features/condition/condition-hero';
import { ConditionMetricCard } from '@/components/features/condition/condition-metric-card';
import { ConditionRecommendationSheet } from '@/components/features/condition/condition-recommendation-sheet';
import { Button } from '@/components/ui/Button';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { colors, spacing } from '@/constants/theme';

import { useConditionScreen } from './hooks/use-condition-screen';

const CONTENT_MAX_WIDTH = 393;

export function ConditionScreen() {
  const { insets, view, recommendation, openRecordScreen } = useConditionScreen();

  return (
    <ScreenLayout
      backgroundColor={colors.onboardingMutedBackground}
      contentStyle={styles.content}
      useSafeArea={false}
    >
      <StatusBar style="light" />
      <ConditionScoreBackground score={view.conditionScore} variant="reversed" />
      <GestureDetector gesture={view.periodSwipeGesture}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.canvas, { paddingBottom: insets.bottom + spacing[6] }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, { paddingTop: insets.top + spacing[2] }]}>
            <ConditionHero
              score={view.conditionSummary.finalScore}
              year={view.dateLabel.year}
              dateLabel={view.dateLabel.date}
              message={view.message}
              viewMode={view.periodMode}
              onDatePress={view.openCalendar}
              onViewModePress={view.cyclePeriodMode}
            />
          </View>

          <View style={styles.main}>
            <View style={styles.dataSection}>
              <View style={styles.graphSection}>
                <ConditionGraphModeToggle />
                <ConditionGraphCard metrics={view.metrics} score={view.conditionScore} />
              </View>
              <View style={styles.conditionList}>
                {view.metrics.map((metric) => (
                  <ConditionMetricCard key={metric.key} metric={metric} />
                ))}
              </View>
            </View>
            <View style={styles.actions}>
              <View style={styles.actionSlot}>
                <Button
                  label="컨디션 기반 추천 일정"
                  variant="conditionSecondary"
                  textStyle={styles.actionLabel}
                  onPress={recommendation.openSheet}
                />
              </View>
              <View style={styles.actionSlot}>
                <Button
                  label="기록 추가/수정"
                  variant="conditionPrimary"
                  textStyle={styles.actionLabel}
                  onPress={openRecordScreen}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </GestureDetector>

      <ConditionCalendarModal
        visible={view.calendar.visible}
        title={view.calendar.title}
        days={view.calendar.days}
        selectedDate={view.selectedDate}
        periodMode={view.periodMode}
        onSelectDate={view.selectDate}
        canGoNext={view.calendar.canGoNext}
        onPreviousMonth={() => view.moveCalendarMonth('previous')}
        onNextMonth={() => view.moveCalendarMonth('next')}
        onClose={view.closeCalendar}
      />

      <ConditionRecommendationSheet
        visible={recommendation.isSheetVisible}
        slotMessage={recommendation.slotMessage}
        conditionTagId={recommendation.conditionTagId}
        conditionTagLabel={recommendation.conditionTagLabel}
        recommendationReasonMessages={recommendation.recommendationReasonMessages}
        recommendations={recommendation.recommendations}
        activeIndex={recommendation.activeIndex}
        selectedRecoveryOptionId={recommendation.selectedRecoveryOptionId}
        emptyDescription={recommendation.emptyDescription}
        onClose={recommendation.closeSheet}
        onPrevPress={recommendation.showPrevious}
        onNextPress={recommendation.showNext}
        onSelectRecoveryOption={recommendation.selectRecoveryOption}
        isKeepingQueueCard={recommendation.isKeepingQueueCard}
        onToggleKeepQueueCard={recommendation.toggleKeepQueueCard}
        onManualTimePress={recommendation.openManualTime}
        onAccept={recommendation.acceptRecommendation}
      />
    </ScreenLayout>
  );
}

const HEADER_HEIGHT = 251;

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  canvas: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    flexGrow: 1,
    alignSelf: 'center',
  },
  header: {
    height: HEADER_HEIGHT,
    paddingHorizontal: spacing[3],
  },
  main: {
    gap: spacing[6],
    paddingHorizontal: spacing[3],
    paddingTop: spacing[6],
  },
  dataSection: {
    gap: spacing[4],
  },
  graphSection: {
    width: '100%',
    alignItems: 'flex-end',
    gap: spacing[2],
  },
  conditionList: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  actionSlot: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 14,
    lineHeight: 22.4,
    letterSpacing: -0.28,
  },
});

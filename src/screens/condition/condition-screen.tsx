import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { ConditionBackground } from '@/components/features/condition/condition-background';
import { ConditionCalendarModal } from '@/components/features/condition/condition-calendar-modal';
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
      <ConditionBackground score={view.conditionSummary.finalScore} />
      <View style={styles.canvas}>
        <View style={[styles.header, { paddingTop: insets.top + spacing[2] }]}>
          <ConditionHero
            score={view.conditionSummary.finalScore}
            year={view.dateLabel.year}
            dateLabel={view.dateLabel.date}
            viewMode={view.periodMode}
            onDatePress={view.openCalendar}
            onViewModePress={view.cyclePeriodMode}
          />
        </View>

        <View style={styles.main}>
          <ConditionGraphModeToggle />
          <ConditionGraphCard metrics={view.metrics} score={view.conditionSummary.finalScore} />
          <View style={styles.conditionList}>
            {view.metrics.map((metric) => (
              <ConditionMetricCard key={metric.key} metric={metric} />
            ))}
          </View>
          <View style={styles.actions}>
            <View style={styles.actionSlot}>
              <Button label="컨디션 기반 추천 일정" onPress={recommendation.openSheet} />
            </View>
            <View style={styles.actionSlot}>
              <Button label="기록 추가/수정" variant="primary" onPress={openRecordScreen} />
            </View>
          </View>
        </View>
      </View>

      <ConditionCalendarModal
        visible={view.calendar.visible}
        title={view.calendar.title}
        days={view.calendar.days}
        selectedDate={view.selectedDate}
        onSelectDate={view.selectDate}
        onClose={view.closeCalendar}
      />

      <ConditionRecommendationSheet
        visible={recommendation.isSheetVisible}
        slotMessage={recommendation.slotMessage}
        recommendations={recommendation.recommendations}
        activeIndex={recommendation.activeIndex}
        selectedRecoveryOptionId={recommendation.selectedRecoveryOptionId}
        emptyDescription={recommendation.emptyDescription}
        onClose={recommendation.closeSheet}
        onPrevPress={recommendation.showPrevious}
        onNextPress={recommendation.showNext}
        onSelectRecoveryOption={recommendation.selectRecoveryOption}
        onKeepQueuePress={recommendation.keepQueueCard}
        onManualTimePress={recommendation.openManualTime}
        onAccept={recommendation.acceptRecommendation}
      />
    </ScreenLayout>
  );
}

/** Figma 기준 393×852 화면에서 헤더와 본문이 한 화면에 들어가는 높이입니다. */
const HEADER_HEIGHT = 252;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    overflow: 'hidden',
  },
  canvas: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    flex: 1,
    alignSelf: 'center',
  },
  header: {
    height: HEADER_HEIGHT,
    paddingHorizontal: spacing[3],
  },
  main: {
    gap: spacing[4],
    paddingHorizontal: spacing[3],
    paddingTop: spacing[6],
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
});

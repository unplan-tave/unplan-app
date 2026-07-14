import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConditionSummaryPanel } from '@/components/domain/condition/condition-summary-panel';
import { ConditionCalendarModal } from '@/components/features/condition/condition-calendar-modal';
import { ConditionGraphCard } from '@/components/features/condition/condition-graph-card';
import { ConditionGraphModeToggle } from '@/components/features/condition/condition-graph-mode-toggle';
import { ConditionMetricCard } from '@/components/features/condition/condition-metric-card';
import { ConditionRecommendationSheet } from '@/components/features/condition/condition-recommendation-sheet';
import { AppBackground } from '@/components/ui/AppBackground';
import { Button } from '@/components/ui/Button';
import { GNB } from '@/components/ui/GNB';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { ViewModeButton } from '@/components/ui/ViewModeButton';
import { colors, spacing } from '@/constants/theme';
import { useTabNavigation } from '@/hooks/use-tab-navigation';

import { useConditionRecommendation } from './hooks/use-condition-recommendation';
import { useConditionView } from './hooks/use-condition-view';

const CONTENT_MAX_WIDTH = 393;
const HEADER_STATUS_COLUMN_WIDTH = 112;

export function ConditionScreen() {
  const insets = useSafeAreaInsets();
  const view = useConditionView();
  const recommendation = useConditionRecommendation(view.selectedDate);

  const handleNavChange = useTabNavigation();

  return (
    <ScreenLayout
      backgroundColor={colors.onboardingMutedBackground}
      contentStyle={styles.content}
      useSafeArea={false}
    >
      <StatusBar style="light" />
      <AppBackground />
      <View style={styles.canvas}>
        <View style={[styles.header, { paddingTop: insets.top + spacing[2] }]}>
          <View style={styles.statusColumn}>
            <ViewModeButton
              mode={view.periodMode}
              accessibilityLabel="보기 방식 변경"
              style={styles.viewModeButton}
              onPress={view.cyclePeriodMode}
            />
            <ConditionSummaryPanel
              year={view.dateLabel.year}
              dateLabel={view.dateLabel.date}
              summary={view.conditionSummary}
              onDatePress={view.openCalendar}
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + BOTTOM_INSET },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <ConditionGraphModeToggle
            value={view.graphMode}
            flowDisabled
            onChange={view.setGraphMode}
          />
          <ConditionGraphCard metrics={view.metrics} />
          {view.metrics.map((metric) => (
            <ConditionMetricCard key={metric.key} metric={metric} />
          ))}
          <Button label="컨디션 기반 추천 일정" fullWidth onPress={recommendation.openSheet} />
          {/*
            TODO(condition-detail): "기록 추가/수정"이 여는 컨디션 기록 화면(Figma ConditionDetail
            섹션의 MeasureEnergy·MeasureSleep)은 후속 PR 범위라 현재는 비활성화 상태로만 노출합니다.
          */}
          <Button label="기록 추가/수정" variant="primary" fullWidth disabled />
        </ScrollView>

        <View style={[styles.footer, { bottom: insets.bottom + spacing[2] }]}>
          <GNB
            value="condition"
            onChange={handleNavChange}
            onAddPress={() => router.push('/card/new')}
          />
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

/** GNB(66) + 하단 여백만큼 스크롤 콘텐츠를 띄웁니다. */
const BOTTOM_INSET = 90;

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
    flexDirection: 'row',
    paddingHorizontal: spacing[3],
  },
  statusColumn: {
    width: HEADER_STATUS_COLUMN_WIDTH,
  },
  viewModeButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing[1],
  },
  scrollContent: {
    gap: spacing[4],
    paddingHorizontal: spacing[3],
    paddingTop: spacing[6],
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 3,
    paddingHorizontal: spacing[5],
  },
});

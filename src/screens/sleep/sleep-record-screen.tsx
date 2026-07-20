import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConditionQuadrantPlot } from '@/components/features/condition/condition-quadrant-plot';
import { ConditionSummaryRow } from '@/components/features/condition/condition-summary-row';
import { RecordHistoryTabs } from '@/components/features/sleep/record-history-tabs';
import { SleepDateRail } from '@/components/features/sleep/sleep-date-rail';
import { SleepRecordCard } from '@/components/features/sleep/sleep-record-card';
import { AppBackground } from '@/components/ui/AppBackground';
import { BottomCTA } from '@/components/ui/BottomCTA';
import { Button } from '@/components/ui/Button';
import { Header, HeaderBack } from '@/components/ui/Header';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

import { useSleepRecordScreen } from './hooks/use-sleep-record-screen';

const CONTENT_MAX_WIDTH = 393;

export function SleepRecordScreen() {
  const sleep = useSleepRecordScreen();
  const isSleepTab = sleep.tab === 'sleep';
  const hasSelectedRecord = isSleepTab ? sleep.hasSelectedSleepRecord : sleep.hasSelectedMarker;

  return (
    <View style={styles.screen}>
      <AppBackground variant="reversed" />
      <SafeAreaView style={styles.safeArea}>
        <Header left={<HeaderBack onPress={sleep.goBack} />} title="컨디션 기록 내역" />

        <View style={styles.canvas}>
          <View style={styles.padded}>
            <RecordHistoryTabs value={sleep.tab} onChange={sleep.changeTab} />
          </View>

          <Typography variant="titleL" align="center" color={colors.gray[600]} style={styles.month}>
            {sleep.monthLabel}
          </Typography>
          <SleepDateRail items={sleep.dateItems} onSelect={sleep.selectDate} />

          {isSleepTab ? (
            <>
              <Typography
                variant="bodyM"
                align="center"
                color={colors.gray[700]}
                style={styles.total}
              >
                {sleep.totalLabel}
              </Typography>

              <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              >
                {sleep.records.map((record) => (
                  <SleepRecordCard
                    key={record.id}
                    record={record}
                    selected={sleep.selectedRecordId === record.id}
                    onPress={() => sleep.selectRecord(record.id)}
                  />
                ))}
              </ScrollView>
            </>
          ) : (
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.bodyMindContent}
              showsVerticalScrollIndicator={false}
            >
              <ConditionSummaryRow
                bodyPercent={sleep.bodyMind.bodyPercent}
                mindPercent={sleep.bodyMind.mindPercent}
              />
              <View style={styles.quadrant}>
                <ConditionQuadrantPlot
                  points={sleep.bodyMind.points}
                  activeMarkerId={sleep.selectedMarkerId ?? sleep.activeMarkerId}
                  activeMarkerTime={sleep.selectedMarkerTime}
                  activeMarkerTimes={sleep.activeMarkerTimes}
                  onMarkerPress={sleep.pressBodyMindMarker}
                  onBackgroundPress={sleep.clearMarkerState}
                />
              </View>
            </ScrollView>
          )}
        </View>

        <View style={styles.footer}>
          {hasSelectedRecord ? (
            <EditActions
              deleting={isSleepTab ? sleep.isDeletingSleep : sleep.isDeletingBodyMind}
              onDelete={isSleepTab ? sleep.deleteSelectedSleep : sleep.deleteSelectedBodyMind}
              onEdit={isSleepTab ? sleep.editSelectedSleep : sleep.editSelectedBodyMind}
            />
          ) : (
            <BottomCTA
              label="기록 추가"
              caption={null}
              variant="record"
              onPress={isSleepTab ? sleep.addRecord : sleep.addBodyMindRecord}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

function EditActions({
  deleting,
  onDelete,
  onEdit,
}: {
  deleting: boolean;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <View style={styles.editActions}>
      <View style={styles.editSlot}>
        <Button
          label="기록 삭제"
          variant="glass"
          disabled={deleting}
          style={styles.editButton}
          onPress={onDelete}
        />
      </View>
      <View style={styles.editSlot}>
        <Button label="기록 수정" variant="primary" style={styles.editButton} onPress={onEdit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.onboardingMutedBackground,
  },
  safeArea: {
    flex: 1,
  },
  canvas: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    flex: 1,
    alignSelf: 'center',
    gap: spacing[4],
    paddingTop: spacing[2],
  },
  padded: {
    paddingHorizontal: spacing[5],
  },
  month: {
    marginTop: spacing[2],
  },
  total: {
    marginTop: spacing[2],
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
  },
  bodyMindContent: {
    gap: spacing[4],
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
  },
  quadrant: {
    width: '100%',
    maxWidth: 314,
    alignSelf: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
  footer: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[2],
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  editSlot: {
    flex: 1,
  },
  editButton: {
    height: 56,
    maxWidth: '100%',
    borderRadius: radius.full,
  },
});

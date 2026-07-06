import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { CardToast } from '@/components/domain/schedule/card-toast';
import { ExcludeTimeRangeList } from '@/components/features/settings/exclude-time-range-list';
import { MinFreeTimeSheet } from '@/components/features/settings/min-free-time-sheet';
import { TimeRangePickerSheet } from '@/components/features/settings/time-range-picker-sheet';
import { Header, HeaderBack } from '@/components/ui/Header';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { formatDurationLabel } from '@/domains/ai-recommendation/model';
import { t } from '@/lib/i18n';

import { useRecommendationCriteria } from './hooks/use-recommendation-criteria';

export function RecommendationCriteriaScreen() {
  const router = useRouter();
  const {
    criteria,
    setExcludeEnabled,
    removeExcludeRange,
    isMinFreeSheetVisible,
    openMinFreeSheet,
    closeMinFreeSheet,
    handleAddMinutes,
    resetMinFreeMinutes,
    rangeSheet,
    rangeSheetInitialRange,
    openAddRangeSheet,
    openEditRangeSheet,
    closeRangeSheet,
    handleSubmitRange,
    toastMessage,
    dismissToast,
  } = useRecommendationCriteria();

  return (
    <ScreenLayout backgroundColor={colors.gray[50]} contentStyle={styles.screen}>
      <Header
        title={t('settings.scheduleRecommendationCriteria')}
        left={<HeaderBack onPress={router.back} />}
        right={<View style={styles.headerSide} />}
        style={styles.header}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Typography variant="titleS" color={colors.gray[900]}>
            {t('settings.recommendation.conditionsTitle')}
          </Typography>
          <View style={styles.sectionRows}>
            <View>
              <Pressable
                accessibilityLabel={t('settings.recommendation.minFreeTime')}
                accessibilityRole="button"
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                onPress={openMinFreeSheet}
              >
                <Typography variant="bodyM" color={colors.gray[700]}>
                  {t('settings.recommendation.minFreeTime')}
                </Typography>
                <Typography variant="bodyM" color={colors.gray[500]}>
                  {`${formatDurationLabel(criteria.minFreeMinutes)} ${t('settings.recommendation.minFreeTimeSuffix')}`}
                </Typography>
              </Pressable>
              <Typography variant="bodyS" color={colors.gray[400]}>
                {t('settings.recommendation.minFreeTimeCaption')}
              </Typography>
            </View>
            <View>
              <View style={styles.row}>
                <Typography variant="bodyM" color={colors.gray[700]}>
                  {t('settings.recommendation.excludeTime')}
                </Typography>
                <Switch
                  value={criteria.excludeEnabled}
                  trackColor={{ false: colors.gray[300], true: colors.primary }}
                  thumbColor={colors.gray.white}
                  ios_backgroundColor={colors.gray[300]}
                  onValueChange={setExcludeEnabled}
                />
              </View>
              <Typography variant="bodyS" color={colors.gray[400]}>
                {t('settings.recommendation.excludeTimeCaption')}
              </Typography>
            </View>
            {criteria.excludeEnabled ? (
              <ExcludeTimeRangeList
                ranges={criteria.excludeRanges}
                onEditRange={openEditRangeSheet}
                onRemoveRange={removeExcludeRange}
                onAddRange={openAddRangeSheet}
              />
            ) : null}
          </View>
        </View>
      </ScrollView>
      <MinFreeTimeSheet
        visible={isMinFreeSheetVisible}
        minutes={criteria.minFreeMinutes}
        onAddMinutes={handleAddMinutes}
        onReset={resetMinFreeMinutes}
        onClose={closeMinFreeSheet}
      />
      <TimeRangePickerSheet
        visible={rangeSheet != null}
        initialRange={rangeSheetInitialRange}
        toastMessage={toastMessage}
        onToastClose={dismissToast}
        onSubmit={handleSubmitRange}
        onClose={closeRangeSheet}
      />
      {toastMessage && rangeSheet == null ? (
        <CardToast message={toastMessage} onClose={dismissToast} />
      ) : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
  },
  header: {
    paddingHorizontal: spacing[4],
  },
  headerSide: {
    width: 44,
    height: 44,
  },
  content: {
    gap: spacing[5],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[10],
  },
  section: {
    width: '100%',
    maxWidth: 353,
    alignSelf: 'center',
    gap: spacing[4],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
    borderRadius: radius.sm,
    backgroundColor: colors.gray.white,
  },
  sectionRows: {
    gap: spacing[4],
  },
  row: {
    minHeight: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  pressed: {
    opacity: 0.72,
  },
});

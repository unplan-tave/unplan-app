import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { CONDITION_SUMMARY_PANEL } from '@/constants/condition-ui';
import { colors, fontFamilyWeight, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';

import { ConditionMeter } from './condition-meter';

import type { ConditionSummary } from '@/domains/measurement/model';

interface ConditionSummaryPanelProps {
  year: string;
  dateLabel: string;
  summary: ConditionSummary;
  memoLabel?: string;
  memoCount?: number;
  showMeters?: boolean;
  onDatePress?: () => void;
  onScorePress?: () => void;
  onMemoPress?: () => void;
}

export function ConditionSummaryPanel({
  year,
  dateLabel,
  summary,
  memoLabel = t('home.dailyMemo.emptyLabel'),
  memoCount = 0,
  showMeters = true,
  onDatePress,
  onScorePress,
  onMemoPress,
}: ConditionSummaryPanelProps) {
  return (
    <View>
      <Typography variant="bodyS" color={colors.gray.white}>
        {year}
      </Typography>
      <Pressable style={styles.dateRow} onPress={onDatePress} disabled={onDatePress == null}>
        <Typography variant="bodyM" color={colors.gray.white}>
          {dateLabel}
        </Typography>
        <Icon name="chevronDown" size={20} color={colors.gray.white} />
      </Pressable>
      <Pressable style={styles.memoRow} onPress={onMemoPress} disabled={onMemoPress == null}>
        <Icon name={memoCount > 0 ? 'edit' : 'plus'} size={16} color={colors.alpha.white50} />
        <Typography
          variant="caption"
          color={colors.alpha.white50}
          numberOfLines={1}
          style={styles.memoLabel}
        >
          {memoLabel}
        </Typography>
        {memoCount > 1 ? (
          <Typography variant="caption" color={colors.alpha.white50} style={styles.memoCount}>
            1/{memoCount}
          </Typography>
        ) : null}
      </Pressable>
      <View style={styles.divider} />
      <Pressable
        accessibilityLabel="컨디션 탭으로 이동"
        accessibilityRole="button"
        disabled={onScorePress == null}
        onPress={onScorePress}
      >
        <Typography variant="titleL" color={colors.gray.white} style={styles.conditionScore}>
          {summary.finalScore}
        </Typography>
      </Pressable>
      {showMeters ? (
        <>
          <ConditionMeter
            label="Body"
            value={summary.body.value}
            progress={summary.body.progress}
          />
          <ConditionMeter
            label="Mind"
            value={summary.mind.value}
            progress={summary.mind.progress}
          />
          <ConditionMeter
            label="Sleep"
            value={summary.sleep.value}
            progress={summary.sleep.progress}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  memoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  memoLabel: {
    minWidth: 0,
    flexShrink: 1,
  },
  memoCount: {
    flexShrink: 0,
  },
  divider: {
    width: CONDITION_SUMMARY_PANEL.dividerWidth,
    height: 1,
    marginTop: spacing[1],
    backgroundColor: colors.alpha.white50,
  },
  conditionScore: {
    fontFamily: fontFamilyWeight.medium,
    fontSize: CONDITION_SUMMARY_PANEL.scoreFontSize,
    fontWeight: '500',
    lineHeight: CONDITION_SUMMARY_PANEL.scoreLineHeight,
    letterSpacing: CONDITION_SUMMARY_PANEL.scoreLetterSpacing,
  },
});

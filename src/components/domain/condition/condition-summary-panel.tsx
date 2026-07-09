import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, fontFamilyWeight, spacing } from '@/constants/theme';

import { ConditionMeter } from './condition-meter';

import type { ConditionSummary } from '@/domains/measurement/model';

interface ConditionSummaryPanelProps {
  year: string;
  dateLabel: string;
  summary: ConditionSummary;
  memoLabel?: string;
  onDatePress?: () => void;
  onMemoPress?: () => void;
}

const PANEL_DIVIDER_WIDTH = 107;
const CONDITION_SCORE_FONT_SIZE = 56;
const CONDITION_SCORE_LINE_HEIGHT = 84;
const CONDITION_SCORE_LETTER_SPACING = -4.48;

export function ConditionSummaryPanel({
  year,
  dateLabel,
  summary,
  memoLabel = '날짜별 메모 작성',
  onDatePress,
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
        <Icon name="plus" size={16} color={colors.alpha.white50} />
        <Typography variant="caption" color={colors.alpha.white50}>
          {memoLabel}
        </Typography>
      </Pressable>
      <View style={styles.divider} />
      <Typography variant="titleL" color={colors.gray.white} style={styles.conditionScore}>
        {summary.finalScore}
      </Typography>
      <ConditionMeter label="Body" value={summary.body.value} progress={summary.body.progress} />
      <ConditionMeter label="Mind" value={summary.mind.value} progress={summary.mind.progress} />
      <ConditionMeter label="Sleep" value={summary.sleep.value} progress={summary.sleep.progress} />
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
  divider: {
    width: PANEL_DIVIDER_WIDTH,
    height: 1,
    marginTop: spacing[1],
    backgroundColor: colors.alpha.white50,
  },
  conditionScore: {
    fontFamily: fontFamilyWeight.medium,
    fontSize: CONDITION_SCORE_FONT_SIZE,
    fontWeight: '500',
    lineHeight: CONDITION_SCORE_LINE_HEIGHT,
    letterSpacing: CONDITION_SCORE_LETTER_SPACING,
  },
});

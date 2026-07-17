import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, fontFamilyWeight, spacing } from '@/constants/theme';
import { getConditionHeroCopy } from '@/domains/condition/hero-copy';

interface ConditionHeroProps {
  score: number;
  year: string;
  dateLabel: string;
  onDatePress: () => void;
}

/** 컨디션 메인 전용 점수·날짜·상태 안내 헤더입니다. */
export function ConditionHero({ score, year, dateLabel, onDatePress }: ConditionHeroProps) {
  return (
    <View>
      <View style={styles.scoreRow}>
        <Typography variant="titleL" color={colors.gray.white} style={styles.score}>
          {score}
        </Typography>
        <View style={styles.divider} />
        <Pressable accessibilityRole="button" style={styles.dateColumn} onPress={onDatePress}>
          <Typography variant="bodyS" color={colors.gray.white}>
            {year}
          </Typography>
          <View style={styles.dateRow}>
            <Typography variant="bodyS" color={colors.gray.white}>
              {dateLabel}
            </Typography>
            <Icon name="chevronDown" size={16} color={colors.gray.white} />
          </View>
        </Pressable>
      </View>
      <Typography variant="titleS" color={colors.gray.white} style={styles.message}>
        {getConditionHeroCopy(score)}
      </Typography>
    </View>
  );
}

const SCORE_FONT_SIZE = 56;
const SCORE_LINE_HEIGHT = 84;
const SCORE_LETTER_SPACING = -4.48;

const styles = StyleSheet.create({
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontFamily: fontFamilyWeight.medium,
    fontSize: SCORE_FONT_SIZE,
    fontWeight: '500',
    lineHeight: SCORE_LINE_HEIGHT,
    letterSpacing: SCORE_LETTER_SPACING,
  },
  divider: {
    width: 1,
    height: spacing[16],
    marginLeft: spacing[2],
    backgroundColor: colors.alpha.white50,
  },
  dateColumn: {
    gap: spacing[1],
    marginLeft: spacing[3],
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  message: {
    marginTop: spacing[3],
  },
});

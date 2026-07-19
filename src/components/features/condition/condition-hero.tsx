import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { ViewModeButton } from '@/components/ui/ViewModeButton';
import { CONDITION_HERO_SCORE } from '@/constants/condition-ui';
import { colors, fontFamilyWeight, spacing } from '@/constants/theme';
import { getConditionHeroCopy } from '@/domains/condition/hero-copy';

import type { ViewModeButtonProps } from '@/components/ui/ViewModeButton';

interface ConditionHeroProps {
  score: number;
  year: string;
  dateLabel: string;
  viewMode: ViewModeButtonProps['mode'];
  onDatePress: () => void;
  onViewModePress: () => void;
}

/** 컨디션 메인 전용 점수·날짜·상태 안내 헤더입니다. */
export function ConditionHero({
  score,
  year,
  dateLabel,
  viewMode,
  onDatePress,
  onViewModePress,
}: ConditionHeroProps) {
  return (
    <View>
      <View style={styles.scoreRow}>
        <Typography variant="titleL" color={colors.gray.white} style={styles.score}>
          {score}
        </Typography>
        <View style={styles.divider} />
        <View style={styles.rightColumn}>
          <ViewModeButton
            mode={viewMode}
            accessibilityLabel="보기 방식 변경"
            onPress={onViewModePress}
          />
          <Pressable accessibilityRole="button" style={styles.dateColumn} onPress={onDatePress}>
            <Typography variant="bodyS" color={colors.gray.white}>
              {year}
            </Typography>
            <View style={styles.dateRow}>
              <Typography variant="bodyM" color={colors.gray.white}>
                {dateLabel}
              </Typography>
              <Icon name="chevronDown" size={16} color={colors.gray.white} />
            </View>
          </Pressable>
        </View>
      </View>
      <Typography variant="titleS" color={colors.gray.white} style={styles.message}>
        {getConditionHeroCopy(score)}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontFamily: fontFamilyWeight.medium,
    fontSize: CONDITION_HERO_SCORE.fontSize,
    fontWeight: '500',
    lineHeight: CONDITION_HERO_SCORE.lineHeight,
    letterSpacing: CONDITION_HERO_SCORE.letterSpacing,
  },
  divider: {
    width: 1,
    height: 72,
    marginLeft: spacing[2],
    backgroundColor: colors.alpha.white50,
  },
  rightColumn: {
    marginLeft: spacing[3],
    gap: spacing[2],
    alignItems: 'flex-start',
  },
  dateColumn: {
    gap: spacing[1],
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  message: {
    marginTop: spacing[2],
    fontFamily: fontFamilyWeight.bold,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 33.6,
    letterSpacing: -0.48,
  },
});

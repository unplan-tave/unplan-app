import { useId } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { formatSleepCardTitle, formatSleepTimeRange, sleepKindLabel } from '@/domains/sleep/format';

import type { SleepDayRecord } from '@/domains/sleep/model';

interface SleepRecordCardProps {
  record: SleepDayRecord;
  /** 편집 모드에서 선택된 카드는 파란 테두리로 강조합니다. */
  selected?: boolean;
  onPress?: () => void;
}

/** 기록 내역 화면의 유리질 수면 카드입니다. */
export function SleepRecordCard({ record, selected = false, onPress }: SleepRecordCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <RadialGlow />
      <View style={styles.top}>
        <Typography variant="caption" color={colors.gray[400]}>
          {sleepKindLabel(record.kind)}
        </Typography>
        <Typography variant="bodyM" color={colors.gray[600]}>
          {formatSleepTimeRange(record)}
        </Typography>
      </View>
      <View style={styles.bottom}>
        <Typography variant="titleM" color={colors.gray[900]}>
          {formatSleepCardTitle(record)}
        </Typography>
        <Typography variant="caption" color={colors.gray[600]}>
          {record.comment}
        </Typography>
      </View>
    </Pressable>
  );
}

/** 카드 중앙의 은은한 파란 방사형 광. viewBox로 카드 전체를 채웁니다. */
function RadialGlow() {
  const gradientId = useId().replace(/:/g, '');

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      pointerEvents="none"
    >
      <Defs>
        <RadialGradient id={gradientId} cx="50%" cy="50%" rx="70%" ry="70%">
          <Stop offset="0" stopColor={colors.primary} stopOpacity={0.32} />
          <Stop offset="1" stopColor={colors.gray.white} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100" height="100" fill={`url(#${gradientId})`} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    justifyContent: 'center',
    gap: spacing[2],
    padding: spacing[5],
    borderRadius: radius.panel,
    borderWidth: 1,
    borderColor: colors.gray.white,
    backgroundColor: colors.alpha.white50,
    shadowColor: colors.shadow.blueGray,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 48,
    elevation: 6,
  },
  cardSelected: {
    borderColor: colors.primary,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  bottom: {
    gap: spacing[1],
  },
  pressed: {
    opacity: 0.85,
  },
});

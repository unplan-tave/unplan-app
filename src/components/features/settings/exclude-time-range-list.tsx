import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { formatClockLabel } from '@/domains/ai-recommendation/model';
import { t } from '@/lib/i18n';

import type { MinuteRange } from '@/domains/ai-recommendation/model';

const REMOVE_BUTTON_SIZE = 24;
const TIME_CHIP_HEIGHT = 40;

interface ExcludeTimeRangeListProps {
  ranges: MinuteRange[];
  onEditRange: (index: number) => void;
  onRemoveRange: (index: number) => void;
  onAddRange: () => void;
}

export function ExcludeTimeRangeList({
  ranges,
  onEditRange,
  onRemoveRange,
  onAddRange,
}: ExcludeTimeRangeListProps) {
  return (
    <View style={styles.container}>
      {ranges.map((range, index) => (
        <View key={`${range.startMinutes}-${range.endMinutes}`} style={styles.rangeRow}>
          <Pressable
            accessibilityLabel={t('settings.recommendation.removeTimeRange')}
            accessibilityRole="button"
            hitSlop={8}
            style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
            onPress={() => onRemoveRange(index)}
          >
            <Icon name="minus" size={16} color={colors.primary} />
          </Pressable>
          <View style={styles.rangeChips}>
            <TimeChip minutes={range.startMinutes} onPress={() => onEditRange(index)} />
            <Typography variant="bodyM" color={colors.gray[600]}>
              ~
            </Typography>
            <TimeChip minutes={range.endMinutes} onPress={() => onEditRange(index)} />
          </View>
        </View>
      ))}
      <Pressable
        accessibilityLabel={t('settings.recommendation.addTimeRange')}
        accessibilityRole="button"
        style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
        onPress={onAddRange}
      >
        <Icon name="plus" size={20} color={colors.primary} />
        <Typography variant="bodyM" color={colors.primary}>
          {t('settings.recommendation.addTimeRange')}
        </Typography>
      </Pressable>
    </View>
  );
}

function TimeChip({ minutes, onPress }: { minutes: number; onPress: () => void }) {
  const label = formatClockLabel(minutes);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      style={({ pressed }) => [styles.timeChip, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Typography variant="titleS" color={colors.gray[700]}>
        {label}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[4],
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  removeButton: {
    width: REMOVE_BUTTON_SIZE,
    height: REMOVE_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  rangeChips: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  timeChip: {
    flex: 1,
    maxWidth: 142,
    height: TIME_CHIP_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius['2xs'],
    backgroundColor: colors.gray[200],
  },
  addButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.72,
  },
});

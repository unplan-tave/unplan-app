import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius } from '@/constants/theme';

import type { TimeRange } from '@/state/onboarding/model';

interface ActivityTimeRailProps {
  label: string;
  required?: boolean;
  ranges: TimeRange[];
  onToggleHour: (hour: number) => void;
}

const HOURS = Array.from({ length: 24 }, (_, index) => (21 + index) % 24);

export function ActivityTimeRail({
  label,
  required = false,
  ranges,
  onToggleHour,
}: ActivityTimeRailProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Typography variant="bodyM" color={colors.gray[700]}>
          {label}
        </Typography>
        {required ? (
          <Typography variant="caption" color={colors.secondary}>
            필수 표시
          </Typography>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View>
          <View style={styles.hourLabels}>
            {HOURS.map((hour) => (
              <Typography
                key={`label-${hour}`}
                variant="caption"
                color={colors.gray[500]}
                style={styles.hourLabel}
              >
                {hour}시
              </Typography>
            ))}
          </View>
          <View style={styles.blocks}>
            {HOURS.map((hour) => {
              const selected = ranges.some((range) => range.startHour === hour);

              return (
                <Pressable
                  key={hour}
                  accessibilityLabel={`${label} ${hour}시`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.block, selected && styles.selectedBlock]}
                  onPress={() => onToggleHour(hour)}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  scrollContent: {
    paddingLeft: 0,
    paddingRight: 32,
  },
  hourLabels: {
    flexDirection: 'row',
  },
  hourLabel: {
    width: 40,
  },
  blocks: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: radius['2xs'],
  },
  block: {
    width: 40,
    height: 40,
    borderRightWidth: 1,
    borderRightColor: colors.alpha.white50,
    backgroundColor: colors.gray[200],
  },
  selectedBlock: {
    backgroundColor: colors.primary,
  },
});

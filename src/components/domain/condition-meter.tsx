import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

interface ConditionMeterProps {
  label: string;
  value: string;
  progress: number;
}

export function ConditionMeter({ label, value, progress }: ConditionMeterProps) {
  return (
    <View style={styles.conditionMeter}>
      <View style={styles.conditionMeterLabel}>
        <Typography variant="bodyS" color={colors.gray.white}>
          {label}
        </Typography>
        <Typography variant="bodyS" color={colors.gray.white}>
          |
        </Typography>
        <Typography variant="bodyS" color={colors.gray.white}>
          {value}
        </Typography>
      </View>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conditionMeter: {
    gap: 2,
    marginBottom: spacing[1],
  },
  conditionMeterLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  meterTrack: {
    width: 88,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.alpha.white20,
  },
  meterFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.alpha.white80,
  },
});

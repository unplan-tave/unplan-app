import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/constants/theme';

import { type ProgressBarProps } from './progressBar.types';

export function ProgressBar({ value, width = 240, style }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const visibleValue = clampedValue === 0 ? 4.17 : clampedValue;

  return (
    <View style={[styles.track, { width }, style]}>
      <View style={[styles.fill, { width: `${visibleValue}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    overflow: 'hidden',
    borderRadius: 19,
    backgroundColor: colors.gray[200],
  },
  fill: {
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
});

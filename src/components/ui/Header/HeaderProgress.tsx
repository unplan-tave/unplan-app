import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { colors } from '@/constants/theme';

import { type HeaderProgressProps } from './header.types';

export function HeaderProgress({ progress, onBackPress, style }: HeaderProgressProps) {
  const clampedProgress = Math.max(0, Math.min(progress, 1));

  return (
    <View style={[styles.container, style]}>
      <Pressable
        accessibilityLabel="이전 화면으로 이동"
        accessibilityRole="button"
        hitSlop={12}
        style={styles.backButton}
        onPress={onBackPress}
      >
        <Icon name="arrowLeft" size={24} color={colors.gray[400]} />
      </Pressable>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clampedProgress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 12,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    width: 240,
    height: 4,
    overflow: 'hidden',
    borderRadius: 19,
    backgroundColor: colors.gray[200],
  },
  fill: {
    height: '100%',
    borderRadius: 19,
    backgroundColor: colors.primary,
  },
});

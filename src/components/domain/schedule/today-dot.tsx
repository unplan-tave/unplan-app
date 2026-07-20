import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/constants/theme';

/** 일정 캘린더에서 오늘 날짜를 표시합니다. */
export function TodayDot() {
  return <View pointerEvents="none" style={styles.dot} />;
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    bottom: spacing[1],
    width: spacing[1],
    height: spacing[1],
    borderRadius: spacing[1] / 2,
    backgroundColor: colors.gray.white,
  },
});

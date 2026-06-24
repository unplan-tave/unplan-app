import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius } from '@/constants/theme';

import { type StatusBarProps } from './statusBar.types';

export function StatusBar({
  time = '9:41',
  darkContent = false,
  showDynamicIsland = true,
  style,
}: StatusBarProps) {
  const contentColor = darkContent ? colors.gray[900] : colors.gray.white;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.statusRow}>
        <Typography variant="bodyM" color={contentColor} align="center" style={styles.time}>
          {time}
        </Typography>
        <View style={styles.levels}>
          <View style={[styles.cellular, { backgroundColor: contentColor }]} />
          <View style={[styles.wifi, { borderColor: contentColor }]} />
          <View style={[styles.battery, { borderColor: contentColor }]}>
            <View style={[styles.batteryFill, { backgroundColor: contentColor }]} />
          </View>
        </View>
      </View>
      {showDynamicIsland ? <View style={styles.dynamicIsland} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 402,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  statusRow: {
    position: 'absolute',
    top: 21,
    left: 24,
    right: 24,
    height: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  time: {
    width: 90,
    fontWeight: '600',
  },
  levels: {
    width: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 7,
  },
  cellular: {
    width: 19,
    height: 12,
    borderRadius: 2,
  },
  wifi: {
    width: 17,
    height: 12,
    borderTopWidth: 3,
    borderRadius: 8,
  },
  battery: {
    width: 27,
    height: 13,
    justifyContent: 'center',
    padding: 2,
    borderWidth: 1.2,
    borderRadius: 4,
  },
  batteryFill: {
    width: 18,
    height: 7,
    borderRadius: 2,
  },
  dynamicIsland: {
    width: 124,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.gray[900],
  },
});

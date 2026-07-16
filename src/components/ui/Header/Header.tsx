import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { type HeaderProps } from './header.types';

export function Header({ title, subtitle, left, right, style }: HeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.side}>{left}</View>
      <View style={styles.titleBox}>
        {title ? (
          <Typography variant="titleS" color={colors.gray[800]} align="center" numberOfLines={1}>
            {title}
          </Typography>
        ) : null}
        {subtitle ? (
          <Typography variant="caption" color={colors.gray[500]} align="center" numberOfLines={1}>
            {subtitle}
          </Typography>
        ) : null}
      </View>
      <View style={styles.side}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  side: {
    width: 56,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBox: {
    flex: 1,
    minWidth: 0,
  },
});

import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius } from '@/constants/theme';

import { type HeaderStatusSummaryProps } from './header.types';

export function HeaderStatusSummary({ label, value, caption, style }: HeaderStatusSummaryProps) {
  return (
    <View style={[styles.container, style]}>
      <Typography variant="caption" color={colors.gray[500]}>
        {label}
      </Typography>
      <Typography variant="titleM" color={colors.gray[800]}>
        {String(value)}
      </Typography>
      {caption ? (
        <Typography variant="caption" color={colors.gray[400]}>
          {caption}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.gray[50],
  },
});

import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { type InputRowProps } from './input.types';

export function InputRow({ label, children, style }: InputRowProps) {
  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Typography variant="bodyS" color={colors.gray[600]} style={styles.label}>
          {label}
        </Typography>
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    paddingHorizontal: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

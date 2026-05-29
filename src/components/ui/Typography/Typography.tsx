import { StyleSheet, Text } from 'react-native';

import { colors, typography } from '@/constants/theme';

import { type TypographyProps } from './Typography.types';

export function Typography({
  variant = 'bodyM',
  color = colors.text.primary,
  align = 'left',
  style,
  ...props
}: TypographyProps) {
  return (
    <Text
      style={[styles.base, typography[variant], { color, textAlign: align }, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false, // Android 상하 여백 제거
  },
});

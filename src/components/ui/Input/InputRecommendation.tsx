import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius } from '@/constants/theme';

import { type InputRecommendationProps } from './input.types';

export function InputRecommendation({
  label,
  accessibilityLabel,
  style,
  ...props
}: InputRecommendationProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      style={({ pressed }) => [styles.container, pressed && styles.pressed, style]}
      {...props}
    >
      <Icon name="done" size={16} color={colors.primary} />
      <Typography variant="caption" color={colors.gray[600]} numberOfLines={1}>
        {label}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    backgroundColor: colors.gray[50],
  },
  pressed: {
    opacity: 0.72,
  },
});

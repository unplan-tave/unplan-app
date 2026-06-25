import { Pressable, StyleSheet } from 'react-native';

import { colors, radius } from '@/constants/theme';

import { type CardProps } from './card.types';

export function Card({
  children,
  disabled = false,
  selected = false,
  variant = 'solid',
  style,
  ...props
}: CardProps) {
  return (
    <Pressable
      accessibilityRole={props.accessibilityRole ?? 'button'}
      accessibilityState={{ ...props.accessibilityState, disabled, selected }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'glass' && styles.glass,
        selected && styles.selected,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.gray.white,
  },
  glass: {
    borderRadius: radius.md,
    borderColor: colors.gray.white,
    backgroundColor: colors.alpha.white50,
    shadowColor: colors.shadow.blueGray,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 48,
    elevation: 6,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.alpha.primary20,
  },
  disabled: {
    borderColor: colors.gray[200],
    backgroundColor: colors.alpha.white20,
  },
  pressed: {
    opacity: 0.72,
  },
});

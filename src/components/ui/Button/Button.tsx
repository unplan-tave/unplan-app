import { Pressable, StyleSheet } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius } from '@/constants/theme';

import { type ButtonProps } from './button.types';

export function Button({
  label,
  variant = 'default',
  fullWidth = false,
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      {...props}
    >
      <Typography
        variant="bodyM"
        color={
          disabled ? colors.gray[300] : variant === 'primary' ? colors.gray.white : colors.gray[800]
        }
        align="center"
        style={textStyle}
      >
        {label}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    maxWidth: 351,
    height: 40,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
  },
  default: {
    backgroundColor: colors.alpha.white50,
    borderWidth: 1,
    borderColor: colors.gray.white,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  glass: {
    backgroundColor: colors.alpha.white10,
  },
  fullWidth: {
    width: '100%',
    maxWidth: '100%',
  },
  disabled: {
    backgroundColor: colors.gray[200],
    borderColor: colors.gray[200],
  },
  pressed: {
    opacity: 0.72,
  },
});

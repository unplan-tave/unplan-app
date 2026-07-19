import { Pressable, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

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
  const isConditionButton =
    variant === 'conditionSecondary' ||
    variant === 'conditionPrimary' ||
    variant === 'conditionRecommendationSecondary' ||
    variant === 'conditionRecommendationPrimary';
  const isRecommendationButton =
    variant === 'conditionRecommendationSecondary' || variant === 'conditionRecommendationPrimary';
  const isConditionPrimary =
    variant === 'conditionPrimary' || variant === 'conditionRecommendationPrimary';

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
      {isConditionPrimary && !disabled ? (
        <Svg
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          width="100%"
          height="100%"
          preserveAspectRatio="none"
        >
          <Defs>
            <RadialGradient id="conditionPrimaryButton" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={colors.primary} stopOpacity={0.2} />
              <Stop offset="1" stopColor={colors.primary} stopOpacity={1} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#conditionPrimaryButton)" />
        </Svg>
      ) : null}
      <Typography
        variant={isRecommendationButton ? 'titleS' : isConditionButton ? 'bodyS' : 'bodyM'}
        color={
          disabled
            ? colors.gray[300]
            : variant === 'conditionSecondary'
              ? colors.gray[600]
              : variant === 'primary' || isConditionPrimary
                ? colors.gray.white
                : colors.gray[800]
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
    overflow: 'hidden',
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
  conditionSecondary: {
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.gray[200],
  },
  conditionPrimary: {
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.alpha.transparent,
  },
  conditionRecommendationSecondary: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.gray.white,
  },
  conditionRecommendationPrimary: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.alpha.transparent,
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

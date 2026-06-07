import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Typography } from '@/components/ui/Typography';
import { colors, radius } from '@/constants/theme';

import { type BottomCTAProps } from './bottomCTA.types';

export function BottomCTA({
  label = '확인',
  caption = '다음에 할래요',
  disabled = false,
  variant = 'default',
  style,
  textStyle,
  accessibilityLabel,
  ...props
}: BottomCTAProps) {
  const isPrimary = variant === 'primary';
  const textColor = disabled ? colors.gray[300] : isPrimary ? colors.gray.white : colors.gray[800];

  return (
    <View style={[styles.container, style]}>
      <Pressable
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        style={({ pressed }) => [
          styles.button,
          isPrimary && styles.primaryButton,
          disabled && styles.disabledButton,
          pressed && !disabled && styles.pressed,
        ]}
        {...props}
      >
        {isPrimary && !disabled ? <PrimaryButtonFill /> : null}
        <Typography variant="titleL" color={textColor} align="center" style={textStyle}>
          {label}
        </Typography>
      </Pressable>

      {caption != null ? (
        <Typography variant="bodyS" color={colors.gray[500]} align="center" style={styles.caption}>
          {caption}
        </Typography>
      ) : null}
    </View>
  );
}

function PrimaryButtonFill() {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
      <Defs>
        <RadialGradient id="ctaGradient" cx="50%" cy="50%" rx="70%" ry="70%">
          <Stop offset="0" stopColor={colors.primary} stopOpacity={0.5} />
          <Stop offset="1" stopColor={colors.primary} stopOpacity={1} />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#ctaGradient)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 353,
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 6,
  },
  button: {
    width: '100%',
    height: 60,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.alpha.white50,
    borderWidth: 1,
    borderColor: colors.gray.white,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  disabledButton: {
    backgroundColor: colors.gray[200],
    borderColor: colors.gray[200],
  },
  caption: {
    width: '100%',
  },
  pressed: {
    opacity: 0.72,
  },
});

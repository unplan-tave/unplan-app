import { useId } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Typography } from '@/components/ui/Typography';
import { colors, radius } from '@/constants/theme';

import { type BottomCTAProps } from './bottomCTA.types';

const BUTTON_HEIGHT = 60;
const BUTTON_RADIUS = BUTTON_HEIGHT / 2;

export function BottomCTA({
  label = '확인',
  caption = '다음에 할래요',
  onCaptionPress,
  disabled = false,
  captionDisabled = false,
  variant = 'default',
  style,
  textStyle,
  accessibilityLabel,
  ...props
}: BottomCTAProps) {
  const isPrimary = variant === 'primary';
  const isRecord = variant === 'record';
  const textColor = disabled
    ? colors.gray[300]
    : isPrimary
      ? colors.gray.white
      : isRecord
        ? colors.primary
        : colors.gray[800];
  const captionContent =
    caption != null ? (
      <Typography variant="bodyS" color={colors.gray[500]} align="center" style={styles.caption}>
        {caption}
      </Typography>
    ) : null;

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
          isRecord && styles.recordButton,
          disabled && styles.disabledButton,
          pressed && !disabled && styles.pressed,
        ]}
        {...props}
      >
        {isPrimary && !disabled ? (
          <View pointerEvents="none" style={styles.primaryFill}>
            <PrimaryButtonFill />
          </View>
        ) : null}
        <Typography
          variant={isRecord ? 'titleS' : 'titleL'}
          color={textColor}
          align="center"
          style={textStyle}
        >
          {label}
        </Typography>
      </Pressable>

      {captionContent ? (
        onCaptionPress ? (
          <Pressable
            accessibilityLabel={caption ?? undefined}
            accessibilityRole="button"
            accessibilityState={{ disabled: captionDisabled }}
            disabled={captionDisabled}
            hitSlop={8}
            style={({ pressed }) => pressed && !captionDisabled && styles.captionPressed}
            onPress={onCaptionPress}
          >
            {captionContent}
          </Pressable>
        ) : (
          captionContent
        )
      ) : null}
    </View>
  );
}

function PrimaryButtonFill() {
  const gradientId = useId().replace(/:/g, '');

  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
      <Defs>
        <RadialGradient
          id={gradientId}
          cx="50%"
          cy="50%"
          rx="50%"
          ry="50%"
          gradientUnits="objectBoundingBox"
        >
          <Stop offset="0" stopColor={colors.primary} stopOpacity={0.5} />
          <Stop offset="1" stopColor={colors.primary} stopOpacity={1} />
        </RadialGradient>
      </Defs>
      <Rect
        width="100%"
        height="100%"
        rx={BUTTON_RADIUS}
        ry={BUTTON_RADIUS}
        fill={`url(#${gradientId})`}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 353,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 6,
  },
  button: {
    width: '100%',
    height: BUTTON_HEIGHT,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BUTTON_RADIUS,
    backgroundColor: colors.alpha.white50,
    borderWidth: 1,
    borderColor: colors.gray.white,
  },
  primaryFill: {
    ...StyleSheet.absoluteFill,
    borderRadius: BUTTON_RADIUS,
    overflow: 'hidden',
  },
  primaryButton: {
    backgroundColor: colors.alpha.transparent,
    borderWidth: 0,
  },
  recordButton: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.gray.white,
    borderWidth: 0,
  },
  disabledButton: {
    backgroundColor: colors.gray[200],
    borderColor: colors.gray[200],
  },
  caption: {
    width: '100%',
  },
  captionPressed: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.72,
  },
});

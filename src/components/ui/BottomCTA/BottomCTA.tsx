import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { type BottomCTAProps } from './bottomCTA.types';

export function BottomCTA({
  label = '확인',
  caption = '다음에 할래요',
  disabled = false,
  style,
  accessibilityLabel,
  ...props
}: BottomCTAProps) {
  return (
    <View style={[styles.container, style]}>
      <Pressable
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="button"
        disabled={disabled}
        style={({ pressed }) => [
          styles.button,
          disabled && styles.disabledButton,
          pressed && !disabled && styles.pressed,
        ]}
        {...props}
      >
        <Typography
          variant="titleL"
          color={disabled ? colors.gray[300] : colors.gray[800]}
          align="center"
        >
          {label}
        </Typography>
      </Pressable>

      {caption ? (
        <Typography variant="bodyS" color={colors.gray[500]} align="center" style={styles.caption}>
          {caption}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 353,
    alignItems: 'center',
    gap: 6,
  },
  button: {
    width: '100%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 65,
    backgroundColor: colors.alpha.white50,
    borderWidth: 1,
    borderColor: colors.gray.white,
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

import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius } from '@/constants/theme';

import { type TimeStepperProps } from './timeStepper.types';

export function TimeStepper({
  label = '10분 추가',
  alertMessage,
  disabled = false,
  onDecrease,
  onIncrease,
  style,
}: TimeStepperProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.control}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="시간 줄이기"
          disabled={disabled}
          hitSlop={8}
          onPress={onDecrease}
          style={({ pressed }) => pressed && !disabled && styles.pressed}
        >
          <Icon name="minus" size={20} color={colors.gray[700]} disabled={disabled} />
        </Pressable>
        <Typography
          variant="titleM"
          color={disabled ? colors.gray[300] : colors.gray[700]}
          numberOfLines={1}
        >
          {label}
        </Typography>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="시간 늘리기"
          disabled={disabled}
          hitSlop={8}
          onPress={onIncrease}
          style={({ pressed }) => pressed && !disabled && styles.pressed}
        >
          <Icon name="plus" size={20} color={colors.gray[700]} disabled={disabled} />
        </Pressable>
      </View>

      {alertMessage ? (
        <Typography variant="caption" color={colors.secondary} align="center">
          {alertMessage}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.alpha.white70,
  },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  pressed: {
    opacity: 0.72,
  },
});

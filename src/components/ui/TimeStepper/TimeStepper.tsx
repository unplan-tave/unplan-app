import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

import { type TimeStepperProps } from './timeStepper.types';

const ACTION_BUTTON_SIZE = spacing[6];

export function TimeStepper({
  label = '10분 추가',
  alertMessage,
  disabled = false,
  variant = 'plain',
  tone = 'default',
  decreaseDisabled,
  increaseDisabled,
  onDecrease,
  onIncrease,
  style,
}: TimeStepperProps) {
  const isAction = variant === 'action';
  const isError = tone === 'error';
  const decreaseOff = decreaseDisabled ?? disabled;
  const increaseOff = increaseDisabled ?? disabled;
  const labelColor = isError ? colors.secondary : disabled ? colors.gray[300] : colors.gray[700];

  return (
    <View
      style={[
        styles.container,
        isAction && styles.containerAction,
        isAction && isError && styles.containerError,
        style,
      ]}
    >
      <View style={[styles.control, isAction && styles.controlAction]}>
        <StepperButton
          accessibilityLabel="시간 줄이기"
          action={isAction}
          tone={tone}
          role="decrease"
          disabled={decreaseOff}
          onPress={onDecrease}
        />
        <Typography variant="titleM" color={labelColor} numberOfLines={1}>
          {label}
        </Typography>
        <StepperButton
          accessibilityLabel="시간 늘리기"
          action={isAction}
          tone={tone}
          role="increase"
          disabled={increaseOff}
          onPress={onIncrease}
        />
      </View>

      {alertMessage ? (
        <Typography variant="caption" color={colors.secondary} align="center">
          {alertMessage}
        </Typography>
      ) : null}
    </View>
  );
}

function StepperButton({
  accessibilityLabel,
  action,
  tone,
  role,
  disabled,
  onPress,
}: {
  accessibilityLabel: string;
  action: boolean;
  tone: TimeStepperProps['tone'];
  role: 'decrease' | 'increase';
  disabled?: boolean;
  onPress?: TimeStepperProps['onDecrease'];
}) {
  const iconName = role === 'decrease' ? 'minus' : 'plus';

  if (!action) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        hitSlop={8}
        onPress={onPress}
        style={({ pressed }) => (pressed && !disabled ? styles.pressed : undefined)}
      >
        <Icon name={iconName} size={20} color={colors.gray[700]} disabled={disabled} />
      </Pressable>
    );
  }

  const circleColor =
    tone === 'error' ? colors.secondary : role === 'increase' ? colors.primary : colors.gray[300];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        { backgroundColor: circleColor },
        disabled && styles.actionButtonDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Icon name={iconName} size={16} color={colors.gray.white} />
    </Pressable>
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
  containerAction: {
    alignSelf: 'stretch',
    paddingHorizontal: spacing[4],
    borderRadius: radius.panel,
  },
  containerError: {
    borderWidth: 1,
    borderColor: colors.secondary,
    backgroundColor: colors.alpha.secondary10,
  },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  controlAction: {
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  actionButton: {
    width: ACTION_BUTTON_SIZE,
    height: ACTION_BUTTON_SIZE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.72,
  },
});

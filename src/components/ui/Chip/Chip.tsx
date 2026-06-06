import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { type ChipProps } from './chip.types';

export function Chip({
  label,
  selected = false,
  iconName,
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
  ...props
}: ChipProps) {
  const contentColor = selected ? colors.primary : colors.gray[700];

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        selected && styles.selected,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      {...props}
    >
      {iconName ? (
        <Icon name={iconName} size={20} color={disabled ? colors.gray[300] : contentColor} />
      ) : null}
      <Typography
        variant="bodyS"
        color={disabled ? colors.gray[300] : contentColor}
        align="center"
        style={textStyle}
      >
        {label}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 39,
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 0,
    borderRadius: 33,
    backgroundColor: colors.gray.white,
    borderWidth: 1,
    borderColor: colors.gray.white,
  },
  selected: {
    backgroundColor: 'rgba(36,141,254,0.2)',
    borderColor: colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.72,
  },
});

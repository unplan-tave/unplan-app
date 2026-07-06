import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

const CHECKBOX_SIZE = 24;
const CHECK_ICON_SIZE = 16;

interface SettingsCheckboxRowProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export function SettingsCheckboxRow({
  label,
  checked,
  disabled = false,
  onToggle,
}: SettingsCheckboxRowProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onToggle}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Icon name="done" size={CHECK_ICON_SIZE} color={colors.gray.white} /> : null}
      </View>
      <Typography variant="bodyM" color={colors.gray[600]}>
        {label}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  checkbox: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius['2xs'],
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    backgroundColor: colors.gray.white,
  },
  checkboxChecked: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  pressed: {
    opacity: 0.72,
  },
});

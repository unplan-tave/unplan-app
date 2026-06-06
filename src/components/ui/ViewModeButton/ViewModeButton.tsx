import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius } from '@/constants/theme';

import { type ViewModeButtonProps } from './viewModeButton.types';

const VIEW_MODE_LABEL: Record<ViewModeButtonProps['mode'], string> = {
  weekly: 'weekly view',
  monthly: 'monthly view',
  daily: 'daily view',
};

export function ViewModeButton({
  mode,
  label = VIEW_MODE_LABEL[mode],
  style,
  accessibilityLabel,
  ...props
}: ViewModeButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      style={({ pressed }) => [styles.container, pressed ? styles.pressed : undefined, style]}
      {...props}
    >
      <Typography variant="caption" color={colors.gray.white} align="right">
        {label}
      </Typography>
      <Icon name="maximize" size={9} color={colors.gray.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 21.2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius['2xs'],
    backgroundColor: colors.alpha.white10,
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.432,
  },
});

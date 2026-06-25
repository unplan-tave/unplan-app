import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { colors, radius } from '@/constants/theme';

import { type GNBAddButtonProps } from './gnb.types';

export function GNBAddButton({ style, accessibilityLabel = '추가', ...props }: GNBAddButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
      {...props}
    >
      <Icon name="plus" size={30} color={colors.gray[600]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.alpha.white88,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 6,
  },
  pressed: {
    opacity: 0.72,
  },
});

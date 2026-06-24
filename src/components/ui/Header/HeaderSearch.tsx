import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { colors } from '@/constants/theme';

import { type HeaderSearchProps } from './header.types';

export function HeaderSearch({ label = '검색', style, ...props }: HeaderSearchProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
      {...props}
    >
      <Icon name="search" size={22} color={colors.gray[600]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});

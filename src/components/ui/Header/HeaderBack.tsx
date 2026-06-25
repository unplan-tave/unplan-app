import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { colors } from '@/constants/theme';

import { type HeaderBackProps } from './header.types';

export function HeaderBack({
  accessibilityLabel = '이전 화면으로 이동',
  style,
  ...props
}: HeaderBackProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
      {...props}
    >
      <Icon name="arrowLeft" size={24} color={colors.gray[600]} />
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

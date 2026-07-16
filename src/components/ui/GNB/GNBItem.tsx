import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { type GNBItemProps } from './gnb.types';

export function GNBItem({ item, selected = false, style, ...props }: GNBItemProps) {
  const color = colors.gray.white;

  return (
    <Pressable
      accessibilityLabel={item.label}
      accessibilityRole="tab"
      accessibilityState={{ selected, disabled: item.disabled }}
      disabled={item.disabled}
      style={({ pressed }) => [
        styles.container,
        selected && styles.selected,
        item.disabled && styles.disabled,
        pressed && !item.disabled && styles.pressed,
        style,
      ]}
      {...props}
    >
      {item.iconName ? <Icon name={item.iconName} size={40} color={color} /> : null}
      <Typography
        variant="caption"
        color={color}
        align="center"
        numberOfLines={1}
        style={styles.label}
      >
        {item.label}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    // 라벨(`card list`, `condition`)이 잘리지 않도록 고정 폭 대신 최소 폭을 둡니다.
    minWidth: 40,
    minHeight: 52,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  selected: {
    opacity: 1,
  },
  label: {
    opacity: 0.8,
    textShadowColor: colors.alpha.black35,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.72,
  },
});

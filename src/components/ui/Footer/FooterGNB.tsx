import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { type FooterGNBProps } from './footer.types';

export function FooterGNB({ items, value, onChange, style }: FooterGNBProps) {
  return (
    <View style={[styles.container, style]}>
      {items.map((item) => {
        const selected = item.value === value;
        const color = selected ? colors.primary : colors.gray[500];

        return (
          <Pressable
            key={item.value}
            accessibilityLabel={item.label}
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled: item.disabled }}
            disabled={item.disabled}
            style={({ pressed }) => [styles.item, pressed && !item.disabled && styles.pressed]}
            onPress={() => onChange?.(item.value)}
          >
            {item.iconName ? <Icon name={item.iconName} size={22} color={color} /> : null}
            <Typography variant="caption" color={color} align="center" numberOfLines={1}>
              {item.label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  item: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  pressed: {
    opacity: 0.72,
  },
});

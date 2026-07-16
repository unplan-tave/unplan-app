import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { BottomSheet } from './BottomSheet';
import { type ActionListBottomSheetProps } from './bottomSheet.types';

export function ActionListBottomSheet({ items, onClose, ...props }: ActionListBottomSheetProps) {
  return (
    <BottomSheet onClose={onClose} {...props}>
      <View style={styles.list}>
        {items.map((item) => (
          <Pressable
            key={item.label}
            accessibilityLabel={item.label}
            accessibilityRole="button"
            accessibilityState={{ disabled: item.disabled }}
            disabled={item.disabled}
            style={({ pressed }) => [
              styles.item,
              item.disabled && styles.disabled,
              pressed && !item.disabled && styles.pressed,
            ]}
            onPress={() => {
              item.onPress?.();
              onClose?.();
            }}
          >
            <Typography
              variant="bodyM"
              color={item.destructive ? colors.secondary : colors.gray[800]}
            >
              {item.label}
            </Typography>
            {item.caption ? (
              <Typography variant="caption" color={colors.gray[500]}>
                {item.caption}
              </Typography>
            ) : null}
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  item: {
    minHeight: 52,
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 8,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.72,
  },
});

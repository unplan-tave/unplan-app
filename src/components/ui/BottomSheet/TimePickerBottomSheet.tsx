import { Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { BottomSheet } from './BottomSheet';
import { type TimePickerBottomSheetProps } from './bottomSheet.types';

export function TimePickerBottomSheet({
  value,
  options,
  onSelect,
  selectedTextStyle,
  onClose,
  ...props
}: TimePickerBottomSheetProps) {
  const { height } = useWindowDimensions();

  return (
    <BottomSheet onClose={onClose} {...props}>
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        style={{ maxHeight: height * 0.48 }}
      >
        {options.map((option) => {
          const selected = option === value;

          return (
            <Pressable
              key={option}
              accessibilityLabel={option}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={({ pressed }) => [styles.option, pressed && styles.pressed]}
              onPress={() => {
                onSelect?.(option);
                onClose?.();
              }}
            >
              <Typography
                variant="bodyM"
                color={selected ? colors.primary : colors.gray[700]}
                style={selected && selectedTextStyle}
              >
                {option}
              </Typography>
              {selected ? <Icon name="done" color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 4,
    paddingBottom: 4,
  },
  option: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.72,
  },
});

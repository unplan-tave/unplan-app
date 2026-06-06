import { ScrollView, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';

import { type ChipGroupProps } from './chipGroup.types';

export function ChipGroup({
  items,
  value,
  multiple = false,
  scrollable = false,
  onChange,
  style,
}: ChipGroupProps) {
  const content = (
    <View style={[styles.container, style]}>
      {items.map((item) => {
        const selected = Array.isArray(value) ? value.includes(item.value) : value === item.value;

        return (
          <Chip
            key={item.value}
            label={item.label}
            iconName={item.iconName}
            selected={selected}
            disabled={item.disabled}
            onPress={() => handlePress(item.value, value, multiple, onChange)}
          />
        );
      })}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {content}
      </ScrollView>
    );
  }

  return content;
}

function handlePress(
  nextValue: string,
  currentValue: string | string[] | undefined,
  multiple: boolean,
  onChange: ChipGroupProps['onChange'],
) {
  if (!onChange) {
    return;
  }

  if (!multiple) {
    const singleValue = Array.isArray(currentValue) ? undefined : currentValue;

    onChange(singleValue === nextValue ? undefined : nextValue);
    return;
  }

  const selectedValues = Array.isArray(currentValue) ? currentValue : [];
  const valueSet = new Set(selectedValues);

  if (valueSet.has(nextValue)) {
    valueSet.delete(nextValue);
  } else {
    valueSet.add(nextValue);
  }

  onChange(Array.from(valueSet));
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
});

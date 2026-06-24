import { StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';

import { type GNBProps } from './gnb.types';
import { GNBAddButton } from './GNBAddButton';
import { GNBItem } from './GNBItem';

const DEFAULT_ITEMS = [
  { label: 'home', value: 'home', iconName: 'home' as const },
  { label: 'card list', value: 'list', iconName: 'list' as const },
  { label: 'condition', value: 'condition', iconName: 'condition' as const },
  { label: 'setting', value: 'setting', iconName: 'setting' as const },
];

export function GNB({
  items = DEFAULT_ITEMS,
  value = 'home',
  onChange,
  onAddPress,
  addAccessibilityLabel,
  style,
}: GNBProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.items}>
        {items.slice(0, 2).map((item) => (
          <GNBItem
            key={item.value}
            item={item}
            selected={item.value === value}
            onPress={() => onChange?.(item.value)}
          />
        ))}
      </View>
      <GNBAddButton accessibilityLabel={addAccessibilityLabel} onPress={onAddPress} />
      <View style={styles.items}>
        {items.slice(2, 4).map((item) => (
          <GNBItem
            key={item.value}
            item={item}
            selected={item.value === value}
            onPress={() => onChange?.(item.value)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 354,
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 32,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.gray.white,
    borderRadius: 65,
    backgroundColor: 'rgba(54,62,70,0.5)',
    shadowColor: colors.gray[300],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 34,
    elevation: 8,
  },
  items: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
});

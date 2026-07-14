import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/constants/theme';
import { t } from '@/lib/i18n';

import { type GNBItems, type GNBProps } from './gnb.types';
import { GNBAddButton } from './GNBAddButton';
import { GNBItem } from './GNBItem';

function createDefaultItems(): GNBItems {
  return [
    { label: t('navigation.home'), value: 'home', iconName: 'home' },
    { label: t('navigation.cardList'), value: 'list', iconName: 'list' },
    { label: t('navigation.condition'), value: 'condition', iconName: 'condition' },
    { label: t('navigation.setting'), value: 'setting', iconName: 'setting' },
  ];
}

export function GNB({
  items,
  value = 'home',
  onChange,
  onAddPress,
  addAccessibilityLabel,
  style,
}: GNBProps) {
  const gnbItems = items ?? createDefaultItems();
  const [homeItem, listItem, conditionItem, settingItem] = gnbItems;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.items}>
        {[homeItem, listItem].map((item) => (
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
        {[conditionItem, settingItem].map((item) => (
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
    width: '100%',
    maxWidth: 354,
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.gray.white,
    borderRadius: radius.nav,
    backgroundColor: colors.alpha.gray70050,
    shadowColor: colors.gray[300],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 34,
    elevation: 8,
  },
  items: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});

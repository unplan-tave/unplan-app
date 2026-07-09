import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, fontFamilyWeight, radius, spacing } from '@/constants/theme';

interface HomeBottomNavItem {
  value: string;
  label: string;
  iconName: IconName;
}

const HOME_NAV_ITEMS: [HomeBottomNavItem, HomeBottomNavItem, HomeBottomNavItem, HomeBottomNavItem] =
  [
    { value: 'home', label: 'home', iconName: 'home' },
    { value: 'cardList', label: 'card list', iconName: 'list' },
    { value: 'condition', label: 'condition', iconName: 'condition' },
    { value: 'setting', label: 'setting', iconName: 'setting' },
  ];

interface HomeBottomNavProps {
  value?: string;
  onAddPress?: () => void;
  onItemPress?: (value: string) => void;
}

export function HomeBottomNav({ value = 'home', onAddPress, onItemPress }: HomeBottomNavProps) {
  return (
    <View style={styles.container}>
      <View style={styles.group}>
        {HOME_NAV_ITEMS.slice(0, 2).map((item) => (
          <NavItem
            key={item.value}
            item={item}
            selected={item.value === value}
            onPress={onItemPress}
          />
        ))}
      </View>
      <Pressable
        accessibilityLabel="핀카드 추가"
        accessibilityRole="button"
        style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
        onPress={onAddPress}
      >
        <Icon name="plus" size={34} color={colors.gray[600]} />
      </Pressable>
      <View style={styles.group}>
        {HOME_NAV_ITEMS.slice(2).map((item) => (
          <NavItem
            key={item.value}
            item={item}
            selected={item.value === value}
            onPress={onItemPress}
          />
        ))}
      </View>
    </View>
  );
}

function NavItem({
  item,
  selected,
  onPress,
}: {
  item: HomeBottomNavItem;
  selected: boolean;
  onPress?: (value: string) => void;
}) {
  const color = colors.gray.white;

  return (
    <Pressable
      accessibilityLabel={item.label}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.item,
        !selected && styles.itemMuted,
        pressed && styles.pressed,
      ]}
      onPress={() => onPress?.(item.value)}
    >
      <Icon name={item.iconName} size={28} color={color} />
      <Typography
        variant="caption"
        color={color}
        align="center"
        numberOfLines={1}
        style={styles.itemLabel}
      >
        {item.label}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 353,
    minHeight: 66,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.gray.white,
    backgroundColor: colors.alpha.gray70050,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  item: {
    width: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontFamily: fontFamilyWeight.semiBold,
    fontWeight: '600',
  },
  itemMuted: {
    opacity: 0.5,
  },
  addButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.gray.white,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  pressed: {
    opacity: 0.72,
  },
});

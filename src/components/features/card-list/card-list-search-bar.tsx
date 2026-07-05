import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

export function CardListSearchBar({
  value,
  onPress,
  onClear,
  placeholder = '일정 카드 검색',
}: {
  value: string;
  onPress: () => void;
  onClear?: () => void;
  placeholder?: string;
}) {
  const hasValue = value.length > 0;

  return (
    <Pressable
      accessibilityLabel="일정 카드 검색"
      accessibilityRole="button"
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Icon name="search" size={24} color={colors.alpha.white70} />
      <Typography
        variant="bodyS"
        color={hasValue ? colors.gray.white : colors.alpha.white50}
        numberOfLines={1}
        style={styles.label}
      >
        {hasValue ? value : placeholder}
      </Typography>
      {hasValue && onClear != null ? (
        <View style={styles.clearArea}>
          <Pressable
            accessibilityLabel="검색어 지우기"
            accessibilityRole="button"
            hitSlop={spacing[2]}
            style={({ pressed }) => pressed && styles.pressed}
            onPress={onClear}
          >
            <Icon name="cancel" size={16} color={colors.alpha.white70} />
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
    paddingLeft: spacing[3],
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.gray.white,
    backgroundColor: colors.alpha.white20,
  },
  label: {
    flex: 1,
    minWidth: 0,
  },
  clearArea: {
    paddingRight: spacing[3],
  },
  pressed: {
    opacity: 0.72,
  },
});

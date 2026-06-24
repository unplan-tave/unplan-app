import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { type HeaderCardListProps } from './header.types';

export function HeaderCardList({
  title,
  count,
  actionLabel,
  onActionPress,
  style,
}: HeaderCardListProps) {
  return (
    <View style={[styles.container, style]}>
      <Typography variant="titleS" color={colors.gray[800]} numberOfLines={1}>
        {count == null ? title : `${title} ${count}`}
      </Typography>
      {actionLabel ? (
        <Pressable
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => pressed && styles.pressed}
          onPress={onActionPress}
        >
          <Typography variant="bodyS" color={colors.primary}>
            {actionLabel}
          </Typography>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pressed: {
    opacity: 0.72,
  },
});

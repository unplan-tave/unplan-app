import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius } from '@/constants/theme';

import { type ConditionType, type TagProps } from './tag.types';

const CONDITION_COLORS: Record<ConditionType, string> = {
  brain: colors.condition.brain,
  labor: colors.condition.labor,
  daily: colors.condition.daily,
  urgent: colors.condition.urgent,
  rest: colors.condition.rest,
  core: colors.condition.core,
};

export function Tag({ variant, label, condition, style, onPress, ...props }: TagProps) {
  const isCondition = variant === 'condition';
  const containerStyle = [
    styles.container,
    isCondition ? styles.condition : styles.personal,
    style,
  ];

  const content = (
    <>
      {isCondition && condition && (
        <View style={[styles.dot, { backgroundColor: CONDITION_COLORS[condition] }]} />
      )}
      <Typography
        variant="tag"
        color={isCondition ? colors.gray[800] : colors.gray[700]}
        align="center"
        style={styles.label}
      >
        {label}
      </Typography>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [containerStyle, pressed && styles.pressed]}
        onPress={onPress}
        {...props}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={containerStyle} {...props}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.xs,
    paddingVertical: 1,
  },
  condition: {
    gap: 5,
    paddingLeft: 7,
    paddingRight: 5,
    borderRadius: radius['2xs'],
    backgroundColor: colors.gray.white,
  },
  personal: {
    paddingHorizontal: 5,
    backgroundColor: colors.gray[200],
  },
  label: {
    opacity: 0.6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: radius.full,
  },
  pressed: {
    opacity: 0.72,
  },
});

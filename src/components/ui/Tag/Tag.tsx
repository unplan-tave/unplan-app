import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius } from '@/constants/theme';

import { type ConditionType, type TagProps } from './tag.types';

/** 피그마 condition → dot 색상 매핑 */
const CONDITION_COLORS: Record<ConditionType, string> = {
  brain: colors.condition.brain, // #F89F3A 두뇌 활동
  labor: colors.condition.labor, // #47B399 단순 노동
  daily: colors.condition.daily, // #D288DD 일상 작업
  urgent: colors.condition.urgent, // #E56666 긴급 처리
  rest: colors.condition.rest, // #6C5DA1 기력 회복
  core: colors.condition.core, // #4275DD 핵심 작업
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
    height: 19.997,
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
    backgroundColor: colors.alpha.white80,
    shadowColor: 'rgb(60,94,103)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 47.998,
    elevation: 3,
  },
  personal: {
    paddingHorizontal: 5,
    backgroundColor: colors.gray[200],
  },
  label: {
    opacity: 0.6,
  },
  dot: {
    width: 5.411,
    height: 5.411,
    borderRadius: radius.full,
  },
  pressed: {
    opacity: 0.72,
  },
});

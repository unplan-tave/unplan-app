import { StyleSheet, TouchableOpacity, type TouchableOpacityProps, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

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
    isCondition ? styles.conditionBg : styles.personalBg,
    style,
  ];

  const content = (
    <>
      {isCondition && condition && (
        <View style={[styles.dot, { backgroundColor: CONDITION_COLORS[condition] }]} />
      )}
      <Typography
        variant="caption"
        color={isCondition ? colors.text.primary : colors.text.secondary}
      >
        {label}
      </Typography>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={containerStyle}
        onPress={onPress}
        {...(props as TouchableOpacityProps)}
      >
        {content}
      </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.xs,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    gap: spacing[1],
  },
  conditionBg: {
    backgroundColor: colors.gray.white,
  },
  personalBg: {
    backgroundColor: colors.gray[200],
  },
  dot: {
    width: spacing[2],
    height: spacing[2],
    borderRadius: radius.full,
  },
});

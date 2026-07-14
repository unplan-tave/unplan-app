import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

import type { ConditionGraphMode } from '@/domains/condition/model';

interface ConditionGraphModeToggleProps {
  value: ConditionGraphMode;
  /** 흐름 보기는 Figma 기준 발표 이후 구현 예정이라 기본적으로 비활성화합니다. */
  flowDisabled?: boolean;
  onChange: (mode: ConditionGraphMode) => void;
}

const TOGGLE_HEIGHT = 28;

export function ConditionGraphModeToggle({
  value,
  flowDisabled = false,
  onChange,
}: ConditionGraphModeToggleProps) {
  return (
    <View style={styles.container}>
      <ToggleOption
        label="평균 보기"
        selected={value === 'average'}
        onPress={() => onChange('average')}
      />
      <View style={styles.divider} />
      <ToggleOption
        label="흐름 보기"
        selected={value === 'flow'}
        disabled={flowDisabled}
        onPress={() => onChange('flow')}
      />
    </View>
  );
}

function ToggleOption({
  label,
  selected,
  disabled = false,
  onPress,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => [pressed && !disabled && styles.pressed]}
      onPress={onPress}
    >
      <Typography variant="caption" color={selected ? colors.gray[800] : colors.gray[300]}>
        {label}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: TOGGLE_HEIGHT,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[2],
    borderRadius: radius['2xs'],
    backgroundColor: colors.alpha.white50,
  },
  divider: {
    width: 1,
    height: 10,
    backgroundColor: colors.gray[300],
  },
  pressed: {
    opacity: 0.72,
  },
});

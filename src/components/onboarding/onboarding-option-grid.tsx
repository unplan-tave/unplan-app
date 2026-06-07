import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { OnboardingOptionCard, ONBOARDING_OPTION_CARD_WIDTH } from './onboarding-option-card';

interface OnboardingOption {
  id: string;
  label: string;
  icon: string;
  isCustom?: boolean;
  disabled?: boolean;
}

interface OnboardingOptionGridProps<TOptionId extends string> {
  options: ReadonlyArray<OnboardingOption & { id: TOptionId }>;
  selectedIds: readonly TOptionId[];
  onToggle: (optionId: TOptionId) => void;
  style?: StyleProp<ViewStyle>;
}

const GRID_COLUMNS = 2;
const GRID_GAP = 16;
const GRID_WIDTH = ONBOARDING_OPTION_CARD_WIDTH * GRID_COLUMNS + GRID_GAP;

export function OnboardingOptionGrid<TOptionId extends string>({
  options,
  selectedIds,
  onToggle,
  style,
}: OnboardingOptionGridProps<TOptionId>) {
  return (
    <View style={[styles.grid, style]}>
      {options.map((option) => (
        <OnboardingOptionCard
          key={option.id}
          label={option.label}
          icon={option.icon}
          isCustom={option.isCustom}
          selected={selectedIds.includes(option.id)}
          disabled={option.disabled}
          onPress={() => onToggle(option.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: GRID_WIDTH,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
});

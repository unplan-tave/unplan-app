import { StyleSheet, View } from 'react-native';

import { OnboardingOptionCard } from './OnboardingOptionCard';

interface OnboardingOption {
  id: string;
  label: string;
  icon: string;
  disabled?: boolean;
}

interface OnboardingOptionGridProps<TOptionId extends string> {
  options: ReadonlyArray<OnboardingOption & { id: TOptionId }>;
  selectedIds: readonly TOptionId[];
  onToggle: (optionId: TOptionId) => void;
  style?: object;
}

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
    width: 273,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
});
